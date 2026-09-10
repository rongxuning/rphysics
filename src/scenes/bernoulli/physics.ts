import type { SceneState, SceneStatus } from '../types'

/**
 * 伯努利方程 · 物理引擎
 *
 * v₂ = v₁·A₁/A₂
 * Q = v₁·A₁
 * ΔP = ρ·(½(v₁²−v₂²) + g(h₁−h₂))
 * x = (x + v₁·dt) % 1  （流动进度）
 * v = v₂；a = 0
 */

const G = 9.8

export function createInitialState(): SceneState {
  return {
    t: 0,
    x: 0,
    v: 0,
    a: 0,
    derived: {
      v2: 0,
      deltaP: 0,
      Q_flow: 0,
      v1: 0,
    },
  }
}

export function tick(
  state: SceneState,
  params: Record<string, number>,
  dt: number
): SceneState {
  const rho = params.rho ?? 1000
  const A1 = Math.max(params.A1 ?? 0.08, 1e-6)
  const A2 = Math.max(params.A2 ?? 0.02, 1e-6)
  const v1 = params.v1 ?? 1
  const h1 = params.h1 ?? 1
  const h2 = params.h2 ?? 0.5

  const v2 = (v1 * A1) / A2
  const Q = v1 * A1
  const deltaP = rho * (0.5 * (v1 * v1 - v2 * v2) + G * (h1 - h2))

  const t = state.t + dt
  const x = (state.x + v1 * dt) % 1

  return {
    t,
    x,
    v: v2,
    a: 0,
    derived: {
      v2,
      deltaP,
      Q_flow: Q,
      v1,
    },
  }
}

export function detectStatus(
  _state: SceneState,
  params: Record<string, number>
): SceneStatus {
  const v1 = params.v1 ?? 1
  if (v1 > 0.05) {
    return {
      type: 'moving',
      label: '定常流动',
      description: `入口流速 v₁ = ${v1.toFixed(2)} m/s，管内连续流动`,
    }
  }
  return {
    type: 'static',
    label: '静止流体',
    description: '入口流速过小，可视为静止',
  }
}
