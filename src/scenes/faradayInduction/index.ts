import type { ScenePlugin } from '../types'
import { parameters, formulas, charts } from './config'
import { createInitialState, tick, detectStatus } from './physics'
import Scene3D from './Scene3D'

export const faradayInductionPlugin: ScenePlugin = {
  id: 'faraday-induction',
  meta: {
    title: '法拉第电磁感应',
    description: '旋转磁场中的线圈感应电动势 · 电磁感应可视化',
    color: '#fbbf24',
  },
  parameters,
  formulas,
  charts,
  initialState: createInitialState,
  tick,
  detectStatus,
  Scene3D,
}
