import React from 'react';
import { Eye, EyeOff, Pencil, Settings } from 'lucide-react';
import { TrakiaCalculatorIcon } from './TrakiaLogo';

export default function Header({ activeTab, setActiveTab, hideBalance, setHideBalance, onOpenAdjust }) {
  return (
    <div className="px-5 pt-3.5 pb-3 bg-white flex items-center justify-between border-b border-slate-100/80 shrink-0 z-20">
      <div
        onClick={() => setActiveTab('home')}
        className="flex items-center gap-2.5 cursor-pointer"
      >
        <TrakiaCalculatorIcon size={44} />
        <div className="flex flex-col justify-center">
          <span
            className="text-[24px] font-black text-[#1D63DC] leading-none tracking-tight"
            style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
          >
            Trakia
          </span>
          <span className="text-[11px] font-medium text-slate-600 tracking-tight mt-0.5">
            Your Money Traking
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setHideBalance(!hideBalance)}
          className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          title={hideBalance ? "Tampilkan Saldo" : "Sembunyikan Saldo"}
        >
          {hideBalance ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        <button
          onClick={onOpenAdjust}
          className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          title="Sesuaikan Pintasan"
        >
          <Pencil size={17} />
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`p-2 rounded-full transition-colors ${
            activeTab === 'settings' ? 'text-[#1D63DC] bg-blue-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
          }`}
          title="Pengaturan & Kategori"
        >
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
}

