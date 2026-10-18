import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BackgroundGrid from './components/BackgroundGrid';
import SettingsModal from './components/SettingsModal';
import HomeView from './components/HomeView';
import BattleView from './components/BattleView';
import SubmittingView from './components/SubmittingView';
import ResultView from './components/ResultView';

import { sound } from './services/soundEffects';
import { bossPreloader } from './services/bossManager';
import { getRuntimeConfig, fetchQuestions, submitAnswers } from './services/api';

export default function App() {
  const [view, setView] = useState('HOME'); // 'HOME' | 'FETCHING' | 'BATTLE' | 'SUBMITTING' | 'RESULT'
  const [userId, setUserId] = useState(() => localStorage.getItem('CYBER_QUIZ_LAST_ID') || '');
  const [config, setConfig] = useState(getRuntimeConfig());
  const [isMuted, setIsMuted] = useState(sound.isMuted());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 100 位關主素材預載入狀態
  const [preloadProgress, setPreloadProgress] = useState({ loaded: 0, total: 100, percent: 0 });

  // 闖關狀態
  const [questions, setQuestions] = useState([]);
  const [stageBosses, setStageBosses] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [resultData, setResultData] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // 啟動時預載入 100 張 DiceBear 關主素材
  useEffect(() => {
    bossPreloader.preloadAll((loaded, total, percent) => {
      setPreloadProgress({ loaded, total, percent });
    });
  }, []);

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const handleConfigUpdated = () => {
    setConfig(getRuntimeConfig());
  };

  // 開始遊戲流程 (撈取題目並分配關主)
  const handleStartGame = async (validUserId) => {
    setUserId(validUserId);
    localStorage.setItem('CYBER_QUIZ_LAST_ID', validUserId);
    setView('FETCHING');
    setFetchError(null);
    setUserAnswers({});
    setCurrentIndex(0);

    try {
      const qCount = config.questionCount || 5;
      const res = await fetchQuestions(qCount);
      
      if (!res.questions || res.questions.length === 0) {
        throw new Error('未取得任何題目，請確認試算表「題目」工作表內有題目資料。');
      }

      // 為每一關隨機挑選 1 位不重複的 Pixel 關主
      const bosses = bossPreloader.pickRandomBosses(res.questions.length);

      setQuestions(res.questions);
      setStageBosses(bosses);
      setView('BATTLE');
    } catch (err) {
      sound.wrong();
      setFetchError(err.message);
      setView('HOME');
    }
  };

  // 處理單題作答選中
  const handleAnswerSelected = (questionId, optionKey) => {
    const updated = { ...userAnswers, [questionId]: optionKey };
    setUserAnswers(updated);

    if (currentIndex + 1 < questions.length) {
      // 進入下一關
      setCurrentIndex(prev => prev + 1);
    } else {
      // 完成所有題目，送交結算
      handleFinishQuiz(updated);
    }
  };

  // 結算作答並傳送至 Google Apps Script
  const handleFinishQuiz = async (finalAnswers) => {
    setView('SUBMITTING');

    try {
      const result = await submitAnswers({
        userId,
        answers: finalAnswers,
        passThreshold: config.passThreshold || 3,
      });

      setResultData(result);
      setView('RESULT');
    } catch (err) {
      console.error('結算傳送失敗：', err);
      setView('RESULT');
    }
  };

  const handleRestart = () => {
    sound.select();
    handleStartGame(userId);
  };

  const handleSwitchUser = () => {
    sound.click();
    setView('HOME');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <BackgroundGrid showScanlines={true} />

      <Navbar
        userId={userId}
        isMock={config.isMock}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetGame={() => setView('HOME')}
      />

      {/* 錯誤警告條 */}
      {fetchError && (
        <div style={{
          background: 'rgba(255, 0, 85, 0.2)',
          borderBottom: '1px solid var(--red)',
          color: '#fb7185',
          padding: '10px 24px',
          textAlign: 'center',
          fontSize: '0.9rem',
          position: 'relative',
          zIndex: 30,
        }}>
          ⚠️ 載入失敗：{fetchError}
        </div>
      )}

      {/* 主要內容路由 */}
      <main style={{ flex: 1, position: 'relative', zIndex: 10 }}>
        {view === 'HOME' && (
          <HomeView
            userId={userId}
            setUserId={setUserId}
            onStartGame={handleStartGame}
            preloadProgress={preloadProgress}
            config={config}
          />
        )}

        {view === 'FETCHING' && (
          <div style={{
            maxWidth: '500px',
            margin: '100px auto',
            textAlign: 'center',
            padding: '30px',
          }}>
            <div className="cyber-card" style={{ padding: '40px 20px' }}>
              <div className="tech-corner-tl" />
              <div className="tech-corner-tr" />
              <div className="tech-corner-bl" />
              <div className="tech-corner-br" />
              <h3 className="neon-text-cyan" style={{ fontSize: '1.3rem', marginBottom: '12px' }}>
                連線題庫中...
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                正在從 Google Sheets 隨機抽取 {config.questionCount} 道關卡題目...
              </p>
            </div>
          </div>
        )}

        {view === 'BATTLE' && (
          <BattleView
            key={currentIndex}
            currentIndex={currentIndex}
            totalCount={questions.length}
            currentQuestion={questions[currentIndex]}
            currentBoss={stageBosses[currentIndex]}
            onAnswerSelected={handleAnswerSelected}
            userAnswers={userAnswers}
          />
        )}

        {view === 'SUBMITTING' && (
          <SubmittingView userId={userId} isMock={config.isMock} />
        )}

        {view === 'RESULT' && (
          <ResultView
            resultData={resultData}
            onRestart={handleRestart}
            onSwitchUser={handleSwitchUser}
          />
        )}
      </main>

      {/* 底部 HUD 狀態欄 */}
      <footer style={{
        borderTop: '1px solid rgba(0, 240, 255, 0.1)',
        background: 'rgba(6, 9, 17, 0.8)',
        padding: '12px 24px',
        fontSize: '0.75rem',
        fontFamily: 'var(--font-tech)',
        color: 'var(--text-dim)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 20,
      }}>
        <div>CYBER QUIZ BATTLE // REACT VITE + GOOGLE APPS SCRIPT</div>
        <div>100 PIXEL BOSSES ARCHIVE // DICEBEAR API</div>
      </footer>

      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          onConfigUpdated={handleConfigUpdated}
        />
      )}
    </div>
  );
}
