import { useState, useRef, useEffect } from "react";
import OllieAvatar from "./OllieAvatar.jsx";
import Sidebar from "./Sidebar.jsx";
import ProfileMenu from "./ProfileMenu.jsx";

const SUGGESTIONS = [
  "Why is the sky blue?",
  "How do birds fly?",
  "Why do we dream?",
  "How do plants grow?",
];

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function sessionsKey(email) {
  return `askOllie_sessions_${email}`;
}

function makeSessionTitle(firstUserMessage) {
  if (!firstUserMessage) return "New chat";
  const trimmed = firstUserMessage.trim();
  return trimmed.length > 40 ? trimmed.slice(0, 40) + "…" : trimmed;
}

function createEmptySession() {
  return {
    id: crypto.randomUUID(),
    title: "New chat",
    messages: [],
    updatedAt: Date.now(),
  };
}

function BackgroundDecoration() {
  return (
    <div className="bg-decoration" aria-hidden="true">
      <span className="cloud cloud-1">☁️</span>
      <span className="cloud cloud-2">☁️</span>
      <span className="cloud cloud-3">☁️</span>
      <span className="sparkle sparkle-1">✨</span>
      <span className="sparkle sparkle-2">✨</span>
      <span className="sparkle sparkle-3">✨</span>
      <span className="butterfly">🦋</span>
    </div>
  );
}

function App() {
  const [idToken, setIdToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef = useRef(null);
  const scrollRef = useRef(null);
  const signInButtonRef = useRef(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
  const messages = activeSession?.messages || [];

  // --- Google Sign-In setup ---
  useEffect(() => {
    if (idToken) return;

    function initGoogleSignIn() {
      if (!window.google || !signInButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (response) => {
          setAuthError(null);
          const payload = decodeToken(response.credential);
          setProfile(payload);
          setIdToken(response.credential);
        },
      });
      window.google.accounts.id.renderButton(signInButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "signin_with",
      });
    }

    if (window.google) {
      initGoogleSignIn();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          initGoogleSignIn();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [idToken]);

  // --- Load sessions once signed in ---
  useEffect(() => {
    if (!profile?.email) return;
    try {
      const saved = localStorage.getItem(sessionsKey(profile.email));
      const loaded = saved ? JSON.parse(saved) : [];
      if (loaded.length > 0) {
        setSessions(loaded);
        setActiveSessionId(loaded[0].id);
      } else {
        const fresh = createEmptySession();
        setSessions([fresh]);
        setActiveSessionId(fresh.id);
      }
    } catch {
      const fresh = createEmptySession();
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
    }
  }, [profile?.email]);

  // --- Save sessions on every change ---
  useEffect(() => {
    if (!profile?.email || sessions.length === 0) return;
    try {
      localStorage.setItem(
        sessionsKey(profile.email),
        JSON.stringify(sessions),
      );
    } catch {
      // storage full/unavailable — fail silently
    }
  }, [profile?.email, sessions]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  function updateActiveSession(updater) {
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? updater(s) : s)),
    );
  }

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || thinking || !activeSessionId) return;

    setError(null);
    const newMessages = [...messages, { role: "user", content: trimmed }];

    updateActiveSession((s) => ({
      ...s,
      messages: newMessages,
      title: s.messages.length === 0 ? makeSessionTitle(trimmed) : s.title,
      updatedAt: Date.now(),
    }));
    setInput("");
    setThinking(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();

      if (response.status === 401) {
        setIdToken(null);
        setProfile(null);
        setAuthError("Please sign in again to keep chatting with Ollie.");
        setThinking(false);
        return;
      }

      if (!response.ok) {
        setError(data.error || "Ollie is having trouble right now. Try again!");
        setThinking(false);
        return;
      }

      updateActiveSession((s) => ({
        ...s,
        messages: [...s.messages, { role: "assistant", content: data.reply }],
        updatedAt: Date.now(),
      }));
    } catch (err) {
      setError(
        "Ollie couldn't hear that. Check your connection and try again!",
      );
    } finally {
      setThinking(false);
    }
  }

  // Set up speech recognition once, if the browser supports it
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  function toggleListening() {
    if (!recognitionRef.current || thinking) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setInput("");
      recognitionRef.current.start();
      setListening(true);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleChipClick(question) {
    sendMessage(question);
  }

  function handleNewChat() {
    const fresh = createEmptySession();
    setSessions((prev) => [fresh, ...prev]);
    setActiveSessionId(fresh.id);
    setSidebarOpen(false);
  }

  function handleSelectSession(id) {
    setActiveSessionId(id);
    setSidebarOpen(false);
  }

  function handleDeleteSession(id) {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (id === activeSessionId) {
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].id);
        } else {
          const fresh = createEmptySession();
          setActiveSessionId(fresh.id);
          return [fresh];
        }
      }
      return remaining;
    });
  }

  function handleSignOut() {
    setIdToken(null);
    setProfile(null);
    setSessions([]);
    setActiveSessionId(null);
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  }

  // --- Sign-in gate ---
  if (!idToken) {
    return (
      <div className="app-shell signin-shell">
        <BackgroundDecoration />
        <header className="app-header">
          <h1>Ask Ollie 🦉</h1>
        </header>
        <main className="chat-card signin-card">
          <OllieAvatar thinking={false} />
          <p className="empty-state">
            A grown-up needs to sign in with Google before we start chatting!
          </p>
          {authError && (
            <div className="error-banner" role="alert">
              {authError}
            </div>
          )}
          <div ref={signInButtonRef} />
        </main>
      </div>
    );
  }

  // --- Main app: sidebar + chat ---
  return (
    <div className="app-layout">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-panel">
        <BackgroundDecoration />

        <div className="topbar">
          <button
            className="sidebar-toggle-btn"
            aria-label="Toggle chat history"
            onClick={() => setSidebarOpen((o) => !o)}
          >
            ☰
          </button>
          <span className="topbar-title">Ask Ollie 🦉</span>
          <ProfileMenu profile={profile} onSignOut={handleSignOut} />
        </div>

        <main className="chat-card">
          <div className="ollie-header">
            <OllieAvatar thinking={thinking} />
          </div>

          <div className="messages">
            {messages.length === 0 && (
              <p className="empty-state">
                Hi! I'm Ollie. Ask me anything — try one below, or type your own
                question!
              </p>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`bubble-row ${m.role === "user" ? "bubble-row-user" : "bubble-row-ollie"}`}
              >
                {m.role === "assistant" && (
                  <span className="bubble-label">Ollie</span>
                )}
                <div
                  className={`bubble ${m.role === "user" ? "bubble-user" : "bubble-ollie"}`}
                >
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
              {SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  className="chip"
                  onClick={() => handleChipClick(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form className="input-row" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? "Listening..." : "Type your question..."}
              aria-label="Type your question"
              disabled={thinking}
            />
            {voiceSupported && (
              <button
                type="button"
                className={`mic-btn ${listening ? "mic-btn-active" : ""}`}
                aria-label={listening ? "Stop listening" : "Ask by voice"}
                onClick={toggleListening}
                disabled={thinking}
              >
                🎤
              </button>
            )}
            <button
              type="submit"
              aria-label="Send question"
              disabled={thinking || !input.trim()}
            >
              ➤
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

export default App;