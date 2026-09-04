import { useEffect, useState } from 'react'
import type { SimulationEngine } from '@/sim/engine'
import { useStore } from '@/store/useStore'

/**
 * 摩擦力信息面板 - HTML overlay
 * 始终固定在 3D 画布右上角，相机怎么动都不影响
 *
 * 数据源策略：params 从 useStore 读（与 Scene3D 的 props 同源，避免时序差）
 *            state 从 engine 读（v, derived）
 */
export default function FrictionInfoOverlay({
  engine,
}: {
  engine: SimulationEngine
}) {
  // 从 useStore 读 params（与 Scene3D props 完全同源，无时序差）
  const params = useStore((s) => s.params)
  const [, setTick] = useState(0)
  useEffect(() => engine.subscribe(() => setTick((n) => (n + 1) % 1000000)), [engine])

  const s = engine.state
  // 从 props 算 N 和 F·cosθ（与 Scene3D 用完全一样的公式）
  const F_param = params.F ?? 0
  const theta_rad = ((params.theta ?? 0) * Math.PI) / 180
  const m_param = params.m ?? 0
  const g_param = params.g ?? 9.8
  const Fx_param = F_param * Math.cos(theta_rad)
  const Fy_param = F_param * Math.sin(theta_rad)
  const N_param = Math.max(0, m_param * g_param - Fy_param)
  const mg_param = m_param * g_param
  const mu_s = params.mu_s ?? 0
  const mu_k = params.mu_k ?? 0
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
          <span className="text-[#94a3b8]">重力</span>
          <span className="text-[#cbd5e1]">mg = {mg_param.toFixed(1)} N</span>
        </div>
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
