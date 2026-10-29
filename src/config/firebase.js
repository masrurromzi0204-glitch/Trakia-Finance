import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 1. Tempelkan isi firebaseConfig ASLI dari website Firebase Anda di sini:
export const firebaseConfig = {
  apiKey: "AIzaSyDDUIYLfHK4GNJHRX8P5A3SZNlHnYdFFVw",
  authDomain: "trakia-finance.firebaseapp.com",
  projectId: "trakia-finance",
  storageBucket: "trakia-finance.firebasestorage.app",
  messagingSenderId: "835064611866",
  appId: "1:835064611866:web:9d1532573b1a21261afda3",
  measurementId: "G-3R43GCZDRP"
};

// 2. Pengecekan otomatis: Hanya aktifkan Firebase jika apiKey sudah diisi dengan benar (bukan "AIzaSy...")
export const isFirebaseConfigured = Boolean(
  firebaseConfig &&
  firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.includes("...")
);

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.warn("Firebase gagal dimuat, beralih ke penyimpanan lokal:", e);
  }
}

export const appId = typeof __app_id !== 'undefined' ? __app_id : 'trakia-finance';
// data di HP dan di Laptop langsung menyatu di satu tempat yang sama.
export const PERSONAL_VAULT_ID = 'trakia-personal-vault-utama';

export { app, auth, db };

