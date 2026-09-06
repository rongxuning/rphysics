import type { SceneState, SceneStatus } from '../types'

/**
 * 斜面拉力 + 摩擦 + 能量 · 物理引擎
 *
 * 状态机：
 *   1. 离地 (N ≤ 0)：F·sinθ ≥ mg，物体离开地面（实验停止）
 *   2. 静止 (v=0 且 F·cosθ ≤ μs·N)：无法拉动
 *   3. 滑动 (v>0 或 F·cosθ > μs·N)：a = (F·cosθ - μk·N) / m
 *   4. 匀速 (滑动中 F·cosθ = μk·N)：a = 0，v 恒定
 *
 * 能量系统（C 方案）：
 *   - 总能量 E0 作为参数
 *   - 拉力做功 W_F 累积消耗 E0
 *   - W_F ≥ E0 后 F 失效（F_actual = 0）
 *   - 耗尽前最后一帧按剩余能量缩放 F，避免「满拉力 + W_F 事后钳位」造成 Q > W_F
 *   - 做功/生热用梯形法则，与半隐式欧拉一致
 *   - 静摩擦时不消耗能量（Q = 0）
 *   - 动摩擦持续消耗能量（Q = ∫f·|v| dt）
 */

const EPS = 0.05 // 判定阈值：力差 < EPS 视为平衡

export function createInitialState(): SceneState {
  return {
    t: 0,
    x: 0,
    v: 0,
    a: 0,
    derived: {
      Fx: 0,
      Fy: 0,
      N: 0,
      fk: 0,
      fs_max: 0,
      f_signed: 0,
      F_net_x: 0,
      W_F: 0,
      Q: 0,
      E_k: 0,
      F_actual: 0,
      E_remaining: 0,
    },
  }
}

export function tick(
  state: SceneState,
  params: Record<string, number>,
  dt: number
): SceneState {
  const F_param = params.F ?? 0
  const theta = ((params.theta ?? 0) * Math.PI) / 180
  const m = params.m ?? 1
  const mu_s = params.mu_s ?? 0
  const mu_k = params.mu_k ?? 0
  const g = params.g ?? 9.8
  const E0 = params.E0 ?? 1000

  // 读取累积量（从历史延续）
  const W_F_prev = state.derived.W_F ?? 0
  const Q_prev = state.derived.Q ?? 0

  // 能量限制：用上一帧速度估算当帧做功上限，避免「整帧满拉力 + W_F 事后钳位」
  // 导致账面 W_F = E0，但动能/摩擦热仍按满 F 注入（最终 Q > W_F）
  const E_remaining = Math.max(0, E0 - W_F_prev)
  let F_actual = 0
  if (E_remaining > 0) {
    F_actual = F_param
    const speed = Math.abs(state.v)
    const cosAbs = Math.abs(Math.cos(theta))
    // 静止起步时功率≈0，允许满 F 加速；已在运动时按剩余能量缩放
    if (speed > 1e-6 && cosAbs > 1e-8) {
      const maxWorkThisFrame = F_param * speed * cosAbs * dt
      if (maxWorkThisFrame > E_remaining) {
        F_actual = F_param * (E_remaining / maxWorkThisFrame)
      }
    }
  }

  // 力分解（用 F_actual，不是用户输入的 F_param）
  const Fx = F_actual * Math.cos(theta)
  const Fy = F_actual * Math.sin(theta)
  const N_raw = m * g - Fy
  const fs_max = mu_s * Math.max(0, N_raw)
  const fk = mu_k * Math.max(0, N_raw)

  // 摩擦力方向（总是与运动方向/拉力水平分量相反）
  const isMoving = Math.abs(state.v) > 0.001
  let f_signed = 0 // 带方向的摩擦力
  if (isMoving) {
    f_signed = -fk * Math.sign(state.v)
  } else {
    // 静止：friction = -min(|Fx|, fs_max) * sign(Fx)
    const f_mag = Math.min(Math.abs(Fx), fs_max)
    f_signed = Fx >= 0 ? -f_mag : f_mag
  }
  const F_net_x = Fx + f_signed // = Fx - f_signed_magnitude * sign(opposing)

  const derived = {
    Fx,
    Fy,
    N: N_raw,
    fk,
    fs_max,
    f_signed,
    F_net_x,
    F_actual,
    E_remaining,
  }

  // 状态 1: 离地 - 实验停止（不做 tick 推进）
  if (N_raw <= 0) {
    // 即使离地，E_k/Q/W_F 仍保留上一帧的值（已累积的部分不会丢）
    return {
      t: state.t,
      x: state.x,
      v: 0,
      a: 0,
      derived: {
        ...derived,
        W_F: W_F_prev,
        Q: Q_prev,
        E_k: 0,
      },
    }
  }

  // 状态 2/3/4: 在地面上
  let a = 0
  const v_prev = state.v
  let v = v_prev
  const isStatic = Math.abs(v_prev) < 0.001

  if (isStatic) {
    if (Math.abs(Fx) <= fs_max + EPS) {
      // 静止：静摩擦力 = -Fx（平衡），a = 0
      a = 0
      v = 0
    } else {
      // 突破静摩擦，开始滑动
      a = F_net_x / m
      v = v + a * dt
    }
  } else {
    // 已在滑动
    a = F_net_x / m
    v = v + a * dt
    // 减速：减速过零钳位
    if (v * v_prev < 0 && Math.abs(Fx) <= fs_max + 0.1) {
      v = 0
    }
  }

  const x = state.x + v * dt

  // ===== 能量累积（C 方案） =====
  // 梯形法则取 (v_prev + v)/2，与半隐式欧拉动能更新一致
  // F_actual 已按剩余能量缩放；dW_F 仍安全钳到 E_remaining
  const v_avg = 0.5 * (v_prev + v)
  let dW_F = F_actual * v_avg * Math.cos(theta) * dt
  if (dW_F > E_remaining) dW_F = E_remaining
  if (dW_F < 0) dW_F = 0
  const W_F = W_F_prev + dW_F

  // 摩擦生热：dQ = f · |v|_avg · dt（静摩擦 v=0 → dQ=0）
  const dQ = fk * 0.5 * (Math.abs(v_prev) + Math.abs(v)) * dt
  let Q = Q_prev + dQ

  // 动能（瞬时）
  const E_k = 0.5 * m * v * v

  // 守恒护栏：钳掉残余离散误差，避免 UI 出现 Q > W_F
  const Q_max = Math.max(0, W_F - E_k)
  if (Q > Q_max + 1e-9) Q = Q_max

  return {
    t: state.t + dt,
    x,
    v,
    a,
    derived: {
      ...derived,
      W_F,
      Q,
      E_k,
    },
  }
}

export function detectStatus(
  state: SceneState,
  params: Record<string, number>
): SceneStatus {
  const F_param = params.F ?? 0
  const theta = ((params.theta ?? 0) * Math.PI) / 180
  const m = params.m ?? 1
  const mu_s = params.mu_s ?? 0
  const mu_k = params.mu_k ?? 0
  const g = params.g ?? 9.8
  const E0 = params.E0 ?? 1000

  // 用 F_actual 判定（能量耗尽时 F=0）
  const W_F = state.derived.W_F ?? 0
  const E_remaining = E0 - W_F
  const F_actual = E_remaining > 0 ? F_param : 0

  const Fx = F_actual * Math.cos(theta)
  const Fy = F_actual * Math.sin(theta)
  const N = m * g - Fy
  const fs_max = mu_s * N
  const fk = mu_k * N

  // 能量耗尽特殊状态
  if (E_remaining <= 0 && state.v > 0.01) {
    return {
      type: 'moving',
      label: '能量耗尽 · 仅摩擦',
      description: `E₀ = ${E0} J 已耗尽（${W_F.toFixed(1)} J），F 失效，物块仅受摩擦减速`,
    }
  }
  if (E_remaining <= 0 && Math.abs(state.v) < 0.001) {
    return {
      type: 'static',
      label: '能量耗尽 · 静止',
      description: `E₀ 已耗尽，物块无动力停止`,
    }
  }

  if (N <= 0) {
    return {
      type: 'liftoff',
      label: '物体离地',
      description: `F·sinθ (${Fy.toFixed(1)} N) ≥ mg (${(m * g).toFixed(1)} N)，物体被拉离地面`,
    }
  }

  if (Math.abs(state.v) < 0.001 && Fx <= fs_max + EPS) {
    return {
      type: 'blocked',
      label: '无法拉动',
      description: `F·cosθ (${Fx.toFixed(1)} N) ≤ μs·N (${fs_max.toFixed(1)} N)，静摩擦力过大`,
    }
  }

  const a = (Fx - fk) / m
  if (Math.abs(a) < 0.05) {
    return {
      type: 'uniform',
      label: '匀速直线运动',
      description: `F·cosθ (${Fx.toFixed(1)} N) ≈ μk·N (${fk.toFixed(1)} N)，合力为 0`,
    }
  }

  return {
    type: 'moving',
    label: a > 0 ? '加速运动' : '减速运动',
    description: `a = ${a.toFixed(2)} m/s²，${a > 0 ? '向 +x 方向加速' : '正在减速'}`,
  }
}
