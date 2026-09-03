import { Link } from 'react-router-dom'
import { ArrowRight, Lock } from 'lucide-react'
import { Canvas } from '@react-three/fiber'
import {
  PullFrictionMini,
  FreeFallMini,
  SpringOscMini,
  InclineMini,
} from './CardMiniScenes'

/**
 * 首页实验目录网格
 * 每个卡用独立 Canvas（4-5 个，简单几何，性能 OK）
 */

type Card = {
  id: string
  title: string
  formula: string
  description: string
  status: 'available' | 'coming-soon'
  accent: string
  MiniScene: React.FC
}

const cards: Card[] = [
  {
    id: 'pull-friction',
    title: '斜面拉力 + 摩擦',
    formula: 'F = ma',
    description: '可变角度拉力 + 静/动摩擦',
    status: 'available',
    accent: 'from-blue-500/20 to-cyan-500/20',
    MiniScene: PullFrictionMini,
  },
  {
    id: 'free-fall',
    title: '自由落体',
    formula: 'v = g·t',
    description: '忽略空气阻力的下落',
    status: 'coming-soon',
    accent: 'from-amber-500/20 to-orange-500/20',
    MiniScene: FreeFallMini,
  },
  {
    id: 'spring-osc',
    title: '弹簧振子',
    formula: 'T = 2π√(m/k)',
    description: '简谐 + 阻尼振动',
    status: 'coming-soon',
    accent: 'from-purple-500/20 to-pink-500/20',
    MiniScene: SpringOscMini,
  },
  {
    id: 'incline',
    title: '斜面滑块',
    formula: 'a = g(sinθ − μcosθ)',
    description: '沿斜面下滑的力学分析',
    status: 'coming-soon',
    accent: 'from-emerald-500/20 to-teal-500/20',
    MiniScene: InclineMini,
  },
  {
    id: 'more',
    title: '更多场景',
    formula: '…',
    description: '持续扩展中',
    status: 'coming-soon',
    accent: 'from-slate-500/20 to-slate-600/20',
    MiniScene: InclineMini, // placeholder
  },
]

export default function SceneGrid() {
  return (
    <section className="px-4 py-16 max-w-[1440px] mx-auto">
      <div className="mb-10 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-[var(--color-text-0)] mb-2">
          实验目录
        </h2>
        <p className="text-sm text-[var(--color-text-3)]">
          点击卡片进入实验 · 每个实验支持参数调节 + 60Hz 实时数据 + 时间回放
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
      className={`group relative h-[280px] rounded-2xl glass overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-[rgba(96,165,250,0.3)] hover:shadow-2xl hover:shadow-blue-500/10 ${
        card.status === 'coming-soon' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {/* 顶部 mini 3D 区域 */}
      <div
        className={`relative h-[140px] bg-gradient-to-br ${card.accent}`}
      >
        <div className="absolute inset-0">
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0.5, 3], fov: 40 }}
            gl={{ antialias: true, alpha: true }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 5, 3]} intensity={1} />
            <MiniScene />
          </Canvas>
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

      {/* 底部信息 */}
      <div className="p-4 flex flex-col h-[140px]">
        <div className="text-sm font-semibold text-[var(--color-text-0)] mb-1 truncate">
          {card.title}
        </div>
        <div className="text-xs text-[var(--color-text-3)] mb-3 line-clamp-1">
          {card.description}
        </div>
        <div className="mt-auto flex items-center justify-between">
          <code className="text-xs font-mono text-[var(--color-brand-blue)] bg-[rgba(96,165,250,0.08)] px-2 py-1 rounded">
            {card.formula}
          </code>
          {card.status === 'available' && (
            <ArrowRight
              size={14}
              className="text-[var(--color-text-3)] group-hover:text-[var(--color-brand-blue)] group-hover:translate-x-1 transition"
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
