# 🎮 賽博闖關戰 // CYBER QUIZ - 像素關主問答遊戲

科技感與電競風格兼具的 Web 闖關問答遊戲。前端採用 **React + Vite** 開發，整合 **DiceBear API** 預載 100 位獨立 Pixel 像素風格關主，並以 **Google Sheets** 與 **Google Apps Script (GAS)** 作為無伺服器雲端後端，實現題目隨機撈取、防作弊驗證與個人成績累積統計。

---

## 📑 目錄
1. [特色亮點](#-特色亮點)
2. [本地端安裝與啟動](#-本地端安裝與啟動)
3. [環境變數設定 (.env)](#-環境變數設定-env)
4. [Google Sheets 與 Google Apps Script 配置指引](#-google-sheets-與-google-apps-script-配置指引)
5. [自動部署至 GitHub Pages (GitHub Actions)](#-自動部署至-github-pages-github-actions)
6. [10 組可直接複製貼上的測試題目庫](#-10-組可直接複製貼上的測試題目庫)
7. [常見問題與排錯 (FAQ)](#-常見問題與排錯-faq)

---

## 🚀 特色亮點

- **風格美學**：Cyberpunk / 深色玻璃擬態（Glassmorphism）、霓虹光效、復古 CRT 掃描線濾鏡與戰鬥受擊震動動畫。
- **100 位 Pixel 關主池**：使用 DiceBear API，首頁進入時自動非同步預載 100 張像素關主 SVG，闖關過程零延遲無縫切換。
- **作答反饋與音效**：內建 Web Audio API 8-Bit 復古合成器（支援靜音切換），點選選項關主即刻觸發攻擊爆擊與 HP 扣減。
- **安全防作弊機制**：GAS 隨機出題時**不傳送解答欄位**至瀏覽器，所有答案核對與計分皆在後端試算表安全執行。
- **智慧成績追蹤**：支援同一特工 ID 重複闖關，自動累加闖關次數、總分，並**鎖定保存第一次通關分數與嘗試次數**。
- **雙模運作支援**：尚未部署 Google Apps Script 之前，系統會自動啟動高品質的**單機模擬測試器**，100% 完整體驗所有流程。

---

## 💻 本地端安裝與啟動

### 1. 環境需求
- [Node.js](https://nodejs.org/) (建議版本 v18.0.0 以上)
- npm、yarn 或 pnpm

### 2. 安裝步驟

```bash
# 1. 進入專案目錄
cd 網頁測試

# 2. 安裝專案依賴套件
npm install

# 3. 複製環境變數範例檔
cp .env.example .env

# 4. 啟動 Vite 本地開發伺服器
npm run dev
```

啟動後，瀏覽器開啟 `http://localhost:5173/` 即可進入遊戲！

---

## ⚙️ 環境變數設定 (.env)

專案根目錄下的 `.env` 提供以下參數配置：

```env
# Google Apps Script 部署後的 Web 應用程式網址 (留空時會自動啟動單機模擬連線模式)
GOOGLE_APP_SCRIPT_URL=https://script.google.com/macros/s/AKfycb.../exec
VITE_GOOGLE_APP_SCRIPT_URL=https://script.google.com/macros/s/AKfycb.../exec

# 通過門檻（需要答對幾題才算通過遊戲並計入通關紀錄）
PASS_THRESHOLD=6
VITE_PASS_THRESHOLD=6

# 每次遊戲隨機撈取的關卡題目數量
QUESTION_COUNT=10
VITE_QUESTION_COUNT=10
```

> **小技巧**：在遊戲網頁右上角點擊 **「⚙️ 設定」** 圖示，可直接在瀏覽器即時修改 GAS 網址與門檻，並提供 **「測試連線 (PING)」** 功能，無需重啟終端機！

---

## 📊 Google Sheets 與 Google Apps Script 配置指引

只需 3 分鐘即可將 Google Sheets 變身為你的即時資料庫：

### 步驟 1：建立 Google 試算表
1. 開啟 [Google 試算表 (Google Sheets)](https://sheets.new) 建立一份空白試算表。
2. 將試算表命名為：`賽博問答遊戲資料庫`。

### 步驟 2：工作表結構說明
本專案依賴試算表底部的兩個工作表分頁：

#### 1.「題目」工作表（放置題庫）
- **工作表名稱**：`題目`
- **第 1 列標題欄位**：
  | A | B | C | D | E | F | G |
  | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
  | **題號** | **題目** | **A** | **B** | **C** | **D** | **解答** |

> **重要注意事項**：
> - `解答` 欄位請填入大寫字母（例如：`A`、`B`、`C` 或 `D`）。
> - 題目出題時，後端會自動隨機抽取 N 題，並**濾除 G 欄的解答**後才傳給前端，防止作弊。

#### 2.「回答」工作表（記錄作答與成績）
- **工作表名稱**：`回答`
- **第 1 列標題欄位**：
  | A | B | C | D | E | F | G |
  | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
  | **ID** | **闖關次數** | **總分** | **最高分** | **第一次通關分數** | **花了幾次通關** | **最近遊玩時間** |

> **成績累計規則**：
> - 同一個玩家 ID 重複遊玩時，系統會自動找到該 ID 列，將 `闖關次數 + 1`、累加 `總分`、更新 `最高分` 與 `最近遊玩時間`。
> - 若該玩家先前未曾通關，而在本次遊玩成功達標（答對數 ≥ `PASS_THRESHOLD`），系統會將本次分數寫入 `第一次通關分數`，並記錄 `花了幾次通關`。後續再遊玩則**不再覆蓋此第一次紀錄**。

---

### 步驟 3：在試算表中配置 Google Apps Script
1. 在試算表上方選單點選 **「擴充功能」 (Extensions) -> 「Apps Script」**。
2. 刪除編輯器中的所有預設代碼，將專案中的 [google-apps-script/Code.gs](file:///c:/Users/USER/.gemini/網頁測試/google-apps-script/Code.gs) 內容**全部複製貼上**。
3. 點選上方磁碟圖示 **儲存專案 (Ctrl + S)**。

#### ⚡ 快速初始化工作表（一鍵完成）
1. 回到剛才的 Google 試算表瀏覽器分頁並重新整理網頁（F5）。
2. 頂部選單最右方會多出 **「🎮 闖關遊戲管理」**。
3. 點擊 **「⚡ 自動建立/初始化工作表與示範題目」**。
   - *(首次執行時 Google 會跳出「需要授權」提示，依序點擊「進階」->「前往... (不安全)」並點擊允許即可)*。
4. 系統會自動為你建妥「題目」與「回答」兩張工作表，並填入 10 題示範題目與精美深色表頭！

---

### 步驟 4：發布為 Web 應用程式 (取得 API 網址)

這是前後端串接的關鍵步驟：

1. 在 Apps Script 編輯器右上角，點選藍色按鈕 **「部署」 (Deploy) -> 「新部署」 (New deployment)**。
2. 點選左側齒輪圖示 **「選取類型」 -> 「網頁應用程式」 (Web app)**。
3. 設定內容如下：
   - **說明**：`v1.0`
   - **執行身分 (Execute as)**：`我 (您的 Google 帳號)`
   - **誰可以存取 (Who has access)**：⚠️ **必須選擇「所有人 (Anyone)」** ⚠️
     *(若未選「所有人」，瀏覽器前端跨網域存取會被 Google 權限阻擋！)*
4. 點選 **「部署」**。
5. 複製產生的 **網頁應用程式網址**（格式類似：`https://script.google.com/macros/s/AKfycb.../exec`）。
6. 將該網址貼入專案根目錄的 `.env` 檔案中的 `GOOGLE_APP_SCRIPT_URL`，或直接在網頁右上角的「設定」彈窗中貼入儲存。

---

## 🌐 自動部署至 GitHub Pages (GitHub Actions)

本專案已在 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) 設定好自動化部署流程。只要將代碼推送至 GitHub 的 `main` 分支，GitHub Actions 就會自動完成打包並發布至 GitHub Pages！

### 步驟 1：開啟 GitHub Pages 的 Actions 來源
1. 進入你的 GitHub 專案儲存庫頁面。
2. 點擊上方頁籤 **「Settings」** -> 左側選單選擇 **「Pages」**。
3. 在 **「Build and deployment」** 區塊：
   - **Source** 下拉選單選擇：**「GitHub Actions」**。

### 步驟 2：配置 GitHub 環境變數 (Secrets 與 Variables)
Action 在建置時會自動抓取你在 GitHub 設定的環境變數（若未設定則自動使用 `.env.example` 預設值）：
1. 進入儲存庫 **「Settings」** -> 左側選單 **「Secrets and variables」** -> **「Actions」**。
2. 切換到 **「Variables」** 頁籤（若為敏感資訊亦可設在 **「Secrets」** 頁籤）：
   - `GOOGLE_APP_SCRIPT_URL`：填入你的 GAS Web App 連結
   - `PASS_THRESHOLD`：填入過關門檻（例如 `6`）
   - `QUESTION_COUNT`：填入每輪題數（例如 `10`）

### 步驟 3：推送代碼自動觸發部署
```bash
git add .
git commit -m "feat: deploy to github pages via github actions"
git push origin main
```
推送後，點選儲存庫的 **「Actions」** 頁籤即可查看部署進度。完成後頁面將於 `https://<你的帳號>.github.io/<專案名稱>/` 自動上線！

---

## 📝 10 組可直接複製貼上的測試題目庫

你可以直接整段複製下方文字框，回到 Google 試算表的 **「題目」工作表**，選取 **A1 儲存格** 後直接按 **Ctrl + V** 貼上，表格欄位會自動完美對齊！

### 📋 格式：TSV 格式（點擊右上複製直接貼進 A1）

```tsv
題號	題目	A	B	C	D	解答
1	在 JavaScript 中，typeof null 的回傳結果是什麼？	object	null	undefined	boolean	A
2	React 中用於處理元件副作用（如訂閱、計時器、DOM操作）的經典 Hook 是？	useState	useEffect	useMemo	useRef	B
3	CSS Flexbox 模型中，哪一個屬性負責控制子元素在「主軸 (Main Axis)」上的對齊分佈？	align-items	justify-content	flex-direction	align-content	B
4	HTTP 狀態碼 403 代表下列何種意義？	Not Found (找不到資源)	Forbidden (禁止存取/未授權)	Unauthorized (未認證)	Internal Server Error	B
5	Git 指令中，哪一個命令可以建立一個新分支並同時切換過去？	git checkout -b	git branch -d	git merge	git pull	A
6	在關聯式資料庫 (SQL) 中，用於從資料表檢索資料的核心關鍵字是？	UPDATE	INSERT	SELECT	DELETE	C
7	哪一種資料結構嚴格遵循「後進先出 / 先進後出 (LIFO)」的原則？	Queue (佇列)	Stack (堆疊)	Linked List (鏈結串列)	Binary Tree (二元樹)	B
8	在前端工程中，用於避免惡意腳本注入 (XSS 跨站腳本攻擊) 的關鍵防禦手段為何？	設定更多 Cookie	對不可信的輸入進行 HTML 跳脫與編碼	隱藏原始碼	關閉 HTTPS 加密	B
9	下列哪一個是以極速冷啟動與原生 ES 模組 (ESM) 熱重載著稱的現代前端構建工具？	Vite	Grunt	Webpack 1.0	Bower	A
10	瀏覽器中儲存在客戶端的 Key-Value 資料，且關閉分頁或重啟瀏覽器後依然永久保留的是？	sessionStorage	localStorage	memoryCache	cookieSession	B
```

### 📖 題庫預覽表

| 題號 | 題目 | 選項 A | 選項 B | 選項 C | 選項 D | 解答 |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **1** | 在 JavaScript 中，typeof null 的回傳結果是什麼？ | **object** | null | undefined | boolean | **A** |
| **2** | React 中用於處理元件副作用的經典 Hook 是？ | useState | **useEffect** | useMemo | useRef | **B** |
| **3** | CSS Flexbox 中控制主軸對齊分佈的屬性是？ | align-items | **justify-content** | flex-direction | align-content | **B** |
| **4** | HTTP 狀態碼 403 代表何種意義？ | Not Found | **Forbidden (禁止存取)** | Unauthorized | Server Error | **B** |
| **5** | Git 中能建立新分支並同時切換過去的指令？ | **git checkout -b** | git branch -d | git merge | git pull | **A** |
| **6** | SQL 中用於從資料表檢索資料的核心關鍵字？ | UPDATE | INSERT | **SELECT** | DELETE | **C** |
| **7** | 哪種資料結構嚴格遵循「後進先出 (LIFO)」原則？ | Queue (佇列) | **Stack (堆疊)** | Linked List | Binary Tree | **B** |
| **8** | 防範 XSS (跨站腳本攻擊) 的關鍵防禦手段為何？ | 設定更多 Cookie | **輸入內容跳脫與編碼** | 隱藏原始碼 | 關閉 HTTPS | **B** |
| **9** | 以極速冷啟動與原生 ESM 著稱的現代構建工具？ | **Vite** | Grunt | Webpack 1.0 | Bower | **A** |
| **10** | 瀏覽器中關閉分頁或重啟後依然永久保留的客戶端儲存？ | sessionStorage | **localStorage** | memoryCache | cookieSession | **B** |

---

## ❓ 常見問題與排錯 (FAQ)

### Q1：點擊開始遊戲時顯示「連線失敗」或無法取得題目？
1. **檢查 Web App 權限**：請確保在 Google Apps Script 部署設定中，**「誰可以存取 (Who has access)」設定為「所有人 (Anyone)」**。如果設定為「僅限自己」，前端請求會被 Google 權限阻擋。
2. **重新部署版本**：若修改了 `Code.gs` 代碼，必須點選「部署」->「管理部署」-> 編輯並選取「新版本」後儲存，網址才會生效最新代碼。
3. **單機模擬模式**：若暫時不想配置 GAS，可將 `.env` 中的 `GOOGLE_APP_SCRIPT_URL` 留空，系統將無縫切換至內建單機模擬器。

### Q2：如何調整通關難度與題數？
- 在 `.env` 檔案中直接修改：
  - `PASS_THRESHOLD=6` (答對 6 題才算通關)
  - `QUESTION_COUNT=10` (總共 10 關)
- 或直接在網頁右上角點選 **「⚙️ 設定」** 進行即時調整！

### Q3：同一 ID 再次闖關，先前的第一次通關紀錄會被洗掉嗎？
不會！系統後端邏輯有嚴格的鎖定保護：
- `第一次通關分數` 與 `花了幾次通關` 僅在該 ID **首度達成通關門檻** 時寫入一次。
- 後續無論再玩幾次、分數高低，都僅會累加 `闖關次數`、累加 `總分`、更新 `最高分` 與 `最近遊玩時間`。
