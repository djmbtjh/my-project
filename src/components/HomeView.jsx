import React, { useState } from 'react';
import { Play, Sparkles, Target, Award, User, Hash } from 'lucide-react';
import { sound } from '../services/soundEffects';

export default function HomeView({
  userId,
  setUserId,
  userName,
  setUserName,
  onStartGame,
  config
}) {
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmedId = userId.trim();
    const trimmedName = userName.trim();

    if (!trimmedId) {
      sound.wrong();
      setError('請輸入員工編號！');
      return;
    }
    if (!trimmedName) {
      sound.wrong();
      setError('請輸入員工姓名！');
      return;
    }

    setError('');
    sound.select();
    onStartGame(trimmedId, trimmedName);
  };

  return (
    <div style={{
      maxWidth: '760px',
      margin: '0 auto',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '30px',
    }}>
      {/* 標題與說明區塊 */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 18px',
          background: 'rgba(0, 240, 255, 0.1)',
          border: '1px solid var(--cyan)',
          borderRadius: '999px',
          color: 'var(--cyan)',
          fontWeight: 600,
          fontSize: '0.9rem',
          marginBottom: '16px',
          boxShadow: '0 0 15px rgba(0, 240, 255, 0.25)',
        }}>
          <Sparkles size={16} />
          <span>樹億興業股份有限公司</span>
        </div>

        <h1 className="neon-text-cyan" style={{
          fontSize: 'clamp(1.8rem, 4.5vw, 2.7rem)',
          lineHeight: 1.2,
          marginBottom: '14px',
          letterSpacing: '1.5px',
        }}>
          職業安全衛生訓練 · 宣導後測驗
        </h1>

        <p style={{
          color: 'var(--text-muted)',
          fontSize: '1rem',
          maxWidth: '620px',
          margin: '0 auto',
          lineHeight: 1.7,
        }}>
          歡迎參與新進員工職業安全衛生教育訓練。本測驗旨在確認同仁確實掌握各項安全作業規範與緊急應變知識，作答成果將自動列入訓練考核記錄。
        </p>
      </div>

      {/* 主要登入與配置卡片 */}
      <div className="cyber-card" style={{ padding: '36px 30px' }}>
        <div className="tech-corner-tl" />
        <div className="tech-corner-tr" />
        <div className="tech-corner-bl" />
        <div className="tech-corner-br" />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* 員工編號輸入欄位 */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-sans)',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--cyan)',
              marginBottom: '8px',
            }}>
              <Hash size={18} />
              <span>請輸入員工編號 *</span>
            </label>
            <input
              type="text"
              className="cyber-input"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                if (error) setError('');
              }}
              placeholder="例如：SY-202601、A1001..."
              autoFocus
              maxLength={30}
              style={{ padding: '14px 18px', fontSize: '1.05rem' }}
            />
            <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', display: 'block', marginTop: '6px' }}>
              必填，請輸入正確員工編號
            </span>
          </div>

          {/* 員工姓名輸入欄位 */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-sans)',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--cyan)',
              marginBottom: '8px',
            }}>
              <User size={18} />
              <span>請輸入員工姓名 *</span>
            </label>
            <input
              type="text"
              className="cyber-input"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                if (error) setError('');
              }}
              placeholder="例如：王小明、陳志偉..."
              maxLength={30}
              style={{ padding: '14px 18px', fontSize: '1.05rem' }}
            />
            <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', display: 'block', marginTop: '6px' }}>
              必填，請輸入正確姓名
            </span>
          </div>

          {error && (
            <div style={{
              background: 'rgba(255, 0, 85, 0.15)',
              border: '1px solid var(--red)',
              color: '#fb7185',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.88rem',
            }}>
              {error}
            </div>
          )}

          {/* 本次測驗規格 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            background: 'rgba(10, 16, 30, 0.6)',
            borderRadius: '12px',
            padding: '18px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                background: 'rgba(0, 240, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cyan)',
              }}>
                <Target size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '0.5px' }}>
                  題目數量
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                  {config.questionCount || 40}題
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
              }}>
                <Award size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '0.5px' }}>
                  通過門檻
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>
                  80分以上
                </div>
              </div>
            </div>
          </div>

          {/* 開始測驗按鈕 */}
          <button
            type="submit"
            className="cyber-btn"
            style={{
              padding: '16px 32px',
              fontSize: '1.15rem',
              letterSpacing: '1px',
              width: '100%',
              marginTop: '4px',
            }}
          >
            <Play size={20} fill="currentColor" />
            <span>開始測驗 · START QUIZ</span>
          </button>
        </form>
      </div>
    </div>
  );
}
