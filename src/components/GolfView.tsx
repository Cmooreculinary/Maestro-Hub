import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Moon, 
  MoonStar, 
  Wind, 
  Thermometer, 
  Droplets, 
  Users, 
  Flag, 
  BookOpen, 
  HelpCircle, 
  TrendingUp, 
  ArrowUpRight, 
  RefreshCw,
  Clock,
  Sparkles,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { GolfTeeTime } from '../types';

export default function GolfView() {
  const [tees, setTees] = useState<GolfTeeTime[]>([]);
  const [players, setPlayers] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [course, setCourse] = useState('Lakeside Championship Course');
  const [isSyncing, setIsSyncing] = useState(false);

  const [weather, setWeather] = useState({
    temp: "74°F",
    wind: "4.5 mph NW",
    occupancy: "40% Occupied",
    stimp: "11.5 (Fast Greens)"
  });

  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, player: "Thomas Harrison", score: "-5 (F)", bird: 6 },
    { rank: 2, player: "C. Moore (You)", score: "-3 (14)", bird: 4 },
    { rank: 3, player: "Sarah Jenkins", score: "-2 (F)", bird: 3 },
  ]);

  const fetchTees = async () => {
    try {
      const res = await fetch('/api/golf');
      const data = await res.json();
      setTees(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTees();
  }, []);

  useEffect(() => {
    const handleTrigger = () => {
      if (localStorage.getItem('maestro-trigger-wind') === 'true') {
        localStorage.removeItem('maestro-trigger-wind');
        calibrateWinds();
      }
    };
    handleTrigger();
    const interval = setInterval(handleTrigger, 400);
    return () => clearInterval(interval);
  }, []);

  const handleBookTee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!players || !date || !time) return;

    try {
      const res = await fetch('/api/golf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players, date, time, course })
      });
      if (res.ok) {
        setPlayers('');
        setDate('');
        setTime('');
        fetchTees();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const calibrateWinds = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setWeather(prev => ({
        ...prev,
        wind: `${(Math.random() * 5 + 3).toFixed(1)} mph NW`,
        stimp: "11.8 (Ultra-Hard / Dry Roll)"
      }));
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-bold bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded uppercase">
              Lakeside Golf Club live telemetry
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">Lakeside Club Cockpit</h2>
          <p className="text-zinc-400 text-sm">Monitor green moisture, wind velocities, local twilight indexes, and active tee bookings.</p>
        </div>

        <button 
          onClick={calibrateWinds}
          className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          Calibrate Wind Telemetry
        </button>
      </div>

      {/* Dusk Sunset/Twilight Predictor widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dusk Sentinel specialized weather widget */}
        <div className="lg:col-span-1 p-6 bg-gradient-to-br from-zinc-950 to-zinc-900 border border-white/5 rounded-2xl relative overflow-hidden shadow-md">
          <div className="absolute top-2 right-2 p-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg">
            <Moon className="w-5 h-5 animate-pulse" />
          </div>
          
          <h3 className="font-bold text-xs tracking-wider text-yellow-400 uppercase font-mono mb-4">Dusk Twilight Sentinel</h3>
          
          <div className="space-y-4">
            <p className="text-xs text-zinc-400 leading-normal">
              Calculates peak conditions for twilight play rates. Sunset frame triggers optimal low-humidity velocity, offering steady flight.
            </p>

            <div className="bg-zinc-950 p-4 rounded-xl border border-white/5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-550">Golden Hour window:</span>
                <span className="text-zinc-300 font-bold">18:40 - 19:42</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-550">Solar twilight:</span>
                <span className="text-zinc-300 font-bold">20:12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-550">Optical Score:</span>
                <span className="text-yellow-400 font-bold">0.96 / Perfect</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-orange-400 text-xs font-semibold bg-orange-500/5 p-3 rounded-lg border border-orange-500/10">
              <AlertCircle className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Optimized 18:20 booking recommended.</span>
            </div>
          </div>
        </div>

        {/* Live Course Conditions */}
        <div className="p-6 bg-[#0F0F0F] border border-white/5 rounded-2xl space-y-5">
          <h3 className="font-bold text-xs tracking-wider text-zinc-400 uppercase font-mono">Live Course conditions</h3>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Thermometer, label: "Lakeside Temp", value: weather.temp, col: "text-orange-400 bg-orange-500/5 border-orange-500/10" },
              { icon: Wind, label: "Wind Velocity", value: weather.wind, col: "text-blue-400 bg-blue-500/5 border-blue-500/10" },
              { icon: Flag, label: "Green Speed (Stimp)", value: weather.stimp, col: "text-yellow-400 bg-yellow-400/5 border-yellow-400/10" },
              { icon: Users, label: "Course Occupancy", value: weather.occupancy, col: "text-purple-400 bg-purple-500/5 border-purple-500/10" },
            ].map((stat, i) => (
              <div key={i} className={`p-4 rounded-xl border ${stat.col}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-zinc-450 font-bold uppercase">{stat.label}</span>
                  <stat.icon className="w-4 h-4 shrink-0" />
                </div>
                <p className="text-sm font-mono font-bold text-zinc-200">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lakeside Live Leaderboard */}
        <div className="p-6 bg-[#0F0F0F] border border-white/5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-xs tracking-wider text-zinc-450 uppercase font-mono">Championship Leaderboard</h3>
            <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded font-mono font-bold">LIVE STAGE</span>
          </div>

          <div className="space-y-2.5">
            {leaderboard.map((leader, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-zinc-950 border border-white/5 rounded-xl text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-zinc-500 w-4">#{leader.rank}</span>
                  <span className="font-medium text-zinc-200">{leader.player}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono font-bold">
                  <span className="text-zinc-400">{leader.score}</span>
                  <span className="text-yellow-400 text-[10px]">{leader.bird} Birds</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Tee Booking System */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Book Tee Schedule list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="font-bold text-zinc-200">Logged Club Tee Bookings</h3>
            <span className="text-xs text-zinc-500">{tees.length} Entries Coordinates</span>
          </div>

          <div className="space-y-3">
            {tees.length === 0 ? (
              <p className="text-zinc-550 text-sm">No tee times synchronized.</p>
            ) : (
              tees.map((t) => (
                <div key={t.id} className="p-4 bg-[#0F0F0F] border border-white/5 rounded-xl flex items-center justify-between hover:border-white/10 transition-all text-xs">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-400/10 text-yellow-400 rounded-lg">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-200">{t.course}</h4>
                      <p className="text-[10px] text-zinc-500 mt-1 font-mono">{t.players} • {t.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono font-bold">
                    <span className="text-zinc-300">{t.time} EST</span>
                    <span className="text-[9px] uppercase tracking-wider bg-yellow-400/10 text-yellow-100 px-2 py-0.5 rounded">
                      {t.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Tee Booking form */}
        <div className="p-6 bg-[#0F0F0F] border border-white/5 rounded-2xl h-fit space-y-4">
          <h3 className="font-bold text-sm tracking-wide text-zinc-100 uppercase font-mono">Coordinate Tee Entry</h3>
          
          <form onSubmit={handleBookTee} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-medium">Players Details</label>
              <input 
                type="text" 
                value={players}
                onChange={(e) => setPlayers(e.target.value)}
                placeholder="e.g. C. Moore + Tom Watson"
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-sm focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium">Tee Date</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium">Tee Time</label>
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
              <label className="text-xs text-zinc-400 font-medium">Target Course</label>
              <select 
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="Lakeside Championship Course">Lakeside Championship Course</option>
                <option value="Sunset Meadows Executive Course">Sunset Meadows Executive Course</option>
                <option value="Lakeside 9-Hole Executive Course">Lakeside 9-Hole Executive Course</option>
              </select>
            </div>

            <button 
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              Verify Tee Booking
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
