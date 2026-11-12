import React from 'react';
import { PencilSimple, ArrowsLeftRight } from '@phosphor-icons/react';
import { formatIDR, formatInputThousand } from '../utils/formatters';
import WalletLogo from '../components/WalletLogo';

export default function WalletsPage({
  wallets, totalWalletBalance, totalRemainingBudget, totalSavingsBalance = 0, hideBalance,
  onEditWallet, onOpenTransfer
}) {
  return (
    <div className="px-5 pt-4 space-y-5 trakia-page-anim">
      {/* Kartu Total Keseluruhan Saldo Dompet */}
      <div className="bg-gradient-to-br from-[#00C49A] via-[#0EA5E9] to-[#1D63DC] text-white rounded-[26px] p-5 shadow-[0_10px_25px_-5px_rgba(29,99,220,0.3)]">
        <p className="text-xs text-white/90 font-semibold uppercase tracking-wider">Total Saldo Real Semua Kantong</p>
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

      {/* Daftar Kantong Dompet: Logo Bank/Cash + Nama kantung | saldo | icon pindah kantung | edit */}
      <div className="space-y-3">
        {wallets.map((w) => (
          <div
            key={w.id}
            className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 p-4 flex items-center justify-between gap-3 transition-all"
          >
            {/* Logo Bank / Cash + Nama Kantung */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <WalletLogo name={w.name} type={w.type} />
              <h3 className="font-extrabold text-[#0F172A] text-sm leading-snug break-words">
                {w.name}
              </h3>
            </div>

            {/* Saldo | Icon Pindah Kantung | Edit */}
            <div className="flex items-center gap-2 shrink-0">
              <p className="font-extrabold text-sm text-[#1D63DC] mr-1">
                {hideBalance ? 'Rp ••••••' : `Rp ${formatIDR(w.balance)}`}
              </p>

              {onOpenTransfer && (
                <button
                  type="button"
                  onClick={() => onOpenTransfer(w.id)}
                  className="p-2 rounded-xl bg-[#EFF6FF] hover:bg-blue-100 text-[#1D63DC] transition-colors active:scale-95"
                  title={`Pindahkan saldo dari ${w.name}`}
                >
                  <ArrowsLeftRight size={16} weight="fill" />
                </button>
              )}

              <button
                type="button"
                onClick={() => onEditWallet(w, formatInputThousand(w.balance))}
                className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-[#1D63DC] transition-colors active:scale-95"
                title="Edit Saldo / Nama Kantong"
              >
                <PencilSimple size={16} weight="fill" />
              </button>
            </div>
          </div>
        ))}

        {wallets.length === 0 && (
          <div className="bg-slate-50/70 rounded-3xl p-8 text-center text-slate-400 text-sm border border-slate-100">
            Belum ada kantong dompet. Tekan tombol biru <strong>+</strong> di bawah untuk menambahkan kantong dompet baru.
          </div>
        )}
      </div>
    </div>
  );
}
