import React, { useState } from 'react';
import { Plus, Wallet, ArrowUpCircle, ArrowDownCircle, Pencil, ChevronDown, ChevronUp, ArrowLeftRight } from 'lucide-react';
import { formatIDR, formatInputThousand, formatShortDate } from '../utils/formatters';
import { WALLET_PRESETS } from '../utils/constants';

export default function WalletsPage({
  wallets, transactions = [], totalWalletBalance, totalRemainingBudget, totalSavingsBalance = 0, hideBalance,
  onAddWallet, onEditWallet, onPresetWallet, onOpenTransfer, onOpenTxDetail
}) {
  const [expandedWalletId, setExpandedWalletId] = useState(null);

  const badgeColors = [
    'bg-[#EFF6FF] text-[#1D63DC]',
    'bg-[#E6FAF5] text-[#00C49A]',
    'bg-amber-50 text-amber-600',
    'bg-purple-50 text-purple-600',
    'bg-rose-50 text-rose-600',
    'bg-indigo-50 text-indigo-600'
  ];

  const customPresets = ['Gaji Magang', 'Freelance', ...WALLET_PRESETS.filter(p => p !== 'Gaji Magang' && p !== 'Freelance')];

  return (
    <div className="px-5 pt-4 space-y-5 trakia-page-anim">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500">Saldo real & mutasi tiap kantong ({wallets.length} kantong)</p>
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenTransfer && (
            <button
              onClick={() => onOpenTransfer()}
              className="px-3 py-2 bg-[#EFF6FF] hover:bg-blue-100 text-[#1D63DC] border border-blue-200/70 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all active:scale-95"
            >
              <ArrowLeftRight size={13} /> Pindah Saldo
            </button>
          )}
          <button
            onClick={onAddWallet}
            className="px-3.5 py-2 bg-[#1D63DC] hover:bg-blue-700 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Plus size={14} /> Kantong
          </button>
        </div>
      </div>

      {/* Kartu Total Keseluruhan Saldo Dompet */}
      <div className="bg-gradient-to-br from-[#00C49A] via-[#0EA5E9] to-[#1D63DC] text-white rounded-[26px] p-5 shadow-[0_10px_25px_-5px_rgba(29,99,220,0.3)]">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-white/90 font-semibold uppercase tracking-wider">Total Saldo Real Semua Kantong</p>
          {wallets.length >= 2 && onOpenTransfer && (
            <button
              type="button"
              onClick={() => onOpenTransfer()}
              className="px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-[11px] font-extrabold text-white flex items-center gap-1 transition-all"
            >
              <ArrowLeftRight size={11} /> Transfer Antar Kantong
            </button>
          )}
        </div>
        <h3 className="text-3xl font-extrabold mt-1">
          {hideBalance ? 'Rp •••••••' : `Rp ${formatIDR(totalWalletBalance)}`}
        </h3>
        <div className="mt-4 pt-3 border-t border-white/20 grid grid-cols-3 gap-2 text-[11px] text-white/90">
          <div>
            <span className="block text-white/70">Kantong Aktif</span>
            <strong>{wallets.length} Dompet</strong>
          </div>
          <div>
            <span className="block text-white/70">Di Anggaran</span>
            <strong>Rp {formatIDR(totalRemainingBudget)}</strong>
          </div>
          <div>
            <span className="block text-white/70">Di Tabungan</span>
            <strong>Rp {formatIDR(totalSavingsBalance)}</strong>
          </div>
        </div>
      </div>

      {/* Quick Preset */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-400 px-1">Tambah Cepat Kantong Cashflow:</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {customPresets.map((preset) => (
            <button
              key={preset}
              onClick={() => onPresetWallet(preset)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-full text-xs font-bold text-slate-700 shrink-0 hover:border-[#1D63DC] hover:text-[#1D63DC] active:scale-95 transition-all"
            >
              + {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Daftar Kantong Dompet + Tracking Pengeluaran & Pindah Saldo per Kantong */}
      <div className="space-y-3">
        {wallets.map((w, index) => {
          const colorClass = badgeColors[index % badgeColors.length];
          const walletTxs = transactions.filter(t => {
            if (t.type === 'transfer') {
              return t.fromWalletId === w.id || t.toWalletId === w.id || t.fromWalletName === w.name || t.toWalletName === w.name;
            }
            return t.walletId === w.id || t.walletName === w.name;
          });

          const totalIn = walletTxs.reduce((s, t) => {
            if (t.type === 'income') return s + (Number(t.amount) || 0);
            if (t.type === 'transfer' && (t.toWalletId === w.id || t.toWalletName === w.name)) {
              return s + (Number(t.amount) || 0);
            }
            return s;
          }, 0);

          const totalOut = walletTxs.reduce((s, t) => {
            if (t.type === 'expense') return s + (Number(t.amount) || 0);
            if (t.type === 'transfer' && (t.fromWalletId === w.id || t.fromWalletName === w.name)) {
              return s + (Number(t.amount) || 0) + (Number(t.adminFee) || 0);
            }
            return s;
          }, 0);

          const isExpanded = expandedWalletId === w.id;

          return (
            <div
              key={w.id}
              className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden transition-all"
            >
              <div
                onClick={() => setExpandedWalletId(isExpanded ? null : w.id)}
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50/60"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Wallet size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-[#0F172A] text-sm truncate">{w.name}</h3>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold">
                        {w.type || 'Bank'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] font-bold">
                      <span className="text-rose-500">Keluar: Rp{formatIDR(totalOut)}</span>
                      {totalIn > 0 && <span className="text-[#00C49A]">Masuk: Rp{formatIDR(totalIn)}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 block">Saldo Real</span>
                    <p className="font-extrabold text-sm text-[#0F172A]">
                      {hideBalance ? 'Rp ••••••' : `Rp${formatIDR(w.balance)}`}
                    </p>
                  </div>
                  {wallets.length >= 2 && onOpenTransfer && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenTransfer(w.id);
                      }}
                      className="p-2 rounded-xl bg-[#EFF6FF] hover:bg-blue-100 text-[#1D63DC] transition-colors"
                      title={`Pindahkan saldo dari ${w.name}`}
                    >
                      <ArrowLeftRight size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditWallet(w, formatInputThousand(w.balance));
                    }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-[#1D63DC]"
                    title="Edit Saldo / Nama Kantong"
                  >
                    <Pencil size={14} />
                  </button>
                  {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </div>

              {/* Riwayat Transaksi Kantong Ini */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 bg-slate-50/60 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Riwayat Mutasi Kantong {w.name} ({walletTxs.length})</span>
                    <div className="flex items-center gap-3">
                      {wallets.length >= 2 && onOpenTransfer && (
                        <button
                          type="button"
                          onClick={() => onOpenTransfer(w.id)}
                          className="text-[#1D63DC] hover:underline flex items-center gap-1"
                        >
                          <ArrowLeftRight size={11} /> Pindah Saldo
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onEditWallet(w, formatInputThousand(w.balance))}
                        className="text-slate-600 hover:text-[#1D63DC] hover:underline"
                      >
                        Ubah Saldo / Hapus
                      </button>
                    </div>
                  </div>

                  {walletTxs.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">Belum ada transaksi tercatat dari kantong ini.</p>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 max-h-60 overflow-y-auto">
                      {walletTxs.slice(0, 20).map((tx) => {
                        const d = new Date(tx.date);
                        const isTransfer = tx.type === 'transfer';
                        const isTransferOut = isTransfer && (tx.fromWalletId === w.id || tx.fromWalletName === w.name);
                        const isExp = tx.type === 'expense' || isTransferOut;
                        const txTotalAmt = isTransferOut
                          ? (Number(tx.amount) || 0) + (Number(tx.adminFee) || 0)
                          : (Number(tx.amount) || 0);

                        return (
                          <div
                            key={tx.id}
                            onClick={() => onOpenTxDetail && onOpenTxDetail(tx)}
                            className="px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs cursor-pointer hover:bg-slate-50/70 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {isTransfer ? (
                                <ArrowLeftRight size={15} className="text-[#1D63DC] shrink-0" />
                              ) : isExp ? (
                                <ArrowUpCircle size={15} className="text-rose-500 shrink-0" />
                              ) : (
                                <ArrowDownCircle size={15} className="text-[#00C49A] shrink-0" />
                              )}
                              <div className="min-w-0">
                                <p className="font-bold text-[#0F172A] truncate">
                                  {isTransfer
                                    ? (isTransferOut ? `Pindah ke ${tx.toWalletName}` : `Terima dari ${tx.fromWalletName}`)
                                    : (tx.note || tx.category)}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {formatShortDate(d)} • {isTransfer ? (tx.note || 'Transfer Antar Kantong') : tx.category}
                                </p>
                              </div>
                            </div>
                            <span className={`font-extrabold shrink-0 ${isExp ? 'text-rose-600' : 'text-[#00C49A]'}`}>
                              {isExp ? '-' : '+'}Rp{formatIDR(txTotalAmt)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {wallets.length === 0 && (
          <div className="bg-slate-50/70 rounded-3xl p-8 text-center text-slate-400 text-sm border border-slate-100">
            Belum ada kantong dompet. Tekan tombol biru <strong>+</strong> di bawah untuk menambahkan Gaji Magang, Freelance, Cash, Seabank, BCA, dll.
          </div>
        )}
      </div>
    </div>
  );
}
