import React from 'react';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Cpu,
  Globe,
  HardDrive,
  Menu,
  Moon,
  RefreshCw,
  Sun,
  Zap
} from 'lucide-react';
import { useXray } from '../context/XrayContext';
import { formatBytes } from '../utils/xrayCoreGenerator';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const {
    stats,
    lang,
    setLang,
    theme,
    setTheme,
    testPingAll,
    isPinging,
    pingProgress,
    restartXrayCore,
    isRestarting
  } = useXray();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      {/* Left: Mobile trigger & App branding indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black text-sm shadow-md shadow-amber-500/20">
            3X
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-100 tracking-tight">3X-UI Pro</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                Sanaei
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block -mt-0.5 hidden sm:inline">
              Xray-core {stats.xrayVersion.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Live Network & Resource badges */}
      <div className="hidden md:flex items-center gap-3">
        {/* Network speed live */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono">
          <div className="flex items-center gap-1 text-emerald-400">
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            <span>{formatBytes(stats.networkDown)}/s</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 text-sky-400">
            <ArrowUp className="w-3.5 h-3.5" />
            <span>{formatBytes(stats.networkUp)}/s</span>
          </div>
        </div>

        {/* CPU badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/40 border border-slate-800 rounded-xl text-xs text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <span>CPU: {stats.cpuUsage}%</span>
        </div>

        {/* RAM badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/40 border border-slate-800 rounded-xl text-xs text-slate-300">
          <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
          <span>RAM: {Math.round((stats.memUsed / stats.memTotal) * 100)}%</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Ping all 29 nodes button */}
        <button
          onClick={testPingAll}
          disabled={isPinging}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-medium rounded-xl border border-slate-700/80 transition-all disabled:opacity-50"
          title={lang === 'fa' ? 'تست پینگ زنده تمامی ۲۹ لوکیشن' : 'Test Ping for all 29 nodes'}
        >
          <Activity className={`w-3.5 h-3.5 text-amber-400 ${isPinging ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">
            {isPinging
              ? `${lang === 'fa' ? 'تست پینگ...' : 'Pinging...'} (${pingProgress}%)`
              : lang === 'fa' ? 'تست ۲۹ نود' : 'Ping 29 Nodes'}
          </span>
        </button>

        {/* Restart Xray core button */}
        <button
          onClick={restartXrayCore}
          disabled={isRestarting}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800/60 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-slate-700/60 transition-colors"
          title={lang === 'fa' ? 'راه‌اندازی مجدد هسته Xray' : 'Restart Xray Core'}
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRestarting ? 'animate-spin' : ''}`} />
          <span className="hidden lg:inline text-[11px]">
            {isRestarting ? (lang === 'fa' ? 'در حال ریستارت...' : 'Restarting...') : (lang === 'fa' ? 'ریستارت هسته' : 'Restart Core')}
          </span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
          title="تغییر زبان / Switch Language"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{lang === 'fa' ? 'EN' : 'فا'}</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-slate-400 hover:text-amber-400 rounded-xl hover:bg-slate-800 transition-colors"
          title="تغییر تم"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
