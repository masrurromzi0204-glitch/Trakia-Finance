import React from 'react';
import { X, Trash2, ArrowDownCircle, ArrowUpCircle, Wallet } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatIDR, formatShortDate } from '../../utils/formatters';
import CategoryBadge from '../common/CategoryBadge';

export const BudgetDetailModal = () => {
  const {
    selectedBudget,
    selectedBudgetId,
    setSelectedBudgetId,
    selectedBudgetLogs,
    isBudgetActionModalOpen,
    setIsBudgetActionModalOpen,
    setBudgetActionType,
    handleDeleteBudget,
    handleDeleteBudgetLog,
    categories
  } = useFinance();

  if (!selectedBudget || isBudgetActionModalOpen) return null;

  const alloc = Number(selectedBudget.allocated) || 0;
  const sp = Number(selectedBudget.spent) || 0;
  const pct = alloc > 0 ? Math.min(100, Math.round((sp / alloc) * 100)) : 0;

  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex items-end justify-center animate-in fade-in">
      <div className="bg-white w-full h-[88vh] rounded-t-[32px] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10">
        
        {/* Header Detail Budget */}
        <div className="bg-white px-6 pt-5 pb-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CategoryBadge 
              categoryName={selectedBudget.categoryName || selectedBudget.name} 
              txType="expense" 
              categories={categories} 
            />
            <div>
              <h2 className="text-xl font-extrabold text-[#0F172A]">{selectedBudget.name}</h2>
              <p className="text-xs text-slate-400 font-medium">Rincian Saldo & Riwayat Penggunaan</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDeleteBudget(selectedBudget.id)}
              className="p-2 text-rose-500 bg-rose-50 rounded-full hover:bg-rose-100"
              title="Hapus Anggaran"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => setSelectedBudgetId(null)}
              className="p-2 text-slate-500 bg-slate-100 rounded-full hover:bg-slate-200"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Isi Detail Budget (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white">
          
          {/* Kartu Ringkasan Saldo Budget */}
          <div className="bg-white rounded-[26px] p-5 shadow-[0_6px_25px_rgba(0,0,0,0.04)] border border-slate-100 space-y-4">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Sisa Saldo Anggaran
                </span>
                <h3 className="text-3xl font-extrabold text-[#0F172A] mt-0.5">
                  Rp {formatIDR(selectedBudget.remaining)}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-400 block">Total Anggaran</span>
                <span className="text-sm font-extrabold text-slate-700">
                  Rp {formatIDR(selectedBudget.allocated)}
                </span>
              </div>
            </div>

            {/* Bar Visual */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${pct >= 90 ? 'bg-rose-500' : 'bg-[#1D63DC]'}`}
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-rose-600">Terpakai: Rp {formatIDR(sp)} ({pct}%)</span>
                <span className="text-[#00C49A]">Tersedia: {100 - pct}%</span>
              </div>
            </div>

            {/* 2 Tombol Aksi: Tambah Uang & Catat Keluar */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => {
                  setBudgetActionType('add_money');
                  setIsBudgetActionModalOpen(true);
                }}
                className="py-3 px-4 bg-[#00C49A] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
              >
                <ArrowDownCircle size={16} />
                <span>Tambah Uang</span>
              </button>

              <button
                onClick={() => {
                  setBudgetActionType('expense');
                  setIsBudgetActionModalOpen(true);
                }}
                className="py-3 px-4 bg-[#1D63DC] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
              >
                <ArrowUpCircle size={16} />
                <span>Catat Keluar</span>
              </button>
            </div>
          </div>

          {/* Card Keterangan Bentuk Simpanan Saldo Anggaran */}
          <div className="bg-[#EFF6FF]/70 rounded-[22px] p-4 border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white text-[#1D63DC] flex items-center justify-center shrink-0 shadow-sm">
                <Wallet size={19} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Keterangan Penyimpanan Saldo
                </span>
                <p className="text-xs font-bold text-slate-600 mt-0.5">
                  Saldo anggaran ini disimpan di <strong className="text-[#1D63DC]">{selectedBudget.storageForm || 'Cash'}</strong>
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#1D63DC] text-white text-xs font-extrabold shrink-0">
              {selectedBudget.storageForm || 'Cash'}
            </span>
          </div>

          {/* Daftar Rincian Penggunaan / Riwayat Anggaran */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="font-extrabold text-[#0F172A] text-sm">
                Rincian Penggunaan ({selectedBudgetLogs.filter(l => l.type === 'expense').length})
              </h4>
            </div>

            {selectedBudgetLogs.length === 0 ? (
              <div className="bg-slate-50/70 rounded-3xl p-8 text-center text-slate-400 text-xs border border-slate-100">
                Belum ada rincian penggunaan untuk anggaran <strong>{selectedBudget.name}</strong>. Klik tombol <strong>"Catat Keluar"</strong> di atas saat Anda memakai saldo anggaran ini.
              </div>
            ) : (
              <div className="bg-white rounded-[26px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                {selectedBudgetLogs.map((log) => {
                  const d = new Date(log.date);
                  const isExpense = log.type === 'expense';
                  return (
                    <div key={log.id} className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isExpense ? 'bg-rose-50 text-rose-500' : 'bg-[#E6FAF5] text-[#00C49A]'
                        }`}>
                          {isExpense ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#0F172A] text-sm truncate">
                            {log.note || (isExpense ? 'Pengeluaran Anggaran' : 'Alokasi Dana Masuk')}
                          </p>
                          <p className="text-xs text-slate-400 font-medium">
                            {formatShortDate(d)} {d.getFullYear()} • {isExpense ? 'Potong Saldo Budget' : `Dari ${log.walletName || 'Dompet'}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`font-extrabold text-sm ${isExpense ? 'text-rose-600' : 'text-[#00C49A]'}`}>
                          {isExpense ? '-' : '+'}{formatIDR(log.amount)}
                        </span>
                        {isExpense && (
                          <button
                            onClick={() => handleDeleteBudgetLog(log)}
                            className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg"
                            title="Hapus item rincian ini"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default BudgetDetailModal;

