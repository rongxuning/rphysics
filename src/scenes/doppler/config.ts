import type { ParameterDef, FormulaDef, ChartDef } from '../types'

export const parameters: ParameterDef[] = [
  { key: 'f0', label: '源频率', symbol: 'f₀', unit: 'Hz', min: 100, max: 1000, step: 10, default: 440 },
  { key: 'vs', label: '声源速度', symbol: 'vₛ', unit: 'm/s', min: -50, max: 50, step: 1, default: 20 },
  { key: 'vo', label: '观察者速度', symbol: 'vₒ', unit: 'm/s', min: -50, max: 50, step: 1, default: 0 },
  { key: 'v_sound', label: '声速', symbol: 'v', unit: 'm/s', min: 300, max: 400, step: 5, default: 340 },
]

export const formulas: FormulaDef[] = [
  { id: 1, name: '观察者频率', latex: 'f\' = f_0\\frac{v+v_o}{v-v_s}', links: [{ type: 'state', ref: 'f_obs' }] },
  { id: 2, name: '波长', latex: '\\lambda = \\frac{v}{f_0}', links: [{ type: 'state', ref: 'wavelength' }] },
  { id: 3, name: '接近因子', latex: '\\frac{f\'}{f_0}', links: [{ type: 'state', ref: 'approach_factor' }] },
  { id: 4, name: '符号约定', latex: 'v_s>0\\;\\text{声源朝向观察者}' },
]

export const charts: ChartDef[] = [
  {
    id: 'f_obs',
    title: '观察者频率',
    symbol: "f'(t)",
    yUnit: 'Hz',
    yMin: 0,
    yMax: 1200,
    stateKey: 'f_obs',
    color: '#f472b6',
    startFromZero: true,
  },
  {
    id: 'wavelength',
    title: '波长',
    symbol: '\\lambda(t)',
    yUnit: 'm',
    yMin: 0,
    yMax: 5,
    stateKey: 'wavelength',
    color: '#f9a8d4',
    startFromZero: true,
  },
  {
    id: 'approach_factor',
    title: '接近因子',
    symbol: "f'/f_0",
    yUnit: '',
    yMin: 0,
    yMax: 2,
    stateKey: 'approach_factor',
    color: '#ec4899',
    startFromZero: true,
  },
  {
    id: 'f0',
    title: '源频率',
    symbol: 'f_0',
    yUnit: 'Hz',
    yMin: 100,
    yMax: 1000,
    stateKey: 'f0',
    color: '#db2777',
    startFromZero: false,
  },
]
