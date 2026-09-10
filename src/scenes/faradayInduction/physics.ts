import type { SceneState, SceneStatus } from '../types'

/**
 * 法拉第电磁感应 · 物理引擎
 *
 * Φ = N·B·A·cos(ωt)
 * ε = N·B·A·ω·sin(ωt)
 * x = Φ，v = ε，a = dε/dt ≈ −N·B·A·ω²·cos(ωt)
 */

export function createInitialState(): SceneState {
  return {
    t: 0,
    x: 0,
    v: 0,
    a: 0,
    derived: {
      epsilon: 0,
      flux: 0,
      B_eff: 0.5,
    },
  }
}

export function tick(
  state: SceneState,
  params: Record<string, number>,
  dt: number
): SceneState {
  const B = params.B ?? 0.5
  const N = params.N_turns ?? 10
  const area = params.area ?? 0.05
  const omega = params.omega ?? 2

  const t = state.t + dt
  const NBA = N * B * area

  const flux = NBA * Math.cos(omega * t)
  const epsilon = NBA * omega * Math.sin(omega * t)
  const a = -NBA * omega * omega * Math.cos(omega * t)

  return {
    t,
    x: flux,
    v: epsilon,
    a,
    derived: {
      epsilon,
      flux,
      B_eff: B,
    },
  }
}

export function detectStatus(
  state: SceneState,
  _params: Record<string, number>
): SceneStatus {
  const epsilon = state.derived.epsilon ?? state.v
  if (Math.abs(epsilon) > 0.01) {
    return {
      type: 'moving',
      label: '感应中',
      description: `ε = ${epsilon.toFixed(3)} V，磁通量正在变化`,
    }
  }
  return {
    type: 'static',
    label: '瞬时静止',
    description: `ε ≈ 0，磁通量极值处感应电动势为零`,
  }
}
