import React from 'react';
import { 
  X, Trash2, ArrowDownCircle, ArrowUpCircle, Wallet, 
  CheckCircle2, ChevronRight, Pencil, AlertTriangle
} from 'lucide-react';
import { formatIDR, formatInputThousand, formatShortDate } from '../utils/formatters';
import { ICON_OPTIONS, COLOR_OPTIONS, WALLET_PRESETS } from '../utils/constants';
import CategoryBadge from './CategoryBadge';

export default function Modals({
  isTxModalOpen, setIsTxModalOpen, txForm, setTxForm, handleAddTx,
  isWalletModalOpen, setIsWalletModalOpen, editingWallet, walletForm, setWalletForm, handleSaveWallet, handleDeleteWallet,
  isBudgetModalOpen, setIsBudgetModalOpen, budgetForm, setBudgetForm, handleAddBudget,
  selectedBudget, setSelectedBudgetId, selectedBudgetLogs, handleDeleteBudget, handleDeleteBudgetLog,
  isBudgetActionModalOpen, setIsBudgetActionModalOpen, budgetActionType, setBudgetActionType, budgetActionForm, setBudgetActionForm, handleBudgetAction,
  isCategoryModalOpen, setIsCategoryModalOpen, categoryForm, setCategoryForm, handleAddCategory,
  isAdjustModalOpen, setIsAdjustModalOpen, setActiveTab,
  isConfirmResetOpen, setIsConfirmResetOpen, isResetting, handleClearAllData,
  successPopup, setSuccessPopup,
  wallets, categories, todayStr,
  // TX Detail props
  isTxDetailOpen, setIsTxDetailOpen, selectedTx, isEditingTx, setIsEditingTx,
  editTxForm, setEditTxForm, handleUpdateTx, handleDeleteTx,
}) {
  const isRealEdit = editingWallet && !editingWallet.isPreset && Boolean(editingWallet.id);
  const [confirmDeleteTx, setConfirmDeleteTx] = React.useState(false);

  return (
    <>
      {/* 0. MODAL DETAIL / EDIT TRANSAKSI */}
      {isTxDetailOpen && selectedTx && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-end justify-center animate-in fade-in">
          <div className="bg-white w-full rounded-t-[30px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-10">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-extrabold text-[#0F172A]">
                {isEditingTx ? 'Edit Transaksi' : 'Detail Transaksi'}
              </h2>
              <button
                onClick={() => { setIsTxDetailOpen(false); setConfirmDeleteTx(false); setIsEditingTx(false); }}
                className="p-1.5 bg-slate-100 rounded-full text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODE VIEW */}
            {!isEditingTx && (
              <div className="space-y-4">
                {/* Nominal */}
                <div className={`rounded-2xl p-4 text-white text-center ${selectedTx.type === 'expense' ? 'bg-gradient-to-br from-rose-500 to-rose-600' : 'bg-gradient-to-br from-emerald-400 to-teal-500'}`}>
                  <p className="text-xs font-bold opacity-80 mb-1">
                    {selectedTx.type === 'expense' ? 'PENGELUARAN' : 'PEMASUKAN'}
                  </p>
                  <p className="text-3xl font-extrabold">
                    {selectedTx.type === 'expense' ? '-' : '+'}Rp {formatIDR(selectedTx.amount)}
                  </p>
                </div>

                {/* Info Rows */}
                <div className="bg-slate-50 rounded-2xl divide-y divide-slate-100">
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-xs font-bold text-slate-500">Kategori</span>
                    <span className="text-xs font-extrabold text-[#0F172A]">{selectedTx.category}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-xs font-bold text-slate-500">Dompet</span>
                    <span className="text-xs font-extrabold text-[#0F172A]">{selectedTx.walletName || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-xs font-bold text-slate-500">Tanggal</span>
                    <span className="text-xs font-extrabold text-[#0F172A]">
                      {selectedTx.date ? new Date(selectedTx.date).toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) : '-'}
                    </span>
                  </div>
                  {selectedTx.note && (
                    <div className="flex justify-between items-start px-4 py-3 gap-4">
                      <span className="text-xs font-bold text-slate-500 shrink-0">Catatan</span>
                      <span className="text-xs font-extrabold text-[#0F172A] text-right">{selectedTx.note}</span>
                    </div>
                  )}
                </div>

                {/* Konfirmasi Hapus */}
                {confirmDeleteTx ? (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-rose-600">
                      <AlertTriangle size={16} />
                      <p className="text-xs font-bold">Yakin hapus transaksi ini? Saldo dompet akan dikembalikan.</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmDeleteTx(false)}
                        className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => { handleDeleteTx(selectedTx); setConfirmDeleteTx(false); }}
                        className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-bold"
                      >
                        Ya, Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => setConfirmDeleteTx(true)}
                      className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Trash2 size={15} /> Hapus
                    </button>
                    <button
                      onClick={() => setIsEditingTx(true)}
                      className="flex-1 py-3 bg-[#EFF6FF] hover:bg-blue-100 text-[#1D63DC] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Pencil size={15} /> Edit
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* MODE EDIT */}
            {isEditingTx && (
              <form onSubmit={handleUpdateTx} className="space-y-4">
                {/* Switch tipe */}
                <div className="flex bg-slate-100 rounded-2xl p-1">
                  <button type="button"
                    onClick={() => { const firstExp = categories.find(c => c.type === 'expense')?.name || ''; setEditTxForm({ ...editTxForm, type: 'expense', category: firstExp }); }}
                    className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${editTxForm.type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}
                  >PENGELUARAN</button>
                  <button type="button"
                    onClick={() => { const firstInc = categories.find(c => c.type === 'income')?.name || ''; setEditTxForm({ ...editTxForm, type: 'income', category: firstInc }); }}
                    className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${editTxForm.type === 'income' ? 'bg-white text-[#00C49A] shadow-sm' : 'text-slate-500'}`}
                  >PEMASUKAN</button>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500">Nominal (Rp)</label>
                  <input type="text" inputMode="numeric" required
                    value={editTxForm.amount}
                    onChange={e => setEditTxForm({ ...editTxForm, amount: formatInputThousand(e.target.value) })}
                    className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-extrabold outline-none focus:border-[#1D63DC]"
                    placeholder="0"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500">Pilih Dompet</label>
                    <select required value={editTxForm.walletId}
                      onChange={e => setEditTxForm({ ...editTxForm, walletId: e.target.value })}
                      className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
                    >
                      <option value="">Pilih Dompet...</option>
                      {wallets.map(w => (
                        <option key={w.id} value={w.id}>{w.name} (Rp {formatIDR(w.balance)})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500">Tanggal</label>
                    <input type="date" required value={editTxForm.date}
                      onChange={e => setEditTxForm({ ...editTxForm, date: e.target.value })}
                      className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500">Kategori</label>
                  <select required value={editTxForm.category}
                    onChange={e => setEditTxForm({ ...editTxForm, category: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
                  >
                    <option value="">Pilih Kategori...</option>
                    {categories.filter(c => c.type === editTxForm.type).map(c => (
                      <option key={c.id || c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500">Catatan / Keterangan</label>
                  <input type="text" value={editTxForm.note}
                    onChange={e => setEditTxForm({ ...editTxForm, note: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-[#1D63DC]"
                    placeholder="Contoh: Makan siang, Uang bensin..."
                  />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsEditingTx(false)}
                    className="flex-1 py-3.5 rounded-2xl text-slate-600 font-extrabold text-sm bg-slate-100 hover:bg-slate-200 transition-colors"
                  >Batal</button>
                  <button type="submit"
                    className={`flex-1 py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-md transition-transform active:scale-98 ${editTxForm.type === 'expense' ? 'bg-[#1D63DC]' : 'bg-[#00C49A]'}`}
                  >Simpan Perubahan</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 1. MODAL CATAT TRANSAKSI (HOME) */}
      {isTxModalOpen && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-end justify-center animate-in fade-in">
          <div className="bg-white w-full rounded-t-[30px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-extrabold text-[#0F172A]">Catat Transaksi</h2>
              <button onClick={() => setIsTxModalOpen(false)} className="p-1.5 bg-slate-100 rounded-full text-slate-500">
                <X size={18} />
              </button>
            </div>

            {/* Switch Pengeluaran / Pemasukan */}
            <div className="flex bg-slate-100 rounded-2xl p-1 mb-5">
              <button
                type="button"
                onClick={() => {
                  const firstExp = categories.find(c => c.type === 'expense')?.name || '';
                  setTxForm({ ...txForm, type: 'expense', category: firstExp });
                }}
                className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                  txForm.type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                PENGELUARAN
              </button>
              <button
                type="button"
                onClick={() => {
                  const firstInc = categories.find(c => c.type === 'income')?.name || '';
                  setTxForm({ ...txForm, type: 'income', category: firstInc });
                }}
                className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                  txForm.type === 'income' ? 'bg-white text-[#00C49A] shadow-sm' : 'text-slate-500'
                }`}
              >
                PEMASUKAN
              </button>
            </div>

            <form onSubmit={handleAddTx} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500">Nominal (Rp)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={txForm.amount}
                  onChange={e => setTxForm({ ...txForm, amount: formatInputThousand(e.target.value) })}
                  className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-extrabold outline-none focus:border-[#1D63DC]"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500">Pilih Dompet</label>
                  <select
                    required
                    value={txForm.walletId}
                    onChange={e => setTxForm({ ...txForm, walletId: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
                  >
                    <option value="">Pilih Dompet...</option>
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>{w.name} (Rp {formatIDR(w.balance)})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={txForm.date}
                    onChange={e => setTxForm({ ...txForm, date: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500">Kategori</label>
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryForm(prev => ({ ...prev, type: txForm.type }));
                      setIsCategoryModalOpen(true);
                    }}
                    className="text-xs font-bold text-[#1D63DC] hover:underline"
                  >
                    + Tambah Kategori
                  </button>
                </div>
                <select
                  required
                  value={txForm.category}
                  onChange={e => setTxForm({ ...txForm, category: e.target.value })}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
                >
                  <option value="">Pilih Kategori...</option>
                  {categories.filter(c => c.type === txForm.type).map(c => (
                    <option key={c.id || c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500">Catatan / Keterangan</label>
                <input
                  type="text"
                  value={txForm.note}
                  onChange={e => setTxForm({ ...txForm, note: e.target.value })}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-[#1D63DC]"
                  placeholder="Contoh: Self Reward, Uang Makan 4 Minggu - Cash"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-4 rounded-2xl text-white font-extrabold text-sm shadow-md transition-transform active:scale-98 ${
                  txForm.type === 'expense' ? 'bg-[#1D63DC]' : 'bg-[#00C49A]'
                }`}
              >
                Simpan Transaksi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL TAMBAH / EDIT DOMPET */}
      {isWalletModalOpen && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[28px] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-extrabold text-[#0F172A]">
                {isRealEdit ? 'Edit Kantong Dompet' : 'Tambah Kantong Dompet'}
              </h2>
              <button 
                onClick={() => {
                  setIsWalletModalOpen(false);
                }} 
                className="p-1.5 bg-slate-100 rounded-full text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveWallet} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500">Nama Bank / Dompet</label>
                <input
                  type="text"
                  required
                  value={walletForm.name}
                  onChange={e => setWalletForm({ ...walletForm, name: e.target.value })}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-[#1D63DC]"
                  placeholder="Cth: Seabank, Bank Jago, Mandiri, Cash"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500">Saldo Saat Ini (Rp)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={walletForm.balance}
                  onChange={e => setWalletForm({ ...walletForm, balance: formatInputThousand(e.target.value) })}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-base font-extrabold outline-none focus:border-[#1D63DC]"
                  placeholder="0"
                />
              </div>

              <div className="flex gap-2 pt-2">
                {isRealEdit && (
                  <button
                    type="button"
                    onClick={() => handleDeleteWallet(editingWallet.id)}
                    className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100"
                    title="Hapus Dompet"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-[#1D63DC] text-white rounded-2xl font-extrabold text-sm shadow-md shadow-blue-500/20"
                >
                  Simpan Dompet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL BUAT ANGGARAN (BUDGET) BARU */}
      {isBudgetModalOpen && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-end justify-center animate-in fade-in">
          <div className="bg-white w-full rounded-t-[30px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-lg font-extrabold text-[#0F172A]">Buat Anggaran (Budget) Baru</h2>
                <p className="text-xs text-slate-500">Alokasikan saldo dari dompet utama ke pos anggaran khusus</p>
              </div>
              <button onClick={() => setIsBudgetModalOpen(false)} className="p-1.5 bg-slate-100 rounded-full text-slate-500">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddBudget} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500">Nama Pos Anggaran</label>
                <input
                  type="text"
                  required
                  value={budgetForm.name}
                  onChange={e => setBudgetForm({ ...budgetForm, name: e.target.value })}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-[#1D63DC]"
                  placeholder="Contoh: Budget Dating"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500">Kategori Tampilan di Beranda</label>
                <select
                  value={budgetForm.categoryName}
                  onChange={e => setBudgetForm({ ...budgetForm, categoryName: e.target.value })}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
                >
                  {categories.filter(c => c.type === 'expense').map(c => (
                    <option key={c.id || c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500">Saldo Anggaran (Rp)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={budgetForm.initialAmount}
                    onChange={e => setBudgetForm({ ...budgetForm, initialAmount: formatInputThousand(e.target.value) })}
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-extrabold outline-none focus:border-[#1D63DC]"
                    placeholder="500.000"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500">Ambil dari Dompet</label>
                  <select
                    value={budgetForm.walletId}
                    onChange={e => {
                      const selectedW = wallets.find(w => w.id === e.target.value);
                      setBudgetForm({
                        ...budgetForm,
                        walletId: e.target.value,
                        storageForm: selectedW ? selectedW.name : budgetForm.storageForm
                      });
                    }}
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
                  >
                    <option value="">Pilih Dompet...</option>
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({formatIDR(w.balance)})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">
                  Saldo Anggaran Disimpan Dalam Bentuk Apa?
                </label>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {Array.from(new Set([...wallets.map(w => w.name), ...WALLET_PRESETS])).map((optionName) => {
                    const isSelected = budgetForm.storageForm === optionName;
                    return (
                      <button
                        key={optionName}
                        type="button"
                        onClick={() => setBudgetForm({ ...budgetForm, storageForm: optionName })}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                          isSelected
                            ? 'bg-[#1D63DC] text-white shadow-sm'
                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-[#1D63DC]'
                        }`}
                      >
                        {optionName}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500">Catatan di Beranda</label>
                <input
                  type="text"
                  value={budgetForm.note}
                  onChange={e => setBudgetForm({ ...budgetForm, note: e.target.value })}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:border-[#1D63DC]"
                  placeholder="Contoh: Budget Dating Oktober"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-[#1D63DC] to-[#0EA5E9] text-white rounded-2xl font-extrabold text-sm shadow-md shadow-blue-500/25"
              >
                Buat & Alokasikan Anggaran
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL DETAIL BUDGET & RINCIAN PENGGUNAAN */}
      {selectedBudget && !isBudgetActionModalOpen && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-end justify-center animate-in fade-in">
          <div className="bg-white w-full h-[88vh] rounded-t-[32px] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10">
            {/* Header Detail Budget */}
            <div className="bg-white px-6 pt-5 pb-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <CategoryBadge categoryName={selectedBudget.categoryName || selectedBudget.name} txType="expense" categories={categories} />
                <div>
                  <h2 className="text-xl font-extrabold text-[#0F172A]">{selectedBudget.name}</h2>
                  <p className="text-xs text-slate-400 font-medium">Rincian Saldo & Riwayat Penggunaan</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteBudget(selectedBudget.id)}
                  className="p-2 text-rose-500 bg-rose-50 rounded-full hover:bg-rose-100"
                  title="Hapus Anggaran"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => setSelectedBudgetId(null)}
                  className="p-2 text-slate-500 bg-slate-100 rounded-full hover:bg-slate-200"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Isi Detail Budget (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white">
              {/* Kartu Ringkasan Saldo Budget */}
              <div className="bg-white rounded-[26px] p-5 shadow-[0_6px_25px_rgba(0,0,0,0.04)] border border-slate-100 space-y-4">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sisa Saldo Anggaran</span>
                    <h3 className="text-3xl font-extrabold text-[#0F172A] mt-0.5">
                      Rp {formatIDR(selectedBudget.remaining)}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-400 block">Total Anggaran</span>
                    <span className="text-sm font-extrabold text-slate-700">Rp {formatIDR(selectedBudget.allocated)}</span>
                  </div>
                </div>

                {(() => {
                  const alloc = Number(selectedBudget.allocated) || 0;
                  const sp = Number(selectedBudget.spent) || 0;
                  const pct = alloc > 0 ? Math.min(100, Math.round((sp / alloc) * 100)) : 0;
                  return (
                    <div className="space-y-1.5">
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct >= 90 ? 'bg-rose-500' : 'bg-[#1D63DC]'}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-rose-600">Terpakai: Rp {formatIDR(sp)} ({pct}%)</span>
                        <span className="text-[#00C49A]">Tersedia: {100 - pct}%</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => {
                      setBudgetActionType('add_money');
                      setBudgetActionForm({
                        amount: '',
                        walletId: wallets[0]?.id || '',
                        note: '',
                        date: todayStr
                      });
                      setIsBudgetActionModalOpen(true);
                    }}
                    className="py-3 px-4 bg-[#00C49A] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
                  >
                    <ArrowDownCircle size={16} />
                    <span>Tambah Uang</span>
                  </button>

                  <button
                    onClick={() => {
                      setBudgetActionType('expense');
                      setBudgetActionForm({
                        amount: '',
                        walletId: '',
                        note: '',
                        date: todayStr
                      });
                      setIsBudgetActionModalOpen(true);
                    }}
                    className="py-3 px-4 bg-[#1D63DC] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
                  >
                    <ArrowUpCircle size={16} />
                    <span>Catat Keluar</span>
                  </button>
                </div>
              </div>

              {/* Card Bentuk Simpanan Saldo */}
              <div className="bg-[#EFF6FF]/70 rounded-[22px] p-4 border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white text-[#1D63DC] flex items-center justify-center shrink-0 shadow-sm">
                    <Wallet size={19} />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Keterangan Penyimpanan Saldo
                    </span>
                    <p className="text-xs font-bold text-slate-600 mt-0.5">
                      Saldo anggaran ini disimpan di <strong className="text-[#1D63DC]">{selectedBudget.storageForm || 'Cash'}</strong>
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#1D63DC] text-white text-xs font-extrabold shrink-0">
                  {selectedBudget.storageForm || 'Cash'}
                </span>
              </div>

              {/* Daftar Rincian Penggunaan */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="font-extrabold text-[#0F172A] text-sm">
                    Rincian Penggunaan ({selectedBudgetLogs.filter(l => l.type === 'expense').length})
                  </h4>
                </div>

                {selectedBudgetLogs.length === 0 ? (
                  <div className="bg-slate-50/70 rounded-3xl p-8 text-center text-slate-400 text-xs border border-slate-100">
                    Belum ada rincian penggunaan untuk anggaran <strong>{selectedBudget.name}</strong>. Klik tombol <strong>"Catat Keluar"</strong> di atas saat Anda memakai saldo anggaran ini.
                  </div>
                ) : (
                  <div className="bg-white rounded-[26px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                    {selectedBudgetLogs.map((log) => {
                      const d = new Date(log.date);
                      const isExpense = log.type === 'expense';
                      return (
                        <div key={log.id} className="p-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isExpense ? 'bg-rose-50 text-rose-500' : 'bg-[#E6FAF5] text-[#00C49A]'
                            }`}>
                              {isExpense ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#0F172A] text-sm truncate">
                                {log.note || (isExpense ? 'Pengeluaran Anggaran' : 'Alokasi Dana Masuk')}
                              </p>
                              <p className="text-xs text-slate-400 font-medium">
                                {formatShortDate(d)} {d.getFullYear()} • {isExpense ? 'Potong Saldo Budget' : `Dari ${log.walletName || 'Dompet'}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`font-extrabold text-sm ${isExpense ? 'text-rose-600' : 'text-[#00C49A]'}`}>
                              {isExpense ? '-' : '+'}{formatIDR(log.amount)}
                            </span>
                            {isExpense && (
                              <button
                                onClick={() => handleDeleteBudgetLog(log)}
                                className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg"
                                title="Hapus item rincian ini"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL AKSI DI DALAM BUDGET (TAMBAH UANG / CATAT KELUAR) */}
      {isBudgetActionModalOpen && selectedBudget && (
        <div className="absolute inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[28px] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#0F172A]">
                  {budgetActionType === 'add_money'
                    ? `Tambah Uang ke ${selectedBudget.name}`
                    : `Catat Pengeluaran ${selectedBudget.name}`}
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {budgetActionType === 'add_money'
                    ? 'Memotong saldo dompet sumber & menambah anggaran'
                    : `Sisa anggaran saat ini: Rp ${formatIDR(selectedBudget.remaining)}`}
                </p>
              </div>
              <button onClick={() => setIsBudgetActionModalOpen(false)} className="p-1.5 bg-slate-100 rounded-full text-slate-500">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBudgetAction} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500">Nominal (Rp)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={budgetActionForm.amount}
                  onChange={e => setBudgetActionForm({ ...budgetActionForm, amount: formatInputThousand(e.target.value) })}
                  className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-extrabold outline-none focus:border-[#1D63DC]"
                  placeholder="0"
                />
              </div>

              {budgetActionType === 'add_money' && (
                <div>
                  <label className="text-xs font-bold text-slate-500">Pilih Dompet Sumber</label>
                  <select
                    required
                    value={budgetActionForm.walletId}
                    onChange={e => setBudgetActionForm({ ...budgetActionForm, walletId: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
                  >
                    <option value="">Pilih Dompet...</option>
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>{w.name} (Rp {formatIDR(w.balance)})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-500">
                  {budgetActionType === 'expense' ? 'Dipakai Untuk Apa? (Rincian)' : 'Catatan Tambahan'}
                </label>
                <input
                  type="text"
                  required={budgetActionType === 'expense'}
                  value={budgetActionForm.note}
                  onChange={e => setBudgetActionForm({ ...budgetActionForm, note: e.target.value })}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-[#1D63DC]"
                  placeholder={budgetActionType === 'expense' ? 'Cth: Makan malam, Tiket nonton, Kopi' : 'Cth: Tambahan budget bulan ini'}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500">Tanggal</label>
                <input
                  type="date"
                  required
                  value={budgetActionForm.date}
                  onChange={e => setBudgetActionForm({ ...budgetActionForm, date: e.target.value })}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3.5 rounded-2xl font-extrabold text-white text-sm shadow-md ${
                  budgetActionType === 'add_money' ? 'bg-[#00C49A]' : 'bg-[#1D63DC]'
                }`}
              >
                {budgetActionType === 'add_money' ? 'Tambah ke Anggaran' : 'Simpan Pengeluaran Budget'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL TAMBAH KATEGORI BARU */}
      {isCategoryModalOpen && (
        <div className="absolute inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[28px] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-extrabold text-[#0F172A]">Tambah Kategori Baru</h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-1.5 bg-slate-100 rounded-full text-slate-500">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500">Nama Kategori</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none"
                  placeholder="Cth: Kebutuhan Skincare · Bulanan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500">Tipe</label>
                  <select
                    value={categoryForm.type}
                    onChange={e => setCategoryForm({ ...categoryForm, type: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none"
                  >
                    <option value="expense">Pengeluaran</option>
                    <option value="income">Pemasukan</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500">Ikon</label>
                  <select
                    value={categoryForm.icon}
                    onChange={e => setCategoryForm({ ...categoryForm, icon: e.target.value })}
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
                      onClick={() => setCategoryForm({ ...categoryForm, color: col.name })}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${col.bg} ${
                        categoryForm.color === col.name ? 'ring-2 ring-[#1D63DC] ring-offset-2' : ''
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${col.dot}`}></span>
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full py-3.5 bg-[#1D63DC] text-white rounded-2xl font-extrabold text-sm">
                Simpan Kategori
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL TOMBOL "SESUAIKAN" */}
      {isAdjustModalOpen && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[28px] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-extrabold text-[#0F172A]">Sesuaikan Pintasan</h2>
              <button onClick={() => setIsAdjustModalOpen(false)} className="p-1.5 bg-slate-100 rounded-full text-slate-500">
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
      )}

      {/* 8. MODAL KONFIRMASI RESET BERSIH */}
      {isConfirmResetOpen && (
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
      )}

      {/* 9. POP-UP MODAL BERHASIL INPUT DATA */}
      {successPopup && (
        <div 
          onClick={() => setSuccessPopup(null)}
          className="absolute inset-0 bg-black/45 backdrop-blur-[2px] z-[95] flex items-center justify-center p-5 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-xs rounded-[30px] p-6 shadow-2xl text-center space-y-4 border border-slate-100 animate-in zoom-in-95 duration-200"
          >
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#E6FAF5] rounded-full animate-ping opacity-50"></div>
              <div className="relative w-16 h-16 bg-[#E6FAF5] text-[#00C49A] rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle2 size={36} strokeWidth={2.5} />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-[#0F172A]">{successPopup.title}</h3>
              {successPopup.subtitle && (
                <p className="text-xs font-medium text-slate-500 line-clamp-2">{successPopup.subtitle}</p>
              )}
            </div>

            {successPopup.amount !== null && successPopup.amount !== undefined && (
              <div className="py-2.5 px-4 bg-[#EFF6FF]/60 rounded-2xl border border-blue-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Nominal Tercatat
                </span>
                <p className={`text-2xl font-extrabold mt-0.5 ${
                  successPopup.amountType === 'expense' ? 'text-rose-600' :
                  successPopup.amountType === 'income' ? 'text-[#00C49A]' : 'text-[#1D63DC]'
                }`}>
                  {successPopup.amountType === 'expense' ? '-' : successPopup.amountType === 'income' ? '+' : ''}
                  Rp {formatIDR(successPopup.amount)}
                </p>
              </div>
            )}

            {successPopup.details && successPopup.details.length > 0 && (
              <div className="bg-slate-50/80 rounded-2xl p-3.5 space-y-2 text-left border border-slate-100">
                {successPopup.details.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs gap-2">
                    <span className="text-slate-400 font-semibold shrink-0">{item.label}</span>
                    <span className="text-[#0F172A] font-extrabold truncate text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setSuccessPopup(null)}
              className="w-full py-3.5 bg-gradient-to-r from-[#1D63DC] to-[#0EA5E9] hover:opacity-95 active:scale-95 text-white rounded-2xl font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all"
            >
              Oke, Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}

