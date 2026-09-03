import { create } from 'zustand'

/**
 * 首页 Hero 状态
 * - currentIdx: 当前展示的物理学家（0-5，6 人循环）
 * - phase: 当前 5s 周期内的进度（0-1）
 * - paused: 用户手动暂停
 */
type HeroState = {
  currentIdx: number
  phase: number
  paused: boolean
  setPhase: (p: number) => void
  setCurrentIdx: (i: number) => void
  togglePaused: () => void
  next: () => void
  prev: () => void
}

export const useHeroStore = create<HeroState>((set) => ({
  currentIdx: 0,
  phase: 0,
  paused: false,
  setPhase: (phase) => set({ phase: phase % 1 }),
  setCurrentIdx: (currentIdx) => set({ currentIdx, phase: 0 }),
  togglePaused: () => set((s) => ({ paused: !s.paused })),
  next: () => set((s) => ({ currentIdx: (s.currentIdx + 1) % 6, phase: 0 })),
  prev: () => set((s) => ({ currentIdx: (s.currentIdx + 5) % 6, phase: 0 })),
}))

/**
 * 每位物理学家的元数据 + 配色
 * 注意：3D 场景组件单独放在 components/Home/scenes/ 下
 */
export type Physicist = {
  id: string
  name: string         // 中文译名
  nameEn: string       // 英文原名
  years: string        // 生卒年
  role: string         // 一句话贡献
  color: string        // 主题色 hex
  formulas: { name: string; latex: string }[]
}

export const PHYSICISTS: Physicist[] = [
  {
    id: 'galileo',
    name: '伽利略',
    nameEn: 'Galileo Galilei',
    years: '1564 – 1642',
    role: '近代实验科学的奠基人',
    color: '#f59e0b',
    formulas: [
      { name: '自由落体速度', latex: 'v = g \\cdot t' },
      { name: '自由落体位移', latex: 'h = \\tfrac{1}{2} g t^2' },
      { name: '速度位移关系', latex: 'v^2 = 2gh' },
    ],
  },
  {
    id: 'newton',
    name: '牛顿',
    nameEn: 'Isaac Newton',
    years: '1643 – 1727',
    role: '经典力学与万有引力',
    color: '#fbbf24',
    formulas: [
      { name: '牛顿第二定律', latex: 'F = ma' },
      { name: '万有引力', latex: 'F = G \\tfrac{m_1 m_2}{r^2}' },
    ],
  },
  {
    id: 'archimedes',
    name: '阿基米德',
    nameEn: 'Archimedes',
    years: '前 287 – 前 212',
    role: '浮力原理与杠杆定律',
    color: '#60a5fa',
    formulas: [
      { name: '阿基米德原理', latex: 'F_\\text{浮} = \\rho_\\text{液} g V_\\text{排}' },
      { name: '杠杆原理', latex: 'F_1 \\cdot L_1 = F_2 \\cdot L_2' },
    ],
  },
  {
    id: 'joule',
    name: '焦耳',
    nameEn: 'James Joule',
    years: '1818 – 1889',
    role: '能量守恒与热功当量',
    color: '#a3a380',
    formulas: [
      { name: '焦耳热', latex: 'Q = I^2 R t' },
      { name: '热功当量', latex: '\\Delta E = Q' },
    ],
  },
  {
    id: 'maxwell',
    name: '麦克斯韦',
    nameEn: 'James Clerk Maxwell',
    years: '1831 – 1879',
    role: '经典电磁理论的统一',
    color: '#a855f7',
    formulas: [
      { name: '法拉第定律', latex: '\\nabla \\times E = -\\tfrac{\\partial B}{\\partial t}' },
      { name: '安培-麦克斯韦', latex: '\\nabla \\times B = \\mu_0 J + \\mu_0 \\varepsilon_0 \\tfrac{\\partial E}{\\partial t}' },
    ],
  },
  {
    id: 'einstein',
    name: '爱因斯坦',
    nameEn: 'Albert Einstein',
    years: '1879 – 1955',
    role: '相对论与光电效应',
    color: '#3b82f6',
    formulas: [
      { name: '质能等价', latex: 'E = m c^2' },
      { name: '洛伦兹因子', latex: '\\gamma = \\tfrac{1}{\\sqrt{1 - v^2/c^2}}' },
    ],
  },
]
