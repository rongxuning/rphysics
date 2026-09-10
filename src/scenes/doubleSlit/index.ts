import type { ScenePlugin } from '../types'
import { parameters, formulas, charts } from './config'
import { createInitialState, tick, detectStatus } from './physics'
import Scene3D from './Scene3D'

export const doubleSlitPlugin: ScenePlugin = {
  id: 'double-slit',
  meta: {
    title: '杨氏双缝干涉',
    description: '双缝干涉条纹间距与强度分布 · 波动光学可视化',
    color: '#a78bfa',
  },
  parameters,
  formulas,
  charts,
  initialState: createInitialState,
  tick,
  detectStatus,
  Scene3D,
}
