import type { ScenePlugin } from '../types'
import { parameters, formulas, charts } from './config'
import { createInitialState, tick, detectStatus } from './physics'
import Scene3D from './Scene3D'

export const photoelectricPlugin: ScenePlugin = {
  id: 'photoelectric',
  meta: {
    title: '光电效应',
    description: '光子能量与逸出功 · 阈值条件与电子发射可视化',
    color: '#a3e635',
  },
  parameters,
  formulas,
  charts,
  initialState: createInitialState,
  tick,
  detectStatus,
  Scene3D,
}
