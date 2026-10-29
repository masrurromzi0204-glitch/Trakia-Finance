import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { ICON_OPTIONS, COLOR_OPTIONS } from '../../config/constants';

export const CategoryModal = () => {
  const {
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    handleAddCategory
  } = useFinance();

  const [form, setForm] = useState({
    name: '',
    type: 'expense',
    icon: 'Tag',
    color: 'indigo'
  });

  if (!isCategoryModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleAddCategory(form);
    setForm({ name: '', type: 'expense', icon: 'Tag', color: 'indigo' });
  };

  return (
    <div className="absolute inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-[28px] p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-extrabold text-[#0F172A]">Tambah Kategori Baru</h2>
          <button 
            onClick={() => setIsCategoryModalOpen(false)} 
            className="p-1.5 bg-slate-100 rounded-full text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500">Nama Kategori</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none"
              placeholder="Cth: Kebutuhan Skincare · Bulanan"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500">Tipe</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none"
              >
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500">Ikon</label>
              <select
                value={form.icon}
                onChange={e => setForm({ ...form, icon: e.target.value })}
                className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none"
              >
                {ICON_OPTIONS.map(ic => (
                  <option key={ic.name} value={ic.name}>{ic.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-2">Pilih Warna Ikon</label>
            <div className="flex gap-2.5">
              {COLOR_OPTIONS.map(col => (
                <button
                  type="button"
                  key={col.name}
                  onClick={() => setForm({ ...form, color: col.name })}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${col.bg} ${
                    form.color === col.name ? 'ring-2 ring-[#1D63DC] ring-offset-2' : ''
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${col.dot}`}></span>
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 bg-[#1D63DC] text-white rounded-2xl font-extrabold text-sm"
          >
            Simpan Kategori
          </button>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;

