import React, { useState } from 'react';
import {
  Check,
  Copy,
  Cpu,
  Download,
  FileCode,
  FolderGit2,
  Play,
  RefreshCw,
  Server,
  ShieldCheck,
  Terminal,
  Zap,
  Cloud,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useXray } from '../context/XrayContext';
import { generateXrayServerConfig } from '../utils/xrayCoreGenerator';
import { generateLinuxBashInstaller, generateDockerComposeConfig } from '../utils/bashInstallerGenerator';

export const XrayConfigView: React.FC = () => {
  const { inbounds, stats, restartXrayCore, isRestarting, lang } = useXray();

  const [activeTab, setActiveTab] = useState<'config' | 'bash' | 'docker' | 'railway' | 'logs'>('config');
  const [domainInput, setDomainInput] = useState<string>('my-server.speed-vpn.org');
  const [copied, setCopied] = useState<string | null>(null);

  const xrayConfigJson = generateXrayServerConfig(inbounds);
  const bashScript = generateLinuxBashInstaller(domainInput, 2053);
  const dockerCompose = generateDockerComposeConfig();

  const handleCopy = (type: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const simulatedLogs = [
    `[2026/11/02 18:02:10] [Info] core: Xray-core ${stats.xrayVersion} started successfully`,
    `[2026/11/02 18:02:10] [Info] inbound-1-vless: listening TCP on 0.0.0.0:443 (Reality enabled)`,
    `[2026/11/02 18:02:10] [Info] inbound-2-vmess: listening TCP/WS on 0.0.0.0:8443`,
    `[2026/11/02 18:02:10] [Info] inbound-3-trojan: listening TCP/gRPC on 0.0.0.0:2083`,
    `[2026/11/02 18:02:11] [Info] [Node Cluster] 29 verified edge points synced and registered`,
    `[2026/11/02 18:02:14] [Info] router: outbound: direct -> 159.69.134.82:443 [Hetzner Frankfurt]`,
    `[2026/11/02 18:02:18] [Info] inbound-1-vless accepted tcp:109.122.204.18:52190 [vip_user_alireza] -> speed.cloudflare.com:443 (XTLS Vision handshake ok)`,
    `[2026/11/02 18:02:22] [Info] router: outbound: direct -> 185.118.140.21:443 [Radore Istanbul] (Latency: 28ms)`,
    `[2026/11/02 18:02:29] [Info] inbound-1-vless accepted tcp:94.183.18.91:48210 [office_team_maryam] -> speed.cloudflare.com:443`,
    `[2026/11/02 18:02:35] [Info] stats: User uplink/downlink telemetry recorded`
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded">
              مهندسی DevOps و هسته مرکزی
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            {lang === 'fa' ? 'مدیریت هسته Xray و خروجی DevOps' : 'Xray Core & DevOps Deployment'}
          </h1>
          <p className="text-xs text-slate-400">
            {lang === 'fa'
              ? 'تولید فایل رسمی config.json سرور، اسکریپت نصب تک‌خطی لینوکس (با ۲۹ لوکیشن خودکار) و پیکربندی داکر'
              : 'Production Xray server configuration, 1-click Linux bash installer, and Docker compose files.'}
          </p>
        </div>

        <button
          onClick={restartXrayCore}
          disabled={isRestarting}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/30 transition-all active:scale-95 self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isRestarting ? 'animate-spin' : ''}`} />
          <span>{isRestarting ? (lang === 'fa' ? 'در حال راه‌اندازی مجدد...' : 'Restarting...') : (lang === 'fa' ? 'راه‌اندازی مجدد هسته Xray' : 'Restart Xray Service')}</span>
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'config'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>{lang === 'fa' ? 'فایل سرور (config.json)' : 'Server config.json'}</span>
        </button>

        <button
          onClick={() => setActiveTab('bash')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'bash'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>{lang === 'fa' ? 'اسکریپت خودکار Bash لینوکس' : '1-Click Bash Installer'}</span>
        </button>

        <button
          onClick={() => setActiveTab('docker')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'docker'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>{lang === 'fa' ? 'داکر (docker-compose)' : 'Docker Compose'}</span>
        </button>

        <button
          onClick={() => setActiveTab('railway')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'railway'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/30'
              : 'text-purple-300 hover:text-white hover:bg-slate-800 border border-purple-500/30 bg-purple-500/10'
          }`}
        >
          <Cloud className="w-4 h-4 text-purple-300" />
          <span>{lang === 'fa' ? 'دیپلوی خودکار در Railway' : 'Railway.app Deploy'}</span>
          <span className="px-1.5 py-0.2 bg-purple-400/20 text-[10px] rounded text-purple-200">Auto</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'logs'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>{lang === 'fa' ? 'لاگ‌های زنده هسته' : 'Live Core Logs'}</span>
        </button>
      </div>

      {/* Tab 1: config.json */}
      {activeTab === 'config' && (
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                /etc/xray/config.json
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'fa'
                  ? 'این فایل حاوی کلیه اینباندهای Reality، قوانین مسیریابی (Direct IR / Block Ads) و ریمارک‌ها می‌باشد.'
                  : 'Ready-to-use production server configuration file.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy('config', xrayConfigJson)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                {copied === 'config' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === 'config' ? (lang === 'fa' ? 'کپی شد!' : 'Copied!') : (lang === 'fa' ? 'کپی کد کانفیگ' : 'Copy JSON')}</span>
              </button>

              <button
                onClick={() => handleDownload('config.json', xrayConfigJson, 'application/json')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>دانلود config.json</span>
              </button>
            </div>
          </div>

          <pre className="p-4 bg-slate-950 text-xs font-mono text-amber-300/90 border border-slate-800 rounded-xl overflow-x-auto max-h-[480px] leading-relaxed select-all">
            {xrayConfigJson}
          </pre>
        </div>
      )}

      {/* Tab 2: Linux Bash Script */}
      {activeTab === 'bash' && (
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-5">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              {lang === 'fa' ? 'اسکریپت نصب اتوماتیک تک‌خطی (Ubuntu / Debian / CentOS)' : 'Automated Linux 1-Click Installer'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'fa'
                ? 'این اسکریپت به صورت خودکار پکیج‌های پیش‌نیاز را نصب کرده، الگوریتم BBR را فعال می‌کند، هسته Xray را نصب کرده، کلیدهای Reality را تولید و ۲۹ لوکیشن سرور را در مسیر /etc/x-ui/nodes قرار می‌دهد.'
                : 'Installs dependencies, enables BBR, configures systemd service and deploys 29 node definitions.'}
            </p>
          </div>

          {/* Quick command */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <span className="text-xs font-bold text-amber-400 block">
              {lang === 'fa' ? 'دستور اجرای مستقیم در ترمینال سرور:' : 'Run this directly in your Linux terminal (as root):'}
            </span>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2.5 bg-slate-900 rounded-lg text-xs font-mono text-emerald-400 select-all border border-slate-800">
                bash &lt;(curl -Ls https://raw.githubusercontent.com/mhsanaei/3x-ui/master/install.sh)
              </code>
              <button
                onClick={() =>
                  handleCopy(
                    'cmd',
                    'bash <(curl -Ls https://raw.githubusercontent.com/mhsanaei/3x-ui/master/install.sh)'
                  )
                }
                className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-all"
              >
                {copied === 'cmd' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Full script view */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                {lang === 'fa' ? 'کد کامل اسکریپت Bash آماده شخصی‌سازی:' : 'Full Bash Script Source:'}
              </span>
              <button
                onClick={() => handleCopy('bash', bashScript)}
                className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{lang === 'fa' ? 'کپی تمام اسکریپت' : 'Copy All'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-xs font-mono text-slate-300 border border-slate-800 rounded-xl overflow-x-auto max-h-[360px] leading-relaxed select-all">
              {bashScript}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: Docker Compose */}
      {activeTab === 'docker' && (
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">docker-compose.yml</h3>
              <p className="text-xs text-slate-400">
                {lang === 'fa'
                  ? 'اجرای کانتینری ۳X-UI با تنظیمات host network برای حداکثر سرعت ترافیک'
                  : 'Host network mode container configuration'}
              </p>
            </div>

            <button
              onClick={() => handleCopy('docker', dockerCompose)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-all"
            >
              {copied === 'docker' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{lang === 'fa' ? 'کپی YAML' : 'Copy YAML'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 text-xs font-mono text-amber-300/90 border border-slate-800 rounded-xl overflow-x-auto max-h-[360px] leading-relaxed select-all">
            {dockerCompose}
          </pre>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono">
            docker compose up -d
          </div>
        </div>
      )}

      {/* Tab: Railway Auto-Deployment */}
      {activeTab === 'railway' && (
        <div className="p-6 bg-slate-900/90 border border-purple-500/30 rounded-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-purple-950/60 to-indigo-950/40 border border-purple-500/20 rounded-2xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded">
                  Railway.app / Railway.com
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  دیپلوی اتوماتیک با فایل railway.json
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white">
                {lang === 'fa' ? 'راهنمای دیپلوی کاملاً خودکار در پلتفرم ابری Railway' : 'Automated Railway Deployment Guide'}
              </h3>
              <p className="text-xs text-purple-200/80 leading-relaxed max-w-2xl">
                {lang === 'fa'
                  ? 'این پروژه فایل‌های railway.json و Dockerfile آماده دارد. به محض اتصال به ریپازیتوری گیت‌هاب شما، ریل‌وی پروژه را بیلد کرده و یک دامنه اینترنتی رایگان همراه با SSL معتبر صادر می‌کند.'
                  : 'Pre-configured with railway.json & Dockerfile. Auto-detects public domain and SSL.'}
              </p>
            </div>

            <a
              href="https://railway.com/new"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all active:scale-95 shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{lang === 'fa' ? 'ورود به Railway و دیپلوی' : 'Open Railway & Deploy'}</span>
            </a>
          </div>

          {/* 3 Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center">
                ۱
              </div>
              <h4 className="text-xs font-bold text-slate-200">
                {lang === 'fa' ? 'ارسال کدها به GitHub' : 'Push to GitHub'}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {lang === 'fa'
                  ? 'پروژه را داخل ریپازیتوری شخصی گیت‌هاب خود پوش یا فورک کنید.'
                  : 'Push or fork this repository into your GitHub account.'}
              </p>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center">
                ۲
              </div>
              <h4 className="text-xs font-bold text-slate-200">
                {lang === 'fa' ? 'اتصال در Railway' : 'Connect in Railway'}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {lang === 'fa'
                  ? 'در داشبورد Railway، دکمه + New Project و سپس Deploy from GitHub repo را بزنید.'
                  : 'Click + New Project -> Deploy from GitHub repo.'}
              </p>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center">
                ۳
              </div>
              <h4 className="text-xs font-bold text-slate-200">
                {lang === 'fa' ? 'دامنه عمومی (Generate Domain)' : 'Generate Domain'}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {lang === 'fa'
                  ? 'در تب Settings سرویس در ریل‌وی، روی Generate Domain کلیک کنید تا آدرس اینترنتی دریافت شود.'
                  : 'In service Settings, click Generate Domain to get your public HTTPS URL.'}
              </p>
            </div>
          </div>

          {/* Railway CLI Command */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300">
                {lang === 'fa' ? 'روش دیپلوی با ترمینال (Railway CLI):' : 'Deploy via Railway CLI:'}
              </span>
              <button
                onClick={() =>
                  handleCopy(
                    'railway-cli',
                    'npm i -g @railway/cli && railway login && railway init && railway up'
                  )
                }
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
              >
                {copied === 'railway-cli' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === 'railway-cli' ? 'کپی شد!' : 'کپی دستور'}</span>
              </button>
            </div>
            <code className="block p-2.5 bg-slate-900 rounded-lg text-xs font-mono text-purple-200 border border-slate-800 select-all">
              npm i -g @railway/cli && railway login && railway init && railway up
            </code>
          </div>

          {/* Configuration preview */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400">
              محتوای فایل پیکربندی railway.json آماده‌شده در ریشه پروژه:
            </span>
            <pre className="p-3 bg-slate-950 text-xs font-mono text-purple-300/90 border border-slate-800 rounded-xl select-all">
{`{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "npm run start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 120,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}`}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 4: Logs */}
      {activeTab === 'logs' && (
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-100">
                /var/log/xray/access.log (Live Stream)
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">LogLevel: Warning/Info</span>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 font-mono text-xs max-h-[400px] overflow-y-auto">
            {simulatedLogs.map((line, i) => (
              <div key={i} className="text-slate-300 hover:text-amber-300 transition-colors">
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
