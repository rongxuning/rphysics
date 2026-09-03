/**
 * Procedural ambient audio system
 * 用 Web Audio API 合成 ambient 音效，无需外部音频文件
 * 每位物理学家有独立的音色 / 频率组合
 */

export type AmbientTrack = {
  id: string
  frequency: number  // 基频 Hz
  harmonics: number[] // 谐波频率比
  filterFreq: number  // 低通滤波 Hz
  filterQ: number     // 滤波 Q 值
  lfoFreq: number     // 慢速调制 Hz
  lfoDepth: number    // 调制深度 0-1
}

export const TRACKS: Record<string, AmbientTrack> = {
  galileo: {
    id: 'galileo',
    frequency: 196, // G3
    harmonics: [1, 1.5, 2],
    filterFreq: 1200,
    filterQ: 1.5,
    lfoFreq: 0.15,
    lfoDepth: 0.3,
  },
  newton: {
    id: 'newton',
    frequency: 220, // A3
    harmonics: [1, 1.25, 2, 3],
    filterFreq: 1500,
    filterQ: 2,
    lfoFreq: 0.1,
    lfoDepth: 0.25,
  },
  archimedes: {
    id: 'archimedes',
    frequency: 174, // F3
    harmonics: [1, 2, 3, 4],
    filterFreq: 2000,
    filterQ: 1,
    lfoFreq: 0.2,
    lfoDepth: 0.4,
  },
  joule: {
    id: 'joule',
    frequency: 110, // A2
    harmonics: [1, 1.5, 2, 2.5],
    filterFreq: 800,
    filterQ: 3,
    lfoFreq: 0.08,
    lfoDepth: 0.5,
  },
  maxwell: {
    id: 'maxwell',
    frequency: 261, // C4
    harmonics: [1, 1.33, 1.5, 2],
    filterFreq: 2500,
    filterQ: 4,
    lfoFreq: 0.3,
    lfoDepth: 0.5,
  },
  einstein: {
    id: 'einstein',
    frequency: 146, // D3
    harmonics: [1, 1.5, 2, 3, 4],
    filterFreq: 1800,
    filterQ: 2.5,
    lfoFreq: 0.12,
    lfoDepth: 0.35,
  },
}

class AmbientEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private currentNodes: {
    oscillators: OscillatorNode[]
    gains: GainNode[]
    lfo: OscillatorNode | null
    lfoGain: GainNode | null
  } | null = null
  private currentTrack: string | null = null
  private enabled = true
  private targetVolume = 0.15

  /** 首次调用需要用户手势（浏览器 autoplay policy） */
  async unlock() {
    if (this.ctx) return
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 0
    this.masterGain.connect(this.ctx.destination)
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
    if (!this.ctx || !this.masterGain) return
    if (enabled) {
      this.masterGain.gain.linearRampToValueAtTime(
        this.targetVolume,
        this.ctx.currentTime + 0.5
      )
    } else {
      this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5)
    }
  }

  /** 切换到指定 track（带 cross-fade） */
  async switchTo(trackId: string) {
    if (this.currentTrack === trackId) return
    if (!this.ctx || !this.masterGain) {
      await this.unlock()
    }
    if (!this.ctx || !this.masterGain) return
    if (this.ctx.state === 'suspended') await this.ctx.resume()

    const track = TRACKS[trackId]
    if (!track) return

    // 淡出当前
    if (this.currentNodes) {
      this.currentNodes.gains.forEach((g) => {
        g.gain.linearRampToValueAtTime(0, this.ctx!.currentTime + 0.8)
      })
      const oldNodes = this.currentNodes
      setTimeout(() => {
        oldNodes.oscillators.forEach((o) => o.stop())
        oldNodes.lfo?.stop()
      }, 1000)
    }

    // 创建新 track
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = track.filterFreq
    filter.Q.value = track.filterQ

    const trackGain = this.ctx.createGain()
    trackGain.gain.value = 0
    trackGain.connect(filter)
    filter.connect(this.masterGain)

    // 淡入
    trackGain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 0.8)

    // 多个谐波
    const oscillators: OscillatorNode[] = []
    const gains: GainNode[] = []
    track.harmonics.forEach((ratio, i) => {
      const osc = this.ctx!.createOscillator()
      const gain = this.ctx!.createGain()
      osc.type = i === 0 ? 'sine' : 'sine'
      osc.frequency.value = track.frequency * ratio
      // 谐波振幅递减
      gain.gain.value = 1 / (i + 1) ** 1.5
      osc.connect(gain)
      gain.connect(trackGain)
      osc.start()
      oscillators.push(osc)
      gains.push(gain)
    })

    // LFO 调制滤波频率
    const lfo = this.ctx.createOscillator()
    const lfoGain = this.ctx.createGain()
    lfo.frequency.value = track.lfoFreq
    lfoGain.gain.value = track.filterFreq * track.lfoDepth
    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)
    lfo.start()

    this.currentNodes = { oscillators, gains, lfo, lfoGain }
    this.currentTrack = trackId
  }

  /** 立即停止所有音频（导航到场景页时调用） */
  stop() {
    if (!this.ctx || !this.masterGain) return
    this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3)
    setTimeout(() => {
      this.currentNodes?.oscillators.forEach((o) => o.stop())
      this.currentNodes?.lfo?.stop()
      this.currentNodes = null
      this.currentTrack = null
    }, 400)
  }
}

export const ambientEngine = new AmbientEngine()
