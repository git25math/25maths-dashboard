# 开发规范（适用于任何开发者 / AI 工具）

> 本文档是 25Maths Play 项目的唯一权威规范。
> 无论你是人类开发者、Claude、Cursor、Copilot 还是其他 AI——都必须遵守此文档。
> 本文档存在于 git 仓库内，所有协作者均可读取。

---

## 一、项目概览

- **项目**: 25Maths Play — 三国故事化数学闯关学习平台
- **仓库**: `git25math/25maths-games-legends`
- **部署**: push main → GitHub Actions → https://play.25maths.com
- **技术栈**: React + TypeScript + Vite + Tailwind + KaTeX + Supabase
- **当前版本**: v6.0.0 (2026-03-20)

---

## 二、目标用户

**基础极其薄弱的中学生**，具体含义：

- 不知道"因数"是什么就直接教 HCF → **不行**，必须先教因数
- 看到 $3x$ 不知道是 $3 \times x$ → **必须解释"系数"**
- 不知道为什么三角形面积要除以 2 → **必须用"两个三角形拼长方形"解释 WHY**
- 做完题不知道对不对 → **每道题必须有验算步骤**

**核心原则**: 一切设计决策以"基础最薄弱的学生能否理解"为唯一标准。

---

## 三、教学质量金标准（7 条铁律）

每个生成器（generator）的教程（tutorialSteps）**必须**满足：

| # | 规则 | 说明 |
|---|------|------|
| 1 | **≥6 步教程** | 对标 generatePrimeMission（8 步） |
| 2 | **第 1 步 = WHY** | 不是定义/公式，而是"为什么要学这个" |
| 3 | **前 2 步 = 概念脚手架** | 用生活比喻搭建理解，不用抽象定义 |
| 4 | **中间步骤 = 微操作** | 每步只做一个运算，绝不压缩 |
| 5 | **倒数第 2 步 = 答案** | 明确给出计算结果 |
| 6 | **最后 1 步 = 验算** | 用反操作或代回原式检查 |
| 7 | **叙事贯穿始终** | 三国故事不只是开头一句，要融入每一步 |

### 反面示例（Anti-patterns）

| 错误做法 | 正确做法 |
|---------|---------|
| 先教公式再举例 | **先举例再总结公式** |
| 一行做两步计算 | **每步只做一个运算** |
| 用"系数"但不解释 | **先解释什么是系数** |
| 开头写"诸葛亮说"后面全是纯数学 | **叙事贯穿每一步** |
| 做完就完，不回头检查 | **最后一步必须验算** |
| SVG `<text>` 里写 `\frac{}{}` | **用 SVG 手绘分数线** |
| 修改共享生成器不考虑副作用 | **创建年级变体或检查所有使用方** |

---

## 四、叙事设计原则

**故事必须服务数学，数学必须从故事中自然产生。**

✓ "24 个新兵怎么分队？" → 自然引出因数概念
✗ "诸葛亮说：因数就是能整除的数" → 太抽象

✓ "敌人每天后退 5 里，连退 3 天" → 自然引出负数乘法
✗ "计算 (-5)×3" → 纯数学，无叙事

### 角色分配原则

| 角色 | 性格 | 适合的数学主题 |
|------|------|---------------|
| 刘备 | 基础建设、仁义 | 基础概念（因数、方程入门） |
| 关羽 | 实战、验证 | 分数运算、角度计算 |
| 张飞 | 直接、粗犷 | 整数运算、统计（极差） |
| 诸葛亮 | 策略、分析 | BODMAS、代入、坐标、序列 |
| 曹操 | 治理、经济 | 百分比、比例、赋税 |
| 赵云 | 精确、军事 | 代入含幂、远征推算 |

---

## 五、知识架构原则

- **每个知识点必须有前置依赖**（不能跳步）
- **跨单元要有交叉链接**（代数+几何、分数+统计）
- **新概念建立在旧概念之上**（因数→质数→因数树→HCF→LCM）
- **用旧知识解释新知识**（"化简比跟约分一样——HCF 又用上了！"）

---

## 六、新增关卡流程（7 个文件）

添加一个新题型必须按此顺序修改 7 个文件：

```
1. src/types.ts
   → QuestionType 联合类型加 | 'NEW_TYPE'

2. src/i18n/translations.ts
   → zh.questionTypes.NEW_TYPE: "中文名"
   → zh_TW.questionTypes.NEW_TYPE: "繁體名"
   → en.questionTypes.NEW_TYPE: "English Name"

3. src/components/MathBattle/inputConfig.ts
   → INPUT_FIELDS.NEW_TYPE: { zh: [...], en: [...] }

4. src/utils/checkCorrectness.ts
   → if (type === 'NEW_TYPE') { return { correct, expected } }

5. src/utils/generateMission.ts
   → GeneratorType 加 | 'NEW_TYPE_RANDOM'
   → GENERATOR_MAP 加 NEW_TYPE_RANDOM: generateNewTypeMission
   → 文件末尾写 export function generateNewTypeMission(...)
   → 教程必须 ≥6 步（金标准）

6. src/data/missions.ts
   → 新 mission 对象 { grade, unitId, order, type, data.generatorType, ... }
   → 文本用 BilingualText { zh, en }（繁体自动转换）

7. src/screens/PracticeScreen.tsx（可选）
   → 如有专属 SVG 图表，在 diagram 条件链中添加
```

---

## 七、三语支持

- **Language**: `'zh' | 'zh_TW' | 'en'`
- **BilingualText `{zh, en}` 不改**，繁体通过 `lt(text, lang)` 自动转换
- `src/i18n/zhHantMap.ts` 有 300 字简→繁映射表
- 新增 QuestionType 时，`translations.ts` 的 zh + zh_TW + en 三处都要加
- 组件内的 LABELS 对象需要 zh_TW 条目
- INPUT_FIELDS 只需 zh/en，zh_TW 自动降级到 zh

---

## 八、SVG 动画同步原则

SVG 图表必须**跟随教程步骤逐步揭示**：

- `step` 参数从 **0** 开始（与 tutorialStep 对齐）
- step=0 必须有有意义的内容（不能空白）
- amber 阶段传 `step=999` 显示全部
- SVG 内**不能用 LaTeX**（`<text>` 不支持 KaTeX），分数/上标用 SVG 手绘

### FractionPie 示例

```
step 0 → 第一个饼图
step 1 → 第二个饼 + 运算符 (+/−)
step 2 → 通分行（LCD）
step 3 → 结果行（支持假分数多圆 + SVG 带分数）
step 999 → 全部显示
```

---

## 九、Bug 防范规则（9 条）

> 详见 `docs/BUG-POSTMORTEM.md` 的完整根因分析。

| 规则 | 内容 | 检查方法 |
|------|------|---------|
| **A** | 生成器必须尊重 template.data 控制字段（op/mode/func） | grep `pickRandom` 确认有 template fallback |
| **B** | SVG 组件不硬编码运算符 | props 传入 |
| **C** | SVG step 从 0 开始 | step=0 必须有内容 |
| **D** | 多行 SVG 不设 maxHeight | 用 viewBox 自适应 |
| **E** | 分数可视化必须处理假分数 | numerator ≥ denominator 时多圆 |
| **F** | SVG 内不用 LaTeX | 手绘分数/上标 |
| **G** | formula 字段用短公式 | 不要长中文 `\text{}` |
| **H** | 无重复 mission ID | `grep -o 'id: [0-9]*' missions.ts \| sort \| uniq -d` |
| **I** | 新文件必须 git add | `git status` 检查 `??` |

---

## 十、审查标准

每次提交前（或审查时）必须检查：

### 功能正确性
- [ ] `npm run build` 零错误
- [ ] 无重复 mission ID
- [ ] 每个 generatorType 在 GENERATOR_MAP 中有对应函数
- [ ] generator data 字段 ↔ checker 字段名一致
- [ ] 每个新 QuestionType 在 inputConfig.ts 中有条目

### 教程质量
- [ ] 每个生成器 ≥6 步
- [ ] 第 1 步是 WHY
- [ ] 有验算步骤
- [ ] 无压缩计算
- [ ] 前置知识有铺垫

### 叙事连贯性
- [ ] story 字段自然融入三国叙事
- [ ] 角色语音一致
- [ ] 单元内有叙事递进
- [ ] 知识链条无断点

### UI 渲染
- [ ] 手机端（375px）公式不溢出
- [ ] LaTeX `$...$` 正确渲染
- [ ] SVG 图表跟随教程步骤
- [ ] 三语切换正常

---

## 十一、关联项目

```
CIE 分析(知识点定义) → Play(闯关) ↔ ExamHub(真题) → 主站(入口)
                                 ↑
                            共享 Supabase
                            共享用户账号
```

| 项目 | 路径 | 关系 |
|------|------|------|
| ExamHub | `25Maths-Keywords` | 共享 Supabase + 用户 |
| 主站 | `25maths-website` | 入口链接 |
| CIE 分析 | `CIE/IGCSE_v2/analysis/` | kp-registry 数据源 |
| 视频引擎 | 多目录 | 未来 Phase 5 集成 |

---

## 十二、Git 规范

- commit 前必须 `npm run build` 零错误
- commit message 格式: `feat:` / `fix:` / `docs:` + 简述
- push main 自动部署
- 验证部署: `gh run list --repo git25math/25maths-games-legends --limit 1`
- **不要 force push**
- **新文件必须 git add**（检查 `git status` 的 `??`）

---

## 十三、ID 分配规则

| 年级 | ID 范围 | 备注 |
|------|---------|------|
| Y7 | 690-773 | 已用 56 个 |
| Y8 | 811-899 | 已用 40 个 |
| Y9+ | 1011-1221 | 旧关卡，暂不修改 |

---

## 十四、工作流

### 开发时
1. 回顾计划 → 2. 审查现状 → 3. 执行 → 4. build 验证 → 5. commit+push → 6. 确认部署

### 审查时
1. 量化（表格+数字）→ 2. 对标金标准 → 3. 当场修复 → 4. 验证 → 5. 再审查（≥3 轮）

### 交接时（对话/session 结束）
1. 更新 package.json 版本号
2. 更新 docs/DEVELOPMENT-PLAN.md（版本历程+下一步）
3. 更新项目状态文件（关卡数/遗留问题）
4. 回顾对话，记录新的共识/偏好/纠正
5. 记录 bug 到 docs/BUG-POSTMORTEM.md
6. commit + push + 确认部署成功
7. **运行一致性验证**（全部通过才算完成）：
   ```bash
   # 文档互引（每个≥1次引用 CONTRIBUTING.md）
   for f in docs/*.md CLAUDE.md; do echo "$(basename $f): $(grep -c CONTRIBUTING $f)"; done
   # 版本一致
   grep '"version"' package.json && grep "版本" docs/DEVELOPMENT-PLAN.md | head -1
   # 无重复 ID
   grep -o 'id: [0-9]*' src/data/missions.ts | sort | uniq -d
   # 无未提交 src 改动
   git status -s | grep '^ M src/'
   # 部署成功
   gh run list --repo git25math/25maths-games-legends --limit 1
   # build 零错误
   npm run build 2>&1 | tail -1
   ```
8. 输出接手指令（一句话可复制到新 session）

---

## 十五、核心文件索引

| 文件 | 用途 |
|------|------|
| `docs/DEVELOPMENT-PLAN.md` | 主计划 + 版本历程 |
| `docs/Y8-DEVELOPMENT-PLAN.md` | Y8 接手计划 |
| `docs/BUG-POSTMORTEM.md` | Bug 根因分析 + 防范规则 |
| `docs/CONTRIBUTING.md` | **本文档** — 开发规范（AI/人类通用） |
| `src/data/missions.ts` | 全部关卡 |
| `src/utils/generateMission.ts` | 全部生成器 |
| `src/utils/checkCorrectness.ts` | 答案校验 |
| `src/types.ts` | 类型定义 |
| `src/i18n/translations.ts` | 三语 UI 翻译 |
| `src/data/curriculum/kp-registry.ts` | CIE 0580 知识点注册表 |
