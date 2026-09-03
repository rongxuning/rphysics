import type { SceneState, SceneStatus } from '../types'

/**
 * 斜面拉力 + 摩擦 · 物理引擎
 *
 * 状态机：
 *   1. 离地 (N ≤ 0)：F·sinθ ≥ mg，物体离开地面
 *   2. 静止 (v=0 且 F·cosθ ≤ μs·N)：无法拉动
 *   3. 滑动 (v>0 或 F·cosθ > μs·N)：a = (F·cosθ - μk·N) / m
 *   4. 匀速 (滑动中 F·cosθ = μk·N)：a = 0，v 恒定
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
    },
  }
}

export function tick(
  state: SceneState,
  params: Record<string, number>,
  dt: number
): SceneState {
  const F = params.F ?? 0
  const theta = ((params.theta ?? 0) * Math.PI) / 180
  const m = params.m ?? 1
  const mu_s = params.mu_s ?? 0
  const mu_k = params.mu_k ?? 0
  const g = params.g ?? 9.8

  const Fx = F * Math.cos(theta)
  const Fy = F * Math.sin(theta)
  const N_raw = m * g - Fy
  const fs_max = mu_s * Math.max(0, N_raw)
  const fk = mu_k * Math.max(0, N_raw)

  const derived = { Fx, Fy, N: N_raw, fk, fs_max }

  // 状态 1: 离地
  if (N_raw <= 0) {
    const ax = Fx / m
    const ay = (Fy - m * g) / m // 注意：这里 a_y 是向上为正
    const v = state.v + ax * dt
    const x = state.x + v * dt
    return {
      t: state.t + dt,
      x,
      v,
      a: ax,
      derived,
    }
  }

  // 状态 2/3/4: 在地面上
  let a = 0
  let v = state.v
  const isStatic = Math.abs(state.v) < 0.001

  if (isStatic) {
    if (Fx <= fs_max + EPS) {
      // 静止：静摩擦力 = Fx，a = 0
      a = 0
      v = 0
    } else {
      // 突破静摩擦，开始滑动
      a = (Fx - fk) / m
      v = v + a * dt // 从 0 开始
    }
  } else {
    // 已在滑动
    a = (Fx - fk) / m
    v = v + a * dt
    // 不允许 v 反向（除非 a < 0 持续，可能减速到 0）
    if (v < 0) v = 0
  }

  const x = state.x + v * dt

  return {
    t: state.t + dt,
    x,
    v,
    a,
    derived,
  }
}

export function detectStatus(
  state: SceneState,
  params: Record<string, number>
): SceneStatus {
  const F = params.F ?? 0
  const theta = ((params.theta ?? 0) * Math.PI) / 180
  const m = params.m ?? 1
  const mu_s = params.mu_s ?? 0
  const mu_k = params.mu_k ?? 0
  const g = params.g ?? 9.8

  const Fx = F * Math.cos(theta)
  const Fy = F * Math.sin(theta)
  const N = m * g - Fy
  const fs_max = mu_s * N
  const fk = mu_k * N

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

  // 滑动状态
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
