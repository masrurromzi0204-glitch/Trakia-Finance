import React from 'react';
import { Plus, Trash2, LogOut } from 'lucide-react';
import { TrakiaCalculatorIcon } from '../components/TrakiaLogo';
import CategoryBadge from '../components/CategoryBadge';

export default function SettingsPage({ categories, onOpenCategoryModal, onOpenResetModal, onLogout }) {
  return (
    <div className="px-5 pt-4 space-y-5">
      <div className="bg-white rounded-[26px] p-5 border border-slate-100 shadow-[0_6px_25px_rgba(0,0,0,0.03)] flex items-center gap-3.5">
        <TrakiaCalculatorIcon size={52} />
        <div>
          <h2
            className="text-2xl font-black text-[#1D63DC] leading-none"
            style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
          >
            Trakia
          </h2>
          <p className="text-xs font-medium text-slate-600 mt-0.5">Your Money Traking</p>
          <p className="text-[10px] font-bold text-[#00C49A] mt-1">Personal Finance & Budgeting App</p>
        </div>
      </div>

      <div className="bg-white rounded-[26px] p-5 space-y-4 border border-slate-100 shadow-[0_6px_25px_rgba(0,0,0,0.03)]">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-[#0F172A] text-sm">Kategori Transaksi</h3>
            <p className="text-xs text-slate-400">Total {categories.length} kategori tersedia</p>
          </div>
          <button
            onClick={onOpenCategoryModal}
            className="px-3.5 py-2 bg-[#1D63DC] text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
          >
            <Plus size={14} /> Kategori Baru
          </button>
        </div>

        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
          {categories.map((cat) => (
            <div key={cat.id || cat.name} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CategoryBadge categoryName={cat.name} txType={cat.type} categories={categories} />
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">{cat.name}</p>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">
                    {cat.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[26px] p-5 space-y-3 border border-slate-100 shadow-[0_6px_25px_rgba(0,0,0,0.03)]">
        <h3 className="font-extrabold text-[#0F172A] text-sm">Reset & Bersihkan Data</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Ingin menghapus seluruh riwayat transaksi, anggaran, dan dompet untuk memulai pencatatan dari awal (nol)?
        </p>
        <button
          onClick={onOpenResetModal}
          className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Trash2 size={16} /> Kosongkan Semua Data (Reset Bersih)
        </button>
      </div>

      {/* Logout */}
      <div className="bg-white rounded-[26px] p-5 border border-slate-100 shadow-[0_6px_25px_rgba(0,0,0,0.03)]">
        <h3 className="font-extrabold text-[#0F172A] text-sm mb-1">Akun</h3>
        <p className="text-xs text-slate-500 mb-3">
          Login sebagai <span className="font-bold text-slate-700">akunmanajemenuang_oji</span>
        </p>
        <button
          onClick={onLogout}
          className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut size={16} /> Keluar / Log Out
        </button>
      </div>
    </div>
  );
}

