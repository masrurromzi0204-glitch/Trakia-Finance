import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatIDR, formatInputThousand } from '../../utils/formatters';

export const BudgetActionModal = () => {
  const {
    isBudgetActionModalOpen,
    setIsBudgetActionModalOpen,
    selectedBudget,
    budgetActionType,
    wallets,
    handleBudgetAction
  } = useFinance();

  const todayStr = new Date().toISOString().substring(0, 10);
  const [form, setForm] = useState({
    amount: '',
    walletId: '',
    note: '',
    date: todayStr
  });

  useEffect(() => {
    if (isBudgetActionModalOpen) {
      setForm({
        amount: '',
        walletId: wallets[0]?.id || '',
        note: '',
        date: todayStr
      });
    }
  }, [isBudgetActionModalOpen, wallets, todayStr]);

  if (!isBudgetActionModalOpen || !selectedBudget) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    handleBudgetAction(form, budgetActionType);
  };

  return (
    <div className="absolute inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-[28px] p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-base font-extrabold text-[#0F172A]">
              {budgetActionType === 'add_money'
                ? `Tambah Uang ke ${selectedBudget.name}`
                : `Catat Pengeluaran ${selectedBudget.name}`}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {budgetActionType === 'add_money'
                ? 'Memotong saldo dompet sumber & menambah anggaran'
                : `Sisa anggaran saat ini: Rp ${formatIDR(selectedBudget.remaining)}`}
            </p>
          </div>
          <button 
            onClick={() => setIsBudgetActionModalOpen(false)} 
            className="p-1.5 bg-slate-100 rounded-full text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500">Nominal (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              required
              value={form.amount}
              onChange={e => setForm({ ...form, amount: formatInputThousand(e.target.value) })}
              className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-extrabold outline-none focus:border-[#1D63DC]"
              placeholder="0"
            />
          </div>

          {budgetActionType === 'add_money' && (
            <div>
              <label className="text-xs font-bold text-slate-500">Pilih Dompet Sumber</label>
              <select
                required
                value={form.walletId}
                onChange={e => setForm({ ...form, walletId: e.target.value })}
                className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
              >
                <option value="">Pilih Dompet...</option>
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name} (Rp {formatIDR(w.balance)})</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-500">
              {budgetActionType === 'expense' ? 'Dipakai Untuk Apa? (Rincian)' : 'Catatan Tambahan'}
            </label>
            <input
              type="text"
              required={budgetActionType === 'expense'}
              value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-[#1D63DC]"
              placeholder={budgetActionType === 'expense' ? 'Cth: Makan malam, Tiket nonton, Kopi' : 'Cth: Tambahan budget bulan ini'}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500">Tanggal</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3.5 rounded-2xl font-extrabold text-white text-sm shadow-md ${
              budgetActionType === 'add_money' ? 'bg-[#00C49A]' : 'bg-[#1D63DC]'
            }`}
          >
            {budgetActionType === 'add_money' ? 'Tambah ke Anggaran' : 'Simpan Pengeluaran Budget'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BudgetActionModal;

