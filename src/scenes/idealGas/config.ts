import type { ParameterDef, FormulaDef, ChartDef } from '../types'

export const parameters: ParameterDef[] = [
  { key: 'n', label: '物质的量', symbol: 'n', unit: 'mol', min: 0.1, max: 5, step: 0.1, default: 1 },
  { key: 'T', label: '温度', symbol: 'T', unit: 'K', min: 100, max: 600, step: 5, default: 300 },
  { key: 'V', label: '体积', symbol: 'V', unit: 'm³', min: 0.01, max: 0.2, step: 0.005, default: 0.05 },
]

export const formulas: FormulaDef[] = [
  { id: 1, name: '理想气体状态方程', latex: 'PV = nRT', links: [{ type: 'state', ref: 'P' }] },
  { id: 2, name: '压强', latex: 'P = \\frac{nRT}{V}', links: [{ type: 'state', ref: 'P' }] },
  { id: 3, name: '分子热运动', latex: 'v_{\\mathrm{rms}} \\propto \\sqrt{T}', links: [{ type: 'state', ref: 'v' }] },
]

export const charts: ChartDef[] = [
  {
    id: 'P',
    title: '压强',
    symbol: 'P(t)',
    yUnit: 'Pa',
    yMin: 0,
    yMax: 5e5,
    stateKey: 'P',
    color: '#fb7185',
    startFromZero: true,
  },
  {
    id: 'T',
    title: '温度',
    symbol: 'T(t)',
    yUnit: 'K',
    yMin: 100,
    yMax: 600,
    stateKey: 'T',
    color: '#fda4af',
    startFromZero: false,
  },
  {
    id: 'V',
    title: '体积',
    symbol: 'V(t)',
    yUnit: 'm³',
    yMin: 0,
    yMax: 0.25,
    stateKey: 'V',
    color: '#f9a8d4',
    startFromZero: true,
  },
  {
    id: 'v_thermal',
    title: '热运动特征速度',
    symbol: 'v_{\\mathrm{th}}(t)',
    yUnit: '',
    yMin: 0,
    yMax: 30,
    stateKey: 'v',
    color: '#e11d48',
    startFromZero: true,
  },
]
