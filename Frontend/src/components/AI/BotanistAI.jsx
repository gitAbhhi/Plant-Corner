import { useState, useRef, useEffect } from 'react';
import { Leaf, X, Send, ChevronDown, Sparkles } from 'lucide-react';
import './BotanistAI.css';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent';
const SYSTEM_PROMPT = `You are GreenSage, an expert botanical assistant for the GeoPlant Marketplace. 
You ONLY answer questions about plants. If asked anything unrelated, politely redirect to plant topics.

For every plant query, provide structured information including:
- 🌍 Suitable Climate & Hardiness Zones
- 🌱 Soil Conditions & pH preference
- 💧 Watering Cadence & Humidity needs
- ☀️ Light Requirements
- 🌿 Ecological & Medicinal Benefits
- 💡 Care Tips for buyers

Keep responses helpful, friendly, and concise. Use emojis for visual clarity.`;

export default function BotanistAI() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm **GreenSage** 🌿, your botanical expert. Ask me anything about plants — care guides, climate suitability, medicinal benefits, and more!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build conversation history for Gemini
      const history = messages.slice(1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      // const res = await fetch(GEMINI_URL, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      const res = await fetch(GEMINI_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-goog-api-key': GEMINI_API_KEY,
  },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            ...history,
            { role: 'user', parts: [{ text: userMsg.content }] },
          ],
          generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
        }),
      });

      // const data = await res.json();
      // const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
      const data = await res.json();

console.log("Gemini Status:", res.status);
console.log("Gemini Response:", data);

if (!res.ok) {
  throw new Error(data?.error?.message || "Gemini API request failed");
}

const reply =
  data?.candidates?.[0]?.content?.parts?.[0]?.text ||
  "Sorry, I could not generate a response.";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (text) => {
    // Simple markdown-like rendering for bold and line breaks
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  const suggestions = ['Tell me about Monstera', 'Best plants for low light', 'How to water succulents'];

  return (
    <>
      {/* FAB Button */}
      <button className={`ai-fab ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
        {open ? <ChevronDown size={22} /> : <Sparkles size={22} />}
        {!open && <span className="ai-fab-label">Ask GreenSage</span>}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="ai-panel animate-slideIn">
          <div className="ai-header">
            <div className="ai-header-info">
              <div className="ai-avatar"><Leaf size={16} /></div>
              <div>
                <div className="ai-name">GreenSage</div>
                <div className="ai-subtitle">Botanical AI Assistant</div>
              </div>
            </div>
            <button className="ai-close" onClick={() => setOpen(false)}><X size={18} /></button>
          </div>

          <div className="ai-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`ai-msg ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="ai-msg-avatar"><Leaf size={12} /></div>
                )}

                
                <div
                  className="ai-bubble"
                  dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
                />
              </div>
            ))}
            {loading && (
              <div className="ai-msg assistant">
                <div className="ai-msg-avatar"><Leaf size={12} /></div>
                <div className="ai-bubble typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length <= 1 && (
            <div className="ai-suggestions">
              {suggestions.map(s => (
                <button key={s} className="ai-suggestion" onClick={() => { setInput(s); }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <form className="ai-input-bar" onSubmit={sendMessage}>
            <input
              className="ai-input" placeholder="Ask about any plant..."
              value={input} onChange={e => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="ai-send" disabled={loading || !input.trim()}>
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
