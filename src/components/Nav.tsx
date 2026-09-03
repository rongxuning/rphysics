import { Link, useLocation } from 'react-router-dom'
import { Volume2, VolumeX, Github } from 'lucide-react'
import { useStore } from '@/store/useStore'

export default function Nav() {
  const location = useLocation()
  const audioEnabled = useStore((s) => s.audioEnabled)
  const toggleAudio = useStore((s) => s.toggleAudio)

  return (
    <nav className="glass-strong sticky top-0 z-50 mx-4 mt-4 px-5 py-3 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
          r
        </div>
        <div>
          <div className="text-sm font-semibold text-[var(--color-text-0)] tracking-wide">
            rPhysics
          </div>
          <div className="text-[10px] text-[var(--color-text-3)] -mt-0.5">
            物理原理演示
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-2">
        <NavLink to="/" current={location.pathname === '/'}>
          首页
        </NavLink>
        {location.pathname.startsWith('/scene/') && (
          <NavLink to="/" current>
            ← 返回首页
          </NavLink>
        )}

        <div className="w-px h-5 bg-[var(--color-border-2)] mx-1" />

        <button
          onClick={toggleAudio}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-2)] hover:text-[var(--color-text-0)] hover:bg-[var(--color-border)] transition"
          aria-label={audioEnabled ? '关闭音效' : '开启音效'}
          title={audioEnabled ? '关闭音效' : '开启音效'}
        >
          {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-2)] hover:text-[var(--color-text-0)] hover:bg-[var(--color-border)] transition"
          aria-label="GitHub"
        >
          <Github size={16} />
        </a>
      </div>
    </nav>
  )
}

function NavLink({
  to,
  current,
  children,
}: {
  to: string
  current: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
        current
          ? 'bg-[rgba(96,165,250,0.15)] text-[var(--color-brand-blue)]'
          : 'text-[var(--color-text-2)] hover:text-[var(--color-text-0)] hover:bg-[var(--color-border)]'
      }`}
    >
      {children}
    </Link>
  )
}
