import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const Toast = ({ toast }) => {
  if (!toast) return null;

  return (
    <div className="absolute top-4 left-4 right-4 z-[90] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg bg-[#0F172A] text-white text-sm font-medium animate-in fade-in slide-in-from-top-5">
      {toast.type === 'error' ? (
        <AlertCircle size={18} className="text-rose-400 shrink-0" />
      ) : (
        <CheckCircle2 size={18} className="text-[#00C49A] shrink-0" />
      )}
      <span className="flex-1">{toast.message}</span>
    </div>
  );
};

export default Toast;

