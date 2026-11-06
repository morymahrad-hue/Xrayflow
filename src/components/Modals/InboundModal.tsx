import React, { useState } from 'react';
import { X, Key, RefreshCw, Zap, ShieldCheck } from 'lucide-react';
import { Inbound, ProtocolType, NetworkType, SecurityType } from '../../types/xray';
import { generateRealityKeyPair, generateShortId } from '../../utils/xrayCoreGenerator';
import { useXray } from '../../context/XrayContext';

interface InboundModalProps {
  isOpen: boolean;
  onClose: () => void;
  inboundToEdit?: Inbound | null;
}

export const InboundModal: React.FC<InboundModalProps> = ({
  isOpen,
  onClose,
  inboundToEdit
}) => {
  const { addInbound, updateInbound, lang } = useXray();

  const [remark, setRemark] = useState<string>(inboundToEdit?.remark || 'VLESS Reality Main');
  const [protocol, setProtocol] = useState<ProtocolType>(inboundToEdit?.protocol || 'vless');
  const [port, setPort] = useState<number>(inboundToEdit?.port || 443);
  const [network, setNetwork] = useState<NetworkType>(inboundToEdit?.streamSettings.network || 'tcp');
  const [security, setSecurity] = useState<SecurityType>(inboundToEdit?.streamSettings.security || 'reality');

  // Reality settings
  const [realityDest, setRealityDest] = useState<string>(
    inboundToEdit?.streamSettings.realitySettings?.dest || 'speed.cloudflare.com:443'
  );
  const [realitySni, setRealitySni] = useState<string>(
    inboundToEdit?.streamSettings.realitySettings?.serverNames.join(', ') || 'speed.cloudflare.com, www.microsoft.com'
  );
  const [realityPrivKey, setRealityPrivKey] = useState<string>(
    inboundToEdit?.streamSettings.realitySettings?.privateKey || 'yE0l2_sample_private_key_x25519_3xui'
  );
  const [realityPubKey, setRealityPubKey] = useState<string>(
    inboundToEdit?.streamSettings.realitySettings?.publicKey || 'l34h7tK_sample_public_key_reality_3xui'
  );
  const [realityShortIds, setRealityShortIds] = useState<string>(
    inboundToEdit?.streamSettings.realitySettings?.shortIds.join(', ') || '6b8e, 91a4'
  );

  // WS / gRPC
  const [wsPath, setWsPath] = useState<string>(inboundToEdit?.streamSettings.wsSettings?.path || '/v2ray-ws');
  const [wsHost, setWsHost] = useState<string>(inboundToEdit?.streamSettings.wsSettings?.headers?.Host || 'cdn.cloudflare.net');
  const [grpcService, setGrpcService] = useState<string>(inboundToEdit?.streamSettings.grpcSettings?.serviceName || 'xray-grpc');

  // SS Method
  const [ssMethod, setSsMethod] = useState<string>(inboundToEdit?.settings.method || '2022-blake3-aes-128-gcm');
  const [ssPassword, setSsPassword] = useState<string>(inboundToEdit?.settings.password || 'SecretPass123456');

  // Sniffing
  const [sniffing, setSniffing] = useState<boolean>(inboundToEdit?.sniffing.enabled ?? true);

  if (!isOpen) return null;

  const handleGenerateRealityKeys = () => {
    const keys = generateRealityKeyPair();
    setRealityPrivKey(keys.privateKey);
    setRealityPubKey(keys.publicKey);
    setRealityShortIds(`${generateShortId()}, ${generateShortId()}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const streamSettings = {
      network,
      security,
      realitySettings:
        security === 'reality'
          ? {
              show: false,
              dest: realityDest,
              xver: 0,
              serverNames: realitySni.split(',').map((s) => s.trim()).filter(Boolean),
              privateKey: realityPrivKey,
              publicKey: realityPubKey,
              shortIds: realityShortIds.split(',').map((s) => s.trim()).filter(Boolean),
              spiderX: '/'
            }
          : undefined,
      wsSettings:
        network === 'ws'
          ? {
              path: wsPath,
              headers: { Host: wsHost }
            }
          : undefined,
      grpcSettings:
        network === 'grpc'
          ? {
              serviceName: grpcService,
              multiMode: true
            }
          : undefined,
      tlsSettings:
        security === 'tls'
          ? {
              serverName: wsHost || 'your-domain.com',
              alpn: ['h2', 'http/1.1']
            }
          : undefined
    };

    if (inboundToEdit) {
      updateInbound({
        ...inboundToEdit,
        remark,
        port: Number(port),
        protocol,
        streamSettings,
        settings: {
          ...inboundToEdit.settings,
          method: protocol === 'shadowsocks' ? ssMethod : undefined,
          password: protocol === 'shadowsocks' || protocol === 'trojan' ? ssPassword : undefined
        },
        sniffing: {
          enabled: sniffing,
          destOverride: ['http', 'tls', 'quic']
        }
      });
    } else {
      addInbound({
        remark,
        enable: true,
        port: Number(port),
        protocol,
        settings: {
          clients: [],
          decryption: 'none',
          fallbacks: [{ dest: realityDest, xver: 0 }],
          method: protocol === 'shadowsocks' ? ssMethod : undefined,
          password: protocol === 'shadowsocks' || protocol === 'trojan' ? ssPassword : undefined
        },
        streamSettings,
        sniffing: {
          enabled: sniffing,
          destOverride: ['http', 'tls', 'quic']
        },
        total: 0
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-100">
              {inboundToEdit
                ? lang === 'fa' ? 'ویرایش اینباند Xray' : 'Edit Inbound'
                : lang === 'fa' ? 'افزودن اینباند جدید (VLESS, VMess, Trojan, SS)' : 'Add New Inbound'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Remark & Port */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {lang === 'fa' ? 'نام اینباند (Remark):' : 'Remark Name:'}
              </label>
              <input
                type="text"
                required
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="VLESS Reality 443"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {lang === 'fa' ? 'پورت ورودی (Port):' : 'Port:'}
              </label>
              <input
                type="number"
                required
                min={1}
                max={65535}
                value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Protocol, Network, Security */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {lang === 'fa' ? 'پروتکل (Protocol):' : 'Protocol:'}
              </label>
              <select
                value={protocol}
                onChange={(e) => {
                  const p = e.target.value as ProtocolType;
                  setProtocol(p);
                  if (p === 'vless') {
                    setSecurity('reality');
                    setNetwork('tcp');
                  } else if (p === 'vmess') {
                    setSecurity('tls');
                    setNetwork('ws');
                  } else if (p === 'trojan') {
                    setSecurity('tls');
                    setNetwork('tcp');
                  } else if (p === 'shadowsocks') {
                    setSecurity('none');
                    setNetwork('tcp');
                  }
                }}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-amber-400 font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value="vless">VLESS (Modern / Reality)</option>
                <option value="vmess">VMess (WS / CDN / gRPC)</option>
                <option value="trojan">Trojan (TLS / gRPC)</option>
                <option value="shadowsocks">Shadowsocks (2022)</option>
                <option value="socks">SOCKS5</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {lang === 'fa' ? 'شبکه انتقال (Transmission):' : 'Network:'}
              </label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value as NetworkType)}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="tcp">TCP (Direct / XTLS)</option>
                <option value="ws">WebSocket (CDN Friendly)</option>
                <option value="grpc">gRPC (Fast Multiplex)</option>
                <option value="splithttp">SplitHTTP (Xray 1.8+)</option>
                <option value="http">HTTP</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {lang === 'fa' ? 'امنیت و استتار (Security):' : 'Security:'}
              </label>
              <select
                value={security}
                onChange={(e) => setSecurity(e.target.value as SecurityType)}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="reality">Reality (Anti-GFW Stealth)</option>
                <option value="tls">TLS (Standard Cert)</option>
                <option value="none">None (Plaintext)</option>
              </select>
            </div>
          </div>

          {/* REALITY Settings Section */}
          {security === 'reality' && (
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  {lang === 'fa' ? 'تنظیمات Xray Reality (ضد فیلترینگ پیشرفته)' : 'Xray Reality Settings'}
                </span>
                <button
                  type="button"
                  onClick={handleGenerateRealityKeys}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg border border-amber-500/30 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  {lang === 'fa' ? 'تولید کلیدهای جدید (x25519)' : 'Generate Keys'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Dest (وب‌سایت استتار / Fallback):
                  </label>
                  <input
                    type="text"
                    value={realityDest}
                    onChange={(e) => setRealityDest(e.target.value)}
                    placeholder="speed.cloudflare.com:443"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    ServerNames (SNI کاما جدا شده):
                  </label>
                  <input
                    type="text"
                    value={realitySni}
                    onChange={(e) => setRealitySni(e.target.value)}
                    placeholder="speed.cloudflare.com, www.microsoft.com"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Public Key (کلید عمومی برای کلاینت):
                  </label>
                  <input
                    type="text"
                    value={realityPubKey}
                    onChange={(e) => setRealityPubKey(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-amber-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Private Key (کلید خصوصی سرور):
                  </label>
                  <input
                    type="text"
                    value={realityPrivKey}
                    onChange={(e) => setRealityPrivKey(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Short IDs (شناسه‌های کوتاه هگز):
                </label>
                <input
                  type="text"
                  value={realityShortIds}
                  onChange={(e) => setRealityShortIds(e.target.value)}
                  placeholder="6b8e, 91a4, c0f3"
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200"
                />
              </div>
            </div>
          )}

          {/* WebSocket Settings */}
          {network === 'ws' && (
            <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-3">
              <span className="text-xs font-semibold text-slate-300">
                {lang === 'fa' ? 'تنظیمات WebSocket:' : 'WebSocket Settings:'}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Path (مسیر):</label>
                  <input
                    type="text"
                    value={wsPath}
                    onChange={(e) => setWsPath(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Host Header (دامنه CDN):</label>
                  <input
                    type="text"
                    value={wsHost}
                    onChange={(e) => setWsHost(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* gRPC Settings */}
          {network === 'grpc' && (
            <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-slate-300">gRPC Service:</span>
              <input
                type="text"
                value={grpcService}
                onChange={(e) => setGrpcService(e.target.value)}
                placeholder="xray-grpc-service"
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200"
              />
            </div>
          )}

          {/* Sniffing Checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="sniffing"
              checked={sniffing}
              onChange={(e) => setSniffing(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500"
            />
            <label htmlFor="sniffing" className="text-xs text-slate-300 cursor-pointer">
              {lang === 'fa' ? 'فعال‌سازی Sniffing (تشخیص خودکار پروتکل TLS/HTTP و جلوگیری از DNS Leak)' : 'Enable Sniffing (TLS/HTTP/QUIC)'}
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors"
            >
              {lang === 'fa' ? 'انصراف' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              {inboundToEdit
                ? lang === 'fa' ? 'ذخیره تغییرات' : 'Save Changes'
                : lang === 'fa' ? 'ایجاد اینباند' : 'Create Inbound'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
