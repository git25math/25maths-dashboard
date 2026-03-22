# Bug 复盘：根因分析 + 防范规则

> 本文档记录 v4.1→v5.0 开发期间发现的所有 bug，包括根因、修复、防范措施。
> **Y8 开发时必须阅读此文档**，避免重蹈覆辙。
> 防范规则已同步收录到 `docs/CONTRIBUTING.md` 第九节。

---

## Bug 1: FracAdd 生成器随机加减号（CRITICAL）

**现象**: mission 707 标题是"合并粮草"（加法），但实际出了减法题。
**根因**: `generateFracAddMission` 中 `isSubtract = pickRandom([true, false])` 完全随机，**忽略了 template.data.op** 的设定。
**修复**: 改为 `template.data?.op === '-' ? true : template.data?.op === '+' ? false : pickRandom([true, false])`
**防范规则**:
> **规则 A**: 生成器必须尊重 template.data 中的控制字段（op/mode/func 等）。随机化只能在 template 未设定时作为 fallback。

**同类检查结果**:
- `generateFracMulMission` (line 3289) — ✅ 已修复，尊重 template.data.op
- `generateIndicesMission` (line 205) — ✅ 正确，尊重 template.data.op
- `generatePercentageMission` (line 648) — ✅ 正确，用 template.data.rate 正负判断

---

## Bug 2: FractionPie 硬编码 `+` 运算符（HIGH）

**现象**: 分数减法题（mission 708）的饼图显示 `+` 而不是 `−`。
**根因**: FractionPie 组件在 line 114 硬编码了 `+`，没有接受 op 参数。
**修复**: 加 `op` prop，PracticeScreen 传 `currentMission.data.op`。
**防范规则**:
> **规则 B**: SVG 组件不能硬编码数学运算符。必须通过 props 传入，由 mission data 驱动。

---

## Bug 3: FractionPie step 映射偏移（HIGH）

**现象**: 教程第 0 步时 FractionPie 什么都不显示（空白区域）。
**根因**: FractionPie 内部用 `step >= 1` 作为第一个饼图的显示条件，但 PracticeScreen 传的 `tutorialStep` 从 0 开始。
**修复**: 改为 `step >= 0` 显示第一个饼。
**防范规则**:
> **规则 C**: SVG 组件的 step 参数从 0 开始计数（与 tutorialStep 对齐）。step=0 必须有有意义的内容显示。

---

## Bug 4: FractionPie maxHeight 裁剪（HIGH）

**现象**: 通分后的第二行和结果行被截断不显示。
**根因**: SVG 有 `style={{ maxHeight: 360 }}`，但三行内容（原始+通分+结果）总高度约 370px。
**修复**: 移除 maxHeight 限制 + 缩小饼图半径。
**防范规则**:
> **规则 D**: 多行 SVG 图表不要设固定 maxHeight。用 viewBox 让浏览器自适应缩放。

---

## Bug 5: 假分数结果只显示一个满圆（MEDIUM）

**现象**: 结果 35/30（>1）只显示一个全涂满的圆，看不出"超过 1"。
**根因**: `drawPie()` 函数中 `isFilled = i < numerator`，当 numerator > denominator 时所有切片都被涂满。
**修复**: 结果区域改为多圆：`Math.floor(resultN/lcd)` 个满圆 + 1 个余数圆。
**防范规则**:
> **规则 E**: 分数可视化必须处理假分数（numerator ≥ denominator）情况。永远不要假设输入是真分数。

---

## Bug 6: SVG text 中 LaTeX 不渲染（MEDIUM）

**现象**: 结果标签显示 `\frac{5}{6}` 原始文本而不是视觉分数。
**根因**: SVG `<text>` 元素不支持 KaTeX/LaTeX 渲染，只显示纯文本。
**修复**: 改用 SVG 手绘分数（`<text>` 分子 + `<line>` 分数线 + `<text>` 分母）。
**防范规则**:
> **规则 F**: SVG 组件内部**永远不要用 LaTeX 语法**。分数、根号、上标等必须用原生 SVG 元素手绘。只有 React 组件（LatexText/MathView）才能渲染 LaTeX。

---

## Bug 7: 公式文本溢出容器（MEDIUM）

**现象**: "异分母分数相加：先通分（找 LCD），再加分子，最后约分" 超出文本框宽度。
**根因**: 两个问题叠加——(a) secret.formula 用了长中文 `\text{...}` 在 LaTeX 中，(b) LatexText 用 `<span>` 不会自动换行。
**修复**: (a) 改 formula 为简短数学公式 `$\frac{a}{b} + \frac{c}{d} = ...$`，(b) LatexText 改为 `inline-flex` + `flex-wrap`。
**防范规则**:
> **规则 G**: secret.formula 字段应该用**简短的数学公式**，不要用长句子包在 `\text{}` 里。中文解释放在 concept 字段，formula 只放公式。

---

## Bug 8: 重复 Mission ID（HIGH）

**现象**: 3 个关卡共用了 ID 706 和 710，导致数据冲突。
**根因**: 新增桥梁关卡时复制了原关卡的 ID 没改。
**修复**: 重新分配为 693, 694, 695。
**防范规则**:
> **规则 H**: 添加新关卡后必须执行 `grep -o 'id: [0-9]*' src/data/missions.ts | sort | uniq -d` 确认无重复。

---

## Bug 9: src/audio/ 未提交导致部署连续失败（CRITICAL）

**现象**: 本地 build 成功但 GitHub Actions 失败——"Could not resolve '../audio'"。连续 3 次部署失败。
**根因**: 外部修改创建了 `src/audio/` 目录并修改了 import 路径，但新目录未 git add。
**修复**: `git add src/audio/` 并提交所有相关修改文件。
**防范规则**:
> **规则 I**: commit 前必须 `git status` 检查是否有未跟踪的新文件（`??` 标记）。如果有新目录且被其他文件 import，必须一起提交。

---

## Bug 10: mission formula 中长中文 \text{} 不换行（LOW）

**现象**: `$\text{异分母分数相加：先通分（找 LCD），再加分子，最后约分}$` 超出框宽。
**根因**: KaTeX 的 `\text{}` 不支持自动换行，整个字符串作为一个不可分割的块渲染。
**修复**: 改为数学公式 `$\frac{a}{b} + \frac{c}{d} = \frac{ad+bc}{bd}$`。
**防范**: 同规则 G。

---

## 防范规则汇总

| 规则 | 内容 | 检查方法 |
|------|------|---------|
| **A** | 生成器必须尊重 template.data 控制字段 | grep `pickRandom` 确认有 template fallback |
| **B** | SVG 组件不硬编码运算符 | props 传入 |
| **C** | SVG step 从 0 开始 | step=0 必须有内容 |
| **D** | 多行 SVG 不设 maxHeight | 用 viewBox 自适应 |
| **E** | 分数可视化处理假分数 | numerator ≥ denominator 时多圆 |
| **F** | SVG 内不用 LaTeX | 手绘分数/上标 |
| **G** | formula 字段用短公式不用长中文 | 目视检查 |
| **H** | 无重复 ID | `sort | uniq -d` |
| **I** | 新文件必须 git add | `git status` 检查 `??` |

---

## 旧生成器同类 bug 回查结果

针对 Bug 1（生成器不尊重 template op），回查所有含 `pickRandom([true, false])` 的生成器：

| 生成器 | 行号 | 随机化内容 | 是否尊重 template? | 状态 |
|--------|------|-----------|-------------------|------|
| generatePrimeMission | 2006 | 50% prime/composite | 无 template 控制 | ✅ OK（无需控制）|
| generateFracAddMission | 3113 | 加/减 | ✅ 已修复，尊重 data.op | ✅ OK |
| generateFracMulMission | 3289 | 乘/除 | ✅ 已修复，尊重 data.op | ✅ OK |
| generateIntegerMulMission | 4433-4434 | 正/负符号 | 无 template 控制 | ✅ OK（随机符号是设计意图）|
| generateBodmasMission | 4601 | 是否加减法变体 | 无 template 控制 | ✅ OK（tier 内随机是设计意图）|
| generateSimplifyMission | 4707 | 是否加常数项 | 无 template 控制 | ✅ OK |

**结论**: 所有需要尊重 template 的生成器都已修复。其余随机化是设计意图（如随机正负号、随机变体），不需要修改。
