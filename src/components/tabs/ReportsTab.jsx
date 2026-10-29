import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatIDR, getMonthYearStr, formatShortDate, formatCompactIDR } from '../../utils/formatters';

export const ReportsTab = () => {
  const {
    hideBalance,
    dailyAverageExpense,
    monthlyExpense,
    monthlyIncome,
    currentDate,
    reportChartType,
    setReportChartType,
    chartCategories,
    weeklySummary,
    categorySummary,
    filteredReportTxs,
    reportTableFilter,
    setReportTableFilter
  } = useFinance();

  return (
    <div className="px-5 pt-4 space-y-5">
      {/* 2 Kartu KPI Atas: RATA-RATA HARIAN & TOTAL BULAN INI */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#EFF6FF]/90 border border-blue-100/80 p-4 rounded-[22px]">
          <span className="text-[10px] font-extrabold text-[#1D63DC] uppercase tracking-wider block">
            RATA-RATA HARIAN
          </span>
          <p className="text-lg font-extrabold text-[#0F172A] mt-1">
            {hideBalance ? 'Rp ••••••' : `Rp${formatIDR(dailyAverageExpense)}`}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-4 rounded-[22px]">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            TOTAL BULAN INI
          </span>
          <p className="text-lg font-extrabold text-[#0F172A] mt-1">
            {hideBalance ? 'Rp ••••••' : `Rp${formatIDR(monthlyExpense)}`}
          </p>
        </div>
      </div>

      {/* CHART 1: KOMPOSISI PENGELUARAN / PEMASUKAN */}
      <div className="bg-white p-5 rounded-[26px] border border-slate-100 shadow-[0_6px_25px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            KOMPOSISI {reportChartType === 'expense' ? 'PENGELUARAN' : 'PEMASUKAN'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setReportChartType(reportChartType === 'expense' ? 'income' : 'expense')}
              className="text-xs font-extrabold text-[#1D63DC] hover:underline"
            >
              {getMonthYearStr(currentDate)}
            </button>
          </div>
        </div>

        {/* Switch Kecil Pengeluaran / Pemasukan */}
        <div className="flex bg-slate-50 p-1 rounded-xl text-[11px] font-bold border border-slate-100">
          <button
            onClick={() => setReportChartType('expense')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              reportChartType === 'expense' ? 'bg-white text-[#1D63DC] shadow-sm font-extrabold' : 'text-slate-400'
            }`}
          >
            Pengeluaran
          </button>
          <button
            onClick={() => setReportChartType('income')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              reportChartType === 'income' ? 'bg-white text-[#00C49A] shadow-sm font-extrabold' : 'text-slate-400'
            }`}
          >
            Pemasukan
          </button>
        </div>

        {chartCategories.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Belum ada data {reportChartType === 'expense' ? 'pengeluaran' : 'pemasukan'} di bulan {getMonthYearStr(currentDate)}.
          </div>
        ) : (
          <div className="space-y-5">
            {/* Donut Chart SVG */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#F1F5F9" strokeWidth="4.5" />
                  {(() => {
                    let cumulativePercent = 0;
                    return chartCategories.map((item, idx) => {
                      const strokeDasharray = `${item.exactPercentage} ${100 - item.exactPercentage}`;
                      const strokeDashoffset = 100 - cumulativePercent;
                      cumulativePercent += item.exactPercentage;
                      return (
                        <circle
                          key={idx}
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="transparent"
                          stroke={item.color}
                          strokeWidth="4.5"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                    TOTAL {reportChartType === 'expense' ? 'BELANJA' : 'MASUK'}
                  </span>
                  <span className="text-xs font-extrabold text-[#0F172A] mt-0.5">
                    {hideBalance ? 'Rp ••••••' : `Rp${formatIDR(reportChartType === 'expense' ? monthlyExpense : monthlyIncome)}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Legend Grid 2 Kolom */}
            <div className="bg-slate-50/80 rounded-2xl p-3.5 grid grid-cols-2 gap-2.5">
              {chartCategories.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="text-[11px] font-semibold text-slate-600 truncate">
                    {item.category.split('·')[0].trim()}: <strong className="text-[#0F172A]">{item.percentage}%</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CHART 2: TREN PENGELUARAN 4 MINGGU TERAKHIR */}
      <div className="bg-white p-5 rounded-[26px] border border-slate-100 shadow-[0_6px_25px_rgba(0,0,0,0.04)] space-y-3">
        <div>
          <h3 className="font-extrabold text-[#0F172A] text-sm">Tren Pengeluaran</h3>
          <p className="text-xs text-slate-400">4 Minggu Terakhir ({getMonthYearStr(currentDate)})</p>
        </div>

        {(() => {
          const xs = [35, 118, 202, 285];
          const pts = weeklySummary.weeks.map((w, i) => {
            const ratio = w.expense / weeklySummary.maxVal;
            const y = 92 - ratio * 62;
            return { x: xs[i], y, val: w.expense, label: w.label };
          });
          const pathD = `M ${pts[0].x} ${pts[0].y} C 75 ${pts[0].y}, 75 ${pts[1].y}, ${pts[1].x} ${pts[1].y} C 160 ${pts[1].y}, 160 ${pts[2].y}, ${pts[2].x} ${pts[2].y} C 245 ${pts[2].y}, 245 ${pts[3].y}, ${pts[3].x} ${pts[3].y}`;

          return (
            <div className="pt-2">
              <svg viewBox="0 0 320 125" className="w-full h-36 overflow-visible">
                <line x1="20" y1="92" x2="300" y2="92" stroke="#F1F5F9" strokeWidth="1.5" />
                <path
                  d={pathD}
                  fill="none"
                  stroke="#1D63DC"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {pts.map((p, i) => (
                  <g key={i}>
                    <text
                      x={p.x}
                      y={p.y - 10}
                      textAnchor="middle"
                      className="fill-slate-700 font-extrabold text-[10px]"
                    >
                      {formatCompactIDR(p.val)}
                    </text>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      fill="#FFFFFF"
                      stroke="#1D63DC"
                      strokeWidth="2.5"
                    />
                    <text
                      x={p.x}
                      y="114"
                      textAnchor="middle"
                      className="fill-slate-400 font-bold text-[10px]"
                    >
                      {p.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          );
        })()}
      </div>

      {/* TABEL 1: TABEL RINGKASAN PER KATEGORI */}
      <div className="bg-white rounded-[26px] border border-slate-100 shadow-[0_6px_25px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-extrabold text-[#0F172A] text-sm">Tabel Ringkasan Kategori</h3>
          <p className="text-[11px] text-slate-400">Rekap total pemasukan & pengeluaran per kategori</p>
        </div>

        {categorySummary.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">Belum ada data kategori bulan ini.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-extrabold text-slate-500 uppercase border-b border-slate-100">
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-2 text-center">Jml</th>
                  <th className="py-3 px-4 text-right">Total (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {categorySummary.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <p className="font-bold text-[#0F172A]">{row.category}</p>
                      <span className={`text-[10px] font-bold uppercase ${
                        row.type === 'income' ? 'text-[#00C49A]' : 'text-rose-500'
                      }`}>
                        {row.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-slate-500">{row.count}x</td>
                    <td className={`py-3 px-4 text-right font-extrabold ${
                      row.type === 'income' ? 'text-[#00C49A]' : 'text-rose-600'
                    }`}>
                      {row.type === 'income' ? '+' : '-'}{formatIDR(row.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* TABEL 2: TABEL RINCIAN TRANSAKSI BULANAN */}
      <div className="bg-white rounded-[26px] border border-slate-100 shadow-[0_6px_25px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col gap-3">
          <div>
            <h3 className="font-extrabold text-[#0F172A] text-sm">
              Tabel Semua Transaksi ({getMonthYearStr(currentDate)})
            </h3>
            <p className="text-[11px] text-slate-400">Daftar lengkap pemasukan & pengeluaran bulan ini</p>
          </div>
          <div className="flex gap-1.5">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'income', label: 'Pemasukan' },
              { id: 'expense', label: 'Pengeluaran' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setReportTableFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  reportTableFilter === tab.id
                    ? 'bg-[#1D63DC] text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredReportTxs.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">Tidak ada transaksi untuk filter ini.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-extrabold text-slate-500 uppercase border-b border-slate-100">
                  <th className="py-3 px-3">Tgl</th>
                  <th className="py-3 px-3">Kategori & Catatan</th>
                  <th className="py-3 px-3 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredReportTxs.map((tx) => {
                  const d = new Date(tx.date);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 font-bold text-slate-500 whitespace-nowrap align-top">
                        {formatShortDate(d)}
                      </td>
                      <td className="py-3 px-3 align-top">
                        <p className="font-bold text-[#0F172A]">{tx.category}</p>
                        <p className="text-[11px] text-slate-500">{tx.note}</p>
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-[#EFF6FF] text-[#1D63DC] rounded text-[10px] font-semibold">
                          {tx.walletName || 'Dompet'}
                        </span>
                      </td>
                      <td className={`py-3 px-3 text-right font-extrabold whitespace-nowrap align-top ${
                        tx.type === 'income' ? 'text-[#00C49A]' : 'text-rose-600'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{formatIDR(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50/80 font-extrabold text-xs border-t border-slate-100">
                  <td colSpan={2} className="py-3 px-3 text-slate-700">Total Ditampilkan</td>
                  <td className="py-3 px-3 text-right text-[#0F172A]">
                    Rp {formatIDR(
                      filteredReportTxs.reduce((acc, tx) => acc + (tx.type === 'income' ? tx.amount : -tx.amount), 0)
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsTab;

