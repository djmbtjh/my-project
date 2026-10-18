import React, { useState } from 'react';
import { Play, Sparkles, Target, Award, Database, Cpu } from 'lucide-react';
import { sound } from '../services/soundEffects';
import { ALL_100_BOSSES } from '../services/bossManager';

export default function HomeView({
  userId,
  setUserId,
  onStartGame,
  preloadProgress,
  config
}) {
  const [error, setError] = useState('');
  const [randomBossPreview] = useState(() => (
    [...ALL_100_BOSSES].sort(() => 0.5 - Math.random()).slice(0, 6)
  ));

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = userId.trim();
    if (!trimmed) {
      sound.wrong();
      setError('請輸入特工 ID 才能開始闖關！');
      return;
    }
    setError('');
    sound.select();
    onStartGame(trimmed);
  };

  return (
    <div style={{
      maxWidth: '820px',
      margin: '0 auto',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
    }}>
      {/* 英雄標題區塊 */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: 'rgba(0, 240, 255, 0.1)',
          border: '1px solid var(--cyan)',
          borderRadius: '999px',
          color: 'var(--cyan)',
          fontFamily: 'var(--font-tech)',
          fontSize: '0.85rem',
          marginBottom: '16px',
          boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)',
        }}>
          <Sparkles size={16} />
          <span>CYBER TRIVIA PROTOCOL v2.0</span>
        </div>

        <h1 className="neon-text-cyan" style={{
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          lineHeight: 1.15,
          marginBottom: '14px',
          letterSpacing: '2px',
        }}>
          賽博問答 · 像素關主決戰
        </h1>

        <p style={{
          color: 'var(--text-muted)',
          fontSize: '1.05rem',
          maxWidth: '620px',
          margin: '0 auto',
        }}>
          突破神經網路防火牆，迎戰 100 位具備不同邏輯陣列的像素關主。
          作答結果將自動同步至 Google Sheets 雲端中央試算表。
        </p>
      </div>

      {/* 關主預覽展示列 (DiceBear Pixel-Art) */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '14px',
        flexWrap: 'wrap',
      }}>
        {randomBossPreview.map((boss, idx) => (
          <div
            key={boss.id}
            title={`${boss.title} - ${boss.name}`}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)',
              transform: `translateY(${idx % 2 === 0 ? '-4px' : '4px'})`,
              transition: 'transform 0.3s ease',
            }}
          >
            <img
              src={boss.avatarUrl}
              alt={boss.name}
              className="pixel-boss-avatar"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        ))}
      </div>

      {/* 關主素材預先載入進度條 */}
      <div style={{
        background: 'rgba(13, 19, 34, 0.7)',
        border: '1px solid rgba(0, 240, 255, 0.2)',
        borderRadius: '12px',
        padding: '12px 20px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.85rem',
          fontFamily: 'var(--font-tech)',
          color: 'var(--text-muted)',
          marginBottom: '8px',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cyan)' }}>
            <Cpu size={15} />
            <span>DICEBEAR 100 位像素關主素材預載入</span>
          </span>
          <span style={{ color: preloadProgress.percent === 100 ? '#34d399' : 'var(--cyan)' }}>
            {preloadProgress.loaded} / {preloadProgress.total} ({preloadProgress.percent}%)
          </span>
        </div>
        <div className="hp-bar-bg" style={{ height: '8px' }}>
          <div
            className="hp-bar-fill"
            style={{
              width: `${preloadProgress.percent}%`,
              background: preloadProgress.percent === 100
                ? 'linear-gradient(90deg, #10b981, #00f0ff)'
                : 'linear-gradient(90deg, #00f0ff, #b026ff)',
            }}
          />
        </div>
      </div>

      {/* 主要登入與配置卡片 */}
      <div className="cyber-card" style={{ padding: '36px 30px' }}>
        <div className="tech-corner-tl" />
        <div className="tech-corner-tr" />
        <div className="tech-corner-bl" />
        <div className="tech-corner-br" />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 特工 ID 輸入欄位 */}
          <div>
            <label style={{
              display: 'block',
              fontFamily: 'var(--font-tech)',
              fontSize: '1rem',
              color: 'var(--cyan)',
              marginBottom: '10px',
              letterSpacing: '1px',
            }}>
              請輸入特工 ID (AGENT ID) *
            </label>
            <input
              type="text"
              className="cyber-input"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                if (error) setError('');
              }}
              placeholder="例如：Neo_9527、CyberHunter、Alex..."
              autoFocus
              maxLength={30}
              style={{ padding: '16px 20px', fontSize: '1.15rem' }}
            />
            {error ? (
              <span style={{ color: '#fb7185', fontSize: '0.85rem', display: 'block', marginTop: '6px' }}>
                {error}
              </span>
            ) : (
              <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', display: 'block', marginTop: '6px' }}>
                * 此 ID 將作為 Google Sheets「回答」工作表的獨立辨識鍵，重複通關會累積闖關次數。
              </span>
            )}
          </div>

          {/* 本次任務規格 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            background: 'rgba(10, 16, 30, 0.6)',
            borderRadius: '12px',
            padding: '18px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(0, 240, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cyan)',
              }}>
                <Target size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-tech)' }}>
                  關卡題數 (COUNT)
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                  {config.questionCount} 關連續作答
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
              }}>
                <Award size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-tech)' }}>
                  通關門檻 (THRESHOLD)
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399' }}>
                  需答對 {config.passThreshold} 題以上
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(176, 38, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#c084fc',
              }}>
                <Database size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-tech)' }}>
                  雲端儲存 (STORAGE)
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#c084fc' }}>
                  Google Sheets 即時回傳
                </div>
              </div>
            </div>
          </div>

          {/* 開始遊戲按鈕 */}
          <button
            type="submit"
            className="cyber-btn"
            style={{
              padding: '16px 32px',
              fontSize: '1.15rem',
              letterSpacing: '2px',
              width: '100%',
              marginTop: '8px',
            }}
          >
            <Play size={20} fill="currentColor" />
            <span>開始闖關 · INITIALIZE MISSION</span>
          </button>
        </form>
      </div>
    </div>
  );
}
