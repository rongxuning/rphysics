import type { ScenePlugin } from '../types'
import { parameters, formulas, charts } from './config'
import { createInitialState, tick, detectStatus } from './physics'
import Scene3D from './Scene3D'

export const idealGasPlugin: ScenePlugin = {
  id: 'ideal-gas',
  meta: {
    title: '理想气体定律',
    description: 'PV = nRT · 分子热运动与宏观状态方程可视化',
    color: '#fb7185',
  },
  parameters,
  formulas,
  charts,
  initialState: createInitialState,
  tick,
  detectStatus,
  Scene3D,
}
