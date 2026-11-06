import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Edit2,
  ExternalLink,
  Layers,
  Plus,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
  Zap
} from 'lucide-react';
import { useXray } from '../context/XrayContext';
import { Inbound, Client } from '../types/xray';
import { formatBytes } from '../utils/xrayCoreGenerator';
import { InboundModal } from './Modals/InboundModal';
import { ClientModal } from './Modals/ClientModal';
import { QrModal } from './Modals/QrModal';

export const InboundsView: React.FC = () => {
  const {
    inbounds,
    clients,
    deleteInbound,
    toggleInbound,
    lang
  } = useXray();

  const [isInboundModalOpen, setIsInboundModalOpen] = useState<boolean>(false);
  const [inboundToEdit, setInboundToEdit] = useState<Inbound | null>(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);
  const [selectedInboundForClient, setSelectedInboundForClient] = useState<number | undefined>(undefined);

  const [qrModalData, setQrModalData] = useState<{
    isOpen: boolean;
    title: string;
    client?: Client;
    inbound?: Inbound;
  }>({
    isOpen: false,
    title: ''
  });

  const handleOpenAdd = () => {
    setInboundToEdit(null);
    setIsInboundModalOpen(true);
  };

  const handleOpenEdit = (inb: Inbound) => {
    setInboundToEdit(inb);
    setIsInboundModalOpen(true);
  };

  const handleAddClientToInbound = (inboundId: number) => {
    setSelectedInboundForClient(inboundId);
    setIsClientModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded">
              مدیریت پروتکل‌ها و درگاه‌ها
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            {lang === 'fa' ? 'اینباندهای سرور (Inbounds)' : 'Inbounds Manager'}
          </h1>
          <p className="text-xs text-slate-400">
            {lang === 'fa'
              ? 'پیکربندی پورت‌ها، پروتکل‌های VLESS Reality, VMess, Trojan, Shadowsocks و استتار ترافیک'
              : 'Configure ports, protocols, reality keys, and transmission channels.'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'fa' ? 'افزودن اینباند جدید' : 'Add New Inbound'}</span>
        </button>
      </div>

      {/* Inbounds Cards / Table */}
      <div className="space-y-4">
        {inbounds.map((inb) => {
          const inbClients = clients.filter((c) => c.inboundId === inb.id);
          const isReality = inb.streamSettings.security === 'reality';
          const isTls = inb.streamSettings.security === 'tls';

          return (
            <div
              key={inb.id}
              className={`p-5 bg-slate-900/90 border rounded-2xl transition-all ${
                inb.enable ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/40 opacity-60'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Protocol Info */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">{inb.remark}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase">
                        {inb.protocol}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        Port: {inb.port}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase">
                        {inb.streamSettings.network}
                      </span>
                      {isReality && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Reality (Stealth)
                        </span>
                      )}
                      {isTls && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          TLS
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
                      {isReality && inb.streamSettings.realitySettings && (
                        <span>
                          <strong className="text-slate-300">SNI:</strong>{' '}
                          {inb.streamSettings.realitySettings.serverNames[0]}
                        </span>
                      )}
                      {inb.streamSettings.wsSettings && (
                        <span>
                          <strong className="text-slate-300">Path:</strong>{' '}
                          {inb.streamSettings.wsSettings.path}
                        </span>
                      )}
                      {inb.streamSettings.grpcSettings && (
                        <span>
                          <strong className="text-slate-300">Service:</strong>{' '}
                          {inb.streamSettings.grpcSettings.serviceName}
                        </span>
                      )}
                      <span>
                        <strong className="text-slate-300">{lang === 'fa' ? 'تعداد کاربران:' : 'Clients:'}</strong>{' '}
                        {inbClients.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Traffic summary & Controls */}
                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  {/* Traffic badge */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono">
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <ArrowDown className="w-3 h-3" />
                      {formatBytes(inb.down)}
                    </span>
                    <span className="text-slate-600">/</span>
                    <span className="text-sky-400 flex items-center gap-0.5">
                      <ArrowUp className="w-3 h-3" />
                      {formatBytes(inb.up)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleAddClientToInbound(inb.id)}
                      className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-xl border border-amber-500/30 transition-colors flex items-center gap-1"
                      title="افزودن کاربر به این اینباند"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{lang === 'fa' ? 'افزودن کاربر' : 'Add Client'}</span>
                    </button>

                    {inbClients.length > 0 && (
                      <button
                        onClick={() => {
                          setQrModalData({
                            isOpen: true,
                            title: `بارکد کانفیگ ${inbClients[0].email} (${inb.remark})`,
                            client: inbClients[0],
                            inbound: inb
                          });
                        }}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
                        title="نمایش بارکد و لینک کانفیگ"
                      >
                        <QrCode className="w-4 h-4 text-amber-400" />
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenEdit(inb)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
                      title="ویرایش"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => toggleInbound(inb.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                        inb.enable
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                      }`}
                    >
                      {inb.enable ? (lang === 'fa' ? 'فعال' : 'Active') : (lang === 'fa' ? 'غیرفعال' : 'Disabled')}
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(lang === 'fa' ? 'آیا از حذف این اینباند اطمینان دارید؟' : 'Delete this inbound?')) {
                          deleteInbound(inb.id);
                        }
                      }}
                      className="p-2 text-rose-400 hover:text-white rounded-xl hover:bg-rose-500/20 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Connected clients small pills */}
              {inbClients.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-500" />
                    {lang === 'fa' ? 'کاربران این اینباند:' : 'Users:'}
                  </span>
                  {inbClients.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setQrModalData({
                          isOpen: true,
                          title: `کانفیگ کاربر ${c.email}`,
                          client: c,
                          inbound: inb
                        });
                      }}
                      className="px-2 py-0.5 text-[11px] bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      <span>{c.email}</span>
                      <QrCode className="w-3 h-3 text-amber-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Inbound Modal */}
      {isInboundModalOpen && (
        <InboundModal
          isOpen={isInboundModalOpen}
          onClose={() => setIsInboundModalOpen(false)}
          inboundToEdit={inboundToEdit}
        />
      )}

      {/* Client Modal */}
      {isClientModalOpen && (
        <ClientModal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
          defaultInboundId={selectedInboundForClient}
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
        />
      )}
    </div>
  );
};
