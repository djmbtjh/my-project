/**
 * =========================================================================
 * 闖關問答遊戲 - Google Apps Script (GAS) 後端核心代碼
 * =========================================================================
 * 說明：
 * 1. 本程式請直接貼入 Google Sheets 的「擴充功能」->「Apps Script」中。
 * 2. 部署為 Web 應用程式時，請注意權限設定：
 *    - 執行身分：我 (您的 Google 帳號)
 *    - 誰可以存取：所有人 (Anyone)
 * =========================================================================
 */

// 工作表名稱常數
const SHEET_QUESTIONS = '題目';
const SHEET_ANSWERS = '回答';

/**
 * 試算表開啟時建立專用工具選單
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🎮 闖關遊戲管理')
    .addItem('⚡ 自動建立/初始化工作表與示範題目', 'setupInitialSheets')
    .addToUi();
}

/**
 * 處理 GET 請求
 * 動作：
 * ?action=getQuestions&count=5 -> 隨機抽取 N 題（不包含解答欄位）
 * ?action=ping -> 測試連線狀態
 */
function doGet(e) {
  try {
    const params = e ? e.parameter : {};
    const action = params.action || 'getQuestions';

    if (action === 'ping') {
      return createJsonResponse({ status: 'ok', message: 'GAS 伺服器運作正常', time: new Date().toISOString() });
    }

    if (action === 'getQuestions') {
      const count = parseInt(params.count, 10) || 5;
      const questions = getRandomQuestions(count);
      return createJsonResponse({
        success: true,
        count: questions.length,
        questions: questions
      });
    }

    return createJsonResponse({ success: false, error: '未知請求動作 (Unknown action)' });
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

/**
 * 處理 POST 請求 (提交作答結果)
 * Payload 格式：
 * {
 *   "userId": "player_001",
 *   "answers": { "1": "A", "2": "C", ... },
 *   "passThreshold": 3
 * }
 */
function doPost(e) {
  try {
    let postData;
    if (e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else {
      postData = e.parameter || {};
    }

    const userId = (postData.userId || '').toString().trim();
    const userAnswers = postData.answers || {};
    const passThreshold = parseInt(postData.passThreshold, 10) || 3;

    if (!userId) {
      return createJsonResponse({ success: false, error: '缺少使用者 ID (Missing userId)' });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const qSheet = ss.getSheetByName(SHEET_QUESTIONS);
    const aSheet = ss.getSheetByName(SHEET_ANSWERS);

    if (!qSheet || !aSheet) {
      return createJsonResponse({
        success: false,
        error: '找不到「題目」或「回答」工作表，請先點選試算表選單「🎮 闖關遊戲管理」進行初始化。'
      });
    }

    // 1. 取得所有題目資料以供對比
    const qData = qSheet.getDataRange().getValues();
    if (qData.length <= 1) {
      return createJsonResponse({ success: false, error: '「題目」工作表中無資料' });
    }

    // 建立題目查找表：id -> { question, A, B, C, D, answer }
    const qMap = {};
    for (let i = 1; i < qData.length; i++) {
      const row = qData[i];
      const qId = String(row[0]).trim();
      qMap[qId] = {
        id: qId,
        question: row[1],
        options: { A: row[2], B: row[3], C: row[4], D: row[5] },
        correctAnswer: String(row[6]).trim().toUpperCase()
      };
    }

    // 2. 逐題核對玩家作答
    const submittedIds = Object.keys(userAnswers);
    let correctCount = 0;
    const totalQuestions = submittedIds.length;
    const reviewList = [];

    submittedIds.forEach(id => {
      const qInfo = qMap[String(id).trim()];
      const uAns = (userAnswers[id] || '').toString().trim().toUpperCase();
      if (qInfo) {
        const isCorrect = (uAns === qInfo.correctAnswer);
        if (isCorrect) correctCount++;
        reviewList.push({
          id: id,
          question: qInfo.question,
          userAnswer: uAns,
          correctAnswer: qInfo.correctAnswer,
          isCorrect: isCorrect,
          options: qInfo.options
        });
      }
    });

    // 計算分數 (百分制)
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const isPassed = correctCount >= passThreshold;
    const nowTimeStr = Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy/MM/dd HH:mm:ss');

    // 3. 處理「回答」工作表記錄
    // 欄位定義：
    // [0] ID
    // [1] 闖關次數
    // [2] 總分
    // [3] 最高分
    // [4] 第一次通關分數
    // [5] 花了幾次通關
    // [6] 最近遊玩時間
    const aData = aSheet.getDataRange().getValues();
    let userRowIndex = -1;

    for (let r = 1; r < aData.length; r++) {
      if (String(aData[r][0]).trim() === userId) {
        userRowIndex = r + 1; // 1-based index in Sheet
        break;
      }
    }

    if (userRowIndex > 0) {
      // 既有玩家資料
      const oldRow = aData[userRowIndex - 1];
      const oldAttempts = Number(oldRow[1]) || 0;
      const oldTotalScore = Number(oldRow[2]) || 0;
      const oldHighScore = Number(oldRow[3]) || 0;
      const oldFirstPassScore = oldRow[4];
      const oldPassAttempts = oldRow[5];

      const newAttempts = oldAttempts + 1;
      const newTotalScore = oldTotalScore + score;
      const newHighScore = Math.max(oldHighScore, score);

      let newFirstPassScore = oldFirstPassScore;
      let newPassAttempts = oldPassAttempts;

      // 若先前尚未通關，而本次達成通關門檻，記錄第一次通關分數與嘗試次數
      const hasPreviousPass = (oldFirstPassScore !== '' && oldFirstPassScore !== null && oldFirstPassScore !== undefined && oldFirstPassScore !== '-');
      if (!hasPreviousPass && isPassed) {
        newFirstPassScore = score;
        newPassAttempts = newAttempts;
      }

      // 更新整列
      aSheet.getRange(userRowIndex, 2, 1, 6).setValues([[
        newAttempts,
        newTotalScore,
        newHighScore,
        newFirstPassScore,
        newPassAttempts,
        nowTimeStr
      ]]);
    } else {
      // 全新玩家，新增一列
      const firstPassScore = isPassed ? score : '';
      const passAttempts = isPassed ? 1 : '';

      aSheet.appendRow([
        userId,
        1,               // 闖關次數
        score,           // 總分
        score,           // 最高分
        firstPassScore,  // 第一次通關分數
        passAttempts,    // 花了幾次通關
        nowTimeStr       // 最近遊玩時間
      ]);
    }

    return createJsonResponse({
      success: true,
      userId: userId,
      score: score,
      correctCount: correctCount,
      totalQuestions: totalQuestions,
      passThreshold: passThreshold,
      passed: isPassed,
      timestamp: nowTimeStr,
      results: reviewList
    });

  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

/**
 * 從「題目」工作表隨機抽取 N 題（不包含解答欄位）
 */
function getRandomQuestions(count) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_QUESTIONS);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  // 取得所有題目資料行 (排除標題行)
  const rows = data.slice(1);

  // Fisher-Yates 洗牌演算法
  for (let i = rows.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }

  const selectedRows = rows.slice(0, Math.min(count, rows.length));

  // 回傳前端格式（絕對不傳送解答欄位）
  return selectedRows.map(row => ({
    id: String(row[0]),
    question: row[1],
    options: {
      A: row[2],
      B: row[3],
      C: row[4],
      D: row[5]
    }
  }));
}

/**
 * 產生標準 JSON 格式回應 (包含 CORS 標頭以供瀏覽器安全存取)
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 初始化工作表結構與範例題目
 */
function setupInitialSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. 初始化「題目」表
  let qSheet = ss.getSheetByName(SHEET_QUESTIONS);
  if (!qSheet) {
    qSheet = ss.insertSheet(SHEET_QUESTIONS);
  }

  // 設定標題行
  const qHeaders = ['題號', '題目', 'A', 'B', 'C', 'D', '解答'];
  qSheet.getRange(1, 1, 1, qHeaders.length).setValues([qHeaders]);
  qSheet.getRange(1, 1, 1, qHeaders.length)
    .setBackground('#1e293b')
    .setFontColor('#f8fafc')
    .setFontWeight('bold');

  // 若只有標題則填入示範題庫
  if (qSheet.getLastRow() <= 1) {
    const sampleQuestions = [
      [1, '在 JavaScript 中，typeof null 的回傳值是什麼？', 'null', 'undefined', 'object', 'boolean', 'C'],
      [2, 'React 中用於在元件掛載或狀態變更時執行副作用的 Hook 是什麼？', 'useState', 'useEffect', 'useMemo', 'useRef', 'B'],
      [3, '下列何者是 CSS 用於設定彈性盒模型 (Flexbox) 容器主軸對齊的屬性？', 'align-items', 'justify-content', 'flex-direction', 'align-content', 'B'],
      [4, 'HTTP 狀態碼 403 代表什麼意義？', 'Not Found (找不到資源)', 'Forbidden (禁止存取)', 'Unauthorized (未認證)', 'Internal Server Error', 'B'],
      [5, '在關聯式資料庫中，下列何者指令用於自資料表中撈取資料？', 'UPDATE', 'INSERT', 'SELECT', 'DELETE', 'C'],
      [6, 'Git 指令中，哪一個命令用於建立並切換至新的分支？', 'git checkout -b', 'git branch -d', 'git merge', 'git pull', 'A'],
      [7, '哪一種資料結構遵循「先進後出 (FILO / LIFO)」原則？', 'Queue (佇列)', 'Stack (堆疊)', 'Linked List (鏈結串列)', 'Array (陣列)', 'B'],
      [8, '下列哪一個是專門打包與熱重載的前端極速構建工具？', 'Vite', 'Babel', 'jQuery', 'Grunt', 'A'],
      [9, 'TypeScript 中，哪一個關鍵字可用於定義物件型別結構？', 'interface', 'struct', 'record', 'define', 'A'],
      [10, '在前端中，用於實現非同步 Promise 簡潔語法的成對關鍵字是什麼？', 'try / catch', 'async / await', 'then / catch', 'defer / async', 'B']
    ];
    qSheet.getRange(2, 1, sampleQuestions.length, 7).setValues(sampleQuestions);
  }

  // 2. 初始化「回答」表
  let aSheet = ss.getSheetByName(SHEET_ANSWERS);
  if (!aSheet) {
    aSheet = ss.insertSheet(SHEET_ANSWERS);
  }

  const aHeaders = ['ID', '闖關次數', '總分', '最高分', '第一次通關分數', '花了幾次通關', '最近遊玩時間'];
  aSheet.getRange(1, 1, 1, aHeaders.length).setValues([aHeaders]);
  aSheet.getRange(1, 1, 1, aHeaders.length)
    .setBackground('#0f172a')
    .setFontColor('#38bdf8')
    .setFontWeight('bold');

  SpreadsheetApp.getUi().alert('✅ 工作表「題目」與「回答」初始化完成！已填入 10 題示範題目。');
}
