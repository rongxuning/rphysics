import type { ScenePlugin } from '../types'
import { parameters, formulas, charts } from './config'
import { createInitialState, tick, detectStatus } from './physics'
import Scene3D from './Scene3D'

export const pullFrictionPlugin: ScenePlugin = {
  id: 'pull-friction',
  meta: {
    title: '斜面拉力 + 摩擦',
    description: '可变角度拉力 + 静/动摩擦 · 牛顿第二定律可视化',
    color: '#60a5fa',
  },
  parameters,
  formulas,
  charts,
  initialState: createInitialState,
  tick,
  detectStatus,
  Scene3D,
}
