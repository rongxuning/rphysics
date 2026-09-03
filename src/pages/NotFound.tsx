import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function NotFound({ sceneId }: { sceneId?: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-4 opacity-20">404</div>
      <h1 className="text-xl font-semibold text-[var(--color-text-0)] mb-2">
        场景 "{sceneId ?? ''}" 不存在
      </h1>
      <p className="text-sm text-[var(--color-text-3)] mb-6">
        该实验尚未实现 · 当前可用：pull-friction
      </p>
      <Link
        to="/"
        className="glass inline-flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-text-1)] hover:text-[var(--color-text-0)] transition"
      >
        <ChevronLeft size={14} />
        返回首页
      </Link>
    </div>
  )
}
