import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Container from '../../components/Container';
import Button from '../../components/Button';
import { saveScore } from '../../lib/supabase';
import '../../css/Games.css';

const SIZE = 10;
const MINES = 15;

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborCount: number;
}

export default function Minesweeper() {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [flagCount, setFlagCount] = useState(0);

  const initGame = useCallback(() => {
    const newGrid: Cell[][] = Array(SIZE).fill(null).map(() => 
      Array(SIZE).fill(null).map(() => ({
        isMine: false, isRevealed: false, isFlagged: false, neighborCount: 0
      }))
    );
    setGrid(newGrid);
    setGameOver(false);
    setWin(false);
    setStartTime(null);
    setTimer(0);
    setFlagCount(0);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    let interval: any;
    if (startTime && !gameOver && !win) {
      interval = setInterval(() => setTimer(Math.floor((Date.now() - startTime) / 1000)), 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, gameOver, win]);

  const placeMines = (initialGrid: Cell[][], startR: number, startC: number) => {
    const newGrid = initialGrid.map(row => row.map(cell => ({ ...cell })));
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      const r = Math.floor(Math.random() * SIZE);
      const c = Math.floor(Math.random() * SIZE);
      // Ensure no mine on first click
      if (!newGrid[r][c].isMine && (r !== startR || c !== startC)) {
        newGrid[r][c].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbors
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!newGrid[r][c].isMine) {
          let count = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              const nr = r + i;
              const nc = c + j;
              if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && newGrid[nr][nc].isMine) count++;
            }
          }
          newGrid[r][c].neighborCount = count;
        }
      }
    }
    return newGrid;
  };

  const reveal = (r: number, c: number) => {
    if (gameOver || win || grid[r][c].isRevealed || grid[r][c].isFlagged) return;
    
    let newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    let effectiveStartTime = startTime;

    if (!effectiveStartTime) {
      effectiveStartTime = Date.now();
      setStartTime(effectiveStartTime);
      newGrid = placeMines(newGrid, r, c);
    }

    if (newGrid[r][c].isMine) {
      setGameOver(true);
      newGrid.forEach(row => row.forEach(cell => cell.isMine && (cell.isRevealed = true)));
    } else {
      const floodFill = (row: number, col: number) => {
        if (row < 0 || row >= SIZE || col < 0 || col >= SIZE || newGrid[row][col].isRevealed) return;
        newGrid[row][col].isRevealed = true;
        if (newGrid[row][col].neighborCount === 0) {
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) floodFill(row + i, col + j);
          }
        }
      };
      floodFill(r, c);
    }

    setGrid(newGrid);

    // Check win
    const unrevealedSafe = newGrid.flat().filter(cell => !cell.isMine && !cell.isRevealed).length;
    if (unrevealedSafe === 0 && !newGrid[r][c].isMine) {
      setWin(true);
      const finalTime = Math.floor((Date.now() - (effectiveStartTime || Date.now())) / 1000);
      saveScore('minesweeper', finalTime);
    }
  };

  const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameOver || win || grid[r][c].isRevealed) return;
    const newGrid = [...grid.map(row => [...row])];
    const wasFlagged = newGrid[r][c].isFlagged;
    newGrid[r][c].isFlagged = !wasFlagged;
    setFlagCount(prev => wasFlagged ? prev - 1 : prev + 1);
    setGrid(newGrid);
  };

  const getNumberColor = (count: number) => {
    const colors = ['', '#60a5fa', '#4ade80', '#f87171', '#a855f7', '#fb923c', '#2dd4bf', '#e879f9', '#94a3b8'];
    return colors[count] || 'white';
  };

  return (
    <main className="game-page">
      <Container>
        <div className="game-header">
          <h1 className="game-title">💣 Minesweeper</h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '10px 0' }}>
            <p className="game-info">🚩 Flags: <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{MINES - flagCount}</span></p>
            <p className="game-info">⏱️ Time: <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{timer}s</span></p>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '8px' }}>
            <span style={{ color: '#f87171', fontWeight: 'bold' }}>Note:</span> Log in to save your time to the leaderboard.
          </p>
        </div>
        <div className="game-content" style={{ flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${SIZE}, 35px)`, 
            gap: '4px', 
            background: '#1e293b', 
            padding: '12px', 
            borderRadius: '12px',
            border: '4px solid #334155',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)'
          }}>
            {grid.map((row, r) => row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                onClick={() => reveal(r, c)}
                onContextMenu={(e) => toggleFlag(e, r, c)}
                style={{
                  width: '35px', height: '35px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
                  background: cell.isRevealed 
                    ? (cell.isMine ? '#f87171' : '#0f172a') 
                    : '#334155',
                  color: getNumberColor(cell.neighborCount),
                  border: cell.isRevealed ? '1px solid #1e293b' : '1px solid #475569',
                  fontSize: '18px',
                  boxShadow: cell.isRevealed ? 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.5)' : 'none',
                  transition: 'background 0.1s'
                }}
              >
                {cell.isRevealed ? (cell.isMine ? '💣' : (cell.neighborCount || '')) : (cell.isFlagged ? '🚩' : '')}
              </div>
            )))}
          </div>
          {(gameOver || win) && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <h2 style={{ color: win ? '#4ade80' : '#f87171' }}>{win ? 'YOU WIN!' : 'BOOM! GAME OVER'}</h2>
              <Button onClick={initGame} style={{ marginTop: '10px' }}>Try Again</Button>
            </div>
          )}
        </div>
        <Link to="/" className="game-back-link">← Back to Home</Link>
      </Container>
    </main>
  );
}