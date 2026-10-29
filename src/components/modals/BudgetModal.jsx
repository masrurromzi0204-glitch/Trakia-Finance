import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { WALLET_PRESETS } from '../../config/constants';
import { formatIDR, formatInputThousand } from '../../utils/formatters';

export const BudgetModal = () => {
  const {
    isBudgetModalOpen,
    setIsBudgetModalOpen,
    wallets,
    categories,
    handleAddBudget
  } = useFinance();

  const todayStr = new Date().toISOString().substring(0, 10);
  const [form, setForm] = useState({
    name: '',
    initialAmount: '',
    walletId: '',
    storageForm: 'Cash',
    categoryName: 'Kebutuhan Dating',
    note: '',
    date: todayStr
  });

  useEffect(() => {
    if (isBudgetModalOpen) {
      setForm({
        name: '',
        initialAmount: '',
        walletId: wallets[0]?.id || '',
        storageForm: wallets[0]?.name || 'Cash',
        categoryName: 'Kebutuhan Dating',
        note: '',
        date: todayStr
      });
    }
  }, [isBudgetModalOpen, wallets, todayStr]);

  if (!isBudgetModalOpen) return null;

  const storageOptions = Array.from(new Set([...wallets.map(w => w.name), ...WALLET_PRESETS]));

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddBudget(form);
  };

  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex items-end justify-center animate-in fade-in">
      <div className="bg-white w-full rounded-t-[30px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-10">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-lg font-extrabold text-[#0F172A]">Buat Anggaran (Budget) Baru</h2>
            <p className="text-xs text-slate-500">Alokasikan saldo dari dompet utama ke pos anggaran khusus</p>
          </div>
          <button 
            onClick={() => setIsBudgetModalOpen(false)} 
            className="p-1.5 bg-slate-100 rounded-full text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500">Nama Pos Anggaran</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-[#1D63DC]"
              placeholder="Contoh: Budget Dating"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500">Kategori Tampilan di Beranda</label>
            <select
              value={form.categoryName}
              onChange={e => setForm({ ...form, categoryName: e.target.value })}
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
            >
              {categories.filter(c => c.type === 'expense').map(c => (
                <option key={c.id || c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500">Saldo Anggaran (Rp)</label>
              <input
                type="text"
                inputMode="numeric"
                value={form.initialAmount}
                onChange={e => setForm({ ...form, initialAmount: formatInputThousand(e.target.value) })}
                className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-extrabold outline-none focus:border-[#1D63DC]"
                placeholder="500.000"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500">Ambil dari Dompet</label>
              <select
                value={form.walletId}
                onChange={e => {
                  const selectedW = wallets.find(w => w.id === e.target.value);
                  setForm({
                    ...form,
                    walletId: e.target.value,
                    storageForm: selectedW ? selectedW.name : form.storageForm
                  });
                }}
                className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
              >
                <option value="">Pilih Dompet...</option>
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({formatIDR(w.balance)})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1.5">
              Saldo Anggaran Disimpan Dalam Bentuk Apa?
            </label>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {storageOptions.map((optionName) => {
                const isSelected = form.storageForm === optionName;
                return (
                  <button
                    key={optionName}
                    type="button"
                    onClick={() => setForm({ ...form, storageForm: optionName })}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                      isSelected
                        ? 'bg-[#1D63DC] text-white shadow-sm'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-[#1D63DC]'
                    }`}
                  >
                    {optionName}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500">Catatan di Beranda</label>
            <input
              type="text"
              value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:border-[#1D63DC]"
              placeholder="Contoh: Budget Dating Oktober"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-[#1D63DC] to-[#0EA5E9] text-white rounded-2xl font-extrabold text-sm shadow-md shadow-blue-500/25"
          >
            Buat & Alokasikan Anggaran
          </button>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;

