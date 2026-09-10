import type { ScenePlugin } from '../types'
import { parameters, formulas, charts } from './config'
import { createInitialState, tick, detectStatus } from './physics'
import Scene3D from './Scene3D'

export const bernoulliPlugin: ScenePlugin = {
  id: 'bernoulli',
  meta: {
    title: '伯努利方程',
    description: '变截面管中的连续性与伯努利压差 · 流动可视化',
    color: '#2dd4bf',
  },
  parameters,
  formulas,
  charts,
  initialState: createInitialState,
  tick,
  detectStatus,
  Scene3D,
}
