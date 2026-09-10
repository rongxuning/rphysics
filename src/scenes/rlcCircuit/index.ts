import type { ScenePlugin } from '../types'
import { parameters, formulas, charts } from './config'
import { createInitialState, tick, detectStatus } from './physics'
import Scene3D from './Scene3D'

export const rlcCircuitPlugin: ScenePlugin = {
  id: 'rlc-circuit',
  meta: {
    title: 'RLC 振荡电路',
    description: '串联 RLC 阻尼振荡 · 电荷/电流/能量演化可视化',
    color: '#fb923c',
  },
  parameters,
  formulas,
  charts,
  initialState: createInitialState,
  tick,
  detectStatus,
  Scene3D,
}
