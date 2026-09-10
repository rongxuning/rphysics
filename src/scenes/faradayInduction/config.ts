import type { ParameterDef, FormulaDef, ChartDef } from '../types'

export const parameters: ParameterDef[] = [
  { key: 'B', label: '磁感应强度', symbol: 'B', unit: 'T', min: 0.1, max: 2, step: 0.05, default: 0.5 },
  { key: 'N_turns', label: '匝数', symbol: 'N', unit: '', min: 1, max: 50, step: 1, default: 10 },
  { key: 'area', label: '线圈面积', symbol: 'A', unit: 'm²', min: 0.01, max: 0.2, step: 0.005, default: 0.05 },
  { key: 'omega', label: '角速度', symbol: 'ω', unit: 'rad/s', min: 0.5, max: 8, step: 0.1, default: 2 },
]

export const formulas: FormulaDef[] = [
  { id: 1, name: '磁通量', latex: '\\Phi = NBA\\cos(\\omega t)', links: [{ type: 'state', ref: 'flux' }] },
  { id: 2, name: '感应电动势', latex: '\\mathcal{E} = NBA\\omega\\sin(\\omega t)', links: [{ type: 'state', ref: 'epsilon' }] },
  { id: 3, name: '法拉第定律', latex: '\\mathcal{E} = -N\\frac{d\\Phi}{dt}' },
  { id: 4, name: '电动势变化率', latex: '\\frac{d\\mathcal{E}}{dt} = NBA\\omega^{2}\\cos(\\omega t)', links: [{ type: 'state', ref: 'a' }] },
]

export const charts: ChartDef[] = [
  {
    id: 'flux',
    title: '磁通量',
    symbol: '\\Phi(t)',
    yUnit: 'Wb',
    yMin: -2,
    yMax: 2,
    stateKey: 'flux',
    color: '#fbbf24',
    startFromZero: false,
  },
  {
    id: 'epsilon',
    title: '感应电动势',
    symbol: '\\mathcal{E}(t)',
    yUnit: 'V',
    yMin: -5,
    yMax: 5,
    stateKey: 'epsilon',
    color: '#f59e0b',
    startFromZero: false,
  },
  {
    id: 'B_eff',
    title: '磁感应强度',
    symbol: 'B(t)',
    yUnit: 'T',
    yMin: 0,
    yMax: 2,
    stateKey: 'B_eff',
    color: '#fcd34d',
    startFromZero: true,
  },
  {
    id: 'a',
    title: '电动势变化率',
    symbol: 'd\\mathcal{E}/dt',
    yUnit: 'V/s',
    yMin: -20,
    yMax: 20,
    stateKey: 'a',
    color: '#fb923c',
    startFromZero: false,
  },
]
