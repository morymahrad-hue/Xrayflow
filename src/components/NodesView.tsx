import React, { useState } from 'react';
import {
  Activity,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Filter,
  Globe2,
  Plus,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Wifi,
  Zap
} from 'lucide-react';
import { useXray } from '../context/XrayContext';
import { NodeLocation } from '../types/xray';
import { NodePingSparkline } from './NodePingSparkline';

export const NodesView: React.FC = () => {
  const {
    nodes,
    testPingAll,
    testSingleNodePing,
    toggleNodeInSub,
    deleteNode,
    addCustomNode,
    selectOnlyHealthyNodes,
    selectAllNodes,
    isPinging,
    pingProgress,
    lang
  } = useXray();

  const [search, setSearch] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [copiedIp, setCopiedIp] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Node Form
  const [newCountry, setNewCountry] = useState<string>('');
  const [newCity, setNewCity] = useState<string>('');
  const [newFlag, setNewFlag] = useState<string>('🌐');
  const [newIp, setNewIp] = useState<string>('');
  const [newIsp, setNewIsp] = useState<string>('');
  const [newDatacenter, setNewDatacenter] = useState<string>('');
  const [newRegion, setNewRegion] = useState<'Europe' | 'America' | 'Asia' | 'Oceania' | 'Middle East'>('Europe');

  const filteredNodes = nodes.filter((n) => {
    const matchSearch =
      n.country.toLowerCase().includes(search.toLowerCase()) ||
      n.city.toLowerCase().includes(search.toLowerCase()) ||
      n.ip.includes(search) ||
      n.isp.toLowerCase().includes(search.toLowerCase());

    const matchRegion = selectedRegion === 'All' || n.region === selectedRegion;
    return matchSearch && matchRegion;
  });

  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp) return;

    addCustomNode({
      country: newCountry || 'سفارشی',
      countryCode: 'XX',
      city: newCity || 'نامشخص',
      flag: newFlag || '🌐',
      ip: newIp,
      isp: newIsp || 'Custom VPS Provider',
      datacenter: newDatacenter || 'DC-Primary',
      ping: 45,
      jitter: 1.5,
      packetLoss: 0,
      status: 'online',
      enabledInSub: true,
      region: newRegion
    });

    setShowAddModal(false);
    setNewCountry('');
    setNewCity('');
    setNewIp('');
    setNewIsp('');
    setNewDatacenter('');
  };

  const activeInSubCount = nodes.filter((n) => n.enabledInSub).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded">
              ۲۹ لوکیشن واقعی جهان
            </span>
            <span className="text-xs text-slate-400">
              {lang === 'fa' ? 'مدیریت و تست سلامت نودها' : 'Global Node Cluster Manager'}
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-amber-400" />
            {lang === 'fa' ? 'مدیریت نودها و ۲۹ لوکیشن واقعی سرور' : '29 Global Verified Nodes Cluster'}
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            {lang === 'fa'
              ? 'لیست ۲۹ لوکیشن تست‌شده VPS در قاره‌های اروپا، آمریکا، آسیا و خاورمیانه. می‌توانید پینگ و سلامت سرورها را تست کنید تا فقط سریع‌ترین و سالم‌ترین سرورها در لینک سابسکرایب قرار گیرند.'
              : 'Real 29 VPS locations with live latency check, jitter, and selective inclusion in subscription links.'}
          </p>
        </div>

        {/* Global actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={testPingAll}
            disabled={isPinging}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            <Activity className={`w-4 h-4 ${isPinging ? 'animate-spin' : ''}`} />
            <span>
              {isPinging
                ? `${lang === 'fa' ? 'در حال تست...' : 'Testing...'} (${pingProgress}%)`
                : lang === 'fa' ? 'تست پینگ همزمان ۲۹ سرور' : 'Ping All 29 Nodes'}
            </span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>{lang === 'fa' ? 'افزودن نود جدید' : 'Add Custom Node'}</span>
          </button>
        </div>
      </div>

      {/* Control bar: Search, Filter, Quick Select */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Regions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 rtl:right-3 ltr:left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'fa' ? 'جستجوی کشور، شهر، آی‌پی، دیتاسنتر...' : 'Search country, IP, ISP...'}
              className="w-full py-2 pr-9 pl-3 rtl:pr-9 rtl:pl-3 ltr:pl-9 ltr:pr-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {['All', 'Europe', 'America', 'Asia', 'Middle East', 'Oceania'].map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedRegion === region
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {region === 'All'
                  ? lang === 'fa' ? 'همه' : 'All'
                  : region === 'Europe'
                  ? lang === 'fa' ? 'اروپا' : 'Europe'
                  : region === 'America'
                  ? lang === 'fa' ? 'آمریکا' : 'America'
                  : region === 'Asia'
                  ? lang === 'fa' ? 'آسیا' : 'Asia'
                  : region === 'Middle East'
                  ? lang === 'fa' ? 'خاورمیانه' : 'Middle East'
                  : lang === 'fa' ? 'اقیانوسیه' : 'Oceania'}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Batch Selectors */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => selectOnlyHealthyNodes(70)}
            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-500/30 transition-colors flex items-center gap-1"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{lang === 'fa' ? 'فقط پینگ‌های فوق‌سریع (< 70ms)' : 'Only Fast (<70ms)'}</span>
          </button>

          <button
            onClick={selectAllNodes}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition-colors"
          >
            {lang === 'fa' ? 'انتخاب همه ۲۹ نود' : 'Select All 29'}
          </button>

          <span className="text-xs text-amber-400 font-mono font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
            {activeInSubCount} / {nodes.length} {lang === 'fa' ? 'در ساب فعال' : 'active in sub'}
          </span>
        </div>
      </div>

      {/* Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNodes.map((node) => {
          // Color indicator for ping
          let pingBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
          let pingColor = 'text-emerald-400';
          if (node.ping > 180) {
            pingBadge = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
            pingColor = 'text-purple-400';
          } else if (node.ping > 90) {
            pingBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            pingColor = 'text-amber-400';
          } else if (node.ping > 50) {
            pingBadge = 'bg-sky-500/10 text-sky-400 border-sky-500/30';
            pingColor = 'text-sky-400';
          }

          return (
            <div
              key={node.id}
              className={`p-4 bg-slate-900/90 border rounded-2xl transition-all relative overflow-hidden group ${
                node.enabledInSub
                  ? 'border-slate-700/80 hover:border-amber-500/40 shadow-sm'
                  : 'border-slate-800 opacity-60'
              }`}
            >
              {/* Header: Flag, Country, Status */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl drop-shadow-sm">{node.flag}</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                      {node.country.split(' ')[0]}
                      <span className="text-xs font-normal text-slate-400">
                        ({node.city.split(' ')[0]})
                      </span>
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono block">
                      {node.datacenter} • {node.isp.slice(0, 22)}
                    </span>
                  </div>
                </div>

                {/* Sub toggle switch */}
                <label className="flex items-center cursor-pointer" title="فعال/غیرفعال در لینک سابسکرایب">
                  <input
                    type="checkbox"
                    checked={node.enabledInSub}
                    onChange={() => toggleNodeInSub(node.id)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* IP & Ping Metrics */}
              <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-mono text-slate-300">
                    <Server className="w-3.5 h-3.5 text-slate-500" />
                    <span>{node.ip}</span>
                    <button
                      onClick={() => handleCopyIp(node.ip)}
                      className="text-slate-500 hover:text-amber-400 transition-colors p-0.5"
                      title="کپی آی‌پی سرور"
                    >
                      {copiedIp === node.ip ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-xs font-mono font-bold rounded-lg border ${pingBadge} flex items-center gap-1`}
                  >
                    <Wifi className="w-3 h-3" />
                    {node.ping} ms
                  </span>
                </div>

                {/* Mini Sparkline Chart using Recharts */}
                <div className="pt-1.5 pb-0.5 border-t border-slate-900/90 min-w-0">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                    <span className="flex items-center gap-1 font-medium">
                      <TrendingUp className="w-3 h-3 text-amber-400" />
                      {lang === 'fa' ? 'روند تاخیر:' : 'Latency Trend:'}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {node.pingHistory && node.pingHistory.length > 0
                        ? `min: ${Math.min(...node.pingHistory)}ms · max: ${Math.max(...node.pingHistory)}ms`
                        : `${node.ping}ms`}
                    </span>
                  </div>
                  <NodePingSparkline
                    history={node.pingHistory}
                    currentPing={node.ping}
                    gradientId={`grad-${node.id}`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900 font-mono">
                  <span>Jitter: ±{node.jitter}ms</span>
                  <span>Loss: {node.packetLoss}%</span>
                  <span className="text-emerald-400 font-bold uppercase">{node.status}</span>
                </div>
              </div>

              {/* Card Footer: Live Ping test single button */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-500">
                  {lang === 'fa' ? 'منطقه:' : 'Region:'} {node.region}
                </span>

                <div className="flex items-center gap-1.5">
                  {node.isCustom && (
                    <button
                      onClick={() => deleteNode(node.id)}
                      className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-500/10 transition-colors"
                      title="حذف نود"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => testSingleNodePing(node.id)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium rounded-lg border border-slate-700 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3 text-amber-400" />
                    <span>{lang === 'fa' ? 'تست پینگ' : 'Ping'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Node Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              {lang === 'fa' ? 'افزودن نود VPS جدید' : 'Add Custom VPS Node'}
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {lang === 'fa' ? 'آدرس آی‌پی یا دامنه (IP / Host):' : 'IP Address or Domain:'}
                </label>
                <input
                  type="text"
                  required
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  placeholder="185.120.45.10"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{lang === 'fa' ? 'کشور:' : 'Country:'}</label>
                  <input
                    type="text"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    placeholder="آلمان"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{lang === 'fa' ? 'شهر:' : 'City:'}</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="فرانکفورت"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{lang === 'fa' ? 'پرچم ایموجی:' : 'Flag Emoji:'}</label>
                  <input
                    type="text"
                    value={newFlag}
                    onChange={(e) => setNewFlag(e.target.value)}
                    placeholder="🇩🇪"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{lang === 'fa' ? 'قاره / منطقه:' : 'Region:'}</label>
                  <select
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                  >
                    <option value="Europe">Europe</option>
                    <option value="America">America</option>
                    <option value="Asia">Asia</option>
                    <option value="Middle East">Middle East</option>
                    <option value="Oceania">Oceania</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">{lang === 'fa' ? 'نام دیتاسنتر / ISP:' : 'Datacenter / ISP:'}</label>
                <input
                  type="text"
                  value={newIsp}
                  onChange={(e) => setNewIsp(e.target.value)}
                  placeholder="Hetzner Cloud GmbH"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  {lang === 'fa' ? 'انصراف' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl"
                >
                  {lang === 'fa' ? 'ثبت نود' : 'Add Node'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
