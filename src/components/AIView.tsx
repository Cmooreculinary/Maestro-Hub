import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Loader2,
  BrainCircuit,
  Lightbulb,
  Zap,
  Moon,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

export default function AIView() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: "Greetings, Maestro. I have bridged connection nodes with your Private Portfolio assets, Lakeside Golf caddie logs, and SmartVault workspace directories. How can I help you orchestrate your day?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/maestro-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await res.json();
      const aiResponse = data.response || "Server processed. Synchronization metrics validated.";
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (err) {
      console.error('AI Error:', err);
      setMessages(prev => [...prev, { role: 'ai', content: "Secure connection was interrupted. Please retry in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[71vh] flex flex-col bg-[#0F0F0F] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-gradient-to-r from-yellow-500/5 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-400/20">
            <Sparkles className="w-6 h-6 text-black animate-pulse" />
          </div>
          <div>
            <h2 className="font-bold text-base text-zinc-100 font-mono">Maestro NLP Brain</h2>
            <p className="text-[10px] text-yellow-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
              INTEGRATION MULTI-BRIDGE ONLINE
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold bg-zinc-950 text-zinc-500 border border-white/5 px-2.5 py-1 rounded-lg">
            COCKPIT AGENT v2.5
          </span>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
      >
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              msg.role === 'ai' ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/10' : 'bg-zinc-800 text-zinc-300'
            }`}>
              {msg.role === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'ai' 
                ? 'bg-zinc-950 border border-white/5 text-zinc-200' 
                : 'bg-yellow-400 text-black font-semibold shadow-inner'
            }`}>
              <div className="markdown-body">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-yellow-400/10 text-yellow-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-zinc-950 border border-white/5 p-4 rounded-2xl">
              <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-white/5 bg-[#0A0A0A]/50">
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { icon: Moon, label: 'Lakeside optimization near Dusk' },
            { icon: Shield, label: 'Audit current SmartVault files' },
            { icon: Sparkles, label: 'Synthesise soccer schedules' }
          ].map((suggestion, i) => (
            <button 
              key={i}
              onClick={() => setInput(suggestion.label)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-zinc-400 hover:text-white hover:bg-white/10 transition-all font-mono"
            >
              <suggestion.icon className="w-3.5 h-3.5" />
              {suggestion.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSend} className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Direct command to Maestro agent..." 
            className="w-full pl-4 pr-12 py-3.5 bg-zinc-950 border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-yellow-400/50 transition-all text-sm"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 disabled:opacity-40 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
