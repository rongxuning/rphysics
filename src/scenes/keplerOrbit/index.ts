import type { ScenePlugin } from '../types'
import { parameters, formulas, charts } from './config'
import { createInitialState, tick, detectStatus } from './physics'
import Scene3D from './Scene3D'

export const keplerOrbitPlugin: ScenePlugin = {
  id: 'kepler-orbit',
  meta: {
    title: '开普勒轨道',
    description: '日心椭圆轨道 · 开普勒第三定律与活力公式可视化',
    color: '#818cf8',
  },
  parameters,
  formulas,
  charts,
  initialState: createInitialState,
  tick,
  detectStatus,
  Scene3D,
}
