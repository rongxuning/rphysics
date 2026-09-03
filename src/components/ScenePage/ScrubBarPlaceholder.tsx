import { Play, Pause, RotateCcw } from 'lucide-react'
import { useStore } from '@/store/useStore'

/**
 * ScrubBar 占位
 * 阶段 1：按钮可点（store 已通），进度条不可拖
 * 阶段 6：完整实现拖拽 + 3D 场景反向回放
 */
export default function ScrubBarPlaceholder() {
  const playing = useStore((s) => s.playing)
  const togglePlay = useStore((s) => s.togglePlay)
  const reset = useStore((s) => s.reset)

  return (
    <div className="glass sticky bottom-4 px-4 py-3 flex items-center gap-4">
      <button
        onClick={togglePlay}
        className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${
          playing
            ? 'bg-[rgba(96,165,250,0.2)] text-[var(--color-brand-blue)] border border-[rgba(96,165,250,0.3)]'
            : 'bg-[rgba(34,197,94,0.2)] text-emerald-300 border border-emerald-500/30'
        }`}
        aria-label={playing ? '暂停' : '开始'}
      >
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>

      <button
        onClick={reset}
        className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-text-2)] hover:text-[var(--color-text-0)] hover:bg-[var(--color-border)] border border-[var(--color-border-2)] transition"
        aria-label="重置"
      >
        <RotateCcw size={14} />
      </button>

      <div className="text-xs font-mono text-[var(--color-text-3)] tabular-nums">
        00:00
      </div>

      <div className="flex-1 relative h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-0 bg-gradient-to-r from-blue-500 to-purple-500" />
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg shadow-blue-500/40 opacity-30" />
      </div>

      <div className="text-xs font-mono text-[var(--color-text-3)] tabular-nums">
        00:00
      </div>

      <div className="flex items-center gap-1 ml-2 text-[10px] text-[var(--color-text-3)] uppercase tracking-widest">
        Stage 6 · 拖拽
      </div>
    </div>
  )
}
