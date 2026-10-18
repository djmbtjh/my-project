/**
 * =========================================================================
 * 樹億興業股份有限公司 - 職業安全衛生訓練測驗系統
 * Google Apps Script (GAS) 後端核心代碼
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
  ui.createMenu('🏢 職安測驗管理')
    .addItem('⚡ 自動建立/初始化工作表與職安示範題目', 'setupInitialSheets')
    .addToUi();
}

/**
 * 處理 GET 請求
 * 動作：
 * ?action=getQuestions&count=40 -> 隨機抽取 N 題
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
      const count = parseInt(params.count, 10) || 40;
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
 *   "userId": "SY-001",
 *   "userName": "王大明",
 *   "answers": { "1": "A", "2": "C", ... },
 *   "passThreshold": 32
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
    const userName = (postData.userName || '').toString().trim();
    const userAnswers = postData.answers || {};
    const passThreshold = parseInt(postData.passThreshold, 10) || 32;

    if (!userId) {
      return createJsonResponse({ success: false, error: '缺少員工編號 (Missing userId)' });
    }

    // 格式化顯示 ID: "員工編號 (姓名)"
    const idKey = userName ? `${userId} (${userName})` : userId;

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const qSheet = ss.getSheetByName(SHEET_QUESTIONS);
    const aSheet = ss.getSheetByName(SHEET_ANSWERS);

    if (!qSheet || !aSheet) {
      return createJsonResponse({
        success: false,
        error: '找不到「題目」或「回答」工作表，請先點選試算表選單「🏢 職安測驗管理」進行初始化。'
      });
    }

    // 1. 取得所有題目資料以供對比
    const qData = qSheet.getDataRange().getValues();
    if (qData.length <= 1) {
      return createJsonResponse({ success: false, error: '「題目」工作表中無資料' });
    }

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

    // 2. 逐題核對作答
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

    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const isPassed = score >= 80; // 80 分以上及格
    const nowTimeStr = Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy/MM/dd HH:mm:ss');

    // 3. 處理「回答」工作表記錄
    // 欄位定義：
    // [0] ID (或 員工編號 (姓名))
    // [1] 闖關次數
    // [2] 總分
    // [3] 最高分
    // [4] 第一次通關分數
    // [5] 花了幾次通關
    // [6] 最近遊玩時間
    const aData = aSheet.getDataRange().getValues();
    let userRowIndex = -1;

    for (let r = 1; r < aData.length; r++) {
      const rowId = String(aData[r][0]).trim();
      // 比對 ID 開頭或完全一致
      if (rowId === idKey || rowId === userId || rowId.startsWith(userId + ' ') || rowId.startsWith(userId + '(')) {
        userRowIndex = r + 1;
        break;
      }
    }

    if (userRowIndex > 0) {
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

      const hasPreviousPass = (oldFirstPassScore !== '' && oldFirstPassScore !== null && oldFirstPassScore !== undefined && oldFirstPassScore !== '-');
      if (!hasPreviousPass && isPassed) {
        newFirstPassScore = score;
        newPassAttempts = newAttempts;
      }

      // 更新原列（同時更新為包含姓名的最新標籤）
      aSheet.getRange(userRowIndex, 1, 1, 7).setValues([[
        idKey,
        newAttempts,
        newTotalScore,
        newHighScore,
        newFirstPassScore,
        newPassAttempts,
        nowTimeStr
      ]]);
    } else {
      const firstPassScore = isPassed ? score : '';
      const passAttempts = isPassed ? 1 : '';

      aSheet.appendRow([
        idKey,
        1,
        score,
        score,
        firstPassScore,
        passAttempts,
        nowTimeStr
      ]);
    }

    return createJsonResponse({
      success: true,
      userId: userId,
      userName: userName,
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
 * 從「題目」工作表隨機抽取 N 題（包含 correctAnswer 供即時回饋）
 */
function getRandomQuestions(count) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_QUESTIONS);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const rows = data.slice(1);

  // Fisher-Yates 洗牌
  for (let i = rows.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }

  const selectedRows = rows.slice(0, Math.min(count, rows.length));

  return selectedRows.map(row => ({
    id: String(row[0]),
    question: row[1],
    options: {
      A: row[2],
      B: row[3],
      C: row[4],
      D: row[5]
    },
    correctAnswer: String(row[6]).trim().toUpperCase()
  }));
}

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
  let qSheet = ss.getSheetByName(SHEET_QUESTIONS) || ss.insertSheet(SHEET_QUESTIONS);
  const qHeaders = ['題號', '題目', 'A', 'B', 'C', 'D', '解答'];
  qSheet.getRange(1, 1, 1, qHeaders.length).setValues([qHeaders]);
  qSheet.getRange(1, 1, 1, qHeaders.length)
    .setBackground('#1e293b')
    .setFontColor('#f8fafc')
    .setFontWeight('bold');

  // 2. 初始化「回答」表
  let aSheet = ss.getSheetByName(SHEET_ANSWERS) || ss.insertSheet(SHEET_ANSWERS);
  const aHeaders = ['ID', '闖關次數', '總分', '最高分', '第一次通關分數', '花了幾次通關', '最近遊玩時間'];
  aSheet.getRange(1, 1, 1, aHeaders.length).setValues([aHeaders]);
  aSheet.getRange(1, 1, 1, aHeaders.length)
    .setBackground('#0f172a')
    .setFontColor('#38bdf8')
    .setFontWeight('bold');

  SpreadsheetApp.getUi().alert('✅ 樹億興業 職業安全衛生測驗「題目」與「回答」工作表初始化完成！');
}
