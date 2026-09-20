import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, ArrowRight } from 'lucide-react';
import { api } from '../../api/client';

export function AIAssistantModal({ isOpen, onClose, onSelectCase }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello Premanshu! I'm RecoverAI's Autonomous Revenue Intelligence Assistant. Ask me anything about revenue at risk, pending CFO approvals, top opportunities, or campaign performance.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const predefinedQuestions = [
    'Why is revenue at risk today?',
    'Show me cases requiring CFO approval',
    'What is our AI Lift vs baseline recovery?',
    'Explain the ABC Technologies case',
  ];

  const handleSend = async (queryText) => {
    const q = queryText || input;
    if (!q.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: q }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chatAI(q);
      setMessages((prev) => [...prev, { sender: 'ai', text: res.response }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Error querying backend recovery intelligence. Please verify backend connection.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white/95 border-l border-white/90 shadow-2xl backdrop-blur-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 font-['Manrope'] text-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-white/80">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200 shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">RecoverAI Assistant</h3>
            <p className="text-[11px] text-slate-500 font-medium">Real-time Revenue Intelligence</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Conversation Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex items-start space-x-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.sender === 'ai' && (
              <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200 shrink-0 mt-0.5 shadow-2xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed shadow-xs ${
                m.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2 text-slate-500 text-xs py-2 font-medium">
            <Bot className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            <span>Analyzing revenue events & policies...</span>
          </div>
        )}
      </div>

      {/* Suggested chips */}
      <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/70">
        <div className="text-[10px] uppercase font-bold text-slate-500 mb-2 px-1">Suggested Inquiries</div>
        <div className="flex flex-wrap gap-1.5">
          {predefinedQuestions.map((pq, i) => (
            <button
              key={i}
              onClick={() => handleSend(pq)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-left transition-all shadow-2xs cursor-pointer"
            >
              {pq}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3.5 border-t border-slate-200/80 bg-white flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI about recovery actions..."
          className="flex-1 bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 shadow-2xs"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 transition-all shadow-xs cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
