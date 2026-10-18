import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, RefreshCw, HelpCircle } from 'lucide-react';
import { sound } from '../services/soundEffects';
import { getRuntimeConfig, saveRuntimeConfig } from '../services/api';

export default function SettingsModal({ onClose, onConfigUpdated }) {
  const current = getRuntimeConfig();
  const [gasUrl, setGasUrl] = useState(current.gasUrl);
  const [passThreshold, setPassThreshold] = useState(current.passThreshold);
  const [questionCount, setQuestionCount] = useState(current.questionCount);
  const [testStatus, setTestStatus] = useState(null); // 'loading' | 'success' | 'error'
  const [testMessage, setTestMessage] = useState('');

  const handleTestConnection = async () => {
    sound.click();
    if (!gasUrl.trim()) {
      setTestStatus('error');
      setTestMessage('請先輸入 Google Apps Script 網址');
      return;
    }

    setTestStatus('loading');
    setTestMessage('正在測試連線...');

    try {
      const pingUrl = `${gasUrl.trim()}${gasUrl.includes('?') ? '&' : '?'}action=ping&t=${Date.now()}`;
      const res = await fetch(pingUrl);
      const data = await res.json();
      if (data.status === 'ok') {
        setTestStatus('success');
        setTestMessage('連線成功！Google Apps Script 回應正常。');
      } else {
        setTestStatus('error');
        setTestMessage(`回應內容異常: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      setTestStatus('error');
      setTestMessage(`連線失敗: ${err.message} (請檢查是否部署為 Web App 並設定存取權為「所有人」)`);
    }
  };

  const handleSave = () => {
    sound.select();
    saveRuntimeConfig({
      gasUrl: gasUrl.trim(),
      passThreshold: Number(passThreshold) || 3,
      questionCount: Number(questionCount) || 5,
    });
    if (onConfigUpdated) onConfigUpdated();
    onClose();
  };

  const handleClearToEnv = () => {
    sound.click();
    localStorage.removeItem('CYBER_QUIZ_GAS_URL');
    localStorage.removeItem('CYBER_QUIZ_PASS_THRESHOLD');
    localStorage.removeItem('CYBER_QUIZ_QUESTION_COUNT');
    const fresh = getRuntimeConfig();
    setGasUrl(fresh.gasUrl);
    setPassThreshold(fresh.passThreshold);
    setQuestionCount(fresh.questionCount);
    setTestStatus(null);
    setTestMessage('已重置為 .env 原廠預設值');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(5, 8, 15, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="cyber-card" style={{
        maxWidth: '560px',
        width: '100%',
        padding: '30px',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <div className="tech-corner-tl" />
        <div className="tech-corner-tr" />
        <div className="tech-corner-bl" />
        <div className="tech-corner-br" />

        {/* 頂部標題 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
          paddingBottom: '14px',
        }}>
          <h3 className="neon-text-cyan" style={{ fontSize: '1.25rem', letterSpacing: '1px' }}>
            ⚙️ 系統設定 & 環境變數 (.env)
          </h3>
          <button
            onClick={() => {
              sound.click();
              onClose();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* 說明文字 */}
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
          以下參數預設讀取自根目錄 <code style={{ color: 'var(--cyan)' }}>.env</code> 檔案。您也可在此處直接修改或測試 Google Apps Script 連線：
        </p>

        {/* Google Apps Script URL */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--cyan)', marginBottom: '8px', fontFamily: 'var(--font-tech)' }}>
            GOOGLE_APP_SCRIPT_URL (後端 Web App 連結)
          </label>
          <input
            type="text"
            className="cyber-input"
            value={gasUrl}
            onChange={(e) => setGasUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/AKfycb.../exec"
            style={{ fontSize: '0.9rem' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              * 留空則自動啟用內建單機模擬器
            </span>
            <button
              onClick={handleTestConnection}
              type="button"
              style={{
                background: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid var(--cyan)',
                color: 'var(--cyan)',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-tech)',
              }}
            >
              測試連線 (PING)
            </button>
          </div>

          {/* 連線測試狀態回饋 */}
          {testStatus && (
            <div style={{
              marginTop: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: testStatus === 'success' ? 'rgba(16, 185, 129, 0.15)' : testStatus === 'loading' ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 0, 85, 0.15)',
              border: `1px solid ${testStatus === 'success' ? 'var(--green)' : testStatus === 'loading' ? 'var(--cyan)' : 'var(--red)'}`,
              color: testStatus === 'success' ? '#34d399' : testStatus === 'loading' ? 'var(--cyan)' : '#fb7185',
            }}>
              {testStatus === 'success' && <CheckCircle2 size={16} />}
              {testStatus === 'error' && <AlertCircle size={16} />}
              {testStatus === 'loading' && <RefreshCw size={16} className="animate-spin" />}
              <span>{testMessage}</span>
            </div>
          )}
        </div>

        {/* 數值設定兩欄排版 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--cyan)', marginBottom: '8px', fontFamily: 'var(--font-tech)' }}>
              PASS_THRESHOLD (通過門檻)
            </label>
            <input
              type="number"
              min="1"
              max="20"
              className="cyber-input"
              value={passThreshold}
              onChange={(e) => setPassThreshold(e.target.value)}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginTop: '4px' }}>
              需答對幾題才算通關
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--cyan)', marginBottom: '8px', fontFamily: 'var(--font-tech)' }}>
              QUESTION_COUNT (題目總數)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              className="cyber-input"
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginTop: '4px' }}>
              每次遊玩的關卡數量
            </span>
          </div>
        </div>

        {/* Google Sheet 規格速查 */}
        <div style={{
          background: 'rgba(10, 16, 30, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '24px',
          fontSize: '0.82rem',
          color: 'var(--text-dim)',
        }}>
          <div style={{ color: '#fff', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HelpCircle size={15} color="var(--cyan)" />
            <span>Google Sheets 工作表欄位對照</span>
          </div>
          <p>• <b>「題目」</b>：題號、題目、A、B、C、D、解答</p>
          <p>• <b>「回答」</b>：ID、闖關次數、總分、最高分、第一次通關分數、花了幾次通關、最近遊玩時間</p>
          <div style={{ marginTop: '8px', color: 'var(--cyan)' }}>
            * 詳細部署說明請參考專案 <code style={{ color: '#fff' }}>google-apps-script/README.md</code>
          </div>
        </div>

        {/* 底部按鈕 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <button
            type="button"
            className="cyber-btn cyber-btn-secondary"
            onClick={handleClearToEnv}
            style={{ fontSize: '0.85rem', padding: '10px 16px' }}
          >
            重置為 .env
          </button>
          <button
            type="button"
            className="cyber-btn"
            onClick={handleSave}
            style={{ fontSize: '0.85rem', padding: '10px 24px' }}
          >
            儲存並套用
          </button>
        </div>
      </div>
    </div>
  );
}
