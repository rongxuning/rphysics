import type { SceneState, SceneStatus } from '../types'

/**
 * 开普勒轨道 · 物理引擎
 *
 * 几何单位：GM = 4π² M_solar（AU³/yr²）
 * period = a^{3/2} / √M
 * ω = 2π / a^{1.5} · √M
 * dθ/dt = ω · (1+e cosθ)² / (1−e²)^{3/2}
 * r = a(1−e²)/(1+e cosθ)
 * 状态：x = θ，v = 轨道速率，a = 切向加速度（小）
 */

export function createInitialState(): SceneState {
  const a = 1
  const e = 0.2
  const theta = 0
  const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta))
  const GM = 4 * Math.PI * Math.PI
  const speed = Math.sqrt(Math.max(0, GM * (2 / r - 1 / a)))
  return {
    t: 0,
    x: theta,
    v: speed,
    a: 0,
    derived: {
      r,
      speed,
      true_anomaly: theta,
      period: 1,
    },
  }
}

export function tick(
  state: SceneState,
  params: Record<string, number>,
  dt: number
): SceneState {
  const M_solar = Math.max(params.M_solar ?? 1, 1e-6)
  const a_AU = Math.max(params.a_AU ?? 1, 1e-6)
  const e = Math.min(Math.max(params.e ?? 0.2, 0), 0.95)

  const GM = 4 * Math.PI * Math.PI * M_solar
  const period = Math.pow(a_AU, 1.5) / Math.sqrt(M_solar)
  const omega = (2 * Math.PI) / Math.pow(a_AU, 1.5) * Math.sqrt(M_solar)

  // dt 按可视化缩放：把仿真秒当作年的一部分
  const dt_years = dt / 10

  let theta = state.x
  const denom_e = Math.pow(1 - e * e, 1.5)
  const dtheta =
    omega *
    Math.pow(1 + e * Math.cos(theta), 2) /
    Math.max(denom_e, 1e-9)

  theta = theta + dtheta * dt_years

  const r = (a_AU * (1 - e * e)) / (1 + e * Math.cos(theta))
  const speed = Math.sqrt(Math.max(0, GM * (2 / r - 1 / a_AU)))
  const speed_prev = state.v
  const a_acc = dt_years > 0 ? (speed - speed_prev) / dt_years : 0

  return {
    t: state.t + dt,
    x: theta,
    v: speed,
    a: a_acc,
    derived: {
      r,
      speed,
      true_anomaly: theta,
      period,
    },
  }
}

export function detectStatus(
  state: SceneState,
  params: Record<string, number>
): SceneStatus {
  const e = params.e ?? 0.2
  const r = state.derived.r ?? 0
  const speed = state.derived.speed ?? state.v
  const period = state.derived.period ?? 1
  const theta = state.derived.true_anomaly ?? state.x

  return {
    type: 'moving',
    label: '轨道运动',
    description: `e = ${e.toFixed(2)}，r = ${r.toFixed(3)} AU，v = ${speed.toFixed(2)} AU/yr，θ = ${theta.toFixed(2)} rad，T = ${period.toFixed(2)} yr`,
  }
}
