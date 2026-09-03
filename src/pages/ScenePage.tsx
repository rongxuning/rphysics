import { useEffect, useRef, useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { ChevronLeft } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { getScene } from '@/scenes/registry'
import { SimulationEngine } from '@/sim/engine'
import { ambientEngine } from '@/audio/ambient'
import { useSimulationState } from '@/sim/useSimulation'
import LiveData from '@/components/ScenePage/LiveData'
import ParamSliders from '@/components/ScenePage/ParamSliders'
import Charts from '@/components/ScenePage/Charts'
import ScrubBar from '@/components/ScenePage/ScrubBar'
import FormulaPanel from '@/components/ScenePage/FormulaPanel'
import StatusBar from '@/components/ScenePage/StatusBar'
import NotFound from './NotFound'

/**
 * 实验页（/scene/:sceneId）
 * - 拉斜场景（pullFriction）MVP 完整实现
 * - 物理 tick 60Hz
 * - 4 个力箭头实时跟随
 * - 60Hz 图表
 * - 时间回放
 */
export default function ScenePage() {
  const { sceneId } = useParams<{ sceneId: string }>()
  const navigate = useNavigate()
  const scene = sceneId ? getScene(sceneId) : undefined

  // 页面进入时停止首页 ambient
  useEffect(() => {
    ambientEngine.stop()
  }, [])

  if (!scene) {
    return <NotFound sceneId={sceneId} />
  }

  return <ScenePageInner sceneId={scene.id} />
}

function ScenePageInner({ sceneId }: { sceneId: string }) {
  const scene = getScene(sceneId)!
  const params = useStore((s) => s.params)
  const setParam = useStore((s) => s.setParam)
  const setParams = useStore((s) => s.setParams)
  const playing = useStore((s) => s.playing)
  const togglePlay = useStore((s) => s.togglePlay)
  const reset = useStore((s) => s.reset)
  const speed = useStore((s) => s.speed)
  const setSpeed = useStore((s) => s.setSpeed)

  const engineRef = useRef<SimulationEngine | null>(null)
  if (engineRef.current === null || engineRef.current.scene.id !== sceneId) {
    // 初始化默认参数
    const defaults: Record<string, number> = {}
    scene.parameters.forEach((p) => (defaults[p.key] = p.default))
    engineRef.current = new SimulationEngine(scene, { ...defaults, ...params })
  }
  const engine = engineRef.current!

  // 进入页面：初始化参数
  useEffect(() => {
    const defaults: Record<string, number> = {}
    scene.parameters.forEach((p) => (defaults[p.key] = p.default))
    setParams(defaults)
    engine.reset()
  }, [sceneId])

  // 参数变化：同步给 engine
  useEffect(() => {
    engine.updateParams(params)
  }, [params, engine])

  // 订阅 state 变化（驱动非 3D 组件重渲染）
  useSimulationState(engine)

  // Tick loop
  useEffect(() => {
    if (!playing) return
    let raf: number
    let last = performance.now()
    const tick = (now: number) => {
      const dt = ((now - last) / 1000) * speed
      last = now
      // 限制最大 dt 避免大跳跃
      engine.tick(Math.min(dt, 0.05))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, speed, engine])

  return (
    <div className="px-4 py-4 max-w-[1440px] mx-auto">
      {/* 面包屑 */}
      <div className="mb-3 flex items-center gap-2 text-xs text-[var(--color-text-3)]">
        <Link
          to="/"
          className="hover:text-[var(--color-text-1)] transition flex items-center gap-1"
        >
          <ChevronLeft size={12} />
          首页
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-1)] font-mono">{scene.id}</span>
        <span className="text-[var(--color-text-3)]">· {scene.meta.title}</span>
      </div>

      {/* 状态条 */}
      <StatusBar engine={engine} />

      {/* 主体：3D 场景 + 右侧控制面板 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 mb-4">
        <div className="glass relative overflow-hidden h-[560px]">
          <Scene3DHost engine={engine} />
          {/* 物理状态叠加层 */}
          <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-1 pointer-events-none">
            <StateOverlay engine={engine} />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <ParamSliders
            parameters={scene.parameters}
            values={params}
            onChange={setParam}
          />
          <LiveData engine={engine} />
          <Transport
            playing={playing}
            speed={speed}
            onTogglePlay={togglePlay}
            onReset={() => {
              reset()
              engine.reset()
            }}
            onSpeedChange={setSpeed}
          />
        </div>
      </div>

      {/* 图表 */}
      <div className="mb-4">
        <Charts engine={engine} chartDefs={scene.charts} />
      </div>

      {/* 公式 */}
      <div className="mb-4">
        <FormulaPanel formulas={scene.formulas} />
      </div>

      {/* 时间游标 */}
      <ScrubBar engine={engine} />
    </div>
  )
}

function Scene3DHost({ engine }: { engine: SimulationEngine }) {
  // 用 useRef + useFrame 让 R3F 直接读 engine state
  // 不通过 React state，避免 60Hz 重渲染
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 3, 8], fov: 50 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
    >
      <SceneContent engine={engine} />
    </Canvas>
  )
}

function SceneContent({ engine }: { engine: SimulationEngine }) {
  // R3F 子树：直接读 engine.state
  // 父组件 useSimulationState 订阅让 React 保持活跃，
  // 但 R3F 内部通过 engine ref 直接访问 state
  const scene = engine.scene
  const state = engine.state // 这是个对象引用，每 tick 后会被替换
  return <scene.Scene3D state={state} params={engine.params} />
}

function StateOverlay({ engine }: { engine: SimulationEngine }) {
  // 显示当前物理判定
  const status = engine.scene.detectStatus(engine.state, engine.params)
  const colorMap: Record<string, string> = {
    static: 'text-[var(--color-text-2)]',
    blocked: 'text-red-400',
    moving: 'text-blue-400',
    uniform: 'text-emerald-400',
    liftoff: 'text-purple-400',
  }
  return (
    <div className="glass-strong px-3 py-2 text-xs space-y-1">
      <div className={`font-semibold ${colorMap[status.type]}`}>
        {status.label}
      </div>
      <div className="text-[var(--color-text-3)] text-[10px] max-w-xs">
        {status.description}
      </div>
    </div>
  )
}

function Transport({
  playing,
  speed,
  onTogglePlay,
  onReset,
  onSpeedChange,
}: {
  playing: boolean
  speed: number
  onTogglePlay: () => void
  onReset: () => void
  onSpeedChange: (s: number) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={onTogglePlay}
          className={`flex-1 h-9 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition ${
            playing
              ? 'bg-[rgba(96,165,250,0.2)] text-[var(--color-brand-blue)] border border-[rgba(96,165,250,0.3)]'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}
        >
          {playing ? '⏸ 暂停' : '▶ 开始'}
        </button>
        <button
          onClick={onReset}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-text-2)] hover:text-[var(--color-text-0)] hover:bg-[var(--color-border)] border border-[var(--color-border-2)] transition"
          aria-label="重置"
        >
          ↺
        </button>
      </div>
      <div className="flex gap-1">
        {[0.5, 1, 2].map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition ${
              speed === s
                ? 'bg-[rgba(96,165,250,0.15)] text-[var(--color-brand-blue)] border border-[rgba(96,165,250,0.3)]'
                : 'text-[var(--color-text-3)] hover:text-[var(--color-text-1)] border border-[var(--color-border-2)]'
            }`}
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  )
}
