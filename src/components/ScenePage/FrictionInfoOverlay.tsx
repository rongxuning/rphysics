import { useEffect, useState } from 'react'
import type { SimulationEngine } from '@/sim/engine'

/**
 * 摩擦力信息面板 - HTML overlay
 * 始终固定在 3D 画布右上角，相机怎么动都不影响
 */
export default function FrictionInfoOverlay({
  engine,
}: {
  engine: SimulationEngine
}) {
  const [, setTick] = useState(0)
  useEffect(() => engine.subscribe(() => setTick((n) => (n + 1) % 1000000)), [engine])

  const s = engine.state
  const d = s.derived
  // 从 params 实时计算 N（让未开始时也能跟着滑块变）
  const F_param = (engine.params.F as number) ?? 0
  const theta_param = (((engine.params.theta as number) ?? 0) * Math.PI) / 180
  const m_param = (engine.params.m as number) ?? 0
  const g_param = (engine.params.g as number) ?? 0
  const Fx_param = F_param * Math.cos(theta_param)
  const N_param = Math.max(0, m_param * g_param - F_param * Math.sin(theta_param))
  const mu_s = (engine.params.mu_s as number) ?? 0
  const mu_k = (engine.params.mu_k as number) ?? 0
  const fs_max = mu_s * N_param
  const fk = mu_k * N_param

  const isMoving = s.v > 0.01
  const isBlocked = !isMoving && Fx_param <= fs_max + 0.05

  // 实际摩擦力
  const f_actual = isMoving ? fk : (isBlocked ? Fx_param : fk)

  // 状态文案
  let stateText = ''
  let stateColor = '#94a3b8'
  let stateBg = 'rgba(148,163,184,0.1)'
  let stateBorder = 'rgba(148,163,184,0.3)'
  if (isBlocked) {
    stateText = '静止（被静摩擦力锁住）'
    stateColor = '#f87171'
    stateBg = 'rgba(239,68,68,0.12)'
    stateBorder = 'rgba(239,68,68,0.4)'
  } else if (isMoving) {
    stateText = '滑动中（动摩擦）'
    stateColor = '#4ade80'
    stateBg = 'rgba(34,197,94,0.12)'
    stateBorder = 'rgba(34,197,94,0.4)'
  } else {
    stateText = '即将起动'
    stateColor = '#fbbf24'
    stateBg = 'rgba(251,191,36,0.12)'
    stateBorder = 'rgba(251,191,36,0.4)'
  }

  return (
    <div
      className="absolute top-3 right-3 z-10 w-60 rounded-xl overflow-hidden backdrop-blur-md"
      style={{
        background: 'rgba(10, 14, 26, 0.78)',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* 标题栏 */}
      <div
        className="px-3 py-2 text-[10px] font-semibold tracking-widest uppercase"
        style={{
          color: '#94a3b8',
          background: 'rgba(0, 0, 0, 0.3)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        }}
      >
        摩擦力分析
      </div>

      {/* 数据行 */}
      <div className="px-3 py-2.5 space-y-1.5 text-[11px] font-mono">
        <div className="flex justify-between items-center">
          <span className="text-[#a78bfa]">静摩擦系数</span>
          <span className="text-[#cbd5e1]">μₛ = {mu_s.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#fb923c]">动摩擦系数</span>
          <span className="text-[#cbd5e1]">μₖ = {mu_k.toFixed(2)}</span>
        </div>
        <div className="border-t border-[rgba(148,163,184,0.1)] my-1" />
        <div className="flex justify-between items-center">
          <span className="text-[#94a3b8]">正压力</span>
          <span className="text-[#cbd5e1]">N = {N_param.toFixed(1)} N</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#94a3b8]">最大静摩擦</span>
          <span className="text-[#cbd5e1]">μₛ·N = {fs_max.toFixed(1)} N</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#94a3b8]">动摩擦</span>
          <span className="text-[#cbd5e1]">μₖ·N = {fk.toFixed(1)} N</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#ef4444] font-semibold">实际摩擦 f</span>
          <span className="text-[#ef4444] font-semibold">
            {f_actual.toFixed(1)} N
          </span>
        </div>
      </div>

      {/* 状态栏 */}
      <div
        className="px-3 py-2 text-[10px] text-center"
        style={{
          color: stateColor,
          background: stateBg,
          borderTop: `1px solid ${stateBorder}`,
        }}
      >
        {stateText}
      </div>
    </div>
  )
}
