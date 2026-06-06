'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

const GREETING = {
  role: 'assistant',
  content:
    "Hi! I'm the GASTA Assistant. Ask me which documents a claim needs, or tell me the claim type (medical, housing, scholarship, sun quota, emergency) and I'll guide you step by step.",
};

const SUGGESTIONS = [
  'Documents for a medical claim?',
  'How do I track my claim status?',
  'What does a housing claim need?',
];

export default function ChatAssistant({ presetMessage }) {
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (presetMessage) send(presetMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetMessage]);

  async function send(text) {
    const message = (text ?? input).trim();
    if (!message || loading) return;

    const next = [...messages, { role: 'user', content: message }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const history = next.slice(-9, -1);
      const { reply } = await api.chat(message, history);
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', content: `Sorry, something went wrong: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  const showSuggestions = messages.length === 1 && !loading;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-ink-200/70 bg-white shadow-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-ink-100 bg-gradient-to-r from-brand-800 to-brand-600 px-5 py-3.5 text-white">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur">
          <Bot className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold">GASTA Assistant</p>
          <p className="flex items-center gap-1 text-xs text-brand-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online · Claims &amp; document help
          </p>
        </div>
        <Sparkles className="h-4 w-4 text-gold-400" />
      </div>

      {/* Messages */}
      <div className="scroll-area flex-1 space-y-4 overflow-y-auto bg-ink-50/40 px-4 py-4 sm:px-5">
        {messages.map((m, i) => (
          <Message key={i} role={m.role} content={m.content} />
        ))}
        {loading && <TypingBubble />}
        <div ref={endRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && (
        <div className="flex flex-wrap gap-2 border-t border-ink-100 px-4 py-3 sm:px-5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2 border-t border-ink-100 bg-white p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a claim or required documents…"
          className="flex-1 rounded-xl border border-ink-200 bg-ink-50 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-800 text-white transition-all duration-200 hover:bg-brand-900 active:scale-95 disabled:opacity-50"
          aria-label="Send"
        >
          <Send className="h-[18px] w-[18px]" />
        </button>
      </form>
    </div>
  );
}

function Message({ role, content }) {
  const isUser = role === 'user';
  return (
    <div className={`flex items-end gap-2.5 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold shadow-soft ${
          isUser ? 'bg-ink-700 text-white' : 'bg-gradient-to-br from-brand-600 to-brand-800 text-white'
        }`}
      >
        {isUser ? 'You' : <Bot className="h-4 w-4" />}
      </span>
      <div
        className={`max-w-[78%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-soft ${
          isUser
            ? 'rounded-br-md bg-brand-800 text-white'
            : 'rounded-bl-md border border-ink-100 bg-white text-ink-800'
        }`}
      >
        {content}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex items-end gap-2.5 animate-fade-in">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-soft">
        <Bot className="h-4 w-4" />
      </span>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-ink-100 bg-white px-4 py-3 shadow-soft">
        <span className="h-2 w-2 rounded-full bg-brand-400 animate-dot-1" />
        <span className="h-2 w-2 rounded-full bg-brand-400 animate-dot-2" />
        <span className="h-2 w-2 rounded-full bg-brand-400 animate-dot-3" />
      </div>
    </div>
  );
}
