import React from 'react';
import { Plus, Trash2, LogOut, Pencil } from 'lucide-react';
import { TrakiaCalculatorIcon } from '../components/TrakiaLogo';
import CategoryBadge from '../components/CategoryBadge';

export default function SettingsPage({ categories, onOpenCategoryModal, onEditCategory, onOpenResetModal, onLogout }) {
  return (
    <div className="px-5 pt-4 space-y-5 trakia-page-anim">
      <div className="bg-white rounded-[26px] p-5 border border-slate-100 shadow-[0_6px_25px_rgba(0,0,0,0.03)] flex items-center gap-3.5">
        <TrakiaCalculatorIcon size={52} />
        <div>
          <h2
            className="text-2xl font-extrabold text-[#1D63DC] leading-none tracking-tight"
            style={{ fontFamily: "'Poppins', 'Plus Jakarta Sans', sans-serif" }}
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
            <p className="text-xs text-slate-400">Ketuk kategori untuk edit ({categories.length} tersedia)</p>
          </div>
          <button
            onClick={onOpenCategoryModal}
            className="px-3.5 py-2 bg-[#1D63DC] text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 active:scale-95 transition-transform"
          >
            <Plus size={14} /> Kategori Baru
          </button>
        </div>

        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
          {categories.map((cat) => (
            <div
              key={cat.id || cat.name}
              onClick={() => onEditCategory && onEditCategory(cat)}
              className="py-2.5 px-2 -mx-2 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <CategoryBadge categoryName={cat.name} txType={cat.type} categories={categories} />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#0F172A] truncate">{cat.name}</p>
                  <p className={`text-[10px] font-bold uppercase ${cat.type === 'expense' ? 'text-rose-500' : 'text-[#00C49A]'}`}>
                    {cat.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditCategory && onEditCategory(cat);
                }}
                className="p-2 rounded-xl bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-[#1D63DC] transition-colors shrink-0"
                title="Edit Kategori"
              >
                <Pencil size={14} />
              </button>
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
