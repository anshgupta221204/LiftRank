import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AITrainer = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat when messages stack updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const examples = [
    { text: 'What should I eat after my workout?', icon: '🥗' },
    { text: 'Give me a chest workout.', icon: '🏋️' },
    { text: 'How can I improve my bench press?', icon: '💪' }
  ];

  // Helper to render markdown-like bold (**text**) and paragraph breaks (\n)
  const formatResponse = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, idx) => {
      // Replace **bold** with <strong>bold</strong>
      const parts = [];
      let temp = line;
      const regex = /\*\*(.*?)\*\*/g;
      let match;
      let lastIndex = 0;

      while ((match = regex.exec(temp)) !== null) {
        if (match.index > lastIndex) {
          parts.push(temp.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-extrabold text-white">{match[1]}</strong>);
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < temp.length) {
        parts.push(temp.substring(lastIndex));
      }

      return (
        <p key={idx} className={line.trim() === '' ? 'h-3' : 'mb-2 leading-relaxed'}>
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  const handleSendMessage = async (textToSend) => {
    const messageText = textToSend || input;
    if (!messageText || messageText.trim() === '') return;

    setError('');
    const userMessage = { sender: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    
    if (!textToSend) {
      setInput('');
    }
    
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: messageText });
      const aiReply = { sender: 'ai', text: res.data.reply };
      setMessages(prev => [...prev, aiReply]);
    } catch (err) {
      console.error('Chat error:', err);
      const friendlyErr = err.response?.data?.message || "Sorry, I couldn't reach the AI Coach right now. Please try again.";
      setError(friendlyErr);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[#0b111e] text-slate-100 flex flex-col h-screen">
      {/* Header Bar */}
      <header className="bg-[#111a2e]/60 backdrop-blur-md border-b border-[#334155]/40 px-6 py-4 flex-shrink-0 z-10">
        <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">LiftRank AI Coach</h1>
              <p className="text-[10px] text-slate-400">Your built-in fitness assistant</p>
            </div>
          </div>
          <Link
            to="/dashboard"
            className="text-xs font-semibold bg-[#1e293b]/60 border border-[#334155]/60 text-slate-300 hover:bg-[#1e293b] hover:text-white px-4 py-2 rounded-xl transition-all duration-200"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Messages Logs Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0 bg-[#0b111e]">
        <div className="max-w-4xl w-full mx-auto flex flex-col space-y-4">
          
          {/* Empty State / Suggestions */}
          {messages.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-5 shadow-lg shadow-brand-500/5 animate-pulse">
                <span className="text-3xl">🤖</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Meet your LiftRank AI Coach</h2>
              <p className="text-slate-400 text-xs mt-2 max-w-sm leading-relaxed mb-8">
                Ask about workout structures, exercise replacements, safe progression form, or high-protein diet templates.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl px-2">
                {examples.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(item.text)}
                    className="flex items-center gap-3 p-4 bg-[#1e293b]/30 border border-[#334155]/40 rounded-2xl text-left hover:border-brand-500/70 hover:bg-[#1e293b]/60 transition-all duration-300 text-xs group cursor-pointer"
                  >
                    <span className="text-lg bg-slate-800 p-2 rounded-xl group-hover:bg-slate-750 transition-colors">
                      {item.icon}
                    </span>
                    <span className="text-slate-300 group-hover:text-white leading-snug">{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Messages Renders */}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 text-xs ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-br-none shadow-md shadow-brand-600/5'
                    : 'bg-[#1e293b]/50 border border-[#334155]/40 text-slate-300 rounded-bl-none'
                }`}
              >
                {msg.sender === 'user' ? (
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div>{formatResponse(msg.text)}</div>
                )}
              </div>
            </div>
          ))}

          {/* Thinking / Typing Loader */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#1e293b]/50 border border-[#334155]/40 rounded-2xl rounded-bl-none px-5 py-3.5 text-xs text-slate-400 flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span>AI Coach is thinking...</span>
              </div>
            </div>
          )}

          {/* Friendly Error Banner */}
          {error && (
            <div className="bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded-xl p-4 text-xs flex items-center gap-2 max-w-lg mx-auto w-full">
              <svg className="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Bar */}
      <footer className="bg-[#111a2e]/60 border-t border-[#334155]/40 px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl w-full mx-auto flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask your AI Coach..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
            className="flex-1 bg-[#0f172a]/60 border border-[#334155]/60 rounded-xl px-4 py-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-50 transition-all"
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
};

export default AITrainer;
