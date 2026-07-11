import { useState, useRef, useEffect } from 'react'
import OllieAvatar from './OllieAvatar.jsx'

const SUGGESTIONS = [
  'Why is the sky blue?',
  'How do birds fly?',
  'Why do we dream?',
  'How do plants grow?',
]

function App() {
  const [messages, setMessages] = useState([]) // { role: 'user' | 'assistant', content: string }
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [error, setError] = useState(null)
  const scrollRef = useRef(null)

  // Auto-scroll to newest message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  async function sendMessage(text) {
    const trimmed = text.trim()
    if (!trimmed || thinking) return

    setError(null)
    const newMessages = [...messages, { role: 'user', content: trimmed }]
    setMessages(newMessages)
    setInput('')
    setThinking(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Ollie is having trouble right now. Try again!")
        setThinking(false)
        return
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setError("Ollie couldn't hear that. Check your connection and try again!")
    } finally {
      setThinking(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    sendMessage(input)
  }

  function handleChipClick(question) {
    sendMessage(question)
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Ask Ollie 🦉</h1>
      </header>

      <main className="chat-card">
        <div className="ollie-header">
          <OllieAvatar thinking={thinking} />
        </div>

        <div className="messages">
          {messages.length === 0 && (
            <p className="empty-state">Hi! I'm Ollie. Ask me anything — try one below, or type your own question!</p>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`bubble-row ${m.role === 'user' ? 'bubble-row-user' : 'bubble-row-ollie'}`}
            >
              {m.role === 'assistant' && <span className="bubble-label">Ollie</span>}
              <div className={`bubble ${m.role === 'user' ? 'bubble-user' : 'bubble-ollie'}`}>
                {m.content}
              </div>
            </div>
          ))}

          {thinking && (
            <div className="bubble-row bubble-row-ollie">
              <span className="bubble-label">Ollie</span>
              <div className="bubble bubble-ollie bubble-thinking">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          )}

          {error && (
            <div className="error-banner" role="alert">
              {error}
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {messages.length === 0 && (
          <div className="chips">
            {SUGGESTIONS.map(q => (
              <button key={q} className="chip" onClick={() => handleChipClick(q)}>
                {q}
              </button>
            ))}
          </div>
        )}

        <form className="input-row" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your question..."
            aria-label="Type your question"
            disabled={thinking}
          />
          <button type="submit" aria-label="Send question" disabled={thinking || !input.trim()}>
            ➤
          </button>
        </form>
      </main>
    </div>
  )
}

export default App