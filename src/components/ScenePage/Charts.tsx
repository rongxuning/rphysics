import { useEffect, useRef, useState } from 'react'
import uPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'
import type { SimulationEngine } from '@/sim/engine'
import type { ChartDef } from '@/scenes/types'

/**
 * uPlot 通用时序图
 * 60Hz 实时更新（订阅 engine，每帧 setData）
 * 支持动态 yMin/yMax（auto-scale）
 */
function UPlotChart({
  data,
  options,
  yMin,
  yMax,
}: {
  data: uPlot.AlignedData
  options: Omit<uPlot.Options, 'width' | 'height'>
  yMin?: number
  yMax?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const plotRef = useRef<uPlot | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    const width = Math.max(el.clientWidth, 1)
    const height = Math.max(el.clientHeight, 1)
    plotRef.current = new uPlot({ ...options, width, height }, data, el)

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry || !plotRef.current) return
      const { width: w, height: h } = entry.contentRect
      if (w > 0 && h > 0) plotRef.current.setSize({ width: w, height: h })
    })
    ro.observe(el)

    return () => {
      ro.disconnect()
      plotRef.current?.destroy()
      plotRef.current = null
    }
  }, [])

  useEffect(() => {
    plotRef.current?.setData(data)
  }, [data])

  useEffect(() => {
    if (!plotRef.current || yMin === undefined || yMax === undefined) return
    plotRef.current.setScale('y', { min: yMin, max: yMax })
  }, [yMin, yMax])

  return <div ref={containerRef} className="w-full h-full min-w-0" />
}

/**
 * 图表面板 - 根据 scene.charts 自动生成
 */
export default function Charts({
  engine,
  chartDefs,
}: {
  engine: SimulationEngine
  chartDefs: ChartDef[]
}) {
  return (
    <div className="grid grid-cols-5 gap-2 min-w-0">
      {chartDefs.map((def) => (
        <SingleChart key={def.id} engine={engine} def={def} />
      ))}
    </div>
  )
}

function SingleChart({
  engine,
  def,
}: {
  engine: SimulationEngine
  def: ChartDef
}) {
  const [, setTick] = useState(0)
  useEffect(() => engine.subscribe(() => setTick((n) => (n + 1) % 1000000)), [engine])

  // 重建数据数组 (uPlot 要求 TypedArray 性能最好)
  const xs = new Float64Array(engine.history.length)
  const ys = new Float64Array(engine.history.length)
  // 多系列图（能量平衡：W_F + Q 两条曲线）
  const ys2 = def.multiSeries
    ? new Float64Array(engine.history.length)
    : null

  for (let i = 0; i < engine.history.length; i++) {
    const snap = engine.history[i]
    xs[i] = snap.t
    ys[i] = snap.derived[def.stateKey] ?? (snap as any)[def.stateKey] ?? 0
    if (ys2) {
      // energy_balance 特殊处理：第二条曲线是 Q
      if (def.stateKey === 'energy_balance') {
        ys2[i] = snap.derived.Q ?? 0
      }
    }
  }
  const data: uPlot.AlignedData = ys2
    ? [xs, ys, ys2]
    : [xs, ys]
  const current = ys.length > 0 ? ys[ys.length - 1] : 0
  const current2 = ys2 && ys2.length > 0 ? ys2[ys2.length - 1] : null

  // Auto-scale y axis based on data
  let yMin = def.yMin
  let yMax = def.yMax
  if (ys.length > 0) {
    let dataMax = -Infinity
    let dataMin = Infinity
    for (let i = 0; i < ys.length; i++) {
      const v = ys[i]
      if (v > dataMax) dataMax = v
      if (v < dataMin) dataMin = v
    }
    if (ys2) {
      for (let i = 0; i < ys2.length; i++) {
        const v = ys2[i]
        if (v > dataMax) dataMax = v
        if (v < dataMin) dataMin = v
      }
    }
    if (def.startFromZero) {
      yMax = Math.max(Math.abs(dataMax) * 1.1, 1)
      yMin = 0
    } else {
      const absMax = Math.max(Math.abs(dataMax), Math.abs(dataMin), 1)
      yMax = absMax * 1.1
      yMin = -yMax
    }
    if (dataMax === 0 && dataMin === 0) {
      yMax = def.yMax
      yMin = def.yMin
    }
  }

  // 多系列配色
  const series: uPlot.Series[] = ys2
    ? [{}, { stroke: def.color, width: 1.25, points: { show: false } }, { stroke: '#fb923c', width: 1.25, points: { show: false } }]
    : [{}, { stroke: def.color, width: 1.25, points: { show: false } }]

  const options: Omit<uPlot.Options, 'width' | 'height'> = {
    pxAlign: false,
    cursor: { drag: { x: false, y: false }, points: { show: false } },
    legend: { show: false },
    scales: {
      x: { time: false },
      y: { range: [yMin, yMax] },
    },
    axes: [
      {
        stroke: '#64748b',
        grid: { stroke: 'rgba(148,163,184,0.06)', width: 1 },
        ticks: { stroke: '#475569', size: 4 },
        font: '9px monospace',
        size: 22,
      },
      {
        stroke: '#64748b',
        grid: { stroke: 'rgba(148,163,184,0.06)', width: 1 },
        ticks: { stroke: '#475569', size: 4 },
        font: '9px monospace',
        size: 33,
      },
    ],
    series,
  }

  return (
    <div className="glass p-1.5 min-w-0 overflow-hidden flex flex-col">
      <div className="flex justify-between items-baseline mb-0.5 gap-1 min-w-0">
        <span className="text-[10px] font-semibold text-[var(--color-text-2)] uppercase tracking-wider truncate">
          {def.title}{' '}
          <span className="italic text-[var(--color-text-0)]">{def.symbol}</span>
        </span>
        <span
          className="text-xs font-mono font-semibold shrink-0"
          style={{ color: def.color }}
        >
          {current.toFixed(2)}
          <span className="text-[9px] text-[var(--color-text-3)] ml-0.5 font-normal">
            {def.yUnit}
          </span>
          {current2 !== null && (
            <>
              <span className="text-[var(--color-text-3)] mx-0.5">·</span>
              <span style={{ color: '#fb923c' }}>
                {current2.toFixed(2)}
                <span className="text-[9px] text-[var(--color-text-3)] ml-0.5 font-normal">
                  Q
                </span>
              </span>
            </>
          )}
        </span>
      </div>
      <div className="h-[100px] min-w-0 w-full">
        <UPlotChart data={data} options={options} yMin={yMin} yMax={yMax} />
      </div>
    </div>
  )
}
