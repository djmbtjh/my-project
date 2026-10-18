import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Skull, CheckCircle } from 'lucide-react';
import { sound } from '../services/soundEffects';

export default function BattleView({
  currentIndex,
  totalCount,
  currentQuestion,
  currentBoss,
  onAnswerSelected,
  userAnswers
}) {
  const [selectedOption, setSelectedOption] = useState(() => userAnswers[currentQuestion?.id] || null);
  const [isBossHurt, setIsBossHurt] = useState(false);
  const [bossHp, setBossHp] = useState(100);
  const [bossDialogue, setBossDialogue] = useState(currentBoss?.taunt || '你通不過我的防火牆！');

  const handleOptionClick = useCallback((key) => {
    if (selectedOption !== null) return;
    setSelectedOption(key);

    // 觸發音效與關主受擊動畫
    sound.bossHit();
    setIsBossHurt(true);
    setBossHp(20);
    setBossDialogue(currentBoss?.hurtQuote || '系統遭受衝擊！');

    setTimeout(() => {
      onAnswerSelected(currentQuestion.id, key);
    }, 450);
  }, [selectedOption, currentBoss, currentQuestion, onAnswerSelected]);

  // 支援鍵盤快速鍵 (1/2/3/4 或 A/B/C/D)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedOption !== null) return;
      const key = e.key.toUpperCase();
      let picked = null;
      if (key === '1' || key === 'A') picked = 'A';
      else if (key === '2' || key === 'B') picked = 'B';
      else if (key === '3' || key === 'C') picked = 'C';
      else if (key === '4' || key === 'D') picked = 'D';

      if (picked && currentQuestion?.options?.[picked]) {
        handleOptionClick(picked);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOption, currentQuestion, handleOptionClick]);

  if (!currentQuestion || !currentBoss) return null;

  const optionsList = [
    { key: 'A', text: currentQuestion.options?.A },
    { key: 'B', text: currentQuestion.options?.B },
    { key: 'C', text: currentQuestion.options?.C },
    { key: 'D', text: currentQuestion.options?.D },
  ];

  return (
    <div style={{
      maxWidth: '920px',
      margin: '0 auto',
      padding: '24px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      {/* 頂部進度列 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid rgba(0, 240, 255, 0.2)',
        borderRadius: '12px',
        padding: '12px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} color="var(--cyan)" />
          <span style={{ fontFamily: 'var(--font-tech)', fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
            STAGE <span style={{ color: 'var(--cyan)' }}>{currentIndex + 1}</span> / {totalCount}
          </span>
        </div>

        {/* 進度長條 */}
        <div style={{ flex: 1, maxWidth: '280px', margin: '0 20px' }}>
          <div className="hp-bar-bg" style={{ height: '6px' }}>
            <div
              className="hp-bar-fill"
              style={{
                width: `${((currentIndex + 1) / totalCount) * 100}%`,
                background: 'linear-gradient(90deg, #00f0ff, #b026ff)',
              }}
            />
          </div>
        </div>

        <div style={{
          fontSize: '0.8rem',
          fontFamily: 'var(--font-tech)',
          color: 'var(--text-muted)',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '4px 10px',
          borderRadius: '6px',
        }}>
          鍵盤快捷鍵: 1-4 / A-D
        </div>
      </div>

      {/* 關主競技擂台區塊 (Boss Arena) */}
      <div className="cyber-card" style={{
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}>
        <div className="tech-corner-tl" />
        <div className="tech-corner-tr" />
        <div className="tech-corner-bl" />
        <div className="tech-corner-br" />

        {/* 關主頭銜與名稱 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
        }}>
          <span style={{
            fontFamily: 'var(--font-tech)',
            fontSize: '0.8rem',
            background: 'rgba(176, 38, 255, 0.2)',
            border: '1px solid var(--purple)',
            color: '#c084fc',
            padding: '2px 10px',
            borderRadius: '4px',
          }}>
            LV.{currentBoss.level} BOSS
          </span>
          <span style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '1px',
          }}>
            {currentBoss.title} · <span style={{ color: 'var(--cyan)' }}>{currentBoss.name}</span>
          </span>
        </div>

        {/* 關主對話氣泡 */}
        <div className="boss-bubble" style={{ marginBottom: '16px' }}>
          "{bossDialogue}"
        </div>

        {/* 關主像素頭像 (帶有懸浮與受擊震動效果) */}
        <div style={{
          position: 'relative',
          width: '160px',
          height: '160px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '10px 0 20px',
        }}>
          {/* 地面科技光環 */}
          <div style={{
            position: 'absolute',
            bottom: '-12px',
            width: '150px',
            height: '30px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(0, 240, 255, 0.4) 0%, transparent 70%)',
            transform: 'rotateX(60deg)',
            pointerEvents: 'none',
          }} />

          <img
            src={currentBoss.avatarUrl}
            alt={currentBoss.name}
            className={`pixel-boss-avatar ${isBossHurt ? 'boss-damaged' : 'boss-float'}`}
            style={{
              width: '140px',
              height: '140px',
              userSelect: 'none',
            }}
          />
        </div>

        {/* 關主血條 */}
        <div style={{ width: '100%', maxWidth: '340px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-tech)',
            marginBottom: '4px',
            color: 'var(--text-muted)',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Skull size={13} color="var(--red)" />
              <span>BOSS HP</span>
            </span>
            <span style={{ color: bossHp < 30 ? 'var(--red)' : '#34d399' }}>
              {bossHp}%
            </span>
          </div>
          <div className="hp-bar-bg">
            <div
              className="hp-bar-fill"
              style={{
                width: `${bossHp}%`,
                background: bossHp < 30
                  ? 'linear-gradient(90deg, #ff0055, #f43f5e)'
                  : 'linear-gradient(90deg, #10b981, #00f0ff)',
              }}
            />
          </div>
        </div>
      </div>

      {/* 題目與選項作答區 (Question & Options) */}
      <div className="cyber-card" style={{ padding: '30px' }}>
        <div className="tech-corner-tl" />
        <div className="tech-corner-tr" />
        <div className="tech-corner-bl" />
        <div className="tech-corner-br" />

        {/* 題目描述 */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '0.85rem',
            fontFamily: 'var(--font-tech)',
            color: 'var(--cyan)',
            marginBottom: '8px',
          }}>
            QUESTION #{currentIndex + 1}
          </div>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            lineHeight: 1.5,
            color: '#fff',
          }}>
            {currentQuestion.question}
          </h2>
        </div>

        {/* 選項清單 (A, B, C, D) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '14px',
        }}>
          {optionsList.map(({ key, text }) => {
            const isSelected = selectedOption === key;
            return (
              <button
                key={key}
                type="button"
                className={`option-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => handleOptionClick(key)}
                disabled={selectedOption !== null}
              >
                <div className="option-badge">
                  {key}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 500, flex: 1 }}>
                  {text}
                </div>
                {isSelected && (
                  <CheckCircle size={20} color="var(--cyan)" style={{ flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
