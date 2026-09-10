import type { ParameterDef, FormulaDef, ChartDef } from '../types'

export const parameters: ParameterDef[] = [
  { key: 'R', label: '电阻', symbol: 'R', unit: 'Ω', min: 1, max: 50, step: 0.5, default: 5 },
  { key: 'L', label: '电感', symbol: 'L', unit: 'H', min: 0.1, max: 5, step: 0.1, default: 1 },
  { key: 'C', label: '电容', symbol: 'C', unit: 'F', min: 0.01, max: 1, step: 0.01, default: 0.1 },
  { key: 'V0', label: '初始电压', symbol: 'V₀', unit: 'V', min: 1, max: 20, step: 0.5, default: 10 },
]

export const formulas: FormulaDef[] = [
  { id: 1, name: '电荷变化率', latex: '\\frac{dQ}{dt} = I', links: [{ type: 'state', ref: 'I' }] },
  { id: 2, name: '电流变化率', latex: '\\frac{dI}{dt} = -\\frac{R}{L}I - \\frac{Q}{LC}', links: [{ type: 'state', ref: 'a' }] },
  { id: 3, name: '固有角频率', latex: '\\omega_0 = \\frac{1}{\\sqrt{LC}}', links: [{ type: 'state', ref: 'omega0' }] },
  { id: 4, name: '阻尼比', latex: '\\zeta = \\frac{R}{2}\\sqrt{\\frac{C}{L}}' },
  { id: 5, name: '总能量', latex: 'E = \\tfrac{1}{2}\\frac{Q^{2}}{C} + \\tfrac{1}{2}LI^{2}', links: [{ type: 'state', ref: 'energy' }] },
]

export const charts: ChartDef[] = [
  {
    id: 'Q',
    title: '电容电荷',
    symbol: 'Q(t)',
    yUnit: 'C',
    yMin: -2,
    yMax: 2,
    stateKey: 'Q',
    color: '#fb923c',
    startFromZero: false,
  },
  {
    id: 'I',
    title: '电流',
    symbol: 'I(t)',
    yUnit: 'A',
    yMin: -5,
    yMax: 5,
    stateKey: 'I',
    color: '#fdba74',
    startFromZero: false,
  },
  {
    id: 'energy',
    title: '总能量',
    symbol: 'E(t)',
    yUnit: 'J',
    yMin: 0,
    yMax: 20,
    stateKey: 'energy',
    color: '#f97316',
    startFromZero: true,
  },
  {
    id: 'omega0',
    title: '固有角频率',
    symbol: '\\omega_0',
    yUnit: 'rad/s',
    yMin: 0,
    yMax: 20,
    stateKey: 'omega0',
    color: '#ea580c',
    startFromZero: true,
  },
]
