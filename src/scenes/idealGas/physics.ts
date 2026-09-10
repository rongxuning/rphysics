import type { SceneState, SceneStatus } from '../types'

/**
 * 理想气体定律 · 物理引擎
 *
 * P = nRT / V
 * x = P；v ~ √T（热运动特征速度）；a = 0
 * 每 tick 推进 t，即使参数不变也让图表有时间轴
 */

const R = 8.314

export function createInitialState(): SceneState {
  return {
    t: 0,
    x: 0,
    v: 0,
    a: 0,
    derived: {
      P: 0,
      T: 300,
      V: 0.05,
      n: 1,
    },
  }
}

export function tick(
  state: SceneState,
  params: Record<string, number>,
  dt: number
): SceneState {
  const n = params.n ?? 1
  const T = params.T ?? 300
  const V = Math.max(params.V ?? 0.05, 1e-6)

  const t = state.t + dt
  const P = (n * R * T) / V
  const v_thermal = Math.sqrt(T)

  return {
    t,
    x: P,
    v: v_thermal,
    a: 0,
    derived: {
      P,
      T,
      V,
      n,
    },
  }
}

export function detectStatus(
  _state: SceneState,
  _params: Record<string, number>
): SceneStatus {
  return {
    type: 'moving',
    label: '热运动',
    description: '平衡态下分子持续热运动，宏观量满足 PV = nRT',
  }
}
