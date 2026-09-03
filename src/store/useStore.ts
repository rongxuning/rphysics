import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

/**
 * 顶层应用 store。
 * - sceneId: 当前激活的场景（决定 3D 场景、控制面板、图表、公式）
 * - params: 当前场景的参数（F, θ, m, μs, μk, g 等），key 取决于 sceneId
 * - playing / scrubbing: 仿真控制
 * - currentTime / simTime: 时间游标的双时间源
 * - audioEnabled: ambient 音效开关
 */
export type AppState = {
  // Scene
  sceneId: string | null

  // Params (per scene)
  params: Record<string, number>

  // Simulation control
  playing: boolean
  scrubbing: boolean
  speed: number // 0.5, 1, 2

  // Time
  simTime: number // simulation wall time (advances when playing)
  currentTime: number // displayed time (follows simTime when not scrubbing)

  // Audio
  audioEnabled: boolean
  audioUnlocked: boolean

  // Actions
  setScene: (sceneId: string) => void
  setParam: (key: string, value: number) => void
  setParams: (params: Record<string, number>) => void
  resetParams: () => void

  play: () => void
  pause: () => void
  togglePlay: () => void
  reset: () => void
  setSpeed: (speed: number) => void

  startScrub: () => void
  endScrub: () => void
  setCurrentTime: (t: number) => void

  toggleAudio: () => void
  unlockAudio: () => void
}

const initialState = {
  sceneId: null as string | null,
  params: {} as Record<string, number>,
  playing: false,
  scrubbing: false,
  speed: 1,
  simTime: 0,
  currentTime: 0,
  audioEnabled: true,
  audioUnlocked: false,
}

export const useStore = create<AppState>()(
  subscribeWithSelector((set) => ({
    ...initialState,

    setScene: (sceneId) => set({ sceneId, simTime: 0, currentTime: 0, playing: false }),
    setParam: (key, value) => set((s) => ({ params: { ...s.params, [key]: value } })),
    setParams: (params) => set({ params }),
    resetParams: () => set({ params: {} }),

    play: () => set({ playing: true }),
    pause: () => set({ playing: false }),
    togglePlay: () => set((s) => ({ playing: !s.playing })),
    reset: () => set({ playing: false, simTime: 0, currentTime: 0 }),
    setSpeed: (speed) => set({ speed }),

    startScrub: () => set({ scrubbing: true, playing: false }),
    endScrub: () => set({ scrubbing: false }),
    setCurrentTime: (currentTime) => set({ currentTime, simTime: currentTime }),

    toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),
    unlockAudio: () => set({ audioUnlocked: true }),
  })),
)
