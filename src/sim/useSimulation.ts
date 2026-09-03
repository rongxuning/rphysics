import { useEffect, useState, useRef } from 'react'
import type { SimulationEngine } from './engine'

/**
 * 订阅 SimulationEngine 的状态变化
 * 60Hz tick 时组件会重渲染 - 适合数据展示/图表
 * 不适合 3D 场景（3D 用 useFrame + ref 直接读 engine）
 */
export function useSimulationState(engine: SimulationEngine | null): number {
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!engine) return
    return engine.subscribe(() => setTick((n) => n + 1))
  }, [engine])
  return 0
}

/** 获取 engine 的稳定 ref - 在多次渲染间保持 */
export function useStableRef<T>(value: T) {
  const ref = useRef(value)
  ref.current = value
  return ref
}
