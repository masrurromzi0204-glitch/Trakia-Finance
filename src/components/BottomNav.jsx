import React from 'react';
import { Home as HomeIcon, Wallet, PieChart, PiggyBank, Plus } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, onPlusClick }) {
  const leftItems = [
    { id: 'home', icon: HomeIcon, label: 'Beranda', activeClass: 'bg-[#EFF6FF] text-[#1D63DC]', textClass: 'text-[#1D63DC]' },
    { id: 'wallets', icon: Wallet, label: 'Dompet', activeClass: 'bg-[#EFF6FF] text-[#1D63DC]', textClass: 'text-[#1D63DC]' }
  ];

  const rightItems = [
    { id: 'budgets', icon: PieChart, label: 'Anggaran', activeClass: 'bg-[#E6FAF5] text-[#00C49A]', textClass: 'text-[#00C49A]' },
    { id: 'savings', icon: PiggyBank, label: 'Tabungan', activeClass: 'bg-amber-50 text-amber-600', textClass: 'text-amber-600' }
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-100 px-3 pt-2 pb-3 flex items-center justify-between z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      {leftItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="flex-1 flex flex-col items-center justify-center py-0.5 group transition-transform active:scale-95"
          >
            <div className={`px-3.5 py-1 rounded-2xl transition-all duration-200 ${
              isActive ? item.activeClass : 'text-slate-400 group-hover:text-slate-700'
            }`}>
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] mt-1 transition-colors ${
              isActive ? `font-extrabold ${item.textClass}` : 'font-semibold text-slate-400'
            }`}>
              {item.label}
            </span>
          </button>
        );
      })}

      {/* Tombol (+) Biru Melayang di Tengah */}
      <div className="flex-1 flex justify-center -mt-7">
        <button
          onClick={onPlusClick}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#1D63DC] to-[#3B82F6] hover:from-blue-700 hover:to-blue-500 text-white flex items-center justify-center shadow-[0_8px_20px_rgba(29,99,220,0.45)] ring-4 ring-white active:scale-90 transition-all"
          title="Tambah Data"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>

      {rightItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="flex-1 flex flex-col items-center justify-center py-0.5 group transition-transform active:scale-95"
          >
            <div className={`px-3.5 py-1 rounded-2xl transition-all duration-200 ${
              isActive ? item.activeClass : 'text-slate-400 group-hover:text-slate-700'
            }`}>
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] mt-1 transition-colors ${
              isActive ? `font-extrabold ${item.textClass}` : 'font-semibold text-slate-400'
            }`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
