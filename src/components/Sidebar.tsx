import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Users,
  Globe2,
  QrCode,
  Terminal,
  Settings,
  ShieldCheck,
  Zap,
  Server
} from 'lucide-react';
import { useXray } from '../context/XrayContext';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, lang, nodes, inbounds, clients } = useXray();

  const navItems = [
    {
      id: 'dashboard',
      label: lang === 'fa' ? 'داشبورد و سیستم' : 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'inbounds',
      label: lang === 'fa' ? 'اینباندها (Inbounds)' : 'Inbounds',
      icon: Layers,
      badge: inbounds.length
    },
    {
      id: 'clients',
      label: lang === 'fa' ? 'مدیریت کاربران' : 'Clients & Users',
      icon: Users,
      badge: clients.length
    },
    {
      id: 'nodes',
      label: lang === 'fa' ? 'مدیریت ۲۹ لوکیشن' : '29 Global Nodes',
      icon: Globe2,
      badge: `${nodes.filter((n) => n.enabledInSub).length}/${nodes.length}`,
      isHighlight: true
    },
    {
      id: 'subscription',
      label: lang === 'fa' ? 'مرکز سابسکرایب' : 'Subscription Center',
      icon: QrCode,
      badge: null
    },
    {
      id: 'xray',
      label: lang === 'fa' ? 'هسته Xray و DevOps' : 'Xray Core & DevOps',
      icon: Terminal,
      badge: 'v1.8.24'
    },
    {
      id: 'settings',
      label: lang === 'fa' ? 'تنظیمات پنل' : 'Panel Settings',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 z-40 w-64 bg-slate-900 border-r rtl:border-r-0 rtl:border-l border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : 'max-lg:-translate-x-full rtl:max-lg:translate-x-full'
        }`}
      >
        {/* Top brand */}
        <div>
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shadow-amber-500/25">
                3X
              </div>
              <div>
                <span className="font-extrabold text-sm text-slate-100 tracking-wide block">
                  3X-UI SANAEI
                </span>
                <span className="text-[10px] text-amber-400/90 font-medium tracking-wider">
                  MULTI-NODE PRO
                </span>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md ${
                        item.isHighlight
                          ? 'bg-amber-500 text-slate-950'
                          : isActive
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Server Status Card */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/70">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                {lang === 'fa' ? 'وضعیت سرور مرکزی' : 'Core Status'}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                Online
              </span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <div className="flex justify-between">
                <span>{lang === 'fa' ? 'لوکیشن‌های فعال:' : 'Active Nodes:'}</span>
                <span className="text-amber-400 font-mono font-bold">
                  {nodes.filter((n) => n.enabledInSub).length} / 29
                </span>
              </div>
              <div className="flex justify-between">
                <span>{lang === 'fa' ? 'پروتکل غالب:' : 'Active Protocol:'}</span>
                <span className="text-slate-300 font-mono">VLESS Reality</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
