import { useState, useRef, useEffect } from 'react'
import OllieAvatar from './OllieAvatar.jsx'

const SUGGESTIONS = [
  'Why is the sky blue?',
  'How do birds fly?',
  'Why do we dream?',
  'How do plants grow?',
]

function App() {
  const [idToken, setIdToken] = useState(null)
  const [authError, setAuthError] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [error, setError] = useState(null)
  const scrollRef = useRef(null)
  const signInButtonRef = useRef(null)

  // Set up Google Sign-In once the GIS script has loaded
  useEffect(() => {
    if (idToken) return // already signed in, skip

    function initGoogleSignIn() {
      if (!window.google || !signInButtonRef.current) return

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (response) => {
          setAuthError(null)
          setIdToken(response.credential)
        },
      })

      window.google.accounts.id.renderButton(signInButtonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'signin_with',
      })
    }

    // GIS script loads async — poll briefly until it's ready
    if (window.google) {
      initGoogleSignIn()
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval)
          initGoogleSignIn()
        }
      }, 100)
      return () => clearInterval(interval)
    }
  }, [idToken])

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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      })

      const data = await response.json()

      if (response.status === 401) {
        // Token expired or invalid — bounce back to sign-in
        setIdToken(null)
        setAuthError('Please sign in again to keep chatting with Ollie.')
        setThinking(false)
        return
      }

      if (!response.ok) {
        setError(data.error || 'Ollie is having trouble right now. Try again!')
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

  // --- Sign-in gate ---
  if (!idToken) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <h1>Ask Ollie 🦉</h1>
        </header>
        <main className="chat-card signin-card">
          <OllieAvatar thinking={false} />
          <p className="empty-state">A grown-up needs to sign in with Google before we start chatting!</p>
          {authError && (
            <div className="error-banner" role="alert">{authError}</div>
          )}
          <div ref={signInButtonRef} />
        </main>
      </div>
    )
  }

  // --- Main chat UI ---
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

console.log('CLIENT ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID)

export default App