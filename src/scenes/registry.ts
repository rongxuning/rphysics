import type { ScenePlugin } from './types'
import { pullFrictionPlugin } from './pullFriction'
import { doubleSlitPlugin } from './doubleSlit'
import { faradayInductionPlugin } from './faradayInduction'
import { idealGasPlugin } from './idealGas'
import { standingWavePlugin } from './standingWave'
import { bernoulliPlugin } from './bernoulli'
import { photoelectricPlugin } from './photoelectric'
import { rlcCircuitPlugin } from './rlcCircuit'
import { dopplerPlugin } from './doppler'
import { keplerOrbitPlugin } from './keplerOrbit'

/**
 * 场景注册表
 * 新场景在此加一行即可
 */
export const sceneRegistry: Record<string, ScenePlugin> = {
  [pullFrictionPlugin.id]: pullFrictionPlugin,
  [doubleSlitPlugin.id]: doubleSlitPlugin,
  [faradayInductionPlugin.id]: faradayInductionPlugin,
  [idealGasPlugin.id]: idealGasPlugin,
  [standingWavePlugin.id]: standingWavePlugin,
  [bernoulliPlugin.id]: bernoulliPlugin,
  [photoelectricPlugin.id]: photoelectricPlugin,
  [rlcCircuitPlugin.id]: rlcCircuitPlugin,
  [dopplerPlugin.id]: dopplerPlugin,
  [keplerOrbitPlugin.id]: keplerOrbitPlugin,
}

export function getScene(id: string): ScenePlugin | undefined {
  return sceneRegistry[id]
}

export function listScenes(): ScenePlugin[] {
  return Object.values(sceneRegistry)
}
