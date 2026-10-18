import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, XCircle, CheckCircle2, RotateCcw, UserCheck, Sheet, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { sound } from '../services/soundEffects';

export default function ResultView({
  resultData,
  onRestart,
  onSwitchUser
}) {
  const [showDetails, setShowDetails] = useState(true);

  const {
    userId,
    score = 0,
    correctCount = 0,
    totalQuestions = 5,
    passed = false,
    passThreshold = 3,
    timestamp,
    userStats,
    results = [],
    isMock = false,
  } = resultData || {};

  useEffect(() => {
    if (passed) {
      sound.win();
      // 慶祝彩帶特效
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#b026ff', '#10b981', '#f59e0b'],
        });
      } catch {}
    } else {
      sound.lose();
    }
  }, [passed]);

  return (
    <div style={{
      maxWidth: '860px',
      margin: '0 auto',
      padding: '30px 20px 60px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      {/* 結算主卡片 */}
      <div className="cyber-card" style={{
        padding: '36px 28px',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div className="tech-corner-tl" />
        <div className="tech-corner-tr" />
        <div className="tech-corner-bl" />
        <div className="tech-corner-br" />

        {/* 通關狀態徽章 */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 0, 85, 0.2)',
          border: `2px solid ${passed ? 'var(--green)' : 'var(--red)'}`,
          boxShadow: passed ? '0 0 25px var(--green)' : '0 0 25px var(--red)',
        }}>
          {passed ? (
            <Trophy size={36} color="var(--green)" />
          ) : (
            <XCircle size={36} color="var(--red)" />
          )}
        </div>

        <h1 style={{
          fontFamily: 'var(--font-tech)',
          fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
          letterSpacing: '2px',
          color: passed ? '#34d399' : '#fb7185',
          textShadow: passed ? '0 0 15px rgba(16, 185, 129, 0.5)' : '0 0 15px rgba(255, 0, 85, 0.5)',
          marginBottom: '8px',
        }}>
          {passed ? 'MISSION CLEARED // 通關成功！' : 'MISSION FAILED // 未達通關門檻'}
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '28px' }}>
          {passed
            ? `恭喜特工 ${userId}！你成功突破了神經網路陣列，達到了指定標準。`
            : `答對題數未達指定門檻（需答對 ${passThreshold} 題以上），再接再厲！`}
        </p>

        {/* 戰績數據網格 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '14px',
          marginBottom: '28px',
        }}>
          <div style={{
            background: 'rgba(10, 16, 30, 0.8)',
            border: '1px solid rgba(0, 240, 255, 0.25)',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-tech)' }}>
              本次得分
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--cyan)' }}>
              {score} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>分</span>
            </div>
          </div>

          <div style={{
            background: 'rgba(10, 16, 30, 0.8)',
            border: '1px solid rgba(0, 240, 255, 0.25)',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-tech)' }}>
              答對題數
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
              {correctCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>/ {totalQuestions}</span>
            </div>
          </div>

          <div style={{
            background: 'rgba(10, 16, 30, 0.8)',
            border: '1px solid rgba(0, 240, 255, 0.25)',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-tech)' }}>
              通關門檻 (THRESHOLD)
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24' }}>
              {passThreshold} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>題</span>
            </div>
          </div>

          <div style={{
            background: 'rgba(10, 16, 30, 0.8)',
            border: '1px solid rgba(0, 240, 255, 0.25)',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-tech)' }}>
              通關狀態
            </div>
            <div style={{
              fontSize: '1.3rem',
              fontWeight: 800,
              marginTop: '4px',
              color: passed ? '#34d399' : '#fb7185',
            }}>
              {passed ? '✅ 通過' : '❌ 未通過'}
            </div>
          </div>
        </div>

        {/* Google Sheets 「回答」工作表記錄反饋 */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(0, 240, 255, 0.2)',
          borderRadius: '12px',
          padding: '16px 20px',
          textAlign: 'left',
          marginBottom: '28px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-tech)',
              fontSize: '0.9rem',
              color: 'var(--cyan)',
            }}>
              <Sheet size={18} />
              <span>Google Sheets「回答」工作表同步狀態</span>
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              {timestamp}
            </span>
          </div>

          {userStats ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '10px',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '12px',
              borderRadius: '8px',
            }}>
              <div>ID: <b style={{ color: '#fff' }}>{userStats['ID']}</b></div>
              <div>闖關次數: <b style={{ color: 'var(--cyan)' }}>{userStats['闖關次數']}</b></div>
              <div>累計總分: <b style={{ color: '#fff' }}>{userStats['總分']}</b></div>
              <div>最高分: <b style={{ color: '#34d399' }}>{userStats['最高分']}</b></div>
              <div>第一次通關分數: <b style={{ color: '#fbbf24' }}>{userStats['第一次通關分數'] || '尚未通關'}</b></div>
              <div>花了幾次通關: <b style={{ color: '#fff' }}>{userStats['花了幾次通關'] || '-'}</b></div>
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: '#34d399' }}>
              ✓ 作答紀錄已傳送至 Google Apps Script 雲端試算表更新完畢。
            </div>
          )}

          {isMock && (
            <div style={{
              marginTop: '10px',
              fontSize: '0.8rem',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <AlertTriangle size={14} />
              <span>注意：目前為單機模擬模式，資料已存於本地快取。部署 GAS 後可直接記錄至真實雲端試算表。</span>
            </div>
          )}
        </div>

        {/* 操作按鈕組 */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          justifyContent: 'center',
        }}>
          <button
            type="button"
            className="cyber-btn"
            onClick={onRestart}
            style={{ padding: '14px 28px' }}
          >
            <RotateCcw size={18} />
            <span>再次挑戰 (PLAY AGAIN)</span>
          </button>

          <button
            type="button"
            className="cyber-btn cyber-btn-secondary"
            onClick={onSwitchUser}
            style={{ padding: '14px 24px' }}
          >
            <UserCheck size={18} />
            <span>更換特工 ID</span>
          </button>
        </div>
      </div>

      {/* 逐題解析與對比 (Review List) */}
      <div className="cyber-card" style={{ padding: '24px' }}>
        <div className="tech-corner-tl" />
        <div className="tech-corner-tr" />
        <div className="tech-corner-bl" />
        <div className="tech-corner-br" />

        <div
          onClick={() => setShowDetails(!showDetails)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <h3 className="neon-text-cyan" style={{ fontSize: '1.1rem' }}>
            📊 關卡作答詳細戰報 ({correctCount} / {totalQuestions})
          </h3>
          <button
            type="button"
            style={{ background: 'transparent', border: 'none', color: 'var(--cyan)', cursor: 'pointer' }}
          >
            {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {showDetails && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
            {results.map((item, idx) => (
              <div
                key={item.id || idx}
                style={{
                  background: 'rgba(10, 16, 30, 0.75)',
                  border: `1px solid ${item.isCorrect ? 'rgba(16, 185, 129, 0.35)' : 'rgba(255, 0, 85, 0.35)'}`,
                  borderRadius: '10px',
                  padding: '16px',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}>
                  <span style={{ fontFamily: 'var(--font-tech)', fontSize: '0.8rem', color: 'var(--cyan)' }}>
                    STAGE {idx + 1}
                  </span>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: item.isCorrect ? '#34d399' : '#fb7185',
                  }}>
                    {item.isCorrect ? (
                      <>
                        <CheckCircle2 size={15} /> 答對 (+{Math.round(100 / totalQuestions)}分)
                      </>
                    ) : (
                      <>
                        <XCircle size={15} /> 答錯
                      </>
                    )}
                  </span>
                </div>

                <div style={{ fontWeight: 600, color: '#fff', marginBottom: '10px' }}>
                  {item.question}
                </div>

                <div style={{
                  display: 'flex',
                  gap: '16px',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-tech)',
                }}>
                  <div style={{ color: item.isCorrect ? '#34d399' : '#fb7185' }}>
                    你的回答：<b>{item.userAnswer}</b> {item.options?.[item.userAnswer] ? `(${item.options[item.userAnswer]})` : ''}
                  </div>
                  {!item.isCorrect && (
                    <div style={{ color: '#34d399' }}>
                      正確解答：<b>{item.correctAnswer}</b> {item.options?.[item.correctAnswer] ? `(${item.options[item.correctAnswer]})` : ''}
                    </div>
                  )}
                </div>

                {item.explanation && (
                  <div style={{
                    marginTop: '8px',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '6px 10px',
                    borderRadius: '6px',
                  }}>
                    💡 {item.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
