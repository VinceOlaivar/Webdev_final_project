import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Container from '../../components/Container';
import Button from '../../components/Button';
import { saveScore } from '../../lib/supabase';
import '../../css/Games.css';

type Grid = number[][];

const SIZE = 4;
const EMPTY_GRID: Grid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));

export default function Game2048() {
  const [grid, setGrid] = useState<Grid>(EMPTY_GRID);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Initialize game
  const initGame = useCallback(() => {
    let newGrid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  }, []);

  function addRandomTile(currentGrid: Grid): Grid {
    const emptyTiles = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (currentGrid[r][c] === 0) emptyTiles.push({ r, c });
      }
    }
    if (emptyTiles.length === 0) return currentGrid;
    const { r, c } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    const newGrid = currentGrid.map(row => [...row]);
    newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
  }

  const checkGameOver = (currentGrid: Grid) => {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (currentGrid[r][c] === 0) return false;
        if (c < SIZE - 1 && currentGrid[r][c] === currentGrid[r][c + 1]) return false;
        if (r < SIZE - 1 && currentGrid[r][c] === currentGrid[r + 1][c]) return false;
      }
    }
    return true;
  };

  const slide = (row: number[]) => {
    const filteredRow = row.filter(num => num !== 0);
    const missing = SIZE - filteredRow.length;
    const zeros = Array(missing).fill(0);
    return filteredRow.concat(zeros);
  };

  const combine = (row: number[]) => {
    let newScore = 0;
    for (let i = 0; i < SIZE - 1; i++) {
      if (row[i] !== 0 && row[i] === row[i + 1]) {
        row[i] = row[i] * 2;
        row[i + 1] = 0;
        newScore += row[i];
      }
    }
    return { row, addedScore: newScore };
  };

  const move = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameOver) return;

    let newGrid = grid.map(row => [...row]);
    let totalAddedScore = 0;
    let moved = false;

    if (direction === 'LEFT' || direction === 'RIGHT') {
      for (let r = 0; r < SIZE; r++) {
        let row = newGrid[r];
        if (direction === 'RIGHT') row.reverse();
        
        let slided = slide(row);
        const combined = combine(slided);
        let finalRow = slide(combined.row);
        
        if (direction === 'RIGHT') finalRow.reverse();
        if (JSON.stringify(newGrid[r]) !== JSON.stringify(finalRow)) moved = true;
        
        newGrid[r] = finalRow;
        totalAddedScore += combined.addedScore;
      }
    } else {
      for (let c = 0; c < SIZE; c++) {
        let col = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
        if (direction === 'DOWN') col.reverse();

        let slided = slide(col);
        const combined = combine(slided);
        let finalCol = slide(combined.row);

        if (direction === 'DOWN') finalCol.reverse();
        
        for (let r = 0; r < SIZE; r++) {
          if (newGrid[r][c] !== finalCol[r]) moved = true;
          newGrid[r][c] = finalCol[r];
        }
        totalAddedScore += combined.addedScore;
      }
    }

    if (moved) {
      const gridWithRandom = addRandomTile(newGrid);
      setGrid(gridWithRandom);
      setScore(s => s + totalAddedScore);
      
      if (checkGameOver(gridWithRandom)) {
        setGameOver(true);
        saveScore('2048', score + totalAddedScore);
      }
    }
  }, [grid, gameOver, score]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;
      if (e.key === 'ArrowUp') move('UP');
      if (e.key === 'ArrowDown') move('DOWN');
      if (e.key === 'ArrowLeft') move('LEFT');
      if (e.key === 'ArrowRight') move('RIGHT');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move, gameStarted, gameOver]);

  const getTileColor = (value: number) => {
    const colors: Record<number, string> = {
      0: '#334155',
      2: '#eee4da',
      4: '#ede0c8',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc850',
      1024: '#edc53f',
      2048: '#edc22e',
    };
    return colors[value] || '#3c3a32';
  };

  return (
    <main className="game-page">
      <Container>
        <div className="game-header">
          <h1 className="game-title">🎮 2048</h1>
          <p className="game-info">Join the numbers and get to the <strong>2048 tile!</strong></p>
        </div>

        <div className="game-content" style={{ flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            width: '100%', 
            maxWidth: '400px', 
            marginBottom: '1rem',
            background: '#1e293b',
            padding: '1rem',
            borderRadius: '8px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>SCORE</span>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{score}</div>
            </div>
            <Button onClick={initGame} size="sm">New Game</Button>
          </div>

          <div style={{ 
            position: 'relative',
            background: '#1e293b', 
            padding: '12px', 
            borderRadius: '8px',
            width: '400px',
            height: '400px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(4, 1fr)',
            gap: '12px'
          }}>
            {grid.map((row, r) => 
              row.map((value, c) => (
                <div 
                  key={`${r}-${c}`}
                  style={{
                    background: getTileColor(value),
                    color: value <= 4 ? '#776e65' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: value >= 100 ? '24px' : '32px',
                    fontWeight: 'bold',
                    borderRadius: '4px',
                    transition: 'all 0.1s ease-in-out'
                  }}
                >
                  {value !== 0 ? value : ''}
                </div>
              ))
            )}

            {(!gameStarted || gameOver) && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                zIndex: 10
              }}>
                {gameOver && (
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ color: '#f87171', fontSize: '48px', margin: 0 }}>Game Over!</h2>
                    <p style={{ color: 'white', fontSize: '18px' }}>Final Score: {score}</p>
                  </div>
                )}
                <Button onClick={initGame} size="lg">
                  {gameOver ? 'Try Again' : 'Start Game'}
                </Button>
              </div>
            )}
          </div>
          <p style={{ marginTop: '1.5rem', color: '#64748b' }}>Use arrow keys to move tiles</p>
        </div>

        <Link to="/" className="game-back-link">← Back to Home</Link>
      </Container>
    </main>
  )
}
