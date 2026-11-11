import React, { useState } from 'react';
import { 
  X, Trash2, ArrowDownCircle, ArrowUpCircle, Wallet, 
  CheckCircle2, ChevronRight, Pencil, AlertTriangle, PiggyBank, MapPin,
  ArrowLeftRight, ArrowDownUp
} from 'lucide-react';
import { formatIDR, formatInputThousand, formatShortDate, parseRawAmount } from '../utils/formatters';
import { ICON_OPTIONS, COLOR_OPTIONS, WALLET_PRESETS } from '../utils/constants';
import CategoryBadge from './CategoryBadge';

export default function Modals({
  isTxModalOpen, setIsTxModalOpen, txForm, setTxForm, handleAddTx,
  isWalletModalOpen, setIsWalletModalOpen, editingWallet, walletForm, setWalletForm, handleSaveWallet, handleDeleteWallet,
  isTransferModalOpen, setIsTransferModalOpen, transferForm, setTransferForm, handleTransferWallet, onOpenTransfer,
  isBudgetModalOpen, setIsBudgetModalOpen, budgetForm, setBudgetForm, handleAddBudget,
  selectedBudget, setSelectedBudgetId, selectedBudgetLogs, handleUpdateBudget, handleUpdateBudgetLog, handleDeleteBudget, handleDeleteBudgetLog,
  isBudgetActionModalOpen, setIsBudgetActionModalOpen, budgetActionType, setBudgetActionType, budgetActionForm, setBudgetActionForm, handleBudgetAction,
  isCategoryModalOpen, setIsCategoryModalOpen, editingCategory, setEditingCategory, categoryForm, setCategoryForm, handleAddCategory, handleDeleteCategory,
  isAdjustModalOpen, setIsAdjustModalOpen, setActiveTab,
  isConfirmResetOpen, setIsConfirmResetOpen, isResetting, handleClearAllData,
  successPopup, setSuccessPopup,
  wallets, categories, todayStr,
  // TX Detail props
  isTxDetailOpen, setIsTxDetailOpen, selectedTx, isEditingTx, setIsEditingTx,
  editTxForm, setEditTxForm, handleUpdateTx, handleDeleteTx,
  // Savings props
  isSavingModalOpen, setIsSavingModalOpen, savingForm, setSavingForm, handleAddSaving,
  selectedSaving, setSelectedSavingId, selectedSavingLogs = [],
  handleUpdateSaving, handleDeleteSaving, handleDeleteSavingLog,
  isSavingActionModalOpen, setIsSavingActionModalOpen, savingActionType, setSavingActionType,
  savingActionForm, setSavingActionForm, handleSavingAction
}) {
  const isRealEdit = editingWallet && !editingWallet.isPreset && Boolean(editingWallet.id);
  const [confirmDeleteTx, setConfirmDeleteTx] = useState(false);

  // State lokal untuk Edit & Konfirmasi Hapus Budget
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [editBudgetForm, setEditBudgetForm] = useState({ name: '', categoryName: '', storageForm: '' });
  const [confirmDeleteBudget, setConfirmDeleteBudget] = useState(false);
  const [deleteBudgetMode, setDeleteBudgetMode] = useState('refund'); // 'refund' | 'clean'
  const [refundWalletId, setRefundWalletId] = useState('');

  // State lokal untuk Edit Cashflow (Rincian Penggunaan / Alokasi) di dalam Detail Budget
  const [editingLogId, setEditingLogId] = useState(null);
  const [editLogForm, setEditLogForm] = useState({ amount: '', note: '', walletId: '', date: todayStr });

  // State lokal untuk Edit & Konfirmasi Hapus Tabungan
  const [isEditingSaving, setIsEditingSaving] = useState(false);
  const [editSavingForm, setEditSavingForm] = useState({ name: '', targetAmount: '', storedIn: '' });
  const [confirmDeleteSaving, setConfirmDeleteSaving] = useState(false);
  const [savingRefundWalletId, setSavingRefundWalletId] = useState('');

  const storagePresets = ['Seabank', 'BCA', 'Bank Jago', 'Mandiri', 'Bibit', 'Celengan Tunai', 'Dana', 'Gopay'];

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
                <div className={`rounded-2xl p-4 text-white text-center ${
                  selectedTx.type === 'transfer'
                    ? 'bg-gradient-to-br from-[#1D63DC] to-[#0EA5E9]'
                    : selectedTx.type === 'expense'
                      ? 'bg-gradient-to-br from-rose-500 to-rose-600'
                      : 'bg-gradient-to-br from-emerald-400 to-teal-500'
                }`}>
                  <p className="text-xs font-bold opacity-80 mb-1">
                    {selectedTx.type === 'transfer'
                      ? 'PEMINDAHAN SALDO ANTAR KANTONG'
                      : selectedTx.type === 'expense'
                        ? 'PENGELUARAN'
                        : 'PEMASUKAN'}
                  </p>
                  <p className="text-3xl font-extrabold">
                    {selectedTx.type === 'transfer' ? '↔ ' : selectedTx.type === 'expense' ? '-' : '+'}Rp {formatIDR(selectedTx.amount)}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl divide-y divide-slate-100">
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-xs font-bold text-slate-500">Kategori</span>
                    <span className="text-xs font-extrabold text-[#0F172A]">{selectedTx.category}</span>
                  </div>
                  {selectedTx.type === 'transfer' ? (
                    <>
                      <div className="flex justify-between items-center px-4 py-3">
                        <span className="text-xs font-bold text-slate-500">Dari Kantung (Sumber)</span>
                        <span className="text-xs font-extrabold text-rose-600">{selectedTx.fromWalletName || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center px-4 py-3">
                        <span className="text-xs font-bold text-slate-500">Ke Kantung (Tujuan)</span>
                        <span className="text-xs font-extrabold text-[#00C49A]">{selectedTx.toWalletName || '-'}</span>
                      </div>
                      {Number(selectedTx.adminFee) > 0 && (
                        <div className="flex justify-between items-center px-4 py-3">
                          <span className="text-xs font-bold text-slate-500">Biaya Admin Transfer</span>
                          <span className="text-xs font-extrabold text-rose-600">Rp {formatIDR(selectedTx.adminFee)}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-between items-center px-4 py-3">
                      <span className="text-xs font-bold text-slate-500">Kantung Dompet</span>
                      <span className="text-xs font-extrabold text-[#1D63DC]">{selectedTx.walletName || '-'}</span>
                    </div>
                  )}
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

                {confirmDeleteTx ? (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-rose-600">
                      <AlertTriangle size={16} />
                      <p className="text-xs font-bold">
                        {selectedTx.type === 'transfer'
                          ? `Yakin batalkan pemindahan saldo ini? Saldo kantung ${selectedTx.fromWalletName} dan ${selectedTx.toWalletName} akan dikembalikan.`
                          : `Yakin hapus transaksi ini? Saldo kantung ${selectedTx.walletName} akan dikembalikan.`}
                      </p>
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
                {editTxForm.type === 'transfer' ? (
                  <>
                    <div className="p-3 bg-[#EFF6FF] rounded-2xl flex items-center gap-2 text-xs font-extrabold text-[#1D63DC]">
                      <ArrowLeftRight size={15} />
                      <span>Edit Pemindahan Saldo Antar Kantong</span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500">Nominal Pindah Saldo (Rp)</label>
                      <input type="text" inputMode="numeric" required
                        value={editTxForm.amount}
                        onChange={e => setEditTxForm({ ...editTxForm, amount: formatInputThousand(e.target.value) })}
                        className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-extrabold outline-none focus:border-[#1D63DC]"
                        placeholder="0"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-500">Dari Kantung (Sumber)</label>
                        <select required value={editTxForm.fromWalletId || ''}
                          onChange={e => setEditTxForm({ ...editTxForm, fromWalletId: e.target.value })}
                          className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
                        >
                          <option value="">Pilih Sumber...</option>
                          {wallets.map(w => (
                            <option key={w.id} value={w.id}>{w.name} (Rp {formatIDR(w.balance)})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500">Ke Kantung (Tujuan)</label>
                        <select required value={editTxForm.toWalletId || ''}
                          onChange={e => setEditTxForm({ ...editTxForm, toWalletId: e.target.value })}
                          className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
                        >
                          <option value="">Pilih Tujuan...</option>
                          {wallets.map(w => (
                            <option key={w.id} value={w.id}>{w.name} (Rp {formatIDR(w.balance)})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-500">Biaya Admin (Opsional)</label>
                        <input type="text" inputMode="numeric"
                          value={editTxForm.adminFee || ''}
                          onChange={e => setEditTxForm({ ...editTxForm, adminFee: formatInputThousand(e.target.value) })}
                          className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
                          placeholder="0 (Gratis)"
                        />
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
                      <label className="text-xs font-bold text-slate-500">Catatan / Keterangan</label>
                      <input type="text" value={editTxForm.note}
                        onChange={e => setEditTxForm({ ...editTxForm, note: e.target.value })}
                        className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-[#1D63DC]"
                        placeholder="Contoh: Pindah uang magang ke cash..."
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex bg-slate-100 rounded-2xl p-1">
                      <button type="button"
                        onClick={() => { const firstExp = categories.find(c => c.type === 'expense')?.name || ''; setEditTxForm({ ...editTxForm, type: 'expense', category: firstExp }); }}
                        className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${editTxForm.type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}
                      >PENGELUARAN</button>
                      <button type="button"
                        onClick={() => { const firstInc = categories.find(c => c.type === 'income')?.name || ''; setEditTxForm({ ...editTxForm, category: firstInc, type: 'income' }); }}
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
                        <label className="text-xs font-bold text-slate-500">Pilih Kantung Dompet</label>
                        <select required value={editTxForm.walletId}
                          onChange={e => setEditTxForm({ ...editTxForm, walletId: e.target.value })}
                          className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
                        >
                          <option value="">Pilih Kantung...</option>
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
                  </>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsEditingTx(false)}
                    className="flex-1 py-3.5 rounded-2xl text-slate-600 font-extrabold text-sm bg-slate-100 hover:bg-slate-200 transition-colors"
                  >Batal</button>
                  <button type="submit"
                    className={`flex-1 py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-md transition-transform active:scale-98 ${
                      editTxForm.type === 'income' ? 'bg-[#00C49A]' : 'bg-[#1D63DC]'
                    }`}
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
              {onOpenTransfer && (
                <button
                  type="button"
                  onClick={() => {
                    setIsTxModalOpen(false);
                    onOpenTransfer(txForm.walletId || '');
                  }}
                  className="flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all text-[#1D63DC] hover:bg-white/70 flex items-center justify-center gap-1"
                >
                  <ArrowLeftRight size={12} /> PINDAH SALDO
                </button>
              )}
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
                  <label className="text-xs font-bold text-slate-500">Pilih Kantung Dompet</label>
                  <select
                    required
                    value={txForm.walletId}
                    onChange={e => setTxForm({ ...txForm, walletId: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
                  >
                    <option value="">Pilih Kantung...</option>
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
                onClick={() => setIsWalletModalOpen(false)} 
                className="p-1.5 bg-slate-100 rounded-full text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveWallet} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500">Nama Kantong / Sumber Dana</label>
                <input
                  type="text"
                  required
                  value={walletForm.name}
                  onChange={e => setWalletForm({ ...walletForm, name: e.target.value })}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-[#1D63DC]"
                  placeholder="Cth: Gaji Magang, Freelance, Seabank, BCA, Cash"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500">Saldo Real Saat Ini (Rp)</label>
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
                  Simpan Kantong
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2B. MODAL PEMINDAHAN SALDO ANTAR KANTONG DOMPET (TRANSFER) */}
      {isTransferModalOpen && transferForm && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-end justify-center animate-in fade-in">
          <div className="bg-white w-full rounded-t-[30px] p-6 shadow-2xl max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#0F172A] flex items-center gap-2">
                  <ArrowLeftRight size={19} className="text-[#1D63DC]" />
                  <span>Pindah Saldo Antar Kantong</span>
                </h2>
                <p className="text-xs text-slate-500">Saldo kedua kantung langsung ter-update secara real-time</p>
              </div>
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="p-1.5 bg-slate-100 rounded-full text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            {wallets.length < 2 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center space-y-3">
                <p className="text-xs font-bold text-amber-800">
                  Minimal harus ada 2 kantong dompet aktif untuk memindahkan saldo.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsTransferModalOpen(false);
                    setIsWalletModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-[#1D63DC] text-white rounded-xl text-xs font-extrabold"
                >
                  + Tambah Kantong Baru
                </button>
              </div>
            ) : (
              <form onSubmit={handleTransferWallet} className="space-y-4">
                {(() => {
                  const fromW = wallets.find(w => w.id === transferForm.fromWalletId);
                  const toW = wallets.find(w => w.id === transferForm.toWalletId);
                  const rawAmt = parseRawAmount(transferForm.amount);
                  const rawFee = parseRawAmount(transferForm.adminFee);
                  const afterFrom = fromW ? (Number(fromW.balance) || 0) - rawAmt - rawFee : 0;
                  const afterTo = toW ? (Number(toW.balance) || 0) + rawAmt : 0;

                  return (
                    <>
                      {/* Skema Kantong Asal -> Kantong Tujuan */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2.5 relative">
                        <div>
                          <label className="text-[11px] font-extrabold text-rose-500 uppercase tracking-wider block">
                            Dari Kantung (Sumber Dana)
                          </label>
                          <select
                            required
                            value={transferForm.fromWalletId}
                            onChange={e => {
                              const newFrom = e.target.value;
                              let newTo = transferForm.toWalletId;
                              if (newFrom === newTo) {
                                const alt = wallets.find(w => w.id !== newFrom);
                                newTo = alt ? alt.id : '';
                              }
                              setTransferForm({ ...transferForm, fromWalletId: newFrom, toWalletId: newTo });
                            }}
                            className="w-full mt-1 p-3 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-[#0F172A] outline-none focus:border-[#1D63DC]"
                          >
                            <option value="">Pilih Kantung Asal...</option>
                            {wallets.map(w => (
                              <option key={w.id} value={w.id}>
                                {w.name} — Saldo: Rp {formatIDR(w.balance)}
                              </option>
                            ))}
                          </select>
                          {fromW && (
                            <div className="flex justify-between items-center text-[11px] mt-1 px-1">
                              <span className="text-slate-400 font-semibold">Saldo saat ini: Rp {formatIDR(fromW.balance)}</span>
                              {rawAmt > 0 && (
                                <span className={`font-extrabold ${afterFrom < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                                  Sisa: Rp {formatIDR(Math.max(0, afterFrom))}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Tombol Tukar Posisi */}
                        <div className="flex items-center justify-center -my-1">
                          <button
                            type="button"
                            onClick={() => {
                              setTransferForm({
                                ...transferForm,
                                fromWalletId: transferForm.toWalletId,
                                toWalletId: transferForm.fromWalletId
                              });
                            }}
                            className="px-3 py-1.5 rounded-full bg-[#EFF6FF] hover:bg-blue-100 text-[#1D63DC] border border-blue-200 text-[11px] font-extrabold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                            title="Tukar Kantung Asal & Tujuan"
                          >
                            <ArrowDownUp size={13} /> Tukar Posisi
                          </button>
                        </div>

                        <div>
                          <label className="text-[11px] font-extrabold text-[#00C49A] uppercase tracking-wider block">
                            Ke Kantung (Tujuan Penerima)
                          </label>
                          <select
                            required
                            value={transferForm.toWalletId}
                            onChange={e => setTransferForm({ ...transferForm, toWalletId: e.target.value })}
                            className="w-full mt-1 p-3 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-[#0F172A] outline-none focus:border-[#1D63DC]"
                          >
                            <option value="">Pilih Kantung Tujuan...</option>
                            {wallets
                              .filter(w => w.id !== transferForm.fromWalletId)
                              .map(w => (
                                <option key={w.id} value={w.id}>
                                  {w.name} — Saldo: Rp {formatIDR(w.balance)}
                                </option>
                              ))}
                          </select>
                          {toW && (
                            <div className="flex justify-between items-center text-[11px] mt-1 px-1">
                              <span className="text-slate-400 font-semibold">Saldo saat ini: Rp {formatIDR(toW.balance)}</span>
                              {rawAmt > 0 && (
                                <span className="font-extrabold text-[#00C49A]">
                                  Menjadi: Rp {formatIDR(afterTo)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Nominal Pindah Saldo */}
                      <div>
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-slate-500">Nominal Pindah Saldo (Rp)</label>
                          {fromW && Number(fromW.balance) > 0 && (
                            <div className="flex items-center gap-1">
                              {[
                                { label: '25%', pct: 0.25 },
                                { label: '50%', pct: 0.5 },
                                { label: 'Semua', pct: 1 }
                              ].map(btn => (
                                <button
                                  key={btn.label}
                                  type="button"
                                  onClick={() => {
                                    const val = Math.floor((Number(fromW.balance) || 0) * btn.pct);
                                    setTransferForm({ ...transferForm, amount: formatInputThousand(String(val)) });
                                  }}
                                  className="px-2 py-0.5 rounded-lg bg-[#EFF6FF] hover:bg-blue-100 text-[#1D63DC] text-[10px] font-extrabold transition-colors"
                                >
                                  {btn.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          value={transferForm.amount}
                          onChange={e => setTransferForm({ ...transferForm, amount: formatInputThousand(e.target.value) })}
                          className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-extrabold outline-none focus:border-[#1D63DC]"
                          placeholder="0"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-500">Biaya Admin (Opsional)</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={transferForm.adminFee}
                            onChange={e => setTransferForm({ ...transferForm, adminFee: formatInputThousand(e.target.value) })}
                            className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
                            placeholder="0 (Gratis)"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500">Tanggal</label>
                          <input
                            type="date"
                            required
                            value={transferForm.date}
                            onChange={e => setTransferForm({ ...transferForm, date: e.target.value })}
                            className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-500">Catatan / Keterangan (Opsional)</label>
                        <input
                          type="text"
                          value={transferForm.note}
                          onChange={e => setTransferForm({ ...transferForm, note: e.target.value })}
                          className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:border-[#1D63DC]"
                          placeholder="Contoh: Tarik tunai ke Cash, Pindah gaji magang ke Seabank..."
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#1D63DC] to-[#0EA5E9] text-white font-extrabold text-sm shadow-md shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
                      >
                        <ArrowLeftRight size={16} /> Pindahkan Saldo Sekarang
                      </button>
                    </>
                  );
                })()}
              </form>
            )}
          </div>
        </div>
      )}

      {/* 3. MODAL BUAT ANGGARAN (BUDGET / GRUP PENGELUARAN) BARU */}
      {isBudgetModalOpen && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-end justify-center animate-in fade-in">
          <div className="bg-white w-full rounded-t-[30px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-lg font-extrabold text-[#0F172A]">Buat Anggaran / Grup Pengeluaran</h2>
                <p className="text-xs text-slate-500">Bisa alokasi saldo awal atau mulai Rp 0 (fleksibel multi-dompet)</p>
              </div>
              <button onClick={() => setIsBudgetModalOpen(false)} className="p-1.5 bg-slate-100 rounded-full text-slate-500">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddBudget} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500">Nama Pos Anggaran / Grup</label>
                <input
                  type="text"
                  required
                  value={budgetForm.name}
                  onChange={e => setBudgetForm({ ...budgetForm, name: e.target.value })}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-[#1D63DC]"
                  placeholder="Contoh: Operasional Oktober, Budget Dating"
                />
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500">Kategori Tampilan di Beranda</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (setEditingCategory) setEditingCategory(null);
                      setCategoryForm({ name: '', type: 'expense', icon: 'Tag', color: 'indigo' });
                      setIsCategoryModalOpen(true);
                    }}
                    className="text-xs font-bold text-[#1D63DC] hover:underline"
                  >
                    + Tambah Kategori
                  </button>
                </div>
                <select
                  value={budgetForm.categoryName}
                  onChange={e => setBudgetForm({ ...budgetForm, categoryName: e.target.value })}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
                >
                  <option value="">Sesuai Nama Anggaran</option>
                  {categories.filter(c => c.type === 'expense').map(c => (
                    <option key={c.id || c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500">Alokasi Awal (Opsional)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={budgetForm.initialAmount}
                    onChange={e => setBudgetForm({ ...budgetForm, initialAmount: formatInputThousand(e.target.value) })}
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-extrabold outline-none focus:border-[#1D63DC]"
                    placeholder="0 (Kosong = fleksibel)"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500">Kantung Sumber Awal</label>
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
                    <option value="">Pilih Kantung...</option>
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({formatIDR(w.balance)})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">
                  Keterangan Kantong / Tempat Simpan Utama
                </label>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {Array.from(new Set(['Multi-Dompet', ...wallets.map(w => w.name), ...WALLET_PRESETS])).map((optionName) => {
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
                <label className="text-xs font-bold text-slate-500">Catatan</label>
                <input
                  type="text"
                  value={budgetForm.note}
                  onChange={e => setBudgetForm({ ...budgetForm, note: e.target.value })}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:border-[#1D63DC]"
                  placeholder="Contoh: Pengeluaran Operasional Oktober"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-[#1D63DC] to-[#0EA5E9] text-white rounded-2xl font-extrabold text-sm shadow-md shadow-blue-500/25"
              >
                Simpan Pos Anggaran
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL DETAIL BUDGET, EDIT, HAPUS DENGAN REFUND, & MULTI-WALLET TRACKING */}
      {selectedBudget && !isBudgetActionModalOpen && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-end justify-center animate-in fade-in">
          <div className="bg-white w-full h-[90vh] rounded-t-[32px] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10">
            {/* Header Detail Budget */}
            <div className="bg-white px-6 pt-5 pb-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3 min-w-0">
                <CategoryBadge categoryName={selectedBudget.categoryName || selectedBudget.name} txType="expense" categories={categories} />
                <div className="min-w-0">
                  <h2 className="text-lg font-extrabold text-[#0F172A] truncate">{selectedBudget.name}</h2>
                  <p className="text-xs text-slate-400 font-medium">Multi-Dompet & Rincian Pengeluaran</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    setIsEditingBudget(!isEditingBudget);
                    setConfirmDeleteBudget(false);
                    setEditBudgetForm({
                      name: selectedBudget.name || '',
                      categoryName: selectedBudget.categoryName || 'Kebutuhan Dating',
                      storageForm: selectedBudget.storageForm || 'Multi-Dompet'
                    });
                  }}
                  className="p-2 text-[#1D63DC] bg-[#EFF6FF] rounded-full hover:bg-blue-100"
                  title="Edit Anggaran"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => {
                    setConfirmDeleteBudget(!confirmDeleteBudget);
                    setIsEditingBudget(false);
                    const defaultW = wallets.find(w => w.name === selectedBudget.storageForm) || wallets[0];
                    setRefundWalletId(defaultW ? defaultW.id : '');
                  }}
                  className="p-2 text-rose-500 bg-rose-50 rounded-full hover:bg-rose-100"
                  title="Hapus Anggaran"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => {
                    setSelectedBudgetId(null);
                    setIsEditingBudget(false);
                    setConfirmDeleteBudget(false);
                  }}
                  className="p-2 text-slate-500 bg-slate-100 rounded-full hover:bg-slate-200"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Isi Detail Budget (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white">
              {/* KOTAK KONFIRMASI HAPUS ANGGARAN: PILIHAN BALIKKAN SALDO ATAU HAPUS PERMANEN (CLEAN DATA) */}
              {confirmDeleteBudget && (
                <div className="bg-rose-50 border border-rose-200 rounded-3xl p-4 space-y-3.5 animate-in fade-in">
                  <div className="flex items-start gap-2.5 text-rose-600">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold">Hapus Anggaran "{selectedBudget.name}"</h4>
                      <p className="text-xs text-rose-700 leading-relaxed">
                        Pilih cara penghapusan anggaran di bawah ini:
                      </p>
                    </div>
                  </div>

                  {/* Pilihan Mode Hapus */}
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleteBudgetMode('refund')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        deleteBudgetMode === 'refund'
                          ? 'bg-white border-[#1D63DC] ring-2 ring-[#1D63DC]/20'
                          : 'bg-white/60 border-rose-200/80 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#0F172A]">1. Balikkan Sisa Saldo ke Kantung</span>
                        <span className="text-[11px] font-extrabold text-[#00C49A]">
                          +Rp {formatIDR(selectedBudget.remaining)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Sisa anggaran akan dikembalikan ke kantung dompet yang dipilih.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteBudgetMode('clean')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        deleteBudgetMode === 'clean'
                          ? 'bg-white border-rose-600 ring-2 ring-rose-500/20'
                          : 'bg-white/60 border-rose-200/80 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-rose-600">2. Hapus Data Permanen (Clean Data)</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full">
                          Bersih Total
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Hapus anggaran beserta seluruh riwayat cashflow tanpa mengembalikan saldo ke kantung.
                      </p>
                    </button>
                  </div>

                  {deleteBudgetMode === 'refund' && (Number(selectedBudget.remaining) || 0) > 0 && (
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Pilih Kantung Penerima Saldo:</label>
                      <select
                        value={refundWalletId}
                        onChange={e => setRefundWalletId(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#1D63DC]"
                      >
                        {wallets.map(w => (
                          <option key={w.id} value={w.id}>{w.name} (Saldo: Rp {formatIDR(w.balance)})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteBudget(false)}
                      className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleDeleteBudget(selectedBudget.id, deleteBudgetMode, refundWalletId);
                        setConfirmDeleteBudget(false);
                      }}
                      className={`flex-1 py-2.5 text-white rounded-xl text-xs font-extrabold shadow-sm ${
                        deleteBudgetMode === 'refund' ? 'bg-[#1D63DC] hover:bg-blue-700' : 'bg-rose-600 hover:bg-rose-700'
                      }`}
                    >
                      {deleteBudgetMode === 'refund' ? 'Balikkan Saldo & Hapus' : 'Hapus Permanen (Clean)'}
                    </button>
                  </div>
                </div>
              )}

              {/* FORM EDIT ANGGARAN */}
              {isEditingBudget && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateBudget(selectedBudget.id, editBudgetForm);
                    setIsEditingBudget(false);
                  }}
                  className="bg-blue-50/60 border border-blue-200 rounded-3xl p-4 space-y-3 animate-in fade-in"
                >
                  <h4 className="text-xs font-extrabold text-[#1D63DC]">Edit Informasi Anggaran</h4>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Nama Anggaran / Grup</label>
                    <input
                      type="text"
                      required
                      value={editBudgetForm.name}
                      onChange={e => setEditBudgetForm({ ...editBudgetForm, name: e.target.value })}
                      className="w-full mt-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#1D63DC]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600">Kategori</label>
                      <select
                        value={editBudgetForm.categoryName}
                        onChange={e => setEditBudgetForm({ ...editBudgetForm, categoryName: e.target.value })}
                        className="w-full mt-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                      >
                        {categories.filter(c => c.type === 'expense').map(c => (
                          <option key={c.id || c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600">Label Penyimpanan</label>
                      <input
                        type="text"
                        value={editBudgetForm.storageForm}
                        onChange={e => setEditBudgetForm({ ...editBudgetForm, storageForm: e.target.value })}
                        className="w-full mt-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                        placeholder="Multi-Dompet / BCA / Cash"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingBudget(false)}
                      className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-[#1D63DC] text-white rounded-xl text-xs font-extrabold"
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              )}

              {/* Kartu Ringkasan Saldo Budget */}
              <div className="bg-white rounded-[26px] p-5 shadow-[0_6px_25px_rgba(0,0,0,0.04)] border border-slate-100 space-y-4">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sisa Saldo Alokasi</span>
                    <h3 className="text-3xl font-extrabold text-[#0F172A] mt-0.5">
                      Rp {formatIDR(selectedBudget.remaining)}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-400 block">Total Terpakai</span>
                    <span className="text-base font-extrabold text-rose-600">Rp {formatIDR(selectedBudget.spent)}</span>
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
                          style={{ width: `${alloc > 0 ? pct : 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Total Dana Masuk/Terpakai: Rp {formatIDR(alloc)}</span>
                        {alloc > 0 && <span className="text-[#00C49A]">Terpakai: {pct}%</span>}
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
                        sourceMode: 'wallet',
                        note: '',
                        date: todayStr
                      });
                      setIsBudgetActionModalOpen(true);
                    }}
                    className="py-3 px-4 bg-[#00C49A] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
                  >
                    <ArrowDownCircle size={16} />
                    <span>Alokasi Dana</span>
                  </button>

                  <button
                    onClick={() => {
                      const hasRemaining = (Number(selectedBudget.remaining) || 0) > 0;
                      setBudgetActionType('expense');
                      setBudgetActionForm({
                        amount: '',
                        walletId: wallets[0]?.id || '',
                        sourceMode: hasRemaining ? 'budget_balance' : 'direct_wallet',
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

              {/* Card Breakdown Multiple Dompet di Satu Card Anggaran */}
              {(() => {
                const walletSummary = {};
                selectedBudgetLogs.forEach(log => {
                  const wName = log.walletName || selectedBudget.storageForm || 'Saldo Anggaran';
                  if (!walletSummary[wName]) walletSummary[wName] = { allocated: 0, directExpense: 0 };
                  if (log.type === 'allocate') walletSummary[wName].allocated += Number(log.amount) || 0;
                  if (log.type === 'expense') walletSummary[wName].directExpense += Number(log.amount) || 0;
                });
                const entries = Object.entries(walletSummary);

                return (
                  <div className="bg-[#EFF6FF]/70 rounded-[22px] p-4 border border-blue-100 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet size={16} className="text-[#1D63DC]" />
                        <span className="text-xs font-extrabold text-[#0F172A]">
                          Tracking Kantong Dompet di Grup Ini
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#1D63DC] text-white text-[10px] font-extrabold">
                        {entries.length || 1} Kantong
                      </span>
                    </div>

                    {entries.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        Anda bisa mencatat pengeluaran dari berbagai kantong dompet berbeda (misal BCA, Cash, Gaji Magang) di dalam grup ini.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 gap-1.5">
                        {entries.map(([wName, info]) => (
                          <div key={wName} className="bg-white/90 px-3 py-2 rounded-xl flex items-center justify-between text-xs border border-blue-100/60">
                            <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#1D63DC]"></span>
                              {wName}
                            </span>
                            <div className="flex items-center gap-3 text-[11px] font-bold">
                              {info.allocated > 0 && <span className="text-[#1D63DC]">Alokasi: Rp{formatIDR(info.allocated)}</span>}
                              {info.directExpense > 0 && <span className="text-rose-600">Keluar: Rp{formatIDR(info.directExpense)}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Daftar Rincian Penggunaan (Cashflow Bisa Diedit & Dihapus) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="font-extrabold text-[#0F172A] text-sm">
                    Rincian Cashflow Anggaran ({selectedBudgetLogs.length})
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-400">Ketuk pensil untuk edit</span>
                </div>

                {selectedBudgetLogs.length === 0 ? (
                  <div className="bg-slate-50/70 rounded-3xl p-8 text-center text-slate-400 text-xs border border-slate-100">
                    Belum ada rincian di <strong>{selectedBudget.name}</strong>. Klik <strong>"Catat Keluar"</strong> untuk mencatat pengeluaran (bisa pilih potong dari kantong mana saja).
                  </div>
                ) : (
                  <div className="bg-white rounded-[26px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                    {selectedBudgetLogs.map((log) => {
                      const d = new Date(log.date);
                      const isExpense = log.type === 'expense';
                      const isEditingThisLog = editingLogId === log.id;

                      return (
                        <div key={log.id} className="p-4 space-y-3">
                          <div className="flex items-center justify-between gap-3">
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
                                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 font-medium mt-0.5">
                                  <span>{formatShortDate(d)}</span>
                                  <span>•</span>
                                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                                    {log.walletName ? `Kantung: ${log.walletName}` : 'Potong Saldo Budget'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`font-extrabold text-sm mr-1 ${isExpense ? 'text-rose-600' : 'text-[#00C49A]'}`}>
                                {isExpense ? '-' : '+'}{formatIDR(log.amount)}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (isEditingThisLog) {
                                    setEditingLogId(null);
                                  } else {
                                    const matchedW = wallets.find(w => w.id === log.walletId || w.name === log.walletName);
                                    setEditingLogId(log.id);
                                    setEditLogForm({
                                      amount: formatInputThousand(log.amount),
                                      note: log.note || '',
                                      walletId: matchedW ? matchedW.id : '',
                                      date: log.date ? new Date(log.date).toISOString().substring(0, 10) : todayStr
                                    });
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-[#1D63DC] hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit cashflow ini"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBudgetLog(log)}
                                className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Hapus item rincian ini"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {/* FORM INLINE EDIT CASHFLOW RINCIAN ANGGARAN */}
                          {isEditingThisLog && (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdateBudgetLog(log, editLogForm);
                                setEditingLogId(null);
                              }}
                              className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5 animate-in fade-in"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-extrabold text-[#1D63DC]">
                                  Edit {isExpense ? 'Pengeluaran' : 'Alokasi Dana Masuk'}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500">Nominal (Rp)</label>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    required
                                    value={editLogForm.amount}
                                    onChange={e => setEditLogForm({ ...editLogForm, amount: formatInputThousand(e.target.value) })}
                                    className="w-full mt-0.5 p-2 bg-white border border-slate-200 rounded-xl text-xs font-extrabold outline-none focus:border-[#1D63DC]"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500">Tanggal</label>
                                  <input
                                    type="date"
                                    required
                                    value={editLogForm.date}
                                    onChange={e => setEditLogForm({ ...editLogForm, date: e.target.value })}
                                    className="w-full mt-0.5 p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#1D63DC]"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500">Keterangan / Catatan</label>
                                <input
                                  type="text"
                                  required
                                  value={editLogForm.note}
                                  onChange={e => setEditLogForm({ ...editLogForm, note: e.target.value })}
                                  className="w-full mt-0.5 p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#1D63DC]"
                                />
                              </div>
                              {(log.type === 'allocate' || log.isDirectWallet || log.walletName) && (
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500">Kantung Dompet</label>
                                  <select
                                    value={editLogForm.walletId}
                                    onChange={e => setEditLogForm({ ...editLogForm, walletId: e.target.value })}
                                    className="w-full mt-0.5 p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#1D63DC]"
                                  >
                                    <option value="">Tetap ({log.walletName || 'Saldo Anggaran'})</option>
                                    {wallets.map(w => (
                                      <option key={w.id} value={w.id}>{w.name} (Rp {formatIDR(w.balance)})</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                              <div className="flex gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingLogId(null)}
                                  className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                                >
                                  Batal
                                </button>
                                <button
                                  type="submit"
                                  className="flex-1 py-2 bg-[#1D63DC] text-white rounded-xl text-xs font-extrabold"
                                >
                                  Simpan Cashflow
                                </button>
                              </div>
                            </form>
                          )}
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

      {/* 5. MODAL AKSI DI DALAM BUDGET (ALOKASI UANG / CATAT KELUAR MULTI-DOMPET) */}
      {isBudgetActionModalOpen && selectedBudget && (
        <div className="absolute inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[28px] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#0F172A]">
                  {budgetActionType === 'add_money'
                    ? `Tambah Alokasi ${selectedBudget.name}`
                    : `Catat Pengeluaran ${selectedBudget.name}`}
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {budgetActionType === 'add_money'
                    ? 'Memotong saldo kantung dompet & menambah saldo grup'
                    : 'Bisa potong dari Sisa Saldo Grup atau pilih Kantung Dompet lain'}
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

              {budgetActionType === 'expense' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 block">Ambil Dana Pengeluaran Dari Mana?</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setBudgetActionForm({ ...budgetActionForm, sourceMode: 'direct_wallet', walletId: budgetActionForm.walletId || wallets[0]?.id || '' })}
                      className={`py-2 px-2 rounded-xl text-[11px] font-extrabold transition-all ${
                        budgetActionForm.sourceMode === 'direct_wallet' ? 'bg-white text-[#1D63DC] shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      Pilih Kantung Dompet
                    </button>
                    <button
                      type="button"
                      onClick={() => setBudgetActionForm({ ...budgetActionForm, sourceMode: 'budget_balance' })}
                      className={`py-2 px-2 rounded-xl text-[11px] font-extrabold transition-all ${
                        budgetActionForm.sourceMode !== 'direct_wallet' ? 'bg-white text-[#00C49A] shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      Saldo Grup (Rp{formatIDR(selectedBudget.remaining)})
                    </button>
                  </div>
                </div>
              )}

              {(budgetActionType === 'add_money' || budgetActionForm.sourceMode === 'direct_wallet') && (
                <div>
                  <label className="text-xs font-bold text-slate-500">
                    {budgetActionType === 'add_money' ? 'Pilih Kantung Sumber Alokasi' : 'Pilih Kantung Dompet yang Dipotong'}
                  </label>
                  <select
                    required
                    value={budgetActionForm.walletId}
                    onChange={e => setBudgetActionForm({ ...budgetActionForm, walletId: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
                  >
                    <option value="">Pilih Kantung Dompet...</option>
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>{w.name} (Saldo: Rp {formatIDR(w.balance)})</option>
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
                  placeholder={budgetActionType === 'expense' ? 'Cth: Bayar listrik, Kopi, Bensin' : 'Cth: Tambahan budget bulan ini'}
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
                {budgetActionType === 'add_money' ? 'Tambah ke Anggaran' : 'Simpan Pengeluaran Grup'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5B. MODAL BUAT TABUNGAN BARU */}
      {isSavingModalOpen && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-end justify-center animate-in fade-in">
          <div className="bg-white w-full rounded-t-[30px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-lg font-extrabold text-[#0F172A]">Buat Tabungan Baru</h2>
                <p className="text-xs text-slate-500">Saldo kantung sumber akan otomatis berkurang saat menabung</p>
              </div>
              <button onClick={() => setIsSavingModalOpen(false)} className="p-1.5 bg-slate-100 rounded-full text-slate-500">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSaving} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500">Tabungan Untuk Apa?</label>
                <input
                  type="text"
                  required
                  value={savingForm.name}
                  onChange={e => setSavingForm({ ...savingForm, name: e.target.value })}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-amber-500"
                  placeholder="Contoh: Dana Darurat, Beli iPhone, Liburan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500">Setoran Awal (Rp)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={savingForm.initialAmount}
                    onChange={e => setSavingForm({ ...savingForm, initialAmount: formatInputThousand(e.target.value) })}
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-extrabold outline-none focus:border-amber-500"
                    placeholder="200.000"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500">Target Tabungan (Opsional)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={savingForm.targetAmount}
                    onChange={e => setSavingForm({ ...savingForm, targetAmount: formatInputThousand(e.target.value) })}
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-extrabold outline-none focus:border-amber-500"
                    placeholder="5.000.000"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500">Ambil dari Kantung Mana? (Saldo kantung berkurang)</label>
                <select
                  required
                  value={savingForm.walletId}
                  onChange={e => setSavingForm({ ...savingForm, walletId: e.target.value })}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-amber-500"
                >
                  <option value="">Pilih Kantung Sumber...</option>
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name} (Saldo: Rp {formatIDR(w.balance)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  Di Mana Tabungan Ini Disimpan?
                </label>
                <input
                  type="text"
                  required
                  value={savingForm.storedIn}
                  onChange={e => setSavingForm({ ...savingForm, storedIn: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-amber-500 mb-2"
                  placeholder="Ketik atau pilih tempat penyimpanan (Cth: Seabank, Bibit, BCA)"
                />
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {Array.from(new Set([...storagePresets, ...wallets.map(w => w.name)])).map((place) => (
                    <button
                      key={place}
                      type="button"
                      onClick={() => setSavingForm({ ...savingForm, storedIn: place })}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all ${
                        savingForm.storedIn === place
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-amber-400'
                      }`}
                    >
                      {place}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500">Catatan (Opsional)</label>
                <input
                  type="text"
                  value={savingForm.note}
                  onChange={e => setSavingForm({ ...savingForm, note: e.target.value })}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:border-amber-500"
                  placeholder="Contoh: Sisihkan dari gaji magang Oktober"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-extrabold text-sm shadow-md shadow-amber-500/25"
              >
                Simpan & Potong Saldo Kantung
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5C. MODAL DETAIL TABUNGAN */}
      {selectedSaving && !isSavingActionModalOpen && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-end justify-center animate-in fade-in">
          <div className="bg-white w-full h-[88vh] rounded-t-[32px] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="bg-white px-6 pt-5 pb-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0">
                  <PiggyBank size={22} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-extrabold text-[#0F172A] truncate">{selectedSaving.name}</h2>
                  <p className="text-xs text-slate-400 font-medium">Disimpan di: {selectedSaving.storedIn || 'Tabungan'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    setIsEditingSaving(!isEditingSaving);
                    setConfirmDeleteSaving(false);
                    setEditSavingForm({
                      name: selectedSaving.name || '',
                      targetAmount: selectedSaving.targetAmount ? formatInputThousand(selectedSaving.targetAmount) : '',
                      storedIn: selectedSaving.storedIn || ''
                    });
                  }}
                  className="p-2 text-amber-600 bg-amber-50 rounded-full hover:bg-amber-100"
                  title="Edit Tabungan"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => {
                    setConfirmDeleteSaving(!confirmDeleteSaving);
                    setIsEditingSaving(false);
                    setSavingRefundWalletId(wallets[0]?.id || '');
                  }}
                  className="p-2 text-rose-500 bg-rose-50 rounded-full hover:bg-rose-100"
                  title="Hapus Tabungan"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => {
                    setSelectedSavingId(null);
                    setIsEditingSaving(false);
                    setConfirmDeleteSaving(false);
                  }}
                  className="p-2 text-slate-500 bg-slate-100 rounded-full hover:bg-slate-200"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white">
              {/* Konfirmasi Hapus Tabungan */}
              {confirmDeleteSaving && (
                <div className="bg-rose-50 border border-rose-200 rounded-3xl p-4 space-y-3 animate-in fade-in">
                  <div className="flex items-start gap-2.5 text-rose-600">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold">Hapus Tabungan "{selectedSaving.name}"?</h4>
                      {(Number(selectedSaving.collectedAmount) || 0) > 0 ? (
                        <p className="text-xs text-rose-700 leading-relaxed">
                          Saldo tabungan terkumpul <strong>Rp {formatIDR(selectedSaving.collectedAmount)}</strong> akan dikembalikan ke kantung dompet pilihan Anda:
                        </p>
                      ) : (
                        <p className="text-xs text-rose-700">Yakin ingin menghapus tabungan ini?</p>
                      )}
                    </div>
                  </div>
                  {(Number(selectedSaving.collectedAmount) || 0) > 0 && (
                    <select
                      value={savingRefundWalletId}
                      onChange={e => setSavingRefundWalletId(e.target.value)}
                      className="w-full p-2.5 bg-white border border-rose-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                    >
                      <option value="">Jangan kembalikan ke kantung</option>
                      {wallets.map(w => (
                        <option key={w.id} value={w.id}>{w.name} (Rp {formatIDR(w.balance)})</option>
                      ))}
                    </select>
                  )}
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setConfirmDeleteSaving(false)} className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold">
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleDeleteSaving(selectedSaving.id, savingRefundWalletId);
                        setConfirmDeleteSaving(false);
                      }}
                      className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-extrabold"
                    >
                      Ya, Hapus
                    </button>
                  </div>
                </div>
              )}

              {/* Edit Tabungan */}
              {isEditingSaving && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateSaving(selectedSaving.id, editSavingForm);
                    setIsEditingSaving(false);
                  }}
                  className="bg-amber-50/70 border border-amber-200 rounded-3xl p-4 space-y-3 animate-in fade-in"
                >
                  <h4 className="text-xs font-extrabold text-amber-700">Edit Tabungan</h4>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Tabungan Untuk Apa?</label>
                    <input
                      type="text"
                      required
                      value={editSavingForm.name}
                      onChange={e => setEditSavingForm({ ...editSavingForm, name: e.target.value })}
                      className="w-full mt-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600">Target (Rp)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={editSavingForm.targetAmount}
                        onChange={e => setEditSavingForm({ ...editSavingForm, targetAmount: formatInputThousand(e.target.value) })}
                        className="w-full mt-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600">Disimpan Di Mana?</label>
                      <input
                        type="text"
                        required
                        value={editSavingForm.storedIn}
                        onChange={e => setEditSavingForm({ ...editSavingForm, storedIn: e.target.value })}
                        className="w-full mt-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setIsEditingSaving(false)} className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold">
                      Batal
                    </button>
                    <button type="submit" className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-extrabold">
                      Simpan
                    </button>
                  </div>
                </form>
              )}

              {/* Ringkasan Saldo Tabungan */}
              <div className="bg-white rounded-[26px] p-5 shadow-[0_6px_25px_rgba(0,0,0,0.04)] border border-slate-100 space-y-4">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Saldo Terkumpul</span>
                    <h3 className="text-3xl font-extrabold text-amber-600 mt-0.5">
                      Rp {formatIDR(selectedSaving.collectedAmount)}
                    </h3>
                  </div>
                  {Number(selectedSaving.targetAmount) > 0 && (
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-400 block">Target Tabungan</span>
                      <span className="text-sm font-extrabold text-slate-700">Rp {formatIDR(selectedSaving.targetAmount)}</span>
                    </div>
                  )}
                </div>

                <div className="bg-amber-50/70 rounded-2xl p-3.5 border border-amber-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <MapPin size={18} className="text-amber-600 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Tempat Penyimpanan Tabungan</span>
                      <span className="text-xs font-extrabold text-[#0F172A]">{selectedSaving.storedIn || 'Rekening Tabungan'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => {
                      setSavingActionType('deposit');
                      setSavingActionForm({
                        amount: '',
                        walletId: wallets[0]?.id || '',
                        note: '',
                        date: todayStr
                      });
                      setIsSavingActionModalOpen(true);
                    }}
                    className="py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
                  >
                    <ArrowDownCircle size={16} />
                    <span>Tambah Tabungan</span>
                  </button>

                  <button
                    onClick={() => {
                      setSavingActionType('withdraw');
                      setSavingActionForm({
                        amount: '',
                        walletId: wallets[0]?.id || '',
                        note: '',
                        date: todayStr
                      });
                      setIsSavingActionModalOpen(true);
                    }}
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
                  >
                    <ArrowUpCircle size={16} />
                    <span>Tarik ke Kantung</span>
                  </button>
                </div>
              </div>

              {/* Riwayat Setoran Tabungan */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-[#0F172A] text-sm px-1">
                  Riwayat Setoran & Penarikan ({selectedSavingLogs.length})
                </h4>
                {selectedSavingLogs.length === 0 ? (
                  <div className="bg-slate-50/70 rounded-3xl p-8 text-center text-slate-400 text-xs border border-slate-100">
                    Belum ada riwayat setoran.
                  </div>
                ) : (
                  <div className="bg-white rounded-[26px] border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                    {selectedSavingLogs.map(log => {
                      const d = new Date(log.date);
                      const isDeposit = log.type === 'deposit';
                      return (
                        <div key={log.id} className="p-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isDeposit ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-500'
                            }`}>
                              {isDeposit ? <ArrowDownCircle size={20} /> : <ArrowUpCircle size={20} />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#0F172A] text-sm truncate">
                                {log.note || (isDeposit ? 'Setor Tabungan' : 'Tarik Tabungan')}
                              </p>
                              <p className="text-xs text-slate-400 font-medium">
                                {formatShortDate(d)} • {isDeposit ? `Dari Kantung ${log.walletName}` : `Ke Kantung ${log.walletName}`}
                              </p>
                            </div>
                          </div>
                          <span className={`font-extrabold text-sm shrink-0 ${isDeposit ? 'text-amber-600' : 'text-rose-600'}`}>
                            {isDeposit ? '+' : '-'}Rp{formatIDR(log.amount)}
                          </span>
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

      {/* 5D. MODAL AKSI TABUNGAN (SETOR DARI KANTUNG / TARIK KE KANTUNG) */}
      {isSavingActionModalOpen && selectedSaving && (
        <div className="absolute inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[28px] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#0F172A]">
                  {savingActionType === 'deposit'
                    ? `Setor ke ${selectedSaving.name}`
                    : `Tarik dari ${selectedSaving.name}`}
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {savingActionType === 'deposit'
                    ? 'Memotong saldo kantung dompet & menambah saldo tabungan'
                    : `Saldo tabungan tersedia: Rp ${formatIDR(selectedSaving.collectedAmount)}`}
                </p>
              </div>
              <button onClick={() => setIsSavingActionModalOpen(false)} className="p-1.5 bg-slate-100 rounded-full text-slate-500">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavingAction} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500">Nominal (Rp)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={savingActionForm.amount}
                  onChange={e => setSavingActionForm({ ...savingActionForm, amount: formatInputThousand(e.target.value) })}
                  className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-extrabold outline-none focus:border-amber-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500">
                  {savingActionType === 'deposit' ? 'Ambil dari Kantung Mana?' : 'Kembalikan ke Kantung Mana?'}
                </label>
                <select
                  required
                  value={savingActionForm.walletId}
                  onChange={e => setSavingActionForm({ ...savingActionForm, walletId: e.target.value })}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-amber-500"
                >
                  <option value="">Pilih Kantung Dompet...</option>
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name} (Saldo: Rp {formatIDR(w.balance)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500">Catatan</label>
                <input
                  type="text"
                  value={savingActionForm.note}
                  onChange={e => setSavingActionForm({ ...savingActionForm, note: e.target.value })}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-amber-500"
                  placeholder={savingActionType === 'deposit' ? 'Cth: Setoran bulan ini' : 'Cth: Dipakai keperluan mendadak'}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500">Tanggal</label>
                <input
                  type="date"
                  required
                  value={savingActionForm.date}
                  onChange={e => setSavingActionForm({ ...savingActionForm, date: e.target.value })}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3.5 rounded-2xl font-extrabold text-white text-sm shadow-md ${
                  savingActionType === 'deposit' ? 'bg-amber-500' : 'bg-slate-800'
                }`}
              >
                {savingActionType === 'deposit' ? 'Setor & Potong Saldo Kantung' : 'Tarik ke Kantung'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL TAMBAH / EDIT KATEGORI */}
      {isCategoryModalOpen && (
        <div className="absolute inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[28px] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-extrabold text-[#0F172A]">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h2>
              <button
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  if (setEditingCategory) setEditingCategory(null);
                }}
                className="p-1.5 bg-slate-100 rounded-full text-slate-500"
              >
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
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-[#1D63DC]"
                  placeholder="Cth: Kebutuhan Skincare · Bulanan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500">Tipe</label>
                  <select
                    value={categoryForm.type}
                    onChange={e => setCategoryForm({ ...categoryForm, type: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
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
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#1D63DC]"
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

              <div className="flex gap-2 pt-1">
                {editingCategory && handleDeleteCategory && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(editingCategory)}
                    className="p-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl font-bold transition-colors"
                    title="Hapus Kategori"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <button type="submit" className="flex-1 py-3.5 bg-[#1D63DC] text-white rounded-2xl font-extrabold text-sm shadow-md shadow-blue-500/20">
                  {editingCategory ? 'Simpan Perubahan' : 'Simpan Kategori'}
                </button>
              </div>
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
              Pilih aksi cepat untuk mengelola kantong dompet, anggaran, tabungan, atau mereset data aplikasi.
            </p>
            <div className="space-y-2.5">
              {onOpenTransfer && (
                <button
                  onClick={() => {
                    setIsAdjustModalOpen(false);
                    onOpenTransfer();
                  }}
                  className="w-full p-3.5 bg-[#EFF6FF] hover:bg-blue-100/70 rounded-2xl flex items-center justify-between text-xs font-extrabold text-[#1D63DC]"
                >
                  <span className="flex items-center gap-2">
                    <ArrowLeftRight size={15} /> Pindahkan Saldo Antar Kantong
                  </span>
                  <ChevronRight size={16} className="text-[#1D63DC]" />
                </button>
              )}
              <button
                onClick={() => {
                  setIsAdjustModalOpen(false);
                  setActiveTab('wallets');
                }}
                className="w-full p-3.5 bg-slate-50 hover:bg-blue-50/50 rounded-2xl flex items-center justify-between text-xs font-bold text-[#0F172A]"
              >
                <span>Kelola & Sesuaikan Saldo Kantong</span>
                <ChevronRight size={16} className="text-[#1D63DC]" />
              </button>
              <button
                onClick={() => {
                  setIsAdjustModalOpen(false);
                  setActiveTab('budgets');
                }}
                className="w-full p-3.5 bg-slate-50 hover:bg-blue-50/50 rounded-2xl flex items-center justify-between text-xs font-bold text-[#0F172A]"
              >
                <span>Kelola Pos Anggaran (Multi-Dompet)</span>
                <ChevronRight size={16} className="text-[#00C49A]" />
              </button>
              <button
                onClick={() => {
                  setIsAdjustModalOpen(false);
                  setActiveTab('savings');
                }}
                className="w-full p-3.5 bg-slate-50 hover:bg-amber-50/50 rounded-2xl flex items-center justify-between text-xs font-bold text-[#0F172A]"
              >
                <span>Kelola Pos Tabungan</span>
                <ChevronRight size={16} className="text-amber-600" />
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
                Seluruh dompet, anggaran, tabungan, dan riwayat transaksi yang tersimpan saat ini akan dihapus permanen agar Anda bisa mulai dari nol.
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
