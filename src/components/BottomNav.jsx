import React from 'react';
import { Home as HomeIcon, Wallet, BarChart3, PieChart, PiggyBank, Plus } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, onPlusClick }) {
  const leftItems = [
    { id: 'home', icon: HomeIcon, label: 'Beranda', activeClass: 'bg-[#EFF6FF] text-[#1D63DC]', textClass: 'text-[#1D63DC]' },
    { id: 'wallets', icon: Wallet, label: 'Dompet', activeClass: 'bg-[#EFF6FF] text-[#1D63DC]', textClass: 'text-[#1D63DC]' },
    { id: 'budgets', icon: PieChart, label: 'Anggaran', activeClass: 'bg-[#E6FAF5] text-[#00C49A]', textClass: 'text-[#00C49A]' }
  ];

  const rightItems = [
    { id: 'savings', icon: PiggyBank, label: 'Tabungan', activeClass: 'bg-amber-50 text-amber-600', textClass: 'text-amber-600' },
    { id: 'reports', icon: BarChart3, label: 'Analisis', activeClass: 'bg-[#EFF6FF] text-[#1D63DC]', textClass: 'text-[#1D63DC]' }
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-2 pt-2 pb-3 flex items-center justify-between z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      {leftItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="flex-1 flex flex-col items-center justify-center py-0.5 group"
          >
            <div className={`px-3 py-1 rounded-2xl transition-all ${
              isActive ? item.activeClass : 'text-slate-400 group-hover:text-slate-700'
            }`}>
              <item.icon size={19} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] mt-1 ${
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
          className="w-13 h-13 p-3 rounded-full bg-gradient-to-tr from-[#1D63DC] to-[#3B82F6] hover:from-blue-700 hover:to-blue-500 text-white flex items-center justify-center shadow-[0_8px_20px_rgba(29,99,220,0.45)] ring-4 ring-white active:scale-90 transition-all"
          title="Tambah Data"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
      </div>

      {rightItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="flex-1 flex flex-col items-center justify-center py-0.5 group"
          >
            <div className={`px-3 py-1 rounded-2xl transition-all ${
              isActive ? item.activeClass : 'text-slate-400 group-hover:text-slate-700'
            }`}>
              <item.icon size={19} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] mt-1 ${
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
