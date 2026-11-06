import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Check,
  Copy,
  Edit2,
  Globe,
  Plus,
  QrCode,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  Trash2,
  UserCheck,
  Users,
  UserX
} from 'lucide-react';
import { useXray } from '../context/XrayContext';
import { Client, Inbound } from '../types/xray';
import { formatBytes, buildClientUri } from '../utils/xrayCoreGenerator';
import { ClientModal } from './Modals/ClientModal';
import { QrModal } from './Modals/QrModal';

export const ClientsView: React.FC = () => {
  const {
    clients,
    inbounds,
    nodes,
    settings,
    deleteClient,
    toggleClient,
    resetClientTraffic,
    lang
  } = useXray();

  const [search, setSearch] = useState<string>('');
  const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [qrModalData, setQrModalData] = useState<{
    isOpen: boolean;
    title: string;
    client?: Client;
    inbound?: Inbound;
    uri?: string;
  }>({
    isOpen: false,
    title: ''
  });

  const filteredClients = clients.filter(
    (c) =>
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      (c.notes && c.notes.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setClientToEdit(null);
    setIsClientModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setClientToEdit(client);
    setIsClientModalOpen(true);
  };

  const handleCopySubLink = (client: Client) => {
    const origin = window.location.origin;
    const subUrl = `${origin}/api/sub/${client.subId}`;
    navigator.clipboard.writeText(subUrl);
    setCopiedId(`sub-${client.id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyUri = (client: Client) => {
    const targetInbound = inbounds.find((i) => i.id === client.inboundId) || inbounds[0];
    const targetNode = nodes.find((n) => n.enabledInSub) || nodes[0];
    const uri = buildClientUri(targetInbound, client, targetNode);
    navigator.clipboard.writeText(uri);
    setCopiedId(`uri-${client.id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRemainingDays = (expiryTime: number) => {
    if (!expiryTime || expiryTime === 0) return lang === 'fa' ? 'نامحدود' : 'Unlimited';
    const diff = expiryTime - Date.now();
    if (diff <= 0) return lang === 'fa' ? 'منقضی شده' : 'Expired';
    const days = Math.ceil(diff / 86400000);
    return lang === 'fa' ? `${days} روز مانده` : `${days} days left`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded">
              مدیریت اشتراک کاربران
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            {lang === 'fa' ? 'لیست کاربران و اکانت‌های Xray' : 'Clients & Users'}
          </h1>
          <p className="text-xs text-slate-400">
            {lang === 'fa'
              ? 'تخصیص سقف ترافیک، محدودیت آی‌پی همزمان، ساخت لینک سابسکرایب هوشمند و بارکد اختصاصی ۲۹ لوکیشن'
              : 'Quota management, simultaneous IP limits, subscription links, and multi-location QR codes.'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'fa' ? 'افزودن کاربر جدید' : 'Add New Client'}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 rtl:right-3 ltr:left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'fa' ? 'جستجوی کاربر بر اساس نام، یادداشت، UUID...' : 'Search clients by email, UUID...'}
            className="w-full py-2 pr-9 pl-3 rtl:pr-9 rtl:pl-3 ltr:pl-9 ltr:pr-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          {lang === 'fa' ? 'تعداد کاربران:' : 'Clients count:'}{' '}
          <span className="text-amber-400 font-bold">{clients.length}</span>
        </div>
      </div>

      {/* Clients List */}
      <div className="space-y-4">
        {filteredClients.map((client) => {
          const targetInbound = inbounds.find((i) => i.id === client.inboundId) || inbounds[0];
          const totalUsed = client.up + client.down;
          const quotaBytes = client.totalGB * 1024 * 1024 * 1024;
          const usagePercent = quotaBytes > 0 ? Math.min(100, Math.round((totalUsed / quotaBytes) * 100)) : 0;
          const isExpired = client.expiryTime > 0 && client.expiryTime < Date.now();

          return (
            <div
              key={client.id}
              className={`p-5 bg-slate-900/90 border rounded-2xl transition-all ${
                client.enable && !isExpired
                  ? 'border-slate-800 hover:border-slate-700'
                  : 'border-slate-800/40 opacity-60'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* User Info */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-100 text-sm">{client.email}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase">
                      {targetInbound?.protocol || 'VLESS'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      Inbound: {targetInbound?.remark || `#${client.inboundId}`}
                    </span>
                    {client.flow && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {client.flow}
                      </span>
                    )}
                    {client.limitIp && client.limitIp > 0 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        {client.limitIp} IP Limit
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="font-mono text-slate-500">
                      UUID: {client.id.slice(0, 18)}...
                    </span>
                    {client.notes && (
                      <span className="text-slate-300 font-medium">
                        «{client.notes}»
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      {getRemainingDays(client.expiryTime)}
                    </span>
                  </div>
                </div>

                {/* Quota Progress & Traffic */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="space-y-1.5 min-w-[200px]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{lang === 'fa' ? 'مصرف کل:' : 'Usage:'}</span>
                      <span className="font-mono font-bold text-slate-200">
                        {formatBytes(totalUsed)} / {client.totalGB > 0 ? `${client.totalGB} GB` : '∞'}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          usagePercent > 90
                            ? 'bg-rose-500'
                            : usagePercent > 75
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${client.totalGB > 0 ? usagePercent : 100}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span className="text-sky-400 flex items-center gap-0.5">
                        <ArrowUp className="w-2.5 h-2.5" />
                        {formatBytes(client.up)}
                      </span>
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <ArrowDown className="w-2.5 h-2.5" />
                        {formatBytes(client.down)}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* QR Code & Node Selector */}
                    <button
                      onClick={() => {
                        setQrModalData({
                          isOpen: true,
                          title: `بارکد و کانفیگ اختصاصی ۲۹ لوکیشن (${client.email})`,
                          client: client,
                          inbound: targetInbound
                        });
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-xs font-semibold rounded-xl border border-amber-500/30 transition-colors"
                      title="نمایش بارکد هوشمند با ۲۹ لوکیشن"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{lang === 'fa' ? 'بارکد ۲۹ نود' : 'QR & Nodes'}</span>
                    </button>

                    {/* Copy Sub URL */}
                    <button
                      onClick={() => handleCopySubLink(client)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700 transition-colors"
                      title="کپی لینک سابسکرایب مستقیم"
                    >
                      {copiedId === `sub-${client.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-sky-400" />
                      )}
                      <span>{copiedId === `sub-${client.id}` ? (lang === 'fa' ? 'کپی شد' : 'Copied') : (lang === 'fa' ? 'لینک ساب' : 'Sub URL')}</span>
                    </button>

                    {/* Reset Traffic */}
                    <button
                      onClick={() => resetClientTraffic(client.id)}
                      className="p-2 text-slate-400 hover:text-amber-400 rounded-xl hover:bg-slate-800 transition-colors"
                      title="ریست کردن ترافیک مصرفی به صفر"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    {/* Toggle Active */}
                    <button
                      onClick={() => toggleClient(client.id)}
                      className={`p-2 rounded-xl transition-colors ${
                        client.enable
                          ? 'text-emerald-400 hover:bg-emerald-500/10'
                          : 'text-rose-400 hover:bg-rose-500/10'
                      }`}
                      title={client.enable ? 'غیرفعال‌سازی کاربر' : 'فعال‌سازی مجدد کاربر'}
                    >
                      {client.enable ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => handleOpenEdit(client)}
                      className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                      title="ویرایش کاربر"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        if (confirm(lang === 'fa' ? `آیا از حذف کاربر ${client.email} مطمئن هستید؟` : 'Delete this client?')) {
                          deleteClient(client.id);
                        }
                      }}
                      className="p-2 text-rose-400 hover:text-rose-300 rounded-xl hover:bg-rose-500/10 transition-colors"
                      title="حذف کاربر"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Client Modal */}
      {isClientModalOpen && (
        <ClientModal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
          clientToEdit={clientToEdit}
        />
      )}

      {/* QR Modal */}
      {qrModalData.isOpen && (
        <QrModal
          isOpen={qrModalData.isOpen}
          onClose={() => setQrModalData({ isOpen: false, title: '' })}
          title={qrModalData.title}
          client={qrModalData.client}
          inbound={qrModalData.inbound}
          initialUri={qrModalData.uri}
        />
      )}
    </div>
  );
};
