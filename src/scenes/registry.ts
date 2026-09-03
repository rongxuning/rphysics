import type { ScenePlugin } from './types'
import { pullFrictionPlugin } from './pullFriction'

/**
 * 场景注册表
 * 未来新场景只需在这里加一行
 */
export const sceneRegistry: Record<string, ScenePlugin> = {
  [pullFrictionPlugin.id]: pullFrictionPlugin,
  // 'free-fall': freeFallPlugin,
  // 'spring-osc': springOscPlugin,
  // 'incline': inclinePlugin,
}

export function getScene(id: string): ScenePlugin | undefined {
  return sceneRegistry[id]
}

export function listScenes(): ScenePlugin[] {
  return Object.values(sceneRegistry)
}
