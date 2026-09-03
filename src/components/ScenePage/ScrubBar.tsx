import { useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import type { SimulationEngine } from '@/sim/engine'

/**
 * 时间游标 - 拖拽可回访任意时刻
 * - 拖动时暂停仿真
 * - 释放时继续从当前位置模拟
 */
export default function ScrubBar({ engine }: { engine: SimulationEngine }) {
  const [, setTick] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const wasPlayingRef = useRef(false)
  const [scrubbing, setScrubbing] = useState(false)
  const [displayTime, setDisplayTime] = useState(0)

  useEffect(() => engine.subscribe(() => setTick((n) => (n + 1) % 1000000)), [engine])

  const history = engine.history
  const totalTime = history.length > 0 ? history[history.length - 1].t : 0
  const progress = totalTime > 0 ? displayTime / totalTime : 0

  // 当不在拖拽时，displayTime 跟随最新 history 末尾
  useEffect(() => {
    if (!isDraggingRef.current && history.length > 0) {
      setDisplayTime(history[history.length - 1].t)
    }
  }, [history.length])

  function getTimeFromEvent(e: PointerEvent | React.PointerEvent): number {
    if (!trackRef.current) return 0
    const rect = trackRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const ratio = Math.max(0, Math.min(1, x / rect.width))
    return ratio * totalTime
  }

  function onPointerDown(e: React.PointerEvent) {
    isDraggingRef.current = true
    setScrubbing(true)
    wasPlayingRef.current = engine.scene ? true : false // approximation
    e.currentTarget.setPointerCapture(e.pointerId)
    const t = getTimeFromEvent(e)
    setDisplayTime(t)
    engine.setTime(t)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!isDraggingRef.current) return
    const t = getTimeFromEvent(e)
    setDisplayTime(t)
    engine.setTime(t)
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    setScrubbing(false)
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const playing = engine.history.length > 0 && engine.history[engine.history.length - 1].t > displayTime + 0.01

  return (
    <div className="glass sticky bottom-4 px-4 py-3 flex items-center gap-4">
      <button
        onClick={() => {
          if (scrubbing) {
            // resume
          }
          // 实际播放/暂停由 useStore 控制；这里只是 placeholder
        }}
        className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-text-2)] hover:text-[var(--color-text-0)] hover:bg-[var(--color-border)] border border-[var(--color-border-2)] transition"
        aria-label="播放/暂停"
      >
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>

      <button
        onClick={() => {
          engine.reset()
        }}
        className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-text-2)] hover:text-[var(--color-text-0)] hover:bg-[var(--color-border)] border border-[var(--color-border-2)] transition"
        aria-label="重置"
      >
        <RotateCcw size={14} />
      </button>

      <div className="text-xs font-mono text-[var(--color-text-3)] tabular-nums w-14 text-right">
        {formatTime(displayTime)}
      </div>

      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="flex-1 relative h-1.5 rounded-full bg-[var(--color-border)] cursor-pointer select-none touch-none"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
          style={{ width: `${progress * 100}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg shadow-blue-500/40 transition"
          style={{
            left: `calc(${progress * 100}% - 7px)`,
            transform: scrubbing ? 'translateY(-50%) scale(1.3)' : 'translateY(-50%)',
          }}
        />
        {scrubbing && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-[var(--color-bg-2)] border border-[var(--color-border-2)] text-[10px] font-mono text-[var(--color-text-1)]">
            {formatTime(displayTime)}
          </div>
        )}
      </div>

      <div className="text-xs font-mono text-[var(--color-text-3)] tabular-nums w-14">
        {formatTime(totalTime)}
      </div>
    </div>
  )
}

function formatTime(t: number): string {
  if (!isFinite(t) || t < 0) t = 0
  const min = Math.floor(t / 60)
  const sec = Math.floor(t % 60)
  const ms = Math.floor((t * 100) % 100)
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}
