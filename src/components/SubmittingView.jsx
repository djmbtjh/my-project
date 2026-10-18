import React from 'react';
import { Loader2, Database } from 'lucide-react';

export default function SubmittingView({ userId, userName, isMock }) {
  return (
    <div style={{
      maxWidth: '600px',
      margin: '80px auto',
      padding: '40px 24px',
      textAlign: 'center',
    }}>
      <div className="cyber-card" style={{ padding: '50px 30px' }}>
        <div className="tech-corner-tl" />
        <div className="tech-corner-tr" />
        <div className="tech-corner-bl" />
        <div className="tech-corner-br" />

        <div style={{
          position: 'relative',
          width: '80px',
          height: '80px',
          margin: '0 auto 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px dashed var(--cyan)',
            animation: 'spin 4s linear infinite',
          }} />
          <Loader2 size={40} color="var(--cyan)" className="animate-spin" />
        </div>

        <h2 className="neon-text-cyan" style={{ fontSize: '1.5rem', marginBottom: '12px' }}>
          計算分數中...
        </h2>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
          正在核對作答數據，並同步上傳資料庫...
        </p>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(0, 240, 255, 0.1)',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          padding: '8px 20px',
          borderRadius: '999px',
          fontSize: '0.9rem',
          fontFamily: 'var(--font-sans)',
          color: 'var(--cyan)',
        }}>
          <Database size={16} />
          <span>員工ID: {userId}{userName ? ` (${userName})` : ''} · {isMock ? '本機模擬寫入' : '雲端 GAS 寫入'}</span>
        </div>
      </div>
    </div>
  );
}
