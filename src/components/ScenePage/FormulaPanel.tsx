import { useEffect, useState } from 'react'
import katex from 'katex'
import type { FormulaDef } from '@/scenes/types'

/**
 * 公式面板 - KaTeX 渲染
 * 阶段 6+ 加入：点击公式高亮 3D 场景中对应力
 */
export default function FormulaPanel({ formulas }: { formulas: FormulaDef[] }) {
  return (
    <div className="glass p-5">
      <div className="text-[11px] font-semibold text-[var(--color-text-3)] uppercase tracking-widest mb-3">
        📐 物理公式参考
        <span className="ml-2 normal-case font-normal text-[var(--color-text-3)]">
          · 12 个公式 · 覆盖全部边界条件
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {formulas.map((f) => (
          <FormulaCard key={f.id} formula={f} />
        ))}
      </div>
    </div>
  )
}

function FormulaCard({ formula }: { formula: FormulaDef }) {
  const [rendered, setRendered] = useState('')
  useEffect(() => {
    try {
      setRendered(katex.renderToString(formula.latex, { throwOnError: false }))
    } catch {
      setRendered(formula.latex)
    }
  }, [formula.latex])

  return (
    <div className="p-3 rounded-lg bg-[rgba(13,18,32,0.5)] border border-[var(--color-border)] hover:border-[rgba(96,165,250,0.3)] transition cursor-pointer group">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="w-4 h-4 rounded bg-[rgba(96,165,250,0.12)] text-[var(--color-brand-blue)] text-[9px] font-semibold flex items-center justify-center">
          {formula.id}
        </span>
        <span className="text-[10px] text-[var(--color-text-3)] truncate">
          {formula.name}
        </span>
      </div>
      <div
        className="text-[var(--color-text-0)]"
        dangerouslySetInnerHTML={{ __html: rendered }}
      />
    </div>
  )
}
