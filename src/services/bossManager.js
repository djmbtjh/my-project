/**
 * 100 位 Pixel 風格關主管理與 DiceBear 素材預載入模組
 */

// 酷炫科幻稱號與姓名素材庫
const TITLES = [
  '量子裂變者', '零日漏洞幽靈', '深淵防火牆', '賽博巨神兵', '星系解碼魔眼',
  '虛空編譯器', '奈米病毒領主', '矩陣破壞神', '數位九頭蛇', '核心幽靈駭客',
  '位元終結者', '光速封包盜賊', '加密魔導士', '超頻支配者', '電磁脈衝暴君',
  '神經網路主腦', '多維度伺服巨獸', '逆向工程死神', '二進位幻影', '晶片領航員'
];

const BOSS_NAMES = [
  'Aegis-9', 'Viper-X', 'Chronos', 'Glitch-Lord', 'Cipher-Null',
  'Nexus-Prime', 'Omega-Byte', 'Spectre-01', 'Synapse-Z', 'Vortex-Core',
  'Phantom-Grid', 'Titan-Hex', 'Zero-Kelvin', 'Hydra-Bit', 'Pulse-Echo',
  'Apex-Logic', 'Krypton-7', 'Nova-Bug', 'Archon-Net', 'Quantum-Reaper'
];

const TAUNT_QUOTES = [
  '你通得過我的防火牆算你走運！',
  '區區人類的思維，怎能突破我的神經協議？',
  '計算錯誤的下場只有被格式化！',
  '你的回答漏洞百出，準備好被覆寫了嗎？',
  '我的演算法早已預測了你的一切選擇！',
  '資料流正在反噬你，快放棄吧！',
  '我的防禦邏輯是堅不可摧的！'
];

const HURT_QUOTES = [
  '什麼？！神經節點出現異常波動！',
  '我的邏輯防線竟然被穿透了？！',
  '不可思議...你竟然能解出這題！',
  '核心溫度正在飆升...！',
  '該死！防火牆正在崩潰！'
];

const DEFEAT_QUOTES = [
  '系統臨界崩潰...你通過了此關！',
  '不可能...我竟然會被解碼！',
  '前方的防線只會更加殘酷...去吧！'
];

/**
 * 產生 100 位獨立的關主資料
 */
export function generate100Bosses() {
  const bosses = [];
  for (let i = 1; i <= 100; i++) {
    const seed = `cyber-pixel-boss-${i}-${(i * 37) % 997}`;
    const title = TITLES[(i - 1) % TITLES.length];
    const name = `${BOSS_NAMES[(i - 1) % BOSS_NAMES.length]}#${String(i).padStart(3, '0')}`;
    
    // DiceBear Pixel-Art API (SVG 格式，清晰度極佳)
    const avatarUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}&size=180`;

    bosses.push({
      id: i,
      seed,
      name,
      title,
      avatarUrl,
      level: Math.floor((i - 1) / 10) + 1,
      maxHp: 100,
      currentHp: 100,
      taunt: TAUNT_QUOTES[(i * 3) % TAUNT_QUOTES.length],
      hurtQuote: HURT_QUOTES[(i * 5) % HURT_QUOTES.length],
      defeatQuote: DEFEAT_QUOTES[(i * 7) % DEFEAT_QUOTES.length],
    });
  }
  return bosses;
}

// 靜態 100 位關主池
export const ALL_100_BOSSES = generate100Bosses();

// 預先載入管理員
class BossPreloader {
  constructor() {
    this.loadedCount = 0;
    this.total = ALL_100_BOSSES.length;
    this.isCompleted = false;
    this.cachedImages = new Map();
  }

  /**
   * 預先載入 100 張關主圖片素材
   * @param {Function} onProgress (loaded, total, percent) => void
   */
  async preloadAll(onProgress) {
    if (this.isCompleted) {
      if (onProgress) onProgress(this.total, this.total, 100);
      return Promise.resolve();
    }

    const promises = ALL_100_BOSSES.map(boss => {
      return new Promise(resolve => {
        const img = new Image();
        img.src = boss.avatarUrl;
        img.onload = () => {
          this.loadedCount++;
          this.cachedImages.set(boss.id, img);
          if (onProgress) {
            const pct = Math.floor((this.loadedCount / this.total) * 100);
            onProgress(this.loadedCount, this.total, pct);
          }
          resolve(true);
        };
        img.onerror = () => {
          // 即使失敗也計入並容錯，避免卡死進度條
          this.loadedCount++;
          if (onProgress) {
            const pct = Math.floor((this.loadedCount / this.total) * 100);
            onProgress(this.loadedCount, this.total, pct);
          }
          resolve(false);
        };
      });
    });

    await Promise.all(promises);
    this.isCompleted = true;
  }

  /**
   * 隨機挑選指定數量的關主（不重複）
   */
  pickRandomBosses(count) {
    const shuffled = [...ALL_100_BOSSES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(boss => ({
      ...boss,
      currentHp: 100,
    }));
  }
}

export const bossPreloader = new BossPreloader();
