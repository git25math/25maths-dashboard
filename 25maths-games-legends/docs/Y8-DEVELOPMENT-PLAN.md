# Y8 课纲开发计划（v6.0.0 完成）

> **必读**: `docs/CONTRIBUTING.md` — 开发规范（金标准、叙事原则、审查标准、Bug 防范规则）
> **必读**: `docs/DEVELOPMENT-PLAN.md` — 项目全局 + 版本历程
> **必读**: `docs/BUG-POSTMORTEM.md` — 10 个 Bug 根因分析 + 9 条防范规则
> **参考**: `src/data/missions.ts` 中 grade:7 的关卡 + `src/utils/generateMission.ts` 中的生成器

---

## 一、Y8 完成状态（v6.0.0, 2026-03-20）

### ✅ 40 个 Y8 关卡全部完成

| 单元 | 关卡数 | 题型 | 生成器 | 教程步数 | 金标准 |
|------|--------|------|--------|---------|--------|
| Unit 1: 进军篇 (190 AD) | 4 | LINEAR, FUNC_VAL | 2 | 6-8 | ✅ |
| Unit 2: 攻城篇 (190 AD) | 4 | ANGLES, PYTHAGORAS | 2 | 6 | ✅ |
| Unit 3: 营地篇 (199 AD) | 5 | AREA, CIRCLE, VOLUME | 4 | 6 | ✅ |
| Unit 4: 治理篇 (200 AD) | 3 | PERCENTAGE, PERCENT_INTEREST | 2 | 6 | ✅ |
| Unit 5: 情报篇 (200 AD) | 6 | STATISTICS, PROBABILITY, SIMULTANEOUS | 5 | 6-7 | ✅ |
| Unit 6: 代数篇 (205 AD) | 8 | EXPAND, FACTORISE, INEQUALITY, SYMMETRY | 4 | 6 | ✅ |
| Unit 7: 图表篇 (207 AD) | 6 | SPEED, STD_FORM, RATIO | 3 | 6 | ✅ |
| Unit 8: 度量篇 (209 AD) | 4 | LINEAR, RATIO, SPEED | 3 | 6-8 | ✅ |

**教程语言重写 (4 批次)**：所有 18 个 Y8 生成器完成对话式重写，text-only 格式，WHY + 验算 + 叙事贯穿。

### 原始 10 个关卡（已升级）

原始 Y8 关卡 (811-842) 全部保留并升级：教程从 3-5 步提升到 6+ 步，全部达到金标准。

### Y8 对 Y7 的前置依赖（详细映射）

| Y7 关卡 | Y7 技能 | Y8 依赖方 | 依赖关系 |
|---------|---------|----------|---------|
| 745-746 | 坐标系(COORDINATES) | 811-813 线性方程图 | 必须理解 (x,y) 才能画线 |
| 696 | 两步方程(ax+b=c) | Y8 多步方程 | 基础解法 |
| 693 | 整数乘除(负×负=正) | Y8 负系数方程 | 负数运算 |
| 695,691 | BODMAS(含括号) | Y8 展开括号 | 运算顺序 |
| 707-710,692,690 | 分数四则+互转 | Y8 代数分数 | 分数基础 |
| 725-726 | 比例化简+分配 | Y8 正反比例 | 比例概念 |
| 719 | 化简同类项 | Y8 展开+化简 | 代数表达式 |
| 713-716 | 幂与根 | Y8 指数法则 | 幂的概念 |
| 761-763 | 周长+面积(含三角形) | Y8 圆面积+体积 | 面积公式基础 |
| 770-773 | 众数/均值/中位数/极差 | Y8 频率表统计 | 统计基础 |

---

## 二、Y8 三国叙事时间线

根据 `DEVELOPMENT-PLAN.md` 的史实编年：

| Y8 单元 | 三国历史阶段 | 年代 | 叙事角色 | 数学主题 |
|---------|------------|------|---------|---------|
| Unit 1: 进军篇 | 讨伐董卓·虎牢关 | 190 AD | 吕布、关羽、张飞 | 线性方程(行军路线) |
| Unit 2: 攻城篇 | 虎牢关攻防 | 190 AD | 三英战吕布 | 平行线角/勾股定理 |
| Unit 3: 营地篇 | 官渡之战前奏 | 199 AD | 曹操、袁绍 | 面积/体积(营地/粮仓) |
| Unit 4: 治理篇 | 官渡胜后治理 | 200 AD | 曹操、荀彧 | 百分比/利息(赋税) |
| Unit 5: 情报篇 | 官渡谍报 | 200 AD | 曹操情报系统 | 统计/概率(数据分析) |
| Unit 6: 代数篇 | 隆中对前奏 | 205 AD | 诸葛亮初登场 | 展开/因式分解/不等式 |
| Unit 7: 图表篇 | 天下形势图 | 207 AD | 诸葛亮隆中对 | 坐标图/方程图像 |
| Unit 8: 度量篇 | 荆州治理 | 209 AD | 刘备治荆州 | 速度时间/标准式/比例 |

> **注意**: 时间线严格按编年排列（190→199→200→205→207→209）。数学难度也递进。

---

## 三、Y8 CIE 0580 知识点 + 单元分组 + 关卡规划

### Tier 1: 必须覆盖（~30 关卡）

| 单元 | 知识点 | CIE Ref | 类型 | 关卡数 | ID 范围 |
|------|--------|---------|------|--------|---------|
| **Unit 1** | 线性方程 y=mx+c (重写811-813) | 2.10, 3.2 | LINEAR | 3 | 811-813 |
| **Unit 1** | 函数求值 f(x) | 2.2 | FUNC_VAL | 1 | 814 |
| **Unit 2** | 矩形/梯形面积 (重写821,823) | 5.2 | AREA | 2 | 821,823 |
| **Unit 2** | 圆周长和面积 | 5.2 | CIRCLE | 2 | 824-825 |
| **Unit 2** | 柱体体积 (重写822) | 5.2 | VOLUME | 1 | 822 |
| **Unit 3** | 百分比增减 (重写831-832) | 1.12 | PERCENTAGE | 2 | 831-832 |
| **Unit 3** | 单利/复利 | 1.12 | PERCENTAGE | 1 | 833 |
| **Unit 4** | 频率表/柱状图 | 9.3 | STATISTICS | 2 | 841-842 |
| **Unit 4** | 概率基础 | 8.1 | PROBABILITY | 2 | 843-844 |
| **Unit 5** | 展开单括号 a(b+c) | 2.2 | **EXPAND** (新) | 2 | 851-852 |
| **Unit 5** | 因式分解（提公因子）| 2.3 | **FACTORISE** (新) | 2 | 853-854 |
| **Unit 5** | 不等式 | 2.6 | **INEQUALITY** (新) | 2 | 855-856 |
| **Unit 6** | 平行线角度 | 4.3 | ANGLES | 2 | 861-862 |
| **Unit 6** | 勾股定理 | 6.1 | PYTHAGORAS | 2 | 863-864 |
| **Unit 7** | 速度/距离/时间 | 5.1 | **SPEED** (新) | 2 | 871-872 |
| **Unit 7** | 标准式 a×10^n | 1.8 | **STD_FORM** (新) | 2 | 873-874 |

### Tier 2: 重要补充（~10 关卡）

| 单元 | 知识点 | CIE Ref | 类型 | 关卡数 | ID 范围 |
|------|--------|---------|------|--------|---------|
| **Unit 7** | 正/反比例 | 1.11 | RATIO | 2 | 875-876 |
| **Unit 6** | 对称(线/旋转) | 7.1-7.2 | **SYMMETRY** (新) | 2 | 865-866 |
| **Unit 8** | 线性图绘制 | 3.2 | LINEAR | 2 | 881-882 |
| **Unit 5** | 二元方程（代入法）| 2.5 | SIMULTANEOUS | 2 | 857-858 |
| **Unit 8** | 交叉应用关卡 | 跨单元 | 混合 | 2 | 883-884 |

**总计: ~40 关卡 (10 重写 + ~30 新增)**

---

## 四、新增题型完整流程

添加一个新题型（如 `EXPAND`）需要修改 **7 个文件**，按此顺序：

```
1. src/types.ts
   → QuestionType 联合类型加 | 'EXPAND'

2. src/i18n/translations.ts
   → zh.questionTypes.EXPAND: "展开括号"
   → zh_TW.questionTypes.EXPAND: "展開括號"
   → en.questionTypes.EXPAND: "Expanding Brackets"

3. src/components/MathBattle/inputConfig.ts
   → INPUT_FIELDS.EXPAND: { zh: [...], en: [...] }

4. src/utils/checkCorrectness.ts
   → if (type === 'EXPAND') { ... return { correct, expected } }

5. src/utils/generateMission.ts
   → GeneratorType 加 | 'EXPAND_RANDOM'
   → GENERATOR_MAP 加 EXPAND_RANDOM: generateExpandMission
   → 文件末尾写 export function generateExpandMission(...)
   → 教程 ≥6 步（金标准）

6. src/data/missions.ts
   → 新 mission 对象（grade:8, data.generatorType:'EXPAND_RANDOM'）
   → BilingualText {zh, en}（繁体自动转换）

7. src/screens/PracticeScreen.tsx（可选）
   → 如有专属 SVG 图表，在 diagram 条件链中添加
```

---

## 五、5 轮审查检查清单

### 第 1 轮：功能正确性
- [ ] `npm run build` 零错误
- [ ] 每个新题型的 generator data 字段 ↔ checker 字段对齐
- [ ] 每个 mission 的 `generatorType` 在 GENERATOR_MAP 中有对应函数
- [ ] 无重复 mission ID（`grep -o 'id: [0-9]*' missions.ts | sort | uniq -d` 应为空）
- [ ] 每个新 QuestionType 在 inputConfig.ts 中有条目

### 第 2 轮：教程质量
- [ ] 每个生成器 ≥6 步教程
- [ ] 第 1 步是 WHY（不是定义/公式）
- [ ] 有验算步骤（最后 1-2 步）
- [ ] 无压缩计算（每步只做一个运算）
- [ ] 前置知识有铺垫（不假设学生已知）

### 第 3 轮：叙事与连贯性
- [ ] 每个 mission 的 story 字段自然融入三国叙事
- [ ] 角色语音一致（刘备=基础建设，曹操=治理经济，诸葛亮=策略分析...）
- [ ] 单元内关卡有叙事递进（不是独立的）
- [ ] storyConsequence 字段用在关键关卡
- [ ] 知识链条无断点（每个知识点有前置）

### 第 4 轮：UI 与渲染
- [ ] 手机端（375px）公式不溢出
- [ ] LatexText 中的 `$...$` 正确渲染
- [ ] FractionPie 加减号正确（如有分数关卡）
- [ ] SVG 图表在 green/amber 阶段正确显示
- [ ] 三语切换全部正常（简体→繁体→英文）

### 第 5 轮：最终验收
- [ ] play.25maths.com 部署成功
- [ ] Y8 每个关卡手动测试（练习模式 green→amber→red 完整流程）
- [ ] 闯关模式 5 题能正常完成
- [ ] 答错后 WrongAnswerPanel 显示正确解法
- [ ] Y7→Y8 过渡体验流畅（Y7 最后一关 → Y8 第一关）

---

## 六、Y7 完整关卡清单（参考标杆）

共 56 个 Y7 关卡：

```
Unit 0 数论: 698(因数) 699(质数) 700(因数树) 701(HCF) 702(LCM) 703(HCF应用)
Unit 0A 整数: 704(正+负) 705(负+负) 706(混合) 693(整数乘除)
Unit 0B 分数: 707(加) 708(减) 692(带→假) 690(假→带) 709(乘) 710(除) 694(F↔D↔P)
Unit 0C 幂与根: 713(²) 714(³) 715(√) 716(∛)
Unit 1 代数: 695(BODMAS) 691(括号) 711(x+a=b) 712(ax=b) 696(ax+b=c) 717(代入) 718(代入含幂) 719(化简)
Unit 2 比例: 721(比例) 722(等分) 723(百分比) 724(增减%) 725(化简比) 726(按比分配)
Unit 3 角度+坐标: 731(补角) 732(余角) 733(应用) 734(三角形) 735(周角) 745(坐标) 746(四象限)
Unit 4 数列: 741(下一项) 742(第n项) 743(递减)
Unit 5 估算: 751(十位) 752(百位)
Unit 6 周长面积: 761(周长) 762(矩形面积) 763(三角面积) 764(反推周长) 765(代入+面积)
Unit 7 统计: 770(众数) 771(均值) 772(中位数) 773(极差)
```

---

## 七、本轮开发中发现的重要 bug + 修复记录

| Bug | 严重性 | 修复 | 文件 |
|-----|--------|------|------|
| FracAdd 生成器随机加减号，不尊重 template op | CRITICAL | 改为读取 template.data.op | generateMission.ts:3110 |
| FractionPie 硬编码 `+` 运算符 | HIGH | 加 `op` prop | FractionPie.tsx |
| FractionPie step 映射偏移（step=0 时空白） | HIGH | step 0 显示第一个饼 | FractionPie.tsx |
| FractionPie maxHeight:360 裁剪通分行 | HIGH | 移除限制 + 缩小饼图 | FractionPie.tsx |
| 假分数结果只显示满圆 | MEDIUM | 多圆显示(整+余) | FractionPie.tsx |
| SVG text 中 \frac 不渲染 | MEDIUM | 改用 SVG 手绘分数线 | FractionPie.tsx |
| 公式文本溢出容器 | MEDIUM | LatexText inline-flex wrap | MathView.tsx |
| 3 个重复 mission ID (706,710) | HIGH | 改为 693,694,695 | missions.ts |
| src/audio/ 未提交导致部署失败 | CRITICAL | git add src/audio/ | 多文件 |
| mission 707/708 的 formula 用长中文\text{} | LOW | 改为数学公式 | missions.ts |

---

## 八、FractionPie step 映射规则

```
PracticeScreen 传入: step = tutorialStep (0-based, green阶段递增)

FractionPie 内部映射:
  step 0 → 显示第一个饼图（原始分母）
  step 1 → 显示第二个饼图 + 运算符
  step 2 → 通分行（两个饼都切成 LCD 份）+ "↓ 通分 (LCD=N) ↓"
  step 3 → 结果行（合并/相减的结果饼）+ SVG 带分数标签
  step 999 → 显示全部（amber 阶段）

假分数处理:
  resultN > lcd → 多个饼图：wholeCount 个满圆 + 1 个余数圆
  标签用 SVG 手绘（整数 + 分数线 + 分子分母），不用 LaTeX
```

---

## 九、核心架构速览

### 9.1 生成器分发机制

```typescript
// src/utils/generateMission.ts
export function generateMission(template: Mission, tier: DifficultyTier = 2): Mission {
  const genType = template.data?.generatorType as GeneratorType;
  if (!genType || !GENERATOR_MAP[genType]) return template;
  _currentTier = tier;               // 1=easy, 2=medium, 3=hard
  return GENERATOR_MAP[genType](template);  // 生成器覆盖 data + tutorialSteps + description
}
```

**关键点**: 生成器返回 `{ ...template, data, tutorialSteps, description }`。template 的 story/title/secret 保留不动。

### 9.2 模板变量插值

Mission 的 story/description 可以用 `{变量名}` 占位：
```
story: "刘备备了 {result} 坛酒。祭天用了 {a} 坛"
data: { a: 5, result: 12 }
→ 渲染时: "刘备备了 12 坛酒。祭天用了 5 坛"
```

PracticeScreen 中: `interpolate(mission.story[lang], mission.data)` 完成替换。

### 9.3 `data.answer` 快捷校验模式

多个 checker 支持 `data.answer` 优先级快捷方式，避免写复杂公式：
```typescript
if (type === 'PERCENTAGE') {
  if (data.answer !== undefined) {          // ← 快捷模式
    return { correct: Math.abs(parse(inputs.ans) - data.answer) < 0.01, ... };
  }
  // ... 原有复杂公式
}
```

已支持此模式的类型: PERCENTAGE, ESTIMATION, AREA, RATIO。新 Y8 类型建议也用此模式。

### 9.4 `order` 字段与解锁逻辑

```
MapScreen.tsx 中:
  const isLocked = mission.order > 1 && prevMission && !(prevComp && completed)
```

- `order` 控制同一 unitId 内的排列和解锁顺序
- `order` 可以是小数（如 8.3, 8.6）用于在已有关卡之间插入
- 第一个关卡 `order ≤ 1` 默认解锁

### 9.5 `secret` 字段结构

```typescript
secret: {
  concept: { zh: "核心概念...", en: "..." },    // Green 阶段底部显示
  formula: "$a^2 + b^2 = c^2$",                 // Green/Amber 阶段公式卡片
  tips: [{ zh: "角色提示...", en: "..." }]       // ScrollOfWisdom 锦囊妙计
}
```

显示位置: PracticeScreen Green 阶段左侧面板底部 + Amber 阶段顶部提示卡。

### 9.6 `storyConsequence` 触发机制

```typescript
storyConsequence?: {
  correct: { zh: "答对后的叙事", en: "..." },
  wrong: { zh: "答错后的叙事", en: "..." }
}
```

在 MathBattle/index.tsx 中，答对/答错后如果 mission 有此字段，会在结果面板显示叙事文本。

### 9.7 已有 SVG 图表组件库（可复用于 Y8）

| 组件 | 文件 | 适用类型 | Y8 可复用场景 |
|------|------|---------|-------------|
| AnimatedCoordinatePlane | diagrams/AnimatedCoordinatePlane.tsx | LINEAR | Y8 线性方程图 ✓ |
| AnimatedQuadraticPlane | diagrams/AnimatedQuadraticPlane.tsx | QUADRATIC | Y8 二次图 |
| ShortDivision | diagrams/ShortDivision.tsx | HCF, LCM | — |
| FactorTree | diagrams/FactorTree.tsx | FACTOR_TREE | — |
| AnimatedNumberLine | diagrams/AnimatedNumberLine.tsx | INTEGER_ADD | — |
| FractionPie | diagrams/FractionPie.tsx | FRAC_ADD, FRAC_MUL | Y8 代数分数 |
| NumberGrid | diagrams/NumberGrid.tsx | PRIME, SQUARE_CUBE, SQUARE_ROOT | — |
| BalanceScale | diagrams/BalanceScale.tsx | SIMPLE_EQ | Y8 不等式可改造 |
| AngleArc | diagrams/AngleArc.tsx | ANGLES | Y8 平行线角 ✓ |
| Triangle | diagrams/Triangle.tsx | (未集成) | Y8 勾股定理 ✓ |
| EquationSteps | diagrams/EquationSteps.tsx | SIMPLE_EQ (公式动画) | Y8 展开/因式分解 ✓ |

PracticeScreen 中的条件链（约 288-380 行）根据 `currentMission.type` 选择 SVG 组件。

---

## 十、Y9-Y11 遗留关卡

除了 Y7(690-773) 和 Y8(811-842)，还有 Y9-Y11 的旧关卡：

```
Y10: 1011-1053 (15 关卡，多种高阶题型)
Y11: 1111-1131 (5 关卡)
Y12: 1211-1221 (3 关卡)
```

**注意**: 这些关卡的教程质量极低（大部分 1-3 步），不要参照。开发 Y8 时可忽略，但不要删除或修改它们的 ID。

---

## 十一、已有 Y8 生成器的升级策略

现有 Y8 关卡使用的生成器（如 LINEAR_RANDOM, VOLUME_RANDOM 等）是**全年级共享**的。修改它们会影响 Y7 和 Y9+ 的关卡。

**推荐策略**:
- 如果现有生成器教程步数 ≥5 且质量达标 → 保留复用（如 PERCENTAGE_RANDOM 已有 6 步）
- 如果现有生成器教程步数 <5 → 创建 Y8 变体（如 `LINEAR_Y8_RANDOM`），不动原函数
- 如果是新题型 → 直接创建新生成器（如 `EXPAND_RANDOM`）

| 生成器 | 当前步数 | 策略 |
|--------|---------|------|
| LINEAR_RANDOM | 7 | ✅ 复用，教程已充足 |
| FUNC_VAL_RANDOM | 5 | ⚠️ 勉强可用，建议加验算 |
| AREA_RECT_RANDOM | 5 | ✅ 复用 |
| AREA_TRAP_RANDOM | 4 | ⚠️ 创建 Y8 变体或升级 |
| VOLUME_RANDOM | 3 | ❌ 需创建 Y8 变体 |
| PERCENTAGE_RANDOM | 6 | ✅ 复用 |
| STATISTICS_MEAN_RANDOM | 5 | ✅ 复用 |
| STATISTICS_MEDIAN_RANDOM | 5 | ✅ 复用 |

---

## 十二、金标准代码示例

一个完整的「好关卡」= mission 模板 + 生成器，参考 Y7 mission 698 + generateFactorsListMission：

**Mission 模板** (missions.ts):
```typescript
{
  id: 698, grade: 7, unitId: 0, order: -2,
  unitTitle: { zh: "Unit 0: 桃园点兵·数论篇", en: "Unit 0: Peach Garden — Number Theory" },
  topic: 'Algebra', type: 'FACTORS_LIST',
  title: { zh: '点兵编队', en: 'Troop Formation Count' },
  skillName: { zh: '因数列举术', en: 'Listing Factors' },
  skillSummary: { zh: '因数就是能整除一个数的数', en: 'Factors divide evenly' },
  story: { zh: '刘备刚招募了一批新兵...把所有可能的分法都找出来！', en: '...' },
  description: { zh: '这个数有几个因数？', en: 'How many factors?' },
  data: { n: 24, factors: [1,2,3,4,6,8,12,24], answer: 8,
          generatorType: 'FACTORS_LIST_RANDOM' },  // ← 关键: 指定生成器
  difficulty: 'Easy', reward: 35,
  kpId: 'kp-1.1-02', sectionId: 'number',
  tutorialSteps: [ ... ],  // 模板教程（生成器会覆盖）
  secret: { concept: {...}, formula: '...', tips: [{...}] }
}
```

**生成器** (generateMission.ts):
```typescript
export function generateFactorsListMission(template: Mission): Mission {
  const tier = getTier();           // 1/2/3 难度
  const n = pickRandom(pools[tier]); // 随机数字
  // ... 计算所有因数 ...

  const tutorialSteps = [
    // Step 1: WHY / 动机（用叙事引入）
    { text: { zh: "...新兵要编队...", en: "..." }, hint: { zh: "...", en: "..." } },
    // Step 2: 概念铺垫（什么是因数/整除）
    // Step 3-4: 微操作计算
    // Step 5: 答案
    // Step 6: 验算
  ];

  return {
    ...template,                    // 保留 story/title/secret
    description,                    // 覆盖描述（含新数字）
    data: { n, factors, answer, generatorType: 'FACTORS_LIST_RANDOM' },
    tutorialSteps,                  // 覆盖教程（含新数字的演算）
  };
}
```

---

## 十三、接手注意事项

1. **先 `npm run build` 确认零错误**
2. **Y7 是标杆**: 打开 play.25maths.com → Y7 → 任意关卡 → 练习模式 → 看教程流程
3. **生成器在文件末尾追加**: `src/utils/generateMission.ts` 已经 5000+ 行
4. **部署**: push main 自动触发 GitHub Actions → GitHub Pages
5. **三语**: 新关卡只需写 `{zh, en}`，繁体自动转换（`lt()` 函数）
6. **FractionPie**: 传 `op` 属性控制加减；step 从 0 开始
7. **音频**: `src/audio/` 模块（不是旧的 `src/hooks/useAudio.ts`）
8. **kpId**: 参考 `src/data/curriculum/kp-registry.ts`
9. **translations.ts**: 新增 questionType 时，zh + zh_TW + en 三处都要加
10. **INPUT_FIELDS**: 只有 zh/en，zh_TW 自动降级到 zh
11. **测试**: 本地 `npm run dev` 后在浏览器打开 localhost 测试
12. **ID 分配**: Y7 用 690-773，Y8 用 811-899，不要冲突
13. **grade 字段**: Y7 用 `grade: 7`，Y8 用 `grade: 8`
