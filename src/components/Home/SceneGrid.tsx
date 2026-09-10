import { Link } from 'react-router-dom'
import { ArrowRight, Lock } from 'lucide-react'
import { Canvas } from '@react-three/fiber'
import { useEffect, useRef, useState, type ComponentType } from 'react'
import {
  PullFrictionMini,
  DoubleSlitMini,
  InductionMini,
  IdealGasMini,
  StandingWaveMini,
  BernoulliMini,
  PhotoelectricMini,
  RlcCircuitMini,
  DopplerMini,
  KeplerMini,
} from './CardMiniScenes'

/**
 * 首页实验目录
 * 1 个已开放 + 9 个不同方向待开放场景
 */

type Card = {
  id: string
  title: string
  formula: string
  description: string
  domain: string
  status: 'available' | 'coming-soon'
  accent: string
  MiniScene: ComponentType
}

const cards: Card[] = [
  {
    id: 'pull-friction',
    title: '斜面拉力 + 摩擦',
    formula: 'F = ma',
    description: '可变角度拉力 + 静/动摩擦',
    domain: '经典力学',
    status: 'available',
    accent: 'from-blue-500/20 to-cyan-500/20',
    MiniScene: PullFrictionMini,
  },
  {
    id: 'double-slit',
    title: '杨氏双缝干涉',
    formula: 'Δ = d sinθ',
    description: '光的波动性与干涉条纹',
    domain: '光学',
    status: 'available',
    accent: 'from-violet-500/20 to-fuchsia-500/20',
    MiniScene: DoubleSlitMini,
  },
  {
    id: 'faraday-induction',
    title: '法拉第电磁感应',
    formula: 'ε = −dΦ/dt',
    description: '磁通量变化产生感应电动势',
    domain: '电磁学',
    status: 'available',
    accent: 'from-yellow-500/20 to-amber-500/20',
    MiniScene: InductionMini,
  },
  {
    id: 'ideal-gas',
    title: '理想气体定律',
    formula: 'PV = nRT',
    description: '压强·体积·温度关系',
    domain: '热力学',
    status: 'available',
    accent: 'from-rose-500/20 to-red-500/20',
    MiniScene: IdealGasMini,
  },
  {
    id: 'standing-wave',
    title: '弦上驻波',
    formula: 'λ = 2L/n',
    description: '波腹波节与共振模式',
    domain: '波动',
    status: 'available',
    accent: 'from-sky-500/20 to-indigo-500/20',
    MiniScene: StandingWaveMini,
  },
  {
    id: 'bernoulli',
    title: '伯努利方程',
    formula: 'P + ½ρv² = c',
    description: '流体沿线能量守恒',
    domain: '流体力学',
    status: 'available',
    accent: 'from-teal-500/20 to-cyan-500/20',
    MiniScene: BernoulliMini,
  },
  {
    id: 'photoelectric',
    title: '光电效应',
    formula: 'E = hf − W',
    description: '光量子与逸出功',
    domain: '近代物理',
    status: 'available',
    accent: 'from-lime-500/20 to-emerald-500/20',
    MiniScene: PhotoelectricMini,
  },
  {
    id: 'rlc-circuit',
    title: 'RLC 振荡电路',
    formula: 'ω₀ = 1/√(LC)',
    description: '电磁振荡与阻尼衰减',
    domain: '电路',
    status: 'available',
    accent: 'from-orange-500/20 to-yellow-500/20',
    MiniScene: RlcCircuitMini,
  },
  {
    id: 'doppler',
    title: '多普勒效应',
    formula: "f' = f·(v±vₒ)/(v±vₛ)",
    description: '波源与观察者的相对运动',
    domain: '声学',
    status: 'available',
    accent: 'from-pink-500/20 to-rose-500/20',
    MiniScene: DopplerMini,
  },
  {
    id: 'kepler-orbit',
    title: '开普勒轨道',
    formula: 'T² ∝ a³',
    description: '万有引力下的椭圆运动',
    domain: '天体力学',
    status: 'available',
    accent: 'from-indigo-500/20 to-blue-500/20',
    MiniScene: KeplerMini,
  },
]

export default function SceneGrid() {
  return (
    <section className="px-4 py-8 md:py-10 max-w-[1440px] mx-auto min-h-full flex flex-col justify-center">
      <div className="mb-6 md:mb-8 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-[var(--color-text-0)]">
          实验目录
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {cards.map((card) => (
          <CardItem key={card.id} card={card} />
        ))}
      </div>
    </section>
  )
}

function CardItem({ card }: { card: Card }) {
  const { MiniScene } = card
  const inner = (
    <div
      className={`group relative h-[240px] md:h-[260px] rounded-2xl glass overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-[rgba(96,165,250,0.3)] hover:shadow-2xl hover:shadow-blue-500/10 ${
        card.status === 'coming-soon' ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <div className={`relative h-[120px] md:h-[130px] bg-gradient-to-br ${card.accent}`}>
        <LazyMiniCanvas MiniScene={MiniScene} />
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] text-[var(--color-text-2)] bg-black/40 backdrop-blur-sm z-10">
          {card.domain}
        </div>
        {card.status === 'coming-soon' && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-[10px] text-[var(--color-text-2)] z-10">
            <Lock size={10} />
            待开放
          </div>
        )}
        {card.status === 'available' && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/30 backdrop-blur-sm text-[10px] text-emerald-200 border border-emerald-500/40 z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            MVP
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col h-[120px] md:h-[130px]">
        <div className="text-sm font-semibold text-[var(--color-text-0)] mb-0.5 truncate">
          {card.title}
        </div>
        <div className="text-[11px] text-[var(--color-text-3)] mb-2 line-clamp-2">
          {card.description}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2">
          <code className="text-[10px] font-mono text-[var(--color-brand-blue)] bg-[rgba(96,165,250,0.08)] px-1.5 py-0.5 rounded truncate max-w-[75%]">
            {card.formula}
          </code>
          {card.status === 'available' && (
            <ArrowRight
              size={14}
              className="shrink-0 text-[var(--color-text-3)] group-hover:text-[var(--color-brand-blue)] group-hover:translate-x-1 transition"
            />
          )}
        </div>
      </div>
    </div>
  )

  if (card.status === 'available') {
    return <Link to={`/scene/${card.id}`}>{inner}</Link>
  }
  return inner
}

/** 仅在进入视口时挂载 Canvas，减轻 10 卡同时跑 WebGL 的压力 */
function LazyMiniCanvas({ MiniScene }: { MiniScene: ComponentType }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = hostRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { rootMargin: '80px', threshold: 0.05 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={hostRef} className="absolute inset-0">
      {visible && (
        <Canvas
          dpr={[1, 1.25]}
          camera={{ position: [0, 0.5, 3], fov: 40 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          frameloop="always"
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 5, 3]} intensity={1} />
          <MiniScene />
        </Canvas>
      )}
    </div>
  )
}
