import React from 'react';
import { Trash2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const ConfirmResetModal = () => {
  const {
    isConfirmResetOpen,
    setIsConfirmResetOpen,
    isResetting,
    handleClearAllData
  } = useFinance();

  if (!isConfirmResetOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/50 z-[80] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-[28px] p-6 shadow-2xl space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Trash2 size={24} />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-extrabold text-[#0F172A]">Kosongkan Semua Data?</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Seluruh dompet, anggaran, dan riwayat transaksi yang tersimpan saat ini akan dihapus permanen agar Anda bisa mulai dari nol.
          </p>
        </div>
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            disabled={isResetting}
            onClick={() => setIsConfirmResetOpen(false)}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isResetting}
            onClick={handleClearAllData}
            className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-extrabold text-xs shadow-sm disabled:opacity-50"
          >
            {isResetting ? 'Menghapus...' : 'Ya, Bersihkan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmResetModal;

