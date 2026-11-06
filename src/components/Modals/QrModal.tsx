import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, X, Download, ShieldCheck, Globe, Smartphone, Laptop } from 'lucide-react';
import { NodeLocation, Client, Inbound } from '../../types/xray';
import { buildClientUri } from '../../utils/xrayCoreGenerator';
import { useXray } from '../../context/XrayContext';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialUri?: string;
  client?: Client;
  inbound?: Inbound;
}

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  title,
  initialUri,
  client,
  inbound
}) => {
  const { nodes, lang } = useXray();
  const [selectedNodeId, setSelectedNodeId] = useState<string>(nodes[0]?.id || '');
  const [currentUri, setCurrentUri] = useState<string>(initialUri || '');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (client && inbound) {
      const targetNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
      if (targetNode) {
        const uri = buildClientUri(inbound, client, targetNode);
        setCurrentUri(uri);
      }
    } else if (initialUri) {
      setCurrentUri(initialUri);
    }
  }, [selectedNodeId, client, inbound, initialUri, nodes]);

  useEffect(() => {
    if (!currentUri) return;
    QRCode.toDataURL(currentUri, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [currentUri]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `3xui-config-${client?.email || 'link'}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">{title}</h3>
              <p className="text-xs text-slate-400">
                {lang === 'fa' ? 'اسکن با دوربین گوشی یا کپی مستقیم' : 'Scan with mobile or copy link'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Node Selector (if applicable) */}
          {client && inbound && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                {lang === 'fa' ? 'انتخاب لوکیشن سرور خروجی (از ۲۹ لوکیشن):' : 'Select Server Location (from 29 nodes):'}
              </label>
              <select
                value={selectedNodeId}
                onChange={(e) => setSelectedNodeId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
              >
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.flag} {node.country.split(' ')[0]} - {node.city.split(' ')[0]} ({node.ping}ms - {node.isp.slice(0, 20)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* QR Code Card */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            {qrDataUrl ? (
              <div className="p-3 bg-white rounded-xl shadow-lg border-4 border-amber-500/20">
                <img src={qrDataUrl} alt="QR Code" className="w-52 h-52 object-contain" />
              </div>
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-slate-500">
                {lang === 'fa' ? 'در حال ساخت QR...' : 'Generating QR...'}
              </div>
            )}

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? (lang === 'fa' ? 'کپی شد!' : 'Copied!') : (lang === 'fa' ? 'کپی لینک' : 'Copy Link')}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                {lang === 'fa' ? 'دانلود عکس' : 'Download PNG'}
              </button>
            </div>
          </div>

          {/* Config URL text box */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              {lang === 'fa' ? 'متن کامل کانفیگ (URI):' : 'Full Config URI:'}
            </label>
            <div className="relative">
              <textarea
                readOnly
                value={currentUri}
                rows={3}
                className="w-full p-2.5 bg-slate-950 text-xs font-mono text-amber-300/90 border border-slate-800 rounded-xl resize-none select-all focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Compatibility Tips */}
          <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <Laptop className="w-3.5 h-3.5 text-emerald-400" />
              {lang === 'fa' ? 'سازگار با اپلیکیشن‌های:' : 'Compatible with:'}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              v2rayNG, v2rayN, Shadowrocket, Streisand, FoXray, Sing-box, Clash Meta (Mihomo), Nekoray
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
