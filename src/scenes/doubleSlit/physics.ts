import type { SceneState, SceneStatus } from '../types'

/**
 * 杨氏双缝干涉 · 物理引擎
 *
 * β = λL/d
 * 在屏上采样点 x_screen = 0.01·sin(π t) 处计算强度
 * I = A · cos²(π d x / (λ L))
 * v ≈ dI/dt（有限差分）；a = 0
 */

export function createInitialState(): SceneState {
  return {
    t: 0,
    x: 0,
    v: 0,
    a: 0,
    derived: {
      I_center: 1,
      fringe: 0,
      wavelength_nm: 550,
      phase: 0,
      x_screen: 0,
    },
  }
}

export function tick(
  state: SceneState,
  params: Record<string, number>,
  dt: number
): SceneState {
  const lambda_nm = params.lambda_nm ?? 550
  const d_mm = params.d_mm ?? 0.2
  const L = params.L_m ?? 2
  const amp = params.amp ?? 1

  const lambda = lambda_nm * 1e-9
  const d = d_mm * 1e-3

  const t = state.t + dt
  const fringe_m = (lambda * L) / d
  const fringe_mm = fringe_m * 1000

  const x_screen = 0.01 * Math.sin(2 * Math.PI * 0.5 * t)
  const arg = (Math.PI * d * x_screen) / (lambda * L)
  const I = amp * Math.pow(Math.cos(arg), 2)

  const I_prev = state.derived.I_center ?? I
  const v = dt > 0 ? (I - I_prev) / dt : 0

  return {
    t,
    x: x_screen,
    v,
    a: 0,
    derived: {
      I_center: I,
      fringe: fringe_mm,
      wavelength_nm: lambda_nm,
      phase: t,
      x_screen,
    },
  }
}

export function detectStatus(
  state: SceneState,
  _params: Record<string, number>
): SceneStatus {
  const I = state.derived.I_center ?? 0
  if (I > 0.5) {
    return {
      type: 'moving',
      label: '亮纹区',
      description: `采样点强度 I = ${I.toFixed(3)}，干涉相长`,
    }
  }
  return {
    type: 'static',
    label: '暗纹区',
    description: `采样点强度 I = ${I.toFixed(3)}，干涉相消`,
  }
}
