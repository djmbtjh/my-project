import React, { useState, useEffect, useCallback } from 'react';
import { Zap, CheckCircle2, XCircle, ShieldCheck, CheckCircle } from 'lucide-react';
import { sound } from '../services/soundEffects';

export default function BattleView({
  currentIndex,
  totalCount,
  currentQuestion,
  onAnswerSelected,
  userAnswers
}) {
  const [selectedOption, setSelectedOption] = useState(() => userAnswers[currentQuestion?.id] || null);
  const [feedback, setFeedback] = useState(null); // null | { isCorrect: boolean, key: string }

  const handleOptionClick = useCallback((key) => {
    if (selectedOption !== null) return;
    setSelectedOption(key);

    const isCorrect = currentQuestion.correctAnswer
      ? key.toUpperCase() === currentQuestion.correctAnswer.toUpperCase()
      : true;

    setFeedback({ isCorrect, key });

    if (isCorrect) {
      sound.correct();
    } else {
      sound.wrong();
    }

    // 停留 1.1 秒讓受測同仁清楚檢視答對或答錯畫面後自動進入下一題
    setTimeout(() => {
      onAnswerSelected(currentQuestion.id, key);
    }, 1100);
  }, [selectedOption, currentQuestion, onAnswerSelected]);

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

  if (!currentQuestion) return null;

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
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(0, 240, 255, 0.25)',
        borderRadius: '12px',
        padding: '12px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} color="var(--cyan)" />
          <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>
            題目 <span style={{ color: 'var(--cyan)' }}>{currentIndex + 1}</span> / {totalCount}
          </span>
        </div>

        {/* 進度長條 */}
        <div style={{ flex: 1, maxWidth: '300px', margin: '0 20px' }}>
          <div className="hp-bar-bg" style={{ height: '8px' }}>
            <div
              className="hp-bar-fill"
              style={{
                width: `${((currentIndex + 1) / totalCount) * 100}%`,
                background: 'linear-gradient(90deg, #00f0ff, #10b981)',
              }}
            />
          </div>
        </div>

        <div style={{
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '4px 10px',
          borderRadius: '6px',
        }}>
          鍵盤快捷鍵: 1-4 / A-D
        </div>
      </div>

      {/* 顯示答對或答錯的畫面 (取代原本關主擂台) */}
      <div className="cyber-card" style={{
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '190px',
        textAlign: 'center',
        position: 'relative',
        background: feedback
          ? (feedback.isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 0, 85, 0.12)')
          : 'rgba(15, 23, 42, 0.7)',
        borderColor: feedback
          ? (feedback.isCorrect ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 0, 85, 0.5)')
          : 'var(--border-neon)',
        transition: 'all 0.3s ease',
      }}>
        <div className="tech-corner-tl" />
        <div className="tech-corner-tr" />
        <div className="tech-corner-bl" />
        <div className="tech-corner-br" />

        {feedback === null ? (
          /* 作答前提示畫面 */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid var(--cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)',
            }}>
              <ShieldCheck size={30} color="var(--cyan)" />
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', letterSpacing: '0.5px' }}>
              職業安全衛生作業守則測驗
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '520px' }}>
              請仔細審視下方題目，點選最符合安全衛生法規與標準作業程序的選項。
            </p>
          </div>
        ) : feedback.isCorrect ? (
          /* 答對畫面 */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.25s ease-out',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '2px solid var(--green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px var(--green)',
            }}>
              <CheckCircle2 size={38} color="#34d399" />
            </div>
            <div style={{
              fontSize: '1.6rem',
              fontWeight: 900,
              color: '#34d399',
              textShadow: '0 0 15px rgba(16, 185, 129, 0.6)',
              letterSpacing: '1px',
            }}>
              ✓ 答對！
            </div>
            <p style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>
              您的作答觀念正確，符合職業安全作業標準！
            </p>
          </div>
        ) : (
          /* 答錯畫面 */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.25s ease-out',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(255, 0, 85, 0.2)',
              border: '2px solid var(--red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px var(--red)',
            }}>
              <XCircle size={38} color="#fb7185" />
            </div>
            <div style={{
              fontSize: '1.6rem',
              fontWeight: 900,
              color: '#fb7185',
              textShadow: '0 0 15px rgba(255, 0, 85, 0.6)',
              letterSpacing: '1px',
            }}>
              ❌ 答錯！
            </div>
            <p style={{ color: '#fff', fontSize: '0.95rem' }}>
              您的回答為【{feedback.key}】，正確解答應為：
              <b style={{ color: '#34d399', marginLeft: '6px' }}>
                【{currentQuestion.correctAnswer}】 {currentQuestion.options?.[currentQuestion.correctAnswer] || ''}
              </b>
            </p>
          </div>
        )}
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
            fontSize: '0.88rem',
            fontWeight: 700,
            color: 'var(--cyan)',
            marginBottom: '8px',
          }}>
            題目 #{currentIndex + 1}
          </div>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            lineHeight: 1.6,
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
