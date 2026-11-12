import React from 'react';
import { Money, Bank, Wallet } from '@phosphor-icons/react';

export default function WalletLogo({ name = '', type = '' }) {
  const n = (name || '').toLowerCase();
  const t = (type || '').toLowerCase();

  // 1. Cash / Tunai -> Gambar Uang (Phosphor Fill)
  if (n.includes('cash') || n.includes('tunai') || t === 'cash') {
    return (
      <div className="w-11 h-11 rounded-2xl bg-[#E6FAF5] text-[#00C49A] flex items-center justify-center shrink-0 border border-emerald-100/80 shadow-xs">
        <Money size={24} weight="fill" />
      </div>
    );
  }

  // 2. BCA
  if (n.includes('bca') && !n.includes('blu')) {
    return (
      <div className="w-11 h-11 rounded-2xl bg-[#005BAA] text-white flex flex-col items-center justify-center shrink-0 shadow-xs px-1">
        <svg viewBox="0 0 64 24" className="w-9 h-4 fill-current">
          <text x="32" y="18" textAnchor="middle" fontWeight="900" fontSize="18" fontStyle="italic" fontFamily="Arial, sans-serif" letterSpacing="-0.5">
            BCA
          </text>
        </svg>
      </div>
    );
  }

  // 3. Mandiri / Livin
  if (n.includes('mandiri') || n.includes('livin')) {
    return (
      <div className="w-11 h-11 rounded-2xl bg-[#003D79] text-white flex flex-col items-center justify-center shrink-0 shadow-xs px-1">
        <span className="font-extrabold text-[9.5px] tracking-tight leading-none text-white">mandiri</span>
        <svg viewBox="0 0 40 8" className="w-7 h-2 mt-0.5">
          <path d="M2 6 C 12 1, 28 1, 38 4" stroke="#FFB700" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    );
  }

  // 4. SeaBank
  if (n.includes('seabank') || n.includes('sea bank') || n === 'sea') {
    return (
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF5722] to-[#FF7043] text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
        <span className="font-black text-[10.5px] leading-none tracking-tight">SeaBank</span>
        <svg viewBox="0 0 36 6" className="w-6 h-1.5 mt-0.5">
          <path d="M2 3 Q 9 0, 18 3 T 34 3" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    );
  }

  // 5. BRI / BRImo
  if (n.includes('bri')) {
    return (
      <div className="w-11 h-11 rounded-2xl bg-[#00529C] text-white flex items-center justify-center shrink-0 shadow-xs">
        <span className="font-black text-[13px] tracking-tight">BRI</span>
      </div>
    );
  }

  // 6. BNI / Wondr
  if (n.includes('bni') || n.includes('wondr')) {
    return (
      <div className="w-11 h-11 rounded-2xl bg-[#006677] text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
        <span className="font-black text-[12.5px] leading-none">BNI</span>
        <span className="w-5 h-1 bg-[#F15A23] mt-0.5 rounded-full"></span>
      </div>
    );
  }

  // 7. BSI (Bank Syariah Indonesia)
  if (n.includes('bsi') || n.includes('syariah')) {
    return (
      <div className="w-11 h-11 rounded-2xl bg-[#00A39D] text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
        <span className="font-black text-[12.5px] leading-none">BSI</span>
        <span className="w-4 h-1 bg-[#F7941D] mt-0.5 rounded-full"></span>
      </div>
    );
  }

  // 8. Bank Jago
  if (n.includes('jago')) {
    return (
      <div className="w-11 h-11 rounded-2xl bg-[#FFB800] text-[#1E1E1E] flex flex-col items-center justify-center shrink-0 shadow-xs">
        <span className="font-black text-[11.5px] tracking-tight leading-none">Jago</span>
      </div>
    );
  }

  // 9. Blu by BCA Digital
  if (n.includes('blu')) {
    return (
      <div className="w-11 h-11 rounded-2xl bg-[#00C0F3] text-white flex items-center justify-center shrink-0 shadow-xs">
        <span className="font-black text-[13.5px] tracking-tight lowercase">blu</span>
      </div>
    );
  }

  // 10. Jenius
  if (n.includes('jenius') || n.includes('btpn')) {
    return (
      <div className="w-11 h-11 rounded-2xl bg-[#00A4E4] text-white flex items-center justify-center shrink-0 shadow-xs">
        <span className="font-extrabold text-[10px] tracking-tight">Jenius</span>
      </div>
    );
  }

  // 11. CIMB Niaga / OCTO
  if (n.includes('cimb') || n.includes('octo')) {
    return (
      <div className="w-11 h-11 rounded-2xl bg-[#DC143C] text-white flex items-center justify-center shrink-0 shadow-xs">
        <span className="font-black text-[11px] tracking-tight">CIMB</span>
      </div>
    );
  }

  // 12. Permata
  if (n.includes('permata')) {
    return (
      <div className="w-11 h-11 rounded-2xl bg-[#008542] text-white flex items-center justify-center shrink-0 shadow-xs">
        <span className="font-extrabold text-[9px] tracking-tight">Permata</span>
      </div>
    );
  }

  // 13. DANA
  if (n.includes('dana')) {
    return (
      <div className="w-11 h-11 rounded-2xl bg-[#118EEA] text-white flex items-center justify-center shrink-0 shadow-xs">
        <span className="font-black text-[11px] tracking-tight">DANA</span>
      </div>
    );
  }

  // 14. GoPay
  if (n.includes('gopay') || n.includes('gojek')) {
    return (
      <div className="w-11 h-11 rounded-2xl bg-[#00AED6] text-white flex items-center justify-center shrink-0 shadow-xs">
        <span className="font-extrabold text-[10.5px] tracking-tight">gopay</span>
      </div>
    );
  }

  // 15. OVO
  if (n.includes('ovo')) {
    return (
      <div className="w-11 h-11 rounded-2xl bg-[#4C3494] text-white flex items-center justify-center shrink-0 shadow-xs">
        <span className="font-black text-[12px] tracking-wide">OVO</span>
      </div>
    );
  }

  // 16. ShopeePay
  if (n.includes('shopee') || n.includes('spay')) {
    return (
      <div className="w-11 h-11 rounded-2xl bg-[#EE4D2D] text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
        <span className="font-extrabold text-[9px] leading-none">Shopee</span>
        <span className="font-black text-[9px] leading-none mt-0.5">Pay</span>
      </div>
    );
  }

  // 17. LinkAja
  if (n.includes('linkaja')) {
    return (
      <div className="w-11 h-11 rounded-2xl bg-[#E31E25] text-white flex items-center justify-center shrink-0 shadow-xs">
        <span className="font-extrabold text-[9.5px] tracking-tight">LinkAja</span>
      </div>
    );
  }

  // 18. Bibit
  if (n.includes('bibit')) {
    return (
      <div className="w-11 h-11 rounded-2xl bg-[#19A867] text-white flex items-center justify-center shrink-0 shadow-xs">
        <span className="font-extrabold text-[11px] tracking-tight">bibit</span>
      </div>
    );
  }

  // Default untuk kantong lainnya -> Phosphor Fill Icon warna biru Home
  return (
    <div className="w-11 h-11 rounded-2xl bg-[#EFF6FF] text-[#1D63DC] flex items-center justify-center shrink-0">
      {n.includes('bank') ? <Bank size={22} weight="fill" /> : <Wallet size={22} weight="fill" />}
    </div>
  );
}
