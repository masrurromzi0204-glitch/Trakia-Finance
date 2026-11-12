import React from 'react';
import {
  CaretLeft, CaretRight, Wallet, Eye, EyeSlash,
  ChartPieSlice, Vault, ChartBar, TrendUp, ArrowCircleUp, Plus, ArrowsLeftRight
} from '@phosphor-icons/react';
import { formatIDR, getMonthYearStr } from '../utils/formatters';
import CategoryBadge from '../components/CategoryBadge';

export default function HomePage({
  currentDate, changeMonth, totalWalletBalance, wallets, budgets, savings = [],
  hideBalance, setHideBalance, monthlyIncome, monthlyExpense,
  currentMonthMainTxs, groupedTxs, categories, setActiveTab,
  onOpenNewWallet, onOpenTxDetail
}) {
  return (
    <div className="px-5 pt-4 space-y-5 trakia-page-anim">
      {/* Pemilih Bulan */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/70 text-[#0F172A] font-bold text-xs">
          <button onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-white active:scale-90 transition-all text-slate-500">
            <CaretLeft size={14} weight="bold" />
          </button>
          <span className="min-w-[70px] text-center text-[#1D63DC]">{getMonthYearStr(currentDate)}</span>
          <button onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-white active:scale-90 transition-all text-slate-500">
            <CaretRight size={14} weight="bold" />
          </button>
        </div>
      </div>

      {/* Kartu Utama: Total Saldo Semua Wallet */}
      <div
        onClick={() => setActiveTab('wallets')}
        className="relative overflow-hidden rounded-[26px] p-5 text-white shadow-[0_10px_25px_-5px_rgba(29,99,220,0.35)] bg-gradient-to-br from-[#00C49A] via-[#0EA5E9] to-[#1D63DC] cursor-pointer trakia-card-hover"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/90 text-xs font-semibold">
            <Wallet size={16} weight="fill" />
            <span>Total Saldo Real Semua Kantong</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setHideBalance(!hideBalance);
            }}
            className="w-8 h-8 rounded-xl bg-black/15 hover:bg-black/25 flex items-center justify-center text-white/90 transition-colors"
          >
            {hideBalance ? <EyeSlash size={16} weight="fill" /> : <Eye size={16} weight="fill" />}
          </button>
        </div>

        <h2 className="text-[32px] leading-tight font-extrabold tracking-tight mt-2">
          {hideBalance ? 'Rp •••••••' : `Rp ${formatIDR(totalWalletBalance)}`}
        </h2>
      </div>

      {/* Pintasan Menu Grid: Kantong, Anggaran, Tabungan, Analisis (Warna Biru Seragam) */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setActiveTab('wallets')}
          className="flex items-center gap-3 p-3.5 rounded-[22px] bg-white border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:border-blue-200 text-left trakia-card-hover"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#1D63DC] flex items-center justify-center shrink-0">
            <Wallet size={20} weight="fill" />
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-xs text-[#0F172A]">Kantong</p>
            <p className="text-[11px] text-slate-400 truncate">{wallets.length} Dompet Aktif</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('budgets')}
          className="flex items-center gap-3 p-3.5 rounded-[22px] bg-white border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:border-blue-200 text-left trakia-card-hover"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#1D63DC] flex items-center justify-center shrink-0">
            <ChartPieSlice size={20} weight="fill" />
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-xs text-[#0F172A]">Anggaran</p>
            <p className="text-[11px] text-slate-400 truncate">{budgets.length} Grup Aktif</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('savings')}
          className="flex items-center gap-3 p-3.5 rounded-[22px] bg-white border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:border-blue-200 text-left trakia-card-hover"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#1D63DC] flex items-center justify-center shrink-0">
            <Vault size={20} weight="fill" />
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-xs text-[#0F172A]">Tabungan</p>
            <p className="text-[11px] text-slate-400 truncate">{savings.length} Tujuan</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className="flex items-center gap-3 p-3.5 rounded-[22px] bg-white border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:border-blue-200 text-left trakia-card-hover"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#1D63DC] flex items-center justify-center shrink-0">
            <ChartBar size={20} weight="fill" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="font-extrabold text-xs text-[#0F172A]">Analisis</p>
              <CaretRight size={13} weight="bold" className="text-[#1D63DC]" />
            </div>
            <p className="text-[11px] text-slate-400 truncate">Grafik & Rekap</p>
          </div>
        </button>
      </div>

      {/* 2 Kartu Berdampingan */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[24px] p-4 text-white bg-gradient-to-br from-[#00C49A] to-[#0D9488] shadow-[0_6px_18px_rgba(0,196,154,0.25)]">
          <div className="flex items-center gap-1.5 text-white/90 text-xs font-bold">
            <TrendUp size={15} weight="fill" />
            <span>Pemasukan</span>
          </div>
          <p className="text-lg font-extrabold mt-2 truncate">
            {hideBalance ? 'Rp ••••••' : `Rp ${formatIDR(monthlyIncome)}`}
          </p>
          <p className="text-[10px] text-white/80 font-medium mt-0.5">
            {currentMonthMainTxs.filter(t => t.type === 'income').length} transaksi bulan ini
          </p>
        </div>

        <div className="rounded-[24px] p-4 text-white bg-gradient-to-br from-[#FF5E62] to-[#E11D48] shadow-[0_6px_18px_rgba(244,63,94,0.25)]">
          <div className="flex items-center gap-1.5 text-white/90 text-xs font-bold">
            <ArrowCircleUp size={15} weight="fill" />
            <span>Pengeluaran</span>
          </div>
          <p className="text-lg font-extrabold mt-2 truncate">
            {hideBalance ? 'Rp ••••••' : `Rp ${formatIDR(monthlyExpense)}`}
          </p>
          <p className="text-[10px] text-white/80 font-medium mt-0.5">
            {currentMonthMainTxs.filter(t => t.type === 'expense').length} transaksi bulan ini
          </p>
        </div>
      </div>

      {/* Riwayat Transaksi */}
      <div className="space-y-5 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-sm text-[#0F172A]">Riwayat Transaksi</h3>
          <span className="text-xs font-bold text-[#1D63DC]">{getMonthYearStr(currentDate)}</span>
        </div>

        {groupedTxs.length === 0 ? (
          <div className="bg-slate-50/70 rounded-3xl p-8 text-center space-y-3 border border-slate-100">
            <p className="text-slate-400 text-sm">Belum ada transaksi di bulan {getMonthYearStr(currentDate)}.</p>
            {wallets.length === 0 ? (
              <button
                onClick={onOpenNewWallet}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1D63DC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors"
              >
                <Plus size={15} weight="bold" /> Buat Kantong Dompet Pertama
              </button>
            ) : (
              <p className="text-xs text-slate-400">Tekan tombol biru <strong>+</strong> di tengah bawah untuk mencatat pemasukan atau pengeluaran.</p>
            )}
          </div>
        ) : (
          groupedTxs.map((group) => (
            <div key={group.key} className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-extrabold text-[#0F172A] text-xs">{group.prefix}</span>
                  <span className="text-slate-400 font-semibold text-[11px]">{group.shortDate}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  {group.incomeTotal > 0 && <span className="text-[#00C49A]">+{formatIDR(group.incomeTotal)}</span>}
                  {group.expenseTotal > 0 && <span className="text-rose-600">-{formatIDR(group.expenseTotal)}</span>}
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden divide-y divide-slate-100/80">
                {group.items.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => onOpenTxDetail(tx)}
                    className="flex items-center justify-between p-3.5 transition-all duration-150 cursor-pointer hover:bg-slate-50/70 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <CategoryBadge categoryName={tx.category} txType={tx.type} categories={categories} />
                      <div className="min-w-0">
                        <p className="font-extrabold text-[#0F172A] text-sm truncate">{tx.category}</p>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <span className="truncate max-w-[140px]">{tx.note || tx.walletName}</span>
                          {tx.type === 'transfer' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF6FF] text-[#1D63DC] shrink-0">
                              <ArrowsLeftRight size={10} weight="fill" /> {tx.fromWalletName} → {tx.toWalletName}
                            </span>
                          ) : (
                            tx.walletName && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 shrink-0">
                                <Wallet size={10} weight="fill" /> {tx.walletName}
                              </span>
                            )
                          )}
                          {tx.isBudgetAllocation && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF6FF] text-[#1D63DC] shrink-0">
                              Grup Budget
                            </span>
                          )}
                          {tx.isSavingAllocation && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF6FF] text-[#1D63DC] shrink-0">
                              Tabungan
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <p className={`font-extrabold text-sm ${
                        tx.type === 'transfer' ? 'text-[#1D63DC]' : tx.type === 'expense' ? 'text-rose-600' : 'text-[#00C49A]'
                      }`}>
                        {tx.type === 'transfer' ? '↔ ' : tx.type === 'expense' ? '-' : '+'}Rp{formatIDR(tx.amount)}
                      </p>
                      <CaretRight size={14} weight="bold" className="text-slate-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
