import type { SceneState, SceneStatus } from '../types'

/**
 * 多普勒效应 · 物理引擎
 *
 * 符号约定：vs > 0 表示声源朝向观察者运动（分母 v − vs）
 * f_obs = f0 · (v_sound + vo) / max(1, v_sound − vs)
 * x：声源位置（按 vs·0.01 缩放积分）；v = f_obs；a = 0
 */

export function createInitialState(): SceneState {
  return {
    t: 0,
    x: 0,
    v: 440,
    a: 0,
    derived: {
      f_obs: 440,
      wavelength: 340 / 440,
      approach_factor: 1,
      f0: 440,
    },
  }
}

export function tick(
  state: SceneState,
  params: Record<string, number>,
  dt: number
): SceneState {
  const f0 = params.f0 ?? 440
  const vs = params.vs ?? 20
  const vo = params.vo ?? 0
  const v_sound = params.v_sound ?? 340

  const denom = Math.max(1, v_sound - vs)
  const f_obs = f0 * (v_sound + vo) / denom
  const wavelength = v_sound / Math.max(f0, 1e-6)
  const approach_factor = f_obs / Math.max(f0, 1e-6)

  const t = state.t + dt
  const x = state.x + vs * 0.01 * dt

  return {
    t,
    x,
    v: f_obs,
    a: 0,
    derived: {
      f_obs,
      wavelength,
      approach_factor,
      f0,
    },
  }
}

export function detectStatus(
  state: SceneState,
  params: Record<string, number>
): SceneStatus {
  const vs = params.vs ?? 20
  const vo = params.vo ?? 0
  const f_obs = state.derived.f_obs ?? state.v
  const factor = state.derived.approach_factor ?? 1

  let relation = '相对静止'
  if (vs > 0.5 || vo > 0.5) relation = '相互接近 · 频率升高'
  else if (vs < -0.5 || vo < -0.5) relation = '相互远离 · 频率降低'

  return {
    type: 'moving',
    label: '波传播中',
    description: `${relation}；f′ = ${f_obs.toFixed(1)} Hz，f′/f₀ = ${factor.toFixed(3)}`,
  }
}
