import React from 'react';
import { Plus, Wallet } from 'lucide-react';
import { formatIDR, formatInputThousand } from '../utils/formatters';
import { WALLET_PRESETS } from '../utils/constants';

export default function WalletsPage({
    wallets, totalWalletBalance, totalRemainingBudget, hideBalance,
    onAddWallet, onEditWallet, onPresetWallet
}) {
    const badgeColors = [
        'bg-[#EFF6FF] text-[#1D63DC]',
        'bg-[#E6FAF5] text-[#00C49A]',
        'bg-amber-50 text-amber-600',
        'bg-purple-50 text-purple-600',
        'bg-rose-50 text-rose-600',
        'bg-indigo-50 text-indigo-600'
    ];

    return (
        <div className="px-5 pt-4 space-y-5">
            <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Kelola semua kantong bank & uang tunai ({wallets.length} kantong)</p>
                <button
                    onClick={onAddWallet}
                    className="px-3.5 py-2 bg-[#1D63DC] hover:bg-blue-700 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
                >
                    <Plus size={14} /> Tambah
                </button>
            </div>

            {/* Kartu Total Keseluruhan Saldo Dompet */}
            <div className="bg-gradient-to-br from-[#00C49A] via-[#0EA5E9] to-[#1D63DC] text-white rounded-[26px] p-5 shadow-[0_10px_25px_-5px_rgba(29,99,220,0.3)]">
                <p className="text-xs text-white/90 font-semibold uppercase tracking-wider">Total Keseluruhan Saldo Dompet</p>
                <h3 className="text-3xl font-extrabold mt-1">
                    {hideBalance ? 'Rp •••••••' : `Rp ${formatIDR(totalWalletBalance)}`}
                </h3>
                <div className="mt-4 pt-3 border-t border-white/20 flex justify-between text-xs text-white/90">
                    <span>Kantong Aktif: <strong>{wallets.length} Dompet</strong></span>
                    <span>Sisa di Anggaran: <strong>Rp {formatIDR(totalRemainingBudget)}</strong></span>
                </div>
            </div>

            {/* Quick Preset */}
            <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 px-1">Tambah Cepat Kantong Populer:</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {WALLET_PRESETS.map((preset) => (
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

            {/* Daftar Kantong Dompet */}
            <div className="space-y-3">
                {wallets.map((w, index) => {
                    const colorClass = badgeColors[index % badgeColors.length];
                    return (
                        <div
                            key={w.id}
                            onClick={() => onEditWallet(w, formatInputThousand(w.balance))}
                            className="bg-white p-4 rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex justify-between items-center cursor-pointer hover:border-blue-200 active:scale-[0.99] transition-all"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${colorClass}`}>
                                    <Wallet size={20} />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-[#0F172A] text-sm">{w.name}</h3>
                                    <p className="text-[11px] text-slate-400 font-medium">Ketuk untuk ubah saldo / nama</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-extrabold text-sm text-[#0F172A]">
                                    {hideBalance ? 'Rp ••••••' : `Rp${formatIDR(w.balance)}`}
                                </p>
                            </div>
                        </div>
                    );
                })}

                {wallets.length === 0 && (
                    <div className="bg-slate-50/70 rounded-3xl p-8 text-center text-slate-400 text-sm border border-slate-100">
                        Belum ada kantong dompet. Tekan tombol biru <strong>+</strong> di bawah untuk menambahkan Cash, Seabank, Jago, Mandiri, dll.
                    </div>
                )}
            </div>
        </div>
    );
}