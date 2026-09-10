import type { SceneState, SceneStatus } from '../types'

/**
 * 弦上驻波 · 物理引擎
 *
 * c = √(T/μ)
 * f = (n/(2L))·c
 * λ = 2L/n
 * ω = 2πf
 * y_a = A·sin(ωt)  （波腹振幅）
 * x = y_a；v = A·ω·cos(ωt)；a = −A·ω²·sin(ωt)
 */

export function createInitialState(): SceneState {
  return {
    t: 0,
    x: 0,
    v: 0,
    a: 0,
    derived: {
      y_antinode: 0,
      frequency: 0,
      wavelength: 0,
      wave_speed: 0,
    },
  }
}

export function tick(
  state: SceneState,
  params: Record<string, number>,
  dt: number
): SceneState {
  const L = Math.max(params.L ?? 1, 1e-6)
  const mu = Math.max(params.mu ?? 0.01, 1e-9)
  const tension = Math.max(params.tension ?? 40, 1e-9)
  const n_mode = Math.max(1, Math.round(params.n_mode ?? 2))
  const amp = params.amp ?? 0.15

  const c = Math.sqrt(tension / mu)
  const f = (n_mode / (2 * L)) * c
  const wavelength = (2 * L) / n_mode
  const omega = 2 * Math.PI * f

  const t = state.t + dt
  const y_antinode = amp * Math.sin(omega * t)
  const v = amp * omega * Math.cos(omega * t)
  const a = -amp * omega * omega * Math.sin(omega * t)

  return {
    t,
    x: y_antinode,
    v,
    a,
    derived: {
      y_antinode,
      frequency: f,
      wavelength,
      wave_speed: c,
    },
  }
}

export function detectStatus(
  _state: SceneState,
  _params: Record<string, number>
): SceneStatus {
  return {
    type: 'moving',
    label: '驻波振荡',
    description: '弦上形成稳定驻波，波腹按简谐规律振动',
  }
}
