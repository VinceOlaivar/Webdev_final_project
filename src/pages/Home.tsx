﻿﻿﻿import GameCard from '../components/GameCard'
import { Link } from 'react-router-dom'
import GameGrid from '../components/GameGrid'
import Container from '../components/Container'
import Button from '../components/Button'
import GlobalChat from '../components/GlobalChat'
import '../css/Home.css'

const games = [
  { slug: 'snake', name: 'Snake', desc: 'Classic arcade game' },
  { slug: 'tetris', name: 'Tetris', desc: 'Classic block puzzle' },
  { slug: '2048', name: '2048', desc: 'Puzzle strategy' },
  { slug: 'typing', name: 'Typing Test', desc: 'Test your speed' },
  { slug: 'memory', name: 'Memory Flip', desc: 'Test your memory' },
  { slug: 'reaction', name: 'Reaction Time', desc: 'Test reflexes' },
  { slug: 'minesweeper', name: 'Minesweeper', desc: 'Classic logic puzzle' },
  { slug: 'breakout', name: 'Breakout', desc: 'Classic brick breaker' },
]

export default function Home() {
  return (
    <main className="home-page">
      <Container>
        <div className="page-header">
          <h1 className="page-title"> Welcome to ArcadeHub</h1>
          <p className="page-subtitle">
            Classic arcade games with global leaderboards. Pick a game and start playing!
          </p>
        </div>

        <GameGrid>
          {games.map((game) => (
            <GameCard
              key={game.slug}
              name={game.name}
              description={game.desc}
              slug={game.slug}
            />
          ))}
        </GameGrid>

        <GlobalChat />

        <div className="home-cta" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Button variant="secondary">
            <Link to="/leaderboard" style={{ textDecoration: 'none', color: 'inherit' }}>
              View Global Leaderboard
            </Link>
          </Button>
          <Button variant="secondary">
            <Link to="/about" style={{ textDecoration: 'none', color: 'inherit' }}>
              About Us
            </Link>
          </Button>
        </div>
      </Container>
    </main>
  )
}
