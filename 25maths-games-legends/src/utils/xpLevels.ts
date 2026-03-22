// XP Level System — wraps total_score into military ranks (三国军衔)
// 50 levels, exponential XP curve, Three Kingdoms rank names in 3 languages

export type LevelInfo = {
  level: number;
  rank: { zh: string; zh_TW: string; en: string };
  currentXP: number;       // XP accumulated in current level
  xpForNextLevel: number;  // XP needed to reach next level (0 at max)
  totalXPForLevel: number; // Total XP needed to reach this level
  progress: number;        // 0–1 progress within current level
};

// XP thresholds: level N requires sum of base * multiplier^(N-1)
// Designed so level 1 = 0 XP, level 50 ≈ 500,000 XP
const BASE_XP = 50;
const GROWTH = 1.12;

// Pre-compute cumulative XP thresholds for each level
const XP_THRESHOLDS: number[] = [0]; // level 1 = 0 XP
for (let i = 1; i < 50; i++) {
  const needed = Math.round(BASE_XP * Math.pow(GROWTH, i - 1));
  XP_THRESHOLDS.push(XP_THRESHOLDS[i - 1] + needed);
}

// 50 Three Kingdoms military ranks (黄巾兵 → 大将军)
const RANK_TITLES: { zh: string; zh_TW: string; en: string }[] = [
  { zh: '黄巾兵', zh_TW: '黃巾兵', en: 'Yellow Turban Recruit' },        // 1
  { zh: '义勇兵', zh_TW: '義勇兵', en: 'Volunteer Soldier' },            // 2
  { zh: '步兵', zh_TW: '步兵', en: 'Infantry' },                         // 3
  { zh: '弓兵', zh_TW: '弓兵', en: 'Archer' },                           // 4
  { zh: '骑兵', zh_TW: '騎兵', en: 'Cavalry' },                          // 5
  { zh: '什长', zh_TW: '什長', en: 'Squad Leader' },                     // 6
  { zh: '伍长', zh_TW: '伍長', en: 'Section Leader' },                   // 7
  { zh: '队率', zh_TW: '隊率', en: 'Platoon Commander' },                // 8
  { zh: '屯长', zh_TW: '屯長', en: 'Company Captain' },                  // 9
  { zh: '军侯', zh_TW: '軍侯', en: 'Battalion Officer' },               // 10
  { zh: '司马', zh_TW: '司馬', en: 'Field Marshal' },                    // 11
  { zh: '别部司马', zh_TW: '別部司馬', en: 'Deputy Marshal' },           // 12
  { zh: '都尉', zh_TW: '都尉', en: 'Commandant' },                      // 13
  { zh: '骑都尉', zh_TW: '騎都尉', en: 'Cavalry Commandant' },          // 14
  { zh: '校尉', zh_TW: '校尉', en: 'Colonel' },                         // 15
  { zh: '裨将军', zh_TW: '裨將軍', en: 'Junior General' },               // 16
  { zh: '偏将军', zh_TW: '偏將軍', en: 'Adjutant General' },             // 17
  { zh: '牙门将军', zh_TW: '牙門將軍', en: 'Gate General' },             // 18
  { zh: '讨逆将军', zh_TW: '討逆將軍', en: 'Rebellion Suppressor' },     // 19
  { zh: '荡寇将军', zh_TW: '蕩寇將軍', en: 'Bandit Queller' },          // 20
  { zh: '征虏将军', zh_TW: '征虜將軍', en: 'Campaign General' },         // 21
  { zh: '镇军将军', zh_TW: '鎮軍將軍', en: 'Garrison General' },         // 22
  { zh: '安西将军', zh_TW: '安西將軍', en: 'Western Pacifier' },         // 23
  { zh: '平北将军', zh_TW: '平北將軍', en: 'Northern Pacifier' },        // 24
  { zh: '奋威将军', zh_TW: '奮威將軍', en: 'Valor General' },            // 25
  { zh: '前将军', zh_TW: '前將軍', en: 'Vanguard General' },             // 26
  { zh: '后将军', zh_TW: '後將軍', en: 'Rearguard General' },            // 27
  { zh: '左将军', zh_TW: '左將軍', en: 'Left Flank General' },           // 28
  { zh: '右将军', zh_TW: '右將軍', en: 'Right Flank General' },          // 29
  { zh: '卫将军', zh_TW: '衛將軍', en: 'Imperial Guard General' },       // 30
  { zh: '车骑将军', zh_TW: '車騎將軍', en: 'Chariot General' },          // 31
  { zh: '骠骑将军', zh_TW: '驃騎將軍', en: 'Swift Cavalry General' },    // 32
  { zh: '征东将军', zh_TW: '征東將軍', en: 'Eastern Conqueror' },        // 33
  { zh: '征西将军', zh_TW: '征西將軍', en: 'Western Conqueror' },        // 34
  { zh: '征南将军', zh_TW: '征南將軍', en: 'Southern Conqueror' },       // 35
  { zh: '征北将军', zh_TW: '征北將軍', en: 'Northern Conqueror' },       // 36
  { zh: '四征将军', zh_TW: '四征將軍', en: 'Grand Conqueror' },          // 37
  { zh: '镇东将军', zh_TW: '鎮東將軍', en: 'Eastern Warden' },          // 38
  { zh: '镇西将军', zh_TW: '鎮西將軍', en: 'Western Warden' },          // 39
  { zh: '镇南将军', zh_TW: '鎮南將軍', en: 'Southern Warden' },         // 40
  { zh: '四镇将军', zh_TW: '四鎮將軍', en: 'Grand Warden' },            // 41
  { zh: '大都督', zh_TW: '大都督', en: 'Grand Commander' },              // 42
  { zh: '太尉', zh_TW: '太尉', en: 'Grand Commandant' },                // 43
  { zh: '司徒', zh_TW: '司徒', en: 'Minister of Works' },               // 44
  { zh: '司空', zh_TW: '司空', en: 'Minister of Education' },            // 45
  { zh: '丞相', zh_TW: '丞相', en: 'Prime Minister' },                   // 46
  { zh: '大司马', zh_TW: '大司馬', en: 'Grand Marshal' },                // 47
  { zh: '天下兵马大元帅', zh_TW: '天下兵馬大元帥', en: 'Supreme Commander' }, // 48
  { zh: '九锡之尊', zh_TW: '九錫之尊', en: 'Nine Bestowments' },        // 49
  { zh: '大将军', zh_TW: '大將軍', en: 'Grand General' },                // 50
];

export function getLevelInfo(totalScore: number): LevelInfo {
  // Find current level (highest level whose threshold we've passed)
  let level = 1;
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalScore >= XP_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }

  const currentThreshold = XP_THRESHOLDS[level - 1];
  const nextThreshold = level < 50 ? XP_THRESHOLDS[level] : currentThreshold;
  const xpForNextLevel = level < 50 ? nextThreshold - currentThreshold : 0;
  const currentXP = level < 50 ? totalScore - currentThreshold : 0;
  const progress = xpForNextLevel > 0 ? Math.min(1, currentXP / xpForNextLevel) : 1;

  return {
    level,
    rank: RANK_TITLES[level - 1],
    currentXP,
    xpForNextLevel,
    totalXPForLevel: currentThreshold,
    progress,
  };
}

export { RANK_TITLES, XP_THRESHOLDS };
