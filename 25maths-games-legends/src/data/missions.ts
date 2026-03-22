import type { Mission } from '../types';

export const MISSIONS: Mission[] = [
  // --- Year 7 Unit 0: 桃园点兵·数论篇 (Number Foundations) ---
  {
    id: 698, grade: 7, unitId: 0, order: -2,
    unitTitle: { zh: "Unit 0: 桃园点兵·数论篇", en: "Unit 0: Peach Garden — Number Theory" },
    topic: 'Algebra', type: 'FACTORS_LIST',
    title: { zh: '点兵编队', en: 'Troop Formation Count' },
    skillName: { zh: '因数列举术', en: 'Listing Factors' },
    skillSummary: { zh: '因数就是能整除一个数的数——把士兵分成几种等分方式', en: 'Factors are numbers that divide evenly — find all ways to split soldiers into equal groups' },
    story: { zh: '刘备刚招募了一批新兵，要想办法编队。24 个士兵可以分成几种等人数的队？2 人一队、3 人一队、4 人一队...把所有可能的分法都找出来！', en: 'Liu Bei just recruited soldiers and needs to form squads. 24 soldiers — how many ways to divide them into equal groups? 2 per squad, 3 per squad, 4 per squad... find all possible divisions!' },
    description: { zh: '这个数有几个因数？', en: 'How many factors does this number have?' },
    data: { n: 24, factors: [1, 2, 3, 4, 6, 8, 12, 24], answer: 8, generatorType: 'FACTORS_LIST_RANDOM' }, difficulty: 'Easy', reward: 35,
    kpId: 'kp-1.1-02', sectionId: 'number',
    tutorialSteps: [
      { text: { zh: '刘备：24 个新兵怎么分队？先搞懂"因数"——能把 24 平均分开的数', en: 'Liu Bei: "24 recruits — how to divide? First understand \'factors\' — numbers that divide 24 evenly"' }, hint: { zh: '$24 \\div 2 = 12$（整除 ✓）→ 2 是因数\n$24 \\div 5 = 4.8$（有余数 ✗）→ 5 不是因数', en: '$24 \\div 2 = 12$ (exact ✓) → 2 is a factor\n$24 \\div 5 = 4.8$ (remainder ✗) → 5 is not' }, highlightField: 'ans' },
      { text: { zh: '刘备：因数成对出现——$1 \\times 24 = 24$，$2 \\times 12 = 24$，$3 \\times 8 = 24$，$4 \\times 6 = 24$', en: 'Liu Bei: "Factors come in pairs: $1 \\times 24$, $2 \\times 12$, $3 \\times 8$, $4 \\times 6$"' }, highlightField: 'ans' },
      { text: { zh: '刘备：所以 24 的全部因数是 $1, 2, 3, 4, 6, 8, 12, 24$——共 8 个', en: 'Liu Bei: "All factors of 24: $1, 2, 3, 4, 6, 8, 12, 24$ — total 8"' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '因数是能整除一个数的数。因数成对出现，一对乘起来等于原数。', en: 'Factors divide a number evenly. They come in pairs whose product is the original number.' }, formula: { zh: '$n = a \\times b \\Rightarrow a, b \\text{ 都是 } n \\text{ 的因数}$', en: '$n = a \\times b \\Rightarrow a, b \\text{ are factors of } n$' }, tips: [{ zh: '刘备提示：编队方式越多，战术越灵活！', en: 'Liu Bei Tip: More ways to divide = more tactical flexibility!' }] }
  },
  {
    id: 699, grade: 7, unitId: 0, order: -1,
    unitTitle: { zh: "Unit 0: 桃园点兵·数论篇", en: "Unit 0: Peach Garden — Number Theory" },
    topic: 'Algebra', type: 'PRIME',
    title: { zh: '选拔亲卫', en: 'Selecting Elite Guards' },
    skillName: { zh: '质数辨识术', en: 'Prime Recognition' },
    skillSummary: { zh: '质数只能被 1 和自己整除', en: 'Primes are only divisible by 1 and themselves' },
    story: { zh: '桃园结义后要选拔精锐亲卫。"质数战士"不能被拆分——只听命于天子和自己。判断一个数是不是质数！', en: 'After the oath, elite guards must be selected. "Prime warriors" cannot be split — they answer only to the emperor and themselves. Determine if a number is prime!' },
    description: { zh: '判断这个数是不是质数。', en: 'Determine if this number is prime.' },
    data: { n: 17, isPrime: true, generatorType: 'PRIME_RANDOM' }, difficulty: 'Easy', reward: 35,
    kpId: 'kp-1.1-01', sectionId: 'number',
    tutorialSteps: [
      { text: { zh: '诸葛亮：什么是质数？只能被 1 和它自己整除的数', en: 'Zhuge Liang: "What is a prime? A number divisible only by 1 and itself"' }, hint: { zh: '比如 7：7÷2=3.5 ✗，7÷3=2.3 ✗，7÷4=1.75 ✗ ...\n除了 1 和 7，没有别的数能整除它 → 7 是质数', en: 'E.g. 7: 7÷2=3.5 ✗, 7÷3=2.3 ✗, 7÷4=1.75 ✗...\nNo number other than 1 and 7 divides it → 7 is prime' }, highlightField: 'ans' },
      { text: { zh: '诸葛亮：不是质数的叫"合数"——能被拆开', en: 'Zhuge Liang: "Non-primes are composites — they can be split"' }, hint: { zh: '比如 12 ÷ 2 = 6 ✓ → 12 不是质数\n12 = 2 × 6 = 2 × 2 × 3（能拆开）', en: 'E.g. 12 ÷ 2 = 6 ✓ → 12 is not prime\n12 = 2 × 6 = 2 × 2 × 3 (can be split)' }, highlightField: 'ans' },
      { text: { zh: '诸葛亮：注意——1 不是质数，2 是唯一的偶数质数', en: 'Zhuge Liang: "Note: 1 is NOT prime. 2 is the only even prime"' }, hint: { zh: '1 不算（只有 1 个因数）\n2 是质数（只能被 1 和 2 整除）\n所有其他偶数都能被 2 整除 → 不是质数', en: '1 doesn\'t count (only 1 factor)\n2 is prime (only 1 and 2)\nAll other even numbers are divisible by 2 → not prime' }, highlightField: 'ans' },
      { text: { zh: '诸葛亮：前 10 个质数：$2, 3, 5, 7, 11, 13, 17, 19, 23, 29$', en: 'Zhuge Liang: "First 10 primes: $2, 3, 5, 7, 11, 13, 17, 19, 23, 29$"' }, highlightField: 'ans' }
    ],
    secret: { concept: { zh: '质数是只能被 1 和自己整除的数，是所有整数的"基本零件"。', en: 'Primes are numbers divisible only by 1 and themselves — the building blocks of all integers.' }, formula: { zh: '$\\text{质数 = 只被 1 和自己整除}$', en: '$\\text{Prime = only divisible by 1 and itself}$' }, tips: [{ zh: '诸葛亮提示：质数是万数之本，先识别它们，才能做因数分解。', en: 'Zhuge Liang Tip: Primes are the foundation — identify them first, then factorize.' }] }
  },
  {
    id: 700, grade: 7, unitId: 0, order: 0,
    unitTitle: { zh: "Unit 0: 桃园点兵·数论篇", en: "Unit 0: Peach Garden — Number Theory" },
    topic: 'Algebra', type: 'FACTOR_TREE',
    title: { zh: '拆解兵力', en: 'Breaking Down Forces' },
    skillName: { zh: '质因数分解术', en: 'Prime Factorization' },
    skillSummary: { zh: '把一个数拆成质数的乘积', en: 'Break a number into a product of primes' },
    story: { zh: '桃园结义后要编制军队。一批新兵要拆成最小的战斗单元——每个单元只有"质数"人。', en: 'After the oath, the army needs organizing. New recruits must be split into smallest units — each with a prime number of soldiers.' },
    description: { zh: '把这个数拆成质因数，数一数共几个。', en: 'Factorize this number into primes and count them.' },
    data: { n: 24, primeCount: 4, generatorType: 'FACTOR_TREE_RANDOM' }, difficulty: 'Easy', reward: 40,
    kpId: 'kp-1.1-08', sectionId: 'number',
    tutorialSteps: [
      { text: { zh: '诸葛亮：24 个新兵，怎么拆成最小的战斗单元？', en: 'Zhuge Liang: "24 recruits — how to split into smallest units?"' }, hint: { zh: '最小单元就是质数：2, 3, 5, 7...\n质数只能被 1 和自己整除', en: 'Smallest units are primes: 2, 3, 5, 7...\nPrimes are only divisible by 1 and themselves' }, highlightField: 'ans' },
      { text: { zh: '诸葛亮：从 2 开始试。24÷2=12，记下 2', en: 'Zhuge Liang: "Start with 2. 24÷2=12, note 2"' }, highlightField: 'ans' },
      { text: { zh: '诸葛亮：12÷2=6，记下 2。6÷2=3，记下 2。3 是质数，停！', en: 'Zhuge Liang: "12÷2=6, note 2. 6÷2=3, note 2. 3 is prime, stop!"' }, highlightField: 'ans' },
      { text: { zh: '诸葛亮：$24 = 2 \\times 2 \\times 2 \\times 3 = 2^3 \\times 3$，共 4 个质因数', en: 'Zhuge Liang: "$24 = 2 \\times 2 \\times 2 \\times 3 = 2^3 \\times 3$, 4 prime factors total"' }, highlightField: 'ans' }
    ],
    secret: { concept: { zh: '任何大于 1 的整数都能唯一地分解为质数的乘积。', en: 'Every integer greater than 1 can be uniquely expressed as a product of primes.' }, formula: { zh: '$\\text{因数树：从上往下拆到全是质数}$', en: '$\\text{Factor tree: split top-down until all primes}$' }, tips: [{ zh: '诸葛亮提示：知己知彼，先把自己的兵力拆解清楚。', en: 'Zhuge Liang Tip: Know yourself — first break down your own forces clearly.' }] }
  },
  {
    id: 701, grade: 7, unitId: 0, order: 1,
    unitTitle: { zh: "Unit 0: 桃园点兵·数论篇", en: "Unit 0: Peach Garden — Number Theory" },
    topic: 'Algebra', type: 'HCF',
    title: { zh: '整编队伍', en: 'Organizing Troops' },
    skillName: { zh: '公因数术', en: 'Common Factor' },
    skillSummary: { zh: '最大公因数(HCF)就是两个数共有的最大因数', en: 'HCF: prime factorize, then take common primes to lowest power' },
    story: { zh: '桃园结义后，刘关张三兄弟开始整编队伍。两营士兵人数不同，要分成人数相同的小队一起操练——每队最多能有几个人？', en: 'After the oath, the brothers organize troops. Two camps with different numbers must split into equal squads for training — what\'s the largest squad size?' },
    description: { zh: '求最大公因数 (HCF)。', en: 'Find the Highest Common Factor (HCF).' },
    data: { numbers: [24, 36], generatorType: 'HCF_RANDOM' }, difficulty: 'Easy', reward: 50,
    kpId: 'kp-1.1-08', sectionId: 'number',
    tutorialSteps: [
      {
        text: { zh: '刘备："两营分别有 24 和 36 名士兵，要分成人数相同的小队，每队最多几人？"', en: 'Liu Bei: "Two camps have 24 and 36 soldiers. Split into equal squads — what is the largest squad size?"' },
        highlightField: 'ans'
      },
      {
        text: { zh: '刘备："先对 24 做质因数分解：$24 = 2^3 \\times 3$"', en: 'Liu Bei: "Prime factorize 24: $24 = 2^3 \\times 3$"' },
        highlightField: 'ans'
      },
      {
        text: { zh: '刘备："再对 36 做质因数分解：$36 = 2^2 \\times 3^2$"', en: 'Liu Bei: "Prime factorize 36: $36 = 2^2 \\times 3^2$"' },
        highlightField: 'ans'
      },
      {
        text: { zh: '刘备："找共有的质因数，取较小的次幂，乘起来：$2^2 \\times 3 = 12$"', en: 'Liu Bei: "Take common primes to lowest power: $2^2 \\times 3 = 12$"' },
        hint: { zh: '公共质因数是 2 和 3\n2 的最低次幂是 $2^2$（取 24 的）\n3 的最低次幂是 $3^1$（取 24 的）', en: 'Common primes are 2 and 3\nLowest power of 2 is $2^2$ (from 24)\nLowest power of 3 is $3^1$ (from 24)' },
        highlightField: 'ans'
      },
      {
        text: { zh: '刘备："所以 HCF(24, 36) = 12！每队 12 人，整编完毕！"', en: 'Liu Bei: "So HCF(24, 36) = 12! 12 soldiers per squad, troops organized!"' },
        highlightField: 'ans'
      }
    ],
    secret: { concept: { zh: 'HCF 是两个数共有质因数（每个取次幂小的那个）的乘积。', en: 'HCF is the product of common prime factors, each taken to the lowest power.' }, formula: { zh: '$\\text{HCF = 短除法左边全乘}$', en: '$\\text{HCF = multiply all left-side divisors}$' }, tips: [{ zh: '刘备提示：队伍整齐，方能出征。', en: 'Liu Bei Tip: Well-organized troops are ready to march.' }] }
  },
  {
    id: 702, grade: 7, unitId: 0, order: 2,
    unitTitle: { zh: "Unit 0: 桃园点兵·数论篇", en: "Unit 0: Peach Garden — Number Theory" },
    topic: 'Algebra', type: 'LCM',
    title: { zh: '巡营排班', en: 'Patrol Schedule' },
    skillName: { zh: '公倍数术', en: 'Common Multiple' },
    skillSummary: { zh: 'LCM：分解质因数，每个质因数取大的那个，乘起来', en: 'LCM: prime factorize, then take all primes to highest power' },
    story: { zh: '甲将军每隔一段时间巡营一次，乙将军也是。上次同日巡营后，下一次两人再次同日是第几天？', en: 'General A patrols at one interval, General B at another. After their last shared patrol day, when is the next time both patrol on the same day?' },
    description: { zh: '求最小公倍数 (LCM)。', en: 'Find the Least Common Multiple (LCM).' },
    data: { numbers: [6, 8], generatorType: 'LCM_RANDOM' }, difficulty: 'Easy', reward: 55,
    kpId: 'kp-1.1-09', sectionId: 'number',
    tutorialSteps: [
      {
        text: { zh: '关羽："我每 6 天巡营一次，张飞每 8 天一次。几天后我们同时巡营？"', en: 'Guan Yu: "I patrol every 6 days, Zhang Fei every 8 days. When do we both patrol together?"' },
        highlightField: 'ans'
      },
      {
        text: { zh: '关羽："先对 6 做质因数分解：$6 = 2 \\times 3$"', en: 'Guan Yu: "Prime factorize 6: $6 = 2 \\times 3$"' },
        highlightField: 'ans'
      },
      {
        text: { zh: '关羽："再对 8 做质因数分解：$8 = 2^3$"', en: 'Guan Yu: "Prime factorize 8: $8 = 2^3$"' },
        highlightField: 'ans'
      },
      {
        text: { zh: '关羽："每个质因数取大的那个，乘起来：$2^3 \\times 3 = 24$"', en: 'Guan Yu: "Take all primes to highest power: $2^3 \\times 3 = 24$"' },
        hint: { zh: '出现过的质因数是 2 和 3\n2 的最高次幂是 $2^3$（取 8 的）\n3 的最高次幂是 $3^1$（取 6 的）', en: 'Primes that appear are 2 and 3\nHighest power of 2 is $2^3$ (from 8)\nHighest power of 3 is $3^1$ (from 6)' },
        highlightField: 'ans'
      },
      {
        text: { zh: '关羽："所以 LCM(6, 8) = 24！每 24 天我们同时巡营！"', en: 'Guan Yu: "So LCM(6, 8) = 24! We both patrol together every 24 days!"' },
        highlightField: 'ans'
      }
    ],
    secret: { concept: { zh: 'LCM 是所有质因数（每个取次幂大的那个）的乘积。', en: 'LCM is the product of all prime factors, each taken to the highest power.' }, formula: { zh: '$\\text{LCM = 左边×底部全乘}$', en: '$\\text{LCM = multiply left side × bottom}$' }, tips: [{ zh: '关羽提示：排班有序，方能守备森严。', en: 'Guan Yu Tip: Orderly schedules make strong defenses.' }] }
  },
  {
    id: 703, grade: 7, unitId: 0, order: 3,
    unitTitle: { zh: "Unit 0: 桃园点兵·数论篇", en: "Unit 0: Peach Garden — Number Theory" },
    topic: 'Algebra', type: 'HCF',
    title: { zh: '平分军粮', en: 'Dividing Grain Equally' },
    skillName: { zh: '因数分解术', en: 'Factorization' },
    skillSummary: { zh: '用 HCF 解决实际均分问题', en: 'Use HCF to solve real equal-sharing problems' },
    story: { zh: '桃园起义前，需要把军粮和兵器分给各村。每村拿到的粮食数量要完全相同，兵器数量也要完全相同，且不能有剩余。最多能分给几个村？', en: 'Before the uprising, grain and weapons must be distributed to villages. Each village gets exactly the same amount of grain and weapons, with nothing left over. What is the maximum number of villages?' },
    description: { zh: '求最大公因数 (HCF)。', en: 'Find the Highest Common Factor (HCF).' },
    data: { numbers: [48, 60], generatorType: 'HCF_RANDOM' }, difficulty: 'Medium', reward: 65,
    kpId: 'kp-1.1-08', sectionId: 'number',
    tutorialSteps: [
      {
        text: { zh: '张飞："俺们有 48 袋粮和 60 把刀，要平分给各村，每村最多能分几份？"', en: 'Zhang Fei: "We have 48 bags of grain and 60 swords. Each village gets equal shares — what is the max per village?"' },
        highlightField: 'ans'
      },
      {
        text: { zh: '张飞："$48 = 2^4 \\times 3$"', en: 'Zhang Fei: "$48 = 2^4 \\times 3$"' },
        highlightField: 'ans'
      },
      {
        text: { zh: '张飞："$60 = 2^2 \\times 3 \\times 5$"', en: 'Zhang Fei: "$60 = 2^2 \\times 3 \\times 5$"' },
        highlightField: 'ans'
      },
      {
        text: { zh: '张飞："公共质因数：2 和 3。取最低次幂：$2^2 \\times 3 = 12$"', en: 'Zhang Fei: "Common primes: 2 and 3. Lowest powers: $2^2 \\times 3 = 12$"' },
        hint: { zh: '5 只出现在 60 里，不是公共因数\n所以不算进 HCF', en: '5 only appears in 60, not a common factor\nSo it is not included in HCF' },
        highlightField: 'ans'
      },
      {
        text: { zh: '张飞："HCF(48, 60) = 12！分给 12 个村，每村 4 袋粮 5 把刀！"', en: 'Zhang Fei: "HCF(48, 60) = 12! Split among 12 villages, each gets 4 bags of grain and 5 swords!"' },
        highlightField: 'ans'
      }
    ],
    secret: { concept: { zh: 'HCF 用于解决"平均分配且无剩余"的问题。', en: 'HCF solves "equal distribution with no remainder" problems.' }, formula: { zh: '$\\text{HCF} = \\text{最大均分数}$', en: '$\\text{HCF} = \\text{largest equal share}$' }, tips: [{ zh: '张飞提示：粮草不均，军心不稳！', en: 'Zhang Fei Tip: Unequal rations cause unrest!' }] }
  },
  // --- Year 7 Unit 0A: 行军算账·正负数篇 ---
  {
    id: 704, grade: 7, unitId: 0, order: 4,
    unitTitle: { zh: "Unit 0A: 行军算账·正负数篇", en: "Unit 0A: March Accounting — Integers" },
    topic: 'Algebra', type: 'INTEGER_ADD',
    title: { zh: '粮草盈亏', en: 'Grain Surplus & Loss' },
    skillName: { zh: '正负加减术', en: 'Integer Addition' },
    skillSummary: { zh: '正数+负数：绝对值大的决定符号', en: 'Positive + negative: the larger absolute value determines the sign' },
    story: { zh: '行军途中，粮草有增有减。正数代表补给，负数代表消耗。', en: 'On the march, supplies rise and fall. Positive means resupply, negative means consumption.' },
    description: { zh: '计算粮草变化。', en: 'Calculate the supply change.' },
    data: { a: 50, b: -30, op: '+', answer: 20, generatorType: 'INTEGER_ADD_RANDOM' }, difficulty: 'Easy', reward: 45,
    kpId: 'kp-1.6-01', sectionId: 'number',
    tutorialSteps: [
      { text: { zh: '诸葛亮："粮仓补给 50 袋，消耗 30 袋。$50 + (-30) = ?$"', en: 'Zhuge Liang: "50 bags resupplied, 30 consumed. $50 + (-30) = ?$"' }, highlightField: 'ans' },
      { text: { zh: '诸葛亮："加一个负数 = 减去它的绝对值。$50 + (-30) = 50 - 30$"', en: 'Zhuge Liang: "Adding a negative = subtracting its absolute value. $50 + (-30) = 50 - 30$"' }, hint: { zh: '正数表示增加，负数表示减少\n加负数就是减去', en: 'Positive = gain, negative = loss\nAdding negative = subtracting' }, highlightField: 'ans' },
      { text: { zh: '诸葛亮："$50 - 30 = 20$！还剩 20 袋粮草。"', en: 'Zhuge Liang: "$50 - 30 = 20$! 20 bags remaining."' }, highlightField: 'ans' }
    ],
    secret: { concept: { zh: '加一个负数就是减去它；结果的正负取决于谁的数字更大。', en: 'Adding a negative = subtracting it; the sign depends on which number is larger.' }, formula: '$a + (-b) = a - b$', tips: [{ zh: '诸葛亮提示：知彼知己，粮草先行。', en: 'Zhuge Liang Tip: Know your supplies before you march.' }] }
  },
  {
    id: 705, grade: 7, unitId: 0, order: 5,
    unitTitle: { zh: "Unit 0A: 行军算账·正负数篇", en: "Unit 0A: March Accounting — Integers" },
    topic: 'Algebra', type: 'INTEGER_ADD',
    title: { zh: '连续损失', en: 'Consecutive Losses' },
    skillName: { zh: '负数相加术', en: 'Adding Negatives' },
    skillSummary: { zh: '两个负数相加：绝对值相加，结果为负', en: 'Adding two negatives: add absolute values, result is negative' },
    story: { zh: '连续两场败仗，士兵不断减员。负数加负数，损失在累积。', en: 'Two consecutive defeats. Negative plus negative — losses accumulate.' },
    description: { zh: '计算总损失。', en: 'Calculate total loss.' },
    data: { a: -20, b: -15, op: '+', answer: -35, generatorType: 'INTEGER_ADD_RANDOM' }, difficulty: 'Easy', reward: 50,
    kpId: 'kp-1.6-01', sectionId: 'number',
    tutorialSteps: [
      { text: { zh: '曹操："先损 20 人，又损 15 人。$(-20) + (-15) = ?$"', en: 'Cao Cao: "Lost 20 soldiers, then 15 more. $(-20) + (-15) = ?$"' }, highlightField: 'ans' },
      { text: { zh: '曹操："两个负数相加，绝对值相加，结果还是负数"', en: 'Cao Cao: "Two negatives added: add absolute values, result stays negative"' }, hint: { zh: '$|-20| + |-15| = 20 + 15 = 35$\n两个都是损失，总损失更大', en: '$|-20| + |-15| = 20 + 15 = 35$\nBoth are losses, so total loss is larger' }, highlightField: 'ans' },
      { text: { zh: '曹操："$(-20) + (-15) = -35$！共损失 35 人，必须补充兵力。"', en: 'Cao Cao: "$(-20) + (-15) = -35$! 35 soldiers lost, must recruit more."' }, highlightField: 'ans' }
    ],
    secret: { concept: { zh: '负数加负数，绝对值相加，符号取负。', en: 'Negative plus negative: add absolute values, keep negative sign.' }, formula: '$(-a) + (-b) = -(a+b)$', tips: [{ zh: '曹操提示：胜败乃兵家常事，关键是算清损失。', en: 'Cao Cao Tip: Victory and defeat are normal — the key is counting your losses.' }] }
  },
  {
    id: 706, grade: 7, unitId: 0, order: 6,
    unitTitle: { zh: "Unit 0A: 行军算账·正负数篇", en: "Unit 0A: March Accounting — Integers" },
    topic: 'Algebra', type: 'INTEGER_ADD',
    title: { zh: '攻守得失', en: 'Gains and Losses' },
    skillName: { zh: '混合运算术', en: 'Mixed Operations' },
    skillSummary: { zh: '正负数混合加减，注意符号', en: 'Mixed positive/negative operations — watch the signs' },
    story: { zh: '一场战斗有得有失。先算总账，看看净变化是正还是负。', en: 'Every battle has gains and losses. Calculate the net change.' },
    description: { zh: '计算净变化。', en: 'Calculate the net change.' },
    data: { a: 40, b: 60, op: '-', answer: -20, generatorType: 'INTEGER_ADD_RANDOM' }, difficulty: 'Medium', reward: 55,
    kpId: 'kp-1.6-02', sectionId: 'number',
    tutorialSteps: [
      { text: { zh: '关羽："战后先得 40 人投诚，又有 60 人离去。$40 - 60 = ?$"', en: 'Guan Yu: "After battle, 40 joined us but 60 left. $40 - 60 = ?$"' }, highlightField: 'ans' },
      { text: { zh: '关羽："减去的数比原来大，结果就变成负数了"', en: 'Guan Yu: "Subtracting more than you have gives a negative result"' }, hint: { zh: '减去比自己大的数 → 结果为负\n$40 - 60 = -(60 - 40) = -20$', en: 'Subtracting more than you have → negative\n$40 - 60 = -(60 - 40) = -20$' }, highlightField: 'ans' },
      { text: { zh: '关羽："$40 - 60 = -20$！净减少 20 人。"', en: 'Guan Yu: "$40 - 60 = -20$! Net loss of 20."' }, highlightField: 'ans' }
    ],
    secret: { concept: { zh: '减去比自己大的数，结果为负。', en: 'Subtracting more than you have gives a negative.' }, formula: '$a - b = -(b - a)$ when $b > a$', tips: [{ zh: '关羽提示：胜败之间，一算便知。', en: 'Guan Yu Tip: Between victory and defeat, the numbers tell all.' }] }
  },
  // --- Year 7 Unit 0A 续: 整数乘除 ---
  {
    id: 693, grade: 7, unitId: 0, order: 6.5,
    unitTitle: { zh: "Unit 0A: 行军算账·正负数篇", en: "Unit 0A: March Accounting — Integers" },
    topic: 'Algebra', type: 'INTEGER_MUL',
    title: { zh: '敌退我进', en: 'Enemy Retreats, We Advance' },
    skillName: { zh: '正负数乘除术', en: 'Integer Multiply/Divide' },
    skillSummary: { zh: '同号得正，异号得负——先定符号，再算数值', en: 'Same signs → positive, different signs → negative' },
    story: { zh: '张飞在追击中发现规律：敌人每天后退（负方向）5 里，连续后退了 3 天。敌人的总位移是多少？负数乘以正数，还是负的！但如果取消撤退呢？', en: 'Zhang Fei spots a pattern while pursuing: the enemy retreats (negative) 5 li per day, for 3 days. What\'s the total displacement? Negative times positive stays negative! But what if the retreat is cancelled?' },
    description: { zh: '计算正负数的乘法或除法。', en: 'Calculate with negative multiplication or division.' },
    data: { a: -5, b: 3, answer: -15, op: '×', mode: 'mul', generatorType: 'INTEGER_MUL_RANDOM' }, difficulty: 'Medium', reward: 50,
    kpId: 'kp-1.6-03', sectionId: 'number',
    tutorialSteps: [
      { text: { zh: '张飞：正负数乘除——口诀：同号得正，异号得负', en: 'Zhang Fei: "Rule: same signs → positive, different signs → negative"' }, hint: { zh: '正 × 正 = 正\n负 × 负 = 正（敌退我进！）\n正 × 负 = 负\n负 × 正 = 负', en: 'Pos × Pos = Pos\nNeg × Neg = Pos (enemy retreats, we advance!)\nPos × Neg = Neg\nNeg × Pos = Neg' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '同号相乘得正，异号相乘得负。除法规则相同。', en: 'Same signs multiply to positive, different signs to negative. Same rule for division.' }, formula: '$(-a) \\times (-b) = ab,\\quad (-a) \\times b = -(ab)$', tips: [{ zh: '张飞提示：负负得正——敌人的敌人就是朋友！', en: 'Zhang Fei Tip: Neg × Neg = Pos — the enemy of my enemy is my friend!' }] }
  },
  // --- Year 7 Unit 0B: 军粮分配·分数篇 ---
  {
    id: 707, grade: 7, unitId: 0, order: 7,
    unitTitle: { zh: "Unit 0B: 军粮分配·分数篇", en: "Unit 0B: Grain Division — Fractions" },
    topic: 'Algebra', type: 'FRAC_ADD',
    title: { zh: '合并粮草', en: 'Combining Grain' },
    skillName: { zh: '分数通分术', en: 'Common Denominator' },
    skillSummary: { zh: '异分母分数相加：通分→加分子→约分', en: 'Adding fractions with different denominators: find LCD → add numerators → simplify' },
    story: { zh: '两营粮草要合并运输。第一营占总量的一部分，第二营占另一部分。', en: 'Two camps combine their grain for transport. Each has a fraction of the total.' },
    description: { zh: '计算合并后的分数。', en: 'Calculate the combined fraction.' },
    data: { n1: 1, d1: 3, n2: 1, d2: 4, op: '+', ansNum: 7, ansDen: 12, generatorType: 'FRAC_ADD_RANDOM' }, difficulty: 'Easy', reward: 50,
    kpId: 'kp-1.4-01', sectionId: 'number',
    tutorialSteps: [
      { text: { zh: '关羽："第一营有全军 $\\frac{1}{3}$ 的粮草，第二营有 $\\frac{1}{4}$。合起来是多少？"', en: 'Guan Yu: "First camp has $\\frac{1}{3}$ of the grain, second has $\\frac{1}{4}$. What is the total?"' }, highlightField: 'ans' },
      { text: { zh: '关羽："分母不同，要先通分。3 和 4 的最小公倍数是 12"', en: 'Guan Yu: "Different denominators — find LCD first. LCM of 3 and 4 is 12"' }, highlightField: 'ans' },
      { text: { zh: '关羽："$\\frac{1}{3} = \\frac{4}{12}$，$\\frac{1}{4} = \\frac{3}{12}$"', en: 'Guan Yu: "$\\frac{1}{3} = \\frac{4}{12}$, $\\frac{1}{4} = \\frac{3}{12}$"' }, hint: { zh: '分子分母同乘以相同的数\n$\\frac{1}{3} \\times \\frac{4}{4} = \\frac{4}{12}$', en: 'Multiply top and bottom by the same number\n$\\frac{1}{3} \\times \\frac{4}{4} = \\frac{4}{12}$' }, highlightField: 'ans' },
      { text: { zh: '关羽："$\\frac{4}{12} + \\frac{3}{12} = \\frac{7}{12}$"', en: 'Guan Yu: "$\\frac{4}{12} + \\frac{3}{12} = \\frac{7}{12}$"' }, highlightField: 'ans' }
    ],
    secret: { concept: { zh: '异分母分数相加：先通分（找 LCD），再加分子，最后约分。', en: 'Adding fractions with different denominators: find LCD, add numerators, then simplify.' }, formula: '$\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}$', tips: [{ zh: '关羽提示：合兵一处，粮草先算。', en: 'Guan Yu Tip: Before merging troops, count the grain.' }] }
  },
  {
    id: 708, grade: 7, unitId: 0, order: 8,
    unitTitle: { zh: "Unit 0B: 军粮分配·分数篇", en: "Unit 0B: Grain Division — Fractions" },
    topic: 'Algebra', type: 'FRAC_ADD',
    title: { zh: '消耗军粮', en: 'Consuming Grain' },
    skillName: { zh: '分数减法术', en: 'Fraction Subtraction' },
    skillSummary: { zh: '异分母分数相减：通分→减分子→约分', en: 'Subtracting fractions: find LCD → subtract numerators → simplify' },
    story: { zh: '粮仓存粮消耗了一部分，需要计算剩余比例。', en: 'A portion of the grain has been consumed. Calculate what remains.' },
    description: { zh: '计算剩余分数。', en: 'Calculate the remaining fraction.' },
    data: { n1: 3, d1: 4, n2: 1, d2: 6, op: '-', ansNum: 7, ansDen: 12, generatorType: 'FRAC_ADD_RANDOM' }, difficulty: 'Easy', reward: 55,
    kpId: 'kp-1.4-01', sectionId: 'number',
    tutorialSteps: [
      { text: { zh: '诸葛亮："粮仓有 $\\frac{3}{4}$ 满，消耗了 $\\frac{1}{6}$，还剩多少？"', en: 'Zhuge Liang: "Granary is $\\frac{3}{4}$ full, consumed $\\frac{1}{6}$. How much remains?"' }, highlightField: 'ans' },
      { text: { zh: '诸葛亮："4 和 6 的最小公倍数是 12"', en: 'Zhuge Liang: "LCM of 4 and 6 is 12"' }, highlightField: 'ans' },
      { text: { zh: '诸葛亮："$\\frac{3}{4} = \\frac{9}{12}$，$\\frac{1}{6} = \\frac{2}{12}$"', en: 'Zhuge Liang: "$\\frac{3}{4} = \\frac{9}{12}$, $\\frac{1}{6} = \\frac{2}{12}$"' }, highlightField: 'ans' },
      { text: { zh: '诸葛亮："$\\frac{9}{12} - \\frac{2}{12} = \\frac{7}{12}$"', en: 'Zhuge Liang: "$\\frac{9}{12} - \\frac{2}{12} = \\frac{7}{12}$"' }, highlightField: 'ans' }
    ],
    secret: { concept: { zh: '异分母分数相减：通分后减分子，最后约分。', en: 'Subtracting fractions: find LCD, subtract numerators, then simplify.' }, formula: '$\\frac{a}{b} - \\frac{c}{d} = \\frac{ad - bc}{bd}$', tips: [{ zh: '诸葛亮提示：粮草不可不算，算清方能持久。', en: 'Zhuge Liang Tip: Always track your supplies — accurate counts sustain campaigns.' }] }
  },
  // --- Year 7 Unit 0B 续: 带分数↔假分数互转 ---
  {
    id: 692, grade: 7, unitId: 0, order: 8.3,
    unitTitle: { zh: "Unit 0B: 军粮分配·分数篇", en: "Unit 0B: Grain Division — Fractions" },
    topic: 'Algebra', type: 'MIXED_IMPROPER',
    title: { zh: '整箱拆零', en: 'Unpacking Crates' },
    skillName: { zh: '带分数化假分数', en: 'Mixed to Improper' },
    skillSummary: { zh: '整数×分母+分子 = 假分数的分子，分母不变', en: 'whole × denominator + numerator = improper numerator, denominator stays' },
    story: { zh: '运粮队有 2 整箱加 $\\frac{3}{5}$ 箱散装粮草。为了过桥称重，需要全部拆成散装（假分数）。$2\\frac{3}{5}$ 拆成多少个 $\\frac{1}{5}$？', en: 'The supply convoy has 2 full crates plus $\\frac{3}{5}$ of a crate loose. To weigh for the bridge, unpack everything. $2\\frac{3}{5}$ = how many fifths?' },
    description: { zh: '把带分数化成假分数，求分子。', en: 'Convert the mixed number to improper fraction. Find the numerator.' },
    data: { whole: 2, num: 3, den: 5, improperNum: 13, answer: 13, mode: 'to_improper', generatorType: 'MIXED_IMPROPER_RANDOM' }, difficulty: 'Easy', reward: 45,
    kpId: 'kp-1.4-01', sectionId: 'number',
    tutorialSteps: [
      { text: { zh: '诸葛亮：$2\\frac{3}{5}$——2 整箱加零散的 $\\frac{3}{5}$ 箱', en: 'Zhuge Liang: "$2\\frac{3}{5}$ — 2 full crates plus $\\frac{3}{5}$ loose"' }, hint: { zh: '每箱拆成 5 份：\n2 整箱 = $2 \\times 5 = 10$ 份\n加零散 3 份 = $10 + 3 = 13$ 份\n\n$2\\frac{3}{5} = \\frac{13}{5}$，分子 = 13', en: '5 parts per crate:\n2 crates = $2 \\times 5 = 10$ parts\nPlus 3 loose = $10 + 3 = 13$ parts\n\n$2\\frac{3}{5} = \\frac{13}{5}$, numerator = 13' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '带分数化假分数：整数×分母+分子=新分子，分母不变。', en: 'Mixed to improper: whole × denominator + numerator = new numerator.' }, formula: '$a\\frac{b}{c} = \\frac{ac + b}{c}$', tips: [{ zh: '诸葛亮提示：整箱拆零，方便过秤！', en: 'Zhuge Liang Tip: Unpack crates for easy weighing!' }] }
  },
  {
    id: 690, grade: 7, unitId: 0, order: 8.6,
    unitTitle: { zh: "Unit 0B: 军粮分配·分数篇", en: "Unit 0B: Grain Division — Fractions" },
    topic: 'Algebra', type: 'MIXED_IMPROPER',
    title: { zh: '散装装箱', en: 'Repacking Loose Items' },
    skillName: { zh: '假分数化带分数', en: 'Improper to Mixed' },
    skillSummary: { zh: '分子÷分母：商=整数部分，余数=新分子，分母不变', en: 'Numerator ÷ denominator: quotient = whole, remainder = new numerator' },
    story: { zh: '散装粮草 $\\frac{13}{5}$ 份，需要重新装箱方便运输。每 5 份装一箱，能装几整箱？还剩几份散装？', en: 'Loose grain: $\\frac{13}{5}$ parts. Repack into crates (5 per crate). How many full crates? How many loose parts remain?' },
    description: { zh: '把假分数化成带分数，求整数部分。', en: 'Convert improper fraction to mixed number. Find the whole part.' },
    data: { whole: 2, num: 3, den: 5, improperNum: 13, answer: 2, mode: 'to_mixed', generatorType: 'MIXED_IMPROPER_RANDOM' }, difficulty: 'Easy', reward: 45,
    kpId: 'kp-1.4-01', sectionId: 'number',
    tutorialSteps: [
      { text: { zh: '诸葛亮：$\\frac{13}{5}$——13 份散装，每 5 份一箱', en: 'Zhuge Liang: "$\\frac{13}{5}$ — 13 loose parts, 5 per crate"' }, hint: { zh: '$13 \\div 5 = 2$ 余 $3$\n\n2 整箱（$2 \\times 5 = 10$ 份用掉了）\n还剩 3 份散装\n\n$\\frac{13}{5} = 2\\frac{3}{5}$，整数部分 = 2', en: '$13 \\div 5 = 2$ remainder $3$\n\n2 full crates ($2 \\times 5 = 10$ used)\n3 parts remain loose\n\n$\\frac{13}{5} = 2\\frac{3}{5}$, whole part = 2' }, highlightField: 'ans' },
    ],
    storyConsequence: {
      correct: { zh: '诸葛亮：2 整箱 + 3 份散装，装车出发！', en: 'Zhuge Liang: "2 full crates + 3 loose — load up and march!"' },
      wrong: { zh: '诸葛亮：装错了！粮草对不上数...重新清点！', en: 'Zhuge Liang: "Wrong count! Grain doesn\'t match... recount!"' },
    },
    secret: { concept: { zh: '假分数化带分数：做除法，商=整数，余数=分子，分母不变。', en: 'Improper to mixed: divide, quotient = whole, remainder = numerator.' }, formula: '$\\frac{n}{d} = (n \\div d)\\frac{n \\bmod d}{d}$', tips: [{ zh: '诸葛亮提示：散装装箱，做除法就对了！', en: 'Zhuge Liang Tip: Repacking = division!' }] }
  },
  {
    id: 709, grade: 7, unitId: 0, order: 9,
    unitTitle: { zh: "Unit 0B: 军粮分配·分数篇", en: "Unit 0B: Grain Division — Fractions" },
    topic: 'Algebra', type: 'FRAC_MUL',
    title: { zh: '粮草翻倍', en: 'Grain Multiplication' },
    skillName: { zh: '分数乘法术', en: 'Fraction Multiplication' },
    skillSummary: { zh: '分子乘分子，分母乘分母，最后约分', en: 'Multiply tops, multiply bottoms, then simplify' },
    story: { zh: '军粮需要按比例分配，学会分数乘法才能精确计算。', en: 'Grain must be distributed proportionally — fraction multiplication is the key skill.' },
    description: { zh: '计算分数乘法。', en: 'Calculate the fraction multiplication.' },
    data: { n1: 2, d1: 3, n2: 3, d2: 5, op: 'mul', ansNum: 2, ansDen: 5, generatorType: 'FRAC_MUL_RANDOM' }, difficulty: 'Easy', reward: 55,
    kpId: 'kp-1.4-02', sectionId: 'number',
    tutorialSteps: [
      { text: { zh: '张飞："$\\frac{2}{3}$ 的粮草再取 $\\frac{3}{5}$，能取多少？$\\frac{2}{3} \\times \\frac{3}{5} = ?$"', en: 'Zhang Fei: "Take $\\frac{3}{5}$ of $\\frac{2}{3}$ of the grain. $\\frac{2}{3} \\times \\frac{3}{5} = ?$"' }, highlightField: 'ans' },
      { text: { zh: '张飞："分数乘法：分子乘分子，分母乘分母"', en: 'Zhang Fei: "Fraction multiplication: multiply tops, multiply bottoms"' }, hint: { zh: '$\\frac{a}{b} \\times \\frac{c}{d} = \\frac{a \\times c}{b \\times d}$', en: '$\\frac{a}{b} \\times \\frac{c}{d} = \\frac{a \\times c}{b \\times d}$' }, highlightField: 'ans' },
      { text: { zh: '张飞："$\\frac{2 \\times 3}{3 \\times 5} = \\frac{6}{15}$，约分得 $\\frac{2}{5}$"', en: 'Zhang Fei: "$\\frac{2 \\times 3}{3 \\times 5} = \\frac{6}{15}$, simplify to $\\frac{2}{5}$"' }, highlightField: 'ans' }
    ],
    secret: { concept: { zh: '分数乘法：分子×分子，分母×分母，最后约分。', en: 'Fraction multiplication: numerator×numerator, denominator×denominator, then simplify.' }, formula: '$\\frac{a}{b} \\times \\frac{c}{d} = \\frac{ac}{bd}$', tips: [{ zh: '张飞提示：俺虽粗人，乘法还是会的！', en: 'Zhang Fei Tip: I may be rough, but I can multiply!' }] }
  },
  {
    id: 710, grade: 7, unitId: 0, order: 10,
    unitTitle: { zh: "Unit 0B: 军粮分配·分数篇", en: "Unit 0B: Grain Division — Fractions" },
    topic: 'Algebra', type: 'FRAC_MUL',
    title: { zh: '分粮入户', en: 'Grain Division' },
    skillName: { zh: '分数除法术', en: 'Fraction Division' },
    skillSummary: { zh: '除以一个分数 = 乘以它的倒数（分子分母交换）', en: 'Dividing by a fraction = multiplying by its reciprocal (swap top and bottom)' },
    story: { zh: '要把粮草按户分配。除以一个分数，就是乘以它的倒数。', en: 'Distribute grain per household. Dividing by a fraction means multiplying by its reciprocal.' },
    description: { zh: '计算分数除法。', en: 'Calculate the fraction division.' },
    data: { n1: 2, d1: 3, n2: 3, d2: 5, op: 'div', ansNum: 10, ansDen: 9, generatorType: 'FRAC_MUL_RANDOM' }, difficulty: 'Medium', reward: 60,
    kpId: 'kp-1.4-02', sectionId: 'number',
    tutorialSteps: [
      { text: { zh: '关羽："$\\frac{2}{3} \\div \\frac{3}{5} = ?$ 分数除法怎么算？"', en: 'Guan Yu: "$\\frac{2}{3} \\div \\frac{3}{5} = ?$ How to divide fractions?"' }, highlightField: 'ans' },
      { text: { zh: '关羽："除以一个分数 = 乘以它的倒数。倒数就是把分子分母交换"', en: 'Guan Yu: "Dividing by a fraction = multiplying by its reciprocal. Reciprocal = swap top and bottom"' }, hint: { zh: '$\\frac{3}{5}$ 的倒数是 $\\frac{5}{3}$\n（分子 3 和分母 5 交换位置）', en: 'Reciprocal of $\\frac{3}{5}$ is $\\frac{5}{3}$\n(swap 3 and 5)' }, highlightField: 'ans' },
      { text: { zh: '关羽："$\\frac{2}{3} \\div \\frac{3}{5} = \\frac{2}{3} \\times \\frac{5}{3}$"', en: 'Guan Yu: "$\\frac{2}{3} \\div \\frac{3}{5} = \\frac{2}{3} \\times \\frac{5}{3}$"' }, highlightField: 'ans' },
      { text: { zh: '关羽："分子乘分子，分母乘分母：$\\frac{2 \\times 5}{3 \\times 3} = \\frac{10}{9}$"', en: 'Guan Yu: "Multiply tops, multiply bottoms: $\\frac{2 \\times 5}{3 \\times 3} = \\frac{10}{9}$"' }, highlightField: 'ans' },
      { text: { zh: '关羽："$\\frac{10}{9}$ 已经是最简分数，所以答案是 $\\frac{10}{9}$"', en: 'Guan Yu: "$\\frac{10}{9}$ is already in simplest form, so the answer is $\\frac{10}{9}$"' }, highlightField: 'ans' }
    ],
    secret: { concept: { zh: '分数除法：除以一个分数 = 乘以它的倒数。', en: 'Fraction division: dividing by a fraction = multiplying by its reciprocal.' }, formula: '$\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c} = \\frac{ad}{bc}$', tips: [{ zh: '关羽提示：翻转乾坤，化除为乘！', en: 'Guan Yu Tip: Flip and multiply — turn division into multiplication!' }] }
  },
  // --- Year 7 Unit 0B 续: 分数↔小数↔百分比 桥梁 ---
  {
    id: 694, grade: 7, unitId: 0, order: 10.5,
    unitTitle: { zh: "Unit 0B: 军粮分配·分数篇", en: "Unit 0B: Grain Division — Fractions" },
    topic: 'Algebra', type: 'FDP_CONVERT',
    title: { zh: '情报三译', en: 'Intelligence in Three Formats' },
    skillName: { zh: '分小百互转术', en: 'F-D-P Conversion' },
    skillSummary: { zh: '分数 ÷ 得小数 × 100 得百分比——三种写法，一个数', en: 'Fraction ÷ = decimal × 100 = percentage — three forms, one number' },
    story: { zh: '诸葛亮收到三路探子的情报，分别用分数、小数、百分比汇报粮草损耗率。看似不同，其实说的是同一个数！学会互相转换，才能统一分析。', en: 'Zhuge Liang receives intelligence from three scouts — one reports in fractions, one in decimals, one in percentages. They look different but say the same thing! Master conversion to unify the analysis.' },
    description: { zh: '完成分数、小数、百分比之间的转换。', en: 'Convert between fractions, decimals, and percentages.' },
    data: { frac: '1/4', num: 1, den: 4, dec: 0.25, pct: 25, dir: 'frac_to_pct', answer: 25, generatorType: 'FDP_CONVERT_RANDOM' }, difficulty: 'Easy', reward: 45,
    kpId: 'kp-1.4-03', sectionId: 'number',
    tutorialSteps: [
      { text: { zh: '诸葛亮：$\\frac{1}{4} = 0.25 = 25\\%$——三种写法，同一个数', en: 'Zhuge Liang: "$\\frac{1}{4} = 0.25 = 25\\%$ — three forms, same value"' }, hint: { zh: '分数 → 小数：分子 ÷ 分母（$1 \\div 4 = 0.25$）\n小数 → 百分比：× 100（$0.25 \\times 100 = 25\\%$）\n百分比 → 小数：÷ 100（$25\\% \\div 100 = 0.25$）', en: 'Fraction → Decimal: numerator ÷ denominator ($1 ÷ 4 = 0.25$)\nDecimal → Percentage: × 100 ($0.25 × 100 = 25\\%$)\nPercentage → Decimal: ÷ 100 ($25\\% ÷ 100 = 0.25$)' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '分数、小数、百分比是同一个数的三种写法。关键转换：分子÷分母=小数，小数×100=百分比。', en: 'Fractions, decimals, and percentages are three representations of the same number.' }, formula: '$\\frac{a}{b} = a \\div b = \\text{decimal} \\times 100\\%$', tips: [{ zh: '诸葛亮提示：情报统一格式，才能准确决策！', en: 'Zhuge Liang Tip: Unified format means accurate decisions!' }] }
  },
  // --- Year 7 Unit 0C: 排兵布阵·幂与根篇 (Powers & Roots) ---
  {
    id: 713, grade: 7, unitId: 0, order: 11,
    unitTitle: { zh: "Unit 0C: 排兵布阵·幂与根篇", en: "Unit 0C: Battle Formation — Powers & Roots" },
    topic: 'Algebra', type: 'SQUARE_CUBE',
    title: { zh: '方阵操练', en: 'Square Formation Drill' },
    skillName: { zh: '平方计算术', en: 'Squaring Numbers' },
    skillSummary: { zh: '一个数的平方 = 这个数 × 自己', en: 'A number squared = the number × itself' },
    story: { zh: '刘备：兄弟们，今天操练方阵！士兵排成 n 行 n 列的正方形——这就是"平方"的由来。', en: 'Liu Bei: "Brothers, today we drill square formations! Soldiers in n rows and n columns — that\'s where \'squaring\' comes from."' },
    description: { zh: '计算 $n^2$。', en: 'Calculate $n^2$.' },
    data: { n: 7, answer: 49, mode: 'square', generatorType: 'SQUARE_CUBE_RANDOM' }, difficulty: 'Easy', reward: 40,
    kpId: 'kp-1.3-01', sectionId: 'number',
    tutorialSteps: [
      { text: { zh: '刘备：什么是"平方"？一个数乘以自己', en: 'Liu Bei: "What is squaring? A number times itself"' }, hint: { zh: '正方形的面积 = 边长 × 边长\n比如边长 5 的方阵：$5^2 = 5 \\times 5 = 25$ 人', en: 'A square\'s area = side × side\nE.g. formation with side 5: $5^2 = 5 \\times 5 = 25$ soldiers' }, highlightField: 'ans' },
      { text: { zh: '刘备：$7^2 = 7 \\times 7 = 49$，7 行 7 列共 49 人', en: 'Liu Bei: "$7^2 = 7 \\times 7 = 49$, 7 rows × 7 columns = 49 soldiers"' }, highlightField: 'ans' },
      { text: { zh: '刘备：记住前 10 个平方数：$1, 4, 9, 16, 25, 36, 49, 64, 81, 100$', en: 'Liu Bei: "Remember the first 10 squares: $1, 4, 9, 16, 25, 36, 49, 64, 81, 100$"' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '平方就是一个数乘以自己，写作 $n^2$。来源于正方形面积公式。', en: 'Squaring means multiplying a number by itself, written $n^2$. Named after the area of a square.' }, formula: '$n^2 = n \\times n$', tips: [{ zh: '刘备提示：方阵排兵，行列相同，总数就是边长的平方！', en: 'Liu Bei Tip: In a square formation, rows equal columns — total is the side length squared!' }] }
  },
  {
    id: 714, grade: 7, unitId: 0, order: 12,
    unitTitle: { zh: "Unit 0C: 排兵布阵·幂与根篇", en: "Unit 0C: Battle Formation — Powers & Roots" },
    topic: 'Algebra', type: 'SQUARE_CUBE',
    title: { zh: '粮箱码垛', en: 'Stacking Supply Crates' },
    skillName: { zh: '立方计算术', en: 'Cubing Numbers' },
    skillSummary: { zh: '一个数的立方 = 这个数 × 自己 × 自己', en: 'A number cubed = the number × itself × itself' },
    story: { zh: '张飞：粮箱码成正方体！n 层，每层 n 行 n 列——这就是"立方"！', en: 'Zhang Fei: "Stack crates into a cube! n layers, each n rows × n columns — that\'s cubing!"' },
    description: { zh: '计算 $n^3$。', en: 'Calculate $n^3$.' },
    data: { n: 3, answer: 27, mode: 'cube', generatorType: 'SQUARE_CUBE_RANDOM' }, difficulty: 'Easy', reward: 45,
    kpId: 'kp-1.3-02', sectionId: 'number',
    tutorialSteps: [
      { text: { zh: '张飞：什么是"立方"？一个数乘三次', en: 'Zhang Fei: "What is cubing? A number times itself three times"' }, hint: { zh: '正方体的体积 = 边长 × 边长 × 边长\n比如边长 3 的粮箱：$3^3 = 3 \\times 3 \\times 3 = 27$ 箱', en: 'A cube\'s volume = side × side × side\nE.g. crate stack with side 3: $3^3 = 3 \\times 3 \\times 3 = 27$ crates' }, highlightField: 'ans' },
      { text: { zh: '张飞：先算 $3 \\times 3 = 9$，再乘 3：$9 \\times 3 = 27$', en: 'Zhang Fei: "First $3 \\times 3 = 9$, then × 3: $9 \\times 3 = 27$"' }, highlightField: 'ans' },
      { text: { zh: '张飞：前 5 个立方数：$1, 8, 27, 64, 125$', en: 'Zhang Fei: "First 5 cubes: $1, 8, 27, 64, 125$"' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '立方就是一个数乘三次，写作 $n^3$。来源于正方体体积公式。', en: 'Cubing means multiplying a number by itself three times, written $n^3$. Named after the volume of a cube.' }, formula: '$n^3 = n \\times n \\times n$', tips: [{ zh: '张飞提示：码粮箱，三个方向都一样长，总数就是边长的立方！', en: 'Zhang Fei Tip: Stacking crates — same length in all three directions, total is the side cubed!' }] }
  },
  {
    id: 715, grade: 7, unitId: 0, order: 13,
    unitTitle: { zh: "Unit 0C: 排兵布阵·幂与根篇", en: "Unit 0C: Battle Formation — Powers & Roots" },
    topic: 'Algebra', type: 'SQUARE_ROOT',
    title: { zh: '侦察敌阵', en: 'Scouting Enemy Formation' },
    skillName: { zh: '平方根速算', en: 'Square Root' },
    skillSummary: { zh: '平方根是平方的反操作：√n 就是"谁的平方等于 n"', en: 'Square root reverses squaring: √n means "whose square equals n"' },
    story: { zh: '关羽：侦察兵报告敌军方阵人数。要知道每行几人，就要求"平方根"！', en: 'Guan Yu: "Scouts report the enemy square formation size. To find soldiers per row, we need the square root!"' },
    description: { zh: '计算 $\\sqrt{n}$。', en: 'Calculate $\\sqrt{n}$.' },
    data: { n: 49, answer: 7, mode: 'sqrt', generatorType: 'SQUARE_ROOT_RANDOM' }, difficulty: 'Easy', reward: 45,
    kpId: 'kp-1.3-03', sectionId: 'number',
    tutorialSteps: [
      { text: { zh: '关羽：平方根是平方的反操作', en: 'Guan Yu: "Square root is the reverse of squaring"' }, hint: { zh: '如果 $7^2 = 49$，那么 $\\sqrt{49} = 7$\n"谁乘以自己等于 49？"——答案是 7', en: 'If $7^2 = 49$, then $\\sqrt{49} = 7$\n"What times itself = 49?" — answer is 7' }, highlightField: 'ans' },
      { text: { zh: '关羽：看到 49 人方阵 → 每行 $\\sqrt{49} = 7$ 人', en: 'Guan Yu: "49-soldier square formation → $\\sqrt{49} = 7$ per row"' }, highlightField: 'ans' },
      { text: { zh: '关羽：常见平方根速查表', en: 'Guan Yu: "Common square roots reference"' }, hint: { zh: '$\\sqrt{4}=2,\\ \\sqrt{9}=3,\\ \\sqrt{16}=4,\\ \\sqrt{25}=5$\n$\\sqrt{36}=6,\\ \\sqrt{49}=7,\\ \\sqrt{64}=8,\\ \\sqrt{81}=9,\\ \\sqrt{100}=10$', en: '$\\sqrt{4}=2,\\ \\sqrt{9}=3,\\ \\sqrt{16}=4,\\ \\sqrt{25}=5$\n$\\sqrt{36}=6,\\ \\sqrt{49}=7,\\ \\sqrt{64}=8,\\ \\sqrt{81}=9,\\ \\sqrt{100}=10$' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '平方根 $\\sqrt{n}$ 就是"谁的平方等于 n"。它是平方运算的逆运算。', en: 'Square root $\\sqrt{n}$ means "whose square equals n". It\'s the inverse of squaring.' }, formula: '$\\sqrt{n^2} = n$', tips: [{ zh: '关羽提示：知道方阵总人数，开方就能算出每行几人！', en: 'Guan Yu Tip: Know the total in a square formation — take the square root to find soldiers per row!' }] }
  },
  {
    id: 716, grade: 7, unitId: 0, order: 14,
    unitTitle: { zh: "Unit 0C: 排兵布阵·幂与根篇", en: "Unit 0C: Battle Formation — Powers & Roots" },
    topic: 'Algebra', type: 'SQUARE_ROOT',
    title: { zh: '综合考核', en: 'Combined Assessment' },
    skillName: { zh: '幂与根综合', en: 'Powers & Roots Mastery' },
    skillSummary: { zh: '混合练习平方根和立方根', en: 'Mixed practice of square roots and cube roots' },
    story: { zh: '诸葛亮：最终考核！随机出题，可能是方阵求边长（√），也可能是粮仓求边长（∛）。', en: 'Zhuge Liang: "Final assessment! Random questions — find the side of a square formation (√) or a warehouse (∛)."' },
    description: { zh: '计算平方根或立方根。', en: 'Calculate the square or cube root.' },
    data: { n: 64, answer: 8, mode: 'mixed', op: 'sqrt', generatorType: 'SQUARE_ROOT_RANDOM' }, difficulty: 'Medium', reward: 55,
    kpId: 'kp-1.3-04', sectionId: 'number',
    tutorialSteps: [
      { text: { zh: '诸葛亮：平方根——"谁的平方等于这个数？"', en: 'Zhuge Liang: "Square root — whose square equals this number?"' }, hint: { zh: '$\\sqrt{49} = 7$，因为 $7 \\times 7 = 49$', en: '$\\sqrt{49} = 7$, because $7 \\times 7 = 49$' }, highlightField: 'ans' },
      { text: { zh: '诸葛亮：立方根——"谁的立方等于这个数？"', en: 'Zhuge Liang: "Cube root — whose cube equals this number?"' }, hint: { zh: '$\\sqrt[3]{125} = 5$，因为 $5 \\times 5 \\times 5 = 125$', en: '$\\sqrt[3]{125} = 5$, because $5 \\times 5 \\times 5 = 125$' }, highlightField: 'ans' },
      { text: { zh: '诸葛亮：看清符号！$\\sqrt{\\ }$ 是平方根，$\\sqrt[3]{\\ }$ 是立方根', en: 'Zhuge Liang: "Read the symbol! $\\sqrt{\\ }$ is square root, $\\sqrt[3]{\\ }$ is cube root"' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '平方根和立方根分别是平方和立方的逆运算。看清根号上的小数字！', en: 'Square root and cube root are the inverses of squaring and cubing. Watch the index on the radical!' }, formula: '$\\sqrt{n^2} = n,\\quad \\sqrt[3]{n^3} = n$', tips: [{ zh: '诸葛亮提示：方阵用平方根，粮仓用立方根——看清题目再下笔！', en: 'Zhuge Liang Tip: Formations use square root, warehouses use cube root — read carefully before answering!' }] },
    storyConsequence: { correct: { zh: '方阵和粮仓的尺寸全算对了！诸葛亮：孺子可教！', en: 'Formation and warehouse dimensions all correct! Zhuge Liang: "A worthy student!"' }, wrong: { zh: '算错了尺寸，方阵排不齐…', en: 'Wrong dimensions — the formation is uneven...' } },
  },
  // --- Year 7 Unit 1 前置: 运算顺序 BODMAS ---
  {
    id: 695, grade: 7, unitId: 1, order: 0,
    unitTitle: { zh: "Unit 1: 结义与代数入门", en: "Unit 1: Oath & Intro to Algebra" },
    topic: 'Algebra', type: 'BODMAS',
    title: { zh: '军令如山', en: 'Orders of Command' },
    skillName: { zh: '运算顺序术', en: 'Order of Operations (BODMAS)' },
    skillSummary: { zh: '括号 → 幂 → 乘除 → 加减——军令有先后，运算也有顺序', en: 'Brackets → Orders → Division/Multiplication → Addition/Subtraction' },
    story: { zh: '军令如山——先执行紧急命令（括号），再执行高级命令（乘除），最后执行一般命令（加减）。算错顺序，全军溃散！', en: 'Military orders have priority! Execute urgent orders (brackets) first, then senior orders (multiply/divide), then general orders (add/subtract). Wrong order = army collapses!' },
    description: { zh: '按正确顺序计算。', en: 'Calculate in the correct order.' },
    data: { answer: 14, expr: '2 + 3 \\times 4', generatorType: 'BODMAS_RANDOM' }, difficulty: 'Easy', reward: 40,
    kpId: 'kp-1.6-03', sectionId: 'number',
    tutorialSteps: [
      { text: { zh: '诸葛亮：$2 + 3 \\times 4 = ?$——你觉得答案是 20 还是 14？', en: 'Zhuge Liang: "$2 + 3 \\times 4 = ?$ — do you think it\'s 20 or 14?"' }, hint: { zh: '如果从左到右：$(2+3) \\times 4 = 20$ ✗\n正确做法：先乘后加 $2 + (3 \\times 4) = 2 + 12 = 14$ ✓\n\n口诀 BODMAS：\nB 括号 → O 幂 → DM 乘除 → AS 加减', en: 'Left to right: $(2+3) \\times 4 = 20$ ✗\nCorrect: multiply first $2 + (3 \\times 4) = 2 + 12 = 14$ ✓\n\nBODMAS:\nB Brackets → O Orders → DM Div/Mul → AS Add/Sub' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '运算顺序：括号最先，然后幂，再乘除，最后加减。不是从左到右！', en: 'Order of operations: Brackets first, then powers, then multiply/divide, finally add/subtract. NOT left to right!' }, formula: '$\\text{B → O → DM → AS}$', tips: [{ zh: '诸葛亮提示：军令如山，顺序错了全盘皆输！', en: 'Zhuge Liang Tip: Like military orders — wrong sequence means total defeat!' }] }
  },
  {
    id: 691, grade: 7, unitId: 1, order: 0.5,
    unitTitle: { zh: "Unit 1: 结义与代数入门", en: "Unit 1: Oath & Intro to Algebra" },
    topic: 'Algebra', type: 'BODMAS',
    title: { zh: '括号将令', en: 'Brackets Override' },
    skillName: { zh: '括号优先术', en: 'Brackets First' },
    skillSummary: { zh: '括号是最高优先级——括号里的永远先算', en: 'Brackets have highest priority — always calculate inside brackets first' },
    story: { zh: '诸葛亮的加密升级了！加了括号的密令，括号内的运算优先执行——就像将军的命令比士兵的命令优先级更高！', en: 'Zhuge Liang upgrades his encryption with brackets! Operations inside brackets execute first — like a general\'s orders override a soldier\'s!' },
    description: { zh: '含括号的运算——括号最先。', en: 'Calculate with brackets — brackets first.' },
    data: { answer: 35, expr: '(3 + 4) \\times 5', generatorType: 'BODMAS_RANDOM' }, difficulty: 'Medium', reward: 50,
    kpId: 'kp-1.6-03', sectionId: 'number',
    tutorialSteps: [
      { text: { zh: '诸葛亮：有括号？括号最大！先算括号里面', en: 'Zhuge Liang: "Brackets? They\'re the boss! Calculate inside first"' }, hint: { zh: '$(3 + 4) \\times 5$\n\n第一步：括号内 $3 + 4 = 7$\n第二步：$7 \\times 5 = 35$\n\n如果没括号：$3 + 4 \\times 5 = 3 + 20 = 23$\n有括号 vs 没括号，结果完全不同！', en: '$(3 + 4) \\times 5$\n\nStep 1: inside brackets $3 + 4 = 7$\nStep 2: $7 \\times 5 = 35$\n\nWithout brackets: $3 + 4 \\times 5 = 3 + 20 = 23$\nWith vs without brackets — totally different!' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '括号改变运算顺序——括号内的永远最先算。有括号先算括号，没括号先算乘除。', en: 'Brackets change the order — inside brackets is always first. With brackets: brackets first. Without: multiply/divide first.' }, formula: '$\\text{B → O → DM → AS}$', tips: [{ zh: '诸葛亮提示：括号就像军令状——盖了印的优先执行！', en: 'Zhuge Liang Tip: Brackets are like sealed orders — they take priority!' }] }
  },
  // --- Year 7: The Peach Garden Oath (Foundations) ---
  {
    id: 711, grade: 7, unitId: 1, order: 1,
    unitTitle: { zh: "Unit 1: 结义与代数入门", en: "Unit 1: Oath & Intro to Algebra" },
    topic: 'Algebra', type: 'SIMPLE_EQ',
    title: { zh: '桃园结义', en: 'Oath in the Garden' },
    skillName: { zh: '等式平衡术', en: 'Equation Balance' },
    skillSummary: { zh: '等式两边同时加减同一个数，等号保持不变', en: 'Add or subtract the same number from both sides, the equation stays balanced' },
    story: { zh: '桃园三结义——刘关张焚香祭天。刘备备了 {result} 坛桃花酿，祭天仪式要用 {a} 坛。三兄弟要算清楚：仪式之后还能剩几坛庆功？', en: 'The Peach Garden Oath — Liu Bei, Guan Yu, and Zhang Fei burn incense to heaven. Liu Bei prepared {result} jars of peach wine. The ceremony needs {a} jars. The brothers must figure out: how many jars remain for the celebration?' },
    description: { zh: '解方程 $x+{a}={result}$，求剩余的酒坛数 $x$。', en: 'Solve $x+{a}={result}$. Find the remaining jars $x$.' },
    data: { x: 7, a: 5, result: 12, generatorType: 'SIMPLE_EQ_ADD_RANDOM' }, difficulty: 'Easy', reward: 50,
    kpId: 'kp-2.1-01', sectionId: 'algebra',
    tutorialSteps: [
      {
        text: { zh: '诸葛亮：$x + {a} = {result}$——某个数加上 {a}，等于 {result}。这个数是多少？', en: 'Zhuge Liang: "$x + {a} = {result}$ — what number plus {a} equals {result}?"' },
        hint: { zh: '凭感觉猜一下——如果猜对了也不用惊讶\n但数字变大了就不能靠猜，我们需要一个稳定的方法', en: 'Try guessing — but for bigger numbers we need a reliable method' },
        highlightField: 'x'
      },
      {
        text: { zh: '诸葛亮：等号就像天平——左边 $x + {a}$，右边 ${result}$，现在是平的。对一边做什么，另一边必须做同样的事', en: 'Zhuge Liang: "The equals sign is a balance. Left: $x+{a}$, right: ${result}$. Whatever we do to one side, we must do to the other"' },
        highlightField: 'x'
      },
      {
        text: { zh: '诸葛亮：$x$ 旁边有个 $+{a}$，想把它移走。怎么移？用反操作——减 {a}。加了再减，刚好抵消', en: 'Zhuge Liang: "$x$ has $+{a}$ next to it. Remove it with the opposite: subtract {a}. Add then subtract = cancel"' },
        highlightField: 'x'
      },
      {
        text: { zh: '诸葛亮：天平两边同时减 {a}：\n左边 $x + {a} - {a} = x$（抵消了）\n右边 ${result} - {a} = {x}$', en: 'Zhuge Liang: "Subtract {a} from both sides:\nLeft: $x + {a} - {a} = x$ (cancelled)\nRight: ${result} - {a} = {x}$"' },
        highlightField: 'x'
      },
      {
        text: { zh: '诸葛亮：$x = {x}$！验算：${x} + {a} = {result}$ ✓ 每人 {x} 坛美酒，结义大吉！', en: 'Zhuge Liang: "$x = {x}$! Verify: ${x} + {a} = {result}$ ✓ {x} jars each — sealed!"' },
        highlightField: 'x'
      }
    ],
    secret: { concept: { zh: '等式两边同时加减同一个数，等式依然成立。', en: 'Adding or subtracting the same number from both sides keeps the equation balanced.' }, formula: '$x + a = b \\Rightarrow x = b - a$', tips: [{ zh: '刘备提示：兄弟同心，其利断金。', en: 'Liu Tip: Unity is strength.' }] }
  },
  {
    id: 712, grade: 7, unitId: 1, order: 2,
    unitTitle: { zh: "Unit 1: 结义与代数入门", en: "Unit 1: Oath & Intro to Algebra" },
    topic: 'Algebra', type: 'SIMPLE_EQ',
    title: { zh: '招兵买马', en: 'Recruiting Soldiers' },
    skillName: { zh: '方程破解术', en: 'Equation Solver' },
    skillSummary: { zh: '等式两边同时乘除同一个非零数', en: 'Multiply or divide both sides by the same non-zero number' },
    story: { zh: '结义之后，三兄弟要招兵买马。关羽去铁匠铺买剑——{a} 把青龙剑总价 {result} 金。铁匠不肯还价，关羽得算清楚每把多少钱，免得被坑！', en: 'After the oath, the brothers arm up. Guan Yu visits the blacksmith — {a} Green Dragon swords cost {result} gold total. The smith won\'t haggle, so Guan Yu must calculate the price per sword!' },
    description: { zh: '解方程 ${a}x={result}$，求每把剑的单价 $x$。', en: 'Solve ${a}x={result}$ for the price per sword $x$.' },
    data: { x: 5, a: 3, result: 15, generatorType: 'SIMPLE_EQ_RANDOM' }, difficulty: 'Easy', reward: 60,
    kpId: 'kp-2.5-01', sectionId: 'algebra',
    tutorialSteps: [
      {
        text: { zh: '关羽：{a} 把长剑总价 {result} 金，每把多少钱？', en: 'Guan Yu: "{a} swords cost {result} gold — how much each?"' },
        hint: { zh: '${a}x = {result}$ 就是 {a} 个 $x$ 加在一起等于 {result}\n凭感觉猜一下——但数字大了需要稳定方法', en: '${a}x = {result}$ means {a} copies of $x$ add up to {result}\nGuess first — but for bigger numbers we need a method' },
        highlightField: 'x'
      },
      {
        text: { zh: '关羽：$x$ 被 {a} 乘着。要让 $x$ 单独出来，用反操作——除以 {a}。乘了再除，刚好抵消', en: 'Guan Yu: "$x$ is multiplied by {a}. Opposite: divide by {a}. Multiply then divide = cancel"' },
        highlightField: 'x'
      },
      {
        text: { zh: '关羽：天平两边必须做同样的事——左右两边同时除以 {a}', en: 'Guan Yu: "Balance: both sides must be treated equally — divide both by {a}"' },
        highlightField: 'x'
      },
      {
        text: { zh: '关羽：左边 ${a}x \\div {a} = x$（{a} 被消掉了）\n右边 ${result} \\div {a} = {x}$', en: 'Guan Yu: "Left: ${a}x \\div {a} = x$ ({a} cancelled)\nRight: ${result} \\div {a} = {x}$"' },
        highlightField: 'x'
      },
      {
        text: { zh: '关羽：$x = {x}$！验算：${a} \\times {x} = {result}$ ✓ 每把剑 {x} 金，买剑去！', en: 'Guan Yu: "$x = {x}$! Verify: ${a} \\times {x} = {result}$ ✓ {x} gold each!"' },
        highlightField: 'x'
      }
    ],
    secret: { concept: { zh: '等式两边同时乘除同一个非零数，等式依然成立。', en: 'Multiplying or dividing both sides by the same non-zero number keeps the equation balanced.' }, formula: '$ax = b \\Rightarrow x = b/a$', tips: [{ zh: '关羽提示：买东西一定要算清楚！', en: 'Guan Yu Tip: Always count correctly when shopping!' }] }
  },
  // --- Year 7 Unit 1 续: 两步方程 ---
  {
    id: 696, grade: 7, unitId: 1, order: 2.5,
    unitTitle: { zh: "Unit 1: 结义与代数入门", en: "Unit 1: Oath & Intro to Algebra" },
    topic: 'Algebra', type: 'SIMPLE_EQ',
    title: { zh: '攻城双关', en: 'Two-Gate Siege' },
    skillName: { zh: '两步方程术', en: 'Two-Step Equations' },
    skillSummary: { zh: '两步方程 ax+b=c：先减 b，再除以 a——像拆礼物，先外层后内层', en: 'Two-step equation ax+b=c: subtract b first, then divide by a — unwrap layer by layer' },
    story: { zh: '攻城时要破两道关卡：外门和内门。两步方程也一样——$x$ 被两层运算包裹，要一层一层拆开。先拆外层（加减），再拆内层（乘除）！', en: 'Siege requires breaking two gates: outer and inner. Two-step equations are the same — $x$ is wrapped in two operations. Remove the outer layer (add/sub) first, then inner (mul/div)!' },
    description: { zh: '解两步方程 ${a}x+{b}={result}$，求 $x$。', en: 'Solve ${a}x+{b}={result}$ for $x$.' },
    data: { x: 5, a: 3, b: 4, result: 19, left: '3x + 4', right: '19', generatorType: 'SIMPLE_EQ_TWOSTEP_RANDOM' }, difficulty: 'Medium', reward: 65,
    kpId: 'kp-2.5-02', sectionId: 'algebra',
    tutorialSteps: [
      { text: { zh: '诸葛亮：$3x + 4 = 19$——$x$ 被两层包裹，先拆外层', en: 'Zhuge Liang: "$3x + 4 = 19$ — $x$ is double-wrapped, remove outer layer first"' }, hint: { zh: '外层是 $+4$，用反操作 $-4$ 消除\n$3x + 4 - 4 = 19 - 4$\n$3x = 15$', en: 'Outer layer: $+4$, reverse: $-4$\n$3x + 4 - 4 = 19 - 4$\n$3x = 15$' }, highlightField: 'x' },
      { text: { zh: '诸葛亮：内层是 $\\times 3$，用反操作 $\\div 3$ 消除', en: 'Zhuge Liang: "Inner layer: $\\times 3$, reverse: $\\div 3$"' }, hint: { zh: '$3x \\div 3 = 15 \\div 3$\n$x = 5$\n\n验算：$3 \\times 5 + 4 = 15 + 4 = 19$ ✓', en: '$3x \\div 3 = 15 \\div 3$\n$x = 5$\n\nCheck: $3 \\times 5 + 4 = 15 + 4 = 19$ ✓' }, highlightField: 'x' },
    ],
    secret: { concept: { zh: '两步方程：先去掉加减（外层），再去掉乘除（内层）。顺序不能反！', en: 'Two-step equations: remove add/sub (outer) first, then mul/div (inner). Order matters!' }, formula: '$ax + b = c \\Rightarrow x = \\frac{c - b}{a}$', tips: [{ zh: '诸葛亮提示：攻城先破外门，解方程先去外层！', en: 'Zhuge Liang Tip: Siege the outer gate first, solve outer operations first!' }] }
  },
  // --- Year 7 Unit 1 续: 代入求值 ---
  {
    id: 717, grade: 7, unitId: 1, order: 3,
    unitTitle: { zh: "Unit 1: 结义与代数入门", en: "Unit 1: Oath & Intro to Algebra" },
    topic: 'Algebra', type: 'SUBSTITUTION',
    title: { zh: '军情密码', en: 'Military Code' },
    skillName: { zh: '代入求值术', en: 'Substitution' },
    skillSummary: { zh: '把具体数字代替字母，算出表达式的值', en: 'Replace the letter with a number and evaluate the expression' },
    story: { zh: '诸葛亮用密码传递军情——用公式 $ax + b$ 加密。已知密钥 $x$，算出密文！', en: 'Zhuge Liang uses a code formula $ax + b$ to encrypt messages. Given the key $x$, calculate the output!' },
    description: { zh: '代入 $x$ 的值，计算表达式。', en: 'Substitute the value of $x$ and evaluate.' },
    data: { a: 3, b: 5, x: 4, answer: 17, mode: 'linear', generatorType: 'SUBSTITUTION_RANDOM' }, difficulty: 'Easy', reward: 45,
    kpId: 'kp-2.2-01', sectionId: 'algebra',
    tutorialSteps: [
      { text: { zh: '诸葛亮：代入就是——把字母换成数字', en: 'Zhuge Liang: "Substitution means replacing the letter with a number"' }, hint: { zh: '$3x + 5$，当 $x=4$ 时：\n$3 \\times 4 + 5 = 12 + 5 = 17$', en: '$3x + 5$, when $x=4$:\n$3 \\times 4 + 5 = 12 + 5 = 17$' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '代入就是用具体数值替换变量，然后按运算顺序计算。', en: 'Substitution means replacing variables with values, then computing step by step.' }, formula: { zh: '$\\text{代入 } x \\text{ 的值，按顺序计算}$', en: '$\\text{Substitute } x \\text{, then compute in order}$' }, tips: [{ zh: '诸葛亮提示：先乘除，后加减！', en: 'Zhuge Liang Tip: Multiply/divide first, then add/subtract!' }] }
  },
  {
    id: 718, grade: 7, unitId: 1, order: 4,
    unitTitle: { zh: "Unit 1: 结义与代数入门", en: "Unit 1: Oath & Intro to Algebra" },
    topic: 'Algebra', type: 'SUBSTITUTION',
    title: { zh: '投石车射程', en: 'Catapult Range' },
    skillName: { zh: '含幂代入术', en: 'Substitution with Powers' },
    skillSummary: { zh: '先算幂，再算乘，最后加减', en: 'Powers first, then multiply, then add/subtract' },
    story: { zh: '投石车的射程公式含有 $x^2$。赵云需要代入参数计算准确的射程！', en: 'The catapult range formula contains $x^2$. Zhao Yun needs to substitute parameters for accurate range!' },
    description: { zh: '代入 $x$ 的值，计算含幂的表达式。', en: 'Substitute $x$ and evaluate the expression with powers.' },
    data: { a: 2, b: 3, x: 3, answer: 21, mode: 'power', generatorType: 'SUBSTITUTION_RANDOM' }, difficulty: 'Medium', reward: 55,
    kpId: 'kp-2.2-02', sectionId: 'algebra',
    tutorialSteps: [
      { text: { zh: '赵云：含 $x^2$ 的式子——先算平方，再算乘法', en: 'Zhao Yun: "Expression with $x^2$ — square first, then multiply"' }, hint: { zh: '$2x^2 + 3$，当 $x=3$：\n先算 $3^2 = 9$\n再算 $2 \\times 9 = 18$\n最后 $18 + 3 = 21$', en: '$2x^2 + 3$, when $x=3$:\nFirst $3^2 = 9$\nThen $2 \\times 9 = 18$\nFinally $18 + 3 = 21$' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '运算顺序：幂 → 乘除 → 加减。代入后要严格按顺序计算。', en: 'Order of operations: Powers → Multiply/Divide → Add/Subtract.' }, formula: '$\\text{Powers} \\rightarrow \\times\\div \\rightarrow +\\,-$', tips: [{ zh: '赵云提示：先算指数，才能射得准！', en: 'Zhao Yun Tip: Powers first for accurate aim!' }] }
  },
  // --- Year 7 Unit 1 续: 化简同类项 ---
  {
    id: 719, grade: 7, unitId: 1, order: 5,
    unitTitle: { zh: "Unit 1: 结义与代数入门", en: "Unit 1: Oath & Intro to Algebra" },
    topic: 'Algebra', type: 'SIMPLIFY',
    title: { zh: '合兵一处', en: 'Combining Forces' },
    skillName: { zh: '合并同类项术', en: 'Collecting Like Terms' },
    skillSummary: { zh: '同类项（字母相同的项）可以合并——系数相加，字母不变', en: 'Like terms (same letter) can be combined — add coefficients, keep the letter' },
    story: { zh: '战场上来了多路援军，都是步兵（$x$）。3 路来了 $3x$，2 路来了 $2x$——合兵一处就是 $5x$！但骑兵（$y$）和步兵不能混编。', en: 'Reinforcements arrive from multiple routes, all infantry ($x$). 3 routes bring $3x$, 2 routes bring $2x$ — combine to $5x$! But cavalry ($y$) and infantry can\'t merge.' },
    description: { zh: '化简表达式，求 $x$ 的系数。', en: 'Simplify the expression, find the coefficient of $x$.' },
    data: { a: 3, b: 2, c: null, answer: 5, expr: '3x + 2x', simplified: '5x', generatorType: 'SIMPLIFY_RANDOM' }, difficulty: 'Easy', reward: 45,
    kpId: 'kp-2.2-03', sectionId: 'algebra',
    tutorialSteps: [
      { text: { zh: '诸葛亮：$3x + 2x$——同类项合并：$3 + 2 = 5$，字母照抄 → $5x$', en: 'Zhuge Liang: "$3x + 2x$ — like terms: $3 + 2 = 5$, keep letter → $5x$"' }, hint: { zh: '同类项 = 字母部分相同的项\n$3x$ 和 $2x$ 都是"$x$ 的倍数"→ 可以合并\n$3x + 2y$ 不能合并——步兵和骑兵不能混编！', en: 'Like terms = same letter part\n$3x$ and $2x$ are both "multiples of $x$" → can combine\n$3x + 2y$ can\'t combine — infantry and cavalry don\'t mix!' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '同类项（字母和指数完全相同）可以合并，只需把系数相加减。', en: 'Like terms (same letter and power) can be combined by adding/subtracting coefficients.' }, formula: '$ax + bx = (a+b)x$', tips: [{ zh: '诸葛亮提示：合兵一处，势如破竹！', en: 'Zhuge Liang Tip: United forces are unstoppable!' }] },
    storyConsequence: { correct: { zh: '合兵一处，势如破竹！代数入门完成！', en: 'Forces combined — unstoppable! Algebra intro complete!' }, wrong: { zh: '步兵骑兵混编失败，阵型大乱…', en: 'Infantry-cavalry mix-up — formation chaos...' } },
  },
  {
    id: 721, grade: 7, unitId: 2, order: 1,
    unitTitle: { zh: "Unit 2: 粮草调度与比例", en: "Unit 2: Logistics & Ratios" },
    topic: 'Algebra', type: 'SIMPLE_EQ',
    title: { zh: '分配军粮', en: 'Distributing Grain' },
    skillName: { zh: '比例分配术', en: 'Proportional Division' },
    skillSummary: { zh: '总量除以份数得到每份', en: 'Divide total by number of parts' },
    story: { zh: '军粮分配需按比例。已知 ${a}x = {result}$，求每份军粮 $x$。', en: 'Grain must be distributed proportionally. ${a}x = {result}$, find $x$.' },
    description: { zh: '解方程 ${a}x={result}$。', en: 'Solve ${a}x={result}$.' },
    data: { x: 12, a: 2, result: 24, generatorType: 'SIMPLE_EQ_RANDOM' }, difficulty: 'Easy', reward: 70,
    kpId: 'kp-1.12-01', sectionId: 'number',
    tutorialSteps: [
      {
        text: { zh: '曹操：{a} 个营地共需 {result} 斛军粮，每营分多少？', en: 'Cao Cao: "{a} camps need {result} units — how much per camp?"' },
        hint: { zh: '这道题的结构是：份数 × 每份 = 总量\n{a} × $x$ = {result}，也就是 ${a}x = {result}$', en: 'Structure: portions × each = total\n{a} × $x$ = {result}, i.e. ${a}x = {result}$' },
        highlightField: 'x'
      },
      {
        text: { zh: '曹操：直觉上——总量 ÷ 份数 = 每份。用方程来验证', en: 'Cao Cao: "Intuitively: total ÷ portions = each. Let\'s verify"' },
        highlightField: 'x'
      },
      {
        text: { zh: '曹操：两边同时除以 {a}：\n左边 ${a}x \\div {a} = x$\n右边 ${result} \\div {a} = {x}$', en: 'Cao Cao: "Divide both by {a}:\nLeft: ${a}x \\div {a} = x$\nRight: ${result} \\div {a} = {x}$"' },
        highlightField: 'x'
      },
      {
        text: { zh: '曹操：$x = {x}$！每营 {x} 斛粮草', en: 'Cao Cao: "$x = {x}$! {x} units per camp"' },
        hint: { zh: '记住这个结构：份数 × 每份 = 总量\n知道其中两个，就能求第三个\n这是很多实际问题的基本框架', en: 'Remember: portions × each = total\nKnow two, find the third\nThis is the basic framework for many real problems' },
        highlightField: 'x'
      },
      {
        text: { zh: '曹操：验算：${a} \\times {x} = {result}$ ✓ 军粮无误，开拔！', en: 'Cao Cao: "Verify: ${a} \\times {x} = {result}$ ✓ March!"' },
        highlightField: 'x'
      }
    ],
    secret: { concept: { zh: '比例关系建模：总量 = 份数 x 每份，再用除法求每份。', en: 'Proportional modeling: total = parts x each, use division to find each part.' }, formula: '$ax = b \\Rightarrow x = b/a$', tips: [{ zh: '曹操提示：公平分配，方能稳定军心。', en: 'Cao Cao Tip: Fair distribution keeps the army stable.' }] }
  },
  {
    id: 722, grade: 7, unitId: 2, order: 2,
    unitTitle: { zh: "Unit 2: 粮草调度与比例", en: "Unit 2: Logistics & Ratios" },
    topic: 'Algebra', type: 'SIMPLE_EQ',
    title: { zh: '征调民夫', en: 'Drafting Laborers' },
    skillName: { zh: '均分计算术', en: 'Equal Division' },
    skillSummary: { zh: '除法是乘法的逆运算', en: 'Division is the inverse of multiplication' },
    story: { zh: '修筑工事需要民夫。已知 {a} 个村庄共征调了 ${a}x = {result}$ 人。', en: 'Laborers are needed for fortifications. {a} villages drafted ${a}x = {result}$ people.' },
    description: { zh: '解方程 ${a}x={result}$，求每个村庄的人数 $x$。', en: 'Solve ${a}x={result}$ for $x$ per village.' },
    data: { x: 20, a: 5, result: 100, generatorType: 'SIMPLE_EQ_RANDOM' }, difficulty: 'Easy', reward: 75,
    kpId: 'kp-1.12-01', sectionId: 'number',
    tutorialSteps: [
      {
        text: { zh: '张飞：{a} 个村庄共出 {result} 人修工事，每村出几人？', en: 'Zhang Fei: "{a} villages sent {result} people — how many each?"' },
        hint: { zh: '${a}x = {result}$，$x$ 被 {a} 乘着', en: '${a}x = {result}$, $x$ is multiplied by {a}' },
        highlightField: 'x'
      },
      {
        text: { zh: '张飞：乘法的反操作是除法。两边同时除以 {a}，把 {a} 消掉', en: 'Zhang Fei: "Opposite of multiplication = division. Divide both by {a}"' },
        highlightField: 'x'
      },
      {
        text: { zh: '张飞：左边 ${a}x \\div {a} = x$，右边 ${result} \\div {a} = {x}$', en: 'Zhang Fei: "Left: ${a}x \\div {a} = x$, Right: ${result} \\div {a} = {x}$"' },
        highlightField: 'x'
      },
      {
        text: { zh: '张飞：$x = {x}$！验算：${a} \\times {x} = {result}$ ✓ 每村 {x} 人，公平合理！', en: 'Zhang Fei: "$x = {x}$! Verify: ${a} \\times {x} = {result}$ ✓ Fair and square!"' },
        hint: { zh: '除法把乘法"撤销"了\n我们知道 ${a} \\times {x} = {result}$\n反过来：${result} \\div {a} = {x}$', en: 'Division "undoes" multiplication\n${a} \\times {x} = {result}$\nReverse: ${result} \\div {a} = {x}$' },
        highlightField: 'x'
      }
    ],
    secret: { concept: { zh: '除法是乘法的逆运算：知道总量和份数，就能求每份。', en: 'Division is the inverse of multiplication: knowing total and parts, find each part.' }, formula: '$x = \\frac{b}{a}$', tips: [{ zh: '张飞提示：算清楚，才公平！', en: 'Zhang Fei Tip: Count right, keep it fair!' }] }
  },
  // --- Year 7 Unit 2 续: 百分比 ---
  {
    id: 723, grade: 7, unitId: 2, order: 3,
    unitTitle: { zh: "Unit 2: 粮草调度与比例", en: "Unit 2: Logistics & Ratios" },
    topic: 'Algebra', type: 'PERCENTAGE',
    title: { zh: '军饷提成', en: 'Military Stipend' },
    skillName: { zh: '百分比计算术', en: 'Percentage Calculation' },
    skillSummary: { zh: 'p% of n = n × p/100', en: 'p% of n = n × p/100' },
    story: { zh: '曹操治军严明：本月军粮总计 {n} 石，前锋营立了战功，按规矩可以优先领取总粮草的 {pct}%。司库问曹操：到底拨多少石给前锋？', en: 'Cao Cao rules with discipline: this month\'s total grain is {n} units. The vanguard earned merit and gets {pct}% of the total supply first. The treasurer asks: how much goes to the vanguard?' },
    description: { zh: '求 ${n}$ 的 ${pct}\\%$ 是多少。', en: 'Find ${pct}\\%$ of ${n}$.' },
    data: { n: 200, pct: 25, answer: 50, generatorType: 'PERCENTAGE_OF_RANDOM' }, difficulty: 'Easy', reward: 45,
    kpId: 'kp-1.12-02', sectionId: 'number',
    tutorialSteps: [
      { text: { zh: '曹操：百分比就是"每一百份里取几份"', en: 'Cao Cao: "Percentage means out of every 100"' }, hint: { zh: '$25\\%$ of $200$：\n$200 \\times \\frac{25}{100} = 200 \\times 0.25 = 50$', en: '$25\\%$ of $200$:\n$200 \\times \\frac{25}{100} = 200 \\times 0.25 = 50$' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '百分比就是"每百份中的份数"。求 p% of n，用 n × p ÷ 100。', en: 'Percentage means "parts per hundred". To find p% of n, use n × p ÷ 100.' }, formula: '$p\\% \\text{ of } n = n \\times \\frac{p}{100}$', tips: [{ zh: '曹操提示：百分比是商业和军事的通用语言！', en: 'Cao Cao Tip: Percentages are the universal language of business and warfare!' }] }
  },
  {
    id: 724, grade: 7, unitId: 2, order: 4,
    unitTitle: { zh: "Unit 2: 粮草调度与比例", en: "Unit 2: Logistics & Ratios" },
    topic: 'Algebra', type: 'PERCENTAGE',
    title: { zh: '粮价涨跌', en: 'Grain Price Change' },
    skillName: { zh: '百分比增减术', en: 'Percentage Increase/Decrease' },
    skillSummary: { zh: '增加 p% → 乘以 (1 + p/100)；减少 p% → 乘以 (1 - p/100)', en: 'Increase p% → multiply by (1+p/100); Decrease p% → multiply by (1-p/100)' },
    story: { zh: '曹操正在囤粮备战。探子来报：前方战区粮价涨了！原来每石 {initial} 金的粟米，现在贵了 {rate}。曹操必须快速算出新价格——是继续采购，还是另寻粮道？', en: 'Cao Cao is stockpiling grain for war. A spy reports: grain prices in the war zone have risen! Millet that cost {initial} gold per unit is now more expensive. Cao Cao must quickly calculate the new price — keep buying or find another route?' },
    description: { zh: '计算百分比增减后的新价格。', en: 'Calculate the new price after percentage change.' },
    data: { initial: 200, rate: 0.2, years: 1, generatorType: 'PERCENTAGE_RANDOM' }, difficulty: 'Medium', reward: 55,
    kpId: 'kp-1.12-03', sectionId: 'number',
    storyConsequence: {
      correct: { zh: '曹操：算得好！知道了新价格，本相可以从容调度——从南方走水路运粮，成本更低！', en: 'Cao Cao: "Well calculated! Knowing the new price, I can reroute supplies by river from the south — cheaper!"' },
      wrong: { zh: '曹操：算错了？军国大事岂能儿戏！重新算来！', en: 'Cao Cao: "Wrong?! Military affairs are no game! Calculate again!"' },
    },
    tutorialSteps: [
      { text: { zh: '曹操：增加 20% 就是乘以 1.2', en: 'Cao Cao: "Increase 20% means multiply by 1.2"' }, hint: { zh: '$200 \\times (1 + 0.2) = 200 \\times 1.2 = 240$', en: '$200 \\times (1 + 0.2) = 200 \\times 1.2 = 240$' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '增减百分比的关键是乘法因子：增加用 (1+r)，减少用 (1-r)。', en: 'The key to percentage change is the multiplier: increase (1+r), decrease (1-r).' }, formula: { zh: '$\\text{新值} = \\text{原值} \\times (1 \\pm r)$', en: '$\\text{New} = \\text{Original} \\times (1 \\pm r)$' }, tips: [{ zh: '曹操提示：粮价涨跌关乎国运，算清楚才能决策！', en: 'Cao Cao Tip: Grain prices affect the nation — calculate clearly to decide wisely!' }] }
  },
  // --- Year 7 Unit 2 续: 比例化简与分配 ---
  {
    id: 725, grade: 7, unitId: 2, order: 5,
    unitTitle: { zh: "Unit 2: 粮草调度与比例", en: "Unit 2: Logistics & Ratios" },
    topic: 'Algebra', type: 'RATIO',
    title: { zh: '精简军令', en: 'Simplify Orders' },
    skillName: { zh: '比例化简术', en: 'Simplifying Ratios' },
    skillSummary: { zh: '化简比就像约分——两项同时除以最大公因数', en: 'Simplify ratio like simplifying fractions — divide both terms by HCF' },
    story: { zh: '曹操的军令写着"步兵与骑兵按 12:8 配比"。谋士荀彧说："丞相，比例可以化简——12:8 就是 3:2，更简洁明了！"', en: 'Cao Cao\'s order reads "infantry to cavalry ratio 12:8." Advisor Xun Yu says: "My lord, simplify — 12:8 is just 3:2, much clearer!"' },
    description: { zh: '化简比，求最简比的第一项。', en: 'Simplify the ratio. Find the first term.' },
    data: { a: 12, b: 8, sa: 3, sb: 2, g: 4, answer: 3, mode: 'simplify', generatorType: 'RATIO_Y7_RANDOM' }, difficulty: 'Easy', reward: 45,
    kpId: 'kp-1.11-01', sectionId: 'number',
    tutorialSteps: [
      { text: { zh: '荀彧：化简比跟约分一样——找最大公因数', en: 'Xun Yu: "Simplifying ratios is like simplifying fractions — find the HCF"' }, hint: { zh: '$12:8$\nHCF$(12, 8) = 4$\n$12 \\div 4 = 3$\n$8 \\div 4 = 2$\n最简比 = $3:2$', en: '$12:8$\nHCF$(12, 8) = 4$\n$12 \\div 4 = 3$\n$8 \\div 4 = 2$\nSimplest ratio = $3:2$' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '化简比 = 两项同除以最大公因数。和约分原理完全相同！', en: 'Simplify ratio = divide both by HCF. Exact same principle as simplifying fractions!' }, formula: '$a:b = \\frac{a}{\\text{HCF}}:\\frac{b}{\\text{HCF}}$', tips: [{ zh: '荀彧提示：化简比和约分是一回事——Unit 0 学的 HCF 在这里又用上了！', en: 'Xun Yu Tip: Simplifying ratios IS simplifying fractions — the HCF from Unit 0 comes back!' }] }
  },
  {
    id: 726, grade: 7, unitId: 2, order: 6,
    unitTitle: { zh: "Unit 2: 粮草调度与比例", en: "Unit 2: Logistics & Ratios" },
    topic: 'Algebra', type: 'RATIO',
    title: { zh: '战利分配', en: 'Sharing War Spoils' },
    skillName: { zh: '按比分配术', en: 'Dividing in a Ratio' },
    skillSummary: { zh: '按比例分配：先算总份数，再算每份值，最后乘以各自份数', en: 'Divide in ratio: total parts first, then value per part, then multiply' },
    story: { zh: '攻城胜利后缴获 120 金！按功劳 2:3 分给前锋营和主力营。前锋营虽然人少但冲在最前面，应该分到多少？', en: 'After the siege, 120 gold is captured! Share between vanguard and main army in ratio 2:3. The vanguard charged first — how much do they get?' },
    description: { zh: '把总数按比例分配，求较小份。', en: 'Divide the total in the given ratio. Find the smaller share.' },
    data: { a: 2, b: 3, total: 120, answer: 48, mode: 'divide', generatorType: 'RATIO_Y7_RANDOM' }, difficulty: 'Medium', reward: 55,
    kpId: 'kp-1.11-02', sectionId: 'number',
    tutorialSteps: [
      { text: { zh: '曹操：按比分配——三步走', en: 'Cao Cao: "Divide by ratio — three steps"' }, hint: { zh: '① 总份数 $= 2 + 3 = 5$\n② 每份值 $= 120 \\div 5 = 24$\n③ 前锋 $= 2 \\times 24 = 48$，主力 $= 3 \\times 24 = 72$\n\n验算：$48 + 72 = 120$ ✓', en: '① Total parts $= 2 + 3 = 5$\n② Value per part $= 120 \\div 5 = 24$\n③ Vanguard $= 2 \\times 24 = 48$, Main $= 3 \\times 24 = 72$\n\nCheck: $48 + 72 = 120$ ✓' }, highlightField: 'ans' },
    ],
    storyConsequence: {
      correct: { zh: '曹操：分配公正！前锋 48 金，主力 72 金——军心大振！', en: 'Cao Cao: "Fair distribution! Vanguard 48, main 72 — morale soars!"' },
      wrong: { zh: '曹操：分配不均，前锋将士不服...重新算！', en: 'Cao Cao: "Unfair split — vanguard soldiers revolt! Recalculate!"' },
    },
    secret: { concept: { zh: '按比分配三步：总份数→每份值→各自乘。这连接了除法、乘法和比例三个技能！', en: 'Divide in ratio: total parts → value per part → multiply each. This connects division, multiplication, and ratios!' }, formula: { zh: '$\\text{份额} = \\text{总数} \\times \\frac{\\text{自己的份数}}{\\text{总份数}}$', en: '$\\text{Share} = \\text{Total} \\times \\frac{\\text{own parts}}{\\text{total parts}}$' }, tips: [{ zh: '曹操提示：功劳大的多分——但得算公平！', en: 'Cao Cao Tip: More merit, more reward — but it must be fair!' }] }
  },
  {
    id: 731, grade: 7, unitId: 3, order: 1,
    unitTitle: { zh: "Unit 3: 关隘与角度", en: "Unit 3: Passes & Angles" },
    topic: 'Geometry', type: 'ANGLES',
    title: { zh: '据守虎牢关', en: 'Defending Hulao Pass' },
    skillName: { zh: '补角洞察术', en: 'Supplementary Angles' },
    skillSummary: { zh: '补角之和为 180°', en: 'Supplementary angles sum to 180°' },
    story: { zh: '虎牢关地势险要。已知城墙一侧角度为 ${angle}^\\circ$，求其补角 $x$ 以布置弩床。', en: 'Hulao Pass is steep. One side angle is ${angle}^\\circ$, find its supplementary angle $x$ for ballista placement.' },
    description: { zh: '计算补角：$180 - {angle} = x$。', en: 'Calculate supplementary angle: $180 - {angle} = x$.' },
    data: { angle: 120, total: 180, generatorType: 'ANGLES_RANDOM' }, difficulty: 'Easy', reward: 80,
    storyConsequence: {
      correct: { zh: '弩床角度精确，万箭齐发，敌军溃败！虎牢关固若金汤！', en: 'Perfect angle! Arrows rain down, the enemy retreats! Hulao Pass holds firm!' },
      wrong: { zh: '角度偏差，箭阵出现盲区...敌军趁虚而入，需要重新布防！', en: 'Angle miscalculated, a gap in the arrow coverage... the enemy breaks through! Reposition needed!' },
    },
    kpId: 'kp-4.6-01', sectionId: 'geometry',
    tutorialSteps: [
      {
        text: { zh: '吕布：城墙是一条直线。先搞清楚——一条直线是多少度？', en: 'Lu Bu: "The wall is a straight line. First — how many degrees is a straight line?"' },
        hint: { zh: '想象站在笔直的路上，面朝前方\n左边：脚下到正左方 = $90°$\n右边：脚下到正右方 = $90°$\n两边加起来 = $180°$\n所以一条直线 = $180°$', en: 'Imagine standing on a road facing forward\nLeft: foot to directly left = $90°$\nRight: foot to directly right = $90°$\nTotal = $180°$\nA straight line = $180°$' },
        highlightField: 'x'
      },
      {
        text: { zh: '吕布：两个角加起来等于 $180°$，就叫互为"补角"', en: 'Lu Bu: "Two angles summing to $180°$ are called supplementary"' },
        hint: { zh: '比如 $120°$ 和 $60°$：$120+60=180$ → 互为补角\n比如 $90°$ 和 $90°$：两个直角也互为补角', en: 'E.g. $120°+60°=180°$ → supplementary\n$90°+90°=180°$ → also supplementary' },
        highlightField: 'x'
      },
      {
        text: { zh: '吕布：城墙一侧 ${angle}°$，另一侧 $x$。方程：${angle} + x = 180$', en: 'Lu Bu: "Wall: one side ${angle}°$, other $x$. Equation: ${angle} + x = 180$"' },
        highlightField: 'x'
      },
      {
        text: { zh: '吕布：两边同时减 {angle}：$x = 180 - {angle} = {ans}$', en: 'Lu Bu: "Subtract {angle}: $x = 180 - {angle} = {ans}$"' },
        highlightField: 'x'
      },
      {
        text: { zh: '吕布：验算：${angle} + {ans} = 180$ ✓ 弩床仰角 ${ans}°$，万箭齐发！', en: 'Lu Bu: "Verify: ${angle} + {ans} = 180$ ✓ Ballista ${ans}°$ — fire!"' },
        highlightField: 'x'
      },
      {
        text: { zh: '吕布：规律——一个角越大，它的补角越小。两个数加起来必须是 $180$', en: 'Lu Bu: "Pattern: bigger angle = smaller supplement. Must sum to $180$"' },
        hint: { zh: '$10°$ 配 $170°$\n$45°$ 配 $135°$\n$90°$ 配 $90°$\n$120°$ 配 $60°$\n一个变大，另一个就变小', en: '$10°+170°$\n$45°+135°$\n$90°+90°$\n$120°+60°$\nOne grows, other shrinks' },
        highlightField: 'x'
      }
    ],
    secret: { concept: { zh: '补角之和为 $180^\\circ$。', en: 'Supplementary angles sum to $180^\\circ$.' }, formula: '$x + y = 180^\\circ$', tips: [{ zh: '吕布提示：角度不对，箭矢难中！', en: "Lu Bu Tip: If the angle is wrong, the arrows won't hit!" }] }
  },
  {
    id: 732, grade: 7, unitId: 3, order: 2,
    unitTitle: { zh: "Unit 3: 关隘与角度", en: "Unit 3: Passes & Angles" },
    topic: 'Geometry', type: 'ANGLES',
    title: { zh: '交叉火力', en: 'Crossfire' },
    skillName: { zh: '余角洞察术', en: 'Complementary Angles' },
    skillSummary: { zh: '余角之和为 90°', en: 'Complementary angles sum to 90°' },
    story: { zh: '布置两座箭塔。已知两塔射击线成直角，其中一个角为 ${angle}^\\circ$。', en: 'Set up two arrow towers. Their lines form a right angle, one angle is ${angle}^\\circ$.' },
    description: { zh: '计算余角 $x$：${total} - {angle} = x$。', en: 'Calculate complementary angle $x$: ${total} - {angle} = x$.' },
    data: { angle: 35, total: 90, generatorType: 'ANGLES_RANDOM' }, difficulty: 'Easy', reward: 85,
    kpId: 'kp-4.6-01', sectionId: 'geometry',
    tutorialSteps: [
      {
        text: { zh: '高顺：两条射击线垂直，成直角。直角 = $90°$', en: 'Gao Shun: "Two firing lines perpendicular = right angle = $90°$"' },
        hint: { zh: '直角到处都有：正方形的角、书本的角\n时钟 3 点整，时针和分针的夹角就是直角', en: 'Right angles are everywhere: square corners, book corners\nClock at 3:00 — hands form a right angle' },
        highlightField: 'x'
      },
      {
        text: { zh: '高顺：两个角加起来 = $90°$，叫互为"余角"', en: 'Gao Shun: "Two angles summing to $90°$ are complementary"' },
        hint: { zh: '余角和补角的唯一区别是总数不同\n补角 = $180°$，余角 = $90°$\n方法完全一样', en: 'Only difference from supplementary: the total\nSupplementary = $180°$, Complementary = $90°$\nSame method' },
        highlightField: 'x'
      },
      {
        text: { zh: '高顺：一角 ${angle}°$，方程：${angle} + x = 90$', en: 'Gao Shun: "One angle ${angle}°$, equation: ${angle} + x = 90$"' },
        highlightField: 'x'
      },
      {
        text: { zh: '高顺：两边减 {angle}：$x = 90 - {angle} = {ans}$', en: 'Gao Shun: "Subtract {angle}: $x = 90 - {angle} = {ans}$"' },
        highlightField: 'x'
      },
      {
        text: { zh: '高顺：验算：${angle} + {ans} = 90$ ✓ 交叉火力 ${ans}°$，陷阵营出击！', en: 'Gao Shun: "Verify: ${angle} + {ans} = 90$ ✓ Crossfire ${ans}°$!"' },
        highlightField: 'x'
      },
      {
        text: { zh: '高顺：一眼分清——$180°$ 是补角（"补"笔画多，数字大），$90°$ 是余角（"余"笔画少，数字小）', en: 'Gao Shun: "Quick tip: Supplementary = Straight line = $180°$. Complementary = Corner (right angle) = $90°$"' },
        highlightField: 'x'
      }
    ],
    secret: { concept: { zh: '余角之和为 $90^\\circ$。', en: 'Complementary angles sum to $90^\\circ$.' }, formula: '$x + y = 90^\\circ$', tips: [{ zh: '高顺提示：陷阵营，角度必争！', en: 'Gao Shun Tip: For the Camp Crushers, every angle counts!' }] }
  },
  {
    id: 733, grade: 7, unitId: 3, order: 3,
    unitTitle: { zh: "Unit 3: 关隘与角度", en: "Unit 3: Passes & Angles" },
    topic: 'Geometry', type: 'ANGLES',
    title: { zh: '八卦阵位', en: 'Eight Trigrams Position' },
    skillName: { zh: '角度推演术', en: 'Angle Deduction' },
    skillSummary: { zh: '已知一角求其补角或余角', en: 'Find supplementary or complementary angle' },
    story: { zh: '诸葛亮布置八卦阵。阵眼向东射出一道令旗，方向角 ${angle}°$；另一道令旗与它正好成一条直线。', en: 'Zhuge Liang sets up the Eight Trigrams. A command flag points east at ${angle}°$; another flag forms a straight line with it.' },
    description: { zh: '求另一个角 $x$。', en: 'Find the other angle $x$.' },
    data: { angle: 45, total: 180, generatorType: 'ANGLES_RANDOM' }, difficulty: 'Medium', reward: 90,
    kpId: 'kp-4.6-01', sectionId: 'geometry',
    tutorialSteps: [
      {
        text: { zh: '诸葛亮：两道令旗合成一条直线——和之前虎牢关那题完全一样：直线两侧角加起来 $= 180°$', en: 'Zhuge Liang: "Two flags form a straight line — same as the Hulao Pass problem: angles on a line sum to $180°$"' },
        highlightField: 'x'
      },
      {
        text: { zh: '诸葛亮：一角 ${angle}°$，方程：${angle} + x = 180$', en: 'Zhuge Liang: "One angle ${angle}°$, equation: ${angle} + x = 180$"' },
        highlightField: 'x'
      },
      {
        text: { zh: '诸葛亮：$x = 180 - {angle} = {ans}$', en: 'Zhuge Liang: "$x = 180 - {angle} = {ans}$"' },
        highlightField: 'x'
      },
      {
        text: { zh: '诸葛亮：验算：${angle} + {ans} = 180$ ✓ 令旗方向角 ${ans}°$！', en: 'Zhuge Liang: "Verify: ${angle} + {ans} = 180$ ✓ Flag direction ${ans}°$!"' },
        highlightField: 'x'
      },
      {
        text: { zh: '诸葛亮：自检规则——锐角（$< 90°$）配钝角（$> 90°$）。如果两个都是锐角，一定算错了', en: 'Zhuge Liang: "Self-check: acute ($< 90°$) pairs with obtuse ($> 90°$). If both are acute, something is wrong"' },
        hint: { zh: '$45°$ 是锐角 → 补角应该是钝角 $135°$ ✓\n$120°$ 是钝角 → 补角应该是锐角 $60°$ ✓\n唯一例外：$90°$ 配 $90°$（两个直角）', en: '$45°$ acute → supplement should be obtuse $135°$ ✓\n$120°$ obtuse → supplement should be acute $60°$ ✓\nOnly exception: $90°+90°$' },
        highlightField: 'x'
      }
    ],
    secret: { concept: { zh: '补角的实际应用：方向角合成一条直线，互为补角。', en: 'Practical use of supplementary angles: direction angles forming a straight line are supplementary.' }, formula: '$x = 180° - y$', tips: [{ zh: '诸葛亮提示：阵法变幻，皆在术数。', en: 'Zhuge Tip: The changes in the formation are all in the numbers.' }] }
  },
  // --- Year 7 Unit 3 续: 三角形内角 & 周角 ---
  {
    id: 734, grade: 7, unitId: 3, order: 4,
    unitTitle: { zh: "Unit 3: 关隘与角度", en: "Unit 3: Passes & Angles" },
    topic: 'Geometry', type: 'ANGLES',
    title: { zh: '三角旗阵', en: 'Triangular Banner' },
    skillName: { zh: '三角内角和', en: 'Triangle Angle Sum' },
    skillSummary: { zh: '三角形三个内角之和 = 180°', en: 'The three interior angles of a triangle sum to 180°' },
    story: { zh: '关羽布置三角旗阵，需要计算旗帜的第三个角度。三角形内角和永远是 180°！', en: 'Guan Yu sets up a triangular banner formation. The angles in a triangle always sum to 180°!' },
    description: { zh: '求三角形的第三个角。', en: 'Find the missing angle in the triangle.' },
    data: { angle: 110, total: 180, a1: 60, a2: 50, generatorType: 'ANGLES_TRIANGLE_RANDOM' }, difficulty: 'Easy', reward: 50,
    kpId: 'kp-4.3-01', sectionId: 'geometry',
    tutorialSteps: [
      { text: { zh: '关羽：三角形内角和 = $180°$', en: 'Guan Yu: "Angles in a triangle sum to $180°$"' }, hint: { zh: '不管什么形状的三角形，三个角加起来永远是 180°', en: 'No matter the shape, the three angles always add to 180°' }, highlightField: 'x' },
      { text: { zh: '关羽：第三个角 = $180° - 60° - 50° = 70°$', en: 'Guan Yu: "Third angle = $180° - 60° - 50° = 70°$"' }, highlightField: 'x' },
    ],
    secret: { concept: { zh: '三角形内角和定理：任何三角形的三个内角之和 = 180°。', en: 'Triangle angle sum theorem: the three interior angles of any triangle sum to 180°.' }, formula: '$a + b + c = 180°$', tips: [{ zh: '关羽提示：三角旗阵，角度精准才能列阵如山！', en: 'Guan Yu Tip: Precise angles make an immovable formation!' }] }
  },
  {
    id: 735, grade: 7, unitId: 3, order: 5,
    unitTitle: { zh: "Unit 3: 关隘与角度", en: "Unit 3: Passes & Angles" },
    topic: 'Geometry', type: 'ANGLES',
    title: { zh: '瞭望全景', en: 'Watchtower Panorama' },
    skillName: { zh: '周角计算术', en: 'Angles at a Point' },
    skillSummary: { zh: '围绕一点的所有角之和 = 360°', en: 'All angles around a point sum to 360°' },
    story: { zh: '诸葛亮登上瞭望台，把四周分成几个监视区域。每个区域由不同的将领负责。已知其他区域的角度，只剩一个方向没有标注——那正是敌军最可能偷袭的方向！', en: 'Zhuge Liang climbs the watchtower and divides the surroundings into patrol sectors. Each sector is assigned to a general. All angles are marked except one — and that\'s exactly where the enemy is most likely to attack!' },
    description: { zh: '求围绕一点的未知角。', en: 'Find the missing angle around a point.' },
    data: { angle: 260, total: 360, angles: [120, 140], generatorType: 'ANGLES_POINT_RANDOM' }, difficulty: 'Easy', reward: 50,
    storyConsequence: {
      correct: { zh: '诸葛亮：好！$x$ 度方向正是敌军来路——立刻派赵云镇守此方！全方位无死角！', en: 'Zhuge Liang: "That $x°$ direction is the enemy\'s approach — send Zhao Yun to guard it immediately! Full 360° coverage, no blind spots!"' },
      wrong: { zh: '诸葛亮：角度算错了...那个方向留出了漏洞，敌军趁夜偷袭！重新计算！', en: 'Zhuge Liang: "Wrong angle... that gap left a blind spot. The enemy attacked at night! Recalculate!"' },
    },
    kpId: 'kp-4.3-02', sectionId: 'geometry',
    tutorialSteps: [
      { text: { zh: '诸葛亮：想象你站在瞭望台正中央，转一整圈看遍所有方向', en: 'Zhuge Liang: "Imagine standing at the center of the watchtower, turning a full circle to see every direction"' }, hint: { zh: '面朝北 → 转向东 → 转向南 → 转向西 → 回到北\n一整圈 = $360°$\n\n所有监视区域的角度加起来，必须刚好等于 $360°$\n少一度都有盲区！', en: 'Face North → turn East → South → West → back to North\nOne full turn = $360°$\n\nAll patrol sector angles must add up to exactly $360°$\nEven 1° missing creates a blind spot!' }, highlightField: 'x' },
      { text: { zh: '诸葛亮：已知的区域已经覆盖了多少度？', en: 'Zhuge Liang: "How many degrees are already covered?"' }, hint: { zh: '$120° + 140° = 260°$\n\n已覆盖 $260°$，总共需要 $360°$', en: '$120° + 140° = 260°$\n\nAlready covered $260°$, need $360°$ total' }, highlightField: 'x' },
      { text: { zh: '诸葛亮：剩下的缺口就是未知角', en: 'Zhuge Liang: "The remaining gap is the unknown angle"' }, hint: { zh: '$x = 360° - 260° = 100°$\n\n这 $100°$ 的方向就是要重点防守的位置！', en: '$x = 360° - 260° = 100°$\n\nThis $100°$ direction is where we need the most defense!' }, highlightField: 'x' },
    ],
    secret: { concept: { zh: '围绕一点的所有角加起来等于 360°（一整圈）。少一度都是防御漏洞！', en: 'Angles around a point sum to 360° (a full turn). Even 1° missing is a gap in defense!' }, formula: { zh: '$\\text{全部角之和} = 360°$', en: '$\\text{All angles sum} = 360°$' }, tips: [{ zh: '诸葛亮提示：三百六十度无死角，方可高枕无忧！', en: 'Zhuge Liang Tip: Full 360° coverage — only then can you sleep soundly!' }] }
  },
  // --- Year 7 Unit 3A: 战场地图·坐标篇 ---
  {
    id: 745, grade: 7, unitId: 3, order: 6,
    unitTitle: { zh: "Unit 3A: 战场地图·坐标篇", en: "Unit 3A: Battlefield Map — Coordinates" },
    topic: 'Geometry', type: 'COORDINATES',
    title: { zh: '读图定位', en: 'Map Reading' },
    skillName: { zh: '坐标读写术', en: 'Reading Coordinates' },
    skillSummary: { zh: '坐标 (x, y)：先横后竖，右上为正', en: 'Coordinates (x, y): horizontal first, then vertical; right/up = positive' },
    story: { zh: '诸葛亮展开战场地图，上面标满了方格。"每个敌营都有一个坐标——先看横坐标（左右），再看纵坐标（上下）。读准坐标，才能精确打击！"', en: 'Zhuge Liang unfolds the battlefield map, covered in grid squares. "Every enemy camp has coordinates — read the x (horizontal) first, then y (vertical). Accurate coordinates mean precise strikes!"' },
    description: { zh: '读出目标位置的坐标 $(x, y)$。', en: 'Read the coordinates $(x, y)$ of the target.' },
    data: { targetX: 3, targetY: 5, mode: 'read', generatorType: 'COORDINATES_RANDOM' }, difficulty: 'Easy', reward: 45,
    kpId: 'kp-3.1-01', sectionId: 'geometry',
    tutorialSteps: [
      { text: { zh: '诸葛亮：坐标就是地图上的"地址"——用两个数字定位', en: 'Zhuge Liang: "Coordinates are the address on a map — two numbers pin a location"' }, hint: { zh: '$(x, y)$：先看 $x$（横着走几步），再看 $y$（竖着走几步）\n口诀：先横后竖，先 $x$ 后 $y$', en: '$(x, y)$: $x$ = horizontal steps, $y$ = vertical steps\nRule: horizontal first, vertical second' }, highlightField: 'x' },
      { text: { zh: '诸葛亮：$x$ 往右为正，往左为负；$y$ 往上为正，往下为负', en: 'Zhuge Liang: "$x$: right = positive, left = negative; $y$: up = positive, down = negative"' }, highlightField: 'x' },
    ],
    secret: { concept: { zh: '坐标系用 (x,y) 两个数字标记位置。x 是左右，y 是上下。原点 (0,0) 是起点。', en: 'The coordinate system uses (x,y) to mark positions. x = left/right, y = up/down. Origin (0,0) is the start.' }, formula: '$(x, y)$：先横后竖', tips: [{ zh: '诸葛亮提示：读图如读兵法——坐标不准，全盘皆输！', en: 'Zhuge Liang Tip: Reading maps is like reading strategy — wrong coordinates mean total defeat!' }] }
  },
  {
    id: 746, grade: 7, unitId: 3, order: 7,
    unitTitle: { zh: "Unit 3A: 战场地图·坐标篇", en: "Unit 3A: Battlefield Map — Coordinates" },
    topic: 'Geometry', type: 'COORDINATES',
    title: { zh: '四象限侦察', en: 'Four Quadrant Recon' },
    skillName: { zh: '负坐标辨识术', en: 'Negative Coordinates' },
    skillSummary: { zh: '坐标可以是负数——左边和下面是负的，四个象限都要能定位', en: 'Coordinates can be negative — left/down are negative, locate in all four quadrants' },
    story: { zh: '赵云奉命侦察四个方向的敌营。有的在右上（正正），有的在左下（负负）。坐标有正有负，四个象限都不能漏！', en: 'Zhao Yun scouts enemy camps in all directions. Some are top-right (+,+), others bottom-left (−,−). Coordinates can be positive or negative — cover all four quadrants!' },
    description: { zh: '读出含负数的坐标。', en: 'Read coordinates with negative values.' },
    data: { targetX: -3, targetY: 4, mode: 'negative', generatorType: 'COORDINATES_RANDOM' }, difficulty: 'Medium', reward: 55,
    kpId: 'kp-3.1-02', sectionId: 'geometry',
    tutorialSteps: [
      { text: { zh: '赵云：坐标有四个象限——正负数的组合', en: 'Zhao Yun: "Four quadrants — combinations of positive and negative"' }, hint: { zh: 'I $(+,+)$ 右上 | II $(-,+)$ 左上\nIII $(-,-)$ 左下 | IV $(+,-)$ 右下\n\n$(-3, 4)$：$x=-3$（左走 3），$y=4$（上走 4）→ 第 II 象限', en: 'I $(+,+)$ top-right | II $(-,+)$ top-left\nIII $(-,-)$ bottom-left | IV $(+,-)$ bottom-right\n\n$(-3, 4)$: $x=-3$ (left 3), $y=4$ (up 4) → Quadrant II' }, highlightField: 'x' },
    ],
    storyConsequence: {
      correct: { zh: '赵云：坐标精确！敌营位置锁定，可以包抄！', en: 'Zhao Yun: "Precise coordinates! Enemy camp located — ready to flank!"' },
      wrong: { zh: '赵云：坐标搞反了...侦察兵跑错方向！重新定位！', en: 'Zhao Yun: "Coordinates mixed up... scouts went the wrong way! Relocate!"' },
    },
    secret: { concept: { zh: '四个象限由 x 和 y 的正负决定。负坐标 = 反方向。', en: 'Four quadrants depend on signs of x and y. Negative = opposite direction.' }, formula: 'I$(+,+)$ II$(-,+)$ III$(-,-)$ IV$(+,-)$', tips: [{ zh: '赵云提示：正负不分，敌友不明！', en: 'Zhao Yun Tip: Mix up signs and you can\'t tell friend from foe!' }] }
  },
  // --- Year 7 Unit 4: 行军数列·序列篇 ---
  {
    id: 741, grade: 7, unitId: 4, order: 1,
    unitTitle: { zh: "Unit 4: 行军数列·序列篇", en: "Unit 4: March Sequence — Sequences" },
    topic: 'Algebra', type: 'ARITHMETIC',
    title: { zh: '增兵步伐', en: 'Troop Buildup Pattern' },
    skillName: { zh: '数列续写术', en: 'Sequence Next Term' },
    skillSummary: { zh: '找规律：每次加多少？下一个就再加那么多', en: 'Find the pattern: what\'s added each time? Add it again for the next term' },
    story: { zh: '刘备每天招募新兵，人数呈规律增长。观察规律，预测明天的新兵人数！', en: 'Liu Bei recruits daily in a pattern. Observe and predict tomorrow\'s count!' },
    description: { zh: '找出数列的下一项。', en: 'Find the next term in the sequence.' },
    data: { a1: 3, d: 4, n: 5, mode: 'next', generatorType: 'SEQUENCE_Y7_RANDOM' }, difficulty: 'Easy', reward: 45,
    kpId: 'kp-2.7-01', sectionId: 'algebra',
    tutorialSteps: [
      { text: { zh: '刘备：每天比前天多招 4 人——这就是"公差"', en: 'Liu Bei: "4 more each day — that\'s the common difference"' }, hint: { zh: '$3, 7, 11, 15, ?$\n$7-3=4$，$11-7=4$，$15-11=4$\n下一个：$15+4=19$', en: '$3, 7, 11, 15, ?$\n$7-3=4$, $11-7=4$, $15-11=4$\nNext: $15+4=19$' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '等差数列：每项与前一项的差（公差）恒定。下一项 = 最后一项 + 公差。', en: 'Arithmetic sequence: the difference between consecutive terms is constant. Next = last + common difference.' }, formula: { zh: '$\\text{下一项} = \\text{末项} + d$', en: '$\\text{Next term} = \\text{Last term} + d$' }, tips: [{ zh: '刘备提示：找到规律，就能预见未来！', en: 'Liu Bei Tip: Find the pattern, predict the future!' }] }
  },
  {
    id: 742, grade: 7, unitId: 4, order: 2,
    unitTitle: { zh: "Unit 4: 行军数列·序列篇", en: "Unit 4: March Sequence — Sequences" },
    topic: 'Algebra', type: 'ARITHMETIC',
    title: { zh: '远征推算', en: 'Expedition Projection' },
    skillName: { zh: '通项公式术', en: 'Nth Term Formula' },
    skillSummary: { zh: '第 n 项 = 首项 + (n-1) × 公差', en: 'nth term = first term + (n-1) × common difference' },
    story: { zh: '赵云远征在外，需要推算第 n 天的补给量。用通项公式直接算！', en: 'Zhao Yun is on expedition — calculate the supply for day n using the formula!' },
    description: { zh: '用通项公式求第 $n$ 项。', en: 'Use the nth term formula to find term $n$.' },
    data: { a1: 5, d: 3, n: 8, mode: 'nth', generatorType: 'SEQUENCE_Y7_RANDOM' }, difficulty: 'Medium', reward: 55,
    kpId: 'kp-2.7-02', sectionId: 'algebra',
    tutorialSteps: [
      { text: { zh: '赵云：通项公式 $a_n = a_1 + (n-1) \\times d$', en: 'Zhao Yun: "nth term formula: $a_n = a_1 + (n-1) \\times d$"' }, hint: { zh: '$a_1=5$, $d=3$, $n=8$\n$a_8 = 5 + (8-1) \\times 3 = 5 + 21 = 26$', en: '$a_1=5$, $d=3$, $n=8$\n$a_8 = 5 + (8-1) \\times 3 = 5 + 21 = 26$' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '通项公式让你不必逐项数，直接跳到第 n 项。', en: 'The nth term formula lets you jump directly to any term without counting one by one.' }, formula: '$a_n = a_1 + (n-1)d$', tips: [{ zh: '赵云提示：兵贵神速，公式比逐个数快！', en: 'Zhao Yun Tip: Speed matters — formulas beat counting one by one!' }] }
  },
  // --- Year 7 Unit 4 续: 递减数列（跨单元：负数+数列）---
  {
    id: 743, grade: 7, unitId: 4, order: 3,
    unitTitle: { zh: "Unit 4: 行军数列·序列篇", en: "Unit 4: March Sequence — Sequences" },
    topic: 'Algebra', type: 'ARITHMETIC',
    title: { zh: '粮草日减', en: 'Dwindling Supplies' },
    skillName: { zh: '递减数列术', en: 'Decreasing Sequences' },
    skillSummary: { zh: '公差为负数——每一项比前一项少，数列在递减', en: 'Negative common difference — each term is smaller, sequence decreases' },
    story: { zh: '远征军的粮草每天消耗固定量。第一天有 30 石，每天减少 3 石。第 10 天还剩多少？什么时候彻底断粮？', en: 'The expedition army consumes a fixed amount of grain daily. Starting with 30 units, losing 3 each day. How much on day 10? When do supplies run out?' },
    description: { zh: '递减数列：求第 $n$ 项。', en: 'Decreasing sequence: find term $n$.' },
    data: { a1: 30, d: -3, n: 10, mode: 'nth', generatorType: 'SEQUENCE_Y7_RANDOM' }, difficulty: 'Medium', reward: 55,
    kpId: 'kp-2.7-03', sectionId: 'algebra',
    tutorialSteps: [
      { text: { zh: '赵云：公差可以是负数——每天减少就是"加一个负数"', en: 'Zhao Yun: "Common difference can be negative — daily decrease means adding a negative"' }, hint: { zh: '$30, 27, 24, 21, \\ldots$\n$27 - 30 = -3$（公差 $d = -3$）\n\n第 $n$ 项 $= 30 + (n-1) \\times (-3)$\n第 10 项 $= 30 + 9 \\times (-3) = 30 - 27 = 3$', en: '$30, 27, 24, 21, \\ldots$\n$27 - 30 = -3$ (common difference $d = -3$)\n\nTerm $n$ $= 30 + (n-1) \\times (-3)$\nTerm 10 $= 30 + 9 \\times (-3) = 30 - 27 = 3$' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '公差为负数时数列递减。公式不变：$a_n = a_1 + (n-1)d$，只是 $d < 0$。', en: 'Negative common difference = decreasing sequence. Same formula, just $d < 0$.' }, formula: '$a_n = a_1 + (n-1)d,\\quad d < 0$', tips: [{ zh: '赵云提示：知道粮草何时耗尽，才能提前安排补给线！', en: 'Zhao Yun Tip: Know when supplies run out to plan the supply line ahead!' }] },
    storyConsequence: { correct: { zh: '粮草消耗精准预测，补给线及时安排！', en: 'Supply depletion predicted accurately — resupply arranged in time!' }, wrong: { zh: '粮草耗尽时间算错，大军断粮…', en: 'Supply exhaustion miscalculated — army runs out of food...' } },
  },
  // --- Year 7 Unit 5: 估算篇 ---
  {
    id: 751, grade: 7, unitId: 5, order: 1,
    unitTitle: { zh: "Unit 5: 斥候估算·近似值篇", en: "Unit 5: Scout Estimation — Rounding" },
    topic: 'Algebra', type: 'ESTIMATION',
    title: { zh: '斥候报数', en: 'Scout Headcount' },
    skillName: { zh: '四舍五入术', en: 'Rounding Numbers' },
    skillSummary: { zh: '看要舍去的那一位：0-4 舍，5-9 入', en: 'Look at the digit to remove: 0-4 round down, 5-9 round up' },
    story: { zh: '斥候回报敌军人数，但不需要精确数字——四舍五入到大概即可！', en: 'Scouts report enemy numbers — an approximate round figure is enough!' },
    description: { zh: '四舍五入。', en: 'Round the number.' },
    data: { n: 347, place: 10, answer: 350, generatorType: 'ESTIMATION_ROUND_RANDOM' }, difficulty: 'Easy', reward: 40,
    kpId: 'kp-1.9-01', sectionId: 'number',
    tutorialSteps: [
      { text: { zh: '诸葛亮：四舍五入——看要舍去的那一位', en: 'Zhuge Liang: "Rounding — look at the digit being removed"' }, hint: { zh: '$347$ 四舍五入到十位：\n看个位 $7$（$\\geq 5$），进 1\n$347 \\approx 350$', en: 'Round $347$ to nearest 10:\nLook at ones digit $7$ ($\\geq 5$), round up\n$347 \\approx 350$' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '四舍五入：看要去掉的那一位，0-4 不变，5-9 前一位加 1。', en: 'Rounding: look at the digit being removed. 0-4 stays, 5-9 rounds up.' }, formula: { zh: '$\\text{看下一位：} < 5 \\text{ 舍，} \\geq 5 \\text{ 入}$', en: '$\\text{Check next digit: } < 5 \\text{ round down, } \\geq 5 \\text{ round up}$' }, tips: [{ zh: '诸葛亮提示：战场上要的是大局观，不纠结零头！', en: 'Zhuge Liang Tip: On the battlefield, focus on the big picture!' }] }
  },
  {
    id: 752, grade: 7, unitId: 5, order: 2,
    unitTitle: { zh: "Unit 5: 斥候估算·近似值篇", en: "Unit 5: Scout Estimation — Rounding" },
    topic: 'Algebra', type: 'ESTIMATION',
    title: { zh: '大军估数', en: 'Army Estimate' },
    skillName: { zh: '大数估算术', en: 'Large Number Rounding' },
    skillSummary: { zh: '四舍五入到百位或千位', en: 'Round to the nearest hundred or thousand' },
    story: { zh: '大军压境，需要快速估算双方兵力差距。大数估算派上用场！', en: 'With a massive army approaching, quickly estimate the force difference!' },
    description: { zh: '四舍五入到更高位。', en: 'Round to a higher place value.' },
    data: { n: 3847, place: 100, answer: 3800, generatorType: 'ESTIMATION_ROUND_RANDOM' }, difficulty: 'Medium', reward: 50,
    kpId: 'kp-1.9-02', sectionId: 'number',
    tutorialSteps: [
      { text: { zh: '诸葛亮：大数估算——先找到要舍入的位', en: 'Zhuge Liang: "Large numbers — find the place value first"' }, hint: { zh: '$3847$ 四舍五入到百位：\n看十位 $4$（$< 5$），舍\n$3847 \\approx 3800$', en: 'Round $3847$ to nearest 100:\nLook at tens digit $4$ ($< 5$), round down\n$3847 \\approx 3800$' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '四舍五入到百位看十位，到千位看百位——总是看"下一位"。', en: 'To round to hundreds look at tens, to round to thousands look at hundreds — always check the next digit.' }, formula: { zh: '$\\text{看"下一位"决定舍入}$', en: '$\\text{Check the next digit to decide rounding}$' }, tips: [{ zh: '诸葛亮提示：知己知彼，估算也要精准到位！', en: 'Zhuge Liang Tip: Know your enemy — even estimates should be strategic!' }] },
    storyConsequence: { correct: { zh: '大军兵力估算到位，战略部署精准！', en: 'Army strength estimated correctly — strategy deployed precisely!' }, wrong: { zh: '估算偏差太大，战略判断失误…', en: 'Estimate too far off — strategic miscalculation...' } },
  },
  // --- Year 7 Unit 6: 营寨丈量·周长与面积篇 ---
  {
    id: 761, grade: 7, unitId: 6, order: 1,
    unitTitle: { zh: "Unit 6: 营寨丈量·周长与面积篇", en: "Unit 6: Camp Survey — Perimeter & Area" },
    topic: 'Geometry', type: 'PERIMETER',
    title: { zh: '围栅建营', en: 'Building the Camp Fence' },
    skillName: { zh: '周长计算术', en: 'Perimeter Calculation' },
    skillSummary: { zh: '长方形周长 = 2 × (长 + 宽)', en: 'Rectangle perimeter = 2 × (length + width)' },
    story: { zh: '刘备安营扎寨，需要计算围栅的总长度——这就是周长！', en: 'Liu Bei sets up camp — calculate the total fence length needed. That\'s the perimeter!' },
    description: { zh: '计算长方形周长。', en: 'Calculate the rectangle perimeter.' },
    data: { length: 12, width: 8, answer: 40, generatorType: 'PERIMETER_RECT_RANDOM' }, difficulty: 'Easy', reward: 45,
    kpId: 'kp-4.5-01', sectionId: 'geometry',
    tutorialSteps: [
      { text: { zh: '刘备：周长就是绕一圈的总长度', en: 'Liu Bei: "Perimeter is the total distance around"' }, hint: { zh: '长方形有两条长、两条宽\n$P = 2(12 + 8) = 2 \\times 20 = 40$', en: 'A rectangle has 2 lengths and 2 widths\n$P = 2(12 + 8) = 2 \\times 20 = 40$' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '周长是图形一圈的总长度。长方形：P = 2(l+w)。', en: 'Perimeter is the total distance around a shape. Rectangle: P = 2(l+w).' }, formula: '$P = 2(l + w)$', tips: [{ zh: '刘备提示：围栅不够长，敌人就攻进来了！', en: 'Liu Bei Tip: If the fence is too short, the enemy gets in!' }] }
  },
  {
    id: 762, grade: 7, unitId: 6, order: 2,
    unitTitle: { zh: "Unit 6: 营寨丈量·周长与面积篇", en: "Unit 6: Camp Survey — Perimeter & Area" },
    topic: 'Geometry', type: 'AREA',
    title: { zh: '营地面积', en: 'Camp Ground Area' },
    skillName: { zh: '长方形面积术', en: 'Rectangle Area' },
    skillSummary: { zh: '长方形面积 = 长 × 宽', en: 'Rectangle area = length × width' },
    story: { zh: '张飞负责规划营地面积。长方形营地的面积 = 长 × 宽。', en: 'Zhang Fei plans the camp ground. Rectangle area = length × width.' },
    description: { zh: '计算长方形面积。', en: 'Calculate the rectangle area.' },
    data: { length: 15, width: 8, generatorType: 'AREA_RECT_RANDOM' }, difficulty: 'Easy', reward: 45,
    kpId: 'kp-4.5-02', sectionId: 'geometry',
    tutorialSteps: [
      { text: { zh: '张飞：面积就是形状里面有多大', en: 'Zhang Fei: "Area is how much space is inside the shape"' }, hint: { zh: '长方形面积 = 长 × 宽\n$15 \\times 8 = 120$ 平方单位', en: 'Rectangle area = length × width\n$15 \\times 8 = 120$ square units' }, highlightField: 'area' },
    ],
    secret: { concept: { zh: '面积是图形内部的大小。长方形面积 = 长 × 宽。', en: 'Area is the space inside a shape. Rectangle area = length × width.' }, formula: '$A = l \\times w$', tips: [{ zh: '张飞提示：营地够大，才能屯兵万千！', en: 'Zhang Fei Tip: A big camp holds a big army!' }] }
  },
  {
    id: 763, grade: 7, unitId: 6, order: 3,
    unitTitle: { zh: "Unit 6: 营寨丈量·周长与面积篇", en: "Unit 6: Camp Survey — Perimeter & Area" },
    topic: 'Geometry', type: 'AREA',
    title: { zh: '三角旗帜', en: 'Triangular Banner' },
    skillName: { zh: '三角形面积术', en: 'Triangle Area' },
    skillSummary: { zh: '三角形面积 = 底 × 高 ÷ 2', en: 'Triangle area = base × height ÷ 2' },
    story: { zh: '赵云要制作三角军旗。三角形面积 = 底 × 高 ÷ 2——是长方形的一半！', en: 'Zhao Yun makes triangular banners. Triangle area = base × height ÷ 2 — half a rectangle!' },
    description: { zh: '计算三角形面积。', en: 'Calculate the triangle area.' },
    data: { base: 10, height: 6, answer: 30, generatorType: 'AREA_TRIANGLE_RANDOM' }, difficulty: 'Easy', reward: 50,
    kpId: 'kp-4.5-03', sectionId: 'geometry',
    tutorialSteps: [
      { text: { zh: '赵云：三角形面积 = 底 × 高 ÷ 2', en: 'Zhao Yun: "Triangle area = base × height ÷ 2"' }, hint: { zh: '为什么除以 2？三角形是长方形对角切一半\n$\\frac{10 \\times 6}{2} = \\frac{60}{2} = 30$', en: 'Why ÷ 2? A triangle is half a rectangle cut diagonally\n$\\frac{10 \\times 6}{2} = \\frac{60}{2} = 30$' }, highlightField: 'area' },
    ],
    secret: { concept: { zh: '三角形面积 = 底 × 高 ÷ 2。可以理解为长方形面积的一半。', en: 'Triangle area = base × height ÷ 2. It\'s half the area of a rectangle.' }, formula: '$A = \\frac{b \\times h}{2}$', tips: [{ zh: '赵云提示：旗帜虽小，面积公式却大有用处！', en: 'Zhao Yun Tip: Small banner, big formula!' }] }
  },
  // --- Year 7 Unit 6 续: 跨单元应用（方程+周长，代入+面积）---
  {
    id: 764, grade: 7, unitId: 6, order: 4,
    unitTitle: { zh: "Unit 6: 营寨丈量·周长与面积篇", en: "Unit 6: Camp Survey — Perimeter & Area" },
    topic: 'Geometry', type: 'SIMPLE_EQ',
    title: { zh: '围栅反推', en: 'Fence Reverse Problem' },
    skillName: { zh: '逆向周长术', en: 'Reverse Perimeter' },
    skillSummary: { zh: '已知周长和一条边，反推另一条边——周长公式反着用', en: 'Given perimeter and one side, find the other — use the perimeter formula in reverse' },
    story: { zh: '刘备有 $2 \\times ({a} + x) = {result}$ 根围栅（周长 {result}），营地宽已经确定为 {a}。营地能做多长？', en: 'Liu Bei has {result} fence posts (perimeter {result}), camp width is fixed at {a}. How long can the camp be?' },
    description: { zh: '已知周长和宽，求长。解方程 $2({a} + x) = {result}$。', en: 'Given perimeter and width, find length. Solve $2({a} + x) = {result}$.' },
    data: { x: 8, a: 12, result: 40, generatorType: 'SIMPLE_EQ_TWOSTEP_RANDOM' }, difficulty: 'Medium', reward: 60,
    kpId: 'kp-4.5-01', sectionId: 'geometry',
    tutorialSteps: [
      { text: { zh: '刘备：周长 = $2(长 + 宽)$，已知周长和宽，反推长', en: 'Liu Bei: "Perimeter = $2(l + w)$, known P and w, find l"' }, hint: { zh: '周长 $= 40$，宽 $= 12$\n$2(x + 12) = 40$\n$x + 12 = 20$（两边 $\\div 2$）\n$x = 8$（两边 $-12$）\n\n验算：$2(8 + 12) = 2 \\times 20 = 40$ ✓', en: 'Perimeter $= 40$, width $= 12$\n$2(x + 12) = 40$\n$x + 12 = 20$ (÷2 both sides)\n$x = 8$ (−12 both sides)\n\nCheck: $2(8 + 12) = 2 \\times 20 = 40$ ✓' }, highlightField: 'x' },
    ],
    storyConsequence: {
      correct: { zh: '刘备：长 8 宽 12，刚好围起来！营地开建！', en: 'Liu Bei: "Length 8, width 12 — perfect fit! Start building!"' },
      wrong: { zh: '刘备：围栅不够长...重新算！', en: 'Liu Bei: "Not enough fencing... recalculate!"' },
    },
    secret: { concept: { zh: '周长公式可以反着用：已知周长求边长，就是解方程。几何和代数是一家！', en: 'The perimeter formula works in reverse: finding a side from the perimeter IS solving an equation. Geometry and algebra are one!' }, formula: '$2(l + w) = P \\Rightarrow l = \\frac{P}{2} - w$', tips: [{ zh: '刘备提示：正着算是求周长，反着算就是解方程——同一个公式，两种用法！', en: 'Liu Bei Tip: Forward = find perimeter. Reverse = solve equation. Same formula, two uses!' }] }
  },
  {
    id: 765, grade: 7, unitId: 6, order: 5,
    unitTitle: { zh: "Unit 6: 营寨丈量·周长与面积篇", en: "Unit 6: Camp Survey — Perimeter & Area" },
    topic: 'Geometry', type: 'SUBSTITUTION',
    title: { zh: '营地蓝图', en: 'Camp Blueprint' },
    skillName: { zh: '代入面积术', en: 'Substitution into Area' },
    skillSummary: { zh: '把代数表达式代入面积公式——代数和几何的结合', en: 'Substitute algebraic expressions into area formulas — where algebra meets geometry' },
    story: { zh: '赵云设计营地蓝图：长用公式 $2x + 3$ 表示，宽固定为 5。军师说 $x = 4$，算出营地面积！', en: 'Zhao Yun designs the camp: length is $2x + 3$, width is 5. The strategist says $x = 4$. Find the camp area!' },
    description: { zh: '先代入求长，再算面积。', en: 'Substitute to find length, then calculate area.' },
    data: { a: 2, b: 3, x: 4, answer: 55, mode: 'linear', expr: '2x + 3', generatorType: 'SUBSTITUTION_RANDOM' }, difficulty: 'Medium', reward: 60,
    kpId: 'kp-2.2-01', sectionId: 'algebra',
    tutorialSteps: [
      { text: { zh: '赵云：分两步走——先代入求长，再算面积', en: 'Zhao Yun: "Two steps: substitute to find length, then calculate area"' }, hint: { zh: '第一步：长 $= 2x + 3 = 2 \\times 4 + 3 = 8 + 3 = 11$\n第二步：面积 $= 11 \\times 5 = 55$\n\n这就是代数 + 几何的结合！', en: 'Step 1: length $= 2x + 3 = 2 \\times 4 + 3 = 8 + 3 = 11$\nStep 2: area $= 11 \\times 5 = 55$\n\nThis is algebra + geometry combined!' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '代数和几何可以结合：用公式表示边长，代入后就能算面积。这是高中数学的基础！', en: 'Algebra + geometry combine: express sides as formulas, substitute to find area. This is the foundation of advanced math!' }, formula: '$A = (2x + 3) \\times w$', tips: [{ zh: '赵云提示：会画蓝图还不够，还要会算面积！', en: 'Zhao Yun Tip: Drawing blueprints isn\'t enough — you must calculate the area!' }] },
    storyConsequence: { correct: { zh: '营地蓝图完美落地，代数+几何完美结合！', en: 'Camp blueprint executed perfectly — algebra + geometry in harmony!' }, wrong: { zh: '蓝图尺寸算错，营地太小住不下…', en: 'Blueprint dimensions wrong — camp too small for the troops...' } },
  },
  // --- Year 7 Unit 7: 战后统计·数据篇 ---
  {
    id: 770, grade: 7, unitId: 7, order: 0,
    unitTitle: { zh: "Unit 7: 战后统计·数据篇", en: "Unit 7: Post-battle Stats — Data" },
    topic: 'Statistics', type: 'STATISTICS',
    title: { zh: '兵器清点', en: 'Weapon Inventory' },
    skillName: { zh: '众数辨识术', en: 'Mode (Most Common)' },
    skillSummary: { zh: '众数 = 出现次数最多的数——数据里的"人气王"', en: 'Mode = the value that appears most often' },
    story: { zh: '张飞清点缴获的兵器：刀、枪、剑、戟...哪种兵器数量最多？出现次数最多的那个就是"众数"！', en: 'Zhang Fei inventories captured weapons: swords, spears, halberds... Which type is most common? The most frequent value is the "mode"!' },
    description: { zh: '找出数据的众数（出现次数最多的数）。', en: 'Find the mode (most frequent value).' },
    data: { values: [3, 5, 5, 5, 7, 8, 12], mode: 'mode', modeValue: 5, modeCount: 3, generatorType: 'STATISTICS_MODE_RANDOM' }, difficulty: 'Easy', reward: 40,
    kpId: 'kp-9.3-01', sectionId: 'statistics',
    tutorialSteps: [
      { text: { zh: '张飞：众数就是出现次数最多的数——数据里的"人气王"', en: 'Zhang Fei: "Mode = the value appearing most — the \'most popular\' in the data"' }, hint: { zh: '$3, 5, 5, 5, 7, 8, 12$\n$3$ 出现 1 次\n$5$ 出现 3 次 ← 最多！\n$7$ 出现 1 次\n$8$ 出现 1 次\n$12$ 出现 1 次\n\n众数 = $5$', en: '$3, 5, 5, 5, 7, 8, 12$\n$3$: 1 time\n$5$: 3 times ← most!\n$7$: 1 time\n$8$: 1 time\n$12$: 1 time\n\nMode = $5$' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '众数是出现频率最高的值。一组数据可以有多个众数，也可以没有众数。', en: 'Mode is the most frequent value. Data can have multiple modes or no mode.' }, formula: { zh: '$\\text{众数 = 频率最高的值}$', en: '$\\text{Mode = most frequent value}$' }, tips: [{ zh: '张飞提示：哪种兵器最多，就知道敌军的战术偏好！', en: 'Zhang Fei Tip: The most common weapon reveals the enemy\'s tactics!' }] }
  },
  {
    id: 771, grade: 7, unitId: 7, order: 1,
    unitTitle: { zh: "Unit 7: 战后统计·数据篇", en: "Unit 7: Post-battle Stats — Data" },
    topic: 'Statistics', type: 'STATISTICS',
    title: { zh: '平均战力', en: 'Average Strength' },
    skillName: { zh: '平均数计算术', en: 'Mean Calculation' },
    skillSummary: { zh: '平均数 = 所有数之和 ÷ 个数', en: 'Mean = sum of all values ÷ number of values' },
    story: { zh: '曹操统计各营战斗力，用平均数来评估整体水平。', en: 'Cao Cao evaluates battalion strength using the mean (average).' },
    description: { zh: '求平均数。', en: 'Find the mean.' },
    data: { values: [8, 12, 15, 10, 5], mode: 'mean', generatorType: 'STATISTICS_MEAN_RANDOM' }, difficulty: 'Easy', reward: 45,
    kpId: 'kp-6.1-01', sectionId: 'statistics',
    tutorialSteps: [
      { text: { zh: '曹操：平均数 = 加起来 ÷ 个数', en: 'Cao Cao: "Mean = add them up ÷ how many"' }, hint: { zh: '$(8+12+15+10+5) \\div 5 = 50 \\div 5 = 10$', en: '$(8+12+15+10+5) \\div 5 = 50 \\div 5 = 10$' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '平均数把总量平均分给每个数据。它代表数据的"中心水平"。', en: 'The mean shares the total equally. It represents the "center" of the data.' }, formula: '$\\bar{x} = \\frac{\\sum x}{n}$', tips: [{ zh: '曹操提示：知道全军平均水平，才能精准调度！', en: 'Cao Cao Tip: Know the average to optimize deployment!' }] }
  },
  {
    id: 772, grade: 7, unitId: 7, order: 2,
    unitTitle: { zh: "Unit 7: 战后统计·数据篇", en: "Unit 7: Post-battle Stats — Data" },
    topic: 'Statistics', type: 'STATISTICS',
    title: { zh: '中位排名', en: 'Median Rank' },
    skillName: { zh: '中位数计算术', en: 'Median Calculation' },
    skillSummary: { zh: '排序后取中间的数', en: 'Sort the values, then pick the middle one' },
    story: { zh: '诸葛亮要找出"中间水平"的士兵——先排序，再取中间值。', en: 'Zhuge Liang finds the "middle level" soldier — sort first, then pick the middle.' },
    description: { zh: '求中位数。', en: 'Find the median.' },
    data: { values: [3, 7, 8, 12, 15], mode: 'median', generatorType: 'STATISTICS_MEDIAN_RANDOM' }, difficulty: 'Easy', reward: 45,
    kpId: 'kp-6.1-02', sectionId: 'statistics',
    tutorialSteps: [
      { text: { zh: '诸葛亮：先排序，再找中间', en: 'Zhuge Liang: "Sort first, then find the middle"' }, hint: { zh: '排序后：$3, 7, 8, 12, 15$\n5 个数，中间是第 3 个 = $8$', en: 'Sorted: $3, 7, 8, 12, 15$\n5 values, middle is 3rd = $8$' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '中位数是排序后正中间的值。它不受极端值影响。', en: 'Median is the middle value after sorting. It\'s not affected by outliers.' }, formula: { zh: '$\\text{排序后取中间值}$', en: '$\\text{Middle value after sorting}$' }, tips: [{ zh: '诸葛亮提示：中位数比平均数更稳定——一个极端值不会带偏它！', en: 'Zhuge Liang Tip: Median is more stable than mean — one outlier won\'t skew it!' }] }
  },
  {
    id: 773, grade: 7, unitId: 7, order: 3,
    unitTitle: { zh: "Unit 7: 战后统计·数据篇", en: "Unit 7: Post-battle Stats — Data" },
    topic: 'Statistics', type: 'STATISTICS',
    title: { zh: '战力差距', en: 'Strength Spread' },
    skillName: { zh: '极差计算术', en: 'Range Calculation' },
    skillSummary: { zh: '极差 = 最大值 - 最小值', en: 'Range = Maximum - Minimum' },
    story: { zh: '张飞要看各营战力差距有多大——用极差（Range）来衡量！', en: 'Zhang Fei measures the gap between battalions using the range!' },
    description: { zh: '求极差（Range）。', en: 'Find the range.' },
    data: { values: [5, 8, 12, 15, 20], mode: 'range', generatorType: 'STATISTICS_RANGE_RANDOM' }, difficulty: 'Easy', reward: 40,
    kpId: 'kp-6.1-03', sectionId: 'statistics',
    tutorialSteps: [
      { text: { zh: '张飞：极差 = 最大的 - 最小的', en: 'Zhang Fei: "Range = biggest − smallest"' }, hint: { zh: '最大 $20$，最小 $5$\nRange = $20 - 5 = 15$', en: 'Max $20$, Min $5$\nRange = $20 - 5 = 15$' }, highlightField: 'ans' },
    ],
    secret: { concept: { zh: '极差衡量数据的"分散程度"——差越大，数据越分散。', en: 'Range measures how spread out the data is — bigger range means more spread.' }, formula: '$\\text{Range} = \\text{Max} - \\text{Min}$', tips: [{ zh: '张飞提示：差距太大就要整训，差距小说明水平齐整！', en: 'Zhang Fei Tip: Big gap means more training needed!' }] },
    storyConsequence: { correct: { zh: '战力差距一目了然！张飞：整训计划安排上了！', en: 'Strength gap crystal clear! Zhang Fei: Training plan is set!' }, wrong: { zh: '数据分析有误，整训方向搞错了…', en: 'Data analysis wrong — training focus is off...' } },
  },

  // === Year 8: 讨伐董卓 → 官渡之战 → 隆中对 (190-209 AD) ===
  // 8 units, ~40 missions. Generators provide gold-standard tutorials (≥6 steps, WHY→verify).

  // --- Unit 1: 进军篇 · 讨伐董卓·虎牢关 (190 AD) — 线性方程 ---
  {
    id: 811, grade: 8, unitId: 1, order: 1,
    unitTitle: { zh: 'Unit 1: 进军篇 · 虎牢关', en: 'Unit 1: The March · Hulao Pass' },
    topic: 'Functions', type: 'LINEAR',
    title: { zh: '急行军', en: 'Forced March' },
    skillName: { zh: '行军路线术', en: 'March Route Planning' },
    skillSummary: { zh: '从两个坐标点求直线方程 y=mx+c', en: 'Find y=mx+c from two coordinate points' },
    story: { zh: '各路诸侯讨伐董卓，联军从 $({x1},{y1})$ 出发，经过 $({x2},{y2})$ 向虎牢关挺进。', en: 'Coalition forces march from $({x1},{y1})$ through $({x2},{y2})$ towards Hulao Pass.' },
    description: { zh: '求行军路线 $y = mx + c$', en: 'Find the march route $y = mx + c$' },
    data: { points: [[0, 2], [1, 5]], x1: 0, y1: 2, x2: 1, y2: 5, generatorType: 'LINEAR_RANDOM' },
    difficulty: 'Medium', reward: 150, kpId: 'kp-2.5-01', sectionId: 'functions',
    tutorialSteps: [],
    secret: { concept: { zh: '斜率 $m$ 是变化率（每走 1 步升高多少），截距 $c$ 是起点高度。', en: 'Slope $m$ is rate of change, intercept $c$ is starting height.' }, formula: '$m = \\frac{y_2 - y_1}{x_2 - x_1}, \\quad c = y_1 - mx_1$', tips: [{ zh: '关羽提示：知道两个点，就能画出一条直线！', en: 'Guan Yu Tip: Two points determine a line!' }] },
    storyConsequence: { correct: { zh: '联军路线精准，直奔虎牢关！', en: 'Coalition route is precise, heading straight for Hulao Pass!' }, wrong: { zh: '路线偏差，大军迷路了…', en: 'Route error — the army is lost...' } },
  },
  {
    id: 812, grade: 8, unitId: 1, order: 2,
    unitTitle: { zh: 'Unit 1: 进军篇 · 虎牢关', en: 'Unit 1: The March · Hulao Pass' },
    topic: 'Functions', type: 'FUNC_VAL',
    title: { zh: '追击哨兵', en: 'Intercepting Scouts' },
    skillName: { zh: '函数求值术', en: 'Function Evaluation' },
    skillSummary: { zh: '把 x 代入函数求 y 值', en: 'Substitute x into function to find y' },
    story: { zh: '发现董卓哨兵！其位置符合 $y = {m}x + {b}$，需在 $x = {x}$ 处拦截。', en: "Dong Zhuo's scouts spotted! Position follows $y = {m}x + {b}$. Intercept at $x = {x}$." },
    description: { zh: '计算拦截点的 $y$ 坐标', en: 'Calculate the $y$ coordinate at the intercept point' },
    data: { m: 2, b: 3, x: 4, generatorType: 'FUNC_VAL_RANDOM' },
    difficulty: 'Medium', reward: 160, kpId: 'kp-2.2-01', sectionId: 'functions',
    tutorialSteps: [],
    secret: { concept: { zh: '函数就像一台机器：输入 $x$，输出 $y$。', en: 'A function is like a machine: input $x$, output $y$.' }, formula: '$y = mx + b$', tips: [{ zh: '张飞提示：代入就是把数字塞进去算！', en: 'Zhang Fei Tip: Substitution means plugging in the number!' }] },
  },
  {
    id: 813, grade: 8, unitId: 1, order: 3,
    unitTitle: { zh: 'Unit 1: 进军篇 · 虎牢关', en: 'Unit 1: The March · Hulao Pass' },
    topic: 'Functions', type: 'LINEAR',
    title: { zh: '合围之势', en: 'Encirclement' },
    skillName: { zh: '合围路线术', en: 'Encirclement Route' },
    skillSummary: { zh: '两点确定直线方程', en: 'Two points determine a line equation' },
    story: { zh: '关羽、张飞分兵合围，路线经过 $({x1},{y1})$ 和 $({x2},{y2})$。', en: 'Guan Yu and Zhang Fei split forces. Route through $({x1},{y1})$ and $({x2},{y2})$.' },
    description: { zh: '求合围路线 $y = mx + c$', en: 'Find the encirclement route $y = mx + c$' },
    data: { points: [[2, 10], [4, 18]], x1: 2, y1: 10, x2: 4, y2: 18, generatorType: 'LINEAR_RANDOM' },
    difficulty: 'Medium', reward: 170, kpId: 'kp-2.5-01', sectionId: 'functions',
    tutorialSteps: [],
    secret: { concept: { zh: '斜率越大，路线越陡。', en: 'Steeper route means larger slope.' }, formula: '$m = \\frac{y_2 - y_1}{x_2 - x_1}$', tips: [{ zh: '关羽提示：斜率就是行军的陡峭程度。', en: 'Guan Yu Tip: Slope is the steepness of the march.' }] },
  },
  {
    id: 814, grade: 8, unitId: 1, order: 4,
    unitTitle: { zh: 'Unit 1: 进军篇 · 虎牢关', en: 'Unit 1: The March · Hulao Pass' },
    topic: 'Functions', type: 'FUNC_VAL',
    title: { zh: '虎牢会合', en: 'Hulao Rendezvous' },
    skillName: { zh: '会合时间术', en: 'Rendezvous Timing' },
    skillSummary: { zh: '函数求值确定会合点', en: 'Evaluate function to find meeting point' },
    story: { zh: '三路大军约定在虎牢关前会合。刘备军位置 $y = {m}x + {b}$，$x = {x}$ 时到达会合点。', en: "Three armies converge at Hulao. Liu Bei's position: $y = {m}x + {b}$, arriving at $x = {x}$." },
    description: { zh: '求会合点 $y$ 坐标', en: 'Find the $y$ coordinate of the rendezvous' },
    data: { m: 3, b: 5, x: 3, generatorType: 'FUNC_VAL_RANDOM' },
    difficulty: 'Hard', reward: 180, kpId: 'kp-2.2-01', sectionId: 'functions',
    tutorialSteps: [],
    secret: { concept: { zh: '多个函数的交点就是"会合点"。', en: 'Where functions meet is the "rendezvous point".' }, formula: '$y = f(x)$', tips: [{ zh: '刘备提示：兄弟齐心，其利断金！', en: 'Liu Bei Tip: United brothers can cut through metal!' }] },
    storyConsequence: { correct: { zh: '三路大军准时会合，虎牢关前旌旗蔽空！', en: 'All three armies converge on time — banners fill the sky at Hulao!' }, wrong: { zh: '会合时间算错，错失战机…', en: 'Timing was off — the opportunity is lost...' } },
  },

  // --- Unit 2: 攻城篇 · 虎牢关攻防 (190 AD) — 平行线角度 + 勾股定理 ---
  {
    id: 821, grade: 8, unitId: 2, order: 1,
    unitTitle: { zh: 'Unit 2: 攻城篇 · 虎牢关攻防', en: 'Unit 2: Siege · Hulao Pass Battle' },
    topic: 'Geometry', type: 'ANGLES',
    title: { zh: '城墙角度', en: 'Wall Angles' },
    skillName: { zh: '平行线截角术', en: 'Parallel Line Angles' },
    skillSummary: { zh: '同位角相等、内错角相等、同旁内角互补', en: 'Corresponding equal, alternate equal, co-interior supplementary' },
    story: { zh: '虎牢关城墙两面平行，攻城梯斜靠上去。已知梯与下墙夹角 ${givenAngle}°$，求与上墙的夹角。', en: 'Hulao walls are parallel. A ladder leans against them. Given angle with lower wall = ${givenAngle}°$, find angle with upper wall.' },
    description: { zh: '求平行线截角 $x$', en: 'Find the angle $x$ between parallel lines' },
    data: { givenAngle: 55, angleType: 'alternate', answer: 55, parallel: true, highlight: 'alternate', angle: 55, generatorType: 'PARALLEL_ANGLES_RANDOM' },
    difficulty: 'Easy', reward: 140, kpId: 'kp-4.6-03', sectionId: 'geometry',
    tutorialSteps: [],
    secret: { concept: { zh: '两条平行线被截线切过，产生同位角(F)、内错角(Z)、同旁内角(C)。', en: 'A transversal cutting parallel lines creates corresponding(F), alternate(Z), co-interior(C) angles.' }, formula: '$\\text{Alternate} = \\text{equal}, \\quad \\text{Co-interior} + \\text{given} = 180°$', tips: [{ zh: '关羽提示：记住 F、Z、C 三个字母形状！', en: 'Guan Yu Tip: Remember the F, Z, C letter shapes!' }] },
  },
  {
    id: 822, grade: 8, unitId: 2, order: 2,
    unitTitle: { zh: 'Unit 2: 攻城篇 · 虎牢关攻防', en: 'Unit 2: Siege · Hulao Pass Battle' },
    topic: 'Geometry', type: 'ANGLES',
    title: { zh: '箭塔射角', en: 'Arrow Tower Angle' },
    skillName: { zh: '同位角判定术', en: 'Corresponding Angle Rule' },
    skillSummary: { zh: '同位角相等（F字形）', en: 'Corresponding angles are equal (F-shape)' },
    story: { zh: '两排箭塔平行布置，弓箭手需要计算射击角度。已知一处射角 ${givenAngle}°$。', en: 'Two rows of arrow towers in parallel. Given one firing angle = ${givenAngle}°$.' },
    description: { zh: '求同位角 $x$', en: 'Find the corresponding angle $x$' },
    data: { givenAngle: 65, angleType: 'corresponding', answer: 65, parallel: true, highlight: 'corresponding', angle: 65, generatorType: 'PARALLEL_ANGLES_RANDOM' },
    difficulty: 'Medium', reward: 160, kpId: 'kp-4.6-03', sectionId: 'geometry',
    tutorialSteps: [],
    secret: { concept: { zh: '同位角在截线同侧、平行线同方向，一定相等。', en: 'Corresponding angles: same side of transversal, same direction — always equal.' }, formula: '$\\text{Corresponding angles are equal}$', tips: [{ zh: '关羽提示：F字形一看就知道是同位角！', en: 'Guan Yu Tip: F-shape = corresponding angles!' }] },
  },
  {
    id: 823, grade: 8, unitId: 2, order: 3,
    unitTitle: { zh: 'Unit 2: 攻城篇 · 虎牢关攻防', en: 'Unit 2: Siege · Hulao Pass Battle' },
    topic: 'Geometry', type: 'PYTHAGORAS',
    title: { zh: '攻城梯', en: 'Siege Ladder' },
    skillName: { zh: '勾股定理', en: "Pythagoras' Theorem" },
    skillSummary: { zh: '$a^2 + b^2 = c^2$，知二求一', en: '$a^2 + b^2 = c^2$, find the unknown' },
    story: { zh: '城墙高 {a} 丈，梯子底端距墙 {b} 丈。梯子至少要多长才能搭到城墙顶？', en: 'Wall height {a}, ladder base {b} from wall. How long must the ladder be to reach the top?' },
    description: { zh: '求梯子长度（斜边 $c$）', en: 'Find the ladder length (hypotenuse $c$)' },
    data: { a: 3, b: 4, generatorType: 'PYTHAGORAS_RANDOM' },
    difficulty: 'Medium', reward: 180, kpId: 'kp-6.1-01', sectionId: 'geometry',
    tutorialSteps: [],
    secret: { concept: { zh: '直角三角形中，斜边的平方等于两条直角边的平方之和。', en: 'In a right triangle, hypotenuse² = sum of the other two sides².' }, formula: '$c = \\sqrt{a^2 + b^2}$', tips: [{ zh: '关羽提示：攻城梯太短搭不上去，太长又会倒！', en: 'Guan Yu Tip: Ladder too short won\'t reach; too long will topple!' }] },
    storyConsequence: { correct: { zh: '攻城梯长度刚好！士兵成功攀上城头！', en: 'Ladder length is perfect! Soldiers scale the wall!' }, wrong: { zh: '梯子长度不对，攻城失败…', en: 'Wrong ladder length — siege fails...' } },
  },
  {
    id: 824, grade: 8, unitId: 2, order: 4,
    unitTitle: { zh: 'Unit 2: 攻城篇 · 虎牢关攻防', en: 'Unit 2: Siege · Hulao Pass Battle' },
    topic: 'Geometry', type: 'PYTHAGORAS',
    title: { zh: '吊桥长度', en: 'Drawbridge Length' },
    skillName: { zh: '斜边计算术', en: 'Hypotenuse Calculation' },
    skillSummary: { zh: '已知两直角边求斜边', en: 'Find hypotenuse from two legs' },
    story: { zh: '虎牢关吊桥横跨护城河。河宽 {a} 丈，桥从高 {b} 丈处放下。', en: 'Hulao drawbridge spans the moat. River width {a}, bridge drops from height {b}.' },
    description: { zh: '求吊桥最短长度', en: 'Find the minimum drawbridge length' },
    data: { a: 5, b: 12, generatorType: 'PYTHAGORAS_RANDOM' },
    difficulty: 'Hard', reward: 200, kpId: 'kp-6.1-01', sectionId: 'geometry',
    tutorialSteps: [],
    secret: { concept: { zh: '勾股定理适用于所有直角三角形，不只是 3-4-5。', en: "Pythagoras' theorem works for ALL right triangles, not just 3-4-5." }, formula: '$c = \\sqrt{a^2 + b^2}$', tips: [{ zh: '吕布提示：本将军的吊桥，岂是等闲之辈能过！', en: "Lu Bu Tip: My drawbridge is not for the faint-hearted!" }] },
    storyConsequence: { correct: { zh: '吊桥放下，联军攻入虎牢关！三英战吕布大获全胜！', en: 'Drawbridge lowered — coalition storms Hulao Pass! Three heroes triumph over Lu Bu!' }, wrong: { zh: '吊桥长度不对，无法跨越护城河…', en: 'Wrong bridge length — cannot cross the moat...' } },
  },

  // --- Unit 3: 营地篇 · 官渡之战前奏 (199 AD) — 面积/圆/体积 ---
  {
    id: 831, grade: 8, unitId: 3, order: 1,
    unitTitle: { zh: 'Unit 3: 营地篇 · 官渡之战前奏', en: 'Unit 3: Camp · Prelude to Guandu' },
    topic: 'Geometry', type: 'AREA',
    title: { zh: '安营扎寨', en: 'Setting Camp' },
    skillName: { zh: '矩形面积术', en: 'Rectangle Area' },
    skillSummary: { zh: '面积 = 长 × 宽', en: 'Area = length × width' },
    story: { zh: '曹操在官渡安营，需要一个长 {length} 丈、宽 {width} 丈的矩形营地。', en: 'Cao Cao camps at Guandu. Needs a rectangular camp: length {length}, width {width}.' },
    description: { zh: '计算营地面积', en: 'Calculate the camp area' },
    data: { length: 20, width: 15, generatorType: 'AREA_RECT_RANDOM' },
    difficulty: 'Easy', reward: 100, kpId: 'kp-5.2-01', sectionId: 'geometry',
    tutorialSteps: [],
    secret: { concept: { zh: '矩形面积 = 长 × 宽，单位是"平方"。', en: 'Rectangle area = length × width, in "square" units.' }, formula: '$A = l \\times w$', tips: [{ zh: '曹操提示：营地规划是战争的基础。', en: 'Cao Cao Tip: Camp planning is the foundation of war.' }] },
  },
  {
    id: 832, grade: 8, unitId: 3, order: 2,
    unitTitle: { zh: 'Unit 3: 营地篇 · 官渡之战前奏', en: 'Unit 3: Camp · Prelude to Guandu' },
    topic: 'Geometry', type: 'AREA',
    title: { zh: '点将台', en: 'Command Platform' },
    skillName: { zh: '梯形面积术', en: 'Trapezoid Area' },
    skillSummary: { zh: '梯形面积 = (上底+下底)×高÷2', en: 'Trapezoid area = (a+b)×h÷2' },
    story: { zh: '袁绍修筑梯形点将台，上底 {a} 丈，下底 {b} 丈，高 {h} 丈。', en: 'Yuan Shao builds a trapezoidal platform. Top {a}, bottom {b}, height {h}.' },
    description: { zh: '计算梯形面积', en: 'Calculate the trapezoid area' },
    data: { a: 10, b: 20, h: 8, generatorType: 'AREA_TRAP_RANDOM' },
    difficulty: 'Medium', reward: 140, kpId: 'kp-5.2-01', sectionId: 'geometry',
    tutorialSteps: [],
    secret: { concept: { zh: '梯形可以看成"两个三角形"或"一个平行四边形的一半"。', en: 'A trapezoid can be seen as two triangles or half a parallelogram.' }, formula: '$A = \\frac{(a+b) \\times h}{2}$', tips: [{ zh: '袁绍提示：点将台要宏伟壮观！', en: 'Yuan Shao Tip: The platform must be magnificent!' }] },
  },
  {
    id: 833, grade: 8, unitId: 3, order: 3,
    unitTitle: { zh: 'Unit 3: 营地篇 · 官渡之战前奏', en: 'Unit 3: Camp · Prelude to Guandu' },
    topic: 'Geometry', type: 'CIRCLE',
    title: { zh: '圆形瞭望塔', en: 'Circular Watchtower' },
    skillName: { zh: '圆的周长与面积', en: 'Circle Circumference & Area' },
    skillSummary: { zh: '$C = 2\\pi r$，$A = \\pi r^2$', en: '$C = 2\\pi r$, $A = \\pi r^2$' },
    story: { zh: '曹操建造圆形瞭望塔，塔基半径 {r} 丈。', en: 'Cao Cao builds a circular watchtower, base radius {r}.' },
    description: { zh: '计算塔基的周长或面积', en: 'Calculate the circumference or area of the tower base' },
    data: { r: 5, pi: 3.14, mode: 'area', generatorType: 'CIRCLE_Y8_RANDOM' },
    difficulty: 'Medium', reward: 170, kpId: 'kp-5.3-01', sectionId: 'geometry',
    tutorialSteps: [],
    secret: { concept: { zh: '$\\pi$ 是周长与直径的比值，约 3.14。圆越大，$\\pi$ 不变。', en: '$\\pi$ is the ratio of circumference to diameter, ≈3.14. Same for all circles.' }, formula: '$C = 2\\pi r, \\quad A = \\pi r^2$', tips: [{ zh: '曹操提示：圆形结构最稳固！', en: 'Cao Cao Tip: Circular structures are the most stable!' }] },
  },
  {
    id: 834, grade: 8, unitId: 3, order: 4,
    unitTitle: { zh: 'Unit 3: 营地篇 · 官渡之战前奏', en: 'Unit 3: Camp · Prelude to Guandu' },
    topic: 'Geometry', type: 'CIRCLE',
    title: { zh: '围栏长度', en: 'Fence Length' },
    skillName: { zh: '圆周长计算', en: 'Circumference Calculation' },
    skillSummary: { zh: '周长 $C = 2\\pi r$', en: 'Circumference $C = 2\\pi r$' },
    story: { zh: '给圆形马厩围一圈栅栏，半径 {r} 丈。需要多长的木材？', en: 'Fencing a circular stable with radius {r}. How much wood needed?' },
    description: { zh: '计算圆形围栏长度', en: 'Calculate the circular fence length' },
    data: { r: 7, pi: 3.14, mode: 'circumference', generatorType: 'CIRCLE_Y8_RANDOM' },
    difficulty: 'Medium', reward: 175, kpId: 'kp-5.3-01', sectionId: 'geometry',
    tutorialSteps: [],
    secret: { concept: { zh: '周长 = 绕一圈的总长度。直径 × $\\pi$ 就是周长。', en: 'Circumference = distance around once. Diameter × $\\pi$ = circumference.' }, formula: '$C = 2\\pi r = \\pi d$', tips: [{ zh: '曹操提示：围栏不够长，马就跑了！', en: 'Cao Cao Tip: Not enough fence and the horses escape!' }] },
  },
  {
    id: 835, grade: 8, unitId: 3, order: 5,
    unitTitle: { zh: 'Unit 3: 营地篇 · 官渡之战前奏', en: 'Unit 3: Camp · Prelude to Guandu' },
    topic: 'Geometry', type: 'VOLUME',
    title: { zh: '修筑粮仓', en: 'Building Granaries' },
    skillName: { zh: '圆柱体积术', en: 'Cylinder Volume' },
    skillSummary: { zh: '$V = \\pi r^2 h$（底面积 × 高）', en: '$V = \\pi r^2 h$ (base area × height)' },
    story: { zh: '官渡大营需建圆柱形粮仓。底面半径 {radius} 丈，高 {height} 丈。', en: 'Guandu camp needs a cylindrical granary. Radius {radius}, height {height}.' },
    description: { zh: '计算粮仓体积', en: 'Calculate the granary volume' },
    data: { radius: 5, height: 10, pi: 3.14, generatorType: 'VOLUME_Y8_RANDOM' },
    difficulty: 'Hard', reward: 200, kpId: 'kp-5.4-01', sectionId: 'geometry',
    tutorialSteps: [],
    secret: { concept: { zh: '圆柱体积 = 圆面积 × 高。先算底面积 $\\pi r^2$，再乘高。', en: 'Cylinder volume = circle area × height. First $\\pi r^2$, then × height.' }, formula: '$V = \\pi r^2 h$', tips: [{ zh: '曹操提示：粮草先行，兵马后动！', en: 'Cao Cao Tip: Supplies first, troops follow!' }] },
    storyConsequence: { correct: { zh: '粮仓建成，官渡大军有了充足补给！', en: 'Granary built — Guandu army is well supplied!' }, wrong: { zh: '粮仓容量算错，存粮不足…', en: 'Volume miscalculated — not enough storage...' } },
  },

  // --- Unit 4: 治理篇 · 官渡胜后治理 (200 AD) — 百分比/利息 ---
  {
    id: 841, grade: 8, unitId: 4, order: 1,
    unitTitle: { zh: 'Unit 4: 治理篇 · 官渡胜后', en: 'Unit 4: Governance · Post-Guandu' },
    topic: 'Algebra', type: 'PERCENTAGE',
    title: { zh: '征收粮税', en: 'Collecting Grain Tax' },
    skillName: { zh: '百分比增减术', en: 'Percentage Increase/Decrease' },
    skillSummary: { zh: '增后 = 原值 × (1 + 百分比)', en: 'After increase = original × (1 + rate)' },
    story: { zh: '官渡大胜后，曹操推行屯田。产粮 {initial} 斛，加征 {pct}%。', en: 'After Guandu victory, Cao Cao implements tuntian. Yield {initial}, add {pct}% tax.' },
    description: { zh: '计算总产出', en: 'Calculate total output' },
    data: { initial: 1000, pct: 40, rate: 0.4, years: 1, generatorType: 'PERCENTAGE_RANDOM' },
    difficulty: 'Easy', reward: 150, kpId: 'kp-1.13-01', sectionId: 'number',
    tutorialSteps: [],
    secret: { concept: { zh: '"百分之"就是"每一百份中"。$40\\% = \\frac{40}{100} = 0.4$', en: '"Percent" means "per hundred". $40\\% = \\frac{40}{100} = 0.4$' }, formula: '$\\text{Total} = P \\times (1 + r)$', tips: [{ zh: '荀彧提示：屯田之策，乃强兵之本。', en: 'Xun Yu Tip: The tuntian policy is the foundation of a strong army.' }] },
  },
  {
    id: 842, grade: 8, unitId: 4, order: 2,
    unitTitle: { zh: 'Unit 4: 治理篇 · 官渡胜后', en: 'Unit 4: Governance · Post-Guandu' },
    topic: 'Algebra', type: 'PERCENTAGE',
    title: { zh: '军备折扣', en: 'Armament Discount' },
    skillName: { zh: '折扣计算术', en: 'Discount Calculation' },
    skillSummary: { zh: '折后 = 原价 × (1 - 折扣率)', en: 'Discounted = original × (1 - rate)' },
    story: { zh: '批量购买精铁，原价 {initial} 金，折扣 {pct}%。', en: 'Bulk iron purchase. Original {initial} gold, {pct}% discount.' },
    description: { zh: '计算折后价', en: 'Calculate the discounted price' },
    data: { initial: 5000, pct: 15, rate: -0.15, years: 1, generatorType: 'PERCENTAGE_RANDOM' },
    difficulty: 'Medium', reward: 180, kpId: 'kp-1.13-01', sectionId: 'number',
    tutorialSteps: [],
    secret: { concept: { zh: '折扣是"减少"的百分比。打八五折 = 减15% = × 0.85。', en: 'Discount is the percentage "off". 15% off = ×0.85.' }, formula: '$\\text{Sale price} = P \\times (1 - r)$', tips: [{ zh: '曹操提示：精打细算，方能持久作战。', en: 'Cao Cao Tip: Careful budgeting supports prolonged campaigns.' }] },
  },
  {
    id: 843, grade: 8, unitId: 4, order: 3,
    unitTitle: { zh: 'Unit 4: 治理篇 · 官渡胜后', en: 'Unit 4: Governance · Post-Guandu' },
    topic: 'Algebra', type: 'PERCENTAGE',
    title: { zh: '军费放贷', en: 'Military Lending' },
    skillName: { zh: '单利复利术', en: 'Simple & Compound Interest' },
    skillSummary: { zh: '单利 P(1+rt)，复利 P(1+r)^t', en: 'Simple: P(1+rt), Compound: P(1+r)^t' },
    story: { zh: '曹操借出军费 {principal} 两，年利率 {rate}%，{years} 年后收回。', en: 'Cao Cao lends {principal} liang at {rate}% per year for {years} years.' },
    description: { zh: '计算最终金额', en: 'Calculate the final amount' },
    data: { principal: 1000, rate: 10, rateDecimal: 0.1, years: 2, mode: 'compound', generatorType: 'PERCENTAGE_INTEREST_RANDOM' },
    difficulty: 'Hard', reward: 220, kpId: 'kp-1.13-01', sectionId: 'number',
    tutorialSteps: [],
    secret: { concept: { zh: '单利：利息只按本金算。复利：利息也算利息（利滚利）！', en: 'Simple: interest on principal only. Compound: interest on interest (snowball)!' }, formula: '$A = P(1+r)^t$', tips: [{ zh: '荀彧提示：复利的威力是时间的魔法！', en: 'Xun Yu Tip: The power of compound interest is time\'s magic!' }] },
    storyConsequence: { correct: { zh: '账目清晰，军费充足！', en: 'Accounts clear, funds sufficient!' }, wrong: { zh: '利息算错，财务混乱…', en: 'Interest wrong — finances in chaos...' } },
  },

  // --- Unit 5: 情报篇 · 官渡谍报 (200 AD) — 统计/概率 ---
  {
    id: 851, grade: 8, unitId: 5, order: 1,
    unitTitle: { zh: 'Unit 5: 情报篇 · 官渡谍报', en: 'Unit 5: Intelligence · Guandu Espionage' },
    topic: 'Statistics', type: 'STATISTICS',
    title: { zh: '敌军平均兵力', en: 'Enemy Average Strength' },
    skillName: { zh: '平均数统计术', en: 'Mean Calculation' },
    skillSummary: { zh: '平均值 = 总和 ÷ 个数', en: 'Mean = sum ÷ count' },
    story: { zh: '探子回报袁绍各营兵力，曹操需要算出平均每营多少人。', en: 'Scouts report Yuan Shao\'s camp sizes. Cao Cao needs the average.' },
    description: { zh: '计算平均兵力', en: 'Calculate the mean troop count' },
    data: { values: [200, 250, 300, 350, 400], mode: 'mean', generatorType: 'STATISTICS_MEAN_RANDOM' },
    difficulty: 'Easy', reward: 150, kpId: 'kp-9.3-01', sectionId: 'statistics',
    tutorialSteps: [],
    secret: { concept: { zh: '平均数 = 把所有数加起来，再平均分。', en: 'Mean = add all values, then share equally.' }, formula: '$\\bar{x} = \\frac{\\sum x}{n}$', tips: [{ zh: '曹操提示：知己知彼，百战不殆。', en: 'Cao Cao Tip: Know your enemy and yourself, win every battle.' }] },
  },
  {
    id: 852, grade: 8, unitId: 5, order: 2,
    unitTitle: { zh: 'Unit 5: 情报篇 · 官渡谍报', en: 'Unit 5: Intelligence · Guandu Espionage' },
    topic: 'Statistics', type: 'STATISTICS',
    title: { zh: '中位情报', en: 'Median Intelligence' },
    skillName: { zh: '中位数分析术', en: 'Median Analysis' },
    skillSummary: { zh: '排序后找中间值', en: 'Sort then find the middle value' },
    story: { zh: '情报部门收集了各路军粮数据，需找出"中间水平"。', en: 'Intelligence has collected supply data from all routes. Find the "middle level".' },
    description: { zh: '计算中位数', en: 'Calculate the median' },
    data: { values: [120, 150, 180, 200, 250], mode: 'median', generatorType: 'STATISTICS_MEDIAN_RANDOM' },
    difficulty: 'Medium', reward: 170, kpId: 'kp-9.3-01', sectionId: 'statistics',
    tutorialSteps: [],
    secret: { concept: { zh: '中位数不受极端值影响，比平均数更"稳定"。', en: 'Median is not affected by outliers — more "stable" than mean.' }, formula: '$\\text{Median} = \\text{middle value after sorting}$', tips: [{ zh: '荀彧提示：极端数据会骗人，中位数更可靠！', en: 'Xun Yu Tip: Extreme data deceives — median is more reliable!' }] },
  },
  {
    id: 853, grade: 8, unitId: 5, order: 3,
    unitTitle: { zh: 'Unit 5: 情报篇 · 官渡谍报', en: 'Unit 5: Intelligence · Guandu Espionage' },
    topic: 'Statistics', type: 'PROBABILITY',
    title: { zh: '奇袭概率', en: 'Raid Probability' },
    skillName: { zh: '概率基础术', en: 'Basic Probability' },
    skillSummary: { zh: '概率 = 目标数 ÷ 总数', en: 'Probability = target ÷ total' },
    story: { zh: '袁绍有 {total} 个粮仓，其中 {target} 个防守薄弱。随机选一个袭击。', en: 'Yuan Shao has {total} granaries, {target} are poorly guarded. Pick one to raid.' },
    description: { zh: '成功概率 P = ?', en: 'Probability of success P = ?' },
    data: { target: 3, total: 10, generatorType: 'PROBABILITY_SIMPLE_RANDOM' },
    difficulty: 'Medium', reward: 180, kpId: 'kp-8.1-01', sectionId: 'statistics',
    tutorialSteps: [],
    secret: { concept: { zh: '概率在 0 到 1 之间。0 = 不可能，1 = 一定发生。', en: 'Probability is between 0 and 1. 0 = impossible, 1 = certain.' }, formula: '$P = \\frac{\\text{favourable}}{\\text{total}}$', tips: [{ zh: '曹操提示：概率越大，胜算越高！', en: 'Cao Cao Tip: Higher probability = better odds!' }] },
    storyConsequence: { correct: { zh: '许攸献计，火烧乌巢！概率算对了！', en: 'Xu You\'s plan — burn Wuchao! Probability was right!' }, wrong: { zh: '概率算错，奇袭失败…', en: 'Wrong probability — the raid fails...' } },
  },
  {
    id: 854, grade: 8, unitId: 5, order: 4,
    unitTitle: { zh: 'Unit 5: 情报篇 · 官渡谍报', en: 'Unit 5: Intelligence · Guandu Espionage' },
    topic: 'Statistics', type: 'PROBABILITY',
    title: { zh: '双重情报', en: 'Double Intelligence' },
    skillName: { zh: '独立事件概率', en: 'Independent Event Probability' },
    skillSummary: { zh: '$P(A \\cap B) = P(A) \\times P(B)$', en: '$P(A \\cap B) = P(A) \\times P(B)$' },
    story: { zh: '两名探子同时出动。第一人成功概率 {p1}，第二人 {p2}。两人都成功的概率？', en: 'Two spies deployed. First succeeds with P={p1}, second P={p2}. Both succeed?' },
    description: { zh: '计算两人都成功的概率', en: 'Calculate probability that both succeed' },
    data: { p1: 0.5, p2: 0.5, generatorType: 'PROBABILITY_IND_RANDOM' },
    difficulty: 'Hard', reward: 200, kpId: 'kp-8.1-01', sectionId: 'statistics',
    tutorialSteps: [],
    secret: { concept: { zh: '独立事件：一件事的结果不影响另一件。两个独立事件同时发生 = 各自概率相乘。', en: 'Independent events: one outcome doesn\'t affect the other. Both happening = multiply probabilities.' }, formula: '$P(A \\text{ and } B) = P(A) \\times P(B)$', tips: [{ zh: '曹操提示：多线情报，成功率靠概率！', en: 'Cao Cao Tip: Multiple intel lines — success relies on probability!' }] },
    storyConsequence: { correct: { zh: '双线情报汇合，官渡之战曹操以少胜多！', en: 'Both intelligence lines converge — Cao Cao wins Guandu despite being outnumbered!' }, wrong: { zh: '情报概率估算失误，行动暴露…', en: 'Probability miscalculated — operation compromised...' } },
  },

  // --- Unit 6: 代数篇 · 隆中对前奏 (205 AD) — 展开/因式分解/不等式 ---
  {
    id: 861, grade: 8, unitId: 6, order: 1,
    unitTitle: { zh: 'Unit 6: 代数篇 · 隆中对前奏', en: 'Unit 6: Algebra · Prelude to Longzhong' },
    topic: 'Algebra', type: 'EXPAND',
    title: { zh: '兵力展开', en: 'Force Deployment' },
    skillName: { zh: '展开括号术', en: 'Expanding Brackets' },
    skillSummary: { zh: '$a(bx+c) = abx + ac$', en: '$a(bx+c) = abx + ac$' },
    story: { zh: '诸葛亮初出茅庐，为刘备计算兵力展开部署。', en: 'Zhuge Liang emerges to help Liu Bei calculate troop deployment.' },
    description: { zh: '展开括号，求 $x$ 的系数', en: 'Expand brackets, find the coefficient of $x$' },
    data: { a: 3, b: 2, c: 4, ab: 6, ac: 12, answer: 6, generatorType: 'EXPAND_RANDOM' },
    difficulty: 'Easy', reward: 150, kpId: 'kp-2.2-03', sectionId: 'algebra',
    tutorialSteps: [],
    secret: { concept: { zh: '展开就是"分配"——外面的数要分给括号里的每一项。', en: 'Expanding = "distributing" — the outside number is given to each term inside.' }, formula: '$a(b + c) = ab + ac$', tips: [{ zh: '诸葛亮提示：分配律是代数的基石！', en: 'Zhuge Liang Tip: Distributive law is the cornerstone of algebra!' }] },
  },
  {
    id: 862, grade: 8, unitId: 6, order: 2,
    unitTitle: { zh: 'Unit 6: 代数篇 · 隆中对前奏', en: 'Unit 6: Algebra · Prelude to Longzhong' },
    topic: 'Algebra', type: 'EXPAND',
    title: { zh: '粮草分配', en: 'Supply Distribution' },
    skillName: { zh: '分配律运用', en: 'Distributive Law' },
    skillSummary: { zh: '用分配律展开表达式', en: 'Use distributive law to expand' },
    story: { zh: '刘备有 {a} 支部队，每支需 ${b}x + {c}$ 份粮草。总共需要多少？', en: 'Liu Bei has {a} units, each needs ${b}x + {c}$ rations. How many total?' },
    description: { zh: '展开 ${a}({b}x + {c})$', en: 'Expand ${a}({b}x + {c})$' },
    data: { a: 4, b: 3, c: 5, ab: 12, ac: 20, answer: 12, generatorType: 'EXPAND_RANDOM' },
    difficulty: 'Medium', reward: 170, kpId: 'kp-2.2-03', sectionId: 'algebra',
    tutorialSteps: [],
    secret: { concept: { zh: '展开后检查：代入一个数，左右两边应该相等。', en: 'After expanding, check: substitute a number, both sides should match.' }, formula: '$a(bx+c) = abx + ac$', tips: [{ zh: '诸葛亮提示：代入 $x=1$ 是最快的验算方法。', en: 'Zhuge Liang Tip: Substituting $x=1$ is the fastest way to verify.' }] },
  },
  {
    id: 863, grade: 8, unitId: 6, order: 3,
    unitTitle: { zh: 'Unit 6: 代数篇 · 隆中对前奏', en: 'Unit 6: Algebra · Prelude to Longzhong' },
    topic: 'Algebra', type: 'FACTORISE',
    title: { zh: '情报归纳', en: 'Intelligence Summary' },
    skillName: { zh: '因式分解术', en: 'Factorising' },
    skillSummary: { zh: '找公因子，提取到括号外', en: 'Find common factor, extract outside brackets' },
    story: { zh: '诸葛亮归纳刘备各路情报，发现数据有公因子。', en: 'Zhuge Liang summarises Liu Bei\'s intelligence — data shares a common factor.' },
    description: { zh: '因式分解，找最大公因数', en: 'Factorise — find the HCF' },
    data: { factor: 3, p: 2, q: 5, a: 6, b: 15, answer: 3, generatorType: 'FACTORISE_RANDOM' },
    difficulty: 'Medium', reward: 180, kpId: 'kp-2.2-05', sectionId: 'algebra',
    tutorialSteps: [],
    secret: { concept: { zh: '因式分解是展开的反操作：$ab + ac = a(b+c)$', en: 'Factorising reverses expanding: $ab + ac = a(b+c)$' }, formula: '$ab + ac = a(b+c)$', tips: [{ zh: '诸葛亮提示：归纳就是找出共同规律！', en: 'Zhuge Liang Tip: Summarising means finding the common pattern!' }] },
  },
  {
    id: 864, grade: 8, unitId: 6, order: 4,
    unitTitle: { zh: 'Unit 6: 代数篇 · 隆中对前奏', en: 'Unit 6: Algebra · Prelude to Longzhong' },
    topic: 'Algebra', type: 'FACTORISE',
    title: { zh: '军令简化', en: 'Simplify Orders' },
    skillName: { zh: '提公因子术', en: 'Extracting Common Factor' },
    skillSummary: { zh: '先找 HCF，再除', en: 'Find HCF first, then divide' },
    story: { zh: '刘备军令太冗长，诸葛亮帮忙"因式分解"简化。', en: 'Liu Bei\'s orders are too verbose. Zhuge Liang "factorises" to simplify.' },
    description: { zh: '提取公因子', en: 'Extract the common factor' },
    data: { factor: 5, p: 3, q: 7, a: 15, b: 35, answer: 5, generatorType: 'FACTORISE_RANDOM' },
    difficulty: 'Hard', reward: 200, kpId: 'kp-2.2-05', sectionId: 'algebra',
    tutorialSteps: [],
    secret: { concept: { zh: '因式分解让表达式更简洁——就像军令要精炼。', en: 'Factorising makes expressions concise — like military orders must be brief.' }, formula: '$ab + ac = a(b+c)$', tips: [{ zh: '刘备提示：军令如山，越简越好！', en: 'Liu Bei Tip: Orders like mountains — the simpler the better!' }] },
    storyConsequence: { correct: { zh: '军令精简到位，三军令行禁止！', en: 'Orders simplified perfectly — troops execute flawlessly!' }, wrong: { zh: '军令冗长混乱，士兵不知所措…', en: 'Orders too verbose — soldiers are confused...' } },
  },
  {
    id: 865, grade: 8, unitId: 6, order: 5,
    unitTitle: { zh: 'Unit 6: 代数篇 · 隆中对前奏', en: 'Unit 6: Algebra · Prelude to Longzhong' },
    topic: 'Algebra', type: 'INEQUALITY',
    title: { zh: '兵力限制', en: 'Troop Limit' },
    skillName: { zh: '不等式求解术', en: 'Solving Inequalities' },
    skillSummary: { zh: '像解方程一样，但注意不等号方向', en: 'Solve like an equation, but watch the inequality sign' },
    story: { zh: '刘备能动用的兵力有上限。诸葛亮用不等式计算安全范围。', en: 'Liu Bei\'s troops have a cap. Zhuge Liang uses inequalities to find the safe range.' },
    description: { zh: '解不等式，求临界值', en: 'Solve the inequality, find the critical value' },
    data: { a: 3, b: 2, c: 14, op: '<', answer: 4, generatorType: 'INEQUALITY_RANDOM' },
    difficulty: 'Hard', reward: 210, kpId: 'kp-2.6-01', sectionId: 'algebra',
    tutorialSteps: [],
    secret: { concept: { zh: '不等式给出范围而非单一答案。$x < 4$ 意思是 $x$ 可以是 3, 2, 1...', en: 'Inequalities give a range, not one answer. $x < 4$ means $x$ can be 3, 2, 1...' }, formula: '$ax + b < c \\Rightarrow x < \\frac{c-b}{a}$', tips: [{ zh: '诸葛亮提示：不等号像城门——有最大限度！', en: 'Zhuge Liang Tip: Inequality is like a gate — there\'s a maximum!' }] },
    storyConsequence: { correct: { zh: '兵力安排在安全范围内，诸葛亮点头赞许！', en: 'Troops within safe limits — Zhuge Liang nods approvingly!' }, wrong: { zh: '超出兵力上限，后勤跟不上…', en: 'Exceeded troop limit — logistics can\'t keep up...' } },
  },
  {
    id: 866, grade: 8, unitId: 6, order: 6,
    unitTitle: { zh: 'Unit 6: 代数篇 · 隆中对前奏', en: 'Unit 6: Algebra · Prelude to Longzhong' },
    topic: 'Algebra', type: 'INEQUALITY',
    title: { zh: '粮草底线', en: 'Supply Floor' },
    skillName: { zh: '反向不等式', en: 'Reverse Inequality' },
    skillSummary: { zh: '不等号方向 > 的解法', en: 'Solving with > direction' },
    story: { zh: '最少需要多少粮草才能支撑战役？诸葛亮用"大于"不等式算底线。', en: 'Minimum supplies for the campaign? Zhuge Liang uses "greater than" inequality.' },
    description: { zh: '解不等式', en: 'Solve the inequality' },
    data: { a: 2, b: 5, c: 15, op: '>', answer: 5, generatorType: 'INEQUALITY_RANDOM' },
    difficulty: 'Hard', reward: 200, kpId: 'kp-2.6-01', sectionId: 'algebra',
    tutorialSteps: [],
    secret: { concept: { zh: '$x > 5$ 是"至少要 5 以上"——是底线，不是上限。', en: '$x > 5$ means "at least above 5" — a floor, not a ceiling.' }, formula: '$ax + b > c \\Rightarrow x > \\frac{c-b}{a}$', tips: [{ zh: '诸葛亮提示：底线不可突破，否则全军崩溃！', en: 'Zhuge Liang Tip: The floor must hold — otherwise the army collapses!' }] },
    storyConsequence: { correct: { zh: '粮草充足，隆中对的三分天下之计初见端倪！', en: 'Supplies secured — Longzhong Plan for dividing the realm takes shape!' }, wrong: { zh: '粮草不足，计划推迟…', en: 'Insufficient supplies — the plan is delayed...' } },
  },

  // --- Unit 7: 图表篇 · 天下形势图 (207 AD) — 速度/标准式 ---
  {
    id: 871, grade: 8, unitId: 7, order: 1,
    unitTitle: { zh: 'Unit 7: 图表篇 · 天下形势图', en: 'Unit 7: Charts · Map of the Realm' },
    topic: 'Algebra', type: 'SIMPLE_EQ',
    title: { zh: '急行军速度', en: 'March Speed' },
    skillName: { zh: '速度公式术', en: 'Speed Formula' },
    skillSummary: { zh: '速度=距离÷时间', en: 'Speed = Distance ÷ Time' },
    story: { zh: '诸葛亮分析各路军队行军速度，规划天下形势。', en: 'Zhuge Liang analyses march speeds to plan the realm\'s future.' },
    description: { zh: '计算行军速度/距离/时间', en: 'Calculate speed/distance/time' },
    data: { speed: 10, distance: 60, time: 6, mode: 'speed', answer: 10, x: 10, generatorType: 'SPEED_RANDOM' },
    difficulty: 'Easy', reward: 140, kpId: 'kp-1.12-01', sectionId: 'number',
    tutorialSteps: [],
    secret: { concept: { zh: '速度、距离、时间三者互相关联。知道两个就能算第三个。', en: 'Speed, distance, time are linked. Know any two, find the third.' }, formula: '$S = \\frac{D}{T}, \\quad D = S \\times T, \\quad T = \\frac{D}{S}$', tips: [{ zh: '诸葛亮提示：兵贵神速，速度决定战局！', en: 'Zhuge Liang Tip: Speed is everything in war!' }] },
  },
  {
    id: 872, grade: 8, unitId: 7, order: 2,
    unitTitle: { zh: 'Unit 7: 图表篇 · 天下形势图', en: 'Unit 7: Charts · Map of the Realm' },
    topic: 'Algebra', type: 'SIMPLE_EQ',
    title: { zh: '追击距离', en: 'Pursuit Distance' },
    skillName: { zh: '距离计算术', en: 'Distance Calculation' },
    skillSummary: { zh: '距离 = 速度 × 时间', en: 'Distance = Speed × Time' },
    story: { zh: '赵云追击敌军，速度 {speed} 里/时，追了 {time} 小时。', en: 'Zhao Yun pursues the enemy at {speed} li/hr for {time} hours.' },
    description: { zh: '计算追击距离', en: 'Calculate the pursuit distance' },
    data: { speed: 15, distance: 75, time: 5, mode: 'distance', answer: 75, x: 75, generatorType: 'SPEED_RANDOM' },
    difficulty: 'Medium', reward: 160, kpId: 'kp-1.12-01', sectionId: 'number',
    tutorialSteps: [],
    secret: { concept: { zh: '距离 = 速度 × 时间，单位要统一！', en: 'Distance = Speed × Time. Keep units consistent!' }, formula: '$D = S \\times T$', tips: [{ zh: '赵云提示：一骑当千，速度就是力量！', en: 'Zhao Yun Tip: One rider worth a thousand — speed is power!' }] },
  },
  {
    id: 873, grade: 8, unitId: 7, order: 3,
    unitTitle: { zh: 'Unit 7: 图表篇 · 天下形势图', en: 'Unit 7: Charts · Map of the Realm' },
    topic: 'Algebra', type: 'STD_FORM',
    title: { zh: '天下兵力', en: 'Realm Forces' },
    skillName: { zh: '标准式术', en: 'Standard Form' },
    skillSummary: { zh: '$a \\times 10^n$（$1 \\leq a < 10$）', en: '$a \\times 10^n$ ($1 \\leq a < 10$)' },
    story: { zh: '诸葛亮在隆中对中分析天下总兵力，数字太大需要简化。', en: 'In the Longzhong Plan, Zhuge Liang analyses total realm forces — numbers too large.' },
    description: { zh: '写成标准式', en: 'Write in standard form' },
    data: { number: 500000, a: 5, n: 5, generatorType: 'STD_FORM_RANDOM' },
    difficulty: 'Medium', reward: 180, kpId: 'kp-1.8-01', sectionId: 'number',
    tutorialSteps: [],
    secret: { concept: { zh: '标准式让大数字变得简洁易比较。$1 \\leq a < 10$，$n$ 是整数。', en: 'Standard form makes big numbers concise and comparable. $1 \\leq a < 10$, $n$ is integer.' }, formula: '$a \\times 10^n$', tips: [{ zh: '诸葛亮提示：大数字用标准式，一目了然！', en: 'Zhuge Liang Tip: Standard form makes big numbers clear at a glance!' }] },
  },
  {
    id: 874, grade: 8, unitId: 7, order: 4,
    unitTitle: { zh: 'Unit 7: 图表篇 · 天下形势图', en: 'Unit 7: Charts · Map of the Realm' },
    topic: 'Algebra', type: 'STD_FORM',
    title: { zh: '粮草总量', en: 'Total Supplies' },
    skillName: { zh: '大数标准化', en: 'Large Number Standardisation' },
    skillSummary: { zh: '把大数字写成 $a \\times 10^n$', en: 'Write large numbers as $a \\times 10^n$' },
    story: { zh: '三分天下需要多少粮草？诸葛亮把庞大数字转为标准式便于计算。', en: 'How much grain to divide the realm? Zhuge Liang converts huge numbers to standard form.' },
    description: { zh: '写成标准式', en: 'Write in standard form' },
    data: { number: 3600000, a: 3.6, n: 6, generatorType: 'STD_FORM_RANDOM' },
    difficulty: 'Hard', reward: 200, kpId: 'kp-1.8-01', sectionId: 'number',
    tutorialSteps: [],
    secret: { concept: { zh: '小数点移到第一个非零数字后面，移了几位就是 $n$。', en: 'Move decimal after first non-zero digit. Count of places moved = $n$.' }, formula: '$a \\times 10^n$', tips: [{ zh: '诸葛亮提示：隆中对成竹在胸——三分天下！', en: 'Zhuge Liang Tip: The Longzhong Plan is set — divide the realm in three!' }] },
    storyConsequence: { correct: { zh: '隆中对完成！三分天下的蓝图绘就！', en: 'Longzhong Plan complete! The blueprint for dividing the realm is drawn!' }, wrong: { zh: '数字太大算糊涂了…', en: 'Numbers too large — calculations went wrong...' } },
  },

  // --- Unit 8: 度量篇 · 荆州治理 (209 AD) — 线性图 + 综合 ---
  {
    id: 881, grade: 8, unitId: 8, order: 1,
    unitTitle: { zh: 'Unit 8: 度量篇 · 荆州治理', en: 'Unit 8: Measure · Governing Jingzhou' },
    topic: 'Functions', type: 'LINEAR',
    title: { zh: '税收路线', en: 'Tax Revenue Route' },
    skillName: { zh: '线性图解读', en: 'Linear Graph Reading' },
    skillSummary: { zh: '从图上两点求 y=mx+c', en: 'Find y=mx+c from two points on a graph' },
    story: { zh: '刘备治荆州，税收增长趋势经过 $({x1},{y1})$ 和 $({x2},{y2})$。', en: 'Liu Bei governs Jingzhou. Tax growth passes through $({x1},{y1})$ and $({x2},{y2})$.' },
    description: { zh: '求税收增长方程 $y = mx + c$', en: 'Find the tax growth equation $y = mx + c$' },
    data: { points: [[1, 100], [3, 200]], x1: 1, y1: 100, x2: 3, y2: 200, generatorType: 'LINEAR_RANDOM' },
    difficulty: 'Medium', reward: 180, kpId: 'kp-2.5-01', sectionId: 'functions',
    tutorialSteps: [],
    secret: { concept: { zh: '线性增长 = 每期增加固定量。斜率就是增长速度。', en: 'Linear growth = fixed increase per period. Slope = rate of growth.' }, formula: '$y = mx + c$', tips: [{ zh: '刘备提示：以德服人，荆州大治！', en: 'Liu Bei Tip: Lead with virtue — Jingzhou prospers!' }] },
  },
  {
    id: 882, grade: 8, unitId: 8, order: 2,
    unitTitle: { zh: 'Unit 8: 度量篇 · 荆州治理', en: 'Unit 8: Measure · Governing Jingzhou' },
    topic: 'Functions', type: 'LINEAR',
    title: { zh: '人口增长', en: 'Population Growth' },
    skillName: { zh: '趋势预测术', en: 'Trend Prediction' },
    skillSummary: { zh: '用线性方程预测未来值', en: 'Use linear equation to predict future values' },
    story: { zh: '荆州人口每年稳定增长，今年数据点经过 $({x1},{y1})$ 和 $({x2},{y2})$。', en: 'Jingzhou population grows steadily, passing through $({x1},{y1})$ and $({x2},{y2})$.' },
    description: { zh: '求人口增长方程', en: 'Find the population growth equation' },
    data: { points: [[0, 500], [5, 750]], x1: 0, y1: 500, x2: 5, y2: 750, generatorType: 'LINEAR_RANDOM' },
    difficulty: 'Hard', reward: 200, kpId: 'kp-2.5-01', sectionId: 'functions',
    tutorialSteps: [],
    secret: { concept: { zh: '截距 $c$ 是初始人口，斜率 $m$ 是每年增长量。', en: 'Intercept $c$ = initial population, slope $m$ = yearly growth.' }, formula: '$y = mx + c$', tips: [{ zh: '诸葛亮提示：荆州治理好了，就是北伐的根基！', en: 'Zhuge Liang Tip: A well-governed Jingzhou is the base for the northern expedition!' }] },
    storyConsequence: { correct: { zh: '荆州大治，人口增长趋势已成！', en: 'Jingzhou thrives — population growth trend established!' }, wrong: { zh: '预测失误，治理方案需要调整…', en: 'Prediction wrong — governance plan needs adjustment...' } },
  },

  // --- Y8 Tier 2: Unit 5 扩展 — 联立方程(代入法) ---
  {
    id: 885, grade: 8, unitId: 5, order: 5,
    unitTitle: { zh: 'Unit 5: 情报篇 · 官渡谍报', en: 'Unit 5: Intelligence · Guandu Espionage' },
    topic: 'Algebra', type: 'SIMULTANEOUS',
    title: { zh: '粮草与兵力', en: 'Supplies & Forces' },
    skillName: { zh: '代入法术', en: 'Substitution Method' },
    skillSummary: { zh: '把一个方程代入另一个，逐步求解', en: 'Substitute one equation into the other to solve step by step' },
    story: { zh: '曹操需要同时计算粮草和兵力的平衡点——两个条件需要同时满足。', en: 'Cao Cao must find the balance between supplies and forces — both conditions must be met.' },
    description: { zh: '用代入法解联立方程', en: 'Solve simultaneous equations by substitution' },
    data: { subEq1: [2, 3], subEq2: [1, 1, 5], x: 2, y: 7, generatorType: 'SIMULTANEOUS_Y8_RANDOM' },
    difficulty: 'Medium', reward: 180, kpId: 'kp-2.2-01', sectionId: 'algebra',
    tutorialSteps: [],
    secret: { concept: { zh: '代入法：把一个方程"塞进"另一个，化为一元方程。', en: 'Substitution: "plug" one equation into the other to get a single-variable equation.' }, formula: '$y = ax + b \\to cx + dy = e$', tips: [{ zh: '曹操提示：兵分两路，合而为一——代入法的精髓！', en: 'Cao Cao Tip: Divide forces, then unite — the essence of substitution!' }] },
  },
  {
    id: 886, grade: 8, unitId: 5, order: 6,
    unitTitle: { zh: 'Unit 5: 情报篇 · 官渡谍报', en: 'Unit 5: Intelligence · Guandu Espionage' },
    topic: 'Algebra', type: 'SIMULTANEOUS',
    title: { zh: '情报交叉', en: 'Intelligence Crosscheck' },
    skillName: { zh: '代入法进阶', en: 'Advanced Substitution' },
    skillSummary: { zh: '负系数代入法', en: 'Substitution with negative coefficients' },
    story: { zh: '两条情报线索需要交叉验证——解联立方程找到真相。', en: 'Two intelligence leads must be cross-checked — solve simultaneous equations to find the truth.' },
    description: { zh: '用代入法解联立方程', en: 'Solve simultaneous equations by substitution' },
    data: { subEq1: [-1, 5], subEq2: [2, 1, 7], x: 1, y: 4, generatorType: 'SIMULTANEOUS_Y8_RANDOM' },
    difficulty: 'Hard', reward: 200, kpId: 'kp-2.2-01', sectionId: 'algebra',
    tutorialSteps: [],
    secret: { concept: { zh: '代入法同样适用于负系数——注意符号！', en: 'Substitution works with negative coefficients too — watch the signs!' }, formula: '$y = ax + b \\to cx + dy = e$', tips: [{ zh: '曹操提示：情报交叉验证，真相自然浮现！', en: 'Cao Cao Tip: Cross-check intelligence — the truth will emerge!' }] },
    storyConsequence: { correct: { zh: '情报交叉验证成功，官渡大计又进一步！', en: 'Intelligence cross-check successful — the Guandu plan advances!' }, wrong: { zh: '情报对不上，需要重新分析…', en: 'Intelligence doesn\'t match — reanalysis needed...' } },
  },

  // --- Y8 Tier 2: Unit 6 扩展 — 对称(线对称/旋转) ---
  {
    id: 887, grade: 8, unitId: 6, order: 7,
    unitTitle: { zh: 'Unit 6: 代数篇 · 隆中对前奏', en: 'Unit 6: Algebra · Prelude to Longzhong' },
    topic: 'Geometry', type: 'SYMMETRY',
    title: { zh: '阵法镜像', en: 'Formation Mirror' },
    skillName: { zh: '线对称术', en: 'Line Symmetry' },
    skillSummary: { zh: '关于坐标轴的反射变换', en: 'Reflection in the coordinate axes' },
    story: { zh: '诸葛亮设计阵法，左右翼需要关于中轴完全对称。', en: 'Zhuge Liang designs a formation — left and right wings must be perfectly symmetrical about the centre axis.' },
    description: { zh: '求反射后的坐标', en: 'Find the coordinates after reflection' },
    data: { px: 3, py: 4, mode: 'reflect_y', ansX: -3, ansY: 4, generatorType: 'SYMMETRY_RANDOM' },
    difficulty: 'Medium', reward: 180, kpId: 'kp-4.5-01', sectionId: 'geometry',
    tutorialSteps: [],
    secret: { concept: { zh: '线对称：图形沿对称轴翻折后完全重合。坐标轴反射有简单规则。', en: 'Line symmetry: a shape folds exactly onto itself along the line of symmetry. Axis reflections have simple rules.' }, formula: '$(x,y) \\to (-x,y)$ / $(x,-y)$', tips: [{ zh: '诸葛亮提示：左右对称，阵法无懈可击！', en: 'Zhuge Liang Tip: Symmetrical formations are unbreakable!' }] },
  },
  {
    id: 888, grade: 8, unitId: 6, order: 8,
    unitTitle: { zh: 'Unit 6: 代数篇 · 隆中对前奏', en: 'Unit 6: Algebra · Prelude to Longzhong' },
    topic: 'Geometry', type: 'SYMMETRY',
    title: { zh: '旋转阵法', en: 'Rotating Formation' },
    skillName: { zh: '旋转对称术', en: 'Rotational Symmetry' },
    skillSummary: { zh: '绕原点旋转 $180°$', en: 'Rotation $180°$ about the origin' },
    story: { zh: '战场形势逆转！阵法需要 180° 大转向，重新计算每个单位的位置。', en: 'The battle turns! The formation needs a 180° rotation — recalculate every unit\'s position.' },
    description: { zh: '求旋转后的坐标', en: 'Find the coordinates after rotation' },
    data: { px: 2, py: -5, mode: 'rotate_180', ansX: -2, ansY: 5, generatorType: 'SYMMETRY_RANDOM' },
    difficulty: 'Hard', reward: 200, kpId: 'kp-4.5-01', sectionId: 'geometry',
    tutorialSteps: [],
    secret: { concept: { zh: '绕原点旋转 180°：$x$ 和 $y$ 都取反。等价于中心对称。', en: 'Rotation 180° about origin: both $x$ and $y$ change sign. Equivalent to point symmetry.' }, formula: '$(x,y) \\to (-x,-y)$', tips: [{ zh: '周瑜提示：战场翻转，以退为进！', en: 'Zhou Yu Tip: Reverse the battlefield — retreat to advance!' }] },
    storyConsequence: { correct: { zh: '阵法旋转成功，反败为胜！对称的力量不可小觑！', en: 'Formation rotation succeeds — defeat turned to victory! The power of symmetry!' }, wrong: { zh: '坐标算错，阵法混乱…', en: 'Wrong coordinates — the formation falls into chaos...' } },
  },

  // --- Y8 Tier 2: Unit 7 扩展 — 正反比例 ---
  {
    id: 891, grade: 8, unitId: 7, order: 5,
    unitTitle: { zh: 'Unit 7: 图表篇 · 天下形势图', en: 'Unit 7: Charts · Map of the Realm' },
    topic: 'Algebra', type: 'RATIO',
    title: { zh: '粮草正比例', en: 'Direct Proportion of Supplies' },
    skillName: { zh: '正比例术', en: 'Direct Proportion' },
    skillSummary: { zh: '$y = kx$，$k$ 为常数', en: '$y = kx$, $k$ is constant' },
    story: { zh: '荆州税收与人口成正比。已知某镇数据，推算全郡。', en: 'Jingzhou tax is directly proportional to population. Use one town\'s data to estimate the whole region.' },
    description: { zh: '利用正比例关系求未知量', en: 'Use direct proportion to find the unknown' },
    data: { mode: 'direct', k: 3, x1: 4, y1: 12, x2: 7, y2: 21, answer: 21, generatorType: 'RATIO_Y8_RANDOM' },
    difficulty: 'Medium', reward: 180, kpId: 'kp-1.11-01', sectionId: 'number',
    tutorialSteps: [],
    secret: { concept: { zh: '正比例：一个量变大，另一个也等比例变大。比值 $\\frac{y}{x} = k$ 恒定。', en: 'Direct proportion: as one quantity increases, the other increases at the same rate. The ratio $\\frac{y}{x} = k$ stays constant.' }, formula: '$y = kx$', tips: [{ zh: '刘备提示：人多则税丰，治国之基！', en: 'Liu Bei Tip: More people, more revenue — the foundation of governance!' }] },
  },
  {
    id: 892, grade: 8, unitId: 7, order: 6,
    unitTitle: { zh: 'Unit 7: 图表篇 · 天下形势图', en: 'Unit 7: Charts · Map of the Realm' },
    topic: 'Algebra', type: 'RATIO',
    title: { zh: '兵粮反比例', en: 'Inverse Proportion of Rations' },
    skillName: { zh: '反比例术', en: 'Inverse Proportion' },
    skillSummary: { zh: '$y = \\frac{k}{x}$，$k$ 为常数', en: '$y = \\frac{k}{x}$, $k$ is constant' },
    story: { zh: '粮草有限，人越多每人分到越少。已知小队数据，算大军分配。', en: 'Limited supplies — more soldiers means less each gets. Use squad data to calculate army rations.' },
    description: { zh: '利用反比例关系求未知量', en: 'Use inverse proportion to find the unknown' },
    data: { mode: 'inverse', k: 60, x1: 3, y1: 20, x2: 6, y2: 10, answer: 10, generatorType: 'RATIO_Y8_RANDOM' },
    difficulty: 'Hard', reward: 200, kpId: 'kp-1.11-01', sectionId: 'number',
    tutorialSteps: [],
    secret: { concept: { zh: '反比例：一个量变大，另一个就变小。乘积 $xy = k$ 恒定。', en: 'Inverse proportion: as one increases, the other decreases. The product $xy = k$ stays constant.' }, formula: '$y = \\frac{k}{x}$', tips: [{ zh: '曹操提示：兵多粮少，精兵才是上策！', en: 'Cao Cao Tip: More soldiers, less food — an elite force is best!' }] },
    storyConsequence: { correct: { zh: '比例关系掌握，天下形势尽在掌握！', en: 'Proportion mastered — the realm\'s dynamics are in your grasp!' }, wrong: { zh: '比例算错，分配出了问题…', en: 'Wrong proportion — distribution went wrong...' } },
  },

  // --- Y8 Tier 2: Unit 8 扩展 — 交叉应用 ---
  {
    id: 895, grade: 8, unitId: 8, order: 3,
    unitTitle: { zh: 'Unit 8: 度量篇 · 荆州治理', en: 'Unit 8: Measure · Governing Jingzhou' },
    topic: 'Statistics', type: 'RATIO',
    title: { zh: '税收分配', en: 'Tax Distribution' },
    skillName: { zh: '百分比+比例综合', en: 'Percentage & Ratio Combined' },
    skillSummary: { zh: '先算百分比，再按比例分配', en: 'Calculate percentage first, then distribute by ratio' },
    story: { zh: '荆州税收 {total} 万金，按 $3:2$ 分配给军事和民生。', en: 'Jingzhou tax is {total} ten-thousand gold, split $3:2$ between military and civilian.' },
    description: { zh: '军事部分分到多少？', en: 'How much goes to the military?' },
    data: { mode: 'direct', k: 100, x1: 5, y1: 500, x2: 3, y2: 300, answer: 300, generatorType: 'RATIO_Y8_RANDOM' },
    difficulty: 'Medium', reward: 180, kpId: 'kp-1.11-01', sectionId: 'number',
    tutorialSteps: [],
    secret: { concept: { zh: '比例分配：先算总份数，再用每份的值乘以对应份数。', en: 'Ratio sharing: find total parts first, then multiply each part\'s value.' }, formula: '$\\text{share} = \\frac{a}{a+b} \\times \\text{total}$', tips: [{ zh: '刘备提示：军民并重，荆州方能长治久安！', en: 'Liu Bei Tip: Balance military and civilian — Jingzhou will thrive!' }] },
  },
  {
    id: 896, grade: 8, unitId: 8, order: 4,
    unitTitle: { zh: 'Unit 8: 度量篇 · 荆州治理', en: 'Unit 8: Measure · Governing Jingzhou' },
    topic: 'Algebra', type: 'SIMPLE_EQ',
    title: { zh: '行军时间', en: 'March Duration' },
    skillName: { zh: '方程+速度综合', en: 'Equation & Speed Combined' },
    skillSummary: { zh: '从速度和距离求时间', en: 'Find time from speed and distance' },
    story: { zh: '关羽从荆州出发，速度 {speed} 里/时，距目标 {distance} 里。多久到达？', en: 'Guan Yu departs Jingzhou at {speed} li/hr, target is {distance} li away. How long?' },
    description: { zh: '计算到达时间', en: 'Calculate the time of arrival' },
    data: { speed: 12, distance: 60, time: 5, mode: 'time', answer: 5, x: 5, generatorType: 'SPEED_RANDOM' },
    difficulty: 'Hard', reward: 200, kpId: 'kp-1.12-01', sectionId: 'number',
    tutorialSteps: [],
    secret: { concept: { zh: '时间 = 距离 ÷ 速度。三个量知二求一。', en: 'Time = Distance ÷ Speed. Know two, find the third.' }, formula: '$T = \\frac{D}{S}$', tips: [{ zh: '关羽提示：千里走单骑，时间就是一切！', en: 'Guan Yu Tip: A thousand-mile ride alone — time is everything!' }] },
    storyConsequence: { correct: { zh: 'Y8 课程圆满完结！荆州基业已稳，三分天下的宏图正式展开！', en: 'Y8 curriculum complete! Jingzhou\'s foundation is solid — the grand plan for three kingdoms begins!' }, wrong: { zh: '时间算错，错失战机…', en: 'Time miscalculated — the opportunity is lost...' } },
  },

  // --- Year 9: The Battle of Guandu (Strategy) ---
  {
    id: 911, grade: 9, unitId: 1, order: 1,
    unitTitle: { zh: "Unit 1: 粮草与指数定律", en: "Unit 1: Supplies & Indices" },
    topic: 'Algebra', type: 'INDICES',
    title: { zh: '官渡积粮', en: 'Guandu Supplies' },
    skillName: { zh: '指数乘法术', en: 'Index Multiplication' },
    skillSummary: { zh: '同底数幂相乘，指数相加', en: 'Same base: multiply → add exponents' },
    story: { zh: '官渡之战前夕，曹操囤积粮草。第一年产粮 ${base}^{e1}$ 斛，第二年产粮是第一年的 ${base}^{e2}$ 倍。', en: "Before Guandu, Cao Cao stores grain. Year 1 yields ${base}^{e1}$, Year 2 is ${base}^{e2}$ times that." },
    description: { zh: '计算总产量：${base}^{e1} \\times {base}^{e2} = {base}^x$，求 $x$。', en: 'Calculate total: ${base}^{e1} \\times {base}^{e2} = {base}^x$, find $x$.' },
    data: { base: 3, e1: 2, e2: 3, generatorType: 'INDICES_RANDOM' }, difficulty: 'Easy', reward: 120,
    kpId: 'kp-1.3-02', sectionId: 'number',
    tutorialSteps: [
      {
        text: { zh: '郭嘉："官渡之战前，粮草为 $3^2 \\times 3^3$。同底数幂相乘，指数相加。"', en: 'Guo Jia: "Before Guandu, grain is $3^2 \\times 3^3$. Same base powers multiply: add exponents."' },
        highlightField: 'x'
      },
      {
        text: { zh: '郭嘉："$3^2 \\times 3^3 = 3^{2+3} = 3^x$，所以 $x = 2 + 3$"', en: 'Guo Jia: "$3^2 \\times 3^3 = 3^{2+3} = 3^x$, so $x = 2 + 3$"' },
        hint: { zh: '2 加 3 等于多少？', en: 'What is 2 plus 3?' },
        highlightField: 'x'
      },
      {
        text: { zh: '郭嘉："$x = 5$！算清粮草，方能决战官渡！"', en: 'Guo Jia: "$x = 5$! Count the grain to win at Guandu!"' },
        highlightField: 'x'
      }
    ],
    secret: { concept: { zh: '同底数幂相乘，指数相加。', en: 'Multiply powers with same base: add exponents.' }, formula: '$a^m \\times a^n = a^{m+n}$', tips: [{ zh: '郭嘉提示：算清粮草，方能决战官渡。', en: 'Guo Jia Tip: Count the grain to win at Guandu.' }] }
  },
  {
    id: 912, grade: 9, unitId: 1, order: 2,
    unitTitle: { zh: "Unit 1: 粮草与指数定律", en: "Unit 1: Supplies & Indices" },
    topic: 'Algebra', type: 'INDICES',
    title: { zh: '粮仓扩建', en: 'Granary Expansion' },
    skillName: { zh: '指数相加术', en: 'Index Addition' },
    skillSummary: { zh: '同底数幂相乘，指数相加', en: 'Multiply same-base powers: add exponents' },
    story: { zh: '粮仓扩建。第一批 ${base}^{e1}$ 单位，扩建 ${base}^{e2}$ 倍。', en: 'Granary expansion. Batch 1: ${base}^{e1}$ units, expanded ${base}^{e2}$ times.' },
    description: { zh: '利用同底数幂相乘性质：$a^m \\times a^n = a^{m+n}$。', en: 'Use same-base multiplication: $a^m \\times a^n = a^{m+n}$.' },
    data: { base: 2, e1: 3, e2: 2, generatorType: 'INDICES_RANDOM' }, difficulty: 'Medium', reward: 140,
    kpId: 'kp-1.3-02', sectionId: 'number',
    tutorialSteps: [
      {
        text: { zh: '程昱："粮仓容量为 $(2^3)^2$。幂的乘方，底数不变，指数相乘。"', en: 'Cheng Yu: "Granary capacity is $(2^3)^2$. Power of a power: base stays, exponents multiply."' },
        highlightField: 'x'
      },
      {
        text: { zh: '程昱："$(2^3)^2 = 2^{3 \\times 2} = 2^x$，所以 $x = 3 \\times 2$"', en: 'Cheng Yu: "$(2^3)^2 = 2^{3 \\times 2} = 2^x$, so $x = 3 \\times 2$"' },
        hint: { zh: '3 乘以 2 等于多少？', en: 'What is 3 times 2?' },
        highlightField: 'x'
      },
      {
        text: { zh: '程昱："$x = 6$！空间利用要最大化。"', en: 'Cheng Yu: "$x = 6$! Maximize space utilization."' },
        highlightField: 'x'
      }
    ],
    secret: { concept: { zh: '同底数幂相乘，底数不变，指数相加。', en: 'Multiply same-base powers: base stays, add exponents.' }, formula: '$a^m \\times a^n = a^{m+n}$', tips: [{ zh: '程昱提示：空间利用要最大化。', en: 'Cheng Yu Tip: Maximize space utilization.' }] }
  },
  {
    id: 913, grade: 9, unitId: 1, order: 3,
    unitTitle: { zh: "Unit 1: 粮草与指数定律", en: "Unit 1: Supplies & Indices" },
    topic: 'Algebra', type: 'INDICES',
    title: { zh: '火烧乌巢', en: 'Burning Wuchao' },
    skillName: { zh: '指数除法术', en: 'Index Division' },
    skillSummary: { zh: '同底数幂相除，指数相减', en: 'Same base: divide → subtract exponents' },
    story: { zh: '袭击袁绍粮仓。已知粮仓数量为 ${base}^{e1}$，每把火能烧毁 ${base}^{e2}$ 座。', en: "Attacking Wuchao. There are ${base}^{e1}$ granaries, each fire destroys ${base}^{e2}$." },
    description: { zh: '计算剩余粮仓：${base}^{e1} / {base}^{e2} = {base}^x$，求 $x$。', en: 'Calculate remaining: ${base}^{e1} / {base}^{e2} = {base}^x$, find $x$.' },
    data: { base: 2, e1: 8, e2: 5, op: 'div', generatorType: 'INDICES_RANDOM' }, difficulty: 'Medium', reward: 160,
    kpId: 'kp-1.3-02', sectionId: 'number',
    tutorialSteps: [
      {
        text: { zh: '曹操："乌巢粮仓 $2^8$ 座，一把火烧 $2^5$ 座。同底数幂相除，指数相减。"', en: 'Cao Cao: "$2^8$ granaries at Wuchao, fire destroys $2^5$. Same base division: subtract exponents."' },
        highlightField: 'x'
      },
      {
        text: { zh: '曹操："$2^8 / 2^5 = 2^{8-5} = 2^x$，所以 $x = 8 - 5$"', en: 'Cao Cao: "$2^8 / 2^5 = 2^{8-5} = 2^x$, so $x = 8 - 5$"' },
        hint: { zh: '8 减去 5 等于多少？', en: 'What is 8 minus 5?' },
        highlightField: 'x'
      },
      {
        text: { zh: '曹操："$x = 3$！乌巢一火，袁绍必败！"', en: 'Cao Cao: "$x = 3$! Once Wuchao burns, Yuan Shao is finished!"' },
        highlightField: 'x'
      }
    ],
    secret: { concept: { zh: '同底数幂相除，指数相减。', en: 'Divide powers with same base: subtract exponents.' }, formula: '$a^m / a^n = a^{m-n}$', tips: [{ zh: '曹操提示：乌巢一火，袁绍必败！', en: 'Cao Tip: Once Wuchao burns, Yuan Shao is finished!' }] }
  },
  {
    id: 921, grade: 9, unitId: 2, order: 1,
    unitTitle: { zh: "Unit 2: 攻城与勾股定理", en: "Unit 2: Siege & Pythagoras" },
    topic: 'Geometry', type: 'PYTHAGORAS',
    title: { zh: '云梯攻城', en: 'Siege Ladders' },
    skillName: { zh: '勾股攻城术', en: 'Pythagorean Siege' },
    skillSummary: { zh: 'a² + b² = c²，已知两边求第三边', en: 'a² + b² = c², find the third side' },
    story: { zh: "攻打袁绍营寨。城墙高 {b} 丈，护城河宽 {a} 丈。", en: "Attacking Yuan Shao's camp. Walls {b} units high, moat {a} units wide." },
    description: { zh: '求云梯长度 $c$。', en: 'Find ladder length $c$.' },
    data: { a: 6, b: 8, generatorType: 'PYTHAGORAS_RANDOM' }, difficulty: 'Medium', reward: 200,
    storyConsequence: {
      correct: { zh: '云梯精准搭上城头！将士们鱼贯而入，攻城成功！', en: 'The ladder reaches the top perfectly! Soldiers storm the walls, siege successful!' },
      wrong: { zh: '云梯太短了！差了几丈，将士们只能撤退，改走地道突袭...', en: 'The ladder is too short! Soldiers must retreat and try the tunnel approach...' },
    },
    kpId: 'kp-6.1-01', sectionId: 'geometry',
    tutorialSteps: [
      {
        text: { zh: '许褚："城墙高 8 丈，护城河宽 6 丈。云梯是直角三角形的斜边！"', en: 'Xu Chu: "Wall height 8, moat width 6. The ladder is the hypotenuse of a right triangle!"' },
        highlightField: 'c'
      },
      {
        text: { zh: '许褚："勾股定理：$c^2 = a^2 + b^2 = 6^2 + 8^2 = 36 + 64 = 100$"', en: 'Xu Chu: "Pythagoras: $c^2 = a^2 + b^2 = 6^2 + 8^2 = 36 + 64 = 100$"' },
        hint: { zh: '$\\sqrt{100}$ 等于多少？', en: 'What is $\\sqrt{100}$?' },
        highlightField: 'c'
      },
      {
        text: { zh: '许褚："$c = 10$ 丈！梯子够长了，俺先上！"', en: 'Xu Chu: "$c = 10$ units! The ladder is long enough, I\'ll go first!"' },
        highlightField: 'c'
      }
    ],
    secret: { concept: { zh: '直角三角形中，$a^2 + b^2 = c^2$。', en: 'In a right triangle, $a^2 + b^2 = c^2$.' }, formula: '$a^2 + b^2 = c^2$', tips: [{ zh: "许褚提示：梯子不够长，俺可跳不上去！", en: "Xu Chu Tip: If the ladder is too short, I can't jump up!" }] }
  },
  {
    id: 922, grade: 9, unitId: 2, order: 2,
    unitTitle: { zh: "Unit 2: 攻城与勾股定理", en: "Unit 2: Siege & Pythagoras" },
    topic: 'Geometry', type: 'TRIGONOMETRY',
    title: { zh: '望楼侦察', en: 'Scouting from the Tower' },
    skillName: { zh: '望楼测距术', en: 'Tower Ranging' },
    skillSummary: { zh: '用正切值计算距离', en: 'Calculate distance using tangent' },
    story: { zh: '从望楼俯瞰敌营。已知望楼高 {opposite} 丈，与敌营水平距离 {adjacent} 丈。', en: 'Scouting from a tower. Height {opposite}, horizontal distance {adjacent}.' },
    description: { zh: '求正切值 $\\tan(\\theta) = \\text{对边} / \\text{邻边}$。', en: 'Find $\\tan(\\theta) = \\text{opposite} / \\text{adjacent}$.' },
    data: { opposite: 12, adjacent: 16, generatorType: 'TRIGONOMETRY_RANDOM' }, difficulty: 'Medium', reward: 220,
    kpId: 'kp-6.2-01', sectionId: 'geometry',
    tutorialSteps: [
      {
        text: { zh: '乐进："望楼高 12 丈，敌营水平距离 16 丈。需求正切值。"', en: 'Yue Jin: "Tower height 12, horizontal distance 16. Find the tangent value."' },
        highlightField: 'tan'
      },
      {
        text: { zh: '乐进："$\\tan(\\theta) = \\text{对边} / \\text{邻边} = 12 / 16$"', en: 'Yue Jin: "$\\tan(\\theta) = \\text{opposite} / \\text{adjacent} = 12 / 16$"' },
        hint: { zh: '12 除以 16，化简为最简分数', en: '12 divided by 16, simplify to lowest terms' },
        highlightField: 'tan'
      },
      {
        text: { zh: '乐进："$\\tan(\\theta) = 0.75$！看清距离，方能百步穿杨。"', en: 'Yue Jin: "$\\tan(\\theta) = 0.75$! See the distance clearly to hit the mark."' },
        highlightField: 'tan'
      }
    ],
    secret: { concept: { zh: '正切值是直角三角形对边与邻边的比。', en: 'Tangent is the ratio of opposite to adjacent side.' }, formula: '$\\tan(\\theta) = a / b$', tips: [{ zh: '乐进提示：看清距离，方能百步穿杨。', en: 'Yue Jin Tip: See the distance clearly to hit the mark.' }] }
  },
  {
    id: 923, grade: 9, unitId: 2, order: 3,
    unitTitle: { zh: "Unit 2: 攻城与勾股定理", en: "Unit 2: Siege & Pythagoras" },
    topic: 'Geometry', type: 'PYTHAGORAS',
    title: { zh: '地道突袭', en: 'Tunnel Raid' },
    skillName: { zh: '勾股探测术', en: 'Pythagorean Probe' },
    skillSummary: { zh: '用勾股定理求未知边长', en: 'Use Pythagorean theorem for unknown side' },
    story: { zh: '挖掘地道突袭袁绍。地道斜长 {c} 丈，水平距离 {a} 丈。', en: 'Digging a tunnel to raid Yuan Shao. Slant length {c}, horizontal distance {a}.' },
    description: { zh: '求地道深度 $b$。', en: 'Find tunnel depth $b$.' },
    data: { a: 24, c: 25, generatorType: 'PYTHAGORAS_RANDOM' }, difficulty: 'Hard', reward: 250,
    kpId: 'kp-6.1-01', sectionId: 'geometry',
    tutorialSteps: [
      {
        text: { zh: '曹洪："地道斜长 25 丈，水平距离 24 丈。用勾股定理求深度。"', en: 'Cao Hong: "Tunnel slant length 25, horizontal distance 24. Use Pythagoras to find depth."' },
        highlightField: 'c'
      },
      {
        text: { zh: '曹洪："$b^2 = c^2 - a^2 = 25^2 - 24^2 = 625 - 576 = 49$"', en: 'Cao Hong: "$b^2 = c^2 - a^2 = 25^2 - 24^2 = 625 - 576 = 49$"' },
        hint: { zh: '$\\sqrt{49}$ 等于多少？', en: 'What is $\\sqrt{49}$?' },
        highlightField: 'c'
      },
      {
        text: { zh: '曹洪："$b = 7$ 丈！地道要挖深，别被发现了！"', en: 'Cao Hong: "$b = 7$ units! Dig deep, don\'t get spotted!"' },
        highlightField: 'c'
      }
    ],
    secret: { concept: { zh: '勾股定理变形：$b = \\sqrt{c^2 - a^2}$。', en: 'Pythagorean variant: $b = \\sqrt{c^2 - a^2}$.' }, formula: '$b^2 = c^2 - a^2$', tips: [{ zh: "曹洪提示：地道要挖深，别被发现了！", en: "Cao Hong Tip: Dig deep, don't get spotted!" }] }
  },
  {
    id: 931, grade: 9, unitId: 3, order: 1,
    unitTitle: { zh: "Unit 3: 阵法与相似", en: "Unit 3: Formations & Similarity" },
    topic: 'Geometry', type: 'SIMILARITY',
    title: { zh: '旗帜缩放', en: 'Flag Scaling' },
    skillName: { zh: '旗帜缩放术', en: 'Flag Scaling' },
    skillSummary: { zh: '相似比求未知边', en: 'Use similarity ratio for unknown sides' },
    story: { zh: '制作一面大旗。按相似比例缩放。', en: 'Making a large flag. Scale by similarity ratio.' },
    description: { zh: '求大旗的宽 $x$。', en: 'Find the width $x$ of the large flag.' },
    data: { a: 6, b: 2, c: 3, generatorType: 'SIMILARITY_RANDOM' }, difficulty: 'Medium', reward: 200,
    kpId: 'kp-4.4-01', sectionId: 'geometry',
    tutorialSteps: [
      {
        text: { zh: '于禁："小旗长 2 宽 3，大旗长 6。相似图形对应边成比例。"', en: 'Yu Jin: "Small flag: length 2, width 3. Large flag: length 6. Similar figures have proportional sides."' },
        highlightField: 'x'
      },
      {
        text: { zh: '于禁："比例尺 = $6/2 = 3$，所以大旗宽 = $3 \\times 3 = x$"', en: 'Yu Jin: "Scale factor = $6/2 = 3$, so large flag width = $3 \\times 3 = x$"' },
        hint: { zh: '3 乘以 3 等于多少？', en: 'What is 3 times 3?' },
        highlightField: 'x'
      },
      {
        text: { zh: '于禁："$x = 9$ 尺！军旗要统一，威严不可废。"', en: 'Yu Jin: "$x = 9$ feet! Flags must be uniform, dignity must be maintained."' },
        highlightField: 'x'
      }
    ],
    secret: { concept: { zh: '相似图形对应边成比例。', en: 'Similar figures have proportional corresponding sides.' }, formula: '$a/b = x/c$', tips: [{ zh: '于禁提示：军旗要统一，威严不可废。', en: 'Yu Jin Tip: Flags must be uniform, dignity must be maintained.' }] }
  },
  {
    id: 932, grade: 9, unitId: 3, order: 2,
    unitTitle: { zh: "Unit 3: 阵法与相似", en: "Unit 3: Formations & Similarity" },
    topic: 'Geometry', type: 'SIMILARITY',
    title: { zh: '地图测绘', en: 'Map Surveying' },
    skillName: { zh: '地图测绘术', en: 'Map Survey' },
    skillSummary: { zh: '对应边成比例', en: 'Corresponding sides are proportional' },
    story: { zh: '在地图上测量距离。按比例换算。', en: 'Measuring distance on a map. Convert by scale ratio.' },
    description: { zh: '求实际距离 $x$（单位：厘米）。', en: 'Find actual distance $x$ (in cm).' },
    data: { a: 1000, b: 1, c: 5, generatorType: 'SIMILARITY_RANDOM' }, difficulty: 'Medium', reward: 220,
    kpId: 'kp-4.4-01', sectionId: 'geometry',
    tutorialSteps: [
      {
        text: { zh: '董昭："地图比例尺 1:1000，图上距离 5 厘米。相似比例关系！"', en: 'Dong Zhao: "Map scale 1:1000, map distance 5cm. Similar proportional relationship!"' },
        highlightField: 'x'
      },
      {
        text: { zh: '董昭："$1:1000 = 5:x$，所以 $x = 5 \\times 1000$"', en: 'Dong Zhao: "$1:1000 = 5:x$, so $x = 5 \\times 1000$"' },
        hint: { zh: '5 乘以 1000 等于多少？', en: 'What is 5 times 1000?' },
        highlightField: 'x'
      },
      {
        text: { zh: '董昭："$x = 5000$ 厘米！差之毫厘，谬以千里。"', en: 'Dong Zhao: "$x = 5000$ cm! A tiny error leads to a huge mistake."' },
        highlightField: 'x'
      }
    ],
    secret: { concept: { zh: '比例尺是图上距离与实际距离的比。', en: 'Scale is the ratio of map distance to actual distance.' }, formula: '$Scale = Map / Actual$', tips: [{ zh: '董昭提示：差之毫厘，谬以千里。', en: 'Dong Zhao Tip: A tiny error leads to a huge mistake.' }] }
  },
  {
    id: 941, grade: 9, unitId: 4, order: 1,
    unitTitle: { zh: "Unit 4: 军备与比率", en: "Unit 4: Armaments & Ratio" },
    topic: 'Algebra', type: 'RATIO',
    title: { zh: '兵粮配给', en: 'Rationing' },
    skillName: { zh: '兵粮配比术', en: 'Supply Ratio' },
    skillSummary: { zh: '比例 a:b 求未知项', en: 'Find unknown in ratio a:b' },
    story: { zh: '分配粮草。按固定比例配给。', en: 'Allocating grain. Distribute by fixed ratio.' },
    description: { zh: '求所需粮草 $y$（即 $1000:y = 2:5$）。', en: 'Find grain $y$ (i.e., $1000:y = 2:5$).' },
    data: { a: 2, b: 5, generatorType: 'RATIO_RANDOM' }, difficulty: 'Medium', reward: 240,
    kpId: 'kp-1.12-01', sectionId: 'number',
    tutorialSteps: [
      {
        text: { zh: '李典："士兵与粮草比例 2:5，现有 1000 名士兵。先求比例因子。"', en: 'Li Dian: "Soldiers to grain ratio 2:5, with 1000 soldiers. First find the scale factor."' },
        highlightField: 'x'
      },
      {
        text: { zh: '李典："$1000 \\div 2 = 500$（比例因子），所以粮草 $y = 5 \\times 500$"', en: 'Li Dian: "$1000 \\div 2 = 500$ (scale factor), so grain $y = 5 \\times 500$"' },
        hint: { zh: '5 乘以 500 等于多少？', en: 'What is 5 times 500?' },
        highlightField: 'y'
      },
      {
        text: { zh: '李典："$y = 2500$！后勤保障，重中之重。"', en: 'Li Dian: "$y = 2500$! Logistics is the top priority."' },
        highlightField: 'y'
      }
    ],
    secret: { concept: { zh: '比例式中，内项之积等于外项之积。', en: 'In a proportion, the product of means equals the product of extremes.' }, formula: '$2y = 5000 \\Rightarrow y = 2500$', tips: [{ zh: '李典提示：后勤保障，重中之重。', en: 'Li Dian Tip: Logistics is the top priority.' }] }
  },
  {
    id: 942, grade: 9, unitId: 4, order: 2,
    unitTitle: { zh: "Unit 4: 军备与比率", en: "Unit 4: Armaments & Ratio" },
    topic: 'Algebra', type: 'RATIO',
    title: { zh: '混合阵法', en: 'Mixed Formation' },
    skillName: { zh: '兵种混编术', en: 'Troop Mix' },
    skillSummary: { zh: '交叉相乘法', en: 'Cross multiplication' },
    story: { zh: '混合兵种。按固定比例编组。', en: 'Mixing troops. Organize by fixed ratio.' },
    description: { zh: '求骑兵数量 $y$。', en: 'Find cavalry count $y$.' },
    data: { a: 3, b: 1, generatorType: 'RATIO_RANDOM' }, difficulty: 'Medium', reward: 260,
    kpId: 'kp-1.12-01', sectionId: 'number',
    tutorialSteps: [
      {
        text: { zh: '曹纯："步兵与骑兵比例 3:1，步兵 900 人。求骑兵数。"', en: 'Cao Chun: "Infantry to cavalry ratio 3:1, 900 infantry. Find cavalry count."' },
        highlightField: 'x'
      },
      {
        text: { zh: '曹纯："$900 \\div 3 = 300$（比例因子），骑兵 $y = 1 \\times 300$"', en: 'Cao Chun: "$900 \\div 3 = 300$ (scale factor), cavalry $y = 1 \\times 300$"' },
        hint: { zh: '1 乘以 300 等于多少？', en: 'What is 1 times 300?' },
        highlightField: 'y'
      },
      {
        text: { zh: '曹纯："$y = 300$ 骑兵！虎豹骑出击，势不可挡！"', en: 'Cao Chun: "$y = 300$ cavalry! Tiger and Leopard Cavalry strikes, unstoppable!"' },
        highlightField: 'y'
      }
    ],
    secret: { concept: { zh: '比例的基本性质。', en: 'Basic properties of ratios.' }, formula: '$3:1 = 900:y$', tips: [{ zh: "曹纯提示：虎豹骑出击，势不可挡！", en: "Cao Chun Tip: When the Tiger and Leopard Cavalry strikes, it's unstoppable!" }] }
  },

  // --- Year 10: The Battle of Red Cliffs (Complexity) ---
  {
    id: 1011, grade: 10, unitId: 1, order: 1,
    unitTitle: { zh: "Unit 1: 火攻轨迹与二次函数", en: "Unit 1: Fire Attack & Quadratic Functions" },
    topic: 'Functions', type: 'QUADRATIC',
    title: { zh: '草船借箭', en: 'Straw Boats Borrow Arrows' },
    skillName: { zh: '投石轨迹术', en: 'Catapult Trajectory' },
    skillSummary: { zh: '抛物线系数求解', en: 'Solve parabola coefficients' },
    story: { zh: '大雾弥漫，诸葛亮草船借箭。箭矢高度 $h = -x^2 + 10x$，求最高点 $x$。', en: 'Dense fog covers the river. Zhuge Liang borrows arrows with straw boats. Arrow height $h = -x^2 + 10x$, find the peak $x$.' },
    description: { zh: '求箭矢飞行的最高点坐标。', en: 'Find the peak coordinates of the arrow trajectory.' },
    data: { p1: [0, 0], p2: [5, 25], generatorType: 'QUADRATIC_RANDOM' }, difficulty: 'Easy', reward: 300,
    kpId: 'kp-2.10-01', sectionId: 'algebra',
    tutorialSteps: [
      {
        text: { zh: '周瑜："诸葛亮草船借箭，箭矢轨迹是抛物线 $h = -x^2 + 10x$。我们要找最高点。"', en: 'Zhou Yu: "Zhuge Liang borrows arrows. The trajectory $h = -x^2 + 10x$ is a parabola. Find the peak."' },
        highlightField: 'a'
      },
      {
        text: { zh: '周瑜："二次函数 $y = ax^2 + bx$ 的顶点在 $x = -b/(2a)$。这里 $a=-1, b=10$。"', en: 'Zhou Yu: "For $y = ax^2 + bx$, vertex is at $x = -b/(2a)$. Here $a=-1, b=10$."' },
        hint: { zh: '$x = -10/(2 \\times -1) = ?$', en: '$x = -10/(2 \\times -1) = ?$' },
        highlightField: 'a'
      },
      {
        text: { zh: '周瑜："$x = 5$，代入得 $h = -25+50 = 25$。最高点在 $(5, 25)$！妙计成功！"', en: 'Zhou Yu: "$x = 5$, so $h = -25+50 = 25$. Peak at $(5, 25)$! Brilliant strategy!"' },
        highlightField: 'c'
      }
    ],
    secret: { concept: { zh: '二次函数顶点公式：$x = -b/(2a)$。', en: 'Vertex formula: $x = -b/(2a)$.' }, formula: '$x = -b/(2a)$', tips: [{ zh: '周瑜提示：草船借箭，妙在算准轨迹。', en: 'Zhou Yu Tip: Borrowing arrows with straw boats — the key is calculating the trajectory.' }] }
  },
  {
    id: 1012, grade: 10, unitId: 1, order: 2,
    unitTitle: { zh: "Unit 1: 火攻轨迹与二次函数", en: "Unit 1: Fire Attack & Quadratic Functions" },
    topic: 'Functions', type: 'ROOTS',
    title: { zh: '火烧赤壁', en: 'Burning Red Cliffs' },
    skillName: { zh: '赤壁破阵术', en: 'Red Cliffs Breakthrough' },
    skillSummary: { zh: '求二次方程的根', en: 'Find roots of a quadratic equation' },
    story: { zh: "火船冲向曹营。火势蔓延范围由 $y = -x^2 + 16$ 描述。", en: "Fire ships rush Cao's camp. Fire spread range: $y = -x^2 + 16$." },
    description: { zh: '求火势覆盖的水平宽度（即两根之差）。', en: 'Find the horizontal width of the fire (difference between roots).' },
    data: { a: -1, b: 0, c: 16, generatorType: 'ROOTS_RANDOM' }, difficulty: 'Medium', reward: 350,
    kpId: 'kp-2.10-01', sectionId: 'algebra',
    tutorialSteps: [
      {
        text: { zh: '周瑜："火势范围 $y = -x^2 + 16$。令 $y=0$，求 $x$ 的根。"', en: 'Zhou Yu: "Fire range $y = -x^2 + 16$. Set $y=0$, find roots of $x$."' },
        highlightField: 'x'
      },
      {
        text: { zh: '周瑜："$-x^2 + 16 = 0 \\Rightarrow x^2 = 16 \\Rightarrow x = \\pm 4$"', en: 'Zhou Yu: "$-x^2 + 16 = 0 \\Rightarrow x^2 = 16 \\Rightarrow x = \\pm 4$"' },
        hint: { zh: '两根之差 = $4 - (-4)$ = ?', en: 'Difference of roots = $4 - (-4)$ = ?' },
        highlightField: 'x'
      },
      {
        text: { zh: '周瑜："宽度为 8！火借风势，风助火威！"', en: 'Zhou Yu: "Width is 8! Fire relies on the wind, and wind aids the fire!"' },
        highlightField: 'x'
      }
    ],
    secret: { concept: { zh: '求根公式：$x = \\pm \\sqrt{-c/a}$。', en: 'Quadratic roots: $x = \\pm \\sqrt{-c/a}$.' }, formula: '$x = \\pm 4$', tips: [{ zh: '周瑜提示：火借风势，风助火威。', en: 'Zhou Yu Tip: Fire relies on the wind, and wind aids the fire.' }] }
  },
  {
    id: 1013, grade: 10, unitId: 1, order: 3,
    unitTitle: { zh: "Unit 1: 火攻轨迹与二次函数", en: "Unit 1: Fire Attack & Quadratic Functions" },
    topic: 'Functions', type: 'ROOTS',
    title: { zh: '投石射程', en: 'Catapult Range' },
    skillName: { zh: '射程计算术', en: 'Range Calculation' },
    skillSummary: { zh: '用求根公式计算射程', en: 'Calculate range using quadratic formula' },
    story: { zh: '曹军在岸边架起投石机。石块轨迹为 $y = -x^2 + 100$。', en: 'Cao army sets up catapults. Stone trajectory: $y = -x^2 + 100$.' },
    description: { zh: '求石块落地的位置 $x$（即 $y=0$ 且 $x>0$ 的根）。', en: 'Find where the stone hits the ground $x$ (root of $y=0$ where $x>0$).' },
    data: { a: -1, b: 0, c: 100, generatorType: 'ROOTS_RANDOM' }, difficulty: 'Hard', reward: 480,
    kpId: 'kp-2.10-01', sectionId: 'algebra',
    tutorialSteps: [
      {
        text: { zh: '曹仁："石块轨迹 $y = -x^2 + 100$，求落地位置（$y=0$, $x>0$）。"', en: 'Cao Ren: "Stone trajectory $y = -x^2 + 100$, find landing position ($y=0$, $x>0$)."' },
        highlightField: 'x'
      },
      {
        text: { zh: '曹仁："$-x^2 + 100 = 0 \\Rightarrow x^2 = 100$"', en: 'Cao Ren: "$-x^2 + 100 = 0 \\Rightarrow x^2 = 100$"' },
        hint: { zh: '$\\sqrt{100}$ 等于多少？（取正值）', en: 'What is $\\sqrt{100}$? (take positive value)' },
        highlightField: 'x'
      },
      {
        text: { zh: '曹仁："$x = 10$！射程之内，皆为魏土！"', en: 'Cao Ren: "$x = 10$! Everything within range belongs to Wei!"' },
        highlightField: 'x'
      }
    ],
    secret: { concept: { zh: '二次方程的根即为函数与x轴的交点。', en: 'Roots of a quadratic are where the function meets the x-axis.' }, formula: '$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$', tips: [{ zh: '曹仁提示：射程之内，皆为魏土！', en: 'Cao Ren Tip: Everything within range belongs to Wei!' }] }
  },
  {
    id: 1021, grade: 10, unitId: 2, order: 1,
    unitTitle: { zh: "Unit 2: 连环计与联立方程", en: "Unit 2: Chain Strategy & Simultaneous Equations" },
    topic: 'Algebra', type: 'SIMULTANEOUS',
    title: { zh: '兵力合围', en: 'Troop Encirclement' },
    skillName: { zh: '合围联立术', en: 'Simultaneous Siege' },
    skillSummary: { zh: '消元法解联立方程', en: 'Elimination method for simultaneous equations' },
    story: { zh: '孙刘联军合围曹操。两路兵力需满足两个条件。', en: 'Sun-Liu coalition encircles Cao. Two forces must satisfy two conditions.' },
    description: { zh: '求孙军 $x$ 和刘军 $y$ 的兵力。', en: 'Find Sun army $x$ and Liu army $y$ strength.' },
    data: { x: 5000, y: 5000, generatorType: 'SIMULTANEOUS_RANDOM' }, difficulty: 'Easy', reward: 320,
    kpId: 'kp-2.5-01', sectionId: 'algebra',
    tutorialSteps: [
      {
        text: { zh: '鲁肃："赤壁之战在即，孙刘联盟合围曹操！$x + y = 10000$，$2x - y = 5000$。用加减消元法。"', en: 'Lu Su: "The Battle of Red Cliffs is imminent! Sun-Liu alliance encircles Cao! $x + y = 10000$, $2x - y = 5000$. Use elimination."' },
        highlightField: 'x'
      },
      {
        text: { zh: '鲁肃："两式相加：$(x+y)+(2x-y) = 15000 \\Rightarrow 3x = 15000$"', en: 'Lu Su: "Add both: $(x+y)+(2x-y) = 15000 \\Rightarrow 3x = 15000$"' },
        hint: { zh: '$x = 15000 \\div 3$ = ?', en: '$x = 15000 \\div 3$ = ?' },
        highlightField: 'x'
      },
      {
        text: { zh: '鲁肃："$x = 5000$，代入得 $y = 5000$。联军同心，其利断金！赤壁必胜！"', en: 'Lu Su: "$x = 5000$, substitute to get $y = 5000$. United coalition cuts through gold! Victory at Red Cliffs!"' },
        highlightField: 'y'
      }
    ],
    secret: { concept: { zh: '加减消元法。', en: 'Elimination method.' }, formula: '$3x = 15000 \\Rightarrow x = 5000$', tips: [{ zh: '鲁肃提示：联军同心，其利断金。', en: 'Lu Su Tip: When the coalition is of one mind, they can cut through gold.' }] }
  },
  {
    id: 1022, grade: 10, unitId: 2, order: 2,
    unitTitle: { zh: "Unit 2: 连环计与联立方程", en: "Unit 2: Chain Strategy & Simultaneous Equations" },
    topic: 'Algebra', type: 'SIMULTANEOUS',
    title: { zh: '粮草互换', en: 'Resource Exchange' },
    skillName: { zh: '粮草互换术', en: 'Supply Exchange' },
    skillSummary: { zh: '代入法解联立方程', en: 'Substitution method' },
    story: { zh: '孙刘两军交换物资。两种交易需满足两个等式。', en: 'Sun and Liu exchange resources. Two trades must satisfy two equations.' },
    description: { zh: '求一车粮 $x$ 和一车草 $y$ 的价格。', en: 'Find price of 1 grain $x$ and 1 grass $y$.' },
    data: { eq1: [3, 2, 12], eq2: [2, 3, 13], generatorType: 'SIMULTANEOUS_RANDOM' }, difficulty: 'Medium', reward: 550,
    kpId: 'kp-2.5-01', sectionId: 'algebra',
    tutorialSteps: [
      {
        text: { zh: '鲁肃："$3x+2y=12$，$2x+3y=13$。系数对称，可用加减消元。"', en: 'Lu Su: "$3x+2y=12$, $2x+3y=13$. Symmetric coefficients, use elimination."' },
        highlightField: 'x'
      },
      {
        text: { zh: '鲁肃："两式相加：$5x+5y=25 \\Rightarrow x+y=5$；相减：$x-y=-1$"', en: 'Lu Su: "Add: $5x+5y=25 \\Rightarrow x+y=5$; Subtract: $x-y=-1$"' },
        hint: { zh: '从 $x+y=5$ 和 $x-y=-1$ 解出 $x$ 和 $y$', en: 'Solve $x$ and $y$ from $x+y=5$ and $x-y=-1$' },
        highlightField: 'x'
      },
      {
        text: { zh: '鲁肃："$x=2$, $y=3$！互通有无，方能持久。"', en: 'Lu Su: "$x=2$, $y=3$! Mutual exchange is the key to endurance."' },
        highlightField: 'y'
      }
    ],
    secret: { concept: { zh: '加减消元法可以快速解系数对称的方程组。', en: 'Addition/subtraction elimination works well for symmetric coefficients.' }, formula: '$\\begin{cases} 3x + 2y = 12 \\\\ 2x + 3y = 13 \\end{cases}$', tips: [{ zh: '鲁肃提示：互通有无，方能持久。', en: 'Lu Su Tip: Mutual exchange is the key to endurance.' }] }
  },
  {
    id: 1023, grade: 10, unitId: 2, order: 3,
    unitTitle: { zh: "Unit 2: 连环计与联立方程", en: "Unit 2: Chain Strategy & Simultaneous Equations" },
    topic: 'Algebra', type: 'SIMULTANEOUS',
    title: { zh: '战船调度', en: 'Ship Deployment' },
    skillName: { zh: '战船调度术', en: 'Fleet Coordination' },
    skillSummary: { zh: '两个方程两个未知数', en: 'Two equations, two unknowns' },
    story: { zh: '调度战船。大小两种船需满足两个条件。', en: 'Deploying ships. Two types of ships must satisfy two conditions.' },
    description: { zh: '求大船和小船的数量。', en: 'Find the number of large and small ships.' },
    data: { x: 10, y: 10, generatorType: 'SIMULTANEOUS_RANDOM' }, difficulty: 'Hard', reward: 400,
    kpId: 'kp-2.5-01', sectionId: 'algebra',
    tutorialSteps: [
      {
        text: { zh: '周瑜："$x+y=20$，$10x+5y=150$。用代入消元法。"', en: 'Zhou Yu: "$x+y=20$, $10x+5y=150$. Use substitution method."' },
        highlightField: 'x'
      },
      {
        text: { zh: '周瑜："由第一式 $y=20-x$，代入第二式：$10x+5(20-x)=150$"', en: 'Zhou Yu: "From first equation $y=20-x$, substitute: $10x+5(20-x)=150$"' },
        hint: { zh: '$10x + 100 - 5x = 150 \\Rightarrow 5x = 50$', en: '$10x + 100 - 5x = 150 \\Rightarrow 5x = 50$' },
        highlightField: 'x'
      },
      {
        text: { zh: '周瑜："$x=10$ 大船，$y=10$ 小船。兵贵神速，调度有方！"', en: 'Zhou Yu: "$x=10$ large, $y=10$ small. Speed is precious, deployment must be orderly!"' },
        highlightField: 'y'
      }
    ],
    secret: { concept: { zh: '代入消元法。', en: 'Substitution method.' }, formula: '$5x = 50 \\Rightarrow x = 10$', tips: [{ zh: '周瑜提示：兵贵神速，调度有方。', en: 'Zhou Yu Tip: Speed is precious in war, deployment must be orderly.' }] }
  },
  {
    id: 1031, grade: 10, unitId: 3, order: 1,
    unitTitle: { zh: "Unit 3: 天命占卜与概率", en: "Unit 3: Divination & Probability" },
    topic: 'Algebra', type: 'PROBABILITY',
    title: { zh: '借东风', en: 'Borrowing the East Wind' },
    skillName: { zh: '概率占卜术', en: 'Probability Basics' },
    skillSummary: { zh: '概率 = 有利结果数 ÷ 总结果数', en: 'Probability = favorable ÷ total outcomes' },
    story: { zh: '诸葛亮设坛借东风。已知 {total} 张卦牌中，有 {target} 张是"东风"。', en: 'Zhuge Liang prays for the wind. Out of {total} cards, {target} are "East Wind".' },
    description: { zh: '随机抽一张，抽中"东风"的概率是多少？', en: 'Draw one card, what is the probability of "East Wind"?' },
    data: { total: 52, target: 4, generatorType: 'PROBABILITY_SIMPLE_RANDOM' }, difficulty: 'Easy', reward: 300,
    storyConsequence: {
      correct: { zh: '东风如期而至！火攻大计成功，曹军战船陷入火海！', en: 'The East Wind arrives! The fire attack succeeds, Cao Cao\'s fleet burns!' },
      wrong: { zh: '东风未至...庞统建议先用连环计拖延时间，等待下一次机会。', en: 'The wind fails to come... Pang Tong suggests the chain strategy to buy time.' },
    },
    kpId: 'kp-8.1-01', sectionId: 'statistics',
    tutorialSteps: [
      {
        text: { zh: '庞统："52 张卦牌中有 4 张东风。概率 = 目标数 / 总数。"', en: 'Pang Tong: "4 East Wind cards out of 52. Probability = target / total."' },
        highlightField: 'p'
      },
      {
        text: { zh: '庞统："$P = 4/52 = 1/13$"', en: 'Pang Tong: "$P = 4/52 = 1/13$"' },
        hint: { zh: '4 和 52 的最大公约数是 4', en: 'GCD of 4 and 52 is 4' },
        highlightField: 'p'
      },
      {
        text: { zh: '庞统："概率为 $1/13$！万事俱备，只欠东风。"', en: 'Pang Tong: "Probability is $1/13$! Everything is ready, except the wind."' },
        highlightField: 'p'
      }
    ],
    secret: { concept: { zh: '概率等于目标事件数除以总事件数。', en: 'Probability is target events divided by total events.' }, formula: '$P(A) = n(A) / n(S)$', tips: [{ zh: '庞统提示：万事俱备，只欠东风。', en: 'Pang Tong Tip: Everything is ready, except the wind.' }] }
  },
  {
    id: 1032, grade: 10, unitId: 3, order: 2,
    unitTitle: { zh: "Unit 3: 天命占卜与概率", en: "Unit 3: Divination & Probability" },
    topic: 'Algebra', type: 'PROBABILITY',
    title: { zh: '连环计', en: 'Chain Link Strategy' },
    skillName: { zh: '独立事件术', en: 'Independent Events' },
    skillSummary: { zh: '独立事件同时发生：P = P₁ × P₂', en: 'Independent events: P = P₁ × P₂' },
    story: { zh: '庞统献连环计。已知单艘船着火概率为 {p1}，两艘独立战船同时着火的概率是多少？', en: 'Pang Tong suggests the chain link. Prob of one ship burning is {p1}. Prob of two independent ships burning?' },
    description: { zh: '计算独立事件同时发生的概率：$P(A \\cap B) = P(A) \\times P(B)$。', en: 'Calculate prob of independent events: $P(A \\cap B) = P(A) \\times P(B)$.' },
    data: { p1: 0.6, p2: 0.6, generatorType: 'PROBABILITY_IND_RANDOM' }, difficulty: 'Medium', reward: 350,
    kpId: 'kp-8.3-02', sectionId: 'statistics',
    tutorialSteps: [
      {
        text: { zh: '庞统："每艘船着火概率 0.6。两船独立，联合概率用乘法。"', en: 'Pang Tong: "Each ship burns with probability 0.6. They are independent, use multiplication."' },
        highlightField: 'p'
      },
      {
        text: { zh: '庞统："$P(A \\cap B) = P(A) \\times P(B) = 0.6 \\times 0.6$"', en: 'Pang Tong: "$P(A \\cap B) = P(A) \\times P(B) = 0.6 \\times 0.6$"' },
        hint: { zh: '0.6 乘以 0.6 等于多少？', en: 'What is 0.6 times 0.6?' },
        highlightField: 'p'
      },
      {
        text: { zh: '庞统："$P = 0.36$！铁索连舟后，概率直接变为 1。连环计，妙哉！"', en: 'Pang Tong: "$P = 0.36$! With chains linking ships, probability becomes 1. Chain strategy, brilliant!"' },
        highlightField: 'p'
      }
    ],
    secret: { concept: { zh: '独立事件的联合概率是各自概率的乘积。', en: 'Joint probability of independent events is the product of their probabilities.' }, formula: '$P(A \\text{ and } B) = P(A) \\cdot P(B)$', tips: [{ zh: '庞统提示：铁索连舟，火势一发不可收拾。', en: 'Pang Tong Tip: Chain the boats, and the fire will be unstoppable.' }] }
  },
  {
    id: 1033, grade: 10, unitId: 3, order: 3,
    unitTitle: { zh: "Unit 3: 天命占卜与概率", en: "Unit 3: Divination & Probability" },
    topic: 'Algebra', type: 'PROBABILITY',
    title: { zh: '华容道伏兵', en: 'Huarong Pass Ambush' },
    skillName: { zh: '简单概率术', en: 'Simple Probability' },
    skillSummary: { zh: 'P = 目标数 / 总数', en: 'P = target / total' },
    story: { zh: '曹操败走华容道。{total} 条路中有 {target} 条设有伏兵。随机选一条，遇到伏兵的概率是多少？', en: 'Cao Cao retreats via Huarong Pass. {target} out of {total} paths have ambushes. Pick one at random, what is the probability of an ambush?' },
    description: { zh: '求遇到伏兵的概率 $P = {target}/{total}$。', en: 'Find the probability of ambush: $P = {target}/{total}$.' },
    data: { total: 27, target: 19, generatorType: 'PROBABILITY_SIMPLE_RANDOM' }, difficulty: 'Hard', reward: 450,
    kpId: 'kp-8.1-02', sectionId: 'statistics',
    tutorialSteps: [
      {
        text: { zh: '关羽："华容道共 27 条路，其中 19 条有伏兵。"', en: 'Guan Yu: "Huarong Pass has 27 paths, 19 of which have ambushes."' },
        highlightField: 'p'
      },
      {
        text: { zh: '关羽："概率 $P = \\frac{\\text{伏兵路数}}{\\text{总路数}} = \\frac{19}{27}$"', en: 'Guan Yu: "Probability $P = \\frac{\\text{ambush paths}}{\\text{total paths}} = \\frac{19}{27}$"' },
        hint: { zh: '用分数或小数作答', en: 'Answer as a fraction or decimal' },
        highlightField: 'p'
      },
      {
        text: { zh: '关羽："$P ≈ 0.70$。义释曹操，天意如此！"', en: 'Guan Yu: "$P ≈ 0.70$. Releasing Cao Cao was fate!"' },
        highlightField: 'p'
      }
    ],
    secret: { concept: { zh: '简单概率：$P = \\frac{\\text{目标数}}{\\text{总数}}$。', en: 'Simple probability: $P = \\frac{\\text{target}}{\\text{total}}$.' }, formula: '$P = 19/27$', tips: [{ zh: '关羽提示：义薄云天，放他一马。', en: 'Guan Yu Tip: Loyalty as high as the sky, let him pass.' }] }
  },
  {
    id: 1041, grade: 10, unitId: 4, order: 1,
    unitTitle: { zh: "Unit 4: 水战风云与三角函数", en: "Unit 4: Naval Warfare & Trigonometry" },
    topic: 'Geometry', type: 'TRIGONOMETRY',
    title: { zh: '战船间距', en: 'Ship Distance' },
    skillName: { zh: '战船测距术', en: 'Ship Distance' },
    skillSummary: { zh: '用正弦值求斜边', en: 'Find hypotenuse using sine' },
    story: { zh: '江面上烟雾缭绕。已知我军旗舰与敌舰连线与江岸成 ${angle}^\\circ$ 角，对边距离为 {opposite} 丈。', en: "Mist on the river. The line between flagship and enemy is ${angle}^\\circ$ to the bank, opposite distance is {opposite}." },
    description: { zh: '求斜边距离 $c$。', en: 'Find hypotenuse distance $c$.' },
    data: { angle: 30, opposite: 50, func: 'sin', generatorType: 'TRIGONOMETRY_RANDOM' }, difficulty: 'Easy', reward: 400,
    kpId: 'kp-6.2-01', sectionId: 'geometry',
    tutorialSteps: [
      {
        text: { zh: '甘宁："赤壁江面烟雾弥漫，旗舰与敌舰连线成 $30^\\circ$，对边 50 丈。$\\sin$ 联系对边和斜边。"', en: 'Gan Ning: "Mist covers Red Cliffs. Line at $30^\\circ$, opposite is 50. $\\sin$ connects opposite and hypotenuse."' },
        highlightField: 'c'
      },
      {
        text: { zh: '甘宁："$\\sin(30^\\circ) = \\text{对边}/\\text{斜边} = 50/c$，即 $0.5 = 50/c$"', en: 'Gan Ning: "$\\sin(30^\\circ) = \\text{opp}/\\text{hyp} = 50/c$, so $0.5 = 50/c$"' },
        hint: { zh: '$c = 50 / 0.5$ = ?', en: '$c = 50 / 0.5$ = ?' },
        highlightField: 'c'
      },
      {
        text: { zh: '甘宁："$c = 100$ 丈！水战之中，距离就是生命！"', en: 'Gan Ning: "$c = 100$ units! In naval battle, distance is life!"' },
        highlightField: 'c'
      }
    ],
    secret: { concept: { zh: '正弦值是对边与斜边的比。', en: 'Sine is the ratio of opposite to hypotenuse.' }, formula: '$\\sin(\\theta) = \\text{opp} / \\text{hyp}$', tips: [{ zh: '甘宁提示：水战之中，距离就是生命！', en: 'Gan Ning Tip: In naval battle, distance is life!' }] }
  },
  {
    id: 1042, grade: 10, unitId: 4, order: 2,
    unitTitle: { zh: "Unit 4: 水战风云与三角函数", en: "Unit 4: Naval Warfare & Trigonometry" },
    topic: 'Geometry', type: 'TRIGONOMETRY',
    title: { zh: '旗舰夹角', en: 'Flagship Angle' },
    skillName: { zh: '旗舰夹角术', en: 'Flagship Angle' },
    skillSummary: { zh: '反正切求角度', en: 'Find angle using inverse tangent' },
    story: { zh: '计算旗舰与护卫舰的夹角。已知对边 {opposite} 丈，邻边 {adjacent} 丈。', en: 'Calculate the angle between flagship and escort. Opposite {opposite}, adjacent {adjacent}.' },
    description: { zh: '求角度 $\\theta$。', en: 'Find angle $\\theta$.' },
    data: { opposite: 30, adjacent: 30, func: 'tan_inv', generatorType: 'TRIGONOMETRY_RANDOM' }, difficulty: 'Medium', reward: 650,
    kpId: 'kp-6.2-01', sectionId: 'geometry',
    tutorialSteps: [
      {
        text: { zh: '甘宁："旗舰与护卫舰的位置关系——对边 30，邻边 30。先求正切值。"', en: 'Gan Ning: "Position between flagship and escort — opposite 30, adjacent 30. First find the tangent."' },
        highlightField: 'angle'
      },
      {
        text: { zh: '甘宁："$\\tan(\\theta) = 30/30 = 1$。什么角度的正切值等于 1？"', en: 'Gan Ning: "$\\tan(\\theta) = 30/30 = 1$. What angle has tangent equal to 1?"' },
        hint: { zh: '$\\tan(45^\\circ) = 1$', en: '$\\tan(45^\\circ) = 1$' },
        highlightField: 'angle'
      },
      {
        text: { zh: '甘宁："$\\theta = 45^\\circ$！火攻之势，在于风向与角度的完美契合。"', en: 'Gan Ning: "$\\theta = 45^\\circ$! The power of fire lies in the perfect match of wind and angle."' },
        highlightField: 'angle'
      }
    ],
    secret: { concept: { zh: '正切值为1时，角度为 45 度。', en: 'When tangent is 1, the angle is 45 degrees.' }, formula: '$\\theta = \\arctan(a/b)$', tips: [{ zh: '甘宁提示：火攻之势，在于风向与角度的完美契合。', en: 'Gan Ning Tip: The power of fire lies in the perfect match of wind and angle.' }] }
  },
  {
    id: 1043, grade: 10, unitId: 4, order: 3,
    unitTitle: { zh: "Unit 4: 水战风云与三角函数", en: "Unit 4: Naval Warfare & Trigonometry" },
    topic: 'Geometry', type: 'TRIGONOMETRY',
    title: { zh: '火攻仰角', en: 'Fire Attack Angle' },
    skillName: { zh: '火攻仰角术', en: 'Fire Attack Angle' },
    skillSummary: { zh: '反正切求仰角', en: 'Find elevation angle using inverse tangent' },
    story: { zh: "火船冲向曹营。已知火船与曹营水平距离 {adjacent} 丈，高度差 {opposite} 丈。", en: "Fire ships rush Cao's camp. Horizontal distance {adjacent}, height difference {opposite}." },
    description: { zh: '求仰角 $\\theta$。', en: 'Find elevation angle $\\theta$.' },
    data: { opposite: 100, adjacent: 100, func: 'tan_inv', generatorType: 'TRIGONOMETRY_RANDOM' }, difficulty: 'Hard', reward: 700,
    kpId: 'kp-6.2-01', sectionId: 'geometry',
    tutorialSteps: [
      {
        text: { zh: '甘宁："火船冲向曹营！水平距 100 丈，高度差 100 丈。求仰角。"', en: 'Gan Ning: "Fire ships charge Cao\'s camp! Horizontal distance 100, height difference 100. Find elevation angle."' },
        highlightField: 'angle'
      },
      {
        text: { zh: '甘宁："$\\tan(\\theta) = \\text{对边}/\\text{邻边} = 100/100 = 1$"', en: 'Gan Ning: "$\\tan(\\theta) = \\text{opposite}/\\text{adjacent} = 100/100 = 1$"' },
        hint: { zh: '$\\arctan(1) = ?$ 度', en: '$\\arctan(1) = ?$ degrees' },
        highlightField: 'angle'
      },
      {
        text: { zh: '甘宁："$\\theta = 45^\\circ$！百骑劫营，出奇制胜！"', en: 'Gan Ning: "$\\theta = 45^\\circ$! A hundred riders raid the camp, winning by surprise!"' },
        highlightField: 'angle'
      }
    ],
    secret: { concept: { zh: '正切值等于对边除以邻边。', en: 'Tangent equals opposite divided by adjacent.' }, formula: '$\\tan(\\theta) = 1 \\Rightarrow \\theta = 45^\\circ$', tips: [{ zh: '甘宁提示：百骑劫营，出奇制胜。', en: 'Gan Ning Tip: A hundred riders raid the camp, winning by surprise.' }] }
  },
  {
    id: 1051, grade: 10, unitId: 5, order: 1,
    unitTitle: { zh: "Unit 5: 等差军阵与序列", en: "Unit 5: Military Formations & Sequences" },
    topic: 'Algebra', type: 'ARITHMETIC',
    title: { zh: '赤壁增兵', en: 'Red Cliffs Reinforcements' },
    skillName: { zh: '等差数列术', en: 'Arithmetic Sequence' },
    skillSummary: { zh: 'aₙ = a₁ + (n-1)d', en: 'aₙ = a₁ + (n-1)d' },
    story: { zh: '孙刘联军持续增兵。第一日到达 {a1} 人，此后每日增加 {d} 人。', en: 'The Sun-Liu alliance receives reinforcements. Day 1: {a1} troops, increasing by {d} daily.' },
    description: { zh: '求第 {n} 日的增兵人数。$a_n = a_1 + (n-1)d$', en: 'Find reinforcements on Day {n}. $a_n = a_1 + (n-1)d$' },
    data: { a1: 200, d: 150, n: 8, generatorType: 'ARITHMETIC_RANDOM' }, difficulty: 'Easy', reward: 300,
    kpId: 'kp-2.7-01', sectionId: 'algebra',
    tutorialSteps: [
      {
        text: { zh: '鲁肃："联军增兵有序，首日 200，日增 150。这是等差数列！"', en: 'Lu Su: "Reinforcements follow a pattern. Day 1: 200, +150 daily. An arithmetic sequence!"' },
        highlightField: 'ans'
      },
      {
        text: { zh: '鲁肃："通项公式 $a_n = a_1 + (n-1)d = 200 + 7 \\times 150$"', en: 'Lu Su: "General term: $a_n = a_1 + (n-1)d = 200 + 7 \\times 150$"' },
        hint: { zh: '200 + 1050 = ?', en: '200 + 1050 = ?' },
        highlightField: 'ans'
      },
      {
        text: { zh: '鲁肃："第 8 日增兵 1250 人！兵力充沛，可以开战了！"', en: 'Lu Su: "Day 8: 1250 troops! Forces are sufficient, time to fight!"' },
        highlightField: 'ans'
      }
    ],
    secret: { concept: { zh: '等差数列通项公式：$a_n = a_1 + (n-1)d$', en: 'Arithmetic sequence: $a_n = a_1 + (n-1)d$' }, formula: '$a_n = a_1 + (n-1)d$', tips: [{ zh: '鲁肃提示：兵马未动，粮草先行。', en: 'Lu Su Tip: Before troops move, supplies go first.' }] }
  },
  {
    id: 1052, grade: 10, unitId: 5, order: 2,
    unitTitle: { zh: "Unit 5: 等差军阵与序列", en: "Unit 5: Military Formations & Sequences" },
    topic: 'Algebra', type: 'ARITHMETIC',
    title: { zh: '连弩齐射', en: 'Crossbow Volley' },
    skillName: { zh: '数列应用术', en: 'Sequence Application' },
    skillSummary: { zh: '等差数列求任意项', en: 'Find any term of arithmetic sequence' },
    story: { zh: '诸葛连弩部署。第一排 {a1} 架弩，每排增加 {d} 架。', en: 'Zhuge crossbows deployed. Row 1: {a1} crossbows, +{d} per row.' },
    description: { zh: '求第 {n} 排的弩机数量。', en: 'Find crossbows in Row {n}.' },
    data: { a1: 10, d: 6, n: 12, generatorType: 'ARITHMETIC_RANDOM' }, difficulty: 'Medium', reward: 400,
    kpId: 'kp-2.7-01', sectionId: 'algebra',
    tutorialSteps: [
      {
        text: { zh: '诸葛亮："连弩阵法，首排 10 架，逐排增 6。求第 12 排。"', en: 'Zhuge Liang: "Crossbow formation. Row 1: 10, +6 per row. Find Row 12."' },
        highlightField: 'ans'
      },
      {
        text: { zh: '诸葛亮："$a_{12} = 10 + (12-1) \\times 6 = 10 + 66$"', en: 'Zhuge Liang: "$a_{12} = 10 + (12-1) \\times 6 = 10 + 66$"' },
        hint: { zh: '10 + 66 = ?', en: '10 + 66 = ?' },
        highlightField: 'ans'
      },
      {
        text: { zh: '诸葛亮："76 架连弩齐射，万箭齐发！"', en: 'Zhuge Liang: "76 crossbows fire in unison, a storm of arrows!"' },
        highlightField: 'ans'
      }
    ],
    secret: { concept: { zh: '等差数列应用：排兵布阵。', en: 'Arithmetic sequences in formation planning.' }, formula: '$a_{12} = 10 + 11 \\times 6 = 76$', tips: [{ zh: '诸葛亮提示：连弩之威，在于密集。', en: 'Zhuge Tip: The power of crossbows is in their density.' }] }
  },
  {
    id: 1053, grade: 10, unitId: 5, order: 3,
    unitTitle: { zh: "Unit 5: 等差军阵与序列", en: "Unit 5: Military Formations & Sequences" },
    topic: 'Algebra', type: 'ARITHMETIC',
    title: { zh: '粮草消耗', en: 'Supply Depletion' },
    skillName: { zh: '数列推算术', en: 'Sequence Calculation' },
    skillSummary: { zh: '首项、公差、项数三要素', en: 'First term, common difference, term number' },
    story: { zh: '赤壁战后统计粮草消耗。第一日消耗 {a1} 石，每日增加 {d} 石。持续 {n} 日。', en: 'Post-battle supply audit. Day 1: {a1} units consumed, +{d} daily for {n} days.' },
    description: { zh: '求第 {n} 日的消耗量。', en: 'Find consumption on Day {n}.' },
    data: { a1: 300, d: 20, n: 15, generatorType: 'ARITHMETIC_RANDOM' }, difficulty: 'Hard', reward: 500,
    kpId: 'kp-2.7-01', sectionId: 'algebra',
    tutorialSteps: [
      {
        text: { zh: '张昭："赤壁大捷，但粮草消耗惊人。首日 300 石，日增 20 石。"', en: 'Zhang Zhao: "Great victory at Red Cliffs, but supply costs are alarming. Day 1: 300, +20 daily."' },
        highlightField: 'ans'
      },
      {
        text: { zh: '张昭："第 15 日：$a_{15} = 300 + 14 \\times 20 = 300 + 280$"', en: 'Zhang Zhao: "Day 15: $a_{15} = 300 + 14 \\times 20 = 300 + 280$"' },
        hint: { zh: '300 + 280 = ?', en: '300 + 280 = ?' },
        highlightField: 'ans'
      },
      {
        text: { zh: '张昭："580 石！主公，必须精打细算，方能长久。"', en: 'Zhang Zhao: "580 units! My lord, we must budget carefully to sustain."' },
        highlightField: 'ans'
      }
    ],
    secret: { concept: { zh: '等差数列在实际问题中的应用。', en: 'Arithmetic sequences in real-world problems.' }, formula: '$a_{15} = 300 + 14 \\times 20 = 580$', tips: [{ zh: '张昭提示：内政之要，在于精算。', en: 'Zhang Zhao Tip: The key to governance is precise calculation.' }] }
  },

  // --- Year 11: Northern Expedition (Advanced) ---
  {
    id: 1111, grade: 11, unitId: 1, order: 1,
    unitTitle: { zh: "Unit 1: 出师表与微分优化", en: "Unit 1: Memorial & Differentiation" },
    topic: 'Calculus', type: 'QUADRATIC',
    title: { zh: '出师北伐', en: 'Northern Expedition' },
    skillName: { zh: '出师推演术', en: 'Campaign Projection' },
    skillSummary: { zh: '求顶点找最优解', en: 'Find vertex for optimal solution' },
    story: { zh: "诸葛亮六出祁山，需优化粮草运输路径。路径损耗函数为 $f(x) = -x^2 + 8x$。", en: "Zhuge Liang's expeditions need optimal supply routes. Loss function: $f(x) = -x^2 + 8x$." },
    description: { zh: '求 $f(x)$ 达到最大值时的 $x$（即导数为0的点）。', en: 'Find $x$ where $f(x)$ is maximum (derivative is 0).' },
    data: { p1: [0, 0], p2: [4, 16], generatorType: 'QUADRATIC_RANDOM' }, difficulty: 'Hard', reward: 800,
    kpId: 'kp-2.12-01', sectionId: 'algebra',
    tutorialSteps: [
      {
        text: { zh: '诸葛亮："路径损耗 $f(x) = -x^2 + 8x$，这是二次函数，$a=-1$, $b=8$。"', en: 'Zhuge Liang: "Path loss $f(x) = -x^2 + 8x$, a quadratic with $a=-1$, $b=8$."' },
        highlightField: 'x'
      },
      {
        text: { zh: '诸葛亮："顶点处取最大值：$x = -b/(2a) = -8/(2 \\times -1) = 4$"', en: 'Zhuge Liang: "Maximum at vertex: $x = -b/(2a) = -8/(2 \\times -1) = 4$"' },
        hint: { zh: '$-8 / -2$ 等于多少？', en: 'What is $-8 / -2$?' },
        highlightField: 'x'
      },
      {
        text: { zh: '诸葛亮："$x = 4$！鞠躬尽瘁，死而后已。运输之利，在于精微。"', en: 'Zhuge Liang: "$x = 4$! Devoted to the end. The key to transport is precision."' },
        highlightField: 'x'
      }
    ],
    secret: { concept: { zh: '导数为零的点可能是函数的极值点。', en: 'Points where derivative is zero can be extrema.' }, formula: "$f'(x) = 0$", tips: [{ zh: '诸葛亮提示：鞠躬尽瘁，死而后已。运输之利，在于精微。', en: 'Zhuge Tip: Devoted to the end. The key to transport is precision.' }] }
  },
  {
    id: 1112, grade: 11, unitId: 1, order: 2,
    unitTitle: { zh: "Unit 1: 出师表与微分优化", en: "Unit 1: Memorial & Differentiation" },
    topic: 'Calculus', type: 'DERIVATIVE',
    title: { zh: '剑阁栈道', en: 'Jiange Pass' },
    skillName: { zh: '栈道极值术', en: 'Mountain Pass Optimization' },
    skillSummary: { zh: '求导数得切线斜率', en: 'Differentiate to find tangent slope' },
    story: { zh: '蜀军修筑栈道。山坡曲线为 $y = x^2$。在点 $({x}, {x}^2)$ 处需修筑一条切线支架。', en: 'Shu army builds a plank road. Slope curve $y = x^2$. Build a tangent support at $({x}, {x}^2)$.' },
    description: { zh: '求切线的斜率 $k$（即 $y=x^2$ 在 $x={x}$ 处的导数）。', en: 'Find tangent slope $k$ (derivative of $y=x^2$ at $x={x}$).' },
    data: { x: 2, func: 'x^2', generatorType: 'DERIVATIVE_RANDOM' }, difficulty: 'Hard', reward: 850,
    kpId: 'kp-2.12-01', sectionId: 'algebra',
    tutorialSteps: [
      {
        text: { zh: '姜维："山坡曲线 $y = x^2$，在 $(2,4)$ 处求切线斜率。先求导数。"', en: 'Jiang Wei: "Slope curve $y = x^2$, find tangent slope at $(2,4)$. First differentiate."' },
        highlightField: 'k'
      },
      {
        text: { zh: '姜维："$y\' = 2x$。在 $x=2$ 处：$k = 2 \\times 2$"', en: 'Jiang Wei: "$y\' = 2x$. At $x=2$: $k = 2 \\times 2$"' },
        hint: { zh: '2 乘以 2 等于多少？', en: 'What is 2 times 2?' },
        highlightField: 'k'
      },
      {
        text: { zh: '姜维："$k = 4$！栈道险峻，支架必须稳固。"', en: 'Jiang Wei: "$k = 4$! The plank road is steep, the support must be stable."' },
        highlightField: 'k'
      }
    ],
    secret: { concept: { zh: '导数代表曲线在某一点的切线斜率。', en: 'Derivative is the slope of the tangent at a point.' }, formula: "$(x^n)' = nx^{n-1}$", tips: [{ zh: '姜维提示：栈道险峻，支架必须稳固。', en: 'Jiang Wei Tip: The plank road is steep, the support must be stable.' }] }
  },
  {
    id: 1121, grade: 11, unitId: 2, order: 1,
    unitTitle: { zh: "Unit 2: 屯田与定积分", en: "Unit 2: Farming & Integration" },
    topic: 'Calculus', type: 'INTEGRATION',
    title: { zh: '测量农田', en: 'Surveying Farmland' },
    skillName: { zh: '农田丈量术', en: 'Field Measurement' },
    skillSummary: { zh: '定积分求面积', en: 'Find area using definite integral' },
    story: { zh: '在汉中屯田。农田边界由 $y = x$ 和 $x$ 轴以及 $x={upper}$ 围成。', en: 'Farming in Hanzhong. Field bounded by $y=x$, x-axis, and $x={upper}$.' },
    description: { zh: '求该区域的面积。', en: 'Find the area of the region.' },
    data: { lower: 0, upper: 4, func: 'x', generatorType: 'INTEGRATION_RANDOM' }, difficulty: 'Hard', reward: 900,
    kpId: 'kp-2.12-01', sectionId: 'algebra',
    tutorialSteps: [
      {
        text: { zh: '邓艾："农田由 $y=x$、$x$ 轴和 $x=4$ 围成。用积分求面积。"', en: 'Deng Ai: "Field bounded by $y=x$, x-axis, and $x=4$. Use integration for area."' },
        highlightField: 'area'
      },
      {
        text: { zh: '邓艾："$\\int_0^4 x\\,dx = [\\frac{1}{2}x^2]_0^4 = \\frac{1}{2}(4^2) - \\frac{1}{2}(0^2)$"', en: 'Deng Ai: "$\\int_0^4 x\\,dx = [\\frac{1}{2}x^2]_0^4 = \\frac{1}{2}(4^2) - \\frac{1}{2}(0^2)$"' },
        hint: { zh: '$\\frac{1}{2} \\times 16 = ?$', en: '$\\frac{1}{2} \\times 16 = ?$' },
        highlightField: 'area'
      },
      {
        text: { zh: '邓艾："面积为 8！屯田之计，在于地利。"', en: 'Deng Ai: "Area is 8! The plan for farming lies in the advantage of the land."' },
        highlightField: 'area'
      }
    ],
    secret: { concept: { zh: '定积分可以计算曲线下的面积。', en: 'Definite integral calculates the area under a curve.' }, formula: '$\\int x dx = \\frac{1}{2}x^2$', tips: [{ zh: '邓艾提示：屯田之计，在于地利。', en: "Deng Ai Tip: The plan for farming lies in the advantage of the land." }] }
  },
  {
    id: 1122, grade: 11, unitId: 2, order: 2,
    unitTitle: { zh: "Unit 2: 屯田与定积分", en: "Unit 2: Farming & Integration" },
    topic: 'Calculus', type: 'INTEGRATION',
    title: { zh: '河道流量', en: 'River Flow' },
    skillName: { zh: '河道流量术', en: 'River Flow' },
    skillSummary: { zh: '积分求总流量', en: 'Find total flow using integration' },
    story: { zh: '计算河道流量。流速函数为 $v(t) = 3t^2$。', en: 'Calculate river flow. Velocity function: $v(t) = 3t^2$.' },
    description: { zh: '求总流量。', en: 'Find total flow.' },
    data: { lower: 0, upper: 2, func: '3x^2', generatorType: 'INTEGRATION_RANDOM' }, difficulty: 'Hard', reward: 950,
    kpId: 'kp-2.12-01', sectionId: 'algebra',
    tutorialSteps: [
      {
        text: { zh: '钟会："流速函数 $v(t) = 3t^2$。积分求总流量。"', en: 'Zhong Hui: "Velocity function $v(t) = 3t^2$. Integrate to find total flow."' },
        highlightField: 'area'
      },
      {
        text: { zh: '钟会："$\\int_0^2 3t^2\\,dt = [t^3]_0^2 = 2^3 - 0^3$"', en: 'Zhong Hui: "$\\int_0^2 3t^2\\,dt = [t^3]_0^2 = 2^3 - 0^3$"' },
        hint: { zh: '$2^3$ 等于多少？', en: 'What is $2^3$?' },
        highlightField: 'area'
      },
      {
        text: { zh: '钟会："总流量为 8！水流湍急，需精确计算。"', en: 'Zhong Hui: "Total flow is 8! The water is swift, precise calculation is needed."' },
        highlightField: 'area'
      }
    ],
    secret: { concept: { zh: '积分是导数的逆运算。', en: 'Integration is the inverse of differentiation.' }, formula: '$\\int x^2 dx = \\frac{1}{3}x^3$', tips: [{ zh: '钟会提示：水流湍急，需精确计算。', en: 'Zhong Hui Tip: The water is swift, precise calculation is needed.' }] }
  },
  {
    id: 1131, grade: 11, unitId: 3, order: 1,
    unitTitle: { zh: "Unit 3: 粮草序列", en: "Unit 3: Supply Sequences" },
    topic: 'Algebra', type: 'ARITHMETIC',
    title: { zh: '运粮序列', en: 'Supply Line' },
    skillName: { zh: '数列预测术', en: 'Sequence Prediction' },
    skillSummary: { zh: '用等差公式预测未来值', en: 'Predict future values with arithmetic formula' },
    story: { zh: '运粮队每日增加 {d} 担粮。第一日 {a1} 担。', en: 'Supply team increases by {d} units daily. Day 1 is {a1}.' },
    description: { zh: '求第 {n} 日的运粮量。', en: 'Find the supply amount on Day {n}.' },
    data: { a1: 100, d: 50, n: 10, generatorType: 'ARITHMETIC_RANDOM' }, difficulty: 'Medium', reward: 400,
    kpId: 'kp-2.7-01', sectionId: 'algebra',
    tutorialSteps: [
      {
        text: { zh: '费祎："运粮队每日增加 50 担，第一日 100 担。等差数列问题！"', en: 'Fei Yi: "Daily increase of 50 units, Day 1 is 100. Arithmetic sequence!"' },
        highlightField: 'ans'
      },
      {
        text: { zh: '费祎："$a_n = a_1 + (n-1)d = 100 + (10-1) \\times 50$"', en: 'Fei Yi: "$a_n = a_1 + (n-1)d = 100 + (10-1) \\times 50$"' },
        hint: { zh: '$9 \\times 50 = 450$，再加 100', en: '$9 \\times 50 = 450$, then add 100' },
        highlightField: 'ans'
      },
      {
        text: { zh: '费祎："$a_{10} = 550$ 担！粮草充足，军心方稳。"', en: 'Fei Yi: "$a_{10} = 550$ units! With sufficient supplies, the army\'s morale is stable."' },
        highlightField: 'ans'
      }
    ],
    secret: { concept: { zh: '等差数列通项公式：$a_n = a_1 + (n-1)d$。', en: 'Arithmetic sequence formula: $a_n = a_1 + (n-1)d$.' }, formula: '$a_{10} = 100 + 9 \\times 50$', tips: [{ zh: '费祎提示：粮草充足，军心方稳。', en: "Fei Yi Tip: With sufficient supplies, the army's morale is stable." }] }
  },

  // --- Year 12: The Final Stand (Grand Unification) ---
  {
    id: 1211, grade: 12, unitId: 1, order: 1,
    unitTitle: { zh: "Unit 1: 归晋与综合微积分", en: "Unit 1: Unification & Advanced Calculus" },
    topic: 'Calculus', type: 'DERIVATIVE',
    title: { zh: '最后的防线', en: 'The Final Stand' },
    skillName: { zh: '防线极值术', en: 'Defense Optimization' },
    skillSummary: { zh: '令导数为零求极值', en: 'Set derivative to zero for extremum' },
    story: { zh: '守卫成都。城墙受力函数为 $f(x) = x^3 - 3x$。', en: 'Defending Chengdu. Wall stress function: $f(x) = x^3 - 3x$.' },
    description: { zh: '求函数的极小值点 $x$（$x > 0$）。', en: 'Find the local minimum point $x$ ($x > 0$).' },
    data: { x: 1, func: '3x^2-3', generatorType: 'DERIVATIVE_RANDOM' }, difficulty: 'Hard', reward: 1000,
    kpId: 'kp-2.12-01', sectionId: 'algebra',
    tutorialSteps: [
      {
        text: { zh: '刘禅："城墙受力 $f(x) = x^3 - 3x$。求导数 $f\'(x)$，令其为零。"', en: 'Liu Shan: "Wall stress $f(x) = x^3 - 3x$. Find $f\'(x)$ and set it to zero."' },
        highlightField: 'x'
      },
      {
        text: { zh: '刘禅："$f\'(x) = 3x^2 - 3 = 0 \\Rightarrow x^2 = 1$"', en: 'Liu Shan: "$f\'(x) = 3x^2 - 3 = 0 \\Rightarrow x^2 = 1$"' },
        hint: { zh: '$x > 0$，所以 $x = ?$', en: '$x > 0$, so $x = ?$' },
        highlightField: 'x'
      },
      {
        text: { zh: '刘禅："$x = 1$！此间乐，不思蜀。但防线还是要守的。"', en: 'Liu Shan: "$x = 1$! I am happy here. But the defense must be held."' },
        highlightField: 'x'
      }
    ],
    secret: { concept: { zh: '二阶导数大于零的点为极小值点。', en: 'Points where the second derivative is positive are local minima.' }, formula: "$f'(x) = 3x^2 - 3 = 0 \\Rightarrow x = 1$", tips: [{ zh: "刘禅提示：此间乐，不思蜀。但防线还是要守的。", en: "Liu Shan Tip: I am happy here and don't miss Shu. But the defense must be held." }] }
  },
  {
    id: 1221, grade: 12, unitId: 2, order: 1,
    unitTitle: { zh: "Unit 2: 战后统计", en: "Unit 2: Post-War Statistics" },
    topic: 'Statistics', type: 'PROBABILITY',
    title: { zh: '胜率评估', en: 'Win Rate Assessment' },
    skillName: { zh: '概率评估术', en: 'Probability Assessment' },
    skillSummary: { zh: '多次独立事件的联合概率', en: 'Joint probability of multiple independent events' },
    story: { zh: '评估统一天下的概率。已知魏国每次胜率为 {p1}。', en: 'Assess the probability of unification. Wei win rate is {p1} each time.' },
    description: { zh: '若发生两次独立战争，魏国全胜的概率是多少？', en: 'If two independent wars occur, what is the probability of Wei winning both?' },
    data: { p1: 0.7, p2: 0.7, generatorType: 'PROBABILITY_IND_RANDOM' }, difficulty: 'Medium', reward: 500,
    kpId: 'kp-8.3-02', sectionId: 'statistics',
    tutorialSteps: [
      {
        text: { zh: '司马炎："魏国每次胜率 0.7。两次独立战争全胜，用乘法原理。"', en: 'Sima Yan: "Wei win rate is 0.7 each time. For both wins in independent wars, use multiplication."' },
        highlightField: 'p'
      },
      {
        text: { zh: '司马炎："$P = 0.7 \\times 0.7$"', en: 'Sima Yan: "$P = 0.7 \\times 0.7$"' },
        hint: { zh: '0.7 乘以 0.7 等于多少？', en: 'What is 0.7 times 0.7?' },
        highlightField: 'p'
      },
      {
        text: { zh: '司马炎："$P = 0.49$！天下大势，合久必分，分久必合。"', en: 'Sima Yan: "$P = 0.49$! The world\'s trend: unite after division, divide after union."' },
        highlightField: 'p'
      }
    ],
    secret: { concept: { zh: '独立事件的乘法原理。', en: 'Multiplication principle for independent events.' }, formula: '$0.7 \\times 0.7 = 0.49$', tips: [{ zh: "司马炎提示：天下大势，合久必分，分久必合。", en: "Sima Yan Tip: The world's trend is to unite after long division, and divide after long union." }] }
  }
];
