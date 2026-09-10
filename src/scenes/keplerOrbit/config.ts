import type { ParameterDef, FormulaDef, ChartDef } from '../types'

export const parameters: ParameterDef[] = [
  { key: 'M_solar', label: '中心质量', symbol: 'M', unit: 'M☉', min: 0.5, max: 5, step: 0.1, default: 1 },
  { key: 'a_AU', label: '半长轴', symbol: 'a', unit: 'AU', min: 0.4, max: 3, step: 0.1, default: 1 },
  { key: 'e', label: '离心率', symbol: 'e', unit: '', min: 0, max: 0.7, step: 0.01, default: 0.2 },
]

export const formulas: FormulaDef[] = [
  { id: 1, name: '开普勒第三定律', latex: 'T^{2} \\propto a^{3}/M', links: [{ type: 'state', ref: 'period' }] },
  { id: 2, name: '轨道半径', latex: 'r = \\frac{a(1-e^{2})}{1+e\\cos\\theta}', links: [{ type: 'state', ref: 'r' }] },
  { id: 3, name: '活力公式', latex: 'v = \\sqrt{GM\\!\\left(\\frac{2}{r}-\\frac{1}{a}\\right)}', links: [{ type: 'state', ref: 'speed' }] },
  { id: 4, name: '真近点角速率', latex: '\\dot{\\theta} = n\\frac{(1+e\\cos\\theta)^{2}}{(1-e^{2})^{3/2}}', links: [{ type: 'state', ref: 'true_anomaly' }] },
]

export const charts: ChartDef[] = [
  {
    id: 'r',
    title: '日心距',
    symbol: 'r(t)',
    yUnit: 'AU',
    yMin: 0,
    yMax: 5,
    stateKey: 'r',
    color: '#818cf8',
    startFromZero: true,
  },
  {
    id: 'speed',
    title: '轨道速度',
    symbol: 'v(t)',
    yUnit: 'AU/yr',
    yMin: 0,
    yMax: 15,
    stateKey: 'speed',
    color: '#a5b4fc',
    startFromZero: true,
  },
  {
    id: 'true_anomaly',
    title: '真近点角',
    symbol: '\\theta(t)',
    yUnit: 'rad',
    yMin: -3.5,
    yMax: 10,
    stateKey: 'true_anomaly',
    color: '#6366f1',
    startFromZero: false,
  },
  {
    id: 'period',
    title: '轨道周期',
    symbol: 'T',
    yUnit: 'yr',
    yMin: 0,
    yMax: 10,
    stateKey: 'period',
    color: '#4f46e5',
    startFromZero: true,
  },
]
