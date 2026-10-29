import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatInputThousand } from '../../utils/formatters';

export const WalletModal = () => {
  const {
    isWalletModalOpen,
    setIsWalletModalOpen,
    editingWallet,
    setEditingWallet,
    handleSaveWallet,
    handleDeleteWallet
  } = useFinance();

  const [form, setForm] = useState({ name: '', balance: '', type: 'Bank' });

  useEffect(() => {
    if (isWalletModalOpen) {
      if (editingWallet) {
        setForm({
          name: editingWallet.name || '',
          balance: editingWallet.balance ? formatInputThousand(editingWallet.balance) : '',
          type: editingWallet.type || 'Bank'
        });
      } else {
        setForm({ name: '', balance: '', type: 'Bank' });
      }
    }
  }, [isWalletModalOpen, editingWallet]);

  if (!isWalletModalOpen) return null;

  const isRealEdit = editingWallet && !editingWallet.isPreset && Boolean(editingWallet.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSaveWallet(form, isRealEdit ? editingWallet : null);
  };

  const handleClose = () => {
    setIsWalletModalOpen(false);
    setEditingWallet(null);
  };

  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-[28px] p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-extrabold text-[#0F172A]">
            {isRealEdit ? 'Edit Kantong Dompet' : 'Tambah Kantong Dompet'}
          </h2>
          <button 
            onClick={handleClose} 
            className="p-1.5 bg-slate-100 rounded-full text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500">Nama Bank / Dompet</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-[#1D63DC]"
              placeholder="Cth: Seabank, Bank Jago, Mandiri, Cash"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500">Saldo Saat Ini (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              required
              value={form.balance}
              onChange={e => setForm({ ...form, balance: formatInputThousand(e.target.value) })}
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-base font-extrabold outline-none focus:border-[#1D63DC]"
              placeholder="0"
            />
          </div>

          <div className="flex gap-2 pt-2">
            {isRealEdit && (
              <button
                type="button"
                onClick={() => handleDeleteWallet(editingWallet.id)}
                className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100"
                title="Hapus Dompet"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-3.5 bg-[#1D63DC] text-white rounded-2xl font-extrabold text-sm shadow-md shadow-blue-500/20"
            >
              Simpan Dompet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WalletModal;

