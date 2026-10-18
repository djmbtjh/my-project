import React from 'react';
import { Volume2, VolumeX, Settings, Shield, Database, Radio } from 'lucide-react';
import { sound } from '../services/soundEffects';

export default function Navbar({
  userId,
  isMock,
  isMuted,
  onToggleMute,
  onOpenSettings,
  onResetGame
}) {
  return (
    <header style={{
      position: 'relative',
      zIndex: 20,
      borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
      background: 'rgba(6, 9, 17, 0.85)',
      backdropFilter: 'blur(12px)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* 標題與 Logo */}
      <div
        onClick={onResetGame}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #00f0ff, #b026ff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
        }}>
          <Shield size={20} color="#050b14" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-tech)',
            fontWeight: 800,
            fontSize: '1.15rem',
            letterSpacing: '1.5px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            CYBER QUIZ <span style={{ color: 'var(--cyan)', fontSize: '0.85rem' }}>// 賽博闖關戰</span>
          </div>
        </div>
      </div>

      {/* 右側狀態與操作 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* 使用者 ID 徽章 */}
        {userId && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-tech)',
          }}>
            <span style={{ color: 'var(--cyan)' }}>AGENT:</span>
            <span style={{ color: '#fff', fontWeight: 700 }}>{userId}</span>
          </div>
        )}

        {/* 連線狀態徽章 */}
        <div
          onClick={onOpenSettings}
          title={isMock ? '目前為單機測試模擬模式，點擊可配置 Google Apps Script URL' : '已連線 Google Apps Script'}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-tech)',
            fontWeight: 600,
            background: isMock ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${isMock ? 'var(--amber)' : 'var(--green)'}`,
            color: isMock ? '#fbbf24' : '#34d399',
            transition: 'all 0.2s',
          }}
        >
          {isMock ? (
            <>
              <Radio size={14} className="animate-pulse" />
              <span>本機模擬模式</span>
            </>
          ) : (
            <>
              <Database size={14} />
              <span>GAS 連線中</span>
            </>
          )}
        </div>

        {/* 音效開關按鈕 */}
        <button
          onClick={() => {
            sound.click();
            onToggleMute();
          }}
          title={isMuted ? '開啟音效' : '關閉音效'}
          style={{
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: '8px',
            color: isMuted ? 'var(--text-dim)' : 'var(--cyan)',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* 設定按鈕 */}
        <button
          onClick={() => {
            sound.click();
            onOpenSettings();
          }}
          title="環境變數與連線設定"
          style={{
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: '8px',
            color: '#fff',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
