import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileCode,
  Globe2,
  HelpCircle,
  Laptop,
  Layers,
  QrCode,
  Radio,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap
} from 'lucide-react';
import { useXray } from '../context/XrayContext';
import {
  generateSubscriptionBase64,
  generateClashMetaYaml,
  generateSingBoxJson,
  generateRawUriList,
  buildClientUri
} from '../utils/xrayCoreGenerator';
import { QrModal } from './Modals/QrModal';

export const SubscriptionView: React.FC = () => {
  const { clients, inbounds, nodes, lang } = useXray();

  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [subFormat, setSubFormat] = useState<'base64' | 'clash' | 'singbox'>('base64');
  const [onlyHealthy, setOnlyHealthy] = useState<boolean>(true);
  const [copied, setCopied] = useState<string | null>(null);

  const [isQrOpen, setIsQrOpen] = useState<boolean>(false);

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const targetInbound = inbounds.find((i) => i.id === selectedClient?.inboundId) || inbounds[0];

  const formatQuery = subFormat === 'clash' ? '?format=clash' : subFormat === 'singbox' ? '?format=singbox' : '';
  const subBaseUrl = selectedClient
    ? `${origin}/api/sub/${selectedClient.subId}${formatQuery}`
    : '';

  // Calculate included nodes
  const activeNodes = nodes.filter(
    (n) => n.enabledInSub && (!onlyHealthy || n.status === 'online')
  );

  // Generate contents
  const generatedBase64 = selectedClient
    ? generateSubscriptionBase64(inbounds, selectedClient, nodes, onlyHealthy)
    : '';

  const generatedClashYaml = selectedClient
    ? generateClashMetaYaml(inbounds, selectedClient, activeNodes)
    : '';

  const generatedSingBox = selectedClient
    ? generateSingBoxJson(inbounds, selectedClient, activeNodes)
    : '';

  const activeContent =
    subFormat === 'clash'
      ? generatedClashYaml
      : subFormat === 'singbox'
      ? generatedSingBox
      : generatedBase64;

  const handleCopySubUrl = () => {
    navigator.clipboard.writeText(subBaseUrl);
    setCopied('url');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyRawContent = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied('raw');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadFile = () => {
    if (subFormat === 'clash') {
      const blob = new Blob([generatedClashYaml], { type: 'text/yaml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clash-meta-${selectedClient?.email || 'profile'}.yaml`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (subFormat === 'singbox') {
      const blob = new Blob([generatedSingBox], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sing-box-${selectedClient?.email || 'profile'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-1">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded">
            هسته توزیع هوشمند
          </span>
          <span className="text-xs text-slate-400">
            {lang === 'fa' ? 'تولید لینک‌های هوشمند سابسکرایب' : 'Subscription Link Generator'}
          </span>
        </div>
        <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-amber-400" />
          {lang === 'fa' ? 'مرکز سابسکرایب هوشمند و خروجی کلاینت' : 'Multi-Node Subscription Center'}
        </h1>
        <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
          {lang === 'fa'
            ? 'ساخت لینک سابسکرایب پایدار با ۲۹ لوکیشن واقعی جهان، سازگار با تمامی برنامه‌های v2rayNG, Shadowrocket, Streisand, Sing-box و Clash Meta. کلاینت با وارد کردن یک لینک، تمامی لوکیشن‌های سالم را دریافت کرده و به سریع‌ترین سرور متصل می‌شود.'
            : 'Generate smart subscription links containing all 29 global VPS nodes, with automated fastest-server failover.'}
        </p>
      </div>

      {/* Main Configuration Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Settings */}
        <div className="lg:col-span-1 p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-5">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400" />
            {lang === 'fa' ? 'انتخاب کاربر و فرمت ساب' : 'Select Client & Format'}
          </h3>

          {/* Client picker */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              {lang === 'fa' ? 'انتخاب کاربر:' : 'Select Client:'}
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-500"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.email} ({c.totalGB > 0 ? `${c.totalGB}GB` : 'نامحدود'})
                </option>
              ))}
            </select>
          </div>

          {/* Format Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              {lang === 'fa' ? 'فرمت خروجی سابسکرایب:' : 'Subscription Format:'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSubFormat('base64')}
                className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                  subFormat === 'base64'
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Base64 (همه)
              </button>
              <button
                type="button"
                onClick={() => setSubFormat('clash')}
                className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                  subFormat === 'clash'
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Clash Meta
              </button>
              <button
                type="button"
                onClick={() => setSubFormat('singbox')}
                className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                  subFormat === 'singbox'
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Sing-Box
              </button>
            </div>
          </div>

          {/* Node Filter toggle */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={onlyHealthy}
                onChange={(e) => setOnlyHealthy(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500"
              />
              <span className="font-medium">
                {lang === 'fa'
                  ? 'فقط سرورهای آنلاین و تست‌شده'
                  : 'Filter only healthy & tested nodes'}
              </span>
            </label>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {lang === 'fa'
                ? `در حال حاضر ${activeNodes.length} سرور سالم از مجموع ۲۹ لوکیشن در لینک قرار خواهند گرفت.`
                : `${activeNodes.length} active nodes will be included.`}
            </p>
          </div>

          {/* Nodes included preview */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block">
              {lang === 'fa' ? 'لوکیشن‌های مشمول این لینک:' : 'Nodes in this subscription:'}
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-950/40 rounded-xl border border-slate-800/80">
              {activeNodes.map((n) => (
                <span
                  key={n.id}
                  className="px-2 py-0.5 text-[10px] font-mono bg-slate-800/80 border border-slate-700 rounded-md text-slate-300 flex items-center gap-1"
                >
                  <span>{n.flag}</span>
                  <span>{n.countryCode}</span>
                  <span className="text-amber-400">({n.ping}ms)</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Output Link, QR Code & RAW Viewer */}
        <div className="lg:col-span-2 p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                {lang === 'fa' ? 'لینک مستقیم اشتراک (Subscription URL):' : 'Direct Subscription Link:'}
              </span>
              <span className="text-[11px] text-emerald-400 font-mono font-bold">
                Auto-Update Supported
              </span>
            </div>

            {/* Sub URL Box */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={subBaseUrl}
                className="flex-1 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-amber-300 select-all focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleCopySubUrl}
                className="flex items-center gap-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 shrink-0"
              >
                {copied === 'url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === 'url' ? (lang === 'fa' ? 'کپی شد!' : 'Copied!') : (lang === 'fa' ? 'کپی لینک' : 'Copy Link')}</span>
              </button>
            </div>

            {/* Quick Actions Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => setIsQrOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'fa' ? 'نمایش بارکد هوشمند ساب' : 'Show Subscription QR'}</span>
              </button>

              <button
                onClick={handleCopyRawContent}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                <FileCode className="w-3.5 h-3.5 text-sky-400" />
                <span>
                  {copied === 'raw'
                    ? lang === 'fa' ? 'کپی شد!' : 'Copied!'
                    : lang === 'fa' ? 'کپی محتوای خام (Base64/YAML)' : 'Copy Raw Content'}
                </span>
              </button>

              {(subFormat === 'clash' || subFormat === 'singbox') && (
                <button
                  onClick={handleDownloadFile}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {subFormat === 'clash'
                      ? lang === 'fa' ? 'دانلود پروفایل Clash' : 'Download Clash YAML'
                      : lang === 'fa' ? 'دانلود کانفیگ Sing-Box' : 'Download Sing-Box JSON'}
                  </span>
                </button>
              )}

              <a
                href={subBaseUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/60 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-slate-700/60 transition-colors mr-auto rtl:mr-auto rtl:ml-0 ltr:ml-auto"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>{lang === 'fa' ? 'تست اندپوینت در مرورگر' : 'Open in Browser'}</span>
              </a>
            </div>

            {/* Preview Box */}
            <div className="space-y-1 pt-2">
              <label className="block text-[11px] font-medium text-slate-400">
                {lang === 'fa' ? 'پیش‌نمایش محتوا:' : 'Content Preview:'}
              </label>
              <pre className="w-full h-44 p-3 bg-slate-950 text-[11px] font-mono text-slate-300 border border-slate-800 rounded-xl overflow-x-auto overflow-y-auto leading-relaxed select-all">
                {activeContent}
              </pre>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs space-y-1.5">
            <span className="font-bold text-amber-400 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              {lang === 'fa' ? 'راهنمای کلاینت‌ها برای اتصال:' : 'Client Connection Guide:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="flex items-start gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>اندروید / iOS:</strong> در نرم‌افزار v2rayNG یا Streisand، گزینه Subscription Group را زده و لینک را اضافه و Update کنید.
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  <strong>ویندوز / مک:</strong> در v2rayN یا Clash Verge، لینک را در بخش سابسکرایب پیست کرده و روی بروزرسانی کلیک کنید.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {isQrOpen && (
        <QrModal
          isOpen={isQrOpen}
          onClose={() => setIsQrOpen(false)}
          title={`لینک هوشمند سابسکرایب (${selectedClient?.email})`}
          initialUri={subBaseUrl}
          client={selectedClient}
          inbound={targetInbound}
        />
      )}
    </div>
  );
};
