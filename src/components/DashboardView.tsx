import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Zap,
  ArrowUpRight,
  Shield,
  Activity,
  Calendar as CalendarIcon,
  Moon,
  Compass,
  FileCode,
  DollarSign,
  CloudLightning,
  Sparkles,
  HelpCircle,
  RefreshCw,
  Search,
  UserCheck
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Stats } from '../types';

const data = [
  { name: 'Mon', wealth: 2580 },
  { name: 'Tue', wealth: 2582 },
  { name: 'Wed', wealth: 2596 },
  { name: 'Thu', wealth: 2601 },
  { name: 'Fri', wealth: 2605 },
  { name: 'Sat', wealth: 2612 },
  { name: 'Sun', wealth: 2615 },
];

export default function DashboardView({ stats }: { stats: Stats }) {
  const [briefing, setBriefing] = useState<string>("Loading executive copilot briefing...");
  const [isSyncingVault, setIsSyncingVault] = useState(false);
  const [duskSentinel, setDuskSentinel] = useState({
    sunset: "19:42",
    wind: "4.5 mph NW",
    humidity: "42%",
    twilightStatus: "OPTIMAL TWILIGHT"
  });

  const fetchBriefing = async () => {
    setBriefing("Re-calibrating telemetry and generating briefing...");
    try {
      const res = await fetch('/api/briefing');
      const data = await res.json();
      setBriefing(data.briefing);
    } catch (err) {
      setBriefing("Private assets total $2,595,690. Lakeside Championship Course tee times logged for Sat 14:30. Dusk sentinel: Winds 4.5mph NW. Twilight booking window optimal.");
    }
  };

  const handleSyncVault = () => {
    setIsSyncingVault(true);
    setTimeout(() => {
      setIsSyncingVault(false);
    }, 2000);
  };

  useEffect(() => {
    fetchBriefing();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
            <span className="text-xs font-mono font-semibold text-yellow-400 tracking-widest uppercase">COCKPIT PROTOCOL ACTIVE</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-1 text-white">Maestro Private Command</h2>
          <p className="text-zinc-400 text-sm">Family Digital Presence, High-Status Golf Analytics, and SmartVault Oversight.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchBriefing}
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-yellow-400 rounded-xl border border-white/5 transition-all flex items-center gap-1.5 text-xs font-medium"
            title="Reload briefing"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Control
          </button>
          
          <div className="flex items-center gap-2 bg-zinc-900 border border-white/5 px-4 py-2.5 rounded-xl">
            <CalendarIcon className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-mono font-bold tracking-tight text-zinc-200">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Co-Pilot AI Briefing (World Class Intro) */}
      <div className="p-6 bg-gradient-to-br from-[#380b13]/45 to-[#120204]/95 border border-[#ab2a3e]/35 rounded-2xl relative overflow-hidden shadow-xl shadow-black/40">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-450/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 rounded-xl mt-1 shrink-0 shadow-inner">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-yellow-400 tracking-widest uppercase mb-1">MAESTRO CO-PILOT ADVISORY</h3>
            <p className="text-sm font-medium text-zinc-200 leading-relaxed max-w-4xl">{briefing}</p>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid - Colorized in Green, Red, Purple, and Yellow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tracked Assets', value: `$${(stats.totalAssets || 2595690).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5' },
          { label: 'Secure Vault files', value: stats.vaultFileCount || '4 Linked', icon: Shield, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20 shadow-purple-500/5' },
          { label: 'Family agenda status', value: `${stats.upcomingEventsCount || 4} Events Logged`, icon: UserCheck, color: 'text-rose-450', bg: 'bg-rose-500/10 border-rose-500/20 shadow-rose-500/5' },
          { label: 'Dusk twilight sentinel', value: 'Optimal Tee Window', icon: Moon, color: 'text-yellow-400', bg: 'bg-yellow-450/10 border-yellow-400/20 shadow-yellow-400/5' },
        ].map((stat, i) => (
          <div key={i} className="p-5 bg-gradient-to-br from-[#1b0407]/90 to-[#0e0204]/95 border border-[#ab2a3e]/25 rounded-2xl group hover:border-[#ab2a3e]/45 transition-all shadow-md shadow-black/30">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-lg ${stat.bg} border shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-zinc-550 group-hover:text-yellow-400 transition-colors" />
            </div>
            <p className="text-zinc-450 text-xs font-semibold mb-1 font-mono uppercase tracking-wide">{stat.label}</p>
            <p className={`text-xl font-mono font-bold tracking-tight ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Double Column Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Play & Wealth Tracker visual chart */}
        <div className="lg:col-span-2 p-6 bg-gradient-to-br from-[#180306]/90 to-[#0e0204]/95 border border-[#ab2a3e]/25 rounded-2xl relative shadow-md shadow-black/30">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-yellow-400 tracking-tight font-display">Private Assets Sweep</h3>
              <p className="text-xs text-zinc-450">Consolidated Brokerage & Trust valuation (USD Thousands)</p>
            </div>
            <span className="text-xs font-mono bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full">+4.2% This Quarter</span>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff03" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#80808a', fontSize: 11, fontFamily: 'monospace' }}
                  dy={10}
                />
                <YAxis 
                  domain={['dataMin - 10', 'auto']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#80808a', fontSize: 11, fontFamily: 'monospace' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#130305', borderColor: '#ab2a3e30', borderRadius: '12px' }}
                  labelStyle={{ color: '#a1a1aa' }}
                  itemStyle={{ color: '#facc15', fontWeight: 'bold' }}
                  formatter={(value) => [`$${Number(value).toLocaleString()}K`, 'Value']}
                />
                <Area 
                  type="monotone" 
                  dataKey="wealth" 
                  stroke="#facc15" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorWealth)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right column: Golf Dusk Index & SmartVault Integration Status */}
        <div className="space-y-6">
          
          {/* Dusk Sentinel weather widget wrapped in smoky glass burgundy */}
          <div className="p-6 bg-gradient-to-br from-[#1a0407]/90 to-[#0e0204]/95 border border-[#ab2a3e]/30 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-2 right-2 p-1.5 bg-yellow-400/10 border border-yellow-400/20 text-yellow-450 rounded-lg">
              <Moon className="w-4 h-4 animate-spin-slow" />
            </div>
            
            <h3 className="font-bold text-sm tracking-widest text-yellow-400 uppercase mb-4 font-mono">DUSK SENTINEL WRAP</h3>
            
            <div className="space-y-4 font-sans text-xs">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-400">Peak Twilight Frame</span>
                <span className="text-sm font-mono font-bold text-yellow-400">{duskSentinel.sunset}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-400">Late Wind Vector</span>
                <span className="text-sm font-mono font-medium text-zinc-200">{duskSentinel.wind}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-400">Field Moisture</span>
                <span className="text-sm font-mono font-medium text-zinc-200">{duskSentinel.humidity}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-zinc-400">Atmosphere Grade</span>
                <span className="text-xs font-mono font-extrabold uppercase bg-yellow-450/15 border border-yellow-450/30 text-yellow-400 px-2.5 py-0.5 rounded">
                  {duskSentinel.twilightStatus}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 mt-4 leading-normal italic text-center">Calculates daily optical clarity for executive-rate twilight play.</p>
          </div>

          {/* SmartVault Sync Panel */}
          <div className="p-6 bg-gradient-to-br from-[#180306]/95 to-[#0b0102]/95 border border-[#ab2a3e]/25 rounded-2xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-450" />
                <h3 className="font-bold text-sm text-yellow-400 font-mono uppercase tracking-wide">SmartVault Space</h3>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50"></span>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Vault state is fully synced with premium cloud custody. Legal trust agreements and private asset deeds are logged.
              </p>
              
              <div className="bg-black/40 p-3 rounded-xl border border-[#ab2a3e]/25 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400 font-medium">Auto-Sync Status</p>
                  <p className="text-[10px] text-zinc-650 font-mono">Telemetry link verified</p>
                </div>
                <button 
                  onClick={handleSyncVault}
                  disabled={isSyncingVault}
                  className="px-3 py-1.5 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 text-xs font-bold rounded-lg border border-yellow-400/20 transition-all flex items-center gap-1 shrink-0"
                >
                  {isSyncingVault ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  {isSyncingVault ? 'Processing' : 'Sync Vault'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Digital Oversight Presence Section */}
      <div className="p-6 bg-[#0F0F0F] border border-white/5 rounded-2xl shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-base text-zinc-100">Intuitive Family Digital Presence</h3>
            <p className="text-xs text-zinc-500">Live active status of linked family units.</p>
          </div>
          <span className="text-xs text-zinc-500 flex items-center gap-1 font-mono">
            <Activity className="w-3.5 h-3.5 text-yellow-400" />
            SECURE LINK COMPLIER ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "Maestro C.M.", role: "Primary Commander", status: "Lakeside Golf Course", time: "18:30 (Scheduled)", active: true, color: "bg-yellow-400" },
            { name: "Evelyn Moore", role: "Co-pilot", status: "Whole Foods Sweeper", time: "Active Now", active: true, color: "bg-yellow-400" },
            { name: "Julian (Junior)", role: "Family Member 1", status: "Piano Tutoring Space", time: "19:00 Done", active: true, color: "bg-yellow-400" },
            { name: "Kiera (Junior)", role: "Family Member 2", status: "Lakeside Junior Tennis", time: "Completed 17:00", active: false, color: "bg-zinc-600" },
          ].map((member, idx) => (
            <div key={idx} className="p-4 bg-zinc-950 border border-white/5 rounded-xl hover:border-white/10 transition-all flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center relative shrink-0">
                <span className="font-mono text-xs font-bold text-zinc-400">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </span>
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-950 ${member.color}`}></span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-200 truncate">{member.name}</p>
                <p className="text-[10px] text-zinc-500 truncate">{member.role}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] text-yellow-400 font-mono truncate">{member.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
