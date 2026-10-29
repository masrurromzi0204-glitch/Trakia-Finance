import React from 'react';

// Custom SVG Logo Matching "Trakia - Your Money Traking" Image
export const TrakiaCalculatorIcon = ({ size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0 drop-shadow-sm"
  >
    <g transform="rotate(24 32 32)">
      {/* 3D Royal Blue Extrusion / Base Shadow */}
      <rect x="13" y="10" width="40" height="48" rx="9" fill="#1D63DC" />
      {/* Main Deep Navy Body */}
      <rect x="11" y="7" width="40" height="48" rx="9" fill="#0B1528" stroke="#1E293B" strokeWidth="1" />
      {/* Subtle Top-Left Gloss Highlight */}
      <path d="M13 15C13 11.134 16.134 8 20 8H43" stroke="#334155" strokeWidth="1.2" strokeLinecap="round" />

      {/* Calculator Top Screen (3D Royal Blue) */}
      <rect x="16" y="13.5" width="30" height="10" rx="3.5" fill="#1547A6" />
      <rect x="16" y="12" width="30" height="10" rx="3.5" fill="#2563EB" />

      {/* Row 1: 3 Emerald Mint 3D Keys */}
      <rect x="16" y="28" width="8" height="7.5" rx="2.2" fill="#059669" />
      <rect x="16" y="26.5" width="8" height="7.5" rx="2.2" fill="#10B981" />

      <rect x="27" y="28" width="8" height="7.5" rx="2.2" fill="#059669" />
      <rect x="27" y="26.5" width="8" height="7.5" rx="2.2" fill="#10B981" />

      <rect x="38" y="28" width="8" height="7.5" rx="2.2" fill="#059669" />
      <rect x="38" y="26.5" width="8" height="7.5" rx="2.2" fill="#10B981" />

      {/* Row 2: 3 Emerald Mint 3D Keys */}
      <rect x="16" y="40" width="8" height="7.5" rx="2.2" fill="#059669" />
      <rect x="16" y="38.5" width="8" height="7.5" rx="2.2" fill="#10B981" />

      <rect x="27" y="40" width="8" height="7.5" rx="2.2" fill="#059669" />
      <rect x="27" y="38.5" width="8" height="7.5" rx="2.2" fill="#10B981" />

      <rect x="38" y="40" width="8" height="7.5" rx="2.2" fill="#059669" />
      <rect x="38" y="38.5" width="8" height="7.5" rx="2.2" fill="#10B981" />
    </g>
  </svg>
);

export default TrakiaCalculatorIcon;

