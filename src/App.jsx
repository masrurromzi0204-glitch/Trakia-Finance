import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';

import { auth, db, isFirebaseConfigured } from './firebase';
import { DEFAULT_CATEGORIES } from './utils/constants';
import { formatIDR, parseRawAmount, isSameMonth, formatShortDate } from './utils/formatters';

import { TrakiaCalculatorIcon } from './components/TrakiaLogo';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Modals from './components/Modals';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import WalletsPage from './pages/WalletsPage';
import BudgetsPage from './pages/BudgetsPage';
import SavingsPage from './pages/SavingsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  // Login state — cek localStorage agar tidak perlu login ulang setiap refresh
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('trakia_logged_in') === 'true';
  });

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [toast, setToast] = useState(null);
  const [hideBalance, setHideBalance] = useState(false);

  // Data States
  const [wallets, setWallets] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgetLogs, setBudgetLogs] = useState([]);
  const [savings, setSavings] = useState([]);
  const [savingsLogs, setSavingsLogs] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);

  // Modal States
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedBudgetId, setSelectedBudgetId] = useState(null);
  const [isBudgetActionModalOpen, setIsBudgetActionModalOpen] = useState(false);
  const [budgetActionType, setBudgetActionType] = useState('expense');

  // Savings Modal States
  const [isSavingModalOpen, setIsSavingModalOpen] = useState(false);
  const [selectedSavingId, setSelectedSavingId] = useState(null);
  const [isSavingActionModalOpen, setIsSavingActionModalOpen] = useState(false);
  const [savingActionType, setSavingActionType] = useState('deposit');

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [successPopup, setSuccessPopup] = useState(null);

  // Form States
  const todayStr = new Date().toISOString().substring(0, 10);
  const [txForm, setTxForm] = useState({
    type: 'expense', amount: '', category: '', note: '', walletId: '', date: todayStr
  });
  const [walletForm, setWalletForm] = useState({ name: '', balance: '', type: 'Bank' });
  const [budgetForm, setBudgetForm] = useState({
    name: '', initialAmount: '', walletId: '', storageForm: 'Multi-Dompet', categoryName: '', note: '', date: todayStr
  });
  const [budgetActionForm, setBudgetActionForm] = useState({
    amount: '', walletId: '', sourceMode: 'direct_wallet', note: '', date: todayStr
  });
  const [savingForm, setSavingForm] = useState({
    name: '', initialAmount: '', targetAmount: '', walletId: '', storedIn: 'Seabank', note: '', date: todayStr
  });
  const [savingActionForm, setSavingActionForm] = useState({
    amount: '', walletId: '', note: '', date: todayStr
  });
  const [categoryForm, setCategoryForm] = useState({ name: '', type: 'expense', icon: 'Tag', color: 'indigo' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const triggerSuccessPopup = (payload) => {
    setSuccessPopup(payload);
    setTimeout(() => setSuccessPopup((prev) => (prev === payload ? null : prev)), 2800);
  };

  // 1. Auth & LocalStorage Initialization
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      console.log("📦 Firebase belum aktif, menggunakan LocalStorage.");
      setUser({ uid: 'local-user', isLocal: true });
      try {
        const savedWallets = localStorage.getItem('trakia_wallets');
        const savedBudgets = localStorage.getItem('trakia_budgets');
        const savedTxs = localStorage.getItem('trakia_transactions');
        const savedLogs = localStorage.getItem('trakia_budget_logs');
        const savedSavings = localStorage.getItem('trakia_savings');
        const savedSavingsLogs = localStorage.getItem('trakia_savings_logs');
        const savedCats = localStorage.getItem('trakia_categories');

        if (savedWallets) setWallets(JSON.parse(savedWallets));
        if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
        if (savedTxs) setTransactions(JSON.parse(savedTxs));
        if (savedLogs) setBudgetLogs(JSON.parse(savedLogs));
        if (savedSavings) setSavings(JSON.parse(savedSavings));
        if (savedSavingsLogs) setSavingsLogs(JSON.parse(savedSavingsLogs));
        if (savedCats) setCustomCategories(JSON.parse(savedCats));
      } catch (e) {
        console.error("Local load error:", e);
      }
      setIsLoading(false);
      return;
    }

    signInAnonymously(auth)
      .then((userCred) => {
        setUser({ uid: userCred.user.uid, isLocal: false });
      })
      .catch((err) => {
        console.error("❌ Firebase Auth error, beralih ke LocalStorage:", err);
        setUser({ uid: 'local-user', isLocal: true });
        setIsLoading(false);
      });

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser({ uid: u.uid, isLocal: false });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.isLocal) {
      localStorage.setItem('trakia_wallets', JSON.stringify(wallets));
      localStorage.setItem('trakia_budgets', JSON.stringify(budgets));
      localStorage.setItem('trakia_transactions', JSON.stringify(transactions));
      localStorage.setItem('trakia_budget_logs', JSON.stringify(budgetLogs));
      localStorage.setItem('trakia_savings', JSON.stringify(savings));
      localStorage.setItem('trakia_savings_logs', JSON.stringify(savingsLogs));
      localStorage.setItem('trakia_categories', JSON.stringify(customCategories));
    }
  }, [wallets, budgets, transactions, budgetLogs, savings, savingsLogs, customCategories, user]);

  // 2. Firestore Listeners
  useEffect(() => {
    if (!user || user.isLocal || !db) return;
    setIsLoading(true);

    const wRef = collection(db, 'wallets');
    const uW = onSnapshot(wRef, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setWallets(list);
    }, (err) => {
      console.error("Wallets error:", err);
      setIsLoading(false);
    });

    const bRef = collection(db, 'budgets');
    const uB = onSnapshot(bRef, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setBudgets(list);
    }, (err) => {
      console.error("Budgets error:", err);
      setIsLoading(false);
    });

    const tRef = collection(db, 'transactions');
    const uT = onSnapshot(tRef, (snap) => {
      const txs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      txs.sort((a, b) => b.date - a.date || (b.createdAt || 0) - (a.createdAt || 0));
      setTransactions(txs);
      setIsLoading(false);
    }, (err) => {
      console.error("Transactions error:", err);
      setIsLoading(false);
    });

    const blRef = collection(db, 'budget_logs');
    const uBL = onSnapshot(blRef, (snap) => {
      const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      logs.sort((a, b) => b.date - a.date || (b.createdAt || 0) - (a.createdAt || 0));
      setBudgetLogs(logs);
    }, (err) => {
      console.error("Budget logs error:", err);
      setIsLoading(false);
    });

    const sRef = collection(db, 'savings');
    const uS = onSnapshot(sRef, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setSavings(list);
    }, (err) => {
      console.error("Savings error:", err);
    });

    const slRef = collection(db, 'savings_logs');
    const uSL = onSnapshot(slRef, (snap) => {
      const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      logs.sort((a, b) => b.date - a.date || (b.createdAt || 0) - (a.createdAt || 0));
      setSavingsLogs(logs);
    }, (err) => {
      console.error("Savings logs error:", err);
    });

    const cRef = collection(db, 'categories');
    const uC = onSnapshot(cRef, (snap) => {
      setCustomCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.error("Categories error:", err);
      setIsLoading(false);
    });

    return () => { uW(); uB(); uT(); uBL(); uS(); uSL(); uC(); };
  }, [user]);

  // Derived Calculations
  const categories = useMemo(() => {
    const deletedDefaults = new Set(
      customCategories.filter(c => c.isDeleted && c.originalName).map(c => c.originalName)
    );
    const overriddenMap = {};
    customCategories.forEach(c => {
      if (c.originalName && !c.isDeleted) {
        overriddenMap[c.originalName] = c;
      }
    });

    const mergedDefaults = DEFAULT_CATEGORIES
      .filter(d => !deletedDefaults.has(d.name))
      .map(d => overriddenMap[d.name] ? { ...d, ...overriddenMap[d.name] } : d);

    const pureCustoms = customCategories.filter(c => !c.originalName && !c.isDeleted);
    return [...mergedDefaults, ...pureCustoms];
  }, [customCategories]);
  const selectedBudget = useMemo(() => budgets.find(b => b.id === selectedBudgetId) || null, [budgets, selectedBudgetId]);
  const selectedBudgetLogs = useMemo(() => selectedBudgetId ? budgetLogs.filter(l => l.budgetId === selectedBudgetId) : [], [budgetLogs, selectedBudgetId]);

  const selectedSaving = useMemo(() => savings.find(s => s.id === selectedSavingId) || null, [savings, selectedSavingId]);
  const selectedSavingLogs = useMemo(() => selectedSavingId ? savingsLogs.filter(l => l.savingId === selectedSavingId) : [], [savingsLogs, selectedSavingId]);

  const totalWalletBalance = useMemo(() => wallets.reduce((s, w) => s + (Number(w.balance) || 0), 0), [wallets]);
  const totalRemainingBudget = useMemo(() => budgets.reduce((s, b) => s + (Number(b.remaining) || 0), 0), [budgets]);
  const totalSavingsBalance = useMemo(() => savings.reduce((s, item) => s + (Number(item.collectedAmount) || 0), 0), [savings]);

  const currentMonthMainTxs = useMemo(() => {
    return transactions.filter(tx => !tx.isInternalBudgetExpense && isSameMonth(new Date(tx.date), currentDate));
  }, [transactions, currentDate]);

  const monthlyIncome = useMemo(() => currentMonthMainTxs.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0), [currentMonthMainTxs]);
  const monthlyExpense = useMemo(() => currentMonthMainTxs.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0), [currentMonthMainTxs]);
  const monthlyNetFlow = monthlyIncome - monthlyExpense;

  const daysInSelectedMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(), [currentDate]);
  const dailyAverageExpense = useMemo(() => Math.round(monthlyExpense / Math.max(1, daysInSelectedMonth)), [monthlyExpense, daysInSelectedMonth]);

  const categorySummary = useMemo(() => {
    const map = {};
    currentMonthMainTxs.forEach(tx => {
      const key = `${tx.type}_${tx.category}`;
      if (!map[key]) map[key] = { category: tx.category || 'Lainnya', type: tx.type, count: 0, total: 0 };
      map[key].count += 1;
      map[key].total += Number(tx.amount) || 0;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [currentMonthMainTxs]);

  const weeklySummary = useMemo(() => {
    const weeks = [
      { label: '3M lalu', income: 0, expense: 0 },
      { label: '2M lalu', income: 0, expense: 0 },
      { label: 'Mg lalu', income: 0, expense: 0 },
      { label: 'Mg ini', income: 0, expense: 0 },
    ];
    currentMonthMainTxs.forEach(tx => {
      const day = new Date(tx.date).getDate();
      const idx = day <= 7 ? 0 : day <= 14 ? 1 : day <= 21 ? 2 : 3;
      if (tx.type === 'income') weeks[idx].income += Number(tx.amount) || 0;
      else weeks[idx].expense += Number(tx.amount) || 0;
    });
    const maxVal = Math.max(...weeks.map(w => Math.max(w.income, w.expense)), 1);
    return { weeks, maxVal };
  }, [currentMonthMainTxs]);

  const groupedTxs = useMemo(() => {
    const groups = {};
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    currentMonthMainTxs.forEach(tx => {
      const d = new Date(tx.date);
      const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const shortDate = formatShortDate(d);
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const prefix = d.toDateString() === now.toDateString() ? 'Hari ini' : d.toDateString() === yesterday.toDateString() ? 'Kemarin' : days[d.getDay()];

      if (!groups[dayKey]) groups[dayKey] = { key: dayKey, prefix, shortDate, items: [], incomeTotal: 0, expenseTotal: 0 };
      groups[dayKey].items.push(tx);
      if (tx.type === 'income') groups[dayKey].incomeTotal += Number(tx.amount) || 0;
      else groups[dayKey].expenseTotal += Number(tx.amount) || 0;
    });
    return Object.values(groups);
  }, [currentMonthMainTxs]);

  const changeMonth = (offset) => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + offset);
    setCurrentDate(next);
  };

  // TX Detail Modal State
  const [selectedTx, setSelectedTx] = useState(null);
  const [isTxDetailOpen, setIsTxDetailOpen] = useState(false);
  const [isEditingTx, setIsEditingTx] = useState(false);
  const [editTxForm, setEditTxForm] = useState({});

  const openTxDetail = (tx) => {
    setSelectedTx(tx);
    setIsEditingTx(false);
    setEditTxForm({
      type: tx.type,
      amount: formatIDR(tx.amount),
      category: tx.category,
      note: tx.note || '',
      walletId: tx.walletId || '',
      date: tx.date ? new Date(tx.date).toISOString().substring(0, 10) : todayStr,
    });
    setIsTxDetailOpen(true);
  };

  const handleDeleteTx = async (tx) => {
    if (!tx) return;
    const wallet = wallets.find(w => w.id === tx.walletId);
    if (wallet) {
      const revertedBalance = tx.type === 'expense'
        ? wallet.balance + Number(tx.amount)
        : wallet.balance - Number(tx.amount);
      if (user.isLocal) {
        setWallets(prev => prev.map(w => w.id === wallet.id ? { ...w, balance: revertedBalance } : w));
      } else {
        await updateDoc(doc(db, 'wallets', wallet.id), { balance: revertedBalance });
      }
    }
    if (user.isLocal) {
      setTransactions(prev => prev.filter(t => t.id !== tx.id));
    } else {
      await deleteDoc(doc(db, 'transactions', tx.id));
    }
    setIsTxDetailOpen(false);
    setSelectedTx(null);
    showToast('Transaksi dihapus & saldo kantung dikembalikan.');
  };

  const handleUpdateTx = async (e) => {
    e.preventDefault();
    if (!selectedTx) return;
    const newAmount = parseRawAmount(editTxForm.amount);
    if (newAmount <= 0) return showToast('Masukkan nominal yang valid!', 'error');

    const oldWallet = wallets.find(w => w.id === selectedTx.walletId);
    const newWallet = wallets.find(w => w.id === editTxForm.walletId);
    if (!newWallet) return showToast('Pilih dompet terlebih dahulu!', 'error');

    let walletUpdates = {};

    if (oldWallet) {
      const revertOld = selectedTx.type === 'expense'
        ? oldWallet.balance + Number(selectedTx.amount)
        : oldWallet.balance - Number(selectedTx.amount);
      walletUpdates[oldWallet.id] = revertOld;
    }

    const baseBalance = walletUpdates[newWallet.id] !== undefined
      ? walletUpdates[newWallet.id]
      : newWallet.balance;
    if (editTxForm.type === 'expense' && baseBalance < newAmount)
      return showToast(`Saldo ${newWallet.name} tidak mencukupi!`, 'error');
    walletUpdates[newWallet.id] = editTxForm.type === 'expense'
      ? baseBalance - newAmount
      : baseBalance + newAmount;

    const newDate = new Date((editTxForm.date || todayStr) + 'T12:00:00').getTime();
    const updatedFields = {
      type: editTxForm.type,
      amount: newAmount,
      category: editTxForm.category,
      note: editTxForm.note || editTxForm.category,
      walletId: newWallet.id,
      walletName: newWallet.name,
      date: newDate,
    };

    if (user.isLocal) {
      Object.entries(walletUpdates).forEach(([wId, bal]) => {
        setWallets(prev => prev.map(w => w.id === wId ? { ...w, balance: bal } : w));
      });
      setTransactions(prev => prev.map(t => t.id === selectedTx.id ? { ...t, ...updatedFields } : t));
    } else {
      for (const [wId, bal] of Object.entries(walletUpdates)) {
        await updateDoc(doc(db, 'wallets', wId), { balance: bal });
      }
      await updateDoc(doc(db, 'transactions', selectedTx.id), updatedFields);
    }

    setIsTxDetailOpen(false);
    setSelectedTx(null);
    setIsEditingTx(false);
    showToast('Transaksi berhasil diperbarui!');
  };

  // CRUD Handlers
  const handleAddTx = async (e) => {
    e.preventDefault();
    const amount = parseRawAmount(txForm.amount);
    if (amount <= 0) return showToast("Masukkan nominal yang valid!", "error");
    const wallet = wallets.find(w => w.id === txForm.walletId);
    if (!wallet) return showToast("Pilih dompet terlebih dahulu!", "error");
    if (txForm.type === 'expense' && wallet.balance < amount) return showToast(`Saldo ${wallet.name} tidak mencukupi!`, "error");

    const newBalance = txForm.type === 'expense' ? wallet.balance - amount : wallet.balance + amount;
    const selectedDateObj = new Date(txForm.date + 'T12:00:00');
    const newTxData = {
      type: txForm.type, amount, category: txForm.category, note: txForm.note || txForm.category,
      walletId: wallet.id, walletName: wallet.name, date: selectedDateObj.getTime(), createdAt: Date.now()
    };

    if (user.isLocal) {
      setWallets(prev => prev.map(w => w.id === wallet.id ? { ...w, balance: newBalance } : w));
      setTransactions(prev => [{ id: 'tx-' + Date.now(), ...newTxData }, ...prev]);
    } else {
      await updateDoc(doc(db, 'wallets', wallet.id), { balance: newBalance });
      await addDoc(collection(db, 'transactions'), newTxData);
    }

    setCurrentDate(selectedDateObj);
    setIsTxModalOpen(false);
    setTxForm({ ...txForm, amount: '', note: '' });
    triggerSuccessPopup({
      title: txForm.type === 'expense' ? 'Pengeluaran Tercatat!' : 'Pemasukan Tercatat!',
      subtitle: txForm.note || txForm.category, amount, amountType: txForm.type,
      details: [
        { label: 'Kategori', value: txForm.category },
        { label: 'Kantung Dompet', value: wallet.name },
        { label: 'Sisa Saldo Kantung', value: `Rp ${formatIDR(newBalance)}` }
      ]
    });
  };

  const handleSaveWallet = async (e) => {
    e.preventDefault();
    if (!walletForm.name.trim()) return showToast("Nama dompet wajib diisi!", "error");
    const balanceVal = parseRawAmount(walletForm.balance);
    const savedName = walletForm.name.trim();
    const isEdit = Boolean(editingWallet);

    if (user.isLocal) {
      if (editingWallet) {
        setWallets(prev => prev.map(w => w.id === editingWallet.id ? { ...w, name: savedName, balance: balanceVal, type: walletForm.type || 'Bank' } : w));
      } else {
        setWallets(prev => [...prev, { id: 'w-' + Date.now(), name: savedName, balance: balanceVal, type: walletForm.type || 'Bank', createdAt: Date.now() }]);
      }
    } else {
      if (editingWallet) {
        await updateDoc(doc(db, 'wallets', editingWallet.id), { name: savedName, balance: balanceVal, type: walletForm.type || 'Bank' });
      } else {
        await addDoc(collection(db, 'wallets'), { name: savedName, balance: balanceVal, type: walletForm.type || 'Bank', createdAt: Date.now() });
      }
    }

    setIsWalletModalOpen(false);
    setEditingWallet(null);
    setWalletForm({ name: '', balance: '', type: 'Bank' });
    triggerSuccessPopup({
      title: isEdit ? 'Kantong Diperbarui!' : 'Kantong Ditambahkan!',
      subtitle: `Kantong ${savedName} siap digunakan`, amount: balanceVal, amountType: 'neutral',
      details: [{ label: 'Nama Kantong', value: savedName }, { label: 'Tipe', value: walletForm.type || 'Bank' }]
    });
  };

  const handleDeleteWallet = async (walletId) => {
    if (user.isLocal) setWallets(prev => prev.filter(w => w.id !== walletId));
    else await deleteDoc(doc(db, 'wallets', walletId));
    setIsWalletModalOpen(false);
    setEditingWallet(null);
    showToast("Kantong dompet dihapus.");
  };

  // BUDGET HANDLERS (TERMASUK EDIT, MULTI-WALLET, & HAPUS DENGAN PENGEMBALIAN SALDO)
  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!budgetForm.name.trim()) return showToast("Nama anggaran wajib diisi!", "error");
    const initialAmount = parseRawAmount(budgetForm.initialAmount);
    let sourceWallet = null;

    if (initialAmount > 0) {
      sourceWallet = wallets.find(w => w.id === budgetForm.walletId);
      if (!sourceWallet) return showToast("Pilih kantung sumber untuk alokasi saldo awal!", "error");
      if (sourceWallet.balance < initialAmount) return showToast(`Saldo di ${sourceWallet.name} tidak cukup!`, "error");
    }

    const chosenStorage = budgetForm.storageForm || (sourceWallet ? sourceWallet.name : 'Multi-Dompet');
    const newBudgetData = {
      name: budgetForm.name.trim(), categoryName: budgetForm.categoryName || budgetForm.name.trim(),
      storageForm: chosenStorage, allocated: initialAmount, spent: 0, remaining: initialAmount, createdAt: Date.now()
    };

    if (user.isLocal) {
      const localBudgetId = 'b-' + Date.now();
      setBudgets(prev => [{ id: localBudgetId, ...newBudgetData }, ...prev]);
      if (initialAmount > 0 && sourceWallet) {
        const txDate = new Date((budgetForm.date || todayStr) + 'T12:00:00').getTime();
        setWallets(prev => prev.map(w => w.id === sourceWallet.id ? { ...w, balance: w.balance - initialAmount } : w));
        setTransactions(prev => [{
          id: 'tx-' + Date.now(), type: 'expense', amount: initialAmount, category: budgetForm.categoryName || budgetForm.name.trim(),
          note: budgetForm.note.trim() || `Alokasi ${budgetForm.name.trim()} (${sourceWallet.name})`, walletId: sourceWallet.id, walletName: sourceWallet.name,
          budgetId: localBudgetId, isBudgetAllocation: true, date: txDate, createdAt: Date.now()
        }, ...prev]);
        setBudgetLogs(prev => [{
          id: 'bl-' + Date.now(), budgetId: localBudgetId, budgetName: budgetForm.name.trim(), type: 'allocate',
          amount: initialAmount, note: budgetForm.note.trim() || `Alokasi awal dari ${sourceWallet.name}`, walletId: sourceWallet.id, walletName: sourceWallet.name, date: txDate, createdAt: Date.now()
        }, ...prev]);
      }
    } else {
      const budgetDocRef = await addDoc(collection(db, 'budgets'), newBudgetData);
      if (initialAmount > 0 && sourceWallet) {
        const txDate = new Date((budgetForm.date || todayStr) + 'T12:00:00').getTime();
        await updateDoc(doc(db, 'wallets', sourceWallet.id), { balance: sourceWallet.balance - initialAmount });
        await addDoc(collection(db, 'transactions'), {
          type: 'expense', amount: initialAmount, category: budgetForm.categoryName || budgetForm.name.trim(),
          note: budgetForm.note.trim() || `Alokasi ${budgetForm.name.trim()} (${sourceWallet.name})`, walletId: sourceWallet.id, walletName: sourceWallet.name,
          budgetId: budgetDocRef.id, isBudgetAllocation: true, date: txDate, createdAt: Date.now()
        });
        await addDoc(collection(db, 'budget_logs'), {
          budgetId: budgetDocRef.id, budgetName: budgetForm.name.trim(), type: 'allocate',
          amount: initialAmount, note: budgetForm.note.trim() || `Alokasi awal dari ${sourceWallet.name}`, walletId: sourceWallet.id, walletName: sourceWallet.name, date: txDate, createdAt: Date.now()
        });
      }
    }

    setIsBudgetModalOpen(false);
    setBudgetForm({ name: '', initialAmount: '', walletId: '', storageForm: 'Multi-Dompet', categoryName: '', note: '', date: todayStr });
    triggerSuccessPopup({
      title: 'Grup Anggaran Dibuat!', subtitle: newBudgetData.name, amount: initialAmount, amountType: 'neutral',
      details: [
        { label: 'Nama Grup', value: newBudgetData.name },
        { label: 'Mode Kantung', value: chosenStorage },
        { label: 'Kategori', value: newBudgetData.categoryName }
      ]
    });
  };

  const handleUpdateBudget = async (budgetId, updatedFields) => {
    if (!updatedFields.name?.trim()) return showToast("Nama anggaran tidak boleh kosong!", "error");
    const cleanData = {
      name: updatedFields.name.trim(),
      categoryName: updatedFields.categoryName || updatedFields.name.trim(),
      storageForm: updatedFields.storageForm || 'Multi-Dompet'
    };
    if (user.isLocal) {
      setBudgets(prev => prev.map(b => b.id === budgetId ? { ...b, ...cleanData } : b));
    } else {
      await updateDoc(doc(db, 'budgets', budgetId), cleanData);
    }
    showToast("Informasi anggaran berhasil diperbarui!");
  };

  const handleBudgetAction = async (e) => {
    e.preventDefault();
    if (!selectedBudget) return;
    const amount = parseRawAmount(budgetActionForm.amount);
    if (amount <= 0) return showToast("Masukkan nominal yang valid!", "error");
    const actionDate = new Date((budgetActionForm.date || todayStr) + 'T12:00:00').getTime();

    if (budgetActionType === 'add_money') {
      const wallet = wallets.find(w => w.id === budgetActionForm.walletId);
      if (!wallet) return showToast("Pilih kantung sumber dana!", "error");
      if (wallet.balance < amount) return showToast(`Saldo ${wallet.name} tidak mencukupi!`, "error");

      const newRemaining = (Number(selectedBudget.remaining) || 0) + amount;
      const newAllocated = (Number(selectedBudget.allocated) || 0) + amount;

      if (user.isLocal) {
        setWallets(prev => prev.map(w => w.id === wallet.id ? { ...w, balance: w.balance - amount } : w));
        setBudgets(prev => prev.map(b => b.id === selectedBudget.id ? { ...b, allocated: newAllocated, remaining: newRemaining } : b));
        setTransactions(prev => [{
          id: 'tx-' + Date.now(), type: 'expense', amount, category: selectedBudget.categoryName || selectedBudget.name,
          note: budgetActionForm.note.trim() || `Top-up ${selectedBudget.name}`, walletId: wallet.id, walletName: wallet.name,
          budgetId: selectedBudget.id, isBudgetAllocation: true, date: actionDate, createdAt: Date.now()
        }, ...prev]);
        setBudgetLogs(prev => [{
          id: 'bl-' + Date.now(), budgetId: selectedBudget.id, budgetName: selectedBudget.name, type: 'allocate',
          amount, note: budgetActionForm.note.trim() || `Tambah dana dari ${wallet.name}`, walletId: wallet.id, walletName: wallet.name, date: actionDate, createdAt: Date.now()
        }, ...prev]);
      } else {
        await updateDoc(doc(db, 'wallets', wallet.id), { balance: wallet.balance - amount });
        await updateDoc(doc(db, 'budgets', selectedBudget.id), { allocated: newAllocated, remaining: newRemaining });
        await addDoc(collection(db, 'transactions'), {
          type: 'expense', amount, category: selectedBudget.categoryName || selectedBudget.name,
          note: budgetActionForm.note.trim() || `Top-up ${selectedBudget.name}`, walletId: wallet.id, walletName: wallet.name,
          budgetId: selectedBudget.id, isBudgetAllocation: true, date: actionDate, createdAt: Date.now()
        });
        await addDoc(collection(db, 'budget_logs'), {
          budgetId: selectedBudget.id, budgetName: selectedBudget.name, type: 'allocate',
          amount, note: budgetActionForm.note.trim() || `Tambah dana dari ${wallet.name}`, walletId: wallet.id, walletName: wallet.name, date: actionDate, createdAt: Date.now()
        });
      }

      triggerSuccessPopup({
        title: 'Dana Anggaran Ditambahkan!', subtitle: budgetActionForm.note.trim() || `Top-up ${selectedBudget.name}`, amount, amountType: 'income',
        details: [
          { label: 'Anggaran', value: selectedBudget.name },
          { label: 'Dari Kantung', value: wallet.name },
          { label: 'Sisa Anggaran Baru', value: `Rp ${formatIDR(newRemaining)}` }
        ]
      });
    } else {
      // Pengeluaran di dalam grup anggaran:
      // Mode 1: 'direct_wallet' -> potong langsung dari kantung dompet yang dipilih (mendukung multiple dompet di 1 card!)
      // Mode 2: 'budget_balance' -> potong dari sisa saldo alokasi anggaran
      if (!budgetActionForm.note.trim()) return showToast("Isi rincian penggunaan dana!", "error");

      if (budgetActionForm.sourceMode === 'direct_wallet') {
        const wallet = wallets.find(w => w.id === budgetActionForm.walletId);
        if (!wallet) return showToast("Pilih kantung dompet yang akan dipotong!", "error");
        if (wallet.balance < amount) return showToast(`Saldo kantung ${wallet.name} tidak mencukupi!`, "error");

        const newSpent = (Number(selectedBudget.spent) || 0) + amount;
        const newAllocated = (Number(selectedBudget.allocated) || 0) + amount;
        const newWalletBalance = wallet.balance - amount;

        if (user.isLocal) {
          setWallets(prev => prev.map(w => w.id === wallet.id ? { ...w, balance: newWalletBalance } : w));
          setBudgets(prev => prev.map(b => b.id === selectedBudget.id ? { ...b, allocated: newAllocated, spent: newSpent } : b));
          setTransactions(prev => [{
            id: 'tx-' + Date.now(), type: 'expense', amount, category: selectedBudget.categoryName || selectedBudget.name,
            note: `${selectedBudget.name}: ${budgetActionForm.note.trim()}`, walletId: wallet.id, walletName: wallet.name,
            budgetId: selectedBudget.id, isBudgetAllocation: true, date: actionDate, createdAt: Date.now()
          }, ...prev]);
          setBudgetLogs(prev => [{
            id: 'bl-' + Date.now(), budgetId: selectedBudget.id, budgetName: selectedBudget.name, type: 'expense',
            amount, note: budgetActionForm.note.trim(), walletId: wallet.id, walletName: wallet.name, isDirectWallet: true, date: actionDate, createdAt: Date.now()
          }, ...prev]);
        } else {
          await updateDoc(doc(db, 'wallets', wallet.id), { balance: newWalletBalance });
          await updateDoc(doc(db, 'budgets', selectedBudget.id), { allocated: newAllocated, spent: newSpent });
          await addDoc(collection(db, 'transactions'), {
            type: 'expense', amount, category: selectedBudget.categoryName || selectedBudget.name,
            note: `${selectedBudget.name}: ${budgetActionForm.note.trim()}`, walletId: wallet.id, walletName: wallet.name,
            budgetId: selectedBudget.id, isBudgetAllocation: true, date: actionDate, createdAt: Date.now()
          });
          await addDoc(collection(db, 'budget_logs'), {
            budgetId: selectedBudget.id, budgetName: selectedBudget.name, type: 'expense',
            amount, note: budgetActionForm.note.trim(), walletId: wallet.id, walletName: wallet.name, isDirectWallet: true, date: actionDate, createdAt: Date.now()
          });
        }

        triggerSuccessPopup({
          title: 'Pengeluaran Grup Tercatat!', subtitle: budgetActionForm.note.trim(), amount, amountType: 'expense',
          details: [
            { label: 'Grup Anggaran', value: selectedBudget.name },
            { label: 'Dipotong dari Kantung', value: wallet.name },
            { label: `Sisa Saldo ${wallet.name}`, value: `Rp ${formatIDR(newWalletBalance)}` }
          ]
        });
      } else {
        if ((Number(selectedBudget.remaining) || 0) < amount) return showToast("Sisa saldo anggaran tidak mencukupi! Pilih opsi 'Pilih Kantung Dompet' untuk memotong kantung lain.", "error");

        const newRemaining = (Number(selectedBudget.remaining) || 0) - amount;
        const newSpent = (Number(selectedBudget.spent) || 0) + amount;

        if (user.isLocal) {
          setBudgets(prev => prev.map(b => b.id === selectedBudget.id ? { ...b, spent: newSpent, remaining: newRemaining } : b));
          setBudgetLogs(prev => [{
            id: 'bl-' + Date.now(), budgetId: selectedBudget.id, budgetName: selectedBudget.name, type: 'expense',
            amount, note: budgetActionForm.note.trim(), walletName: selectedBudget.storageForm || 'Saldo Anggaran', date: actionDate, createdAt: Date.now()
          }, ...prev]);
        } else {
          await updateDoc(doc(db, 'budgets', selectedBudget.id), { spent: newSpent, remaining: newRemaining });
          await addDoc(collection(db, 'budget_logs'), {
            budgetId: selectedBudget.id, budgetName: selectedBudget.name, type: 'expense',
            amount, note: budgetActionForm.note.trim(), walletName: selectedBudget.storageForm || 'Saldo Anggaran', date: actionDate, createdAt: Date.now()
          });
        }

        triggerSuccessPopup({
          title: 'Pengeluaran Budget Tercatat!', subtitle: budgetActionForm.note.trim(), amount, amountType: 'expense',
          details: [{ label: 'Pos Anggaran', value: selectedBudget.name }, { label: 'Sisa Saldo Budget', value: `Rp ${formatIDR(newRemaining)}` }]
        });
      }
    }

    setIsBudgetActionModalOpen(false);
    setBudgetActionForm({ amount: '', walletId: '', sourceMode: 'direct_wallet', note: '', date: todayStr });
  };

  const handleUpdateBudgetLog = async (logItem, editLogForm) => {
    if (!selectedBudget || !logItem) return;
    const newAmount = parseRawAmount(editLogForm.amount);
    if (newAmount <= 0) return showToast("Masukkan nominal yang valid!", "error");

    const oldAmount = Number(logItem.amount) || 0;
    const diff = newAmount - oldAmount;
    const newDate = editLogForm.date ? new Date(editLogForm.date + 'T12:00:00').getTime() : logItem.date;
    const chosenWallet = wallets.find(w => w.id === editLogForm.walletId) || wallets.find(w => w.name === logItem.walletName);

    let updatedAllocated = Number(selectedBudget.allocated) || 0;
    let updatedSpent = Number(selectedBudget.spent) || 0;
    let updatedRemaining = Number(selectedBudget.remaining) || 0;

    if (logItem.type === 'allocate') {
      updatedAllocated = Math.max(0, updatedAllocated + diff);
      updatedRemaining = Math.max(0, updatedRemaining + diff);
      if (chosenWallet && diff !== 0) {
        const newWBal = Math.max(0, (Number(chosenWallet.balance) || 0) - diff);
        if (user.isLocal) {
          setWallets(prev => prev.map(w => w.id === chosenWallet.id ? { ...w, balance: newWBal } : w));
        } else {
          await updateDoc(doc(db, 'wallets', chosenWallet.id), { balance: newWBal });
        }
      }
    } else {
      updatedSpent = Math.max(0, updatedSpent + diff);
      if (logItem.isDirectWallet) {
        updatedAllocated = Math.max(0, updatedAllocated + diff);
        if (chosenWallet && diff !== 0) {
          const newWBal = Math.max(0, (Number(chosenWallet.balance) || 0) - diff);
          if (user.isLocal) {
            setWallets(prev => prev.map(w => w.id === chosenWallet.id ? { ...w, balance: newWBal } : w));
          } else {
            await updateDoc(doc(db, 'wallets', chosenWallet.id), { balance: newWBal });
          }
        }
      } else {
        updatedRemaining = Math.max(0, updatedRemaining - diff);
      }
    }

    const updatedLogData = {
      amount: newAmount,
      note: editLogForm.note?.trim() || logItem.note || '',
      date: newDate,
      ...(chosenWallet ? { walletId: chosenWallet.id, walletName: chosenWallet.name } : {})
    };

    if (user.isLocal) {
      setBudgets(prev => prev.map(b => b.id === selectedBudget.id ? {
        ...b, allocated: updatedAllocated, spent: updatedSpent, remaining: updatedRemaining
      } : b));
      setBudgetLogs(prev => prev.map(l => l.id === logItem.id ? { ...l, ...updatedLogData } : l));
    } else {
      await updateDoc(doc(db, 'budgets', selectedBudget.id), {
        allocated: updatedAllocated, spent: updatedSpent, remaining: updatedRemaining
      });
      await updateDoc(doc(db, 'budget_logs', logItem.id), updatedLogData);
    }

    showToast("Rincian cashflow anggaran berhasil diperbarui!");
  };

  const handleDeleteBudgetLog = async (logItem) => {
    if (!selectedBudget) return;
    const logAmt = Number(logItem.amount) || 0;

    if (logItem.type === 'allocate') {
      const updatedAlloc = Math.max(0, (Number(selectedBudget.allocated) || 0) - logAmt);
      const updatedRem = Math.max(0, (Number(selectedBudget.remaining) || 0) - logAmt);
      const targetW = wallets.find(w => w.id === logItem.walletId) || wallets.find(w => w.name === logItem.walletName);

      if (user.isLocal) {
        if (targetW) setWallets(prev => prev.map(w => w.id === targetW.id ? { ...w, balance: (Number(w.balance) || 0) + logAmt } : w));
        setBudgets(prev => prev.map(b => b.id === selectedBudget.id ? { ...b, allocated: updatedAlloc, remaining: updatedRem } : b));
        setBudgetLogs(prev => prev.filter(l => l.id !== logItem.id));
      } else {
        if (targetW) await updateDoc(doc(db, 'wallets', targetW.id), { balance: (Number(targetW.balance) || 0) + logAmt });
        await updateDoc(doc(db, 'budgets', selectedBudget.id), { allocated: updatedAlloc, remaining: updatedRem });
        await deleteDoc(doc(db, 'budget_logs', logItem.id));
      }
      showToast("Alokasi dihapus & saldo dikembalikan ke kantung.");
      return;
    }

    const updatedSpent = Math.max(0, (Number(selectedBudget.spent) || 0) - logAmt);

    if (logItem.isDirectWallet && (logItem.walletId || logItem.walletName)) {
      const targetW = wallets.find(w => w.id === logItem.walletId) || wallets.find(w => w.name === logItem.walletName);
      const updatedAlloc = Math.max(0, (Number(selectedBudget.allocated) || 0) - logAmt);
      if (user.isLocal) {
        if (targetW) setWallets(prev => prev.map(w => w.id === targetW.id ? { ...w, balance: w.balance + logAmt } : w));
        setBudgets(prev => prev.map(b => b.id === selectedBudget.id ? { ...b, spent: updatedSpent, allocated: updatedAlloc } : b));
        setBudgetLogs(prev => prev.filter(l => l.id !== logItem.id));
      } else {
        if (targetW) await updateDoc(doc(db, 'wallets', targetW.id), { balance: targetW.balance + logAmt });
        await updateDoc(doc(db, 'budgets', selectedBudget.id), { spent: updatedSpent, allocated: updatedAlloc });
        await deleteDoc(doc(db, 'budget_logs', logItem.id));
      }
      showToast(`Rincian dihapus & Rp ${formatIDR(logAmt)} dikembalikan ke ${targetW?.name || 'kantung'}.`);
      return;
    }

    const updatedRemaining = (Number(selectedBudget.remaining) || 0) + logAmt;
    if (user.isLocal) {
      setBudgets(prev => prev.map(b => b.id === selectedBudget.id ? { ...b, spent: updatedSpent, remaining: updatedRemaining } : b));
      setBudgetLogs(prev => prev.filter(l => l.id !== logItem.id));
    } else {
      await updateDoc(doc(db, 'budgets', selectedBudget.id), { spent: updatedSpent, remaining: updatedRemaining });
      await deleteDoc(doc(db, 'budget_logs', logItem.id));
    }
    showToast("Riwayat rincian dihapus & saldo anggaran dikembalikan.");
  };

  const handleDeleteBudget = async (budgetId, deleteMode = 'refund', refundWalletId = '') => {
    const targetBudget = budgets.find(b => b.id === budgetId);
    const remainingAmt = Number(targetBudget?.remaining) || 0;
    const refundWallet = wallets.find(w => w.id === refundWalletId);
    const logsToDelete = budgetLogs.filter(l => l.budgetId === budgetId);
    const txsToDelete = transactions.filter(t => t.budgetId === budgetId);

    if (deleteMode === 'refund' && remainingAmt > 0 && refundWallet) {
      const newWalletBal = (Number(refundWallet.balance) || 0) + remainingAmt;
      if (user.isLocal) {
        setWallets(prev => prev.map(w => w.id === refundWallet.id ? { ...w, balance: newWalletBal } : w));
        setTransactions(prev => [{
          id: 'tx-' + Date.now(), type: 'income', amount: remainingAmt,
          category: 'Pengembalian Sisa Anggaran', note: `Kembali sisa anggaran ${targetBudget.name}`,
          walletId: refundWallet.id, walletName: refundWallet.name, date: Date.now(), createdAt: Date.now()
        }, ...prev]);
      } else {
        await updateDoc(doc(db, 'wallets', refundWallet.id), { balance: newWalletBal });
        await addDoc(collection(db, 'transactions'), {
          type: 'income', amount: remainingAmt,
          category: 'Pengembalian Sisa Anggaran', note: `Kembali sisa anggaran ${targetBudget.name}`,
          walletId: refundWallet.id, walletName: refundWallet.name, date: Date.now(), createdAt: Date.now()
        });
      }
    }

    if (user.isLocal) {
      setBudgets(prev => prev.filter(b => b.id !== budgetId));
      setBudgetLogs(prev => prev.filter(l => l.budgetId !== budgetId));
      if (deleteMode === 'clean') {
        setTransactions(prev => prev.filter(t => t.budgetId !== budgetId));
      }
    } else {
      await deleteDoc(doc(db, 'budgets', budgetId));
      await Promise.all(logsToDelete.map(l => deleteDoc(doc(db, 'budget_logs', l.id))));
      if (deleteMode === 'clean') {
        await Promise.all(txsToDelete.map(t => deleteDoc(doc(db, 'transactions', t.id))));
      }
    }

    setSelectedBudgetId(null);
    if (deleteMode === 'refund' && remainingAmt > 0 && refundWallet) {
      triggerSuccessPopup({
        title: 'Anggaran Dihapus & Saldo Kembali!',
        subtitle: `Sisa anggaran ${targetBudget.name} telah dikembalikan`,
        amount: remainingAmt,
        amountType: 'income',
        details: [
          { label: 'Dikembalikan Ke Kantung', value: refundWallet.name },
          { label: 'Saldo Kantung Sekarang', value: `Rp ${formatIDR((Number(refundWallet.balance) || 0) + remainingAmt)}` }
        ]
      });
    } else {
      triggerSuccessPopup({
        title: 'Anggaran Dihapus Permanen!',
        subtitle: `Seluruh data anggaran "${targetBudget?.name || ''}" telah dibersihkan`,
        amount: null,
        details: [
          { label: 'Mode Hapus', value: 'Hapus Permanen (Clean Data)' },
          { label: 'Riwayat Dibersihkan', value: `${logsToDelete.length} item rincian` }
        ]
      });
    }
  };

  // SAVINGS (TABUNGAN) HANDLERS
  const handleAddSaving = async (e) => {
    e.preventDefault();
    if (!savingForm.name.trim()) return showToast("Isi tujuan tabungan terlebih dahulu!", "error");
    const initialAmount = parseRawAmount(savingForm.initialAmount);
    const targetAmount = parseRawAmount(savingForm.targetAmount);
    if (initialAmount <= 0) return showToast("Masukkan nominal setoran awal tabungan!", "error");

    const sourceWallet = wallets.find(w => w.id === savingForm.walletId);
    if (!sourceWallet) return showToast("Pilih kantung sumber dana tabungan!", "error");
    if (sourceWallet.balance < initialAmount) return showToast(`Saldo di kantung ${sourceWallet.name} tidak mencukupi!`, "error");

    const storedInPlace = savingForm.storedIn.trim() || 'Rekening Tabungan';
    const txDate = new Date((savingForm.date || todayStr) + 'T12:00:00').getTime();
    const newWalletBal = sourceWallet.balance - initialAmount;

    const newSavingData = {
      name: savingForm.name.trim(),
      targetAmount: targetAmount || 0,
      collectedAmount: initialAmount,
      storedIn: storedInPlace,
      createdAt: Date.now()
    };

    if (user.isLocal) {
      const localSavingId = 's-' + Date.now();
      setWallets(prev => prev.map(w => w.id === sourceWallet.id ? { ...w, balance: newWalletBal } : w));
      setSavings(prev => [{ id: localSavingId, ...newSavingData }, ...prev]);
      setTransactions(prev => [{
        id: 'tx-' + Date.now(), type: 'expense', amount: initialAmount,
        category: `Tabungan · ${savingForm.name.trim()}`,
        note: savingForm.note.trim() || `Setor tabungan ${savingForm.name.trim()} (Disimpan di ${storedInPlace})`,
        walletId: sourceWallet.id, walletName: sourceWallet.name,
        savingId: localSavingId, isSavingAllocation: true, date: txDate, createdAt: Date.now()
      }, ...prev]);
      setSavingsLogs(prev => [{
        id: 'sl-' + Date.now(), savingId: localSavingId, savingName: savingForm.name.trim(),
        type: 'deposit', amount: initialAmount, walletId: sourceWallet.id, walletName: sourceWallet.name,
        storedIn: storedInPlace, note: savingForm.note.trim() || `Setoran awal dari ${sourceWallet.name}`,
        date: txDate, createdAt: Date.now()
      }, ...prev]);
    } else {
      await updateDoc(doc(db, 'wallets', sourceWallet.id), { balance: newWalletBal });
      const savingRef = await addDoc(collection(db, 'savings'), newSavingData);
      await addDoc(collection(db, 'transactions'), {
        type: 'expense', amount: initialAmount,
        category: `Tabungan · ${savingForm.name.trim()}`,
        note: savingForm.note.trim() || `Setor tabungan ${savingForm.name.trim()} (Disimpan di ${storedInPlace})`,
        walletId: sourceWallet.id, walletName: sourceWallet.name,
        savingId: savingRef.id, isSavingAllocation: true, date: txDate, createdAt: Date.now()
      });
      await addDoc(collection(db, 'savings_logs'), {
        savingId: savingRef.id, savingName: savingForm.name.trim(),
        type: 'deposit', amount: initialAmount, walletId: sourceWallet.id, walletName: sourceWallet.name,
        storedIn: storedInPlace, note: savingForm.note.trim() || `Setoran awal dari ${sourceWallet.name}`,
        date: txDate, createdAt: Date.now()
      });
    }

    setIsSavingModalOpen(false);
    setSavingForm({ name: '', initialAmount: '', targetAmount: '', walletId: '', storedIn: 'Seabank', note: '', date: todayStr });
    triggerSuccessPopup({
      title: 'Tabungan Berhasil Dibuat!',
      subtitle: `${newSavingData.name} (Disimpan di ${storedInPlace})`,
      amount: initialAmount,
      amountType: 'neutral',
      details: [
        { label: 'Tujuan Tabungan', value: newSavingData.name },
        { label: 'Dipotong dari Kantung', value: sourceWallet.name },
        { label: `Sisa Saldo ${sourceWallet.name}`, value: `Rp ${formatIDR(newWalletBal)}` },
        { label: 'Disimpan Di', value: storedInPlace }
      ]
    });
  };

  const handleUpdateSaving = async (savingId, editForm) => {
    const cleanData = {
      name: editForm.name.trim(),
      targetAmount: parseRawAmount(editForm.targetAmount) || 0,
      storedIn: editForm.storedIn.trim() || 'Tabungan'
    };
    if (user.isLocal) {
      setSavings(prev => prev.map(s => s.id === savingId ? { ...s, ...cleanData } : s));
    } else {
      await updateDoc(doc(db, 'savings', savingId), cleanData);
    }
    showToast("Data tabungan diperbarui!");
  };

  const handleSavingAction = async (e) => {
    e.preventDefault();
    if (!selectedSaving) return;
    const amount = parseRawAmount(savingActionForm.amount);
    if (amount <= 0) return showToast("Masukkan nominal yang valid!", "error");
    const wallet = wallets.find(w => w.id === savingActionForm.walletId);
    if (!wallet) return showToast("Pilih kantung dompet terlebih dahulu!", "error");
    const actionDate = new Date((savingActionForm.date || todayStr) + 'T12:00:00').getTime();

    if (savingActionType === 'deposit') {
      if (wallet.balance < amount) return showToast(`Saldo kantung ${wallet.name} tidak mencukupi!`, "error");
      const newWalletBal = wallet.balance - amount;
      const newCollected = (Number(selectedSaving.collectedAmount) || 0) + amount;

      if (user.isLocal) {
        setWallets(prev => prev.map(w => w.id === wallet.id ? { ...w, balance: newWalletBal } : w));
        setSavings(prev => prev.map(s => s.id === selectedSaving.id ? { ...s, collectedAmount: newCollected } : s));
        setTransactions(prev => [{
          id: 'tx-' + Date.now(), type: 'expense', amount,
          category: `Tabungan · ${selectedSaving.name}`,
          note: savingActionForm.note.trim() || `Tambah tabungan ${selectedSaving.name}`,
          walletId: wallet.id, walletName: wallet.name,
          savingId: selectedSaving.id, isSavingAllocation: true, date: actionDate, createdAt: Date.now()
        }, ...prev]);
        setSavingsLogs(prev => [{
          id: 'sl-' + Date.now(), savingId: selectedSaving.id, savingName: selectedSaving.name,
          type: 'deposit', amount, walletId: wallet.id, walletName: wallet.name,
          note: savingActionForm.note.trim() || `Setoran dari ${wallet.name}`, date: actionDate, createdAt: Date.now()
        }, ...prev]);
      } else {
        await updateDoc(doc(db, 'wallets', wallet.id), { balance: newWalletBal });
        await updateDoc(doc(db, 'savings', selectedSaving.id), { collectedAmount: newCollected });
        await addDoc(collection(db, 'transactions'), {
          type: 'expense', amount,
          category: `Tabungan · ${selectedSaving.name}`,
          note: savingActionForm.note.trim() || `Tambah tabungan ${selectedSaving.name}`,
          walletId: wallet.id, walletName: wallet.name,
          savingId: selectedSaving.id, isSavingAllocation: true, date: actionDate, createdAt: Date.now()
        });
        await addDoc(collection(db, 'savings_logs'), {
          savingId: selectedSaving.id, savingName: selectedSaving.name,
          type: 'deposit', amount, walletId: wallet.id, walletName: wallet.name,
          note: savingActionForm.note.trim() || `Setoran dari ${wallet.name}`, date: actionDate, createdAt: Date.now()
        });
      }

      triggerSuccessPopup({
        title: 'Setoran Tabungan Berhasil!',
        subtitle: selectedSaving.name,
        amount,
        amountType: 'neutral',
        details: [
          { label: 'Dipotong dari Kantung', value: wallet.name },
          { label: `Sisa Saldo ${wallet.name}`, value: `Rp ${formatIDR(newWalletBal)}` },
          { label: 'Total Tabungan Sekarang', value: `Rp ${formatIDR(newCollected)}` }
        ]
      });
    } else {
      if ((Number(selectedSaving.collectedAmount) || 0) < amount) {
        return showToast("Saldo tabungan tidak mencukupi!", "error");
      }
      const newWalletBal = wallet.balance + amount;
      const newCollected = (Number(selectedSaving.collectedAmount) || 0) - amount;

      if (user.isLocal) {
        setWallets(prev => prev.map(w => w.id === wallet.id ? { ...w, balance: newWalletBal } : w));
        setSavings(prev => prev.map(s => s.id === selectedSaving.id ? { ...s, collectedAmount: newCollected } : s));
        setTransactions(prev => [{
          id: 'tx-' + Date.now(), type: 'income', amount,
          category: `Tarik Tabungan · ${selectedSaving.name}`,
          note: savingActionForm.note.trim() || `Tarik tabungan ${selectedSaving.name} ke ${wallet.name}`,
          walletId: wallet.id, walletName: wallet.name,
          savingId: selectedSaving.id, isSavingAllocation: true, date: actionDate, createdAt: Date.now()
        }, ...prev]);
        setSavingsLogs(prev => [{
          id: 'sl-' + Date.now(), savingId: selectedSaving.id, savingName: selectedSaving.name,
          type: 'withdraw', amount, walletId: wallet.id, walletName: wallet.name,
          note: savingActionForm.note.trim() || `Ditarik ke ${wallet.name}`, date: actionDate, createdAt: Date.now()
        }, ...prev]);
      } else {
        await updateDoc(doc(db, 'wallets', wallet.id), { balance: newWalletBal });
        await updateDoc(doc(db, 'savings', selectedSaving.id), { collectedAmount: newCollected });
        await addDoc(collection(db, 'transactions'), {
          type: 'income', amount,
          category: `Tarik Tabungan · ${selectedSaving.name}`,
          note: savingActionForm.note.trim() || `Tarik tabungan ${selectedSaving.name} ke ${wallet.name}`,
          walletId: wallet.id, walletName: wallet.name,
          savingId: selectedSaving.id, isSavingAllocation: true, date: actionDate, createdAt: Date.now()
        });
        await addDoc(collection(db, 'savings_logs'), {
          savingId: selectedSaving.id, savingName: selectedSaving.name,
          type: 'withdraw', amount, walletId: wallet.id, walletName: wallet.name,
          note: savingActionForm.note.trim() || `Ditarik ke ${wallet.name}`, date: actionDate, createdAt: Date.now()
        });
      }

      triggerSuccessPopup({
        title: 'Tabungan Ditarik ke Kantung!',
        subtitle: selectedSaving.name,
        amount,
        amountType: 'income',
        details: [
          { label: 'Masuk ke Kantung', value: wallet.name },
          { label: `Saldo ${wallet.name} Sekarang`, value: `Rp ${formatIDR(newWalletBal)}` },
          { label: 'Sisa Tabungan', value: `Rp ${formatIDR(newCollected)}` }
        ]
      });
    }

    setIsSavingActionModalOpen(false);
    setSavingActionForm({ amount: '', walletId: '', note: '', date: todayStr });
  };

  const handleDeleteSaving = async (savingId, refundWalletId = '') => {
    const targetSaving = savings.find(s => s.id === savingId);
    const collectedAmt = Number(targetSaving?.collectedAmount) || 0;
    const refundWallet = wallets.find(w => w.id === refundWalletId);

    if (collectedAmt > 0 && refundWallet) {
      const newWalletBal = (Number(refundWallet.balance) || 0) + collectedAmt;
      if (user.isLocal) {
        setWallets(prev => prev.map(w => w.id === refundWallet.id ? { ...w, balance: newWalletBal } : w));
        setTransactions(prev => [{
          id: 'tx-' + Date.now(), type: 'income', amount: collectedAmt,
          category: 'Pencairan Tabungan', note: `Pencairan tabungan ${targetSaving.name}`,
          walletId: refundWallet.id, walletName: refundWallet.name, date: Date.now(), createdAt: Date.now()
        }, ...prev]);
      } else {
        await updateDoc(doc(db, 'wallets', refundWallet.id), { balance: newWalletBal });
        await addDoc(collection(db, 'transactions'), {
          type: 'income', amount: collectedAmt,
          category: 'Pencairan Tabungan', note: `Pencairan tabungan ${targetSaving.name}`,
          walletId: refundWallet.id, walletName: refundWallet.name, date: Date.now(), createdAt: Date.now()
        });
      }
    }

    if (user.isLocal) {
      setSavings(prev => prev.filter(s => s.id !== savingId));
    } else {
      await deleteDoc(doc(db, 'savings', savingId));
    }

    setSelectedSavingId(null);
    showToast("Tabungan dihapus.");
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;
    const savedCatName = categoryForm.name.trim();
    const newCat = {
      name: savedCatName,
      type: categoryForm.type,
      icon: categoryForm.icon || 'Tag',
      color: categoryForm.color || 'indigo'
    };

    if (editingCategory) {
      const oldName = editingCategory.name;
      const isCustomDoc = Boolean(editingCategory.id && !String(editingCategory.id).startsWith('def-'));

      if (user.isLocal) {
        if (isCustomDoc) {
          setCustomCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...newCat } : c));
        } else {
          const origName = editingCategory.originalName || editingCategory.name;
          setCustomCategories(prev => [
            ...prev.filter(c => c.originalName !== origName),
            { id: 'cat-' + Date.now(), originalName: origName, ...newCat }
          ]);
        }
        if (oldName !== savedCatName) {
          setTransactions(prev => prev.map(t => t.category === oldName ? { ...t, category: savedCatName } : t));
          setBudgets(prev => prev.map(b => b.categoryName === oldName ? { ...b, categoryName: savedCatName } : b));
        }
      } else {
        if (isCustomDoc) {
          await updateDoc(doc(db, 'categories', editingCategory.id), newCat);
        } else {
          const origName = editingCategory.originalName || editingCategory.name;
          await addDoc(collection(db, 'categories'), { originalName: origName, ...newCat });
        }
        if (oldName !== savedCatName) {
          const affectedTxs = transactions.filter(t => t.category === oldName);
          const affectedBudgets = budgets.filter(b => b.categoryName === oldName);
          await Promise.all([
            ...affectedTxs.map(t => updateDoc(doc(db, 'transactions', t.id), { category: savedCatName })),
            ...affectedBudgets.map(b => updateDoc(doc(db, 'budgets', b.id), { categoryName: savedCatName }))
          ]);
        }
      }

      setEditingCategory(null);
      setIsCategoryModalOpen(false);
      setCategoryForm({ name: '', type: 'expense', icon: 'Tag', color: 'indigo' });
      showToast("Kategori berhasil diperbarui!");
      return;
    }

    if (user.isLocal) setCustomCategories(prev => [...prev, { id: 'cat-' + Date.now(), ...newCat }]);
    else await addDoc(collection(db, 'categories'), newCat);

    setTxForm(prev => ({ ...prev, category: savedCatName }));
    setIsCategoryModalOpen(false);
    setCategoryForm({ name: '', type: 'expense', icon: 'Tag', color: 'indigo' });
    triggerSuccessPopup({ title: 'Kategori Ditambahkan!', subtitle: savedCatName, amount: null, details: [{ label: 'Kategori', value: savedCatName }] });
  };

  const handleDeleteCategory = async (catToDelete) => {
    if (!catToDelete) return;
    const isCustomDoc = Boolean(catToDelete.id && !String(catToDelete.id).startsWith('def-'));
    const origName = catToDelete.originalName || catToDelete.name;

    if (user.isLocal) {
      if (isCustomDoc && !catToDelete.originalName) {
        setCustomCategories(prev => prev.filter(c => c.id !== catToDelete.id));
      } else {
        setCustomCategories(prev => [
          ...prev.filter(c => c.id !== catToDelete.id && c.originalName !== origName),
          { id: 'cat-del-' + Date.now(), originalName: origName, isDeleted: true }
        ]);
      }
    } else {
      if (isCustomDoc && !catToDelete.originalName) {
        await deleteDoc(doc(db, 'categories', catToDelete.id));
      } else {
        if (isCustomDoc) await deleteDoc(doc(db, 'categories', catToDelete.id));
        await addDoc(collection(db, 'categories'), { originalName: origName, isDeleted: true });
      }
    }

    setEditingCategory(null);
    setIsCategoryModalOpen(false);
    showToast(`Kategori "${catToDelete.name}" dihapus.`);
  };

  const handleClearAllData = async () => {
    setIsResetting(true);
    try {
      if (user.isLocal) {
        setWallets([]); setBudgets([]); setTransactions([]); setBudgetLogs([]); setSavings([]); setSavingsLogs([]); setCustomCategories([]);
        localStorage.clear();
      } else {
        await Promise.all([
          ...wallets.map(w => deleteDoc(doc(db, 'wallets', w.id))),
          ...budgets.map(b => deleteDoc(doc(db, 'budgets', b.id))),
          ...transactions.map(t => deleteDoc(doc(db, 'transactions', t.id))),
          ...budgetLogs.map(l => deleteDoc(doc(db, 'budget_logs', l.id))),
          ...savings.map(s => deleteDoc(doc(db, 'savings', s.id))),
          ...savingsLogs.map(sl => deleteDoc(doc(db, 'savings_logs', sl.id))),
          ...customCategories.map(c => deleteDoc(doc(db, 'categories', c.id))),
        ]);
      }
      setSelectedBudgetId(null);
      setSelectedSavingId(null);
      setIsConfirmResetOpen(false);
      setIsAdjustModalOpen(false);
      triggerSuccessPopup({ title: 'Data Berhasil Direset!', subtitle: 'Siap mulai dari 0', amount: null, details: [] });
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-slate-600 font-medium">
        <div className="flex flex-col items-center gap-3">
          <TrakiaCalculatorIcon size={58} />
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#1D63DC]" style={{ fontFamily: "'Poppins', 'Plus Jakarta Sans', sans-serif" }}>
              Trakia
            </h1>
            <p className="text-[11px] font-medium text-slate-500">Your Money Traking</p>
          </div>
          <div className="w-6 h-6 border-3 border-[#1D63DC] border-t-transparent rounded-full animate-spin mt-1"></div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-white relative font-sans text-[#0F172A] select-none overflow-hidden shadow-2xl border-x border-slate-100">
      {toast && (
        <div className="absolute top-4 left-4 right-4 z-[90] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg bg-[#0F172A] text-white text-sm font-medium">
          {toast.type === 'error' ? <AlertCircle size={18} className="text-rose-400 shrink-0" /> : <CheckCircle2 size={18} className="text-[#00C49A] shrink-0" />}
          <span className="flex-1">{toast.message}</span>
        </div>
      )}

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hideBalance={hideBalance}
        setHideBalance={setHideBalance}
        onOpenAdjust={() => setIsAdjustModalOpen(true)}
      />

      <div className="flex-1 overflow-y-auto pb-28 bg-white">
        {activeTab === 'home' && (
          <HomePage
            currentDate={currentDate}
            changeMonth={changeMonth}
            totalWalletBalance={totalWalletBalance}
            wallets={wallets}
            budgets={budgets}
            savings={savings}
            hideBalance={hideBalance}
            setHideBalance={setHideBalance}
            monthlyIncome={monthlyIncome}
            monthlyExpense={monthlyExpense}
            monthlyNetFlow={monthlyNetFlow}
            currentMonthMainTxs={currentMonthMainTxs}
            groupedTxs={groupedTxs}
            categories={categories}
            setActiveTab={setActiveTab}
            onOpenNewWallet={() => {
              setEditingWallet(null);
              setWalletForm({ name: '', balance: '', type: 'Bank' });
              setIsWalletModalOpen(true);
            }}
            onSelectBudget={(bId) => {
              if (budgets.some(b => b.id === bId)) setSelectedBudgetId(bId);
            }}
            onOpenTxDetail={openTxDetail}
          />
        )}

        {activeTab === 'wallets' && (
          <WalletsPage
            wallets={wallets}
            transactions={transactions}
            totalWalletBalance={totalWalletBalance}
            totalRemainingBudget={totalRemainingBudget}
            totalSavingsBalance={totalSavingsBalance}
            hideBalance={hideBalance}
            onAddWallet={() => {
              setEditingWallet(null);
              setWalletForm({ name: '', balance: '', type: 'Bank' });
              setIsWalletModalOpen(true);
            }}
            onPresetWallet={(preset) => {
              setEditingWallet(null);
              setWalletForm({ name: preset, balance: '', type: preset === 'Cash' ? 'Cash' : 'Bank' });
              setIsWalletModalOpen(true);
            }}
            onEditWallet={(w, formattedBal) => {
              setEditingWallet(w);
              setWalletForm({ name: w.name, balance: formattedBal, type: w.type || 'Bank' });
              setIsWalletModalOpen(true);
            }}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsPage
            budgets={budgets}
            budgetLogs={budgetLogs}
            categories={categories}
            onSelectBudget={(id) => {
              setSelectedBudgetId(id);
              setIsBudgetActionModalOpen(false);
            }}
            onOpenNewBudget={() => {
              if (wallets.length > 0 && !budgetForm.walletId) setBudgetForm(prev => ({ ...prev, walletId: wallets[0].id }));
              setIsBudgetModalOpen(true);
            }}
          />
        )}

        {activeTab === 'savings' && (
          <SavingsPage
            savings={savings}
            savingsLogs={savingsLogs}
            totalSavingsBalance={totalSavingsBalance}
            hideBalance={hideBalance}
            onSelectSaving={(id) => {
              setSelectedSavingId(id);
              setIsSavingActionModalOpen(false);
            }}
            onOpenNewSaving={() => {
              if (wallets.length > 0 && !savingForm.walletId) setSavingForm(prev => ({ ...prev, walletId: wallets[0].id }));
              setIsSavingModalOpen(true);
            }}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsPage
            currentDate={currentDate}
            hideBalance={hideBalance}
            dailyAverageExpense={dailyAverageExpense}
            monthlyExpense={monthlyExpense}
            monthlyIncome={monthlyIncome}
            categorySummary={categorySummary}
            weeklySummary={weeklySummary}
            currentMonthMainTxs={currentMonthMainTxs}
            onBackHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            categories={categories}
            onOpenCategoryModal={() => {
              setEditingCategory(null);
              setCategoryForm({ name: '', type: 'expense', icon: 'Tag', color: 'indigo' });
              setIsCategoryModalOpen(true);
            }}
            onEditCategory={(cat) => {
              setEditingCategory(cat);
              setCategoryForm({
                name: cat.name || '',
                type: cat.type || 'expense',
                icon: cat.icon || 'Tag',
                color: cat.color || 'indigo'
              });
              setIsCategoryModalOpen(true);
            }}
            onOpenResetModal={() => setIsConfirmResetOpen(true)}
            onLogout={() => {
              localStorage.removeItem('trakia_logged_in');
              setIsLoggedIn(false);
            }}
          />
        )}
      </div>

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onPlusClick={() => {
          if (activeTab === 'home' || activeTab === 'reports') {
            if (wallets.length > 0 && !txForm.walletId) setTxForm(prev => ({ ...prev, walletId: wallets[0].id }));
            setIsTxModalOpen(true);
          } else if (activeTab === 'wallets') {
            setEditingWallet(null);
            setWalletForm({ name: '', balance: '', type: 'Bank' });
            setIsWalletModalOpen(true);
          } else if (activeTab === 'budgets') {
            if (wallets.length > 0 && !budgetForm.walletId) setBudgetForm(prev => ({ ...prev, walletId: wallets[0].id }));
            setIsBudgetModalOpen(true);
          } else if (activeTab === 'savings') {
            if (wallets.length > 0 && !savingForm.walletId) setSavingForm(prev => ({ ...prev, walletId: wallets[0].id }));
            setIsSavingModalOpen(true);
          } else {
            setEditingCategory(null);
            setCategoryForm({ name: '', type: 'expense', icon: 'Tag', color: 'indigo' });
            setIsCategoryModalOpen(true);
          }
        }}
      />

      <Modals
        isTxModalOpen={isTxModalOpen} setIsTxModalOpen={setIsTxModalOpen} txForm={txForm} setTxForm={setTxForm} handleAddTx={handleAddTx}
        isWalletModalOpen={isWalletModalOpen} setIsWalletModalOpen={setIsWalletModalOpen} editingWallet={editingWallet} walletForm={walletForm} setWalletForm={setWalletForm} handleSaveWallet={handleSaveWallet} handleDeleteWallet={handleDeleteWallet}
        isBudgetModalOpen={isBudgetModalOpen} setIsBudgetModalOpen={setIsBudgetModalOpen} budgetForm={budgetForm} setBudgetForm={setBudgetForm} handleAddBudget={handleAddBudget}
        selectedBudget={selectedBudget} setSelectedBudgetId={setSelectedBudgetId} selectedBudgetLogs={selectedBudgetLogs} handleUpdateBudget={handleUpdateBudget} handleUpdateBudgetLog={handleUpdateBudgetLog} handleDeleteBudget={handleDeleteBudget} handleDeleteBudgetLog={handleDeleteBudgetLog}
        isBudgetActionModalOpen={isBudgetActionModalOpen} setIsBudgetActionModalOpen={setIsBudgetActionModalOpen} budgetActionType={budgetActionType} setBudgetActionType={setBudgetActionType} budgetActionForm={budgetActionForm} setBudgetActionForm={setBudgetActionForm} handleBudgetAction={handleBudgetAction}
        isCategoryModalOpen={isCategoryModalOpen} setIsCategoryModalOpen={setIsCategoryModalOpen} editingCategory={editingCategory} setEditingCategory={setEditingCategory} categoryForm={categoryForm} setCategoryForm={setCategoryForm} handleAddCategory={handleAddCategory} handleDeleteCategory={handleDeleteCategory}
        isAdjustModalOpen={isAdjustModalOpen} setIsAdjustModalOpen={setIsAdjustModalOpen} setActiveTab={setActiveTab}
        isConfirmResetOpen={isConfirmResetOpen} setIsConfirmResetOpen={setIsConfirmResetOpen} isResetting={isResetting} handleClearAllData={handleClearAllData}
        successPopup={successPopup} setSuccessPopup={setSuccessPopup}
        wallets={wallets} categories={categories} todayStr={todayStr}
        isTxDetailOpen={isTxDetailOpen} setIsTxDetailOpen={setIsTxDetailOpen}
        selectedTx={selectedTx} isEditingTx={isEditingTx} setIsEditingTx={setIsEditingTx}
        editTxForm={editTxForm} setEditTxForm={setEditTxForm}
        handleUpdateTx={handleUpdateTx} handleDeleteTx={handleDeleteTx}
        isSavingModalOpen={isSavingModalOpen} setIsSavingModalOpen={setIsSavingModalOpen}
        savingForm={savingForm} setSavingForm={setSavingForm} handleAddSaving={handleAddSaving}
        selectedSaving={selectedSaving} setSelectedSavingId={setSelectedSavingId} selectedSavingLogs={selectedSavingLogs}
        handleUpdateSaving={handleUpdateSaving} handleDeleteSaving={handleDeleteSaving}
        isSavingActionModalOpen={isSavingActionModalOpen} setIsSavingActionModalOpen={setIsSavingActionModalOpen}
        savingActionType={savingActionType} setSavingActionType={setSavingActionType}
        savingActionForm={savingActionForm} setSavingActionForm={setSavingActionForm}
        handleSavingAction={handleSavingAction}
      />
    </div>
  );
}
