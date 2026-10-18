# Google Sheets 與 Google Apps Script 設定指引

本專案將 Google Sheets 當作後端資料庫，透過 Google Apps Script (GAS) 提供前端問答撈取與成績結算。

---

## 步驟 1：建立 Google 試算表
1. 開啟 [Google 試算表](https://sheets.new) 建立一份空白試算表。
2. 點擊頂部選單的 **「擴充功能」 (Extensions) -> 「Apps Script」**。

## 步驟 2：貼上後端程式碼
1. 將本專案中的 `google-apps-script/Code.gs` 完整內容複製，覆蓋 Apps Script 編輯器中的所有內容。
2. 點擊上方磁碟圖示 **儲存 (Ctrl + S)**。

## 步驟 3：自動初始化工作表欄位
1. 回到剛才的 Google 試算表分頁並重新整理網頁。
2. 頂部選單會出現 **「🎮 闖關遊戲管理」**。
3. 點擊 **「⚡ 自動建立/初始化工作表與示範題目」**（首次執行 Google 會跳出授權提示，點選「進階」並允許存取即可）。
4. 系統會自動建立好：
   - **「題目」工作表**：`題號 | 題目 | A | B | C | D | 解答` (附帶 10 題示範程式題庫)
   - **「回答」工作表**：`ID | 闖關次數 | 總分 | 最高分 | 第一次通關分數 | 花了幾次通關 | 最近遊玩時間`

## 步驟 4：發布為 Web 應用程式 (取得 API 網址)
1. 回到 Apps Script 編輯器，點擊右上角藍色按鈕 **「部署」 (Deploy) -> 「新部署」 (New deployment)**。
2. 左側選取齒輪圖示 **「選取類型」 -> 「網頁應用程式」 (Web app)**。
3. 設定參數：
   - **說明**：`v1.0`
   - **執行身分**：`我 (您的帳號)`
   - **誰可以存取**：`所有人 (Anyone)` ⚠️ **非常重要！若沒選「所有人」，前端網頁會因跨網域權限受阻！**
4. 點擊 **「部署」**。
5. 複製生成的 **Web 應用程式網址**（格式類似：`https://script.google.com/macros/s/AKfycb.../exec`）。

## 步驟 5：填入專案環境變數 (.env)
將複製的網址填入專案根目錄的 `.env`：
```env
GOOGLE_APP_SCRIPT_URL=https://script.google.com/macros/s/AKfycb.../exec
PASS_THRESHOLD=3
QUESTION_COUNT=5
```

> **提示**：前端專案已內建「即時連線模擬器」。若尚未部署 GAS 網址，系統亦可無縫進行單機模擬測試與完整遊戲試玩！
