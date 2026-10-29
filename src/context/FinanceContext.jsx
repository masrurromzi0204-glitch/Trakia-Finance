import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured, appId, PERSONAL_VAULT_ID } from '../config/firebase';
import { DEFAULT_CATEGORIES } from '../config/constants';
import { formatIDR, parseRawAmount, formatShortDate } from '../utils/formatters';

const FinanceContext = createContext(null);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

export const FinanceProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  // Default ke Oktober 2026 sesuai konteks & contoh gambar
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 27));
  const [toast, setToast] = useState(null);
  const [hideBalance, setHideBalance] = useState(false);

  // --- Cloud Data States ---
  const [wallets, setWallets] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]); // Main cashflow transactions (Home)
  const [budgetLogs, setBudgetLogs] = useState([]);     // Internal budget history (Detail Budget)
  const [customCategories, setCustomCategories] = useState([]);

  // --- Modal States ---
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState(null);
  const [isBudgetActionModalOpen, setIsBudgetActionModalOpen] = useState(false);
  const [budgetActionType, setBudgetActionType] = useState('expense'); // 'add_money' or 'expense'
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showBulananInfo, setShowBulananInfo] = useState(false);
  const [successPopup, setSuccessPopup] = useState(null);

  // --- Report / Summary Tab States ---
  const [reportChartType, setReportChartType] = useState('expense'); // 'expense' or 'income'
  const [reportTableFilter, setReportTableFilter] = useState('all'); // 'all', 'income', 'expense'

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const triggerSuccessPopup = (payload) => {
    setSuccessPopup(payload);
    setTimeout(() => {
      setSuccessPopup((prev) => (prev === payload ? null : prev));
    }, 2800);
  };

  // --- 1. Auth Initialization (Cloud or Local Mode) ---
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      // Mode Lokal (VS Code / Localhost tanpa Firebase): langsung masuk dan muat dari LocalStorage
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

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
        setIsLoading(false);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Simpan otomatis ke LocalStorage saat berjalan di VS Code / Localhost
  useEffect(() => {
    if (user?.isLocal) {
      localStorage.setItem('trakia_wallets', JSON.stringify(wallets));
      localStorage.setItem('trakia_budgets', JSON.stringify(budgets));
      localStorage.setItem('trakia_transactions', JSON.stringify(transactions));
      localStorage.setItem('trakia_budget_logs', JSON.stringify(budgetLogs));
      localStorage.setItem('trakia_categories', JSON.stringify(customCategories));
    }
  }, [wallets, budgets, transactions, budgetLogs, customCategories, user]);

  // --- 2. Firestore Real-time Listeners ---
  useEffect(() => {
    if (!user || user.isLocal || !db) return;
    setIsLoading(true);

    const storageOwnerId = typeof __app_id !== 'undefined' ? user.uid : PERSONAL_VAULT_ID;

    const wRef = collection(db, 'artifacts', appId, 'users', storageOwnerId, 'wallets');
    const uW = onSnapshot(wRef, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setWallets(list);
    }, (err) => console.error("Wallets error:", err));

    const bRef = collection(db, 'artifacts', appId, 'users', storageOwnerId, 'budgets');
    const uB = onSnapshot(bRef, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setBudgets(list);
    }, (err) => console.error("Budgets error:", err));

    const tRef = collection(db, 'artifacts', appId, 'users', storageOwnerId, 'transactions');
    const uT = onSnapshot(tRef, (snap) => {
      const txs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      txs.sort((a, b) => b.date - a.date || (b.createdAt || 0) - (a.createdAt || 0));
      setTransactions(txs);
      setIsLoading(false);
    }, (err) => {
      console.error("Transactions error:", err);
      setIsLoading(false);
    });

    const blRef = collection(db, 'artifacts', appId, 'users', storageOwnerId, 'budget_logs');
    const uBL = onSnapshot(blRef, (snap) => {
      const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      logs.sort((a, b) => b.date - a.date || (b.createdAt || 0) - (a.createdAt || 0));
      setBudgetLogs(logs);
    }, (err) => console.error("Budget logs error:", err));

    const cRef = collection(db, 'artifacts', appId, 'users', storageOwnerId, 'categories');
    const uC = onSnapshot(cRef, (snap) => {
      setCustomCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error("Categories error:", err));

    return () => { uW(); uB(); uT(); uBL(); uC(); };
  }, [user]);

  const getStorageOwnerId = () => (typeof __app_id !== 'undefined' ? user?.uid : PERSONAL_VAULT_ID);

  const categories = useMemo(() => [...DEFAULT_CATEGORIES, ...customCategories], [customCategories]);

  const selectedBudget = useMemo(() => {
    return budgets.find(b => b.id === selectedBudgetId) || null;
  }, [budgets, selectedBudgetId]);

  const selectedBudgetLogs = useMemo(() => {
    if (!selectedBudgetId) return [];
    return budgetLogs.filter(log => log.budgetId === selectedBudgetId);
  }, [budgetLogs, selectedBudgetId]);

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const isSameMonth = (d1, d2) => d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

  // --- Derived Financial Summaries ---
  const totalWalletBalance = useMemo(() => {
    return wallets.reduce((sum, w) => sum + (Number(w.balance) || 0), 0);
  }, [wallets]);

  const totalRemainingBudget = useMemo(() => {
    return budgets.reduce((sum, b) => sum + (Number(b.remaining) || 0), 0);
  }, [budgets]);

  const totalAllocatedBudget = useMemo(() => {
    return budgets.reduce((sum, b) => sum + (Number(b.allocated) || 0), 0);
  }, [budgets]);

  const totalSpentBudget = useMemo(() => {
    return budgets.reduce((sum, b) => sum + (Number(b.spent) || 0), 0);
  }, [budgets]);

  const currentMonthMainTxs = useMemo(() => {
    return transactions.filter(tx => {
      if (tx.isInternalBudgetExpense) return false;
      return isSameMonth(new Date(tx.date), currentDate);
    });
  }, [transactions, currentDate]);

  const monthlyIncome = useMemo(() => {
    return currentMonthMainTxs.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  }, [currentMonthMainTxs]);

  const monthlyExpense = useMemo(() => {
    return currentMonthMainTxs.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  }, [currentMonthMainTxs]);

  const monthlyNetFlow = monthlyIncome - monthlyExpense;

  const categorySummary = useMemo(() => {
    const map = {};
    currentMonthMainTxs.forEach(tx => {
      const key = `${tx.type}_${tx.category}`;
      if (!map[key]) {
        map[key] = {
          category: tx.category || 'Lainnya',
          type: tx.type,
          count: 0,
          total: 0
        };
      }
      map[key].count += 1;
      map[key].total += Number(tx.amount) || 0;
    });

    const list = Object.values(map);
    list.sort((a, b) => b.total - a.total);
    return list;
  }, [currentMonthMainTxs]);

  const chartCategories = useMemo(() => {
    const filtered = categorySummary.filter(item => item.type === reportChartType);
    const totalTypeAmount = reportChartType === 'expense' ? monthlyExpense : monthlyIncome;
    const palette = ['#1D63DC', '#00C49A', '#F59E0B', '#F43F5E', '#6366F1', '#8B5CF6', '#0EA5E9', '#94A3B8'];

    return filtered.map((item, idx) => ({
      ...item,
      percentage: totalTypeAmount > 0 ? Math.round((item.total / totalTypeAmount) * 100) : 0,
      exactPercentage: totalTypeAmount > 0 ? (item.total / totalTypeAmount) * 100 : 0,
      color: palette[idx % palette.length]
    }));
  }, [categorySummary, reportChartType, monthlyExpense, monthlyIncome]);

  const weeklySummary = useMemo(() => {
    const weeks = [
      { label: '3M lalu', sub: 'Tgl 1-7', income: 0, expense: 0 },
      { label: '2M lalu', sub: 'Tgl 8-14', income: 0, expense: 0 },
      { label: 'Mg lalu', sub: 'Tgl 15-21', income: 0, expense: 0 },
      { label: 'Mg ini', sub: 'Tgl 22+', income: 0, expense: 0 },
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

  const daysInSelectedMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  }, [currentDate]);

  const dailyAverageExpense = useMemo(() => {
    return Math.round(monthlyExpense / Math.max(1, daysInSelectedMonth));
  }, [monthlyExpense, daysInSelectedMonth]);

  const remainingDaysInMonth = useMemo(() => {
    const now = new Date();
    if (now.getMonth() === currentDate.getMonth() && now.getFullYear() === currentDate.getFullYear()) {
      return Math.max(1, daysInSelectedMonth - now.getDate() + 1);
    }
    return daysInSelectedMonth;
  }, [currentDate, daysInSelectedMonth]);

  const safeDailyBudget = useMemo(() => {
    return Math.round(totalRemainingBudget / Math.max(1, remainingDaysInMonth));
  }, [totalRemainingBudget, remainingDaysInMonth]);

  const filteredReportTxs = useMemo(() => {
    if (reportTableFilter === 'all') return currentMonthMainTxs;
    return currentMonthMainTxs.filter(tx => tx.type === reportTableFilter);
  }, [currentMonthMainTxs, reportTableFilter]);

  const groupedTxs = useMemo(() => {
    const groups = {};
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    currentMonthMainTxs.forEach(tx => {
      const d = new Date(tx.date);
      const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const shortDate = formatShortDate(d);

      let prefix = '';
      if (d.toDateString() === now.toDateString()) {
        prefix = 'Hari ini';
      } else if (d.toDateString() === yesterday.toDateString()) {
        prefix = 'Kemarin';
      } else {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        prefix = days[d.getDay()];
      }

      if (!groups[dayKey]) {
        groups[dayKey] = {
          key: dayKey,
          prefix,
          shortDate,
          items: [],
          incomeTotal: 0,
          expenseTotal: 0
        };
      }
      groups[dayKey].items.push(tx);
      if (tx.type === 'income') {
        groups[dayKey].incomeTotal += Number(tx.amount) || 0;
      } else {
        groups[dayKey].expenseTotal += Number(tx.amount) || 0;
      }
    });

    return Object.values(groups);
  }, [currentMonthMainTxs]);

  // --- Handlers ---

  // 1. Catat Transaksi Langsung
  const handleAddTx = async (txData) => {
    if (!user) return;
    const amount = parseRawAmount(txData.amount);
    if (isNaN(amount) || amount <= 0) {
      return showToast("Masukkan nominal yang valid!", "error");
    }
    if (!txData.walletId) {
      return showToast("Pilih dompet terlebih dahulu!", "error");
    }
    if (!txData.category) {
      return showToast("Pilih kategori transaksi!", "error");
    }

    const wallet = wallets.find(w => w.id === txData.walletId);
    if (!wallet) return showToast("Dompet tidak ditemukan!", "error");

    if (txData.type === 'expense' && wallet.balance < amount) {
      return showToast(`Saldo ${wallet.name} tidak mencukupi!`, "error");
    }

    try {
      const newBalance = txData.type === 'expense' ? wallet.balance - amount : wallet.balance + amount;
      const selectedDateObj = new Date(txData.date + 'T12:00:00');
      const newTxItem = {
        type: txData.type,
        amount: amount,
        category: txData.category,
        note: txData.note || txData.category,
        walletId: wallet.id,
        walletName: wallet.name,
        date: selectedDateObj.getTime(),
        createdAt: Date.now()
      };

      if (user.isLocal) {
        setWallets(prev => prev.map(w => w.id === wallet.id ? { ...w, balance: newBalance } : w));
        setTransactions(prev => [{ id: 'tx-' + Date.now(), ...newTxItem }, ...prev]);
      } else {
        const ownerId = getStorageOwnerId();
        await updateDoc(doc(db, 'artifacts', appId, 'users', ownerId, 'wallets', wallet.id), {
          balance: newBalance
        });
        await addDoc(collection(db, 'artifacts', appId, 'users', ownerId, 'transactions'), newTxItem);
      }

      setCurrentDate(selectedDateObj);
      setIsTxModalOpen(false);
      triggerSuccessPopup({
        title: txData.type === 'expense' ? 'Pengeluaran Tercatat!' : 'Pemasukan Tercatat!',
        subtitle: txData.note || txData.category,
        amount: amount,
        amountType: txData.type,
        details: [
          { label: 'Kategori', value: txData.category },
          { label: 'Dompet', value: wallet.name },
          { label: 'Sisa Saldo Dompet', value: `Rp ${formatIDR(newBalance)}` }
        ]
      });
    } catch (err) {
      console.error(err);
      showToast("Gagal menyimpan transaksi.", "error");
    }
  };

  // 2. Tambah atau Edit Dompet
  const handleSaveWallet = async (walletData, editingTarget) => {
    if (!user || !walletData.name?.trim()) {
      return showToast("Nama dompet wajib diisi!", "error");
    }

    const balanceVal = parseRawAmount(walletData.balance);
    const savedName = walletData.name.trim();
    const isEdit = Boolean(editingTarget);

    try {
      if (user.isLocal) {
        if (editingTarget) {
          setWallets(prev => prev.map(w => w.id === editingTarget.id ? { ...w, name: savedName, balance: balanceVal, type: walletData.type || 'Bank' } : w));
        } else {
          setWallets(prev => [...prev, { id: 'w-' + Date.now(), name: savedName, balance: balanceVal, type: walletData.type || 'Bank', createdAt: Date.now() }]);
        }
      } else {
        const ownerId = getStorageOwnerId();
        if (editingTarget) {
          await updateDoc(doc(db, 'artifacts', appId, 'users', ownerId, 'wallets', editingTarget.id), {
            name: savedName,
            balance: balanceVal,
            type: walletData.type || 'Bank'
          });
        } else {
          await addDoc(collection(db, 'artifacts', appId, 'users', ownerId, 'wallets'), {
            name: savedName,
            balance: balanceVal,
            type: walletData.type || 'Bank',
            createdAt: Date.now()
          });
        }
      }
      setIsWalletModalOpen(false);
      setEditingWallet(null);
      triggerSuccessPopup({
        title: isEdit ? 'Dompet Diperbarui!' : 'Dompet Ditambahkan!',
        subtitle: `Kantong ${savedName} siap digunakan`,
        amount: balanceVal,
        amountType: 'neutral',
        details: [
          { label: 'Nama Kantong', value: savedName },
          { label: 'Tipe', value: walletData.type || 'Bank' }
        ]
      });
    } catch (err) {
      console.error(err);
      showToast("Gagal menyimpan dompet.", "error");
    }
  };

  const handleDeleteWallet = async (walletId) => {
    if (!user) return;
    try {
      if (user.isLocal) {
        setWallets(prev => prev.filter(w => w.id !== walletId));
      } else {
        const ownerId = getStorageOwnerId();
        await deleteDoc(doc(db, 'artifacts', appId, 'users', ownerId, 'wallets', walletId));
      }
      setIsWalletModalOpen(false);
      setEditingWallet(null);
      showToast("Dompet dihapus.");
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus dompet.", "error");
    }
  };

  // 3. Buat Anggaran (Budget) Baru
  const handleAddBudget = async (budgetData) => {
    if (!user || !budgetData.name?.trim()) {
      return showToast("Nama anggaran wajib diisi!", "error");
    }

    const initialAmount = parseRawAmount(budgetData.initialAmount);
    let sourceWallet = null;

    if (initialAmount > 0) {
      if (!budgetData.walletId) {
        return showToast("Pilih dompet sumber untuk alokasi saldo awal!", "error");
      }
      sourceWallet = wallets.find(w => w.id === budgetData.walletId);
      if (!sourceWallet) return showToast("Dompet sumber tidak valid!", "error");
      if (sourceWallet.balance < initialAmount) {
        return showToast(`Saldo di ${sourceWallet.name} tidak cukup!`, "error");
      }
    }

    try {
      const chosenStorage = budgetData.storageForm || (sourceWallet ? sourceWallet.name : 'Cash');
      const newBudgetData = {
        name: budgetData.name.trim(),
        categoryName: budgetData.categoryName || 'Kebutuhan Dating',
        storageForm: chosenStorage,
        allocated: initialAmount,
        spent: 0,
        remaining: initialAmount,
        createdAt: Date.now()
      };

      const todayStr = new Date().toISOString().substring(0, 10);
      const txDate = new Date((budgetData.date || todayStr) + 'T12:00:00').getTime();

      if (user.isLocal) {
        const localBudgetId = 'b-' + Date.now();
        setBudgets(prev => [{ id: localBudgetId, ...newBudgetData }, ...prev]);

        if (initialAmount > 0 && sourceWallet) {
          setWallets(prev => prev.map(w => w.id === sourceWallet.id ? { ...w, balance: w.balance - initialAmount } : w));
          setTransactions(prev => [{
            id: 'tx-' + Date.now(),
            type: 'expense',
            amount: initialAmount,
            category: budgetData.categoryName || budgetData.name.trim(),
            note: budgetData.note?.trim() || `${budgetData.name.trim()} (${sourceWallet.name})`,
            walletId: sourceWallet.id,
            walletName: sourceWallet.name,
            budgetId: localBudgetId,
            isBudgetAllocation: true,
            date: txDate,
            createdAt: Date.now()
          }, ...prev]);
          setBudgetLogs(prev => [{
            id: 'bl-' + Date.now(),
            budgetId: localBudgetId,
            budgetName: budgetData.name.trim(),
            type: 'allocate',
            amount: initialAmount,
            note: budgetData.note?.trim() || `Alokasi awal dari ${sourceWallet.name}`,
            walletName: sourceWallet.name,
            date: txDate,
            createdAt: Date.now()
          }, ...prev]);
        }
      } else {
        const ownerId = getStorageOwnerId();
        const budgetDocRef = await addDoc(collection(db, 'artifacts', appId, 'users', ownerId, 'budgets'), newBudgetData);

        if (initialAmount > 0 && sourceWallet) {
          await updateDoc(doc(db, 'artifacts', appId, 'users', ownerId, 'wallets', sourceWallet.id), {
            balance: sourceWallet.balance - initialAmount
          });

          await addDoc(collection(db, 'artifacts', appId, 'users', ownerId, 'transactions'), {
            type: 'expense',
            amount: initialAmount,
            category: budgetData.categoryName || budgetData.name.trim(),
            note: budgetData.note?.trim() || `${budgetData.name.trim()} (${sourceWallet.name})`,
            walletId: sourceWallet.id,
            walletName: sourceWallet.name,
            budgetId: budgetDocRef.id,
            isBudgetAllocation: true,
            date: txDate,
            createdAt: Date.now()
          });

          await addDoc(collection(db, 'artifacts', appId, 'users', ownerId, 'budget_logs'), {
            budgetId: budgetDocRef.id,
            budgetName: budgetData.name.trim(),
            type: 'allocate',
            amount: initialAmount,
            note: budgetData.note?.trim() || `Alokasi awal dari ${sourceWallet.name}`,
            walletName: sourceWallet.name,
            date: txDate,
            createdAt: Date.now()
          });
        }
      }

      const createdBudgetName = budgetData.name.trim();
      const createdCategory = budgetData.categoryName || 'Kebutuhan Dating';

      setIsBudgetModalOpen(false);
      triggerSuccessPopup({
        title: 'Anggaran Berhasil Dibuat!',
        subtitle: createdBudgetName,
        amount: initialAmount,
        amountType: 'neutral',
        details: [
          { label: 'Pos Anggaran', value: createdBudgetName },
          { label: 'Disimpan Dalam Bentuk', value: chosenStorage },
          { label: 'Kategori', value: createdCategory },
          ...(sourceWallet ? [{ label: 'Sumber Dana', value: sourceWallet.name }] : [])
        ]
      });
    } catch (err) {
      console.error(err);
      showToast("Gagal membuat anggaran.", "error");
    }
  };

  // 4. Aksi di Dalam Detail Budget
  const handleBudgetAction = async (actionData, currentType) => {
    if (!user || !selectedBudget) return;

    const amount = parseRawAmount(actionData.amount);
    if (isNaN(amount) || amount <= 0) {
      return showToast("Masukkan nominal yang valid!", "error");
    }

    const todayStr = new Date().toISOString().substring(0, 10);
    const actionDate = new Date((actionData.date || todayStr) + 'T12:00:00').getTime();

    try {
      if (currentType === 'add_money') {
        const wallet = wallets.find(w => w.id === actionData.walletId);
        if (!wallet) return showToast("Pilih dompet sumber dana!", "error");
        if (wallet.balance < amount) {
          return showToast(`Saldo ${wallet.name} tidak mencukupi!`, "error");
        }

        const newRemaining = (Number(selectedBudget.remaining) || 0) + amount;
        const newAllocated = (Number(selectedBudget.allocated) || 0) + amount;

        if (user.isLocal) {
          setWallets(prev => prev.map(w => w.id === wallet.id ? { ...w, balance: w.balance - amount } : w));
          setBudgets(prev => prev.map(b => b.id === selectedBudget.id ? { ...b, allocated: newAllocated, remaining: newRemaining } : b));
          setTransactions(prev => [{
            id: 'tx-' + Date.now(),
            type: 'expense',
            amount: amount,
            category: selectedBudget.categoryName || selectedBudget.name,
            note: actionData.note?.trim() || `Top-up ${selectedBudget.name}`,
            walletId: wallet.id,
            walletName: wallet.name,
            budgetId: selectedBudget.id,
            isBudgetAllocation: true,
            date: actionDate,
            createdAt: Date.now()
          }, ...prev]);
          setBudgetLogs(prev => [{
            id: 'bl-' + Date.now(),
            budgetId: selectedBudget.id,
            budgetName: selectedBudget.name,
            type: 'allocate',
            amount: amount,
            note: actionData.note?.trim() || `Tambah dana dari ${wallet.name}`,
            walletName: wallet.name,
            date: actionDate,
            createdAt: Date.now()
          }, ...prev]);
        } else {
          const ownerId = getStorageOwnerId();
          const bRef = doc(db, 'artifacts', appId, 'users', ownerId, 'budgets', selectedBudget.id);
          await updateDoc(doc(db, 'artifacts', appId, 'users', ownerId, 'wallets', wallet.id), {
            balance: wallet.balance - amount
          });
          await updateDoc(bRef, {
            allocated: newAllocated,
            remaining: newRemaining
          });
          await addDoc(collection(db, 'artifacts', appId, 'users', ownerId, 'transactions'), {
            type: 'expense',
            amount: amount,
            category: selectedBudget.categoryName || selectedBudget.name,
            note: actionData.note?.trim() || `Top-up ${selectedBudget.name}`,
            walletId: wallet.id,
            walletName: wallet.name,
            budgetId: selectedBudget.id,
            isBudgetAllocation: true,
            date: actionDate,
            createdAt: Date.now()
          });
          await addDoc(collection(db, 'artifacts', appId, 'users', ownerId, 'budget_logs'), {
            budgetId: selectedBudget.id,
            budgetName: selectedBudget.name,
            type: 'allocate',
            amount: amount,
            note: actionData.note?.trim() || `Tambah dana dari ${wallet.name}`,
            walletName: wallet.name,
            date: actionDate,
            createdAt: Date.now()
          });
        }

        triggerSuccessPopup({
          title: 'Dana Anggaran Ditambahkan!',
          subtitle: actionData.note?.trim() || `Top-up ${selectedBudget.name}`,
          amount: amount,
          amountType: 'income',
          details: [
            { label: 'Anggaran', value: selectedBudget.name },
            { label: 'Sumber Dompet', value: wallet.name },
            { label: 'Sisa Anggaran Baru', value: `Rp ${formatIDR(newRemaining)}` }
          ]
        });
      } else {
        if ((Number(selectedBudget.remaining) || 0) < amount) {
          return showToast("Sisa saldo anggaran tidak mencukupi!", "error");
        }
        if (!actionData.note?.trim()) {
          return showToast("Isi rincian/keterangan penggunaan dana!", "error");
        }

        const newRemaining = (Number(selectedBudget.remaining) || 0) - amount;
        const newSpent = (Number(selectedBudget.spent) || 0) + amount;

        if (user.isLocal) {
          setBudgets(prev => prev.map(b => b.id === selectedBudget.id ? { ...b, spent: newSpent, remaining: newRemaining } : b));
          setBudgetLogs(prev => [{
            id: 'bl-' + Date.now(),
            budgetId: selectedBudget.id,
            budgetName: selectedBudget.name,
            type: 'expense',
            amount: amount,
            note: actionData.note.trim(),
            date: actionDate,
            createdAt: Date.now()
          }, ...prev]);
        } else {
          const ownerId = getStorageOwnerId();
          const bRef = doc(db, 'artifacts', appId, 'users', ownerId, 'budgets', selectedBudget.id);
          await updateDoc(bRef, {
            spent: newSpent,
            remaining: newRemaining
          });
          await addDoc(collection(db, 'artifacts', appId, 'users', ownerId, 'budget_logs'), {
            budgetId: selectedBudget.id,
            budgetName: selectedBudget.name,
            type: 'expense',
            amount: amount,
            note: actionData.note.trim(),
            date: actionDate,
            createdAt: Date.now()
          });
        }

        triggerSuccessPopup({
          title: 'Pengeluaran Budget Tercatat!',
          subtitle: actionData.note.trim(),
          amount: amount,
          amountType: 'expense',
          details: [
            { label: 'Pos Anggaran', value: selectedBudget.name },
            { label: 'Rincian', value: actionData.note.trim() },
            { label: 'Sisa Saldo Budget', value: `Rp ${formatIDR(newRemaining)}` }
          ]
        });
      }

      setIsBudgetActionModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast("Gagal memproses transaksi anggaran.", "error");
    }
  };

  const handleDeleteBudgetLog = async (logItem) => {
    if (!user || !selectedBudget) return;
    try {
      const updatedSpent = Math.max(0, (Number(selectedBudget.spent) || 0) - logItem.amount);
      const updatedRemaining = (Number(selectedBudget.remaining) || 0) + logItem.amount;

      if (user.isLocal) {
        if (logItem.type === 'expense') {
          setBudgets(prev => prev.map(b => b.id === selectedBudget.id ? { ...b, spent: updatedSpent, remaining: updatedRemaining } : b));
        }
        setBudgetLogs(prev => prev.filter(l => l.id !== logItem.id));
      } else {
        const ownerId = getStorageOwnerId();
        const bRef = doc(db, 'artifacts', appId, 'users', ownerId, 'budgets', selectedBudget.id);
        if (logItem.type === 'expense') {
          await updateDoc(bRef, {
            spent: updatedSpent,
            remaining: updatedRemaining
          });
        }
        await deleteDoc(doc(db, 'artifacts', appId, 'users', ownerId, 'budget_logs', logItem.id));
      }
      showToast("Riwayat rincian dihapus & saldo anggaran disesuaikan.");
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus riwayat.", "error");
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    if (!user) return;
    try {
      if (user.isLocal) {
        setBudgets(prev => prev.filter(b => b.id !== budgetId));
      } else {
        const ownerId = getStorageOwnerId();
        await deleteDoc(doc(db, 'artifacts', appId, 'users', ownerId, 'budgets', budgetId));
      }
      setSelectedBudgetId(null);
      showToast("Anggaran dihapus.");
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus anggaran.", "error");
    }
  };

  const handleUpdateBudgetStorage = async (storageName) => {
    if (!user || !selectedBudget) return;
    try {
      if (user.isLocal) {
        setBudgets(prev => prev.map(b => b.id === selectedBudget.id ? { ...b, storageForm: storageName } : b));
      } else {
        const ownerId = getStorageOwnerId();
        const bRef = doc(db, 'artifacts', appId, 'users', ownerId, 'budgets', selectedBudget.id);
        await updateDoc(bRef, {
          storageForm: storageName
        });
      }
      showToast(`Bentuk saldo anggaran diatur ke: ${storageName}`);
    } catch (err) {
      console.error(err);
      showToast("Gagal memperbarui bentuk saldo.", "error");
    }
  };

  // 5. Tambah Kategori Kustom
  const handleAddCategory = async (categoryData) => {
    if (!user || !categoryData.name?.trim()) return;
    const savedCatName = categoryData.name.trim();
    const savedCatType = categoryData.type;
    try {
      if (user.isLocal) {
        setCustomCategories(prev => [...prev, {
          id: 'cat-' + Date.now(),
          name: savedCatName,
          type: savedCatType,
          icon: categoryData.icon || 'Tag',
          color: categoryData.color || 'indigo'
        }]);
      } else {
        const ownerId = getStorageOwnerId();
        await addDoc(collection(db, 'artifacts', appId, 'users', ownerId, 'categories'), {
          name: savedCatName,
          type: savedCatType,
          icon: categoryData.icon || 'Tag',
          color: categoryData.color || 'indigo'
        });
      }
      setIsCategoryModalOpen(false);
      triggerSuccessPopup({
        title: 'Kategori Ditambahkan!',
        subtitle: savedCatName,
        amount: null,
        details: [
          { label: 'Nama Kategori', value: savedCatName },
          { label: 'Jenis', value: savedCatType === 'expense' ? 'Pengeluaran' : 'Pemasukan' }
        ]
      });
      return savedCatName;
    } catch (err) {
      console.error(err);
      showToast("Gagal menambah kategori.", "error");
    }
  };

  // 6. Bersihkan Semua Data (Reset Bersih)
  const handleClearAllData = async () => {
    if (!user) return;
    setIsResetting(true);
    try {
      if (user.isLocal) {
        setWallets([]);
        setBudgets([]);
        setTransactions([]);
        setBudgetLogs([]);
        setCustomCategories([]);
        localStorage.removeItem('trakia_wallets');
        localStorage.removeItem('trakia_budgets');
        localStorage.removeItem('trakia_transactions');
        localStorage.removeItem('trakia_budget_logs');
        localStorage.removeItem('trakia_categories');
      } else {
        const ownerId = getStorageOwnerId();
        const deletePromises = [
          ...wallets.map(w => deleteDoc(doc(db, 'artifacts', appId, 'users', ownerId, 'wallets', w.id))),
          ...budgets.map(b => deleteDoc(doc(db, 'artifacts', appId, 'users', ownerId, 'budgets', b.id))),
          ...transactions.map(t => deleteDoc(doc(db, 'artifacts', appId, 'users', ownerId, 'transactions', t.id))),
          ...budgetLogs.map(l => deleteDoc(doc(db, 'artifacts', appId, 'users', ownerId, 'budget_logs', l.id))),
          ...customCategories.map(c => deleteDoc(doc(db, 'artifacts', appId, 'users', ownerId, 'categories', c.id))),
        ];

        await Promise.all(deletePromises);
      }
      setSelectedBudgetId(null);
      setIsConfirmResetOpen(false);
      setIsAdjustModalOpen(false);
      triggerSuccessPopup({
        title: 'Data Berhasil Direset!',
        subtitle: 'Seluruh dompet, anggaran, dan transaksi telah dikosongkan.',
        amount: null,
        details: [
          { label: 'Status', value: 'Siap mulai dari 0' }
        ]
      });
    } catch (err) {
      console.error(err);
      showToast("Gagal membersihkan data.", "error");
    } finally {
      setIsResetting(false);
    }
  };

  const value = {
    user,
    isLoading,
    activeTab,
    setActiveTab,
    currentDate,
    setCurrentDate,
    changeMonth,
    toast,
    showToast,
    hideBalance,
    setHideBalance,
    showBulananInfo,
    setShowBulananInfo,
    successPopup,
    setSuccessPopup,
    triggerSuccessPopup,

    // Data
    wallets,
    budgets,
    transactions,
    budgetLogs,
    customCategories,
    categories,

    // Modals
    isTxModalOpen,
    setIsTxModalOpen,
    isWalletModalOpen,
    setIsWalletModalOpen,
    editingWallet,
    setEditingWallet,
    isBudgetModalOpen,
    setIsBudgetModalOpen,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    selectedBudgetId,
    setSelectedBudgetId,
    selectedBudget,
    selectedBudgetLogs,
    isBudgetActionModalOpen,
    setIsBudgetActionModalOpen,
    budgetActionType,
    setBudgetActionType,
    isAdjustModalOpen,
    setIsAdjustModalOpen,
    isConfirmResetOpen,
    setIsConfirmResetOpen,
    isResetting,

    // Reports filters
    reportChartType,
    setReportChartType,
    reportTableFilter,
    setReportTableFilter,

    // Summaries
    totalWalletBalance,
    totalRemainingBudget,
    totalAllocatedBudget,
    totalSpentBudget,
    currentMonthMainTxs,
    monthlyIncome,
    monthlyExpense,
    monthlyNetFlow,
    categorySummary,
    chartCategories,
    weeklySummary,
    daysInSelectedMonth,
    dailyAverageExpense,
    remainingDaysInMonth,
    safeDailyBudget,
    filteredReportTxs,
    groupedTxs,

    // Actions
    handleAddTx,
    handleSaveWallet,
    handleDeleteWallet,
    handleAddBudget,
    handleBudgetAction,
    handleDeleteBudgetLog,
    handleDeleteBudget,
    handleUpdateBudgetStorage,
    handleAddCategory,
    handleClearAllData
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};

