import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Container from '../../components/Container';
import Button from '../../components/Button';
import { saveScore } from '../../lib/supabase';
import '../../css/Games.css';

const COLS = 10;
const ROWS = 20;
const INITIAL_SPEED = 800;

const TETROMINOES = {
  I: { shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], color: '#22d3ee' },
  J: { shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]], color: '#3b82f6' },
  L: { shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]], color: '#f97316' },
  O: { shape: [[1, 1], [1, 1]], color: '#facc15' },
  S: { shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: '#4ade80' },
  T: { shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: '#a855f7' },
  Z: { shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: '#ef4444' },
};

type PieceKey = keyof typeof TETROMINOES;
const PIECE_KEYS: PieceKey[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

const createEmptyBoard = (): (number | string)[][] => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

export default function Tetris() {
  const [board, setBoard] = useState<(number | string)[][]>(createEmptyBoard());
  const [activePiece, setActivePiece] = useState<{ pos: { x: number; y: number }; shape: number[][]; color: string } | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  
  const scoreRef = useRef(score);
  const boardRef = useRef(board);
  const pieceRef = useRef(activePiece);

  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { pieceRef.current = activePiece; }, [activePiece]);

  const checkCollision = useCallback((pos: { x: number; y: number }, shape: number[][], currentBoard: (number | string)[][]) => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          const boardX = pos.x + x;
          const boardY = pos.y + y;
          if (boardX < 0 || boardX >= COLS || boardY >= ROWS || (boardY >= 0 && currentBoard[boardY][boardX] !== 0)) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const spawnPiece = useCallback((currentBoard: (number | string)[][], currentScore: number) => {
    const key = PIECE_KEYS[Math.floor(Math.random() * PIECE_KEYS.length)];
    const p = TETROMINOES[key];
    const newPiece = {
      pos: { x: Math.floor(COLS / 2) - Math.floor(p.shape[0].length / 2), y: 0 },
      shape: p.shape,
      color: p.color
    };
    if (checkCollision(newPiece.pos, newPiece.shape, currentBoard)) {
      setGameOver(true);
      setIsStarted(false);
      saveScore('tetris', currentScore);
    } else {
      setActivePiece(newPiece);
    }
  }, [checkCollision]);

  const lockPiece = useCallback((piece: { pos: { x: number; y: number }; shape: number[][]; color: string }) => {
    const newBoard = boardRef.current.map(row => [...row]);
    piece.shape.forEach((row: number[], y: number) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const boardY = piece.pos.y + y;
          const boardX = piece.pos.x + x;
          if (boardY >= 0) newBoard[boardY][boardX] = piece.color;
        }
      });
    });

    let linesCleared = 0;
    const clearedBoard = newBoard.reduce((acc: (number | string)[][], row: (number | string)[]) => {
      if (row.every((cell: number | string) => cell !== 0)) {
        linesCleared++;
        acc.unshift(Array(COLS).fill(0));
      } else {
        acc.push(row);
      }
      return acc;
    }, []);

    let newScore = scoreRef.current;
    if (linesCleared > 0) {
      const points = [0, 100, 300, 500, 800];
      newScore += points[linesCleared];
      setScore(newScore);
    }
    setBoard(clearedBoard);
    spawnPiece(clearedBoard, newScore);
  }, [spawnPiece]);

  // Wrap move and rotate in useCallback and ensure they are defined before effects
  const move = useCallback((dirX: number, dirY: number, p: any, currentBoard: any[][]) => {
    if (!p || gameOver) return;
    const nextPos = { x: p.pos.x + dirX, y: p.pos.y + dirY };
    if (!checkCollision(nextPos, p.shape, currentBoard)) {
      setActivePiece({ ...p, pos: nextPos });
    } else if (dirY > 0) {
      lockPiece(p);
    }
  }, [gameOver, checkCollision, lockPiece]);

  const rotate = useCallback((p: any, currentBoard: any[][]) => {
    if (!p || gameOver) return;
    const m = p.shape;
    const rotated = m[0].map((_: any, i: number) => m.map((row: any[]) => row[i]).reverse());
    if (!checkCollision(p.pos, rotated, currentBoard)) {
      setActivePiece({ ...p, shape: rotated });
    }
  }, [gameOver, checkCollision]);

  useEffect(() => {
    if (!isStarted || gameOver) return;
    const interval = setInterval(() => move(0, 1, pieceRef.current, boardRef.current), INITIAL_SPEED);
    return () => clearInterval(interval);
  }, [isStarted, gameOver, move]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isStarted || gameOver) return;
      if (e.key === 'ArrowLeft') move(-1, 0, pieceRef.current, boardRef.current);
      if (e.key === 'ArrowRight') move(1, 0, pieceRef.current, boardRef.current);
      if (e.key === 'ArrowDown') move(0, 1, pieceRef.current, boardRef.current);
      if (e.key === 'ArrowUp') rotate(pieceRef.current, boardRef.current);
      if (e.key === ' ') {
        let p = pieceRef.current;
        if (!p) return;
        let finalY = p.pos.y;
        while (!checkCollision({ x: p.pos.x, y: finalY + 1 }, p.shape, boardRef.current)) {
          finalY++;
        }
        lockPiece({ ...p, pos: { x: p.pos.x, y: finalY } });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, gameOver, move]);

  const start = () => {
    setBoard(createEmptyBoard());
    setScore(0);
    setGameOver(false);
    setIsStarted(true);
    spawnPiece(createEmptyBoard(), 0);
  };

  return (
    <main className="game-page">
     <Container>
        <div className="game-header">
          <h1 className="game-title">🧱 Tetris</h1>
          <p className="game-info">Stack blocks and clear lines!</p>
        </div>
        <div className="game-content" style={{ flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '300px', marginBottom: '1rem', background: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ textAlign: 'left' }}>
              <span style={{ color: '#94a3b8', fontSize: '12px' }}>SCORE</span>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>{score}</div>
            </div>
           <Button onClick={start} size="sm">{isStarted ? 'Restart' : 'Start'}</Button>
          </div>
         <div style={{ position: 'relative', background: '#1e293b', padding: '10px', borderRadius: '8px', border: '4px solid #334155' }}>
            <div style={{ display: 'grid', gridTemplateRows: `repeat(${ROWS}, 20px)`, gridTemplateColumns: `repeat(${COLS}, 20px)`, gap: '1px', background: '#0f172a' }}>
              {board.flatMap((row, y) => row.map((cell, x) => {
                let color = cell || '#1e293b';
                if (activePiece) {
                  const py = y - activePiece.pos.y;
                  const px = x - activePiece.pos.x;
                  if (py >= 0 && py < activePiece.shape.length && px >= 0 && px < activePiece.shape[py].length && activePiece.shape[py][px]) {
                    color = activePiece.color;
                  }
                }
                return <div key={`${x}-${y}`} style={{ width: '20px', height: '20px', backgroundColor: color as string, borderRadius: '2px' }} />;
              }))}
            </div>
            {(!isStarted || gameOver) && (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', zIndex: 10 }}>
                {gameOver && <h2 style={{ color: '#f87171', marginBottom: '20px' }}>GAME OVER</h2>}
                <Button onClick={start}>{gameOver ? 'Try Again' : 'Start Game'}</Button>
              </div>
            )}
          </div>
          <div style={{ marginTop: '20px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>
            <p>Arrows: Move & Rotate | Space: Hard Drop</p>
          </div>
        </div>
        <Link to="/" className="game-back-link">← Back to Home</Link>
      </Container>
    </main>
  );
}
