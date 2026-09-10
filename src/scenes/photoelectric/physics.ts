import type { SceneState, SceneStatus } from '../types'

/**
 * 光电效应 · 物理引擎
 *
 * h = 4.135667696×10⁻¹⁵ eV·s
 * f = freq_e14 · 10¹⁴ Hz
 * E = h·f
 * K_max = E − W
 * emitting = K_max > 0
 * rate = emitting ? I·max(K_max, 0.1) : 0
 * x = K_max；v = rate；a = 0
 */

const H_EV_S = 4.135667696e-15

export function createInitialState(): SceneState {
  return {
    t: 0,
    x: 0,
    v: 0,
    a: 0,
    derived: {
      K_max: 0,
      rate: 0,
      photon_eV: 0,
      threshold_ratio: 0,
    },
  }
}

export function tick(
  state: SceneState,
  params: Record<string, number>,
  dt: number
): SceneState {
  const freq_e14 = params.freq_e14 ?? 7
  const intensity = params.intensity ?? 1
  const work_eV = Math.max(params.work_eV ?? 2.5, 1e-9)

  const f = freq_e14 * 1e14
  const E = H_EV_S * f
  const K_max = E - work_eV
  const emitting = K_max > 0
  const rate = emitting ? intensity * Math.max(K_max, 0.1) : 0

  const t = state.t + dt

  return {
    t,
    x: K_max,
    v: rate,
    a: 0,
    derived: {
      K_max,
      rate,
      photon_eV: E,
      threshold_ratio: E / work_eV,
    },
  }
}

export function detectStatus(
  state: SceneState,
  params: Record<string, number>
): SceneStatus {
  const K_max = state.derived.K_max ?? state.x
  const emitting = K_max > 0
  const work_eV = params.work_eV ?? 2.5
  const E = state.derived.photon_eV ?? 0

  if (emitting) {
    return {
      type: 'moving',
      label: '光电发射',
      description: `K_max = ${K_max.toFixed(3)} eV > 0，电子从金属表面逸出`,
    }
  }
  return {
    type: 'blocked',
    label: '低于阈值',
    description: `E = ${E.toFixed(3)} eV ≤ W = ${work_eV.toFixed(2)} eV，无法发射电子`,
  }
}
