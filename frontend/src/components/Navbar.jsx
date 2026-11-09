import React, { useEffect, useState } from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';
import { checkHealth } from '../services/api';

export default function Navbar({ activeTab, setActiveTab }) {
  const [health, setHealth] = useState(null);

  const fetchHealth = async () => {
    try {
      const data = await checkHealth();
      setHealth(data);
    } catch (err) {
      setHealth({ status: 'offline' });
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'landing', label: 'Overview' },
    { id: 'analyze', label: 'Video Analysis' },
    { id: 'dashboard', label: 'Forensic Dashboard' },
    { id: 'performance', label: 'ResNet50 Benchmarks' },
    { id: 'about', label: 'About & Dataset' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-navy-900/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-500 to-cyan-500 p-[2px] shadow-lg shadow-blue-500/10">
            <div className="w-full h-full bg-navy-900 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">
                VERITAS<span className="text-blue-400">AI</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                ResNet50
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Deepfake Detection Forensics</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? 'text-blue-300 bg-blue-950/40 border border-blue-500/30 shadow-sm shadow-blue-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* System Status Pill */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
              health?.status === 'healthy'
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                : health?.status === 'degraded'
                ? 'bg-amber-950/40 border-amber-500/30 text-amber-400'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                health?.status === 'healthy'
                  ? 'bg-emerald-400'
                  : health?.status === 'degraded'
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
            />
            <span className="capitalize">{health ? health.status : 'Connecting...'}</span>
            {health?.gpu_available && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-400 border-l border-slate-700 pl-2">
                <Cpu className="w-3 h-3 text-blue-400" /> GPU
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
