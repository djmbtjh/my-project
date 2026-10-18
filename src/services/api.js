/**
 * API 服務模組
 * 負責與 Google Apps Script (GAS) 後端進行通訊
 * 若未設定 GOOGLE_APP_SCRIPT_URL 則自動進入高品質的「本機模擬連線模式」
 */

const metaEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
const ENV_GAS_URL = metaEnv.VITE_GOOGLE_APP_SCRIPT_URL || metaEnv.GOOGLE_APP_SCRIPT_URL || '';
const ENV_PASS_THRESHOLD = Number(metaEnv.VITE_PASS_THRESHOLD || metaEnv.PASS_THRESHOLD || 3);
const ENV_QUESTION_COUNT = Number(metaEnv.VITE_QUESTION_COUNT || metaEnv.QUESTION_COUNT || 5);

// 支援在遊戲介面中即時測試自訂 GAS URL
export function getRuntimeConfig() {
  const getStorage = (k) => (typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null);
  const localUrl = getStorage('CYBER_QUIZ_GAS_URL');
  const localPass = getStorage('CYBER_QUIZ_PASS_THRESHOLD');
  const localCount = getStorage('CYBER_QUIZ_QUESTION_COUNT');

  return {
    gasUrl: localUrl !== null ? localUrl : ENV_GAS_URL,
    passThreshold: localPass ? Number(localPass) : ENV_PASS_THRESHOLD,
    questionCount: localCount ? Number(localCount) : ENV_QUESTION_COUNT,
    isMock: !(localUrl !== null ? localUrl : ENV_GAS_URL).trim(),
  };
}

export function saveRuntimeConfig({ gasUrl, passThreshold, questionCount }) {
  if (gasUrl !== undefined) localStorage.setItem('CYBER_QUIZ_GAS_URL', gasUrl.trim());
  if (passThreshold !== undefined) localStorage.setItem('CYBER_QUIZ_PASS_THRESHOLD', String(passThreshold));
  if (questionCount !== undefined) localStorage.setItem('CYBER_QUIZ_QUESTION_COUNT', String(questionCount));
}

// 內建模擬題庫 (當尚未部署 GAS 或離線時使用)
const MOCK_QUESTION_BANK = [
  {
    id: '1',
    question: '在 JavaScript 中，typeof null 的回傳值是什麼？',
    options: { A: 'null', B: 'undefined', C: 'object', D: 'boolean' },
    correctAnswer: 'C',
    explanation: '這是 JavaScript 自早期版本保留至今的經典歷史 bug，null 被標記為物件型別。'
  },
  {
    id: '2',
    question: 'React 19 中，用於在元件掛載或狀態變更時執行副作用的經典 Hook 是什麼？',
    options: { A: 'useState', B: 'useEffect', C: 'useMemo', D: 'useRef' },
    correctAnswer: 'B',
    explanation: 'useEffect 用於處理 DOM 操作、網路訂閱、計時器等副作用。'
  },
  {
    id: '3',
    question: '下列何者是 CSS 用於設定彈性盒模型 (Flexbox) 容器主軸對齊的屬性？',
    options: { A: 'align-items', B: 'justify-content', C: 'flex-direction', D: 'align-content' },
    correctAnswer: 'B',
    explanation: 'justify-content 專門定義沿主軸 (main-axis) 的子元素分佈與對齊。'
  },
  {
    id: '4',
    question: 'HTTP 狀態碼 403 代表什麼含意？',
    options: { A: 'Not Found (找不到資源)', B: 'Forbidden (伺服器理解請求但拒絕授權)', C: 'Unauthorized (需要驗證)', D: 'Gateway Timeout' },
    correctAnswer: 'B',
    explanation: '403 Forbidden 表示客戶端身分已知或無權訪問該目標資源。'
  },
  {
    id: '5',
    question: 'Git 中，下列哪一個指令能建立新分支並同時切換過去？',
    options: { A: 'git checkout -b', B: 'git branch -d', C: 'git merge', D: 'git pull' },
    correctAnswer: 'A',
    explanation: 'git checkout -b <branch-name> 或 git switch -c 會一次完成建立與切換。'
  },
  {
    id: '6',
    question: '在關聯式資料庫中，下列何者 SQL 指令用於從資料表中撈取資料？',
    options: { A: 'UPDATE', B: 'INSERT', C: 'SELECT', D: 'DROP' },
    correctAnswer: 'C',
    explanation: 'SELECT 是 SQL 中用於查詢資料的核心關鍵字。'
  },
  {
    id: '7',
    question: '哪一種資料結構嚴格遵循「先進後出 (LIFO / FILO)」原則？',
    options: { A: 'Queue (佇列)', B: 'Stack (堆疊)', C: 'Linked List (鏈結串列)', D: 'Binary Tree' },
    correctAnswer: 'B',
    explanation: '堆疊 (Stack) 如同一疊盤子，最後放上去的會最先被取出。'
  },
  {
    id: '8',
    question: '在網頁資安中，防範 XSS (跨站腳本攻擊) 最核心的做法為何？',
    options: { A: '使用更多 Cookie', B: '對不可信的使用者輸入進行跳脫與編碼', C: '隱藏原始碼', D: '關閉 HTTPS' },
    correctAnswer: 'B',
    explanation: '對輸入內容進行適當的 HTML Entity 跳脫或 Content-Security-Policy 能有效阻絕惡意腳本執行。'
  },
  {
    id: '9',
    question: '下列哪一個是專門打包與極速熱重載 (HMR) 的現代前端構建工具？',
    options: { A: 'Vite', B: 'Grunt', C: 'Bower', D: 'Gulp' },
    correctAnswer: 'A',
    explanation: 'Vite 基於原生 ES 模組與 Rollup/Esbuild，提供極度迅捷的冷啟動與熱更新體驗。'
  },
  {
    id: '10',
    question: '在瀏覽器中，用於在客戶端持久化儲存 Key-Value 字串且關閉分頁不消失的 API 是？',
    options: { A: 'sessionStorage', B: 'localStorage', C: 'IndexedMemory', D: 'memoryCache' },
    correctAnswer: 'B',
    explanation: 'localStorage 在同一來源下的資料不會隨分頁關閉而銷毀，除非被手動清除。'
  }
];

/**
 * 從 Google Apps Script 獲取隨機題目 (不含解答)
 */
export async function fetchQuestions(count) {
  const { gasUrl, isMock } = getRuntimeConfig();

  // 若為模擬模式或尚未填入 URL
  if (isMock) {
    await new Promise(r => setTimeout(r, 600)); // 模擬網路延遲
    const shuffled = [...MOCK_QUESTION_BANK].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    // 回傳前端格式（剔除解答）
    return {
      success: true,
      count: selected.length,
      isMock: true,
      questions: selected.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
      })),
    };
  }

  // 實際連線 Google Apps Script
  try {
    const url = `${gasUrl}${gasUrl.includes('?') ? '&' : '?'}action=getQuestions&count=${count}&t=${Date.now()}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`GAS 伺服器回應異常: ${res.status}`);
    }

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || '無法取得題目');
    }

    return {
      ...data,
      isMock: false,
    };
  } catch (error) {
    console.warn('連線至 Google Apps Script 失敗，自動切換為本機模擬題庫：', error);
    // 降級為模擬資料
    const shuffled = [...MOCK_QUESTION_BANK].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    return {
      success: true,
      count: selected.length,
      isMock: true,
      fallbackError: error.message,
      questions: selected.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
      })),
    };
  }
}

/**
 * 提交玩家作答至 Google Apps Script
 */
export async function submitAnswers({ userId, answers, passThreshold }) {
  const { gasUrl, isMock } = getRuntimeConfig();

  // 若為模擬模式或連線失敗降級
  if (isMock) {
    await new Promise(r => setTimeout(r, 800));
    return handleMockSubmission({ userId, answers, passThreshold });
  }

  try {
    const payload = {
      userId,
      answers,
      passThreshold,
    };

    // 使用 text/plain 避免觸發 GAS 的 CORS preflight OPTIONS 擋格
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`GAS 結算伺服器錯誤: ${res.status}`);
    }

    const data = await res.json();
    return {
      ...data,
      isMock: false,
    };
  } catch (error) {
    console.warn('提交至 Google Apps Script 失敗，使用本機模擬結算：', error);
    const mockRes = handleMockSubmission({ userId, answers, passThreshold });
    mockRes.fallbackError = error.message;
    return mockRes;
  }
}

let inMemoryMockSheets = [];

/**
 * 本機模擬計算與「回答」工作表記錄邏輯 (存入 localStorage 供測試查核)
 */
function handleMockSubmission({ userId, answers, passThreshold }) {
  const submittedIds = Object.keys(answers);
  let correctCount = 0;
  const reviewList = [];

  const mockMap = {};
  MOCK_QUESTION_BANK.forEach(q => {
    mockMap[q.id] = q;
  });

  submittedIds.forEach(id => {
    const qInfo = mockMap[id] || {
      id,
      question: `題目 #${id}`,
      options: { A: 'A', B: 'B', C: 'C', D: 'D' },
      correctAnswer: 'A',
      explanation: '模擬題目解析'
    };
    const userAns = (answers[id] || '').trim().toUpperCase();
    const isCorrect = userAns === qInfo.correctAnswer;
    if (isCorrect) correctCount++;

    reviewList.push({
      id,
      question: qInfo.question,
      userAnswer: userAns,
      correctAnswer: qInfo.correctAnswer,
      isCorrect,
      explanation: qInfo.explanation,
      options: qInfo.options,
    });
  });

  const totalQuestions = submittedIds.length;
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const passed = correctCount >= passThreshold;
  const now = new Date();
  const timestamp = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  // 模擬 Google Sheets「回答」工作表的持久化
  const STORAGE_KEY = 'CYBER_QUIZ_MOCK_SHEET_ANSWERS';
  let sheetAnswers = inMemoryMockSheets;
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) sheetAnswers = JSON.parse(raw);
    }
  } catch {}

  const userIdx = sheetAnswers.findIndex(row => row.ID === userId);
  let userStats;

  if (userIdx >= 0) {
    const prev = sheetAnswers[userIdx];
    const newAttempts = (prev['闖關次數'] || 0) + 1;
    const newTotal = (prev['總分'] || 0) + score;
    const newHigh = Math.max(prev['最高分'] || 0, score);

    let firstPassScore = prev['第一次通關分數'];
    let passAttempts = prev['花了幾次通關'];

    const hasPrevPass = (firstPassScore !== '' && firstPassScore !== null && firstPassScore !== undefined && firstPassScore !== '-');
    if (!hasPrevPass && passed) {
      firstPassScore = score;
      passAttempts = newAttempts;
    }

    userStats = {
      'ID': userId,
      '闖關次數': newAttempts,
      '總分': newTotal,
      '最高分': newHigh,
      '第一次通關分數': firstPassScore,
      '花了幾次通關': passAttempts,
      '最近遊玩時間': timestamp,
    };
    sheetAnswers[userIdx] = userStats;
  } else {
    userStats = {
      'ID': userId,
      '闖關次數': 1,
      '總分': score,
      '最高分': score,
      '第一次通關分數': passed ? score : '',
      '花了幾次通關': passed ? 1 : '',
      '最近遊玩時間': timestamp,
    };
    sheetAnswers.push(userStats);
  }

  inMemoryMockSheets = sheetAnswers;

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sheetAnswers));
    }
  } catch {}

  return {
    success: true,
    isMock: true,
    userId,
    score,
    correctCount,
    totalQuestions,
    passed,
    passThreshold,
    timestamp,
    userStats,
    results: reviewList,
  };
}
