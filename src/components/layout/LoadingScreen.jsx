import React from 'react';
import { TrakiaCalculatorIcon } from '../common/TrakiaLogo';

export const LoadingScreen = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-white text-slate-600 font-medium">
      <div className="flex flex-col items-center gap-3">
        <TrakiaCalculatorIcon size={58} />
        <div className="text-center">
          <h1 
            className="text-2xl font-black tracking-tight text-[#1D63DC]" 
            style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
          >
            Trakia
          </h1>
          <p className="text-[11px] font-medium text-slate-500">Your Money Traking</p>
        </div>
        <div className="w-6 h-6 border-3 border-[#1D63DC] border-t-transparent rounded-full animate-spin mt-1"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;

