import type { ParameterDef, FormulaDef, ChartDef } from '../types'

export const parameters: ParameterDef[] = [
  { key: 'lambda_nm', label: '波长', symbol: 'λ', unit: 'nm', min: 400, max: 700, step: 1, default: 550 },
  { key: 'd_mm', label: '缝间距', symbol: 'd', unit: 'mm', min: 0.05, max: 1, step: 0.01, default: 0.2 },
  { key: 'L_m', label: '屏距', symbol: 'L', unit: 'm', min: 0.5, max: 5, step: 0.1, default: 2 },
  { key: 'amp', label: '振幅', symbol: 'A', unit: '', min: 0.1, max: 1, step: 0.05, default: 1 },
]

export const formulas: FormulaDef[] = [
  { id: 1, name: '条纹间距', latex: '\\beta = \\frac{\\lambda L}{d}', links: [{ type: 'state', ref: 'fringe' }] },
  { id: 2, name: '干涉强度', latex: 'I = A\\cos^{2}\\!\\left(\\frac{\\pi d x}{\\lambda L}\\right)', links: [{ type: 'state', ref: 'I_center' }] },
  { id: 3, name: '光程差', latex: '\\delta = d\\sin\\theta \\approx \\frac{d x}{L}' },
]

export const charts: ChartDef[] = [
  {
    id: 'I_center',
    title: '采样点强度',
    symbol: 'I(t)',
    yUnit: '',
    yMin: 0,
    yMax: 1.2,
    stateKey: 'I_center',
    color: '#a78bfa',
    startFromZero: true,
  },
  {
    id: 'fringe',
    title: '条纹间距',
    symbol: '\\beta(t)',
    yUnit: 'mm',
    yMin: 0,
    yMax: 20,
    stateKey: 'fringe',
    color: '#c4b5fd',
    startFromZero: true,
  },
  {
    id: 'phase',
    title: '相位驱动',
    symbol: '\\varphi(t)',
    yUnit: 'rad',
    yMin: -1,
    yMax: 10,
    stateKey: 'phase',
    color: '#818cf8',
    startFromZero: false,
  },
  {
    id: 'wavelength_nm',
    title: '波长',
    symbol: '\\lambda(t)',
    yUnit: 'nm',
    yMin: 400,
    yMax: 700,
    stateKey: 'wavelength_nm',
    color: '#67e8f9',
    startFromZero: false,
  },
]
