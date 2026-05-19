import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Container from '../../components/Container'
import Button from '../../components/Button'
import { saveScore } from '../../lib/supabase'
import '../../css/Games.css'

export default function Reaction() {
  const [state, setState] = useState<'wait'|'now'|'ready'>('wait')
  const [start, setStart] = useState(0)
  const [reaction, setReaction] = useState<number | null>(null)

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined
    if (state === 'wait') {
      t = setTimeout(() => setState('ready'), 800 + Math.random() * 2000)
    }
    if (state === 'ready') {
      setStart(Date.now())
      setState('now')
    }
    return () => { if (t) clearTimeout(t) }
  }, [state])

  async function handleClick() {
    if (state === 'now') {
      const r = Date.now() - start
      setReaction(r)
      setState('wait')
      await saveScore('reaction', r)
    } else if (state === 'wait') {
      setReaction(null)
      setState('wait')
    }
  }

  return (
    <main className="game-page">
      <Container>
        <div className="game-header">
          <h1 className="game-title">⚡ Reaction Time</h1>
          <p className="game-info">Test how fast your reflexes are</p>
        </div>
        <div className="game-content" style={{ flexDirection: 'column', maxWidth: '400px', margin: '0 auto' }}>
          <div
            className="game-controls"
            onClick={handleClick}
            style={{
              width: '100%',
              textAlign: 'center',
              cursor: 'pointer',
              minHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: state === 'now' ? '#22c55e' : '#3b82f6',
              transition: 'all 0.3s ease',
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#fff',
            }}
          >
            {state === 'now' ? '🔴 CLICK!' : 'Wait for it...'}
          </div>
          {reaction !== null && (
            <div className="control-item" style={{ textAlign: 'center', marginTop: '24px' }}>
              <span className="control-label">Reaction Time</span>
              <div className="control-value">{reaction} ms</div>
            </div>
          )}
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              setReaction(null)
              setState('wait')
            }}
            style={{ marginTop: '24px', width: '100%' }}
          >
            Reset
          </Button>
        </div>
        <Link to="/" className="game-back-link">← Back to Home</Link>
      </Container>
    </main>
  )
}
