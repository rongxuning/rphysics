import type { ParameterDef, FormulaDef, ChartDef } from '../types'

export const parameters: ParameterDef[] = [
  { key: 'F', label: '起始拉力', symbol: 'F', unit: 'N', min: 0, max: 200, step: 1, default: 50 },
  { key: 'theta', label: '拉力角度', symbol: 'θ', unit: '°', min: 0, max: 90, step: 1, default: 30 },
  { key: 'm', label: '物体质量', symbol: 'm', unit: 'kg', min: 0.5, max: 20, step: 0.1, default: 5 },
  { key: 'mu_s', label: '静摩擦系数', symbol: 'μₛ', unit: '', min: 0, max: 1, step: 0.01, default: 0.3 },
  { key: 'mu_k', label: '动摩擦系数', symbol: 'μₖ', unit: '', min: 0, max: 1, step: 0.01, default: 0.2 },
  { key: 'g', label: '重力加速度', symbol: 'g', unit: 'm/s²', min: 1, max: 25, step: 0.1, default: 9.8 },
]

export const formulas: FormulaDef[] = [
  { id: 1, name: '牛顿第二定律', latex: 'F_\\text{合} = ma', links: [{ type: 'state', ref: 'a' }] },
  { id: 2, name: '正压力（斜拉）', latex: 'N = mg - F \\sin\\theta', links: [{ type: 'force', ref: 'N' }] },
  { id: 3, name: '最大静摩擦', latex: 'f_{s,\\max} = \\mu_s N' },
  { id: 4, name: '动摩擦', latex: 'f_k = \\mu_k N', links: [{ type: 'force', ref: 'f' }] },
  { id: 5, name: '水平加速度', latex: 'F \\cos\\theta - f_k = ma', links: [{ type: 'state', ref: 'a' }] },
  { id: 6, name: '起动条件', latex: 'F \\cos\\theta > \\mu_s N' },
  { id: 7, name: '离地条件', latex: 'F \\sin\\theta \\geq mg' },
  { id: 8, name: '匀速条件', latex: 'F \\cos\\theta = \\mu_k N' },
  { id: 9, name: '速度', latex: 'v = v_0 + at', links: [{ type: 'state', ref: 'v' }] },
  { id: 10, name: '位移', latex: 'x = x_0 + v_0 t + \\tfrac{1}{2}at^2', links: [{ type: 'state', ref: 'x' }] },
  { id: 11, name: '无法拉动', latex: 'F \\cos\\theta \\leq \\mu_s N' },
  { id: 12, name: '离地运动', latex: 'a_x = \\tfrac{F\\cos\\theta}{m}, a_y = \\tfrac{F\\sin\\theta - mg}{m}' },
]

export const charts: ChartDef[] = [
  {
    id: 'v',
    title: '速度',
    symbol: 'v(t)',
    yUnit: 'm/s',
    yMin: 0,
    yMax: 5,
    stateKey: 'v',
    color: '#4ade80',
  },
  {
    id: 'a',
    title: '加速度',
    symbol: 'a(t)',
    yUnit: 'm/s²',
    yMin: -2,
    yMax: 5,
    stateKey: 'a',
    color: '#60a5fa',
  },
  {
    id: 'F_net',
    title: '水平合力',
    symbol: 'F_\\text{合},x(t)',
    yUnit: 'N',
    yMin: -20,
    yMax: 50,
    stateKey: 'F_net_x',
    color: '#f97316',
  },
]
