import { useState, useEffect, useRef } from 'react';
import { X, Send, Wifi, WifiOff, Leaf } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../context/AuthContext';
import './ChatOverlay.css';

export default function ChatOverlay({ plantId, plantTitle, onClose }) {
  const { messages, connected, loading, sendMessage } = useChat(plantId);
  const { user } = useAuth();
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text.trim());
    setText('');
  };

  return (
    <div className="chat-overlay animate-slideIn">
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-leaf"><Leaf size={14} /></div>
          <div>
            <div className="chat-title">{plantTitle}</div>
            <div className={`chat-status ${connected ? 'online' : 'offline'}`}>
              {connected ? <><Wifi size={11} /> Live</> : <><WifiOff size={11} /> Connecting...</>}
            </div>
          </div>
        </div>
        <button className="chat-close" onClick={onClose}><X size={18} /></button>
      </div>

      <div className="chat-messages">
        {loading && <div className="chat-loading"><span className="spinner" /></div>}
        {!loading && messages.length === 0 && (
          <div className="chat-empty">
            <Leaf size={24} />
            <p>Start the conversation!</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMine = msg.senderId === user?.id || msg.senderName === user?.username;
          return (
            <div key={i} className={`message-wrap ${isMine ? 'mine' : 'theirs'}`}>
              {!isMine && <div className="msg-sender">{msg.senderName}</div>}
              <div className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
                {msg.content}
              </div>
              <div className="msg-time">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-bar" onSubmit={handleSend}>
        <input
          className="chat-input" placeholder="Type a message..."
          value={text} onChange={e => setText(e.target.value)}
          disabled={!connected}
        />
        <button type="submit" className="chat-send" disabled={!connected || !text.trim()}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
