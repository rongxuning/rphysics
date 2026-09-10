import type { SceneState, SceneStatus } from '../types'

/**
 * RLC 振荡电路 · 物理引擎
 *
 * 状态映射：x = Q（电容电荷），v = I（电流），a = dI/dt
 * 方程：dQ/dt = I；dI/dt = −(R/L)I − Q/(LC)
 * 初值：Q = V₀·C，I = 0
 * 积分：半隐式 Euler，子步长 clamp 到 min(dt, 0.002)
 */

const DEFAULT_V0 = 10
const DEFAULT_C = 0.1

export function createInitialState(): SceneState {
  const Q0 = DEFAULT_V0 * DEFAULT_C
  return {
    t: 0,
    x: Q0,
    v: 0,
    a: 0,
    derived: {
      Q: Q0,
      I: 0,
      energy: 0.5 * (Q0 * Q0) / DEFAULT_C,
      omega0: 1 / Math.sqrt(1 * DEFAULT_C),
    },
  }
}

export function tick(
  state: SceneState,
  params: Record<string, number>,
  dt: number
): SceneState {
  const R = params.R ?? 5
  const L = Math.max(params.L ?? 1, 1e-6)
  const C = Math.max(params.C ?? 0.1, 1e-6)
  const V0 = params.V0 ?? 10

  // 重置初态：t=0 且仍为默认初值时，按当前参数重设 Q₀ = V₀ C
  let Q = state.x
  let I = state.v
  if (state.t === 0 && Math.abs(I) < 1e-12) {
    const expectedDefault = DEFAULT_V0 * DEFAULT_C
    if (Math.abs(Q - expectedDefault) < 1e-9) {
      Q = V0 * C
      I = 0
    }
  }

  let a = 0
  let remaining = Math.max(dt, 0)
  while (remaining > 1e-12) {
    const h = Math.min(remaining, 0.002)
    a = -(R / L) * I - Q / (L * C)
    I = I + a * h
    Q = Q + I * h
    remaining -= h
  }

  const energy = 0.5 * (Q * Q) / C + 0.5 * L * I * I
  const omega0 = 1 / Math.sqrt(L * C)

  return {
    t: state.t + dt,
    x: Q,
    v: I,
    a,
    derived: {
      Q,
      I,
      energy,
      omega0,
    },
  }
}

export function detectStatus(
  state: SceneState,
  params: Record<string, number>
): SceneStatus {
  const R = params.R ?? 5
  const L = Math.max(params.L ?? 1, 1e-6)
  const C = Math.max(params.C ?? 0.1, 1e-6)
  const Q = state.derived.Q ?? state.x
  const I = state.derived.I ?? state.v
  const zeta = (R / 2) * Math.sqrt(C / L)
  const omega0 = state.derived.omega0 ?? 1 / Math.sqrt(L * C)

  if (Math.abs(I) > 1e-4 || Math.abs(Q) > 1e-4) {
    const regime =
      zeta < 0.98 ? '欠阻尼振荡' : zeta <= 1.02 ? '临界阻尼' : '过阻尼衰减'
    return {
      type: 'moving',
      label: regime,
      description: `Q = ${Q.toFixed(4)} C，I = ${I.toFixed(4)} A，ζ = ${zeta.toFixed(3)}，ω₀ = ${omega0.toFixed(2)} rad/s`,
    }
  }

  return {
    type: 'static',
    label: '静止',
    description: '电荷与电流均接近零，电路已耗散至静止',
  }
}
