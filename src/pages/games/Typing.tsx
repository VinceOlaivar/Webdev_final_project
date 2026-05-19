import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Container from '../../components/Container'
import Button from '../../components/Button'
import { saveScore } from '../../lib/supabase'
import '../../css/Games.css'

const SENTENCES = [
  'the quick brown fox jumps over the lazy dog',
  'pack my box with five dozen liquor jugs',
  'how vexingly quick daft zebras jump',
  'bright vixens jump dozy fowl quack',
  'sphinx of black quartz judge my vow',
  'the five boxing wizards jump quickly',
  'jackdaws love my big sphinx of quartz',
  'five quacking zebras played queen for jack'
]

export default function Typing() {
  const [targetText, setTargetText] = useState('')
  const [input, setInput] = useState('')
  const [done, setDone] = useState(false)
  const [wpm, setWpm] = useState(0)
  const [isStarted, setIsStarted] = useState(false)
  const startRef = useRef<number | null>(null)

  const initGame = useCallback(() => {
    const randomIdx = Math.floor(Math.random() * SENTENCES.length)
    setTargetText(SENTENCES[randomIdx])
    setInput('')
    setDone(false)
    setWpm(0)
    setIsStarted(true)
    startRef.current = null
  }, [])

  useEffect(() => {
    if (!isStarted || done) return

    if (input.length === 1 && !startRef.current) {
      startRef.current = Date.now()
    }

    if (input === targetText) {
      const endTime = Date.now()
      const startTime = startRef.current || endTime
      const ms = endTime - startTime
      const minutes = ms / 1000 / 60
      const words = targetText.split(' ').length
      const calculatedWpm = Math.round(words / minutes)
      
      setWpm(calculatedWpm)
      setDone(true)
      saveScore('typing', calculatedWpm)
    }
  }, [input, targetText, isStarted, done])

  return (
    <main className="game-page">
      <Container>
        <div className="game-header">
          <h1 className="game-title">⌨️ Typing Speed Test</h1>
          <p className="game-info">Type the sentence as quickly as possible</p>
        </div>
        <div className="game-content" style={{ flexDirection: 'column', maxWidth: '600px', margin: '0 auto' }}>
          {!isStarted ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155' }}>
              <p style={{ color: '#cbd5e1', marginBottom: '24px' }}>Ready to test your speed?</p>
              <Button onClick={initGame} size="lg">Start Test</Button>
            </div>
          ) : (
            <div className="game-controls" style={{ width: '100%', position: 'relative' }}>
              <p style={{ 
                margin: '0 0 16px 0', 
                padding: '20px', 
                background: '#050816', 
                borderRadius: '8px', 
                color: '#60a5fa', 
                fontSize: '20px',
                lineHeight: '1.5',
                fontFamily: 'monospace',
                border: '1px solid #1e293b'
              }}>
                {targetText}
              </p>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoFocus
                placeholder="Start typing here..."
                style={{
                  width: '100%',
                  height: '120px',
                  padding: '12px',
                  background: '#050816',
                  color: '#fff',
                  border: '2px solid #3b82f6',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '18px',
                  marginBottom: '16px',
                  opacity: done ? 0.5 : 1,
                  outline: 'none',
                  resize: 'none'
                }}
                disabled={done}
              />
              {done && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px', 
                  background: 'rgba(34, 197, 94, 0.1)', 
                  borderRadius: '8px', 
                  border: '1px solid #22c55e',
                  marginBottom: '20px'
                }}>
                  <span className="control-label" style={{ color: '#4ade80' }}>Test Complete!</span>
                  <div className="control-value" style={{ fontSize: '48px', color: '#4ade80' }}>{wpm} <span style={{ fontSize: '20px' }}>WPM</span></div>
                  <Button variant="secondary" onClick={initGame} style={{ marginTop: '16px' }}>Try Another Sentence</Button>
                </div>
              )}
            </div>
          )}
        </div>
        <Link to="/" className="game-back-link">← Back to Home</Link>
      </Container>
    </main>
  )
}
