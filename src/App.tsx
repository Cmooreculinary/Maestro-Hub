/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Timer, 
  Sparkles, 
  Settings, 
  Bell, 
  Search,
  User,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  LineChart,
  HardDrive,
  Compass,
  Users
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { View, Task, Stats } from './types';
import DashboardView from './components/DashboardView';
import TasksView from './components/TasksView';
import FocusView from './components/FocusView';
import AIView from './components/AIView';
import CalendarView from './components/CalendarView';
import WealthView from './components/WealthView';
import VaultView from './components/VaultView';
import GolfView from './components/GolfView';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({ 
    totalTasks: 0, 
    completedTasks: 0, 
    totalFocusMinutes: 0,
    totalAssets: 2595690,
    vaultFileCount: 4,
    upcomingEventsCount: 4
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Keyboard shortcut for sidebar & command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsDropdownOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [currentView]);

  const commands = [
    { id: 'nav-dashboard', label: 'Navigate to Command Cockpit', category: 'Pages' as const, icon: LayoutDashboard, action: () => { setCurrentView('dashboard'); setSearchQuery(''); setIsDropdownOpen(false); } },
    { id: 'nav-calendar', label: 'Navigate to Intelligent Calendar', category: 'Pages' as const, icon: CalendarIcon, action: () => { setCurrentView('calendar'); setSearchQuery(''); setIsDropdownOpen(false); } },
    { id: 'nav-wealth', label: 'Navigate to Wealth Portfolio', category: 'Pages' as const, icon: LineChart, action: () => { setCurrentView('wealth'); setSearchQuery(''); setIsDropdownOpen(false); } },
    { id: 'nav-vault', label: 'Navigate to SmartVault Space', category: 'Pages' as const, icon: HardDrive, action: () => { setCurrentView('vault'); setSearchQuery(''); setIsDropdownOpen(false); } },
    { id: 'nav-golf', label: 'Navigate to Lakeside Club & Dusk', category: 'Pages' as const, icon: Compass, action: () => { setCurrentView('golf'); setSearchQuery(''); setIsDropdownOpen(false); } },
    { id: 'nav-tasks', label: 'Navigate to Operational Tasks', category: 'Pages' as const, icon: CheckSquare, action: () => { setCurrentView('tasks'); setSearchQuery(''); setIsDropdownOpen(false); } },
    { id: 'nav-focus', label: 'Navigate to Focus Protocol', category: 'Pages' as const, icon: Timer, action: () => { setCurrentView('focus'); setSearchQuery(''); setIsDropdownOpen(false); } },
    { id: 'nav-ai', label: 'Navigate to Maestro AI Copilot', category: 'Pages' as const, icon: Sparkles, action: () => { setCurrentView('ai'); setSearchQuery(''); setIsDropdownOpen(false); } },
    
    { id: 'action-focus-25', label: 'Start Focus Timer: 25 minutes', category: 'Timer Protocol' as const, icon: Timer, action: () => { localStorage.setItem('maestro-trigger-focus', 'work'); setCurrentView('focus'); setSearchQuery(''); setIsDropdownOpen(false); } },
    { id: 'action-break-5', label: 'Start Rest Interval: 5 minutes', category: 'Timer Protocol' as const, icon: Timer, action: () => { localStorage.setItem('maestro-trigger-focus', 'rest'); setCurrentView('focus'); setSearchQuery(''); setIsDropdownOpen(false); } },
    
    { id: 'action-wind', label: 'Calibrate Wind Telemetry', category: 'Direct Actions' as const, icon: Compass, action: () => { localStorage.setItem('maestro-trigger-wind', 'true'); setCurrentView('golf'); setSearchQuery(''); setIsDropdownOpen(false); } },
    { id: 'action-link', label: 'Link New Custody Account', category: 'Direct Actions' as const, icon: LineChart, action: () => { localStorage.setItem('maestro-trigger-link-account', 'true'); setCurrentView('wealth'); setSearchQuery(''); setIsDropdownOpen(false); } },
    { id: 'action-task', label: 'Create New Task Coordinate', category: 'Direct Actions' as const, icon: CheckSquare, action: () => { setCurrentView('tasks'); setSearchQuery(''); setIsDropdownOpen(false); } },
    { id: 'action-copilot', label: 'Inquire AI Copilot Assistant', category: 'Direct Actions' as const, icon: Sparkles, action: () => { setCurrentView('ai'); setSearchQuery(''); setIsDropdownOpen(false); } },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsDropdownOpen(true);
      }
      return;
    }
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsDropdownOpen(false);
      searchInputRef.current?.blur();
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Command Cockpit', icon: LayoutDashboard },
    { id: 'calendar', label: 'Intelligent Calendar', icon: CalendarIcon },
    { id: 'wealth', label: 'Wealth Portfolio', icon: LineChart },
    { id: 'vault', label: 'SmartVault Space', icon: HardDrive },
    { id: 'golf', label: 'Lakeside Club & Dusk', icon: Compass },
    { id: 'tasks', label: 'Operational Tasks', icon: CheckSquare },
    { id: 'focus', label: 'Focus Protocol', icon: Timer },
    { id: 'ai', label: 'Maestro AI Copilot', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0E0203] via-[#1A0306] to-[#080102] text-white font-sans selection:bg-yellow-500/30">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-all duration-300 border-r border-[#ab2a3e]/25 bg-[#140204]/95 backdrop-blur-xl overflow-hidden",
          isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-0 md:translate-x-0 md:w-20"
        )}
      >
        <div className="flex flex-col h-full px-3 py-4 overflow-y-auto">
          <div className="flex items-center mb-8 px-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center mr-3 shrink-0 shadow-lg shadow-yellow-400/20">
              <Sparkles className="w-4 h-4 text-black animate-pulse" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-widest text-white leading-none font-mono">MAESTRO</span>
                <span className="text-[9px] font-bold text-yellow-400 font-mono tracking-wider mt-0.5">ELITE COMMAND</span>
              </div>
            )}
          </div>

          <nav className="space-y-1 flex-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={cn(
                  "flex items-center p-2.5 rounded-xl transition-all duration-200 group w-full",
                  currentView === item.id 
                    ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 shadow-inner" 
                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 shrink-0",
                  currentView === item.id ? "text-yellow-400 font-bold" : "group-hover:text-zinc-200"
                )} />
                {isSidebarOpen && <span className="ml-3 text-xs font-semibold font-mono uppercase tracking-wide">{item.label}</span>}
                {currentView === item.id && isSidebarOpen && (
                  <motion.div 
                    layoutId="active-pill"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-400"
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="pt-4 mt-4 border-t border-white/5 space-y-1">
            <button className="flex items-center p-2.5 text-zinc-500 rounded-xl hover:bg-white/5 hover:text-zinc-200 transition-all w-full group">
              <Settings className="w-4 h-4 shrink-0" />
              {isSidebarOpen && <span className="ml-3 text-xs font-semibold font-mono uppercase">Settings</span>}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => isSidebarOpen && setIsUserMenuOpen(!isUserMenuOpen)}
                className={cn(
                  "p-2.5 flex items-center rounded-xl transition-all w-full group",
                  isUserMenuOpen ? "bg-white/5 text-white" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
                )}
              >
                <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-zinc-700 transition-colors">
                  <User className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
                </div>
                {isSidebarOpen && (
                  <>
                    <div className="ml-3 overflow-hidden text-left flex-1">
                      <p className="text-xs font-bold truncate text-zinc-300">C. Moore</p>
                      <p className="text-[9px] text-zinc-500 font-mono uppercase truncate">Private Client</p>
                    </div>
                    {isUserMenuOpen ? <ChevronUp className="w-4 h-4 ml-2 text-zinc-500" /> : <ChevronDown className="w-4 h-4 ml-2 text-zinc-500" />}
                  </>
                )}
              </button>

              <AnimatePresence>
                {isSidebarOpen && isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden px-2 pb-2 space-y-1"
                  >
                    <button className="flex items-center w-full p-2 text-[10px] uppercase font-mono font-bold text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all pl-11">
                      <CreditCard className="w-3.5 h-3.5 mr-2" />
                      Billing
                    </button>
                    <button className="flex items-center w-full p-2 text-[10px] uppercase font-mono font-bold text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all pl-11">
                      <LogOut className="w-3.5 h-3.5 mr-2" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:flex items-center p-2.5 text-zinc-500 rounded-xl hover:bg-white/5 hover:text-zinc-200 transition-all w-full group mt-auto"
            >
              {isSidebarOpen ? (
                <>
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                  <span className="ml-3 text-xs font-semibold font-mono uppercase">Minimize View</span>
                </>
              ) : (
                <ChevronRight className="w-4 h-4 shrink-0" />
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300 min-h-screen pb-12",
        isSidebarOpen ? "md:ml-64" : "md:ml-20"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-[#110204]/90 backdrop-blur-md border-b border-[#ab2a3e]/15">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <h1 className="text-xs font-mono font-bold uppercase text-yellow-500 tracking-widest">{currentView} Space Coordinates</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-500" />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleInputKeyDown}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Ctrl+K Command directory..." 
                  className="pl-9 pr-12 py-1.5 bg-black/40 border border-[#ab2a3e]/30 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-yellow-400/50 w-64 font-mono transition-all text-white placeholder-zinc-500"
                />
                <div className="absolute right-2 px-1.5 py-0.5 bg-black/60 border border-[#ab2a3e]/20 rounded text-[9px] text-yellow-400 select-none pointer-events-none font-mono">
                  ⌘K
                </div>
              </div>

              {/* CMD PALETTE DROPDOWN */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-[420px] bg-gradient-to-b from-[#140204]/98 to-[#0E0102]/98 border border-[#ab2a3e]/45 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl z-50 shadow-black/80"
                  >
                    <div className="p-3 border-b border-[#ab2a3e]/20 bg-[#ab2a3e]/5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                        <span className="text-[9px] font-mono font-bold text-yellow-400 uppercase tracking-widest">Maestro Command Engine</span>
                      </div>
                      <span className="text-[8px] font-mono text-zinc-500 uppercase">↑↓ MOVE · ↵ SELECT · ESC CLOSE</span>
                    </div>

                    <div className="max-h-[320px] overflow-y-auto scrollbar-thin p-1.5 space-y-2">
                      {filteredCommands.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500 text-xs font-mono">
                          No matching coordinates found
                        </div>
                      ) : (
                        ['Pages', 'Timer Protocol', 'Direct Actions'].map(cat => {
                          const catCmds = filteredCommands.filter(cmd => cmd.category === cat);
                          if (catCmds.length === 0) return null;
                          return (
                            <div key={cat} className="space-y-1">
                              <div className="px-2.5 pt-1.5 pb-0.5">
                                <span className="text-[8px] font-mono font-extrabold uppercase text-yellow-500/70 tracking-widest">
                                  {cat}
                                </span>
                              </div>
                              {catCmds.map((cmd) => {
                                const overallIndex = filteredCommands.findIndex(c => c.id === cmd.id);
                                const isSelected = overallIndex === selectedIndex;
                                const CmdIcon = cmd.icon;
                                return (
                                  <button
                                    key={cmd.id}
                                    onClick={() => cmd.action()}
                                    onMouseEnter={() => setSelectedIndex(overallIndex)}
                                    className={cn(
                                      "w-full flex items-center justify-between p-2 rounded-xl transition-all text-left",
                                      isSelected 
                                        ? "bg-gradient-to-r from-[#ab2a3e]/20 to-[#ab3044]/5 border border-[#ab2a3e]/40 text-white" 
                                        : "hover:bg-white/[0.02] text-zinc-400 hover:text-zinc-200 border border-transparent"
                                    )}
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <div className={cn(
                                        "p-1 rounded-lg shrink-0",
                                        isSelected ? "bg-yellow-400/10 text-yellow-400" : "bg-white/5 text-zinc-550"
                                      )}>
                                        <CmdIcon className="w-3.5 h-3.5" />
                                      </div>
                                      <span className="text-xs font-semibold">{cmd.label}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      {isSelected && (
                                        <span className="text-[8px] font-mono font-bold bg-[#ab2a3e]/15 text-[#ff4b66] border border-[#ab2a3e]/30 px-1.5 py-0.5 rounded uppercase">
                                          LAUNCH
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button className="p-2 text-zinc-450 hover:text-white hover:bg-white/5 rounded-lg relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-400 rounded-full border border-[#0E0203]" />
            </button>
          </div>
        </header>

        {/* View Content */}
        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {currentView === 'dashboard' && <DashboardView stats={stats} />}
              {currentView === 'calendar' && <CalendarView />}
              {currentView === 'wealth' && <WealthView />}
              {currentView === 'vault' && <VaultView />}
              {currentView === 'golf' && <GolfView />}
              {currentView === 'tasks' && <TasksView onUpdate={fetchStats} />}
              {currentView === 'focus' && <FocusView onComplete={fetchStats} />}
              {currentView === 'ai' && <AIView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
