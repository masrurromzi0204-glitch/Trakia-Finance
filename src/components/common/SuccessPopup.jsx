import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { formatIDR } from '../../utils/formatters';

export const SuccessPopup = ({ successPopup, onClose }) => {
  if (!successPopup) return null;

  return (
    <div 
      onClick={onClose}
      className="absolute inset-0 bg-black/45 backdrop-blur-[2px] z-[95] flex items-center justify-center p-5 animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-xs rounded-[30px] p-6 shadow-2xl text-center space-y-4 border border-slate-100 animate-in zoom-in-95 duration-200"
      >
        {/* Animated Checkmark Badge */}
        <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#E6FAF5] rounded-full animate-ping opacity-50"></div>
          <div className="relative w-16 h-16 bg-[#E6FAF5] text-[#00C49A] rounded-full flex items-center justify-center shadow-inner">
            <CheckCircle2 size={36} strokeWidth={2.5} />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1">
          <h3 className="text-lg font-extrabold text-[#0F172A]">{successPopup.title}</h3>
          {successPopup.subtitle && (
            <p className="text-xs font-medium text-slate-500 line-clamp-2">{successPopup.subtitle}</p>
          )}
        </div>

        {/* Nominal Highlight */}
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

        {/* Summary Detail Rows */}
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

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 bg-gradient-to-r from-[#1D63DC] to-[#0EA5E9] hover:opacity-95 active:scale-95 text-white rounded-2xl font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all"
        >
          Oke, Mengerti
        </button>
      </div>
    </div>
  );
};

export default SuccessPopup;

