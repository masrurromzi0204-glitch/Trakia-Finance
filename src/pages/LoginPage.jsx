import React, { useState } from 'react';
import { TrakiaCalculatorIcon } from '../components/TrakiaLogo';

// Hardcoded credentials
const VALID_USERNAME = 'akunmanajemenuang_oji';
const VALID_PASSWORD = '020403###';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Username dan password tidak boleh kosong.');
      return;
    }

    setIsLoading(true);
    // Simulasi loading sebentar biar terasa lebih natural
    await new Promise((r) => setTimeout(r, 600));

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      // Simpan session ke localStorage
      localStorage.setItem('trakia_logged_in', 'true');
      onLoginSuccess();
    } else {
      setError('Username atau password salah. Coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: '#F5F0EB',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Card Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '36px 28px 32px',
          boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
        }}
      >
        {/* Logo + Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <TrakiaCalculatorIcon size={44} />
          <div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: '800',
                color: '#0B1528',
                lineHeight: '1.1',
                letterSpacing: '-0.5px',
              }}
            >
              Trakia
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '500', letterSpacing: '0.5px' }}>
              Finance Manager
            </div>
          </div>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: '24px' }}>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: '800',
              color: '#0B1528',
              margin: '0 0 4px',
              letterSpacing: '-0.5px',
            }}
          >
            Log in
          </h1>
          <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
            Masuk untuk mengelola keuangan kamu.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Username Field */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#64748B',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              placeholder="Masukkan username"
              autoComplete="username"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: error ? '1.5px solid #EF4444' : '1.5px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                fontSize: '15px',
                color: '#0B1528',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#F97316'; e.target.style.backgroundColor = '#fff'; }}
              onBlur={(e) => { e.target.style.borderColor = error ? '#EF4444' : '#E2E8F0'; e.target.style.backgroundColor = '#F8FAFC'; }}
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#64748B',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Masukkan password"
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '14px 48px 14px 16px',
                  borderRadius: '12px',
                  border: error ? '1.5px solid #EF4444' : '1.5px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  fontSize: '15px',
                  color: '#0B1528',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#F97316'; e.target.style.backgroundColor = '#fff'; }}
                onBlur={(e) => { e.target.style.borderColor = error ? '#EF4444' : '#E2E8F0'; e.target.style.backgroundColor = '#F8FAFC'; }}
              />
              {/* Toggle show password */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? (
                  // Eye-off icon
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  // Eye icon
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                backgroundColor: '#FEF2F2',
                borderRadius: '10px',
                border: '1px solid #FECACA',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span style={{ fontSize: '13px', color: '#DC2626', fontWeight: '500' }}>{error}</span>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '14px',
              border: 'none',
              backgroundColor: isLoading ? '#FBD0B5' : '#F97316',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: '700',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginTop: '4px',
              transition: 'all 0.2s',
              letterSpacing: '0.2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => { if (!isLoading) e.target.style.backgroundColor = '#120aeaff'; }}
            onMouseLeave={(e) => { if (!isLoading) e.target.style.backgroundColor = '#120aeaff'; }}
          >
            {isLoading ? (
              <>
                <svg style={{ animation: 'spin 1s linear infinite' }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Masuk...
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        {/* Footer note */}
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#CBD5E1', marginTop: '20px', marginBottom: 0 }}>
          Trakia © 2026 · Msxrmz Deploy
        </p>
      </div>

      {/* Spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

