import type { ScenePlugin, SceneState } from '@/scenes/types'

/**
 * 仿真引擎 - 单个 scene 的物理仿真状态
 * - state: 当前 SceneState（每帧由 tick 更新）
 * - history: 全部历史快照（用于 Scrub Bar 时间回放）
 * - listeners: 订阅者（LiveData、Chart、3D 场景通过此通知更新）
 */
export class SimulationEngine {
  state: SceneState
  history: SceneState[] = []
  private listeners = new Set<() => void>()
  private maxHistory = 36000 // 10 分钟 @ 60Hz

  constructor(
    public scene: ScenePlugin,
    public params: Record<string, number>,
  ) {
    this.state = scene.initialState()
    this.history.push({ ...this.state, derived: { ...this.state.derived } })
  }

  /** 物理 tick - dt 秒 */
  tick(dt: number) {
    this.state = this.scene.tick(this.state, this.params, dt)
    this.history.push({
      t: this.state.t,
      x: this.state.x,
      v: this.state.v,
      a: this.state.a,
      derived: { ...this.state.derived },
    })
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    }
    this.notify()
  }

  /** 重置 */
  reset() {
    this.state = this.scene.initialState()
    this.history = [{ ...this.state, derived: { ...this.state.derived } }]
    this.notify()
  }

  /** 更新参数（不重置 state） */
  updateParams(params: Record<string, number>) {
    this.params = params
  }

  /** Scrub 到指定时间（秒） */
  setTime(t: number) {
    const idx = Math.floor(t * 60)
    if (idx < 0 || idx >= this.history.length) return
    const snap = this.history[idx]
    this.state = {
      t: snap.t,
      x: snap.x,
      v: snap.v,
      a: snap.a,
      derived: { ...snap.derived },
    }
    this.notify()
  }

  /** 订阅状态变化 */
  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    this.listeners.forEach((l) => l())
  }
}
