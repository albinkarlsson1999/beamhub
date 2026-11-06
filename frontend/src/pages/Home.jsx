import { Play, Tv, Clapperboard, Library, Settings } from 'lucide-react'
import SourceCard from '../components/SourceCard'

const sources = [
  { title: 'YouTube', description: 'Search and play YouTube videos.', icon: Play, accent: '#ff4d4d', to: '/youtube' },
  { title: 'SVT Play', description: 'Search and play SVT content.', icon: Tv, accent: '#3ddc97', to: '/svt' },
  { title: 'Movies', description: 'Local movie library.', icon: Clapperboard, accent: '#ffb84d', disabled: true },
  { title: 'Series', description: 'Local series library.', icon: Library, accent: '#b48cff', disabled: true },
  { title: 'IPTV', description: 'Watch IPTV streams.', icon: Tv, accent: '#4d79ff', disabled: true },
  { title: 'Settings', description: 'Configure BeamHub.', icon: Settings, accent: 'gray', to: '/settings' },
]

function Home() {
  return (
    <div className="sources-grid">
      {sources.map((s) => (
        <SourceCard key={s.title} {...s} />
      ))}
    </div>
  )
}

export default Home