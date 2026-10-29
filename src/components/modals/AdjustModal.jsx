import React from 'react';
import { X, ChevronRight, Trash2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const AdjustModal = () => {
  const {
    isAdjustModalOpen,
    setIsAdjustModalOpen,
    setActiveTab,
    setIsConfirmResetOpen
  } = useFinance();

  if (!isAdjustModalOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-[28px] p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-extrabold text-[#0F172A]">Sesuaikan Pintasan</h2>
          <button 
            onClick={() => setIsAdjustModalOpen(false)} 
            className="p-1.5 bg-slate-100 rounded-full text-slate-500"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Pilih aksi cepat untuk mengelola kantong dompet, anggaran, atau mereset data aplikasi.
        </p>
        <div className="space-y-2.5">
          <button
            onClick={() => {
              setIsAdjustModalOpen(false);
              setActiveTab('wallets');
            }}
            className="w-full p-3.5 bg-slate-50 hover:bg-blue-50/50 rounded-2xl flex items-center justify-between text-xs font-bold text-[#0F172A]"
          >
            <span>Kelola & Sesuaikan Saldo Dompet</span>
            <ChevronRight size={16} className="text-[#1D63DC]" />
          </button>
          <button
            onClick={() => {
              setIsAdjustModalOpen(false);
              setActiveTab('budgets');
            }}
            className="w-full p-3.5 bg-slate-50 hover:bg-blue-50/50 rounded-2xl flex items-center justify-between text-xs font-bold text-[#0F172A]"
          >
            <span>Kelola Pos Anggaran (Budget)</span>
            <ChevronRight size={16} className="text-[#00C49A]" />
          </button>
          <button
            onClick={() => {
              setIsAdjustModalOpen(false);
              setIsConfirmResetOpen(true);
            }}
            className="w-full p-3.5 bg-rose-50 hover:bg-rose-100 rounded-2xl flex items-center justify-between text-xs font-bold text-rose-600"
          >
            <span>Kosongkan Semua Data (Reset Bersih)</span>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdjustModal;

