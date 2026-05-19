import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Container from '../../components/Container';
import Button from '../../components/Button';
import { saveScore } from '../../lib/supabase';
import '../../css/Games.css';

const SYMBOLS = ['🎮', '🕹️', '👾', '🚀', '⭐', '💎', '🔥', '🌈'];

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function Memory() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const initGame = useCallback(() => {
    const deck = [...SYMBOLS, ...SYMBOLS]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(deck);
    setFlippedIndices([]);
    setMoves(0);
    setGameOver(false);
    setIsStarted(true);
  }, []);

  const handleCardClick = (index: number) => {
    if (!isStarted || gameOver || cards[index].isFlipped || cards[index].isMatched || flippedIndices.length === 2) {
      return;
    }

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const currentMoves = moves + 1;
      setMoves(currentMoves);
      const [first, second] = newFlipped;
      
      if (newCards[first].symbol === newCards[second].symbol) {
        newCards[first].isMatched = true;
        newCards[second].isMatched = true;
        setCards(newCards);
        setFlippedIndices([]);

        if (newCards.every(card => card.isMatched)) {
          setGameOver(true);
          saveScore('memory', currentMoves);
        }
      } else {
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[first].isFlipped = false;
          resetCards[second].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <main className="game-page">
      <Container>
        <div className="game-header">
          <h1 className="game-title">🧠 Memory Flip</h1>
          <p className="game-info">Match the pairs in as few moves as possible</p>
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
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>MOVES</span>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{moves}</div>
            </div>
            <Button onClick={initGame} size="sm">{isStarted ? 'Restart' : 'New Game'}</Button>
          </div>

          <div style={{ 
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            width: '400px',
            height: '400px',
            background: '#1e293b',
            padding: '12px',
            borderRadius: '8px',
          }}>
            {cards.map((card, index) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(index)}
                style={{
                  background: card.isFlipped || card.isMatched ? '#0f172a' : '#334155',
                  border: card.isFlipped || card.isMatched ? '2px solid #3b82f6' : '2px solid #475569',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  cursor: card.isMatched ? 'default' : 'pointer',
                  transition: 'all 0.3s ease',
                  transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'none',
                  opacity: card.isMatched ? 0.6 : 1
                }}
              >
                <div style={{ transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'none' }}>
                  {(card.isFlipped || card.isMatched) ? card.symbol : ''}
                </div>
              </div>
            ))}

            {(!isStarted || gameOver) && (
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
                    <h2 style={{ color: '#4ade80', fontSize: '32px', margin: 0 }}>Puzzle Solved!</h2>
                    <p style={{ color: 'white', fontSize: '18px' }}>Moves taken: {moves}</p>
                  </div>
                )}
                <Button onClick={initGame} size="lg">
                  {gameOver ? 'Play Again' : 'Start Game'}
                </Button>
              </div>
            )}
          </div>
        </div>

        <Link to="/" className="game-back-link">← Back to Home</Link>
      </Container>
    </main>
  );
}
