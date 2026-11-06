import React, { useState } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Clock,
  Cpu,
  Globe,
  HardDrive,
  Layers,
  Plus,
  QrCode,
  Radio,
  Server,
  ShieldCheck,
  Users,
  Zap
} from 'lucide-react';
import { useXray } from '../context/XrayContext';
import { formatBytes } from '../utils/xrayCoreGenerator';
import { QrModal } from './Modals/QrModal';
import { Client } from '../types/xray';

export const DashboardView: React.FC = () => {
  const {
    stats,
    nodes,
    inbounds,
    clients,
    lang,
    setActiveTab,
    testPingAll,
    isPinging
  } = useXray();

  const [selectedQrClient, setSelectedQrClient] = useState<Client | null>(null);

  // Format uptime
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (lang === 'fa') {
      return `${days} روز و ${hours} ساعت`;
    }
    return `${days}d ${hours}h ${mins}m`;
  };

  const memPercent = Math.round((stats.memUsed / stats.memTotal) * 100);
  const diskPercent = Math.round((stats.diskUsed / stats.diskTotal) * 100);

  const activeNodesCount = nodes.filter((n) => n.enabledInSub).length;
  const lowestPingNode = [...nodes].sort((a, b) => a.ping - b.ping)[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-md">
                3X-UI SANAEI v2.4 PRO
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {lang === 'fa' ? 'هسته Xray فعال و متصل' : 'Xray Core Active'}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-100">
              {lang === 'fa'
                ? 'پنل جامع ساخت و مدیریت V2Ray / Xray'
                : 'Xray & V2Ray Unified Management Console'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'fa'
                ? 'پشتیبانی کامل از ۲۹ لوکیشن واقعی تست‌شده جهانی • پروتکل‌های VLESS Reality, VMess, Trojan, Shadowsocks 2022'
                : 'Supporting 29 verified global nodes with real-time ping and stealth protocols'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('nodes')}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all"
            >
              <Globe className="w-4 h-4" />
              {lang === 'fa' ? 'مدیریت ۲۹ لوکیشن' : 'Manage 29 Nodes'}
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors"
            >
              <Users className="w-4 h-4 text-amber-400" />
              {lang === 'fa' ? 'کاربران' : 'Clients'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Card */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              {lang === 'fa' ? 'مصرف پردازنده (CPU)' : 'CPU Usage'}
            </span>
            <span className="text-xs font-mono font-bold text-slate-200">{stats.cpuUsage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, stats.cpuUsage)}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block font-mono">
            4 Cores @ 2.80GHz • Normal
          </span>
        </div>

        {/* RAM Card */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-sky-400" />
              {lang === 'fa' ? 'حافظه موقت (RAM)' : 'Memory Usage'}
            </span>
            <span className="text-xs font-mono font-bold text-slate-200">{memPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full transition-all duration-500"
              style={{ width: `${memPercent}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block font-mono">
            {formatBytes(stats.memUsed)} / {formatBytes(stats.memTotal)}
          </span>
        </div>

        {/* Disk Card */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              {lang === 'fa' ? 'فضای دیسک (Disk)' : 'Disk Storage'}
            </span>
            <span className="text-xs font-mono font-bold text-slate-200">{diskPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${diskPercent}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block font-mono">
            {formatBytes(stats.diskUsed)} / {formatBytes(stats.diskTotal)} (NVMe)
          </span>
        </div>

        {/* Uptime & Connections */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              {lang === 'fa' ? 'مدت زمان روشن بودن' : 'System Uptime'}
            </span>
            <span className="text-xs font-mono text-purple-300 font-bold">
              {stats.tcpConnections} TCP
            </span>
          </div>
          <div className="text-sm font-bold text-slate-100 font-mono">
            {formatUptime(stats.uptime)}
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block font-mono">
            {stats.udpConnections} UDP Active Sockets
          </span>
        </div>
      </div>

      {/* Second Row: 29 Nodes Status & Traffic Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 29 Nodes Highlight Box */}
        <div className="lg:col-span-2 p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  {lang === 'fa' ? 'وضعیت ۲۹ لوکیشن جهانی سرور' : '29 Global Nodes Health'}
                </h3>
                <span className="text-[11px] text-slate-400">
                  {lang === 'fa' ? 'نودهای متصل به سابسکرایب و کانفیگ کلاینت' : 'Verified VPS endpoints'}
                </span>
              </div>
            </div>

            <button
              onClick={testPingAll}
              disabled={isPinging}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700 transition-colors"
            >
              <Activity className={`w-3.5 h-3.5 text-amber-400 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{isPinging ? (lang === 'fa' ? 'در حال بررسی...' : 'Testing...') : (lang === 'fa' ? 'تست پینگ همه' : 'Ping All')}</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-[10px] text-slate-400 block">{lang === 'fa' ? 'کل لوکیشن‌ها' : 'Total Nodes'}</span>
              <span className="text-base font-extrabold text-slate-100 font-mono">29 لوکیشن</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">{lang === 'fa' ? 'فعال در ساب' : 'Active in Sub'}</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">{activeNodesCount} نود</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">{lang === 'fa' ? 'کمترین پینگ' : 'Lowest Ping'}</span>
              <span className="text-base font-extrabold text-amber-400 font-mono">
                {lowestPingNode?.ping || 28} ms ({lowestPingNode?.country.split(' ')[0]})
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">{lang === 'fa' ? 'پکت‌لاست میانگین' : 'Avg Packet Loss'}</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">0.0%</span>
            </div>
          </div>

          {/* Preview of top fastest nodes */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block">
              {lang === 'fa' ? 'سریع‌ترین لوکیشن‌های پیشنهادی:' : 'Top Fastest Locations:'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[...nodes]
                .sort((a, b) => a.ping - b.ping)
                .slice(0, 6)
                .map((node) => (
                  <div
                    key={node.id}
                    className="flex items-center justify-between p-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base">{node.flag}</span>
                      <span className="text-slate-200 font-medium truncate">
                        {node.city.split(' ')[0]}
                      </span>
                    </div>
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                      {node.ping}ms
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Traffic Statistics Card */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  {lang === 'fa' ? 'مجموع ترافیک مصرفی سرور' : 'Total Traffic Statistics'}
                </h3>
                <span className="text-[11px] text-slate-400">
                  {lang === 'fa' ? 'آمار زنده کلیه کاربران و اینباندها' : 'Cumulative bandwidth usage'}
                </span>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <ArrowDown className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">{lang === 'fa' ? 'دانلود کل' : 'Total Download'}</span>
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      {formatBytes(stats.totalDown)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                    <ArrowUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">{lang === 'fa' ? 'آپلود کل' : 'Total Upload'}</span>
                    <span className="text-sm font-bold font-mono text-sky-400">
                      {formatBytes(stats.totalUp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => setActiveTab('inbounds')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              {lang === 'fa' ? 'مشاهده همه اینباندها' : 'View All Inbounds'}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Clients Table Card */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">
              {lang === 'fa' ? 'کاربران فعال اخیر (دسترسی سریع به بارکد و کانفیگ)' : 'Active Clients'}
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('clients')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            {lang === 'fa' ? 'مدیریت کل کاربران →' : 'View All →'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">{lang === 'fa' ? 'نام کاربر' : 'Client'}</th>
                <th className="py-2.5 px-3">{lang === 'fa' ? 'اینباند / پروتکل' : 'Inbound'}</th>
                <th className="py-2.5 px-3">{lang === 'fa' ? 'ترافیک مصرفی' : 'Bandwidth'}</th>
                <th className="py-2.5 px-3">{lang === 'fa' ? 'وضعیت' : 'Status'}</th>
                <th className="py-2.5 px-3 text-center">{lang === 'fa' ? 'عملیات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {clients.map((client, idx) => {
                const targetInbound = inbounds.find((i) => i.id === client.inboundId) || inbounds[0];
                const used = client.up + client.down;
                const totalBytes = client.totalGB * 1024 * 1024 * 1024;
                const percent = totalBytes > 0 ? Math.min(100, Math.round((used / totalBytes) * 100)) : 0;

                return (
                  <tr key={client.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-200 block">{client.email}</span>
                      <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px] block">
                        {client.notes || client.subId}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase font-bold">
                        {targetInbound?.protocol || 'VLESS'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <span className="font-mono text-slate-300 block">
                          {formatBytes(used)} / {client.totalGB > 0 ? `${client.totalGB} GB` : '∞'}
                        </span>
                        {totalBytes > 0 && (
                          <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        {lang === 'fa' ? 'فعال' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setSelectedQrClient(client)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 rounded-lg border border-amber-500/30 text-[11px] font-semibold transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>{lang === 'fa' ? 'بارکد / ۲۹ لوکیشن' : 'QR & Nodes'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Modal */}
      {selectedQrClient && (
        <QrModal
          isOpen={!!selectedQrClient}
          onClose={() => setSelectedQrClient(null)}
          title={`کانفیگ و بارکد ${selectedQrClient.email}`}
          client={selectedQrClient}
          inbound={inbounds.find((i) => i.id === selectedQrClient.inboundId) || inbounds[0]}
        />
      )}
    </div>
  );
};
