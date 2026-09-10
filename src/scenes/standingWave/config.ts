import type { ParameterDef, FormulaDef, ChartDef } from '../types'

export const parameters: ParameterDef[] = [
  { key: 'L', label: '弦长', symbol: 'L', unit: 'm', min: 0.5, max: 3, step: 0.05, default: 1 },
  { key: 'mu', label: '线密度', symbol: 'μ', unit: 'kg/m', min: 0.001, max: 0.05, step: 0.001, default: 0.01 },
  { key: 'tension', label: '张力', symbol: 'T', unit: 'N', min: 1, max: 100, step: 1, default: 40 },
  { key: 'n_mode', label: '谐频阶数', symbol: 'n', unit: '', min: 1, max: 5, step: 1, default: 2 },
  { key: 'amp', label: '振幅', symbol: 'A', unit: 'm', min: 0.05, max: 0.4, step: 0.01, default: 0.15 },
]

export const formulas: FormulaDef[] = [
  { id: 1, name: '波速', latex: 'c = \\sqrt{T/\\mu}', links: [{ type: 'state', ref: 'wave_speed' }] },
  { id: 2, name: '频率', latex: 'f = \\frac{n}{2L}c', links: [{ type: 'state', ref: 'frequency' }] },
  { id: 3, name: '波长', latex: '\\lambda = \\frac{2L}{n}', links: [{ type: 'state', ref: 'wavelength' }] },
  { id: 4, name: '角频率', latex: '\\omega = 2\\pi f' },
  {
    id: 5,
    name: '驻波位移',
    latex: 'y(x,t) = A\\sin\\!\\left(\\frac{n\\pi x}{L}\\right)\\sin(\\omega t)',
    links: [{ type: 'state', ref: 'y_antinode' }],
  },
  {
    id: 6,
    name: '波腹位移',
    latex: 'y_{\\mathrm{a}} = A\\sin(\\omega t)',
    links: [{ type: 'state', ref: 'y_antinode' }],
  },
]

export const charts: ChartDef[] = [
  {
    id: 'y_antinode',
    title: '波腹位移',
    symbol: 'y_{\\mathrm{a}}(t)',
    yUnit: 'm',
    yMin: -0.5,
    yMax: 0.5,
    stateKey: 'y_antinode',
    color: '#38bdf8',
    startFromZero: false,
  },
  {
    id: 'frequency',
    title: '频率',
    symbol: 'f',
    yUnit: 'Hz',
    yMin: 0,
    yMax: 200,
    stateKey: 'frequency',
    color: '#7dd3fc',
    startFromZero: true,
  },
  {
    id: 'wavelength',
    title: '波长',
    symbol: '\\lambda',
    yUnit: 'm',
    yMin: 0,
    yMax: 6,
    stateKey: 'wavelength',
    color: '#0ea5e9',
    startFromZero: true,
  },
  {
    id: 'wave_speed',
    title: '波速',
    symbol: 'c',
    yUnit: 'm/s',
    yMin: 0,
    yMax: 400,
    stateKey: 'wave_speed',
    color: '#0284c7',
    startFromZero: true,
  },
]
