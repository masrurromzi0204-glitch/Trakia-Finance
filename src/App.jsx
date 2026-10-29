import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';

import { auth, db, appId, PERSONAL_VAULT_ID, isFirebaseConfigured } from './firebase';
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
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 27));
  const [toast, setToast] = useState(null);
  const [hideBalance, setHideBalance] = useState(false);

  // Data States
  const [wallets, setWallets] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgetLogs, setBudgetLogs] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);

  // Modal States
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState(null);
  const [isBudgetActionModalOpen, setIsBudgetActionModalOpen] = useState(false);
  const [budgetActionType, setBudgetActionType] = useState('expense');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [successPopup, setSuccessPopup] = useState(null);

  // Form States
  const todayStr = new Date().toISOString().substring(0, 10);
  const [txForm, setTxForm] = useState({
    type: 'expense', amount: '', category: 'Kebutuhan Pribadi · Jajan/Uang Saku', note: '', walletId: '', date: todayStr
  });
  const [walletForm, setWalletForm] = useState({ name: '', balance: '', type: 'Bank' });
  const [budgetForm, setBudgetForm] = useState({
    name: '', initialAmount: '', walletId: '', storageForm: 'Cash', categoryName: 'Kebutuhan Dating', note: '', date: todayStr
  });
  const [budgetActionForm, setBudgetActionForm] = useState({ amount: '', walletId: '', note: '', date: todayStr });
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
        const savedCats = localStorage.getItem('trakia_categories');

        if (savedWallets) setWallets(JSON.parse(savedWallets));
        if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
        if (savedTxs) setTransactions(JSON.parse(savedTxs));
        if (savedLogs) setBudgetLogs(JSON.parse(savedLogs));
        if (savedCats) setCustomCategories(JSON.parse(savedCats));
      } catch (e) {
        console.error("Local load error:", e);
      }
      setIsLoading(false);
      return;
    }

    console.log("☁️ Menginisialisasi Firebase Auth Anonymous...");
    signInAnonymously(auth)
      .then((userCred) => {
        console.log("✅ Berhasil login anonim Firebase, UID:", userCred.user.uid);
        setUser({ uid: userCred.user.uid, isLocal: false });
      })
      .catch((err) => {
        console.error("❌ Firebase Auth error, beralih ke LocalStorage:", err);
        setUser({ uid: 'local-user', isLocal: true });
        setIsLoading(false);
      });

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        console.log("👤 User Firebase terdeteksi:", u.uid);
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
      localStorage.setItem('trakia_categories', JSON.stringify(customCategories));
    }
  }, [wallets, budgets, transactions, budgetLogs, customCategories, user]);

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

    const cRef = collection(db, 'categories');
    const uC = onSnapshot(cRef, (snap) => {
      setCustomCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.error("Categories error:", err);
      setIsLoading(false);
    });

    return () => { uW(); uB(); uT(); uBL(); uC(); };
  }, [user]);

  // Derived Calculations
  const categories = useMemo(() => [...DEFAULT_CATEGORIES, ...customCategories], [customCategories]);
  const selectedBudget = useMemo(() => budgets.find(b => b.id === selectedBudgetId) || null, [budgets, selectedBudgetId]);
  const selectedBudgetLogs = useMemo(() => selectedBudgetId ? budgetLogs.filter(l => l.budgetId === selectedBudgetId) : [], [budgetLogs, selectedBudgetId]);

  const totalWalletBalance = useMemo(() => wallets.reduce((s, w) => s + (Number(w.balance) || 0), 0), [wallets]);
  const totalRemainingBudget = useMemo(() => budgets.reduce((s, b) => s + (Number(b.remaining) || 0), 0), [budgets]);

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
        { label: 'Dompet', value: wallet.name },
        { label: 'Sisa Saldo Dompet', value: `Rp ${formatIDR(newBalance)}` }
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
      title: isEdit ? 'Dompet Diperbarui!' : 'Dompet Ditambahkan!',
      subtitle: `Kantong ${savedName} siap digunakan`, amount: balanceVal, amountType: 'neutral',
      details: [{ label: 'Nama Kantong', value: savedName }, { label: 'Tipe', value: walletForm.type || 'Bank' }]
    });
  };

  const handleDeleteWallet = async (walletId) => {
    if (user.isLocal) setWallets(prev => prev.filter(w => w.id !== walletId));
    else await deleteDoc(doc(db, 'wallets', walletId));
    setIsWalletModalOpen(false);
    setEditingWallet(null);
    showToast("Dompet dihapus.");
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!budgetForm.name.trim()) return showToast("Nama anggaran wajib diisi!", "error");
    const initialAmount = parseRawAmount(budgetForm.initialAmount);
    let sourceWallet = null;

    if (initialAmount > 0) {
      sourceWallet = wallets.find(w => w.id === budgetForm.walletId);
      if (!sourceWallet) return showToast("Pilih dompet sumber untuk alokasi saldo awal!", "error");
      if (sourceWallet.balance < initialAmount) return showToast(`Saldo di ${sourceWallet.name} tidak cukup!`, "error");
    }

    const chosenStorage = budgetForm.storageForm || (sourceWallet ? sourceWallet.name : 'Cash');
    const newBudgetData = {
      name: budgetForm.name.trim(), categoryName: budgetForm.categoryName || 'Kebutuhan Dating',
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
          note: budgetForm.note.trim() || `${budgetForm.name.trim()} (${sourceWallet.name})`, walletId: sourceWallet.id, walletName: sourceWallet.name,
          budgetId: localBudgetId, isBudgetAllocation: true, date: txDate, createdAt: Date.now()
        }, ...prev]);
        setBudgetLogs(prev => [{
          id: 'bl-' + Date.now(), budgetId: localBudgetId, budgetName: budgetForm.name.trim(), type: 'allocate',
          amount: initialAmount, note: budgetForm.note.trim() || `Alokasi awal dari ${sourceWallet.name}`, walletName: sourceWallet.name, date: txDate, createdAt: Date.now()
        }, ...prev]);
      }
    } else {
      const budgetDocRef = await addDoc(collection(db, 'budgets'), newBudgetData);
      if (initialAmount > 0 && sourceWallet) {
        const txDate = new Date((budgetForm.date || todayStr) + 'T12:00:00').getTime();
        await updateDoc(doc(db, 'wallets', sourceWallet.id), { balance: sourceWallet.balance - initialAmount });
        await addDoc(collection(db, 'transactions'), {
          type: 'expense', amount: initialAmount, category: budgetForm.categoryName || budgetForm.name.trim(),
          note: budgetForm.note.trim() || `${budgetForm.name.trim()} (${sourceWallet.name})`, walletId: sourceWallet.id, walletName: sourceWallet.name,
          budgetId: budgetDocRef.id, isBudgetAllocation: true, date: txDate, createdAt: Date.now()
        });
        await addDoc(collection(db, 'budget_logs'), {
          budgetId: budgetDocRef.id, budgetName: budgetForm.name.trim(), type: 'allocate',
          amount: initialAmount, note: budgetForm.note.trim() || `Alokasi awal dari ${sourceWallet.name}`, walletName: sourceWallet.name, date: txDate, createdAt: Date.now()
        });
      }
    }

    setIsBudgetModalOpen(false);
    setBudgetForm({ name: '', initialAmount: '', walletId: '', storageForm: 'Cash', categoryName: 'Kebutuhan Dating', note: '', date: todayStr });
    triggerSuccessPopup({
      title: 'Anggaran Berhasil Dibuat!', subtitle: newBudgetData.name, amount: initialAmount, amountType: 'neutral',
      details: [
        { label: 'Pos Anggaran', value: newBudgetData.name },
        { label: 'Disimpan Dalam Bentuk', value: chosenStorage },
        { label: 'Kategori', value: newBudgetData.categoryName }
      ]
    });
  };

  const handleBudgetAction = async (e) => {
    e.preventDefault();
    if (!selectedBudget) return;
    const amount = parseRawAmount(budgetActionForm.amount);
    if (amount <= 0) return showToast("Masukkan nominal yang valid!", "error");
    const actionDate = new Date((budgetActionForm.date || todayStr) + 'T12:00:00').getTime();

    if (budgetActionType === 'add_money') {
      const wallet = wallets.find(w => w.id === budgetActionForm.walletId);
      if (!wallet) return showToast("Pilih dompet sumber dana!", "error");
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
          amount, note: budgetActionForm.note.trim() || `Tambah dana dari ${wallet.name}`, walletName: wallet.name, date: actionDate, createdAt: Date.now()
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
          amount, note: budgetActionForm.note.trim() || `Tambah dana dari ${wallet.name}`, walletName: wallet.name, date: actionDate, createdAt: Date.now()
        });
      }

      triggerSuccessPopup({
        title: 'Dana Anggaran Ditambahkan!', subtitle: budgetActionForm.note.trim() || `Top-up ${selectedBudget.name}`, amount, amountType: 'income',
        details: [{ label: 'Anggaran', value: selectedBudget.name }, { label: 'Sisa Anggaran Baru', value: `Rp ${formatIDR(newRemaining)}` }]
      });
    } else {
      if ((Number(selectedBudget.remaining) || 0) < amount) return showToast("Sisa saldo anggaran tidak mencukupi!", "error");
      if (!budgetActionForm.note.trim()) return showToast("Isi rincian penggunaan dana!", "error");

      const newRemaining = (Number(selectedBudget.remaining) || 0) - amount;
      const newSpent = (Number(selectedBudget.spent) || 0) + amount;

      if (user.isLocal) {
        setBudgets(prev => prev.map(b => b.id === selectedBudget.id ? { ...b, spent: newSpent, remaining: newRemaining } : b));
        setBudgetLogs(prev => [{
          id: 'bl-' + Date.now(), budgetId: selectedBudget.id, budgetName: selectedBudget.name, type: 'expense',
          amount, note: budgetActionForm.note.trim(), date: actionDate, createdAt: Date.now()
        }, ...prev]);
      } else {
        await updateDoc(doc(db, 'budgets', selectedBudget.id), { spent: newSpent, remaining: newRemaining });
        await addDoc(collection(db, 'budget_logs'), {
          budgetId: selectedBudget.id, budgetName: selectedBudget.name, type: 'expense',
          amount, note: budgetActionForm.note.trim(), date: actionDate, createdAt: Date.now()
        });
      }

      triggerSuccessPopup({
        title: 'Pengeluaran Budget Tercatat!', subtitle: budgetActionForm.note.trim(), amount, amountType: 'expense',
        details: [{ label: 'Pos Anggaran', value: selectedBudget.name }, { label: 'Sisa Saldo Budget', value: `Rp ${formatIDR(newRemaining)}` }]
      });
    }

    setIsBudgetActionModalOpen(false);
    setBudgetActionForm({ amount: '', walletId: '', note: '', date: todayStr });
  };

  const handleDeleteBudgetLog = async (logItem) => {
    if (!selectedBudget) return;
    const updatedSpent = Math.max(0, (Number(selectedBudget.spent) || 0) - logItem.amount);
    const updatedRemaining = (Number(selectedBudget.remaining) || 0) + logItem.amount;

    if (user.isLocal) {
      if (logItem.type === 'expense') setBudgets(prev => prev.map(b => b.id === selectedBudget.id ? { ...b, spent: updatedSpent, remaining: updatedRemaining } : b));
      setBudgetLogs(prev => prev.filter(l => l.id !== logItem.id));
    } else {
      if (logItem.type === 'expense') await updateDoc(doc(db, 'budgets', selectedBudget.id), { spent: updatedSpent, remaining: updatedRemaining });
      await deleteDoc(doc(db, 'budget_logs', logItem.id));
    }
    showToast("Riwayat rincian dihapus.");
  };

  const handleDeleteBudget = async (budgetId) => {
    if (user.isLocal) setBudgets(prev => prev.filter(b => b.id !== budgetId));
    else await deleteDoc(doc(db, 'budgets', budgetId));
    setSelectedBudgetId(null);
    showToast("Anggaran dihapus.");
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;
    const savedCatName = categoryForm.name.trim();
    const newCat = { name: savedCatName, type: categoryForm.type, icon: categoryForm.icon || 'Tag', color: categoryForm.color || 'indigo' };

    if (user.isLocal) setCustomCategories(prev => [...prev, { id: 'cat-' + Date.now(), ...newCat }]);
    else await addDoc(collection(db, 'categories'), newCat);

    setTxForm(prev => ({ ...prev, category: savedCatName }));
    setIsCategoryModalOpen(false);
    setCategoryForm({ name: '', type: 'expense', icon: 'Tag', color: 'indigo' });
    triggerSuccessPopup({ title: 'Kategori Ditambahkan!', subtitle: savedCatName, amount: null, details: [{ label: 'Kategori', value: savedCatName }] });
  };

  const handleClearAllData = async () => {
    setIsResetting(true);
    try {
      if (user.isLocal) {
        setWallets([]); setBudgets([]); setTransactions([]); setBudgetLogs([]); setCustomCategories([]);
        localStorage.clear();
      } else {
        await Promise.all([
          ...wallets.map(w => deleteDoc(doc(db, 'wallets', w.id))),
          ...budgets.map(b => deleteDoc(doc(db, 'budgets', b.id))),
          ...transactions.map(t => deleteDoc(doc(db, 'transactions', t.id))),
          ...budgetLogs.map(l => deleteDoc(doc(db, 'budget_logs', l.id))),
          ...customCategories.map(c => deleteDoc(doc(db, 'categories', c.id))),
        ]);
      }
      setSelectedBudgetId(null);
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
            <h1 className="text-2xl font-black tracking-tight text-[#1D63DC]" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}>
              Trakia
            </h1>
            <p className="text-[11px] font-medium text-slate-500">Your Money Traking</p>
          </div>
          <div className="w-6 h-6 border-3 border-[#1D63DC] border-t-transparent rounded-full animate-spin mt-1"></div>
        </div>
      </div>
    );
  }

  // Tampilkan Login Page jika belum login
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
          />
        )}

        {activeTab === 'wallets' && (
          <WalletsPage
            wallets={wallets}
            totalWalletBalance={totalWalletBalance}
            totalRemainingBudget={totalRemainingBudget}
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
            categories={categories}
            onSelectBudget={(id) => {
              setSelectedBudgetId(id);
              setIsBudgetActionModalOpen(false);
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
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            categories={categories}
            onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
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
          } else {
            setIsCategoryModalOpen(true);
          }
        }}
      />

      <Modals
        isTxModalOpen={isTxModalOpen} setIsTxModalOpen={setIsTxModalOpen} txForm={txForm} setTxForm={setTxForm} handleAddTx={handleAddTx}
        isWalletModalOpen={isWalletModalOpen} setIsWalletModalOpen={setIsWalletModalOpen} editingWallet={editingWallet} walletForm={walletForm} setWalletForm={setWalletForm} handleSaveWallet={handleSaveWallet} handleDeleteWallet={handleDeleteWallet}
        isBudgetModalOpen={isBudgetModalOpen} setIsBudgetModalOpen={setIsBudgetModalOpen} budgetForm={budgetForm} setBudgetForm={setBudgetForm} handleAddBudget={handleAddBudget}
        selectedBudget={selectedBudget} setSelectedBudgetId={setSelectedBudgetId} selectedBudgetLogs={selectedBudgetLogs} handleDeleteBudget={handleDeleteBudget} handleDeleteBudgetLog={handleDeleteBudgetLog}
        isBudgetActionModalOpen={isBudgetActionModalOpen} setIsBudgetActionModalOpen={setIsBudgetActionModalOpen} budgetActionType={budgetActionType} setBudgetActionType={setBudgetActionType} budgetActionForm={budgetActionForm} setBudgetActionForm={setBudgetActionForm} handleBudgetAction={handleBudgetAction}
        isCategoryModalOpen={isCategoryModalOpen} setIsCategoryModalOpen={setIsCategoryModalOpen} categoryForm={categoryForm} setCategoryForm={setCategoryForm} handleAddCategory={handleAddCategory}
        isAdjustModalOpen={isAdjustModalOpen} setIsAdjustModalOpen={setIsAdjustModalOpen} setActiveTab={setActiveTab}
        isConfirmResetOpen={isConfirmResetOpen} setIsConfirmResetOpen={setIsConfirmResetOpen} isResetting={isResetting} handleClearAllData={handleClearAllData}
        successPopup={successPopup} setSuccessPopup={setSuccessPopup}
        wallets={wallets} categories={categories} todayStr={todayStr}
      />
    </div>
  );
}