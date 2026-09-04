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
  options: uPlot.Options
  yMin?: number
  yMax?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const plotRef = useRef<uPlot | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    plotRef.current = new uPlot(options, data, containerRef.current)
    return () => {
      plotRef.current?.destroy()
      plotRef.current = null
    }
  }, [])

  useEffect(() => {
    plotRef.current?.setData(data)
  }, [data])

  // 动态调整 y 轴
  useEffect(() => {
    if (!plotRef.current || yMin === undefined || yMax === undefined) return
    plotRef.current.setScale('y', { min: yMin, max: yMax })
  }, [yMin, yMax])

  return <div ref={containerRef} />
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
  for (let i = 0; i < engine.history.length; i++) {
    const snap = engine.history[i]
    xs[i] = snap.t
    ys[i] = snap.derived[def.stateKey] ?? (snap as any)[def.stateKey] ?? 0
  }
  const data: uPlot.AlignedData = [xs, ys]
  const current = ys.length > 0 ? ys[ys.length - 1] : 0

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
    // 留 10% padding
    if (def.startFromZero) {
      yMax = Math.max(Math.abs(dataMax) * 1.1, 1)
      yMin = 0
    } else {
      const absMax = Math.max(Math.abs(dataMax), Math.abs(dataMin), 1)
      yMax = absMax * 1.1
      yMin = -yMax
    }
    // 如果只有 0 数据，保留默认值
    if (dataMax === 0 && dataMin === 0) {
      yMax = def.yMax
      yMin = def.yMin
    }
  }

  const options: uPlot.Options = {
    width: 400,
    height: 140,
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
        font: '10px monospace',
      },
      {
        stroke: '#64748b',
        grid: { stroke: 'rgba(148,163,184,0.06)', width: 1 },
        ticks: { stroke: '#475569', size: 4 },
        font: '10px monospace',
        size: 32,
      },
    ],
    series: [
      {},
      { stroke: def.color, width: 1.5, points: { show: false } },
    ],
  }

  return (
    <div className="glass p-4">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-[11px] font-semibold text-[var(--color-text-2)] uppercase tracking-wider">
          {def.title}{' '}
          <span className="italic text-[var(--color-text-0)]">{def.symbol}</span>
        </span>
        <span
          className="text-sm font-mono font-semibold"
          style={{ color: def.color }}
        >
          {current.toFixed(2)}
          <span className="text-[10px] text-[var(--color-text-3)] ml-1 font-normal">
            {def.yUnit}
          </span>
        </span>
      </div>
      <UPlotChart data={data} options={options} yMin={yMin} yMax={yMax} />
    </div>
  )
}
