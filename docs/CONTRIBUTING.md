# 开发规范（适用于任何开发者 / AI 工具）

> 本文档是 25Maths Dashboard 项目的唯一权威规范。
> 无论你是人类开发者、Claude、Cursor、Copilot 还是其他 AI——都必须遵守此文档。
> 本文档存在于 git 仓库内，所有协作者均可读取。

---

## 一、项目概览

- **项目**: 25Maths Dashboard — 国际学校数学教师个人管理平台
- **仓库**: `git25math/25maths-dashboard`
- **磁盘路径**: `/Users/zhuxingzhe/Project/ExamBoard/25Maths-Dashboard/`
- **部署**: push main → GitHub Actions → https://git25math.github.io/25maths-dashboard/
- **技术栈**: React 19 + TypeScript 5.8 + Vite 6.2 + Tailwind CSS 4 + Supabase + Gemini 2.5 Flash
- **当前版本**: v1.0.0 (2026-03-19)

---

## 二、目标用户

**面向国际学校数学教师的个人管理平台**，覆盖教学、学生、行政、创业四个维度。

### 用户画像

| 维度 | 描述 |
|------|------|
| **身份** | 国际学校数学教师（同时是班主任 + 创业者） |
| **语言** | 中英双语，UI 以英文为主，内容经常中英混合 |
| **设备** | 桌面端为主（课堂外），偶尔移动端查看 |
| **核心诉求** | 一站式管理教学进度、学生档案、会议记录、GTD 任务、项目开发 |

### 核心原则

1. **教师视角优先**: 所有功能设计围绕"一个数学教师的真实一天"
2. **数据不丢失**: localStorage 缓存 + Supabase 云同步双保险
3. **AI 辅助不替代**: Gemini 提供建议和转录，但教师始终拥有最终决策权
4. **快速捕获**: 灵感、工作日志、会议记录——都要能在 3 秒内开始记录

### 可以 / 不可以

| 可以 | 不可以 |
|------|--------|
| 用 AI 转录会议并生成摘要 | 让 AI 自动修改学生成绩 |
| 批量奖励积分（有审计日志） | 批量删除学生记录（无确认） |
| 快速切换 Card/Table 视图 | 在表格视图中隐藏关键字段 |
| 一键导出全部数据为 JSON | 覆盖性导入（不提示确认） |

---

## 三、质量标准

### Dashboard 金标准

| 规则 | 标准 | 检查方法 |
|------|------|----------|
| **TypeScript 零错误** | `npm run lint` 无 error | `tsc --noEmit` |
| **Build 零错误** | `npm run build` 通过 | Vite 构建输出 "built in" |
| **无内存泄漏** | setTimeout/setInterval 必须清理 | useRef + unmount cleanup |
| **Supabase 迁移同步** | 新表/列必须有 migration SQL | `supabase db push` 验证 |
| **localStorage 回退** | Supabase 不可用时降级到本地 | 断网测试 |
| **响应式** | 桌面 + 移动端均可用 | 最小宽度 320px |
| **暗色模式** | 所有新组件必须支持 `dark:` | 切换暗色模式检查 |
| **无 XSS** | HTML 内容必须经 DOMPurify | 检查 dangerouslySetInnerHTML |

### Anti-patterns

| 禁止 | 原因 | 正确做法 |
|------|------|----------|
| 在 `useAppData` 中添加新领域逻辑 | 单文件超 600 行不可维护 | 创建 `appData/use{Domain}Actions.ts` |
| 内联 `Math.random().toString(36)` | 多处重复 | 用 `lib/id.ts` 的 `randomAlphaId()` |
| 重复定义状态颜色 | 7 处曾重复 | 用 `lib/statusColors.ts` |
| `alert()` 通知用户 | 阻塞 UI | 用 `toast.success()` / `toast.error()` |
| 不清理 setTimeout | 内存泄漏 | `useRef` + `useEffect` cleanup |
| useCallback 依赖数组含 state 数组 | 级联重建 | `useRef` 模式包裹 |
| Supabase `upsert` 更新已有记录 | 覆盖其他字段 | 按 `id` 精确 `update` |
| `geminiService.ts` 直接添加方法 | 已拆为门面模式 | 添加到 `services/gemini/{domain}.ts` |

---

## 四、架构原则

### 分层架构

```
┌──────────────────────────────────────────────────────────┐
│ Views (25+ lazy-loaded)                                  │
│   DashboardView / CalendarView / StudentsView / ...      │
├──────────────────────────────────────────────────────────┤
│ Components (44+)                                         │
│   Forms / Modals / Cards / Editors / Chronicle           │
├──────────────────────────────────────────────────────────┤
│ Hooks — 状态管理层                                        │
│   useAppData (编排器, 645 行)                              │
│     ├── useStudentActions (460 行)                        │
│     ├── useTeachingActions (335 行)                       │
│     ├── useProductivityActions (组合器, 75 行)             │
│     │     ├── useTaskActions / useIdeaActions / ...       │
│     │     └── 9 个领域 hook                               │
│     └── useKahootActions / usePayhipActions              │
├──────────────────────────────────────────────────────────┤
│ Services (31 files)                                      │
│   {entity}Service.ts — Supabase CRUD                     │
│   geminiService.ts (门面) → gemini/{domain}.ts            │
├──────────────────────────────────────────────────────────┤
│ Lib (工具层)                                              │
│   supabase.ts / id.ts / utils.ts / statusColors.ts      │
│   timetableUtils.ts / teachingAdapter.ts / ...           │
├──────────────────────────────────────────────────────────┤
│ Backend                                                  │
│   Supabase (PostgreSQL + RLS + Storage)                  │
│   Gemini 2.5 Flash (AI API)                              │
└──────────────────────────────────────────────────────────┘
```

### 数据流

```
React Component
  → useAppData hook (编排器)
    → use{Domain}Actions hook (领域逻辑)
      → {entity}Service.ts (Supabase CRUD)
        → Supabase PostgreSQL (远程)
        → localStorage (本地缓存)
```

### 依赖规则

1. **Views** 只依赖 `useAppData` 返回的 API，不直接调用 Service
2. **Components** 通过 props 接收数据和回调，不直接依赖 hooks
3. **Services** 不依赖 React，纯 async 函数
4. **Lib** 不依赖任何 src/ 模块，可独立使用
5. **类型** 全部定义在 `types.ts` 或 `types/` 目录

### 模块间接口约定

- **useAppData** 返回一个扁平对象，key 为实体名和方法名
- **Service** 统一签名: `getAll(): Promise<T[]>`, `create(item: T): Promise<T>`, `update(id, partial): Promise<T>`, `remove(id): Promise<void>`
- **ID 生成**: `{prefix}-{timestamp}-{random}`，prefix 区分实体类型（`mt-`, `lr-`, `hp-`, `ed-`, `tk-`）

---

## 五、Chronicle 模块（项目编年史）

Chronicle 是 Dashboard 的核心特色模块——**面向开发者的深度思考空间与项目追踪系统**。

### 设计理念

> Chronicle 不是任务管理工具（那是 GTD Tasks 的职责），而是**思维沉淀的空间**。
> 从开发计划 → 实施 → 思考 → 迭代，整个过程都可以在这里找到答案。

### 数据模型

```
Project (active/paused/completed)
  ├── Milestones (ordered checklist)
  │     ├── status: not_started / in_progress / completed
  │     ├── due_date
  │     └── review: { what_done, what_learned, what_improve, time_spent }
  ├── DevLogs (timestamped entries)
  │     ├── tags: thinking / decision / ai-chat / reflection / bug-fix / feature / architecture / research
  │     ├── status: draft / incubating / actionable / archived
  │     ├── starred (boolean)
  │     ├── milestone_id (关联里程碑)
  │     ├── task_id (关联 GTD 任务)
  │     └── thread_id (关联叙事线)
  └── Threads (叙事线，将相关 DevLog 分组)
```

### 核心功能 (V1→V5)

| 版本 | 功能 |
|------|------|
| V1 | 里程碑 + DevLog + 活动时间线 + 里程碑回顾 |
| V2 | DevLog 扩展、孵化状态、成长时间线、项目切换、叙事线 |
| V3 | 状态筛选、孵化看板、模板系统、内联任务、导出 |
| V4 | 搜索、星标、速度仪表盘、排序、批量操作、键盘快捷键 |
| V5 | 日志引用、标签热力图、里程碑时间线、差异对比、周报、自定义模板 |

### 8 种 DevLog 标签模板

每种标签预设 Markdown 模板结构：

| 标签 | 模板结构 |
|------|----------|
| 思考 | 背景 → 思考过程 → 初步结论 → 待验证 |
| 决策 | 背景 → 选项 → 决定 → 理由 |
| AI 对话 | Prompt → Response 摘要 → Key Insight → 下一步 |
| 反思 | 回顾 → 做得好的 → 可以改进的 → 下次行动 |
| Bug 修复 | 症状 → 根因 → 修复方案 → 预防措施 |
| 功能 | 需求 → 设计方案 → 实现要点 → 测试计划 |
| 架构 | 现状 → 问题 → 目标架构 → 迁移路径 → 风险 |
| 调研 | 调研目标 → 发现 → 对比分析 → 建议 |

### 关键文件

| 文件 | 说明 |
|------|------|
| `src/types/chronicle.ts` | 数据模型定义 |
| `src/services/devlogService.ts` | DevLog CRUD |
| `src/services/milestoneService.ts` | Milestone CRUD |
| `src/services/threadService.ts` | Thread CRUD |
| `src/services/projectService.ts` | Project CRUD |
| `src/views/ProjectDetailView.tsx` | 主界面（4 Tab） |
| `src/components/chronicle/` | 5 个子组件 |

---

## 六、新增功能流程

### 新增实体类型（如"新增 XxxRecord"）

按以下顺序修改/创建文件：

```
1. types.ts 或 types/{domain}.ts     — 定义接口
2. services/{entity}Service.ts       — Supabase CRUD
3. hooks/appData/use{Domain}Actions.ts — 状态逻辑
4. hooks/useAppData.ts               — 接线（仅编排）
5. components/{EntityForm}.tsx        — 表单组件
6. views/{Entity}View.tsx            — 页面视图
7. shared/sidebarConfig.ts           — 侧栏入口
8. components/ViewRouter.tsx          — 路由注册（lazy-load）
9. components/FormModals.tsx          — 表单弹窗注册
10. components/GlobalSearch.tsx       — 搜索支持
11. views/SettingsView.tsx            — Export/Import KNOWN_KEYS
12. supabase/migrations/             — 数据库迁移 SQL
```

### 新增 Gemini AI 功能

```
1. services/gemini/{domain}.ts    — 新的 AI 调用函数
2. services/geminiService.ts      — 门面重新导出
3. 调用方 View/Component          — 集成调用
```

### 新增内容管线（如 Kahoot / PayHip 类）

```
1. types.ts                       — Pipeline 接口 + Stage 常量
2. services/{pipeline}Service.ts  — CRUD
3. views/{pipeline}/              — Hub + Library + Detail + Wizard
4. scripts/{pipeline}/            — CLI 脚本（生成/导出/部署）
5. package.json                   — scripts 入口
```

---

## 七、国际化/多语言

### 当前状态

- **UI 语言**: 英文为主，部分标签中英双语
- **内容**: 中英混合（教师输入的内容自然混合两种语言）
- **AI 输出**: Gemini 转录产出双语 transcript；邮件摘要产出中文翻译

### 规则

1. 侧栏、按钮、表头统一用英文
2. DevLog 标签、状态名称用中文（`思考`、`草稿`、`孵化中`）
3. 富文本内容支持中英混排，KaTeX 数学公式
4. `DOMPurify` 清洗所有用户输入的 HTML
5. 教学词汇 (`VocabularyItem`) 有 `term` (英文) + `definition_zh` (中文) 双字段

---

## 八、UI 规范

### 组件库

| 类别 | 技术 |
|------|------|
| **样式** | Tailwind CSS 4 + `cn()` 工具函数 (clsx + tailwind-merge) |
| **图标** | Lucide React (300+) |
| **动画** | Motion.dev (motion/react) |
| **富文本** | TipTap 3.2 (Markdown + LaTeX) |
| **数学公式** | KaTeX 0.16 |
| **拖拽** | @dnd-kit/core 6.3 |
| **日期** | date-fns 4.1 |
| **XSS 防护** | DOMPurify 3.3 |

### 响应式断点

| 断点 | 布局 |
|------|------|
| `lg:` (≥1024px) | 固定侧栏 + 主内容 |
| `md:` (768-1023px) | 折叠侧栏 + 主内容 |
| `<md` (<768px) | 移动端：顶栏 + 底部导航 + 全屏内容 |

### 主题色系

| 领域 | 主色 |
|------|------|
| **Teaching** | Indigo (#5248C9) |
| **Students / HP** | Emerald |
| **Meetings / AI** | Teal |
| **Ideas** | Purple |
| **Parent Comm** | Blue |
| **Tasks** | 按 priority: high=red, medium=amber, low=slate |
| **Chronicle** | 按 tag 颜色（见第五节） |

### 暗色模式

- 所有组件使用 `dark:` Tailwind 前缀
- `glass-card` 类在暗色下自动切换背景
- 新组件**必须**同时处理亮色和暗色

### 表单规范

- 表单 padding: `p-4 sm:p-8`
- Modal: 标题 + 表单 + 底部按钮栏（Save / Cancel）
- Escape 键关闭 Modal
- 所有交互元素必须有 `aria-label`

---

## 九、Bug 防范规则

> 详细根因分析见 `docs/BUG-POSTMORTEM.md`。

| # | 规则 | 根因 | 检查方法 |
|---|------|------|----------|
| **B1** | Supabase migration 必须 `db push` 到生产 | Phase 27.1/29: 表不存在导致 404 | 部署后验证写入操作 |
| **B2** | 批量创建用 `await` 串行 + 随机 ID 后缀 | 同毫秒 ID 碰撞 | `genId()` 含 random 部分 |
| **B3** | `updateMeeting` 只提交变更字段 | 旧快照覆盖新状态 | 不用 upsert 更新 |
| **B4** | localStorage 迁移用 `|| []` 防御 | useEffect 后于首次渲染 | 所有 view 层访问加 fallback |
| **B5** | setTimeout 必须在 unmount 时 clearTimeout | 组件卸载后回调执行 | useRef 追踪 timer |
| **B6** | AI 错误显示实际 `err.message` | 笼统错误信息无法定位 | catch 块传递原始错误 |
| **B7** | `useCallback` 不依赖 state 数组 | 数组引用变化导致级联重建 | 用 `useRef` 包裹 |
| **B8** | Dashboard 固定年级列表渲染 | `classes.slice()` 顺序不稳定 | 硬编码 Y7/Y8/Y10/Y11/Y12 |
| **B9** | 会议处理状态串行 `await` 推进 | 并发更新导致状态回退 | transcribing→summarizing→completed |
| **B10** | `data-*` 过滤 undefined 字段后再写入 | PostgREST 序列化异常 | `Object.fromEntries` 清洗 |

---

## 十、审查标准

### 功能正确性 Checklist

- [ ] `npm run lint` 零错误 (`tsc --noEmit`)
- [ ] `npm run build` 零错误 (Vite)
- [ ] 新增实体在 SettingsView `KNOWN_KEYS` 中注册
- [ ] 新增实体在 GlobalSearch 中可搜索
- [ ] 新增实体在 `bulkImport()` 中支持
- [ ] Supabase migration SQL 已创建并 `db push`

### 数据完整性 Checklist

- [ ] Service 的 `create` 含完整字段（不依赖 DB default 以外的值）
- [ ] ID 格式正确（`{prefix}-{timestamp}-{random}`）
- [ ] localStorage key 使用 `dashboard-{entity}` 前缀
- [ ] 删除操作有确认对话框
- [ ] 关联删除：删除父记录时清理子记录

### UI/UX Checklist

- [ ] 支持暗色模式 (`dark:` 前缀)
- [ ] 移动端可用（最小 320px）
- [ ] 表单有 Escape 关闭
- [ ] 交互元素有 `aria-label`
- [ ] toast 通知替代 `alert()`
- [ ] 空状态有引导（placeholder + 操作入口）

---

## 十一、关联项目

### 项目关系图

```
                    ┌─────────────────┐
                    │  CIE 0580 课纲   │
                    │  (294 知识点)     │
                    └──────┬──────────┘
                           │ 知识点定义
              ┌────────────┼────────────┐
              ▼            ▼            ▼
    ┌─────────────┐ ┌───────────┐ ┌──────────────┐
    │  Play 游戏   │ │  ExamHub  │ │  视频引擎     │
    │ (闯关+教学)  │ │ (词汇+真题)│ │ (讲解视频)    │
    └──────┬──────┘ └─────┬─────┘ └──────┬───────┘
           │              │              │
           └──────┬───────┘              │
                  ▼                      │
         ┌───────────────┐               │
         │  Dashboard    │←──────────────┘
         │ (教师管理中心) │
         └───────┬───────┘
                 │
                 ▼
         ┌───────────────┐
         │  25Maths 主站  │
         │  (入口+博客)   │
         └───────────────┘
```

### 数据流与依赖

| 关系 | 方向 | 说明 | 影响 |
|------|------|------|------|
| **Dashboard → ExamHub** | 词汇数据源 | `scripts/output/y7-y11-unit-vocabulary.json` 来源于 ExamHub 数据 | ExamHub 词汇更新后需重新生成 |
| **Dashboard → CIE 分析** | 真题数据源 | Paper Generator 的题库来源于 CIE 分析流水线 | 新 topic 分析完才能入 Paper Generator |
| **Dashboard → 视频引擎** | 视频脚本管理 | Video Hub 管理多考试局视频脚本 | 视频 ID 与 kpId 对齐 |
| **Dashboard → Website** | Kahoot 链接同步 | `kahoot:sync` 脚本同步链接到主站 | 主站 Kahoot 页面依赖此数据 |
| **Dashboard ↔ Supabase** | 数据存储 | 独立的 Supabase 项目（非共享） | 不影响其他项目 |

### 关键区别

- Dashboard 的 Supabase **不是**与 Play/ExamHub 共享的那个（ref: jjjigohjvmyewasmmmyf）
- Dashboard 是教师端工具，Play/ExamHub 是学生端产品
- Dashboard 的 Kahoot/PayHip/Video 管线是**内容生产工具**，产出物分发到其他平台

---

## 十二、Git 规范

### Commit Message 格式

```
{type}: {简短中英文描述}

type = feat | fix | improve | refine | perf | docs | hotfix
```

示例：
- `feat: Chronicle V5 — log references, tag heatmap, milestone timeline`
- `fix: harden mve agent frontend — SSE reconnect, debounce, mount safety`
- `hotfix: Tasks 表缺失 + ID 碰撞修复`
- `perf: lazy-load forms, overlays, and extract lucide vendor chunk`

### 部署流程

```bash
# 1. 构建验证
npm run build

# 2. 提交
git add <specific-files>
git commit -m "feat: ..."

# 3. 推送（自动触发 GitHub Actions 部署）
git push origin main

# 4. 验证部署
gh run list --repo git25math/25maths-dashboard --limit 1
```

### 禁止事项

- **不要** `git push --force`
- **不要** 跳过 `npm run build` 直接 push
- **不要** 提交 `.env.local`（含 API keys）
- **不要** 提交 `node_modules/` 或 `dist/`
- **不要** 提交 `scripts/output/` 中的大 JSON 数据文件（已在 .gitignore）

---

## 十三、数据/ID 分配规则

### 实体 ID 前缀

| 实体 | 前缀 | 示例 |
|------|------|------|
| Meeting | `mt-` | `mt-1709123456789-a3k` |
| Lesson Record | `lr-` | `lr-1709123456789-b7m` |
| HP Award Log | `hp-` | `hp-1709123456789-c2n` |
| Email Digest | `ed-` | `ed-1709123456789-d5p` |
| Task | `tk-` | `tk-1709123456789-e8q` |
| DevLog | `dl-` | `dl-1709123456789-f1r` |
| Milestone | `ms-` | `ms-1709123456789-g4s` |
| Thread | `th-` | `th-1709123456789-h6t` |
| Project | — | `randomAlphaId()` |
| Student / Class / Unit | — | `randomAlphaId()` |

### Supabase 表名

| 表名 | 用途 |
|------|------|
| `students` | 学生档案 |
| `classes` | 班级定义 |
| `teaching_units` | 教学单元（含 sub_units JSONB） |
| `timetable_entries` | 课表条目 |
| `lesson_records` | 上课记录 |
| `meeting_records` | 会议记录 |
| `ideas` | 灵感池 |
| `sops` | SOP 库 |
| `work_logs` | 工作日志 |
| `goals` | 目标 |
| `school_events` | 学校事件 |
| `tasks` | GTD 任务 |
| `projects` | 项目 |
| `hp_award_logs` | 积分审计日志 |
| `email_digests` | 邮件摘要 |
| `milestones` | 里程碑 |
| `devlogs` | 开发日志 |
| `devlog_threads` | 叙事线 |

### localStorage Key

所有 key 使用 `dashboard-{entity}` 前缀，如：
- `dashboard-students`, `dashboard-tasks`, `dashboard-projects`
- `dashboard-dark-mode` (主题偏好)
- `dashboard-auth-token` (登录会话)

---

## 十四、工作流

### 开发流程

```
Step 1: 读取当前状态
  → npm run build (确认基线可构建)
  → git log --oneline -5 (确认最新状态)
  → 读 docs/DEVELOPMENT-PLAN.md (确认版本)

Step 2: 计划
  → 分析需求，识别涉及文件
  → 输出实施计划（文件×变更×顺序）
  → 确认后开始

Step 3: 执行
  → 按计划逐步实施
  → 每完成一个模块 npm run lint 检查

Step 4: 验证
  → npm run build (零错误)
  → 暗色模式检查
  → 移动端检查

Step 5: 部署
  → git commit + push
  → gh run list 验证部署

Step 6: 记录
  → 更新 DEVELOPMENT-PLAN.md
```

### 一致性验证脚本

```bash
# 1. 文档互引
for f in docs/*.md CLAUDE.md; do
  [ -f "$f" ] && echo "$(basename $f): $(grep -c CONTRIBUTING $f)"
done

# 2. 版本一致
grep '"version"' package.json
grep -i "版本\|version" docs/DEVELOPMENT-PLAN.md 2>/dev/null | head -1

# 3. 未提交改动
git status -s | grep '^ M src/'

# 4. 最近部署
REPO=$(git remote get-url origin 2>/dev/null | sed 's/.*github.com\///' | sed 's/.git$//')
[ -n "$REPO" ] && gh run list --repo "$REPO" --limit 1

# 5. build
npm run build 2>&1 | tail -1
```

---

## 十五、核心文件索引

### 类型定义
| 文件 | 行数 | 说明 |
|------|------|------|
| `src/types.ts` | ~521 | 主接口定义（65+ 接口/类型） |
| `src/types/chronicle.ts` | ~80 | Chronicle 领域模型 |
| `src/types/video.ts` | ~80 | Video 领域模型 |

### 状态管理
| 文件 | 行数 | 说明 |
|------|------|------|
| `src/hooks/useAppData.ts` | ~645 | 中央编排器 |
| `src/hooks/appData/useStudentActions.ts` | ~460 | 学生领域逻辑 |
| `src/hooks/appData/useTeachingActions.ts` | ~335 | 教学领域逻辑 |
| `src/hooks/appData/useProductivityActions.ts` | ~75 | 生产力组合器 |
| `src/hooks/appData/housePointUtils.ts` | — | HP 计算纯函数 |

### AI 服务
| 文件 | 说明 |
|------|------|
| `src/services/geminiService.ts` | 门面（re-export） |
| `src/services/gemini/student.ts` | 学生诊断 + 练习推荐 |
| `src/services/gemini/meeting.ts` | 转录 + 摘要 + 任务提取 |
| `src/services/gemini/teaching.ts` | 课程计划生成 |
| `src/services/gemini/productivity.ts` | 合并/分类/邮件处理 |
| `src/services/gemini/paper.ts` | 变式题生成 |

### 视图（所有 lazy-load）
| 文件 | 说明 |
|------|------|
| `src/views/DashboardView.tsx` | 首页概览 |
| `src/views/CalendarView.tsx` | 日历视图 |
| `src/views/StudentsView.tsx` | 学生管理 |
| `src/views/TeachingView.tsx` | 教学进度 |
| `src/views/TasksView.tsx` | GTD 任务 |
| `src/views/ProjectDetailView.tsx` | Chronicle 主界面 |
| `src/views/MeetingsView.tsx` | 会议记录 |
| `src/views/EmailDigestView.tsx` | 邮件摘要 |
| `src/views/kahoot/KahootHub.tsx` | Kahoot 管线 |
| `src/views/papers/` | 组卷系统 |
| `src/views/covers/` | 封面设计 |
| `src/views/video/` | 视频脚本管理 |

### 基础设施
| 文件 | 说明 |
|------|------|
| `vite.config.ts` | 构建配置 + vendor chunks |
| `.github/workflows/deploy.yml` | CI/CD |
| `supabase/migrations/` | 26 个 DB 迁移 |
| `server/local-agent.mjs` | 本地 AI Agent |
| `scripts/` | 17+ CLI 脚本 |
