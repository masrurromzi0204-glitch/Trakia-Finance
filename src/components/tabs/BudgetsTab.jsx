import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatIDR } from '../../utils/formatters';
import CategoryBadge from '../common/CategoryBadge';

const ACCENT_COLORS = ['text-[#1D63DC]', 'text-amber-500', 'text-[#00C49A]', 'text-purple-600', 'text-rose-500'];

export const BudgetsTab = () => {
  const {
    budgets,
    setSelectedBudgetId,
    setIsBudgetActionModalOpen,
    categories
  } = useFinance();

  return (
    <div className="px-5 pt-4 space-y-5">
      <p className="text-xs text-slate-500 leading-relaxed">
        Atur batas pengeluaran grup untuk bulan ini. Ketuk kartu anggaran untuk menambah dana atau mencatat rincian pengeluaran.
      </p>

      {/* Daftar Kartu Pos Anggaran */}
      <div className="space-y-3">
        {budgets.map((b, idx) => {
          const allocated = Number(b.allocated) || 0;
          const spent = Number(b.spent) || 0;
          const remaining = Number(b.remaining) || 0;
          const percent = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0;
          const pctColor = ACCENT_COLORS[idx % ACCENT_COLORS.length];

          return (
            <div
              key={b.id}
              onClick={() => {
                setSelectedBudgetId(b.id);
                setIsBudgetActionModalOpen(false);
              }}
              className="bg-white p-4 rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 cursor-pointer hover:border-blue-200 active:scale-[0.99] transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <CategoryBadge 
                    categoryName={b.categoryName || b.name} 
                    txType="expense" 
                    categories={categories} 
                  />
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-[#0F172A] text-sm truncate">{b.name}</h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Rp{formatIDR(spent)} / Rp{formatIDR(allocated)}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[11px] text-[#00C49A] font-bold">
                        Sisa: Rp{formatIDR(remaining)}
                      </p>
                      {b.storageForm && (
                        <span className="px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D63DC] text-[10px] font-bold">
                          {b.storageForm}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-extrabold ${pctColor}`}>
                    {percent}%
                  </span>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
              </div>
            </div>
          );
        })}

        {budgets.length === 0 && (
          <div className="bg-slate-50/70 rounded-3xl p-8 text-center text-slate-400 text-sm border border-slate-100">
            Belum ada pos anggaran. Tekan tombol biru <strong>+</strong> di bawah untuk membuat anggaran seperti <strong>Budget Dating</strong>.
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetsTab;

