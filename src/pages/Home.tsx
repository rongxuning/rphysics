import HeroSection from '@/components/Home/HeroSection'
import SceneGrid from '@/components/Home/SceneGrid'

export default function Home() {
  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <HeroSection />
      <SceneGrid />
    </div>
  )
}
