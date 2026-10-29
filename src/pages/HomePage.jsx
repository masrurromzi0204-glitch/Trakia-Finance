import React, { useState } from 'react';
import {
  ChevronLeft, ChevronRight, Wallet, Eye, EyeOff,
  HelpCircle, PieChart, TrendingUp, ArrowUpCircle, Plus
} from 'lucide-react';
import { formatIDR, getMonthYearStr } from '../utils/formatters';
import CategoryBadge from '../components/CategoryBadge';

export default function HomePage({
  currentDate, changeMonth, totalWalletBalance, wallets, budgets,
  hideBalance, setHideBalance, monthlyIncome, monthlyExpense, monthlyNetFlow,
  currentMonthMainTxs, groupedTxs, categories, setActiveTab,
  onOpenNewWallet, onSelectBudget, onOpenTxDetail
}) {
  const [showBulananInfo, setShowBulananInfo] = useState(false);

  return (
    <div className="px-5 pt-4 space-y-5">
      {/* Pemilih Bulan */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/70 text-[#0F172A] font-bold text-xs">
          <button onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-white active:scale-90 transition-all text-slate-500">
            <ChevronLeft size={15} />
          </button>
          <span className="min-w-[70px] text-center text-[#1D63DC]">{getMonthYearStr(currentDate)}</span>
          <button onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-white active:scale-90 transition-all text-slate-500">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Kartu Utama: Total Saldo Semua Wallet */}
      <div
        onClick={() => setActiveTab('wallets')}
        className="relative overflow-hidden rounded-[26px] p-5 text-white shadow-[0_10px_25px_-5px_rgba(29,99,220,0.35)] bg-gradient-to-br from-[#00C49A] via-[#0EA5E9] to-[#1D63DC] cursor-pointer active:scale-[0.99] transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/90 text-xs font-semibold">
            <Wallet size={15} />
            <span>Total Saldo Semua Wallet</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setHideBalance(!hideBalance);
            }}
            className="w-8 h-8 rounded-xl bg-black/15 hover:bg-black/25 flex items-center justify-center text-white/90 transition-colors"
          >
            {hideBalance ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        <h2 className="text-[32px] leading-tight font-extrabold tracking-tight mt-2">
          {hideBalance ? 'Rp •••••••' : `Rp ${formatIDR(totalWalletBalance)}`}
        </h2>

        <div className="mt-3 flex items-center justify-between text-[11px] text-white/90 font-medium">
          <span>{wallets.length} dompet • ketuk untuk kelola</span>
          <span
            onClick={(e) => {
              e.stopPropagation();
              setShowBulananInfo(!showBulananInfo);
            }}
            className="bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1"
          >
            Selisih: {hideBalance ? '••••' : `${monthlyNetFlow >= 0 ? '+' : ''}${formatIDR(monthlyNetFlow)}`}
            <HelpCircle size={12} />
          </span>
        </div>
      </div>

      {showBulananInfo && (
        <div className="bg-[#0F172A] text-white text-xs p-3.5 rounded-2xl leading-relaxed shadow-md animate-in fade-in">
          <p className="font-bold text-[#00C49A] mb-1">Apa itu Selisih Bulanan?</p>
          Hasil dari <strong>Pemasukan (Rp {formatIDR(monthlyIncome)}) dikurangi Pengeluaran (Rp {formatIDR(monthlyExpense)})</strong> pada bulan {getMonthYearStr(currentDate)}. Sedangkan Total Saldo di kartu biru adalah gabungan uang riil di semua dompet Anda.
        </div>
      )}

      {/* Pintasan Menu Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setActiveTab('wallets')}
          className="flex items-center gap-3 p-3.5 rounded-[22px] bg-white border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:border-blue-200 text-left transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#1D63DC] flex items-center justify-center shrink-0">
            <Wallet size={19} />
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-xs text-[#0F172A]">Wallet</p>
            <p className="text-[11px] text-slate-400 truncate">Cash, BCA, Seabank</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('budgets')}
          className="flex items-center gap-3 p-3.5 rounded-[22px] bg-white border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:border-emerald-200 text-left transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-[#E6FAF5] text-[#00C49A] flex items-center justify-center shrink-0">
            <PieChart size={19} />
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-xs text-[#0F172A]">Anggaran</p>
            <p className="text-[11px] text-slate-400 truncate">{budgets.length} Pos Aktif</p>
          </div>
        </button>
      </div>

      {/* 2 Kartu Berdampingan */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[24px] p-4 text-white bg-gradient-to-br from-[#00C49A] to-[#0D9488] shadow-[0_6px_18px_rgba(0,196,154,0.25)]">
          <div className="flex items-center gap-1.5 text-white/90 text-xs font-bold">
            <TrendingUp size={14} />
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
            <ArrowUpCircle size={14} />
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
                <Plus size={15} /> Buat Kantong Dompet Pertama
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
                    className="flex items-center justify-between p-3.5 transition-colors cursor-pointer hover:bg-slate-50/60 active:bg-slate-100/80"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <CategoryBadge categoryName={tx.category} txType={tx.type} categories={categories} />
                      <div className="min-w-0">
                        <p className="font-extrabold text-[#0F172A] text-sm truncate">{tx.category}</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate mt-0.5">
                          <span className="truncate">{tx.note || tx.walletName}</span>
                          {tx.isBudgetAllocation && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF6FF] text-[#1D63DC] shrink-0">
                              Rincian Budget
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <p className={`font-extrabold text-sm ${tx.type === 'expense' ? 'text-rose-600' : 'text-[#00C49A]'}`}>
                        {tx.type === 'expense' ? '-' : '+'}Rp{formatIDR(tx.amount)}
                      </p>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
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

