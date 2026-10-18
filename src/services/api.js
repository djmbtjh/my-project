/**
 * API 服務模組 - 樹億興業股份有限公司 職業安全衛生訓練測驗
 * 負責與 Google Apps Script (GAS) 後端進行通訊
 * 若未設定 GOOGLE_APP_SCRIPT_URL 則自動進入高品質的「本機模擬連線模式」
 */

const metaEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
const ENV_GAS_URL = metaEnv.VITE_GOOGLE_APP_SCRIPT_URL || metaEnv.GOOGLE_APP_SCRIPT_URL || '';
const ENV_PASS_THRESHOLD = Number(metaEnv.VITE_PASS_THRESHOLD || metaEnv.PASS_THRESHOLD || 32);
const ENV_QUESTION_COUNT = Number(metaEnv.VITE_QUESTION_COUNT || metaEnv.QUESTION_COUNT || 40);

// 支援在介面中即時測試自訂 GAS URL
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

// 40 題職業安全衛生訓練實體模擬題庫
const SAFETY_QUESTION_BANK = [
  { id: '1', question: '在廠區或工地作業時，配戴安全帽的主要目的為何？', options: { A: '防曬美觀', B: '防止飛落物擊傷頭部及墜落碰撞', C: '便於辨識部門', D: '固定頭髮' }, correctAnswer: 'B', explanation: '安全帽具備抗衝擊吸收能量機能，保護頭部免於物體飛落或跌倒撞擊重傷。' },
  { id: '2', question: '使用滅火器時的「PASS」口訣中，第一個「P (Pull)」所指動作為何？', options: { A: '拔出安全插銷', B: '壓下把手', C: '對準火源根部', D: '左右掃射' }, correctAnswer: 'A', explanation: '滅火器操作口訣：拉(Pull插銷)、瞄(Aim火根)、壓(Squeeze把手)、掃(Sweep左右掃射)。' },
  { id: '3', question: '凡於高度幾公尺以上之高處作業，且有墜落之虞時，應確實配戴安全帶？', options: { A: '1 公尺', B: '1.5 公尺', C: '2 公尺', D: '3 公尺' }, correctAnswer: 'C', explanation: '職業安全衛生設施規則規定，高差超過 2 公尺以上之作業場所應設置防墜設施或使用安全帶。' },
  { id: '4', question: '若發現電線外皮破損、裸露銅線時，正確的處置方式為何？', options: { A: '先用透明膠帶隨意纏繞', B: '只要手乾即可繼續插拔使用', C: '立即通報主管或合格電工維修更換', D: '假裝沒看見繼續工作' }, correctAnswer: 'C', explanation: '破損裸露電線極易引起觸電或電氣火災，應立即停止使用並通報專業人員修繕。' },
  { id: '5', question: '搬運地面重物時，下列何種姿勢最不易導致腰部拉傷？', options: { A: '雙腿打直彎腰搬起', B: '屈膝蹲下、挺直背部，利用腿部力量站起', C: '單手用力側提', D: '快速扭轉腰部甩起' }, correctAnswer: 'B', explanation: '重物應盡量靠近身體，屈膝蹲下保持脊椎自然挺直，利用腿大肌群發力。' },
  { id: '6', question: '進入局限空間（如地下管道、大型儲槽）作業前，首要執行的安全管制步驟為？', options: { A: '點火確認有無可燃氣體', B: '實施通風換氣並測定氧氣及有害氣體濃度', C: '先派一人單獨進去探勘', D: '灑水降溫' }, correctAnswer: 'B', explanation: '局限空間作業必須先實施通風與氣體偵測（氧氣濃度應維持於 18%~23% 之間）。' },
  { id: '7', question: '危險化學品容器外表面標示的「GHS」主要功能為何？', options: { A: '標註化學品售價與批號', B: '以全球一致之危害圖示與警示語提醒安全防範', C: '裝飾包裝', D: '宣傳製造商商標' }, correctAnswer: 'B', explanation: 'GHS 危害標示制度旨在清楚告知操作者化學品之毒性、易燃性、腐蝕性等危害。' },
  { id: '8', question: '遇廠區突發火警警報響起，逃生避難時下列何者為正確作法？', options: { A: '搭乘電梯迅速下樓', B: '沿安全梯下樓，採低姿勢掩住口鼻逃生', C: '返回座位收拾貴重私人物品', D: '往頂樓觀望火勢' }, correctAnswer: 'B', explanation: '火場中濃煙劇毒且向上竄升，切勿搭乘電梯，應循逃生方向低姿勢避難。' },
  { id: '9', question: '操作旋轉機械（如車床、鑽床、砂輪機）時，嚴禁穿戴下列何種個人裝備？', options: { A: '安全護目鏡', B: '棉紗或寬鬆手套', C: '安全鞋', D: '防塵口罩' }, correctAnswer: 'B', explanation: '旋轉機具嚴禁配戴寬鬆手套，避免手套纖維遭旋轉軸捲入造成斷指或嚴重絞傷。' },
  { id: '10', question: '工作中若發生職業災害或重大傷病，第一優先應採取的處置為？', options: { A: '立即通報急救人員並通報主管，迅速實施急救或送醫', B: '先聯絡保險公司理賠', C: '隱瞞不報自行回家休息', D: '拍照上傳社群網路' }, correctAnswer: 'A', explanation: '以人命救護為最高優先，立即進行現場急救並通報救護系統。' },
  { id: '11', question: '滅火器指針若位於「紅色（左側）」區域，代表何種含意？', options: { A: '壓力過大', B: '正常可用', C: '壓力不足，須重新充填', D: '滅火藥劑過期失效' }, correctAnswer: 'C', explanation: '壓力表指針在綠色為正常，位於左側紅色代表壓力不足無法正常噴射。' },
  { id: '12', question: '下列何種安全鞋的防護功能是主要防範重物掉落砸傷腳趾？', options: { A: '鞋頭內襯鋼頭防護', B: '鞋底止滑紋路', C: '透氣網布設計', D: '鞋筒高筒設計' }, correctAnswer: 'A', explanation: '鋼頭安全鞋具備耐壓抗衝擊鋼片，保護腳趾免於重物砸傷。' },
  { id: '13', question: '工廠廠區行走時，下列何種行為屬於不安全行為？', options: { A: '行走於指定人行標線內', B: '邊走路邊低頭滑手機', C: '轉彎處注意堆高機警示', D: '依規定穿著安全鞋' }, correctAnswer: 'B', explanation: '廠區堆高機與搬運車輛頻繁，低頭滑手機極易引發人員撞擊意外。' },
  { id: '14', question: '電氣火災屬於哪一種類型的火災？', options: { A: 'A 類火災', B: 'B 類火災', C: 'C 類火災', D: 'D 類火災' }, correctAnswer: 'C', explanation: '火災分類：A 普通可燃物、B 油類易燃液體、C 電氣火災、D 金屬火災。' },
  { id: '15', question: '發生 C 類電氣設備火災時，切不可使用下列何種滅火劑？', options: { A: '水或泡沫滅火劑', B: '乾粉滅火器', C: '二氧化碳 (CO2) 滅火器', D: '潔淨氣體滅火器' }, correctAnswer: 'A', explanation: '未切斷電源前使用水或泡沫滅火劑，極易造成撲救人員觸電。' },
  { id: '16', question: '從事焊接、熔接等明火作業時，作業現場周遭幾公尺內不得堆放易燃物？', options: { A: '1 公尺', B: '3 公尺', C: '10 公尺', D: '20 公尺' }, correctAnswer: 'C', explanation: '動火作業周遭 10 公尺範圍內應清除易燃物，並備妥滅火器與指派看火人。' },
  { id: '17', question: '現場作業環境實施「5S」運動，其內容包含整理、整頓、清掃、清潔與何者？', options: { A: '速度', B: '素養（紀律習慣）', C: '省錢', D: '升官' }, correctAnswer: 'B', explanation: '5S：整理 (Seiri)、整頓 (Seiton)、清掃 (Seiso)、清潔 (Seiketsu)、素養 (Shitsuke)。' },
  { id: '18', question: '高處作業時，所使用的雙背負式安全帶應繫掛於何處？', options: { A: '活動式梯子上', B: '經檢驗堅固之母索或固定結構物上', C: '同伴身上', D: '機器外殼電線管' }, correctAnswer: 'B', explanation: '安全帶掛鉤必須確實扣掛於堅固之安全母索或足夠耐震拉力的錨定點上。' },
  { id: '19', question: '噪音作業環境中，當八小時日時量平均音壓超過多少分貝時應配戴防音防護具？', options: { A: '60 分貝', B: '70 分貝', C: '85 分貝', D: '100 分貝' }, correctAnswer: 'C', explanation: '勞工暴露於 85 分貝以上之噪音工作環境，雇主應提供並監督勞工確實配戴防音耳塞或耳罩。' },
  { id: '20', question: '吊掛作業中，下列何者為嚴格禁止之不安全行為？', options: { A: '吊掛物下方有人通行或站立', B: '吊鉤設有防滑舌片', C: '鋼索定期檢查有無斷絲', D: '起吊前確認重心平穩' }, correctAnswer: 'A', explanation: '吊運中下方嚴禁任何人員逗留或穿越，防止脫鉤墜落砸傷。' },
  { id: '21', question: '化學品噴濺至眼睛或皮膚時，應立即以大量清水持續沖洗至少多久？', options: { A: '1 分鐘', B: '3 分鐘', C: '5 分鐘', D: '15 分鐘以上' }, correctAnswer: 'D', explanation: '化學品侵入眼部或皮膚，應立即前往緊急沖淋洗眼器連續沖洗 15 分鐘以上並儘速送醫。' },
  { id: '22', question: '使用活動直梯或合梯作業時，梯腳與地面夾角約保持幾度最為穩定安全？', options: { A: '45 度', B: '75 度', C: '90 度', D: '30 度' }, correctAnswer: 'B', explanation: '梯子安全擺放傾斜度約為 75 度（梯長比約 4:1），並應設有止滑套防滑。' },
  { id: '23', question: '對於機器設備上的緊急停止按鈕 (E-STOP)，下列敘述何者正確？', options: { A: '只能當作日常下班關機按鈕使用', B: '發生突發危險狀況時立即拍下切斷動力', C: '不可隨便觸碰，就算有人被捲入也不能按', D: '按完後不需排除障礙即可轉開重啟' }, correctAnswer: 'B', explanation: '緊急停止按鈕為突發事故之緊急煞車機制，拍下後設備立即中斷動力輸出。' },
  { id: '24', question: '下列何種氣體無色無味，極易與血液中血紅素結合引起缺氧窒息？', options: { A: '氧氣', B: '一氧化碳 (CO)', C: '二氧化碳', D: '氮氣' }, correctAnswer: 'B', explanation: '一氧化碳無色無味不易察覺，其與血紅素結合力為氧氣的 200 倍以上，極易致死。' },
  { id: '25', question: '在潮濕場所或鋼板上使用移動式電動工具時，電路前端必須裝設何種裝置？', options: { A: '漏電斷路器 (ELCB)', B: '穩壓器', C: '延長線開關', D: '溫度計' }, correctAnswer: 'A', explanation: '漏電斷路器能在微小漏電發生時以毫秒級速度切斷電源，防止作業員感電致命。' },
  { id: '26', question: '砂輪機更換新砂輪片後，於正式研磨使用前應先空轉測試多久以確保無碎裂隱患？', options: { A: '5 秒鐘', B: '1 分鐘以上', C: '不必空轉', D: '10 分鐘' }, correctAnswer: 'B', explanation: '新裝砂輪片在防護罩完好狀態下應至少試運轉 1 分鐘以上，確認動平衡且無裂痕。' },
  { id: '27', question: '堆高機於廠區行駛時，其貨叉離地面之安全高度約為多少？', options: { A: '離地 15 至 30 公分', B: '離地 100 公分', C: '升至最高點', D: '直接拖行於地面' }, correctAnswer: 'A', explanation: '堆高機行駛時貨叉應升離地面 15~30 公分並後傾，保持最低重心以防翻覆。' },
  { id: '28', question: '進行機械設備之檢修、保養或清潔作業時，應實施何項安全管制作業？', options: { A: '邊運轉邊清洗省時間', B: '上鎖掛牌 (LOTO - Lockout/Tagout)', C: '請同事在旁邊幫忙加油', D: '調高轉速快速通過' }, correctAnswer: 'B', explanation: '檢修作業必須停機切斷能源，並於電源處上鎖及懸掛「禁止送電維修中」警告標籤。' },
  { id: '29', question: '依職業安全衛生法規定，勞工對於雇主依法提供之個人防護裝備有何義務？', options: { A: '可自由選擇戴或不戴', B: '有確實穿戴及遵守作業規範之義務', C: '可私自變賣帶回家', D: '嫌麻煩時丟棄' }, correctAnswer: 'B', explanation: '勞工有依標準穿戴安全護具之法定義務，違反規定經查屬實可處罰鍰。' },
  { id: '30', question: '下列何者不是預防感電災害的正確措施？', options: { A: '濕手觸摸電器開關或插座', B: '電氣設備外殼施作接地保護', C: '定期檢查電線絕緣包覆', D: '停電檢修掛牌確認' }, correctAnswer: 'A', explanation: '人體潮濕時電阻極大幅度降低，濕手觸碰電源極易造成嚴重感電。' },
  { id: '31', question: '工廠車間之逃生逃生路線與安全門，平時應維持何種狀態？', options: { A: '堆滿備用存貨充分利用空間', B: '常時保持暢通無阻且不得上鎖', C: '以鐵鍊牢固上鎖防小偷', D: '僅供特定主管通行' }, correctAnswer: 'B', explanation: '逃生避難走道、安全梯及緊急出口嚴禁堆置任何雜物，確保火災時暢通無阻。' },
  { id: '32', question: '在具有粉塵飛揚的作業場所中，下列何種個人防護具最能有效防範吸入肺部？', options: { A: '一般紙質或棉布口罩', B: '合格之防塵防毒過濾式口罩 (如 N95 或 P100 等級)', C: '塑膠面罩', D: '太陽眼鏡' }, correctAnswer: 'B', explanation: '一般活性碳或棉口罩孔洞過大無法阻隔細微粉塵，應選用防塵認證濾棉口罩。' },
  { id: '33', question: '操作天車 (固定式起重機) 吊運工件時，吊升之第一階段應先離地幾公分確認平穩？', options: { A: '離地 10~20 公分稍停確認重心與煞車無虞', B: '一口氣直接吊上頂點', C: '吊掛至胸口高度再看', D: '完全不離地直接拖拉' }, correctAnswer: 'A', explanation: '試吊作業：工件剛離地 10~20 公分應即刻暫停，確認制動機能、繩索張力均勻平衡後再行起吊。' },
  { id: '34', question: '在易燃溶劑清洗作業區，作業人員服裝應避免穿著何種材質以防靜電火花？', options: { A: '純棉衣物', B: '易蓄積靜電之化學合成纖維衣物', C: '防靜電工作服', D: '防靜電工作鞋' }, correctAnswer: 'B', explanation: '人造化纖摩擦極易產生數千伏特靜電，放電火花足以引燃易燃化學氣體引發爆炸。' },
  { id: '35', question: '急救 CPR（心肺復甦術）成人胸外按壓之位置與速率為？', options: { A: '左胸鎖骨處，每分鐘 60 次', B: '兩乳頭連線胸骨中央，每分鐘 100~120 次', C: '腹部肚臍，每分鐘 50 次', D: '喉嚨下方，每分鐘 150 次' }, correctAnswer: 'B', explanation: '按壓胸骨中段，深度約 5~6 公分，維持每分鐘 100~120 次之均勻快壓。' },
  { id: '36', question: '當高壓鋼瓶（如氧氣瓶、乙炔瓶）儲存於廠區時，應如何妥善固定？', options: { A: '平躺任意堆在走道旁', B: '直立放置並以鏈條或金屬架固定，避免碰撞傾倒', C: '倒放懸空吊掛', D: '放在陽光烈日下曝曬' }, correctAnswer: 'B', explanation: '高壓氣瓶受撞擊或閥門斷裂會如火箭般噴射傷人，必須常時直立鍊條固定並加蓋護罩。' },
  { id: '37', question: '新進同仁進入工作崗位前，參加安全衛生教育訓練之核心價值為？', options: { A: '應付法規打卡即可', B: '建立危險感知意識，保障自身與夥伴生命安全，預防災害發生', C: '趁機聊天休息', D: '爭取加班時數' }, correctAnswer: 'B', explanation: '工安教育訓練旨在培養危害辨識與標準防護知能，落實「安全第一、零災害」。' },
  { id: '38', question: '在堆高機倒車行駛或視線受阻時，駕駛員應採取何項正確措施？', options: { A: '直接加速衝過去', B: '鳴喇叭示警，減速慢行並確認後方死角安全', C: '單手抓方向盤身體完全轉過去不看前方', D: '閉上眼睛行駛' }, correctAnswer: 'B', explanation: '堆高機載貨前行受阻時應倒車行駛，行經交叉路口或盲區應停看聽並鳴喇叭示警。' },
  { id: '39', question: '在工作現場若遭遇不安全狀況（如護罩損壞、漏油、異音），同仁應有何反應？', options: { A: '發揮同舟共濟精神，主動通報領班或安全主管派員改善', B: '等出事被長官發現再說', C: '裝作不知情快速避開', D: '拍照嘲笑同事' }, correctAnswer: 'A', explanation: '主動發掘通報虛驚事故與不安全環境，是防範重大災害於未然之最關鍵環節。' },
  { id: '40', question: '樹億興業股份有限公司全員落實職業安全衛生政策之終極目標為？', options: { A: '減少罰款', B: '落實零職災、零傷害，守護每一位同仁平平安安上班、快快樂樂回家', C: '增加出貨壓力', D: '提高考核競爭' }, correctAnswer: 'B', explanation: '勞工生命安全與身心健康為企業永續經營之基石，全員齊心協力打造安全健康的作業環境。' }
];

/**
 * 從 Google Apps Script 獲取隨機題目 (若為離線或 Mock 則隨機提供 40 題)
 */
export async function fetchQuestions(count = 40) {
  const { gasUrl, isMock } = getRuntimeConfig();

  // 若為模擬模式或尚未填入 URL
  if (isMock) {
    await new Promise(r => setTimeout(r, 600));
    const shuffled = [...SAFETY_QUESTION_BANK].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));
    return {
      success: true,
      count: selected.length,
      isMock: true,
      questions: selected.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
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
    console.warn('連線至 Google Apps Script 失敗，自動切換為本機題庫：', error);
    const shuffled = [...SAFETY_QUESTION_BANK].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));
    return {
      success: true,
      count: selected.length,
      isMock: true,
      fallbackError: error.message,
      questions: selected.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })),
    };
  }
}

/**
 * 提交玩家作答至 Google Apps Script
 */
export async function submitAnswers({ userId, userName, answers, passThreshold }) {
  const { gasUrl, isMock } = getRuntimeConfig();

  // 若為模擬模式或連線失敗降級
  if (isMock) {
    await new Promise(r => setTimeout(r, 800));
    return handleMockSubmission({ userId, userName, answers, passThreshold });
  }

  try {
    const payload = {
      userId,
      userName: userName || '',
      answers,
      passThreshold,
    };

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
      userName,
      isMock: false,
    };
  } catch (error) {
    console.warn('提交至 Google Apps Script 失敗，使用本機模擬結算：', error);
    const mockRes = handleMockSubmission({ userId, userName, answers, passThreshold });
    mockRes.fallbackError = error.message;
    return mockRes;
  }
}

let inMemoryMockSheets = [];

/**
 * 本機模擬計算與「回答」工作表記錄邏輯
 */
function handleMockSubmission({ userId, userName, answers, passThreshold }) {
  const submittedIds = Object.keys(answers);
  let correctCount = 0;
  const reviewList = [];

  const mockMap = {};
  SAFETY_QUESTION_BANK.forEach(q => {
    mockMap[q.id] = q;
  });

  submittedIds.forEach(id => {
    const qInfo = mockMap[id] || {
      id,
      question: `題目 #${id}`,
      options: { A: 'A', B: 'B', C: 'C', D: 'D' },
      correctAnswer: 'A',
      explanation: '安全守則指引'
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
  const passed = score >= 80; // 80 分以上及格
  const now = new Date();
  const timestamp = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

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
      '姓名': userName || prev['姓名'] || '',
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
      '姓名': userName || '',
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
    userName,
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
