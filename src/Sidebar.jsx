import { useState } from "react";

function formatRelativeTime(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAll,
  isOpen,
  onClose,
}) {
  const [confirmingClear, setConfirmingClear] = useState(false);

  function handleClearClick() {
    if (confirmingClear) {
      onClearAll();
      setConfirmingClear(false);
    } else {
      setConfirmingClear(true);
    }
  }

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <span className="sidebar-logo">AIKidLy 🦉</span>
        </div>

        <button className="new-chat-btn" onClick={onNewChat}>
          <span className="new-chat-icon">+</span> New chat
        </button>

        <nav className="session-list" aria-label="Chat history">
          {sessions.length === 0 && (
            <p className="session-empty">No chats yet</p>
          )}
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`session-item ${session.id === activeSessionId ? "session-item-active" : ""}`}
            >
              <button
                className="session-item-btn"
                onClick={() => onSelectSession(session.id)}
                title={session.title}
              >
                <span className="session-title">{session.title}</span>
                <span className="session-time">
                  {formatRelativeTime(session.updatedAt)}
                </span>
              </button>
              <button
                className="session-delete-btn"
                aria-label={`Delete chat: ${session.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </nav>

        {sessions.length > 0 && (
          <button
            className={`clear-all-btn ${confirmingClear ? "clear-all-btn-confirm" : ""}`}
            onClick={handleClearClick}
            onBlur={() => setConfirmingClear(false)}
          >
            {confirmingClear ? "Are you sure? Tap again" : "🗑️ Clear all history"}
          </button>
        )}
      </aside>
    </>
  );
}

export default Sidebar;