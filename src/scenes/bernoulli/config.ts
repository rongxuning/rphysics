import type { ParameterDef, FormulaDef, ChartDef } from '../types'

export const parameters: ParameterDef[] = [
  { key: 'rho', label: '流体密度', symbol: 'ρ', unit: 'kg/m³', min: 500, max: 2000, step: 10, default: 1000 },
  { key: 'A1', label: '截面1面积', symbol: 'A₁', unit: 'm²', min: 0.01, max: 0.2, step: 0.005, default: 0.08 },
  { key: 'A2', label: '截面2面积', symbol: 'A₂', unit: 'm²', min: 0.005, max: 0.1, step: 0.005, default: 0.02 },
  { key: 'v1', label: '入口流速', symbol: 'v₁', unit: 'm/s', min: 0.1, max: 5, step: 0.1, default: 1 },
  { key: 'h1', label: '高度1', symbol: 'h₁', unit: 'm', min: 0, max: 5, step: 0.1, default: 1 },
  { key: 'h2', label: '高度2', symbol: 'h₂', unit: 'm', min: 0, max: 5, step: 0.1, default: 0.5 },
]

export const formulas: FormulaDef[] = [
  { id: 1, name: '连续性方程', latex: 'A_1 v_1 = A_2 v_2', links: [{ type: 'state', ref: 'v2' }] },
  { id: 2, name: '体积流量', latex: 'Q = A_1 v_1', links: [{ type: 'state', ref: 'Q_flow' }] },
  {
    id: 3,
    name: '伯努利方程',
    latex: 'P_1 + \\tfrac{1}{2}\\rho v_1^2 + \\rho g h_1 = P_2 + \\tfrac{1}{2}\\rho v_2^2 + \\rho g h_2',
  },
  {
    id: 4,
    name: '压强差',
    latex: '\\Delta P = \\rho\\bigl(\\tfrac{1}{2}(v_1^2-v_2^2)+g(h_1-h_2)\\bigr)',
    links: [{ type: 'state', ref: 'deltaP' }],
  },
]

export const charts: ChartDef[] = [
  {
    id: 'v2',
    title: '出口流速',
    symbol: 'v_2(t)',
    yUnit: 'm/s',
    yMin: 0,
    yMax: 20,
    stateKey: 'v2',
    color: '#2dd4bf',
    startFromZero: true,
  },
  {
    id: 'deltaP',
    title: '压强差',
    symbol: '\\Delta P(t)',
    yUnit: 'Pa',
    yMin: -20000,
    yMax: 20000,
    stateKey: 'deltaP',
    color: '#14b8a6',
    startFromZero: false,
  },
  {
    id: 'Q_flow',
    title: '体积流量',
    symbol: 'Q(t)',
    yUnit: 'm³/s',
    yMin: 0,
    yMax: 1,
    stateKey: 'Q_flow',
    color: '#5eead4',
    startFromZero: true,
  },
  {
    id: 'v1',
    title: '入口流速',
    symbol: 'v_1(t)',
    yUnit: 'm/s',
    yMin: 0,
    yMax: 5,
    stateKey: 'v1',
    color: '#0d9488',
    startFromZero: true,
  },
]
