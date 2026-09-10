import type { ScenePlugin } from '../types'
import { parameters, formulas, charts } from './config'
import { createInitialState, tick, detectStatus } from './physics'
import Scene3D from './Scene3D'

export const dopplerPlugin: ScenePlugin = {
  id: 'doppler',
  meta: {
    title: '多普勒效应',
    description: '声源与观察者相对运动引起的频率偏移 · 波前可视化',
    color: '#f472b6',
  },
  parameters,
  formulas,
  charts,
  initialState: createInitialState,
  tick,
  detectStatus,
  Scene3D,
}
