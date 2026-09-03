/**
 * Scene Plugin 接口
 * 每个物理场景是一个独立模块，注册到 registry
 * Shell 组件（滑块/数据/图表/公式）从这些字段动态生成
 */

import type { ComponentType } from 'react'

export type ParameterDef = {
  key: string
  label: string
  symbol: string      // 公式符号，如 "F", "θ"
  unit: string
  min: number
  max: number
  step: number
  default: number
}

export type FormulaDef = {
  id: number
  name: string
  latex: string
  /** 关联的 3D 力 ID（点击公式可高亮） */
  links?: { type: 'force' | 'state'; ref: string }[]
}

export type ChartDef = {
  id: string
  title: string
  symbol: string      // 公式符号，如 "v(t)"
  yUnit: string
  yMin: number
  yMax: number
  stateKey: string    // 从 SceneState 读取的 key
  color: string       // hex
}

export type SceneStatus =
  | { type: 'static'; label: string; description: string }
  | { type: 'blocked'; label: string; description: string }
  | { type: 'moving'; label: string; description: string }
  | { type: 'uniform'; label: string; description: string }
  | { type: 'liftoff'; label: string; description: string }

export type SceneState = {
  t: number
  x: number
  v: number
  a: number
  /** 场景特定的派生量 */
  derived: Record<string, number>
}

export type ScenePlugin = {
  id: string
  meta: {
    title: string
    description: string
    color: string
  }
  parameters: ParameterDef[]
  formulas: FormulaDef[]
  charts: ChartDef[]
  initialState: () => SceneState
  /** 物理 tick: dt 秒，返回新 state */
  tick: (state: SceneState, params: Record<string, number>, dt: number) => SceneState
  /** 状态判定 */
  detectStatus: (state: SceneState, params: Record<string, number>) => SceneStatus
  /** R3F 场景组件，接收 state 和 params */
  Scene3D: ComponentType<{ state: SceneState; params: Record<string, number> }>
}
