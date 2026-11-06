import React, { useState } from 'react';
import { X, UserPlus, RefreshCw, Sparkles } from 'lucide-react';
import { Client } from '../../types/xray';
import { generateUUID } from '../../utils/xrayCoreGenerator';
import { useXray } from '../../context/XrayContext';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit?: Client | null;
  defaultInboundId?: number;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  clientToEdit,
  defaultInboundId
}) => {
  const { inbounds, addClient, updateClient, lang } = useXray();

  const [email, setEmail] = useState<string>(clientToEdit?.email || '');
  const [inboundId, setInboundId] = useState<number>(clientToEdit?.inboundId || defaultInboundId || inbounds[0]?.id || 1);
  const [flow, setFlow] = useState<string>(clientToEdit?.flow || 'xtls-rprx-vision');
  const [totalGB, setTotalGB] = useState<number>(clientToEdit?.totalGB || 50);
  const [daysValid, setDaysValid] = useState<number>(30);
  const [limitIp, setLimitIp] = useState<number>(clientToEdit?.limitIp || 2);
  const [notes, setNotes] = useState<string>(clientToEdit?.notes || '');
  const [customUuid, setCustomUuid] = useState<string>(clientToEdit?.id || generateUUID());

  if (!isOpen) return null;

  const handleRegenerateUuid = () => {
    setCustomUuid(generateUUID());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const expiryTime = daysValid > 0 ? Date.now() + daysValid * 86400000 : 0;
    const subId = clientToEdit?.subId || `sub_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${customUuid.slice(0, 4)}`;

    if (clientToEdit) {
      updateClient({
        ...clientToEdit,
        email,
        inboundId: Number(inboundId),
        flow: flow as 'xtls-rprx-vision' | 'none' | '',
        totalGB: Number(totalGB),
        limitIp: Number(limitIp),
        notes,
        expiryTime: daysValid > 0 ? expiryTime : clientToEdit.expiryTime
      });
    } else {
      addClient({
        email,
        inboundId: Number(inboundId),
        flow: flow as 'xtls-rprx-vision' | 'none' | '',
        totalGB: Number(totalGB),
        limitIp: Number(limitIp),
        expiryTime,
        enable: true,
        subId,
        notes
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-100">
              {clientToEdit
                ? lang === 'fa' ? 'ویرایش مشخصات کاربر' : 'Edit Client'
                : lang === 'fa' ? 'افزودن کاربر جدید' : 'Add New Client'}
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              {lang === 'fa' ? 'نام کاربری / ایمیل (شناسه):' : 'Username / Email identifier:'}
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user_john_doe"
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              {lang === 'fa' ? 'اینباند پیش‌فرض (پروتکل):' : 'Assigned Inbound:'}
            </label>
            <select
              value={inboundId}
              onChange={(e) => setInboundId(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-amber-400 font-semibold focus:outline-none focus:border-amber-500"
            >
              {inbounds.map((inb) => (
                <option key={inb.id} value={inb.id}>
                  #{inb.id} - {inb.remark} ({inb.protocol.toUpperCase()} : {inb.port})
                </option>
              ))}
            </select>
          </div>

          {/* UUID */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-400">
                {lang === 'fa' ? 'شناسه یکتا (UUID):' : 'Client UUID:'}
              </label>
              {!clientToEdit && (
                <button
                  type="button"
                  onClick={handleRegenerateUuid}
                  className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  {lang === 'fa' ? 'تولید مجدد' : 'Regenerate'}
                </button>
              )}
            </div>
            <input
              type="text"
              readOnly={!!clientToEdit}
              value={customUuid}
              onChange={(e) => setCustomUuid(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Flow & IP limit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {lang === 'fa' ? 'تنظیم Flow (استریم Vision):' : 'Flow:'}
              </label>
              <select
                value={flow}
                onChange={(e) => setFlow(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="xtls-rprx-vision">xtls-rprx-vision (پیشنهادی)</option>
                <option value="none">none (بدون Flow)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {lang === 'fa' ? 'محدودیت تعداد کاربر همزمان (IP Limit):' : 'Simultaneous IP Limit:'}
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={limitIp}
                onChange={(e) => setLimitIp(Number(e.target.value))}
                placeholder="2 (0 = نامحدود)"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Bandwidth & Expiry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {lang === 'fa' ? 'حجم کل (گیگابایت):' : 'Total Bandwidth (GB):'}
              </label>
              <input
                type="number"
                min={0}
                value={totalGB}
                onChange={(e) => setTotalGB(Number(e.target.value))}
                placeholder="50 (0 = نامحدود)"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500">
                {totalGB === 0 ? (lang === 'fa' ? 'نامحدود' : 'Unlimited') : `${totalGB} GB`}
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {lang === 'fa' ? 'اعتبار (تعداد روز):' : 'Validity (Days):'}
              </label>
              <input
                type="number"
                min={0}
                value={daysValid}
                onChange={(e) => setDaysValid(Number(e.target.value))}
                placeholder="30 (0 = بدون انقضا)"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500">
                {daysValid === 0 ? (lang === 'fa' ? 'بدون تاریخ انقضا' : 'No expiration') : `${daysValid} روز از امروز`}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              {lang === 'fa' ? 'توضیحات و یادداشت:' : 'Notes / Remarks:'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثلا: کاربر اشتراک ویژه آلمان و هلند"
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Footer buttons */}
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
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {clientToEdit
                ? lang === 'fa' ? 'ذخیره کاربر' : 'Save Client'
                : lang === 'fa' ? 'افزودن کاربر' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
