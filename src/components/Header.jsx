import React from 'react';
import { Eye, EyeSlash, PencilSimple, GearSix } from '@phosphor-icons/react';
import { TrakiaCalculatorIcon } from './TrakiaLogo';

export default function Header({ activeTab, setActiveTab, hideBalance, setHideBalance, onOpenAdjust }) {
  return (
    <div className="sticky top-0 left-0 right-0 px-5 pt-3.5 pb-3 bg-white/95 backdrop-blur-md flex items-center justify-between border-b border-slate-100/80 shrink-0 z-40 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <div
        onClick={() => setActiveTab('home')}
        className="flex items-center gap-2.5 cursor-pointer"
      >
        <TrakiaCalculatorIcon size={44} />
        <div className="flex flex-col justify-center">
          <span
            className="text-[22px] font-extrabold text-[#1D63DC] leading-none tracking-tight"
            style={{ fontFamily: "'Poppins', 'Plus Jakarta Sans', sans-serif" }}
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
          {hideBalance ? <EyeSlash size={19} weight="fill" /> : <Eye size={19} weight="fill" />}
        </button>
        <button
          onClick={onOpenAdjust}
          className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          title="Sesuaikan Pintasan"
        >
          <PencilSimple size={18} weight="fill" />
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`p-2 rounded-full transition-colors ${
            activeTab === 'settings' ? 'text-[#1D63DC] bg-blue-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
          }`}
          title="Pengaturan & Kategori"
        >
          <GearSix size={19} weight="fill" />
        </button>
      </div>
    </div>
  );
}
