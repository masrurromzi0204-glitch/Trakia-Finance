import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatIDR, formatInputThousand } from '../../utils/formatters';

export const TxModal = () => {
  const {
    isTxModalOpen,
    setIsTxModalOpen,
    wallets,
    categories,
    handleAddTx,
    setIsCategoryModalOpen
  } = useFinance();

  const todayStr = new Date().toISOString().substring(0, 10);
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category: 'Kebutuhan Pribadi · Jajan/Uang Saku',
    note: '',
    walletId: '',
    date: todayStr
  });

  useEffect(() => {
    if (isTxModalOpen) {
      setForm(prev => ({
        ...prev,
        walletId: prev.walletId || (wallets[0]?.id || ''),
        category: prev.category || (categories.find(c => c.type === prev.type)?.name || ''),
        amount: '',
        note: '',
        date: todayStr
      }));
    }
  }, [isTxModalOpen, wallets, categories, todayStr]);

  if (!isTxModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddTx(form);
  };

  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex items-end justify-center animate-in fade-in">
      <div className="bg-white w-full rounded-t-[30px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-10">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-extrabold text-[#0F172A]">Catat Transaksi</h2>
          <button 
            onClick={() => setIsTxModalOpen(false)} 
            className="p-1.5 bg-slate-100 rounded-full text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Switch Pengeluaran / Pemasukan */}
        <div className="flex bg-slate-100 rounded-2xl p-1 mb-5">
          <button
            type="button"
            onClick={() => {
              const firstExp = categories.find(c => c.type === 'expense')?.name || '';
              setForm({ ...form, type: 'expense', category: firstExp });
            }}
            className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
              form.type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            PENGELUARAN
          </button>
          <button
            type="button"
            onClick={() => {
              const firstInc = categories.find(c => c.type === 'income')?.name || '';
              setForm({ ...form, type: 'income', category: firstInc });
            }}
            className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
              form.type === 'income' ? 'bg-white text-[#00C49A] shadow-sm' : 'text-slate-500'
            }`}
          >
            PEMASUKAN
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500">Pilih Dompet</label>
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
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500">Kategori</label>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="text-xs font-bold text-[#1D63DC] hover:underline"
              >
                + Tambah Kategori
              </button>
            </div>
            <select
              required
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
            >
              <option value="">Pilih Kategori...</option>
              {categories.filter(c => c.type === form.type).map(c => (
                <option key={c.id || c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500">Catatan / Keterangan</label>
            <input
              type="text"
              value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-[#1D63DC]"
              placeholder="Contoh: Self Reward, Uang Makan 4 Minggu - Cash"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-4 rounded-2xl text-white font-extrabold text-sm shadow-md transition-transform active:scale-98 ${
              form.type === 'expense' ? 'bg-[#1D63DC]' : 'bg-[#00C49A]'
            }`}
          >
            Simpan Transaksi
          </button>
        </form>
      </div>
    </div>
  );
};

export default TxModal;

