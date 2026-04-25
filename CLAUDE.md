# 25Maths Dashboard — 项目规范

> **重要**: 完整开发规范见 `docs/CONTRIBUTING.md`（适用于任何 AI/人类开发者）。
> 本文件是 Claude Code 专用的启动协议补充。

## 启动协议

每次新对话开始时，按此顺序执行：

1. **读取开发规范**: `docs/CONTRIBUTING.md` → 架构原则、Chronicle 模块、Bug 防范规则、审查标准
2. **读取开发计划**: `docs/DEVELOPMENT-PLAN.md` → 版本历程、下一步
3. **Git 基线检查**: `git status --short && git diff --stat && git log --oneline -3`
4. **构建确认**: `npm run build` → 必须零错误才能开始

## 项目信息

- **根目录**: `/Users/zhuxingzhe/Project/ExamBoard/25Maths-Dashboard/`
- **部署**: push main → GitHub Actions → https://git25math.github.io/25maths-dashboard/
- **版本**: v1.0.0 (2026-03-19)
- **仓库**: `git25math/25maths-dashboard`
- **规模**: 251 TS 文件, ~94K 行, 25+ views, 44 components, 31 services
- **See also**: [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | [docs/DEVELOPMENT-PLAN.md](docs/DEVELOPMENT-PLAN.md) | [docs/BUG-POSTMORTEM.md](docs/BUG-POSTMORTEM.md)

## 关联项目

| 项目 | 根目录 | 关系 |
|------|--------|------|
| **ExamHub** | `/Users/zhuxingzhe/Project/ExamBoard/25Maths-Keywords` | 词汇数据源 (y7-y11-unit-vocabulary.json) |
| **Play 游戏** | `/Users/zhuxingzhe/Project/ExamBoard/25maths-games-legends` | 独立项目，同一教育生态 |
| **25Maths Website** | `/Users/zhuxingzhe/Project/ExamBoard/25maths-website` | Kahoot 链接同步目标 |
| **CIE Analysis** | `/Users/zhuxingzhe/Project/ExamBoard/CIE/IGCSE_v2/analysis/` | 真题数据源 (Paper Generator) |
| **视频引擎** | 多目录 | Video Hub 管理脚本 |

## 文件地图

### 项目内文档
| 文件 | 用途 | 优先级 |
|------|------|--------|
| `docs/CONTRIBUTING.md` | **开发规范**（AI/人类通用唯一权威） | **必读** |
| `docs/DEVELOPMENT-PLAN.md` | 版本历程 + 下一步规划 | **必读** |
| `docs/BUG-POSTMORTEM.md` | 10 个 Bug 根因分析 + 防范规则 | **开发前必读** |
| `DEVELOPMENT.md` | 完整开发日志（80KB，29+ Phase 技术细节） | 查阅 |
| `docs/kahoot-hub-redesign.md` | Kahoot UX 设计规格 | 低 |

### 核心源文件
| 文件 | 行数 | 说明 |
|------|------|------|
| `src/types.ts` | ~521 | 主接口定义（65+ 接口/类型） |
| `src/types/chronicle.ts` | ~80 | Chronicle 领域模型 |
| `src/hooks/useAppData.ts` | ~645 | 中央编排器（**不要直接添加领域逻辑**） |
| `src/hooks/appData/` | 9+ 文件 | 领域 hooks（新逻辑加这里） |
| `src/services/geminiService.ts` | ~30 | AI 门面（新 AI 功能加 `services/gemini/`） |
| `src/components/ViewRouter.tsx` | ~511 | 视图路由注册 |
| `src/shared/sidebarConfig.ts` | — | 侧栏导航配置 |

## Workflow（强制执行）

每次收到开发任务时，**必须**按以下流程执行：

### 1. Plan — 进入计划模式
- 分析需求，探索相关代码
- 输出完整实施计划（涉及文件、变更内容、步骤）
- 等待用户确认
- **不确认不动手写代码**

### 2. Execute — 执行计划
- 按确认后的计划逐步实施
- 遇到编译错误 → 自动诊断并修复
- 变更完成后 `npm run lint` + `npm run build` 验证

### 3. Ship — 记录 + 推送 + 部署
1. `npm run build` 零错误
2. `git commit` 提交所有变更
3. `git push origin main` 推送
4. `gh run list --repo git25math/25maths-dashboard --limit 1` 验证部署
5. 汇报变更摘要

## Conventions（速查）

> 完整规范见 `docs/CONTRIBUTING.md`。

- TypeScript strict mode
- Tailwind CSS 4 + `cn()` 工具函数
- `dark:` 前缀支持暗色模式
- `randomAlphaId()` 生成 ID（不要内联 Math.random）
- `toast.success/error()` 通知（不要 alert）
- Service 层 → `{entity}Service.ts`
- 新领域逻辑 → `hooks/appData/use{Domain}Actions.ts`
- 新 AI 功能 → `services/gemini/{domain}.ts`
- `npm run build` 后 commit

## 审计时特别注意

> 详细根因分析见 `docs/BUG-POSTMORTEM.md`（10 条防范规则 + 历史 Bug 回查）。

1. **Supabase migration 同步 (B1)**: 新表/列必须有 migration 并 `db push`
2. **ID 碰撞 (B2)**: 批量创建串行 + 随机 ID 后缀
3. **upsert 覆盖 (B3/B4)**: update 只传变更字段
4. **内存泄漏 (B5)**: setTimeout 必须 cleanup
5. **useCallback deps (B7)**: 不依赖 state 数组，用 useRef
6. **异步状态串行 (B9)**: 多步操作 await 推进

## 用户偏好

- **批量执行**: 计划确认后按优先级自动推进，不逐项确认
- **验收驱动**: 每步 build + 验证
- **质量第一**: 先审查后行动

<!-- BEGIN auto-synced charter v3 · do not edit · source: 25maths-planning · last sync: 2026-04-25 -->

## 25Maths Cross-Repo Charter v3 (auto-synced · soul-deepened)

本仓是 25Maths Learning OS 的一部分。**灵魂宪章 ADR-0040 是产品最高优先级 · 任何冲突服从此节**。

### 仓库分层(repo.L4 拆 4 类 · ADR-0029)

| 层 | 仓 | 角色 |
|---|---|---|
| L1 Constitution | git25math/25maths-os | 宪法 + ADR + 契约 |
| L2 Content data | git25math/25maths-knowledge-registry | KN ontology + DAG + routes |
| L3 Operations | git25math/25maths-planning | Phase 报告 + 战略 + 灵魂审计 · **真相源** |
| L4-platform | 25maths-practice | **25Maths 主平台** |
| L4-source | 25Maths-Keywords / 25maths-games-legends | 6 月迁移源 → 只读 → 下线 |
| L4-tool | 25Maths-Dashboard / 25maths-Visual | NZH 内部工具 |
| L4-marketing | 25maths-website | 对外营销 |
| L4-pedagogy | 25maths-teaching | **教研内容源** · 用户本人创作 · 单向 ETL 流入 platform · 自留地保护(ADR-0043) |
| L4-media | math-video-engine | **视频教学源** · 1,046 元题型 · 7 板 · ISS 10 模块 · CDN/B站 · 单向 ETL(ADR-0044) |

### 灵魂宪章(产品最高优先级)

> **这不只是一个学习网站。这是一个让孩子重新认识自己的地方。**
> 北极星 = **承接住每一个想要学的孩子**

任何 PR 必过 5 灵魂问:
1. 温度问 · 学生感到被支持还是被追赶?
2. 声音问 · 学生此刻没说出口的内心 OS 是?
3. 老师问 · 更像中国老师还是酷工具?
4. 三学生问 · 差/中/优三类学生体验分层吗?
5. 走人问 · 学生离开一周回来感到温暖还是内疚?

任一答错 → block merge。详见 [ADR-0040](https://github.com/git25math/25maths-os/blob/main/decisions/0040-soul-charter.md) + [ADR-0041](https://github.com/git25math/25maths-os/blob/main/decisions/0041-feedback-voice-ironclads.md)。

### MUST READ(任何 session 启动前)

- [planning/CLAUDE.md](https://github.com/git25math/25maths-planning/blob/main/CLAUDE.md) · session 宪章
- [planning/PROJECT_FUSION_PLAN_V3.md](https://github.com/git25math/25maths-planning/blob/main/PROJECT_FUSION_PLAN_V3.md) · § -1 灵魂 + § 1 战略 + § 11 自检
- [planning/AUDIT_FRAMEWORK.md](https://github.com/git25math/25maths-planning/blob/main/AUDIT_FRAMEWORK.md) · 6 维度 + § 12-§ 14 trigger / 四轴 / 灵魂自检
- [planning/STUDENT_PLEDGE.md](https://github.com/git25math/25maths-planning/blob/main/STUDENT_PLEDGE.md) · 9 封信反向验证
- [planning/SOUL_INVARIANTS_TEST_SUITE.md](https://github.com/git25math/25maths-planning/blob/main/SOUL_INVARIANTS_TEST_SUITE.md) · 12 套测试 80 断言

### 四轴度量(M2 末目标 · ADR-0035 + ADR-0040)

code 75% / experience 50% / commercial 20% / **soul 80%**(灵魂轴最严格 · < 70% 阻 Phase)

### 7 红线(违反任一 → ADR-0040 紧急复审)

1. 反向论证"为 KPI 必加焦虑特性"
2. trigger 反向驱动 UI 红点 / streak / 倒计时
3. 教师 dashboard 出现"差生排名" / 公开比较
4. 家长报告出现"成绩不如同班 X%"
5. "你应该早就会了"语义出现在系统反馈
6. 学生练习核心收费(ADR-0025 学生永远免费)
7. variant_mastery 降级到 unit/section 级(违反 1=1=1 铁律)

### 北极星(双锚)

商业:DFM-killer + Y3 ¥1 亿 + 6 月渐进融合
使命:**承接住每一个想要学的孩子,从能够接受的地方开始,手把手陪着重建自信**

### 冲突仲裁

ADR-0040 灵魂宪章 > L1 概念 > L3 prod 状态 > L2 KN 数据 > L4 实施 · prod 偏离记录在 L1 ADR。

<!-- END auto-synced charter v3 -->
