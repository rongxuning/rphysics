import type { ScenePlugin } from '../types'
import { parameters, formulas, charts } from './config'
import { createInitialState, tick, detectStatus } from './physics'
import Scene3D from './Scene3D'

export const standingWavePlugin: ScenePlugin = {
  id: 'standing-wave',
  meta: {
    title: '弦上驻波',
    description: '张紧弦上的驻波模式 · 波速、频率与波腹振动可视化',
    color: '#38bdf8',
  },
  parameters,
  formulas,
  charts,
  initialState: createInitialState,
  tick,
  detectStatus,
  Scene3D,
}
