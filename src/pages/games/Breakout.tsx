import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../../components/Container';
import Button from '../../components/Button';
import { saveScore } from '../../lib/supabase';
import '../../css/Games.css';

export default function Breakout() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const scoreRef = useRef(0);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const startGame = () => {
    setScore(0);
    setGameOver(false);
    setIsStarted(true);
  };

  useEffect(() => {
    if (!isStarted || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    
    // Game constants
    const ballRadius = 8;
    const paddleHeight = 10;
    const paddleWidth = 75;
    const brickRowCount = 5;
    const brickColumnCount = 5;
    const brickWidth = 70;
    const brickHeight = 20;
    const brickPadding = 10;
    const brickOffsetTop = 30;
    const brickOffsetLeft = 15;

    let x = canvas.width / 2;
    let y = canvas.height - 30;
    let dx = 3;
    let dy = -3;
    let paddleX = (canvas.width - paddleWidth) / 2;
    let rightPressed = false;
    let leftPressed = false;

    const bricks: any[] = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }

    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
      else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
    };
    const keyUpHandler = (e: KeyboardEvent) => {
      if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
      else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
    };

    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);

    function collisionDetection() {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          const b = bricks[c][r];
          if (b.status === 1) {
            if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
              dy = -dy;
              b.status = 0;
              setScore(s => s + 10);
              if (bricks.every(col => col.every((row: any) => row.status === 0))) {
                setGameOver(true);
                saveScore('breakout', scoreRef.current + 10);
              }
            }
          }
        }
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      
      // Draw Bricks
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          if (bricks[c][r].status === 1) {
            const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
            const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx!.fillStyle = "#3b82f6";
            ctx!.fillRect(brickX, brickY, brickWidth, brickHeight);
          }
        }
      }

      // Draw Ball
      ctx!.beginPath();
      ctx!.arc(x, y, ballRadius, 0, Math.PI * 2);
      ctx!.fillStyle = "#f87171";
      ctx!.fill();
      ctx!.closePath();

      // Draw Paddle
      ctx!.fillStyle = "#4ade80";
      ctx!.fillRect(paddleX, canvas!.height - paddleHeight, paddleWidth, paddleHeight);

      collisionDetection();

      if (x + dx > canvas!.width - ballRadius || x + dx < ballRadius) dx = -dx;
      if (y + dy < ballRadius) dy = -dy;
      else if (y + dy > canvas!.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) dy = -dy;
        else {
          setGameOver(true);
          saveScore('breakout', scoreRef.current);
          return;
        }
      }

      if (rightPressed && paddleX < canvas!.width - paddleWidth) paddleX += 7;
      else if (leftPressed && paddleX > 0) paddleX -= 7;

      x += dx;
      y += dy;
      animationFrameId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      document.removeEventListener("keydown", keyDownHandler);
      document.removeEventListener("keyup", keyUpHandler);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isStarted, gameOver]);

  return (
    <main className="game-page">
      <Container>
        <div className="game-header">
          <h1 className="game-title">🎾 Breakout</h1>
          <p className="game-info">Score: <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{score}</span></p>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '8px' }}>
            <span style={{ color: '#f87171', fontWeight: 'bold' }}>Note:</span> Log in to save your score to the leaderboard.
          </p>
        </div>
        <div className="game-content" style={{ flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', background: '#0f172a', border: '4px solid #334155', borderRadius: '8px' }}>
            <canvas ref={canvasRef} width="400" height="400" />
            {(!isStarted || gameOver) && (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {gameOver && <h2 style={{ color: '#f87171', marginBottom: '20px' }}>GAME OVER</h2>}
                <Button onClick={startGame}>{gameOver ? 'Try Again' : 'Start Game'}</Button>
              </div>
            )}
          </div>
        </div>
        <Link to="/" className="game-back-link">← Back to Home</Link>
      </Container>
    </main>
  );
}