# Bug 根因分析与防范规则

> 完整开发规范见 `docs/CONTRIBUTING.md`（第九节 Bug 防范规则速查表）。

---

## Bug 记录

### BUG-001: Supabase 表缺失导致 404 (Phase 27.1, 29)

**症状**: Tasks/Email Digests 创建操作报 "Failed to add task"，Supabase 返回 404。

**根因**: 功能代码已部署到 GitHub Pages，但对应的 Supabase migration 未执行 `supabase db push`。这属于**部署遗漏**——代码和数据库 schema 不同步。

**修复**: 补创 migration SQL 并推送到生产库。

**防范规则**: 新增实体时，migration SQL 必须在同一次 commit 中创建，并在部署后立即验证写入操作。

---

### BUG-002: 批量创建 Task ID 碰撞 (Phase 27.1)

**症状**: Smart Extract 从会议摘要批量创建任务时，部分任务丢失。

**根因**: `taskService.genId()` 使用 `Date.now()` 生成 ID，批量创建时同毫秒内多次调用产生相同主键，Supabase upsert 覆盖前一条。

**修复**: `genId()` 增加随机后缀 (`-{random}`)，批量创建改为 `await` 串行执行，每条独立 try-catch。

**防范规则**: ID 生成必须包含随机成分。批量操作串行 + 独立错误处理。

---

### BUG-003: localStorage 迁移 race condition (Phase 20)

**症状**: 首次加载时白屏崩溃，控制台报 `undefined.length`。

**根因**: `teachingAdapter.normalizeTeachingUnit()` 在 `useEffect` 中运行（post-render），但首次渲染时 view 层已经在访问尚未迁移的 `learning_objectives` 字段。`useEffect` 晚于首次渲染，导致旧数据结构未迁移就被使用。

**修复**: 所有 view 层访问加 `|| []` 防御性 fallback + eager normalization。

**防范规则**: 数据迁移/规范化必须在渲染前完成，或所有消费方加 fallback。

---

### BUG-004: Meeting 状态回退 (Hotfix 2026-03-07)

**症状**: 会议录音处理后，部分记录一直停在 `transcribing` 状态，即使 transcript 和 summary 已获取。

**根因**: `MeetingDetail` 连续触发 3 次异步更新 (`transcribing → summarizing → completed`)，未 `await` 串行等待。`updateMeeting` 使用 `upsert` 并携带旧快照，慢返回的早期请求覆盖较新的状态。

**修复**:
1. `meetingService.update()` 从 `upsert` 改为按 `id` 精确 `update`
2. `updateMeeting` 只提交变更字段，不带旧快照
3. 录音处理改为 `await` 串行推进

**防范规则**: 多步异步状态推进必须串行 `await`。`update` 只传变更字段，不用 `upsert` 做更新。

---

### BUG-005: Work Logs 排序异常 (Hotfix 2026-03-03)

**症状**: Work Logs 列表显示顺序不稳定。

**根因**: 排序依赖的 `created_at` 字段格式不一致。

**修复**: 统一 timestamp 格式，显式按日期降序排序。

**防范规则**: 所有时间戳使用 ISO 8601 格式，排序逻辑显式指定。

---

### BUG-006: Dashboard View History 导航错误 (Hotfix 2026-03-03)

**症状**: Dashboard 的 "View History" 按钮导航到错误的标签页。

**根因**: 硬编码的 tab name 与实际注册的 tab 不一致。

**修复**: 修正 `navigateTo` 调用的目标 tab ID。

**防范规则**: 导航目标使用常量或 enum，不硬编码字符串。

---

### BUG-007: Dashboard Class Progress 顺序不稳定 (Hotfix 2026-03-04)

**症状**: 首页 Class Progress 卡片顺序每次加载不同，有时显示错误的年级。

**根因**: `classes.slice(0, 4)` 截取前 4 个班级，但 Supabase 返回顺序不确定。

**修复**: 硬编码固定年级列表 (Y7/Y8/Y10/Y11/Y12) 渲染。

**防范规则**: 面向用户的列表不依赖数据库返回顺序，使用确定性排序或固定列表。

---

### BUG-008: AI 错误信息笼统 (Hotfix 2026-03-03)

**症状**: Meeting 转录失败时只显示 "Failed to transcribe audio"，无法定位原因。

**根因**: catch 块丢弃了实际错误信息。

**修复**: 传递 `err.message` 到 toast 和 console。

**防范规则**: AI 调用的 catch 块必须显示实际错误信息（API 额度/网络/格式）。

---

### BUG-009: useCallback 级联重建 (Phase 30h)

**症状**: 频繁不必要的组件重渲染，性能下降。

**根因**: `useCallback` 依赖数组中包含 state 数组，每次 state 更新都创建新的数组引用，导致所有依赖的 callback 重建，进而触发子组件重渲染。

**修复**: 4 个 hooks 引入 `useRef` 模式消除数组依赖，30+ useCallback 移除数组 deps。

**防范规则**: `useCallback` 的 deps 中不放 state 数组/对象。用 `useRef` 暂存最新值。

---

### BUG-010: Student parent_communications 列缺失 (Phase 30)

**症状**: 家校沟通记录无法保存到 Supabase。

**根因**: `students.parent_communications` JSONB 列在 Supabase 中从未创建（migration 遗漏）。

**修复**: 补 migration + 批量 `supabase db push`。

**防范规则**: 新增 JSONB 字段时，即使是追加到现有表，也必须有独立 migration。

---

## 防范规则速查表

| # | 规则 | 典型违反场景 |
|---|------|-------------|
| B1 | Supabase migration 与功能代码同步部署 | 新表/新列忘记 `db push` |
| B2 | ID 生成包含随机成分 + 批量串行 | `Date.now()` 同毫秒碰撞 |
| B3 | `update` 只传变更字段 | `upsert` 旧快照覆盖新状态 |
| B4 | 数据迁移前/消费处加 fallback | useEffect 后于首次渲染 |
| B5 | setTimeout/setInterval 在 unmount 清理 | 组件卸载后回调执行 |
| B6 | AI catch 显示实际 err.message | 笼统错误无法定位 |
| B7 | useCallback deps 不含 state 数组 | 级联重建性能问题 |
| B8 | 面向用户列表用确定性排序 | DB 返回顺序不确定 |
| B9 | 多步异步串行 await | 并发更新状态回退 |
| B10 | 写入前 filter undefined 字段 | PostgREST 序列化异常 |
