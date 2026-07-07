import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Brain, 
  Music,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FocusView({ onComplete }: { onComplete: () => void }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [isMuted, setIsMuted] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  useEffect(() => {
    const handleTrigger = () => {
      const modeTrigger = localStorage.getItem('maestro-trigger-focus');
      if (modeTrigger) {
        localStorage.removeItem('maestro-trigger-focus');
        if (modeTrigger === 'work') {
          setMode('focus');
          setTimeLeft(25 * 60);
          setIsActive(true);
        } else if (modeTrigger === 'rest') {
          setMode('break');
          setTimeLeft(5 * 60);
          setIsActive(true);
        }
      }
    };
    handleTrigger();
    const interval = setInterval(handleTrigger, 400);
    return () => clearInterval(interval);
  }, []);

  const handleComplete = async () => {
    setIsActive(false);
    if (mode === 'focus') {
      try {
        await fetch('/api/focus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ duration: 25, category: 'work' }),
        });
        onComplete();
      } catch (err) {
        console.error('Failed to save focus session', err);
      }
      alert('Focus session complete! Take a break.');
      setMode('break');
      setTimeLeft(5 * 60);
    } else {
      alert('Break over! Ready to focus?');
      setMode('focus');
      setTimeLeft(25 * 60);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'focus' 
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100 
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3 h-3" />
          Deep Work Protocol
        </div>
        <h2 className="text-4xl font-bold tracking-tight">
          {mode === 'focus' ? 'Time to Focus' : 'Rest & Recharge'}
        </h2>
        <p className="text-zinc-500">Block the noise. Amplify the signal.</p>
      </div>

      {/* Hardware Timer UI */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="160"
            cy="160"
            r="150"
            fill="transparent"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="8"
          />
          <motion.circle
            cx="160"
            cy="160"
            r="150"
            fill="transparent"
            stroke={mode === 'focus' ? "#facc15" : "#3b82f6"}
            strokeWidth="8"
            strokeDasharray={2 * Math.PI * 150}
            animate={{ strokeDashoffset: (2 * Math.PI * 150) * (1 - progress / 100) }}
            transition={{ type: 'spring', bounce: 0, duration: 1 }}
            strokeLinecap="round"
          />
        </svg>

        {/* Timer Display */}
        <div className="relative z-10 text-center">
          <motion.div 
            key={timeLeft}
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-7xl font-mono font-bold tracking-tighter tabular-nums"
          >
            {formatTime(timeLeft)}
          </motion.div>
          <div className="mt-2 text-zinc-500 font-medium uppercase tracking-widest text-[10px]">
            {mode === 'focus' ? 'Focus Session' : 'Break Time'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button 
          onClick={resetTimer}
          className="p-4 text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all border border-white/5"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
        
        <button 
          onClick={toggleTimer}
          className={`w-20 h-20 flex items-center justify-center rounded-3xl transition-all shadow-2xl ${
            isActive 
              ? 'bg-zinc-800 text-white hover:bg-zinc-700' 
              : 'bg-yellow-400 text-black hover:bg-yellow-300'
          }`}
        >
          {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
        </button>

        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="p-4 text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all border border-white/5"
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        {[
          { icon: Brain, label: 'Focus', time: 25, active: mode === 'focus' },
          { icon: Coffee, label: 'Short', time: 5, active: mode === 'break' && timeLeft === 5 * 60 },
          { icon: Music, label: 'Lo-Fi', time: 0, active: false },
        ].map((item, i) => (
          <button 
            key={i}
            onClick={() => {
              if (item.label === 'Focus') { setMode('focus'); setTimeLeft(25 * 60); }
              if (item.label === 'Short') { setMode('break'); setTimeLeft(5 * 60); }
            }}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
              item.active 
                ? 'bg-yellow-400/10 border-yellow-400/50 text-yellow-400' 
                : 'bg-[#0F0F0F] border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
