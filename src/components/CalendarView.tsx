import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Clock, 
  Calendar as CalendarIcon, 
  User, 
  ChevronRight, 
  Sparkles,
  Search,
  Filter,
  Check,
  Zap,
  Activity,
  Heart
} from 'lucide-react';
import { CalendarEvent } from '../types';

export default function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState<'family' | 'golf' | 'finance' | 'general'>('family');
  const [description, setDescription] = useState('');
  
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiScheduling, setIsAiScheduling] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/calendar');
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) return;

    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date, time, category, description })
      });
      if (res.ok) {
        setTitle('');
        setDate('');
        setTime('');
        setDescription('');
        fetchEvents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    try {
      const res = await fetch(`/api/calendar/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchEvents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Intelligent AI scheduler parsing
  const handleAiSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsAiScheduling(true);
    setFeedbackMsg("Processing calendar natural language schedule query...");

    try {
      const res = await fetch('/api/maestro-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `I need to schedule this: ${aiPrompt}. Add it to calendar details.` })
      });
      const data = await res.json();
      setFeedbackMsg("Event parsing simulated successfully in active master vault.");
      
      // Let's create a realistic parsed item based on key terms
      const promptLower = aiPrompt.toLowerCase();
      let parsedTitle = "AI Planned Activity";
      let parsedCategory: 'family' | 'golf' | 'finance' | 'general' = 'general';
      let parsedDate = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]; // 2 days from now
      let parsedTime = "15:00";

      if (promptLower.includes("dinner") || promptLower.includes("family")) {
        parsedTitle = "Family Outing & Gathering";
        parsedCategory = "family";
        parsedTime = "19:00";
      } else if (promptLower.includes("golf") || promptLower.includes("tee")) {
        parsedTitle = "Lakeside Play & Swing Session";
        parsedCategory = "golf";
        parsedTime = "14:30";
      } else if (promptLower.includes("trust") || promptLower.includes("tax") || promptLower.includes("bank")) {
        parsedTitle = "Trust Fund Assets Sweep Check";
        parsedCategory = "finance";
        parsedTime = "10:30";
      }

      await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: parsedTitle,
          date: parsedDate,
          time: parsedTime,
          category: parsedCategory,
          description: `Automatically compiled by Intelligent co-pilot from prompt: "${aiPrompt}"`
        })
      });

      setAiPrompt('');
      fetchEvents();
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      setFeedbackMsg("Error routing query to master parser.");
    } finally {
      setIsAiScheduling(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white mb-1">Intelligent Family Calendar</h2>
        <p className="text-zinc-400 text-sm">Orchestrate high-performer schedules, family chores, and elite tournament tee times.</p>
      </div>

      {/* Intelligent AI Prompt Bar */}
      <div className="p-5 bg-gradient-to-r from-yellow-950/20 to-zinc-950 border border-yellow-500/10 rounded-2xl">
        <form onSubmit={handleAiSchedule} className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-mono font-bold text-yellow-400 tracking-wider uppercase">Maestro NLP Smart Scheduler</span>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Schedule family dinner at 7 PM tomorrow under general and sync to vault"
              className="flex-1 bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400/50"
            />
            <button 
              type="submit"
              disabled={isAiScheduling || !aiPrompt.trim()}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40"
            >
              Parse & Log
            </button>
          </div>
          {feedbackMsg && <p className="text-xs font-mono text-yellow-400">{feedbackMsg}</p>}
        </form>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Double Columns: List of events */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="font-bold text-zinc-200">Active Schedule Timeline</h3>
            <span className="text-xs text-zinc-500">{events.length} Operational Coordinates</span>
          </div>

          <div className="space-y-3">
            {events.length === 0 ? (
              <p className="text-zinc-500 text-sm">No synchronized items recorded.</p>
            ) : (
              events.map((event) => (
                <div key={event.id} className="p-4 bg-[#0F0F0F] border border-white/5 rounded-xl flex items-start gap-4 hover:border-white/10 transition-all">
                  <div className={`p-2.5 rounded-lg shrink-0 ${
                    event.category === 'family' ? 'bg-purple-500/10 text-purple-400' :
                    event.category === 'golf' ? 'bg-yellow-400/10 text-yellow-400' :
                    event.category === 'finance' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-zinc-500/10 text-zinc-400'
                  }`}>
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-zinc-100 truncate">{event.title}</h4>
                      <button 
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-1 text-zinc-600 hover:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        {event.date} @ {event.time}
                      </span>
                      <span className="h-1 w-1 bg-zinc-600 rounded-full"></span>
                      <span className="text-[10px] uppercase font-bold text-zinc-500">
                        {event.category}
                      </span>
                    </div>

                    {event.description && (
                      <p className="text-xs text-zinc-500 mt-2 bg-zinc-950 p-2.5 rounded-lg border border-white/5 leading-normal">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Columns: Add manual item form */}
        <div className="p-6 bg-[#0F0F0F] border border-white/5 rounded-2xl space-y-4">
          <h3 className="font-bold text-sm tracking-wide text-zinc-100 uppercase font-mono">Add Coordinates</h3>
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-medium">Activity Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Executive meeting, play session"
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-sm focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium">Date</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium">Time</label>
                <input 
                  type="time" 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-medium">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="family">Family oversight</option>
                <option value="golf">Golf development</option>
                <option value="finance">Asset/Finance</option>
                <option value="general">General</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-medium">Optional descriptions</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Log exact coordinates or directions..."
                rows={3}
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-sm focus:outline-none"
              />
            </div>

             <button 
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              Add Activity Coordinate
            </button>
          </form>
        </div>

      </div>

      {/* Intuitive School / Chore Oversight Tracker */}
      <div className="p-6 bg-[#0F0F0F] border border-white/5 rounded-2xl shadow-md">
        <h3 className="font-bold text-sm tracking-wide text-zinc-100 uppercase font-mono mb-4">Intuitive Chore & Soccer Oversight Presence</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { member: "Julian", chore: "Prepare Lakeside Golf travel gear", status: "In-Progress", color: "text-amber-400 bg-amber-400/10" },
            { member: "Kiera", chore: "Upload Trust agreement back to SmartVault", status: "Synchronized", color: "text-yellow-400 bg-yellow-400/10" },
            { member: "Evelyn", chore: "Sync bank account details with Fidelity sweep", status: "Verified", color: "text-blue-400 bg-blue-400/10" },
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-zinc-950 border border-white/5 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-300">{item.chore}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Assigned: {item.member}</p>
              </div>
              <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-1 rounded ${item.color}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
