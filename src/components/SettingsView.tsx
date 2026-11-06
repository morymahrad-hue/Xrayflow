import React, { useState } from 'react';
import {
  Bell,
  Check,
  Download,
  HardDrive,
  Key,
  RefreshCw,
  Save,
  Send,
  Server,
  Shield,
  Upload
} from 'lucide-react';
import { useXray } from '../context/XrayContext';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    nodes,
    inbounds,
    clients,
    lang
  } = useXray();

  const [panelPort, setPanelPort] = useState<number>(settings.panelPort);
  const [webBasePath, setWebBasePath] = useState<string>(settings.webBasePath);
  const [subDomain, setSubDomain] = useState<string>(settings.subDomain);
  const [subPort, setSubPort] = useState<number>(settings.subPort);
  const [subPath, setSubPath] = useState<string>(settings.subPath);
  const [telegramToken, setTelegramToken] = useState<string>(settings.telegramBotToken);
  const [telegramChatId, setTelegramChatId] = useState<string>(settings.telegramChatId);
  const [telegramAlerts, setTelegramAlerts] = useState<boolean>(settings.telegramAlerts);
  const [autoPingInterval, setAutoPingInterval] = useState<number>(settings.autoPingInterval);

  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      panelPort: Number(panelPort),
      webBasePath,
      subDomain,
      subPort: Number(subPort),
      subPath,
      telegramBotToken: telegramToken,
      telegramChatId,
      telegramAlerts,
      autoPingInterval: Number(autoPingInterval)
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleBackupExport = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      nodes,
      inbounds,
      clients,
      settings
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `3x-ui-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded">
              تنظیمات عمومی و امنیت
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Server className="w-5 h-5 text-amber-400" />
            {lang === 'fa' ? 'تنظیمات پنل و هشدارهای تلگرام' : 'Panel & Security Settings'}
          </h1>
          <p className="text-xs text-slate-400">
            {lang === 'fa'
              ? 'پیکربندی پورت وب پنل، دامنه سابسکرایب، اتصال به ربات تلگرام و پشتیبان‌گیری دیتابیس'
              : 'Configure web panel port, sub domain, Telegram alerts, and backups.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Panel & Web Settings */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Server className="w-4 h-4 text-amber-400" />
            {lang === 'fa' ? 'تنظیمات وب‌پنل و آدرس‌ها' : 'Web Panel Network'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {lang === 'fa' ? 'پورت وب‌پنل (Panel Port):' : 'Panel Port:'}
              </label>
              <input
                type="number"
                value={panelPort}
                onChange={(e) => setPanelPort(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {lang === 'fa' ? 'مسیر ریشه وب (Base Path):' : 'Web Base Path:'}
              </label>
              <input
                type="text"
                value={webBasePath}
                onChange={(e) => setWebBasePath(e.target.value)}
                placeholder="/"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {lang === 'fa' ? 'دامنه سابسکرایب (Sub Domain):' : 'Subscription Domain:'}
              </label>
              <input
                type="text"
                value={subDomain}
                onChange={(e) => setSubDomain(e.target.value)}
                placeholder="sub.speed-xray.net"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {lang === 'fa' ? 'پورت سابسکرایب (Sub Port):' : 'Sub Port:'}
              </label>
              <input
                type="number"
                value={subPort}
                onChange={(e) => setSubPort(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {lang === 'fa' ? 'دوره تست خودکار پینگ (دقیقه):' : 'Auto Ping Interval (min):'}
              </label>
              <input
                type="number"
                value={autoPingInterval}
                onChange={(e) => setAutoPingInterval(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Telegram Bot Alerts */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Send className="w-4 h-4 text-sky-400" />
              {lang === 'fa' ? 'اطلاع‌رسانی ربات تلگرام' : 'Telegram Bot Notifications'}
            </h3>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={telegramAlerts}
                onChange={(e) => setTelegramAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Telegram Bot Token:
              </label>
              <input
                type="text"
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                placeholder="678912345:AAHxxx_your_bot_token"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Admin Chat ID:
              </label>
              <input
                type="text"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder="123456789"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {lang === 'fa'
              ? 'ارسال پیام لحظه‌ای هنگام اتمام حجم کاربر، ورود به پنل، قطعی نودها یا انقضای زمان اکانت.'
              : 'Alerts sent on quota exhaustion, panel login, and node degradation.'}
          </p>
        </div>

        {/* Database Backup & Restore */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            {lang === 'fa' ? 'پشتیبان‌گیری و بازگردانی دیتابیس (Backup / Restore)' : 'Database Backup & Restore'}
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleBackupExport}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'fa' ? 'دانلود بکاپ کامل (JSON)' : 'Download Full Backup (JSON)'}</span>
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" />
              {lang === 'fa' ? 'تنظیمات با موفقیت ذخیره شد!' : 'Settings Saved!'}
            </span>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{lang === 'fa' ? 'ذخیره تنظیمات' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
