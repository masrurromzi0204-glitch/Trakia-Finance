import React from 'react';
import { PiggyBank, ChevronRight, Plus, Wallet, MapPin } from 'lucide-react';
import { formatIDR } from '../utils/formatters';

export default function SavingsPage({ savings = [], savingsLogs = [], totalSavingsBalance = 0, hideBalance, onSelectSaving, onOpenNewSaving }) {
  return (
    <div className="px-5 pt-4 space-y-5 pb-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500 leading-relaxed flex-1">
          Sisihkan uang dari kantung dompetmu untuk tujuan tabungan. Saat menabung, saldo kantung sumber otomatis berkurang.
        </p>
        <button
          onClick={onOpenNewSaving}
          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-amber-500/20 shrink-0"
        >
          <Plus size={14} /> Buat Tabungan
        </button>
      </div>

      {/* Kartu Total Tabungan Terkumpul */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-[#1D63DC] text-white rounded-[26px] p-5 shadow-[0_10px_25px_-5px_rgba(245,158,11,0.3)]">
        <div className="flex items-center gap-2 text-white/90 text-xs font-semibold uppercase tracking-wider">
          <PiggyBank size={16} />
          <span>Total Saldo Seluruh Tabungan</span>
        </div>
        <h3 className="text-3xl font-extrabold mt-1.5">
          {hideBalance ? 'Rp •••••••' : `Rp ${formatIDR(totalSavingsBalance)}`}
        </h3>
        <div className="mt-3 pt-2.5 border-t border-white/20 flex justify-between text-xs text-white/90">
          <span>Pos Tabungan Aktif: <strong>{savings.length} Tujuan</strong></span>
          <span>Ketuk kartu untuk setor / tarik</span>
        </div>
      </div>

      <div className="space-y-3">
        {savings.map((s) => {
          const target = Number(s.targetAmount) || 0;
          const collected = Number(s.collectedAmount) || 0;
          const pct = target > 0 ? Math.min(100, Math.round((collected / target) * 100)) : 0;
          const isDone = target > 0 && collected >= target;

          const logsForSaving = savingsLogs.filter(l => l.savingId === s.id);
          const sourceWallets = Array.from(new Set(logsForSaving.map(l => l.walletName).filter(Boolean)));

          return (
            <div
              key={s.id}
              onClick={() => onSelectSaving(s.id)}
              className="bg-white p-4 rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 cursor-pointer hover:border-amber-300 active:scale-[0.99] transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    isDone ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : 'bg-gradient-to-br from-amber-500 to-orange-500'
                  }`}>
                    <PiggyBank size={20} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-[#0F172A] text-sm truncate">{s.name}</h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                        <MapPin size={10} />
                        Disimpan di: {s.storedIn || 'Rekening Tabungan'}
                      </span>
                      {sourceWallets.map(wName => (
                        <span key={wName} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D63DC] text-[10px] font-bold">
                          <Wallet size={10} />
                          Dari {wName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isDone && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-extrabold">Tercapai!</span>
                  )}
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
              </div>

              <div className="mt-3.5 space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#0F172A] font-extrabold">
                    Terkumpul: <span className="text-amber-600">Rp {formatIDR(collected)}</span>
                  </span>
                  {target > 0 && <span className="text-slate-400">Target: Rp {formatIDR(target)}</span>}
                </div>
                {target > 0 && (
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isDone ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
                {target > 0 && (
                  <p className="text-[11px] text-slate-400 font-medium text-right">{pct}% dari target</p>
                )}
              </div>
            </div>
          );
        })}

        {savings.length === 0 && (
          <div className="bg-slate-50/70 rounded-3xl p-8 text-center space-y-3 border border-slate-100">
            <PiggyBank size={36} className="mx-auto text-amber-400" />
            <p className="text-slate-500 font-bold text-sm">Belum ada pos tabungan</p>
            <p className="text-xs text-slate-400">
              Buat tabungan baru (misal: Dana Darurat, Beli Gadget, Liburan), pilih kantung dompet yang dipotong, dan catat di mana tabungan tersebut disimpan.
            </p>
            <button
              onClick={onOpenNewSaving}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <Plus size={15} /> Buat Tabungan Pertama
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
