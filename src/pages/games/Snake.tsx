import React, { useState, useEffect, useRef } from 'react';
import { saveScore } from '../../lib/supabase';
import Container from '../../components/Container';
import Button from '../../components/Button';

const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const INITIAL_SNAKE = [[10, 10], [10, 11], [10, 12]];
const INITIAL_DIR = [0, -1];
const SPEED = 100;

export default function Snake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [dir, setDir] = useState(INITIAL_DIR);
  const [food, setFood] = useState([5, 5]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  // Use a ref to store the current score. This ensures the game loop (setInterval)
  // always has access to the up-to-date score without needing to restart the interval.
  const scoreRef = useRef(score);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Handle Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (dir[1] !== 1) setDir([0, -1]); break;
        case 'ArrowDown': if (dir[1] !== -1) setDir([0, 1]); break;
        case 'ArrowLeft': if (dir[0] !== 1) setDir([-1, 0]); break;
        case 'ArrowRight': if (dir[0] !== -1) setDir([1, 0]); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dir]);

  // Main Game Loop
  useEffect(() => {
    if (!isStarted || gameOver) return;

    const moveSnake = () => {
      const newSnake = [...snake];
      const head = [newSnake[0][0] + dir[0], newSnake[0][1] + dir[1]];

      // 1. Check Wall Collision
      if (head[0] < 0 || head[0] >= CANVAS_SIZE / GRID_SIZE || head[1] < 0 || head[1] >= CANVAS_SIZE / GRID_SIZE) {
        handleGameOver();
        return;
      }

      // 2. Check Self Collision
      for (const segment of newSnake) {
        if (head[0] === segment[0] && head[1] === segment[1]) {
          handleGameOver();
          return;
        }
      }

      newSnake.unshift(head);

      // 3. Check Food Collision
      if (head[0] === food[0] && head[1] === food[1]) {
        setScore(prev => prev + 10);
        generateFood();
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
    };

    const interval = setInterval(moveSnake, SPEED);
    return () => clearInterval(interval);
  }, [snake, dir, food, gameOver, isStarted]);

  // Draw Game
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw Snake
    ctx.fillStyle = '#4ade80';
    snake.forEach(([x, y]) => ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2));

    // Draw Food
    ctx.fillStyle = '#f87171';
    ctx.fillRect(food[0] * GRID_SIZE, food[1] * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
  }, [snake, food]);

  const generateFood = () => {
    const newFood = [
      Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
      Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE))
    ];
    setFood(newFood);
  };

  const handleGameOver = async () => { // Make it async
    console.log("[Snake] Game Over triggered. Final Score:", scoreRef.current);
    setGameOver(true);
    // Call the utility from Leaderboard.tsx to save the score to Supabase
    await saveScore('snake', scoreRef.current); // Use the ref value to avoid stale closures
  };

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDir(INITIAL_DIR);
    setScore(0);
    setGameOver(false);
    setIsStarted(true);
    generateFood();
  };

  return (
    <main style={{ paddingTop: '100px', color: 'white', textAlign: 'center' }}>
      <Container>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Snake Retro</h1>
          <p style={{ color: '#94a3b8' }}>Score: <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{score}</span></p>
        </div>

        <div style={{ position: 'relative', display: 'inline-block', background: '#0f172a', border: '4px solid #334155', borderRadius: '8px' }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
          />
          
          {(!isStarted || gameOver) && (
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              background: 'rgba(15, 23, 42, 0.9)', display: 'flex', flexDirection: 'column',
              justifyContent: 'center', alignItems: 'center', borderRadius: '4px'
            }}>
              {gameOver && <h2 style={{ color: '#f87171', marginBottom: '20px' }}>GAME OVER</h2>}
              <Button onClick={startGame}>
                {gameOver ? 'Try Again' : 'Start Game'}
              </Button>
            </div>
          )}
        </div>
        
        <p style={{ marginTop: '20px', color: '#64748b', fontSize: '14px' }}>Use Arrow Keys to Move</p>
      </Container>
    </main>
  );
}
