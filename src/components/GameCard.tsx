import { Link } from 'react-router-dom'
import '../css/GameCard.css'

interface GameCardProps {
  name: string
  description?: string
  slug: string
}

export default function GameCard({ name, description, slug }: GameCardProps) {
  return (
    <Link to={`/game/${slug}`} className="game-card">
      <div className="game-card-content">
        <h3 className="game-card-title">{name}</h3>
        <p className="game-card-desc">
          {description || `Play ${name} and climb the leaderboard!`}
        </p>
        <div className="game-card-footer">
          <span className="play-label">Play Now</span>
        </div>
      </div>
    </Link>
  )
}
