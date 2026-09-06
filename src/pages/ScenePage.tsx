import { useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { ChevronLeft } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { getScene } from '@/scenes/registry'
import { SimulationEngine } from '@/sim/engine'
import { ambientEngine } from '@/audio/ambient'
import { useSimulationState } from '@/sim/useSimulation'
import LiveDataOverlay from '@/components/ScenePage/LiveDataOverlay'
import ParamSliders from '@/components/ScenePage/ParamSliders'
import Charts from '@/components/ScenePage/Charts'
import StatusBar from '@/components/ScenePage/StatusBar'
import FrictionInfoOverlay from '@/components/ScenePage/FrictionInfoOverlay'
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
  const pause = useStore((s) => s.pause)
  const reset = useStore((s) => s.reset)
  const speed = useStore((s) => s.speed)

  // 实时计算离地状态（从 params）
  const F_param = params.F ?? 0
  const theta_rad = ((params.theta ?? 0) * Math.PI) / 180
  const m_param = params.m ?? 0
  const g_param = params.g ?? 9.8
  const Fy_param = F_param * Math.sin(theta_rad)
  const N_param = m_param * g_param - Fy_param
  const isLifted = N_param <= 0.01

  // 离地防护：playing 时若变成离地状态，自动停止
  useEffect(() => {
    if (playing && isLifted) {
      pause()
    }
  }, [playing, isLifted, pause])

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
    <div className="h-full overflow-hidden px-4 py-2 max-w-[1440px] mx-auto w-full flex flex-col gap-2 min-h-0">
      {/* 顶栏：面包屑 + 状态 */}
      <div className="shrink-0 flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-3)] min-w-0">
          <Link
            to="/"
            className="hover:text-[var(--color-text-1)] transition flex items-center gap-1 shrink-0"
          >
            <ChevronLeft size={12} />
            首页
          </Link>
          <span>/</span>
          <span className="text-[var(--color-text-1)] font-mono">{scene.id}</span>
          <span className="text-[var(--color-text-3)] truncate">· {scene.meta.title}</span>
        </div>
        <StatusBar engine={engine} />
      </div>

      {/* 主行：3D + 侧栏 */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-3">
        <div className="glass relative overflow-hidden min-h-0 h-full">
          <Scene3DHost engine={engine} />
          <LiveDataOverlay engine={engine} />
          <FrictionInfoOverlay engine={engine} />
        </div>
        <div className="flex flex-col gap-2 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-hidden">
            <ParamSliders
              parameters={scene.parameters}
              values={params}
              onChange={setParam}
            />
          </div>
          <div className="shrink-0">
            <Transport
              playing={playing}
              disabled={isLifted}
              onTogglePlay={togglePlay}
              onReset={() => {
                reset()
                engine.reset()
              }}
            />
          </div>
        </div>
      </div>

      {/* 图表带：高度预算由 Charts 内部控制；此处 shrink-0 */}
      <div className="shrink-0 min-w-0 overflow-hidden">
        <Charts engine={engine} chartDefs={scene.charts} />
      </div>
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

function Transport({
  playing,
  disabled,
  onTogglePlay,
  onReset,
}: {
  playing: boolean
  disabled?: boolean
  onTogglePlay: () => void
  onReset: () => void
}) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onTogglePlay}
        disabled={disabled}
        title={disabled ? '物体已离地，无法开始/继续运动' : undefined}
        className={`flex-1 h-8 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition ${
          disabled
            ? 'bg-red-500/10 text-red-300 border border-red-500/30 cursor-not-allowed opacity-60'
            : playing
            ? 'bg-[rgba(96,165,250,0.2)] text-[var(--color-brand-blue)] border border-[rgba(96,165,250,0.3)]'
            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        }`}
      >
        {disabled ? '⚠ 离地' : playing ? '⏸ 暂停' : '▶ 开始'}
      </button>
      <button
        onClick={onReset}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-2)] hover:text-[var(--color-text-0)] hover:bg-[var(--color-border)] border border-[var(--color-border-2)] transition"
        aria-label="重置"
      >
        ↺
      </button>
    </div>
  )
}
