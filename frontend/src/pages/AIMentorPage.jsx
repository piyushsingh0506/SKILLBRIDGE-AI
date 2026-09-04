import React, { useState } from 'react';
import { aiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Bot, Send, Sparkles, User, ArrowRight, Lightbulb, MessageSquare 
} from 'lucide-react';

const AIMentorPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hello ${user?.full_name?.split(' ')[0] || 'Scholar'}! I am your AI Career Mentor. I've analyzed your academic records and skill gaps. How can I help steer your career roadmap today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    "Create a 3-month learning roadmap for me.",
    "What skills should I learn to become a Data Analyst?",
    "Why is my skill score low and how to boost it?",
    "Which internships match my profile best?",
    "How can I improve my resume ATS score?"
  ];

  const handleSend = async (queryText) => {
    const q = queryText || input;
    if (!q.trim() || loading) return;

    const userMsg = { role: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const chatHistory = messages.map((m) => ({
        role: m.role,
        content: m.text
      }));

      const res = await aiService.chatWithMentor(q, chatHistory);
      const botMsg = {
        role: 'assistant',
        text: res.data.reply,
        actions: res.data.suggested_actions,
        suggested: res.data.suggested_questions
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: "I'm having trouble retrieving details right now. Please try again or check your internet connection." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 mb-1">
          <Bot className="w-4 h-4" />
          <span>Context-Aware RAG Subsystem</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white font-display">AI Career Mentor</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Ask personalized questions regarding skill development, internships, roadmaps, and placement strategy
        </p>
      </div>

      {/* Chat Conversation Card */}
      <div className="flex-1 glass-panel rounded-2xl border border-slate-800 p-4 sm:p-6 flex flex-col justify-between overflow-hidden bg-slate-900/90 shadow-2xl">
        
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                m.role === 'user'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-400'
              }`}>
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-ayush-500 to-emerald-600 text-slate-950 font-semibold'
                  : 'bg-slate-800/80 border border-slate-700/80 text-slate-200'
              }`}>
                <div className="whitespace-pre-line">{m.text}</div>

                {/* Suggested Questions Pills if bot */}
                {m.suggested?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700/60 flex flex-wrap gap-1.5">
                    {m.suggested.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(s)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-700 text-emerald-300 text-[10px] font-semibold border border-emerald-500/20 transition text-left"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 p-2">
              <Bot className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Analyzing student profile & formulating guidance...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="pt-3 border-t border-slate-800 mt-2">
          <div className="flex items-center space-x-1.5 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span>Suggested Inquiries</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition text-left"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask anything about skills, learning roadmaps, resumes, or placements..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 glass-input rounded-xl px-4 py-2.5 text-xs text-white"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-ayush-500 to-emerald-600 hover:from-ayush-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center space-x-1 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default AIMentorPage;
