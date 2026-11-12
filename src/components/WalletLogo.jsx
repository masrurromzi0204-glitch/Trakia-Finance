import React from 'react';
import { Money, Bank, Wallet } from '@phosphor-icons/react';

const boxClass =
  'w-11 h-11 aspect-square rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-1.5';

export default function WalletLogo({ name = '', type = '' }) {
  const n = (name || '').toLowerCase();
  const t = (type || '').toLowerCase();

  // 1. Cash / Tunai -> Gambar Uang di atas Background Putih 1:1
  if (n.includes('cash') || n.includes('tunai') || t === 'cash') {
    return (
      <div className={boxClass}>
        <Money size={26} weight="fill" className="text-[#00C49A]" />
      </div>
    );
  }

  // 2. BNI (Logo Resmi 1:1 Background Putih)
  if (n.includes('bni') || n.includes('wondr')) {
    return (
      <div className={boxClass}>
        <img src="/logos/bni.png" alt="BNI" className="w-full h-full object-contain" />
      </div>
    );
  }

  // 3. Mandiri / Livin (Logo Resmi 1:1 Background Putih)
  if (n.includes('mandiri') || n.includes('livin')) {
    return (
      <div className={boxClass}>
        <img src="/logos/mandiri.png" alt="Mandiri" className="w-full h-full object-contain" />
      </div>
    );
  }

  // 4. SeaBank (Logo Resmi 1:1 Background Putih)
  if (n.includes('seabank') || n.includes('sea bank') || n === 'sea') {
    return (
      <div className={boxClass}>
        <img src="/logos/seabank.png" alt="SeaBank" className="w-full h-full object-contain" />
      </div>
    );
  }

  // 5. Bank Jago (Logo Resmi 1:1 Background Putih)
  if (n.includes('jago')) {
    return (
      <div className={boxClass}>
        <img src="/logos/jago.png" alt="Bank Jago" className="w-full h-full object-contain" />
      </div>
    );
  }

  // 6. BCA (1:1 Background Putih)
  if (n.includes('bca') && !n.includes('blu')) {
    return (
      <div className={boxClass}>
        <span className="font-black text-[13px] tracking-tighter italic text-[#005BAA]">BCA</span>
      </div>
    );
  }

  // 7. BRI / BRImo (1:1 Background Putih)
  if (n.includes('bri')) {
    return (
      <div className={boxClass}>
        <span className="font-black text-[13px] tracking-tight text-[#00529C]">BRI</span>
      </div>
    );
  }

  // 8. BSI (1:1 Background Putih)
  if (n.includes('bsi') || n.includes('syariah')) {
    return (
      <div className={boxClass}>
        <div className="flex flex-col items-center justify-center">
          <span className="font-black text-[12.5px] leading-none text-[#00A39D]">BSI</span>
          <span className="w-4 h-1 bg-[#F7941D] mt-0.5 rounded-full"></span>
        </div>
      </div>
    );
  }

  // 9. Blu by BCA Digital (1:1 Background Putih)
  if (n.includes('blu')) {
    return (
      <div className={boxClass}>
        <span className="font-black text-[13.5px] tracking-tight lowercase text-[#00C0F3]">blu</span>
      </div>
    );
  }

  // 10. Jenius (1:1 Background Putih)
  if (n.includes('jenius') || n.includes('btpn')) {
    return (
      <div className={boxClass}>
        <span className="font-extrabold text-[10px] tracking-tight text-[#00A4E4]">Jenius</span>
      </div>
    );
  }

  // 11. CIMB Niaga / OCTO (1:1 Background Putih)
  if (n.includes('cimb') || n.includes('octo')) {
    return (
      <div className={boxClass}>
        <span className="font-black text-[11px] tracking-tight text-[#DC143C]">CIMB</span>
      </div>
    );
  }

  // 12. DANA (1:1 Background Putih)
  if (n.includes('dana')) {
    return (
      <div className={boxClass}>
        <span className="font-black text-[11px] tracking-tight text-[#118EEA]">DANA</span>
      </div>
    );
  }

  // 13. GoPay (1:1 Background Putih)
  if (n.includes('gopay') || n.includes('gojek')) {
    return (
      <div className={boxClass}>
        <span className="font-extrabold text-[10.5px] tracking-tight text-[#00AED6]">gopay</span>
      </div>
    );
  }

  // 14. OVO (1:1 Background Putih)
  if (n.includes('ovo')) {
    return (
      <div className={boxClass}>
        <span className="font-black text-[12px] tracking-wide text-[#4C3494]">OVO</span>
      </div>
    );
  }

  // 15. ShopeePay (1:1 Background Putih)
  if (n.includes('shopee') || n.includes('spay')) {
    return (
      <div className={boxClass}>
        <div className="flex flex-col items-center justify-center text-[#EE4D2D]">
          <span className="font-extrabold text-[8.5px] leading-none">Shopee</span>
          <span className="font-black text-[9px] leading-none mt-0.5">Pay</span>
        </div>
      </div>
    );
  }

  // 16. Bibit (1:1 Background Putih)
  if (n.includes('bibit')) {
    return (
      <div className={boxClass}>
        <span className="font-extrabold text-[11px] tracking-tight text-[#19A867]">bibit</span>
      </div>
    );
  }

  // Default untuk kantong lainnya -> 1:1 Background Putih dengan Icon Fill Biru
  return (
    <div className={boxClass}>
      {n.includes('bank') ? (
        <Bank size={22} weight="fill" className="text-[#1D63DC]" />
      ) : (
        <Wallet size={22} weight="fill" className="text-[#1D63DC]" />
      )}
    </div>
  );
}
