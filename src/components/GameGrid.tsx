import React from 'react'
import '../css/GameGrid.css'

interface GameGridProps {
  children: React.ReactNode
}

export default function GameGrid({ children }: GameGridProps) {
  return <div className="game-grid">{children}</div>
}

