import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { useStore } from './store/useStore'
import { ambientEngine } from './audio/ambient'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

// 首次任意点击/触摸/键盘事件解锁 audio context
const unlockOnFirstGesture = () => {
  const unlock = async () => {
    await ambientEngine.unlock()
    useStore.getState().unlockAudio()
    document.removeEventListener('click', unlock)
    document.removeEventListener('keydown', unlock)
    document.removeEventListener('touchstart', unlock)
  }
  document.addEventListener('click', unlock, { once: true })
  document.addEventListener('keydown', unlock, { once: true })
  document.addEventListener('touchstart', unlock, { once: true })
}
unlockOnFirstGesture()
