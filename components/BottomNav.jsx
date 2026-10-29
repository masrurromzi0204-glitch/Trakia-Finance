import React from 'react';
import { Home as HomeIcon, Wallet, BarChart3, PieChart, Plus } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, onPlusClick }) {
    return (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-3 pt-2 pb-3 flex items-center justify-between z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            {[
                { id: 'home', icon: HomeIcon, label: 'Beranda' },
                { id: 'wallets', icon: Wallet, label: 'Dompet' }
            ].map((item) => {
                const isActive = activeTab === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className="flex-1 flex flex-col items-center justify-center py-0.5 group"
                    >
                        <div className={`px-3.5 py-1 rounded-2xl transition-all ${isActive ? 'bg-[#EFF6FF] text-[#1D63DC]' : 'text-slate-400 group-hover:text-slate-700'
                            }`}>
                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className={`text-[10px] mt-1 ${isActive ? 'font-extrabold text-[#1D63DC]' : 'font-semibold text-slate-400'
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

            {[
                { id: 'reports', icon: BarChart3, label: 'Analisis' },
                { id: 'budgets', icon: PieChart, label: 'Anggaran' }
            ].map((item) => {
                const isActive = activeTab === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className="flex-1 flex flex-col items-center justify-center py-0.5 group"
                    >
                        <div className={`px-3.5 py-1 rounded-2xl transition-all ${isActive ? 'bg-[#E6FAF5] text-[#00C49A]' : 'text-slate-400 group-hover:text-slate-700'
                            }`}>
                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className={`text-[10px] mt-1 ${isActive ? 'font-extrabold text-[#00C49A]' : 'font-semibold text-slate-400'
                            }`}>
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}