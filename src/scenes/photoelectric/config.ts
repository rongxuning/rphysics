import type { ParameterDef, FormulaDef, ChartDef } from '../types'

export const parameters: ParameterDef[] = [
  {
    key: 'freq_e14',
    label: '光频率',
    symbol: 'f',
    unit: '×10¹⁴ Hz',
    min: 1,
    max: 15,
    step: 0.1,
    default: 7,
  },
  {
    key: 'intensity',
    label: '光强',
    symbol: 'I',
    unit: '',
    min: 0.1,
    max: 5,
    step: 0.1,
    default: 1,
  },
  {
    key: 'work_eV',
    label: '逸出功',
    symbol: 'W',
    unit: 'eV',
    min: 1,
    max: 5,
    step: 0.1,
    default: 2.5,
  },
]

export const formulas: FormulaDef[] = [
  { id: 1, name: '光子能量', latex: 'E = hf', links: [{ type: 'state', ref: 'photon_eV' }] },
  {
    id: 2,
    name: '最大动能',
    latex: 'K_{\\max} = hf - W',
    links: [{ type: 'state', ref: 'K_max' }],
  },
  { id: 3, name: '阈值条件', latex: 'hf > W', links: [{ type: 'state', ref: 'threshold_ratio' }] },
  {
    id: 4,
    name: '发射率',
    latex: 'R \\propto I\\,\\max(K_{\\max},\\,0.1)',
    links: [{ type: 'state', ref: 'rate' }],
  },
]

export const charts: ChartDef[] = [
  {
    id: 'K_max',
    title: '最大动能',
    symbol: 'K_{\\max}(t)',
    yUnit: 'eV',
    yMin: -3,
    yMax: 5,
    stateKey: 'K_max',
    color: '#a3e635',
    startFromZero: false,
  },
  {
    id: 'rate',
    title: '发射率',
    symbol: 'R(t)',
    yUnit: '',
    yMin: 0,
    yMax: 20,
    stateKey: 'rate',
    color: '#84cc16',
    startFromZero: true,
  },
  {
    id: 'photon_eV',
    title: '光子能量',
    symbol: 'E(t)',
    yUnit: 'eV',
    yMin: 0,
    yMax: 8,
    stateKey: 'photon_eV',
    color: '#bef264',
    startFromZero: true,
  },
  {
    id: 'threshold_ratio',
    title: '阈值比',
    symbol: 'E/W',
    yUnit: '',
    yMin: 0,
    yMax: 4,
    stateKey: 'threshold_ratio',
    color: '#65a30d',
    startFromZero: true,
  },
]
