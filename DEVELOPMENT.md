# 25Maths Dashboard — Development Log & Roadmap

## Project Info

- **Live URL**: https://git25math.github.io/25maths-dashboard/
- **Repo**: https://github.com/git25math/25maths-dashboard
- **Stack**: React 19 + TypeScript + Vite + Tailwind CSS 4 + Supabase
- **Deploy**: GitHub Pages via GitHub Actions (auto on push to main)

---

## Development Log

### Phase 1 — Project Init (2026-02)
- Scaffolded React + Vite + TypeScript project
- Created core data types: Student, TimetableEntry, TeachingUnit, ClassProfile, Idea, SOP, WorkLog, Goal, SchoolEvent, LessonRecord
- Built mock data constants for all entities
- Implemented `useLocalStorage` hook for persistent state

### Phase 2 — Core Views (2026-02)
- Dashboard overview with summary cards
- Timetable weekly grid view
- Students list with detail panel
- Teaching units management

### Phase 3 — Goals & Work Logs (2026-02)
- Goals tracking with progress bars
- Work log entry with category/tag system
- QuickCapture widget for fast input

### Phase 4 — Student Profile Enhancement (2026-02)
- Student status records (academic/behavior/personal)
- Student requests tracking (pending/resolved)
- Weakness tracking per student
- Class profile management with student assignments

### Phase 5 — KaTeX Integration (2026-02)
- Math formula rendering with KaTeX
- remark-math + rehype-katex for markdown math support

### Phase 6+7 — UI Polish & CRUD (2026-02)
- Replaced all `alert()` with toast notification system
- SOP expandable cards UI
- WorkLog category filter
- Full edit support for Ideas, SOPs, and WorkLogs
- Fixed RichTextEditor DOM ID conflicts
- Fixed StudentsView prop signature

### Phase 8 — Supabase Backend (2026-03-01)
- Created Supabase project (ap-southeast-2, Sydney)
- Designed and deployed 12 database tables with RLS policies
- Built 9 service files (student, teaching, class, idea, sop, workLog, goal, schoolEvent, timetable)
- All CRUD operations write-through to Supabase with localStorage cache
- Auto-sync: localStorage data migrates to Supabase on first load
- All services use `upsert` for seamless local→cloud migration

### Phase 9 — Deployment (2026-03-01)
- GitHub Actions CI/CD workflow for auto-deploy
- GitHub Pages hosting with Vite base path config
- Supabase credentials stored as GitHub Secrets
- Live at: https://git25math.github.io/25maths-dashboard/

### Phase 10 — Sub-Unit Module 小单元模块 (2026-03-01)
- New data model: `SubUnit`, `VocabularyItem`, `TeachingReflection` types
- Each TeachingUnit (大单元) now contains multiple SubUnits (小单元)
- SubUnit fields: title, objectives, periods, bilingual vocabulary, classroom exercises, 4 resource links, homework content, teaching reflection (5 sub-fields), AI summary
- New `SubUnitForm` modal component with dynamic lists, RichTextEditor, URL inputs, date picker
- Updated TeachingView: sub-unit card grid in unit detail, full sub-unit detail view (2/3 + 1/3 layout)
- Sub-unit CRUD operates on parent unit's `sub_units` JSONB array
- Supabase migration: `sub_units` JSONB column on `teaching_units` table (deployed via `supabase db push`)
- Backward compatible: existing `lessons` field preserved
- Deployed to production: GitHub Pages + Supabase remote DB

### Phase 11 — Supabase Storage & Resource Links (2026-03-01)
- Created public `teaching-files` Supabase Storage bucket with anon RLS policies
- New `storageService.ts`: `uploadFile()` uploads to `teaching-files/{timestamp}_{filename}`, returns public URL
- SubUnitForm: replaced 4 plain URL inputs with `UrlWithUpload` component (text input + paperclip upload button)
- Supports both pasting external links and direct PDF/doc upload to Supabase Storage
- Upload shows loading spinner, auto-fills URL on success, alerts on failure
- Accepts `.pdf`, `.doc`, `.docx`, `.ppt`, `.pptx`
- Added `vocab_practice_url` field to `SubUnit` type and form (核心词汇练习链接)
- Resource links now: Worksheet, Online Practice, Kahoot, Homework, Vocab Practice (5 total)

### Phase 12 — Meeting Records 会议记录 (2026-03-02)
- New feature: record meetings via browser microphone, auto-transcribe and generate AI summaries
- Data model: `MeetingRecord`, `AISummary`, `ActionItem` types
- Supabase migration: `meeting_records` table with RLS policies (deployed via `supabase db push`)
- New `meetingService.ts`: CRUD for meeting records (ID prefix `mt-`)
- New `geminiService.ts`: two Gemini 2.0 Flash API calls
  - `transcribeAudio()`: base64 audio → bilingual (Chinese/English) transcript
  - `generateMeetingSummary()`: transcript → structured JSON (summary, key_points, action_items, decisions)
- New `MeetingsView.tsx`: full meeting management view
  - Card grid list with category filter and status badges
  - Inline new meeting form (title, date, category, participants)
  - Detail view: MediaRecorder recording (start/pause/stop with live timer)
  - Auto-pipeline: stop recording → Gemini transcribe → Gemini summarize → 4-panel display
  - Inline card editing, regenerate summary button
- Sidebar: "Meetings" entry with Mic icon between Work Logs and SOP Library
- 9 meeting categories with distinct color badges:
  Flag Raising (red), WS Staff Meeting (purple), US Staff Meeting (violet),
  Tutor Meeting (green), Department Meeting (indigo), SPTC Meeting (cyan),
  Assembly (amber), Parent Meeting (orange), Others (grey)
- Audio is ephemeral (browser memory only) — only transcript and AI summary persist to Supabase
- `useAppData` hook: added meetings state, Supabase sync, `addMeeting`/`updateMeeting`/`deleteMeeting`
- Environment: `VITE_GEMINI_API_KEY` in `.env.local`

### Phase 13 — Idea Pool Enhancement 灵感池增强 (2026-03-02)
- Idea status expanded from 2-state to 3-state: `note`(只是记录) / `pending`(待处理) / `processed`(已处理)
- Status badge click cycles through states: note → pending → processed → note
- Status badge colors: note=slate, pending=amber, processed=emerald, with Chinese labels
- New `show_on_dashboard` boolean field on ideas (Supabase migration: `20260302100000_idea_dashboard_flag.sql`)
- IdeasView: 4 filter tabs (All / Note / Pending / Processed), default to Pending
- IdeasView: cards sorted by `created_at` descending (newest first)
- IdeasView: Eye/EyeOff icon per card to toggle Dashboard visibility
- IdeaForm: new toggle switch for "Show on Dashboard"
- Dashboard: "Recent Work Logs" renamed to "Recent Updates"
- Dashboard: mixes WorkLogs + dashboard-visible Ideas, sorted by time, top 5 items
- Dashboard: Ideas shown with purple indicator bar and "Idea" source label (vs green/indigo for WorkLogs)
- `useAppData`: `toggleIdeaStatus()` now 3-state cycle; new `toggleIdeaDashboard()` function

### Phase 14 — Timetable → Lesson Records 上课记录自动关联 (2026-03-02)
- New `lessonRecordService.ts`: CRUD service for `lesson_records` table (ID prefix `lr-`)
- New `LessonRecordsView.tsx`: dedicated view for browsing/editing lesson records
  - Class tab filtering (All + per-class buttons)
  - Records sorted by date descending
  - Inline editing: click Edit to expand full edit form within the card
  - Manual "New Record" form with all fields (date, class, topic, progress, homework, notes, next plan)
  - Delete with confirmation
- **Auto-record**: `updateTimetableEntry` in `useAppData` now auto-upserts a `LessonRecord` when saving a `type=lesson` entry with topic or notes
  - Key: `date (today) + class_name` — same day + same class updates existing record, new day creates new record
  - Ensures weekly records accumulate without overwriting history
- TimetableEntryForm: added standalone "Topic" input field (previously only in subject)
- TimetableEntryForm: save area shows hint "Saving will auto-record to Lesson Records" for lesson-type entries
- Sidebar: "Lesson Records" entry with FileText icon, placed after Teaching
- `useAppData`: `lessonRecords` state with localStorage persistence, Supabase fetchOrSync, 3 CRUD functions (`addLessonRecord`, `updateLessonRecord`, `deleteLessonRecord`)

### Phase 15 — Password Protection 增强安全性 (2026-03-02)
- LoginGate token format upgraded: plain hash string → JSON `{ hash, timestamp }` with automatic old-format migration
- **7-day session expiry**: token validated against `Date.now() - timestamp < 7 days`; expired tokens auto-cleared on mount
- **AuthContext + useAuth() hook**: React Context exposing `logout()` function to all child components
- **Logout button**: added to both desktop sidebar (below "Current Role" card) and mobile sidebar (bottom of nav)
- Logout clears localStorage token and returns to login screen
- App restructured: split into `App` (LoginGate wrapper) + `AppContent` (inner component consuming auth context)
- **deploy.yml fix**: added missing `VITE_GEMINI_API_KEY` secret to build env (production meeting transcription now works)

### Phase 16 — Missing Views + Settings 全功能设置 (2026-03-02)
- New `GoalsView.tsx`: dedicated goals management with full CRUD
  - Category filter (All / Dream / Work / Startup), Status filter (All / In Progress / Completed / On Hold)
  - Responsive card grid (3-col lg, 2-col md, 1-col sm), each card with category badge, clickable status badge (cycles through states), progress bar with percentage, optional deadline, optional header background image
  - Hover: Edit + Delete buttons; empty state placeholder
- New `GoalForm.tsx`: modal form following IdeaForm pattern
  - Fields: title, category (button group), status (button group), progress (range slider 0-100 with live label), deadline (date), image_url (text)
  - Create / Edit mode based on `goal` prop
- New `SchoolEventsView.tsx`: dedicated school events management with full CRUD
  - Category filter (All / School-wide / Personal / House / Event), sorted by date descending
  - Single-column card list with category badge, date, MarkdownRenderer description (line-clamp-2)
  - `is_action_required` → red AlertTriangle icon + "Action Required" label
  - Hover: Edit + Delete buttons; empty state placeholder
- New `SchoolEventForm.tsx`: modal form following IdeaForm pattern
  - Fields: title, date, category (button group), description (RichTextEditor), is_action_required (toggle switch)
- New `SettingsView.tsx`: self-contained settings page using `useAuth()` for logout
  - **Profile**: role display ("Math Teacher"), app version "v1.0", logout button
  - **Change Password**: current/new/confirm fields → SHA-256 hash validation against stored hash, updates localStorage token
  - **Data Management**: "Clear Local Cache" (removes all `dashboard-*` keys, reloads), "Export Data" (downloads all entities as JSON)
  - **About**: app description, tech stack summary, GitHub repo link
- `sidebarConfig.ts`: added Goals (Target icon), School Events (CalendarDays icon), Settings (Settings icon)
- `App.tsx`: imported 5 new components, added `isGoalFormOpen/editingGoal` and `isEventFormOpen/editingEvent` state, 3 new switch cases (`goals`, `events`, `settings`), GoalForm + SchoolEventForm modal renders
- `DashboardView.tsx`: Goals section "View All" → navigates to `'goals'`; School Events "View All" → navigates to `'events'` (was incorrectly pointing to `'timetable'`)

### Phase 17 — Data & UX Improvements 数据与用户体验 (2026-03-02)
- **Dark Mode**: full dark theme with `useDarkMode` hook (localStorage + `prefers-color-scheme` fallback)
  - Toggle `dark` class on `<html>`, persists across reloads
  - CSS overrides for `.glass-card`, `.btn-secondary`, `.markdown-content` in `index.css`
  - `dark:` prefixes added to all 12 views, 13 components, App.tsx, SidebarItem, LoginGate
  - Toggle button in desktop sidebar footer, mobile nav bar, and mobile sidebar
  - "Appearance" settings card with toggle switch in SettingsView
- **Global Search (Cmd+K)**: `GlobalSearch.tsx` overlay at z-[70] with keyboard shortcut
  - Case-insensitive substring search across all 11 entity types
  - Fields searched: Student (name, chinese_name, class_name, notes), TeachingUnit (title, year_group), Idea (title, content), SOP (title, content), WorkLog (content), Goal (title), SchoolEvent (title, description), Meeting (title, participants), LessonRecord (topic, class_name), Class (name), Timetable (subject, class_name, topic)
  - Results grouped by type with lucide icons, max 5 per type, click navigates to tab
  - Escape / backdrop click to close
- **Bulk Import**: JSON import in SettingsView for data restoration
  - `bulkImport()` in `useAppData`: maps 11 known entity keys to state setters
  - Hidden file input (`.json`), parses + validates (checks for known keys + Array values)
  - Confirmation dialog showing entity names + item counts before overwrite
  - Error messages for invalid JSON / no recognized keys
- **Responsive Mobile Layout**:
  - TimetableView: extracted `TIME_SLOTS` constant, new `mobileDay` state (defaults to current weekday), mobile day-selector tabs + stacked entry cards (`md:hidden`), desktop grid wrapped in `hidden md:block`
  - 11 form components: `p-8` → `p-4 sm:p-8`, `px-8` → `px-4 sm:px-8` for form body/header/footer padding
  - WorkLogView: `<table>` wrapped in `<div className="overflow-x-auto">`
- **Drag-and-Drop Timetable** (desktop grid only):
  - Installed `@dnd-kit/core` + `@dnd-kit/utilities`
  - `DndContext` with `PointerSensor` (distance: 8 to prevent click→drag conflict)
  - Inline `DraggableEntry` + `DroppableCell` wrappers around existing entry cards / grid cells
  - `handleDragEnd`: parses droppable ID `{day}-slot-{time}`, preserves entry duration via `timeDiffMinutes()` + `addMinutesToTime()`, calls `onUpdateEntry`
  - Visual feedback: drop target highlights with indigo background, dragged entry shows 50% opacity
- New files: `src/hooks/useDarkMode.ts`, `src/components/GlobalSearch.tsx`
- Modified: 34 files total (914 insertions, 521 deletions)

### Phase 18 — Calendar View 日历视图 (2026-03-02)
- **Timetable → Calendar**: replaced weekly grid with full month calendar + day schedule panel
- Date navigation: month grid with entry count dots, week strip for mobile, "Today" quick nav
- **Date-specific entries**: new `date?: string` field on `TimetableEntry` for one-off schedule overrides
  - "Recurring Weekly" / "Specific Date" toggle in TimetableEntryForm
  - Date-specific entries override recurring at the same start_time
- Day schedule: shows merged recurring + date-specific entries for selected date
- **Quick Add**: inline form (subject, class, room, time, recurring toggle) creates entries for selected date
- **Drag-and-drop**: DnD from Phase 17 carried forward — reorder entries within day schedule
- Entry cards: start_time prefix, amber dot for date-specific, green/red dot for prep status
- Helper functions: `getEntriesForDate()`, `countEntriesForDate()` with recurring/date-specific merge logic
- Month grid: dots for entry count (≤3 = dots, >3 = number), amber dot for date-specific presence
- Mobile: week strip with chevron navigation (±1 week), responsive layout

### Phase 19 — AI Features 智能功能 (2026-03-02)
- **Gemini Lesson Plan Generation**: replaced hardcoded "Generate Plan" stub in TimetableEntryForm with real Gemini 2.0 Flash API call
  - `geminiService.generateLessonPlan()`: sends subject, topic, class, unit objectives, sub-units, completed lessons as context
  - Returns Markdown with Starter/Main/Practice/Plenary/Homework sections, appended to notes
  - Loading spinner (`Loader2`), error display, button disabled during generation
- **QuickCapture AI Auto-Categorization**: new "AI" button after category buttons
  - `geminiService.suggestCategorization()`: analyzes note text, returns `{ ideaCategory, ideaPriority, workLogCategory, tags }`
  - Auto-selects suggested category, shows "AI suggested: X" label
  - Min 10 chars required, disabled while loading, silent fail on error, reset on submit
- **Student Weakness Practice Recommendations**: enabled previously disabled "Recommend Practice" button
  - `geminiService.recommendPractice()`: sends topic, severity, notes, year group to Gemini
  - Returns concise Markdown with Diagnosis / Practice Strategy / Quick Win sections
  - Per-weakness loading state, inline rendering with `MarkdownRenderer`, ephemeral results
- **Smart Timetable Conflict Detection**: pure logic, no AI
  - New `src/lib/timetableUtils.ts`: `detectConflicts(entry, allEntries)` → `TimetableConflict[]`
  - Handles recurring vs date-specific matching by day number
  - Default 45-min duration when end_time === start_time (quick-add case)
  - TimetableEntryForm: amber warning box listing conflicts (warning only, not blocking save)
  - CalendarView DaySchedule: pulsing red dot on conflicting entry cards
- New file: `src/lib/timetableUtils.ts`
- Modified: 7 files (429 insertions, 83 deletions)

### Phase 20 — AI Idea Consolidation 智能整合 (2026-03-02)
- **AI Consolidation feature**: select multiple items, AI merges into one structured note, preview & edit, confirm replaces old with new
- Supported across 3 modules: **Ideas**, **Work Logs**, **SOP Library**
- `geminiService.ts`: 3 new Gemini 2.5 Flash methods
  - `consolidateIdeas()`: merges ideas → `{title, content, category, priority}` JSON
  - `consolidateWorkLogs()`: merges logs → `{content, category, tags}` JSON
  - `consolidateSOPs()`: merges SOPs → `{title, content, category}` JSON
- `useAppData.ts`: 3 new state management methods
  - `consolidateIdeas()`, `consolidateWorkLogs()`, `consolidateSOPs()`
  - Each: `Promise.all` delete selected → create merged new item → toast notification
- 3 new preview modal components (purple theme + Sparkles icon):
  - `ConsolidatePreviewModal.tsx` — Ideas: editable title, content (RichTextEditor), category, priority
  - `ConsolidateWorkLogPreviewModal.tsx` — WorkLogs: editable content, category, tags
  - `ConsolidateSOPPreviewModal.tsx` — SOPs: editable title, content, category (select dropdown)
- 3 views updated with selection mode:
  - `IdeasView.tsx`: Select/Exit Select toggle, card checkboxes with purple highlight ring, floating bottom bar
  - `WorkLogView.tsx`: table row checkboxes, conditional column display (hide actions in select mode)
  - `SOPView.tsx`: card checkboxes with purple highlight ring, hide expand/edit/delete in select mode
- Each view: floating bottom bar with selected count + "AI Consolidate" button (enabled at ≥2) + Cancel
- User flow: Select → check items → AI Consolidate → loading → preview modal → edit → Confirm & Replace
- `App.tsx`: wired `onConsolidate` prop for all 3 views
- New files: 3 modal components
- Modified: 5 files (977 insertions, 119 deletions across 2 commits)

### Phase 21 — AI Batch Teaching Data 批量备课数据生成 (2026-03-03)
- **Offline batch generation**: Node.js scripts extract 5 bilingual .docx teaching plans (Year 7–11) and use Gemini 2.5 Flash to generate structured teaching data
- Pipeline: `textutil` (macOS) extracts .docx → Gemini parses document structure → Gemini generates supplementary content per sub-unit
- **Generated content** (55 teaching units, 111 sub-units):
  - Objectives: extracted verbatim from documents (bilingual English + Chinese)
  - **1,575 bilingual vocabulary items** (`{english, chinese}` pairs)
  - **111 classroom exercise sets** (5-8 questions each, with LaTeX math, bilingual instructions)
  - **111 homework sets** (5-6 questions each, slightly harder than classwork)
  - Period estimates per sub-unit (1-4 × 45-min classes)
- **Supabase import**: replaced 55 empty skeleton Year 7–11 units with fully enriched data; Year 12 (17 units) preserved intact; total 72 units
- Technical challenges solved:
  - Proxy-aware API calls via `curl` (Node.js `fetch` doesn't respect `HTTP_PROXY`)
  - LaTeX-in-JSON sanitizer: fixes `\frac`→`\f` (form feed), `\times`→`\t` (tab), `\sqrt`→`\s` (invalid) collisions with JSON escape characters
  - Incremental save per year-group for crash recovery; retry script for failed sub-units
- New files:
  - `scripts/generate-teaching-data.mjs` — main generation script (~59 Gemini API calls)
  - `scripts/retry-failed.mjs` — retry failed sub-units
  - `scripts/import-to-supabase.mjs` — direct Supabase batch upsert (DELETE old + INSERT new)
  - `scripts/output/teaching-units-all.json` — combined output (752KB, import-ready)
- Modified: 0 source files (scripts only, no app code changes)

### Phase 22 — Learning Objectives 教学目标结构化 (2026-03-03)
- **SubUnit objectives upgraded**: `objectives: string[]` → `learning_objectives: LearningObjective[]` structured objects
- Each Learning Objective now has: `id`, `objective` (bilingual text), `status` (not_started / in_progress / completed), `periods`, optional `notes`
- **Backward compatibility**: `normalizeTeachingUnit()` adapter auto-converts old `string[]` data from Supabase/localStorage to new format on load
- **SubUnitForm**: replaced flat text inputs with structured LO cards — each card has objective textarea, status dropdown (3 states), periods number input
- **TeachingView Sub-Unit Detail**: LO cards with color-coded status badges (slate/amber/emerald), click-to-cycle status, progress bar (completed/total)
- **TeachingView Unit Detail**: sub-unit cards show "X/Y LOs" completion progress instead of plain count
- **Class Progress Tracking** (TeachingView + DashboardView): progress calculated from completed LOs across all sub-units (was sub-unit count)
- **AI context**: TimetableEntryForm maps `learning_objectives` to strings for Gemini lesson plan generation
- **Hotfix — localStorage migration race condition**: normalizer ran in `useEffect` (post-render), but first render accessed `learning_objectives` on old data → `undefined.length` crash → blank page. Fix: added `|| []` defensive fallbacks at all view-layer access points + eager normalization `useEffect` on mount
- New files:
  - `src/lib/teachingAdapter.ts` — `normalizeTeachingUnit()` migration adapter
- Modified files (7): types.ts, SubUnitForm.tsx, TeachingView.tsx, DashboardView.tsx, TimetableEntryForm.tsx, teachingService.ts, useAppData.ts

### Phase 23-UI — Teaching 页面 + 表单体验优化 (2026-03-03)
- **TeachingView LO cards** (Sub-Unit Detail): replaced right-side text status button with left-side clickable status icons (`Circle`/`Clock`/`CheckCircle2`), moved periods text below objective, added completion percentage to stats header (`3/5 completed (60%)`)
- **TeachingView Sub-Unit cards** (Unit Detail): added mini `h-1` emerald progress bar at bottom of each card, updated text to `"3/5 LOs completed"`
- **TeachingView Year Units List**: added total LO count next to sub-unit count (`"3 Sub-Units · 12 LOs"`)
- **TeachingView Class Progress**: added `"X/Y LOs completed"` text below progress bar, color-coded progress bar (red < 30%, amber 30-70%, emerald > 70%)
- **SubUnitForm LO editing**: added `#1, #2...` numbered badges, replaced status dropdown with 3 icon buttons (`Circle`/`Clock`/`CheckCircle2`) with `ring-2` highlight on active, added `shadow-sm` to cards, added empty state guidance
- **SubUnitForm section dividers**: added `border-t border-slate-100 pt-8` between all sections
- **SubUnitForm section icons**: Target (LO), BookOpen (Vocab), Link (Resources), MessageSquare (Reflection)
- **SubUnitForm upload error**: replaced `alert()` with inline `<p className="text-xs text-red-500">` error message
- Modified files (2): TeachingView.tsx, SubUnitForm.tsx

### Phase 24 — 日程管理增强 + 上课记录自然衔接 (2026-03-03)
- **Data model**: `TimetableEntry` 新增 `recurring_id` 字段（单日覆盖指向原重复日程 ID）；`LessonRecord` 新增 `timetable_entry_id` 字段（反向关联日程条目）
- **Supabase migration**: `20260304000000_timetable_lesson_linkage.sql` — 两个 ALTER TABLE
- **单日覆盖 (Single-day override)**:
  - TimetableEntryForm：编辑重复日程时顶部显示 amber 横幅 "Only modify {date}" 按钮
  - 点击后克隆为新条目（设 `date` + `recurring_id`），保存为独立条目不影响模板
  - 已覆盖条目显示 "Override" 标签 + "Restore Default" 按钮（删除覆盖恢复模板）
  - CalendarView 日程卡片：覆盖条目显示 "OVR" amber 标签
  - `getEntriesForDate()` 增强：通过 `recurring_id` 隐藏已被覆盖的重复日程
- **QuickAdd 增强**:
  - 5 个课程类型按钮（lesson / tutor / duty / meeting / break），默认 lesson
  - 新增结束时间输入，与开始时间同行
  - 班级改为下拉选择器（从 `classes` 填充），选中后自动设 `class_id`
  - 勾选"Recurring"后显示周一～五 checkbox，支持多天批量创建
  - "Full editor →" 链接：打开 TimetableEntryForm 并预填当前 QuickAdd 数据
- **内联上课记录 (Inline Lesson Record)**:
  - TimetableEntryForm 底部新增 teal 色 "Lesson Record" section（仅 `type=lesson` 时显示）
  - 自动匹配记录：先按 `timetable_entry_id` 查，回退到 `date + class_name` 查
  - 已有记录：展开 progress / homework_assigned / next_lesson_plan 三个可编辑字段 + "Save Record" 按钮
  - 无记录：显示 "Create Lesson Record" 按钮，预填 date / class_name / topic
- **Auto-record 修复**: `addTimetableEntry` 现在也自动创建 LessonRecord（之前仅 `updateTimetableEntry` 有此逻辑），并设 `timetable_entry_id`
- **deleteTimetableEntry**: 新增删除日程函数（用于删除覆盖条目）
- **上课记录 → 日历跳转**: LessonRecordsView 每条记录增加日历图标按钮，点击跳转到对应日期的日历视图
- **CalendarView `initialDate` prop**: 支持从外部（LessonRecordsView）跳转到指定日期
- **日程卡片上课记录图标**: lesson 类型卡片匹配到 LessonRecord 时右上角显示 teal 色 `FileText` 图标
- New file: `supabase/migrations/20260304000000_timetable_lesson_linkage.sql`
- Modified files (6): types.ts, useAppData.ts, TimetableEntryForm.tsx, CalendarView.tsx, LessonRecordsView.tsx, App.tsx

### Phase 24b — 上课记录富文本支持 (2026-03-03)
- **LessonRecordsView**: notes 和 next_lesson_plan 字段全面升级为 Markdown + LaTeX 富文本
  - 新建表单：`<textarea>` → `RichTextEditor`（带实时预览 + LaTeX 渲染）
  - 编辑表单：`<textarea>` → `RichTextEditor`
  - 展示模式：`<p>` → `MarkdownRenderer`（渲染 Markdown 格式 + KaTeX 公式）
- **TimetableEntryForm 内联上课记录面板**: next_lesson_plan 字段 `<textarea>` → `RichTextEditor`
- Modified files (2): LessonRecordsView.tsx, TimetableEntryForm.tsx

### Phase 24c — HousePoint 积分分配系统 (2026-03-03)
- **数据模型**: 新增 `HousePointAward` 接口（student_id, student_name, points, reason），`LessonRecord` 新增 `house_point_awards?: HousePointAward[]` 字段
- **Supabase migration**: `20260305000000_lesson_record_house_points.sql` — ALTER TABLE 增加 `house_point_awards jsonb` 列
- **积分同步逻辑** (`useAppData.ts`):
  - `computeHousePointDeltas(oldAwards, newAwards)`: 计算新旧 awards 间的积分差值 Map
  - `applyHousePointDeltas()`: 批量更新学生 `house_points`，`Math.max(0, ...)` 防止负数
  - `addLessonRecord`: 创建后自动给 awards 中的学生加分
  - `updateLessonRecord`: old vs new delta 计算，仅修改差值部分
  - `deleteLessonRecord`: 反扣已发放积分
- **新组件 `HousePointAwardsEditor.tsx`** (emerald 色系):
  - 学生选择器：下拉列表按 class_name 过滤，已选学生自动排除
  - 每条 award: 学生名 | 分数下拉 (1-10) | 理由输入 | 删除按钮
  - 底部汇总：学生数 + 总分
- **LessonRecordsView**: 新增 `students` prop + `newAwards`/`editAwards` state
  - 新建表单：选定 class 后显示 HousePointAwardsEditor
  - 编辑表单：`startEdit` 初始化 editAwards，内嵌 Editor
  - 展示模式：awards 渲染为 emerald 色标签列表（学生名 +积分 +理由）
- **TimetableEntryForm**: 新增 `students` prop + `lrAwards` state
  - 从 matchedLessonRecord 初始化 lrAwards
  - 内联面板 Next Lesson Plan 下方显示 HousePointAwardsEditor（按 class_name 过滤学生）
  - `handleSaveLessonRecord` / `handleCreateLessonRecord` 合并 awards
- **App.tsx**: `LessonRecordsView` 和 `TimetableEntryForm` 传入 `students={data.students}`
- New files: HousePointAwardsEditor.tsx, migration SQL
- Modified files (5): types.ts, useAppData.ts, LessonRecordsView.tsx, TimetableEntryForm.tsx, App.tsx

### Hotfix — Work Logs 排序修复 (2026-03-03)
- **WorkLogView**: `filteredLogs` 添加显式 `sort((a, b) => b.timestamp.localeCompare(a.timestamp))`，确保始终按 timestamp 倒序（最新在前）
  - 之前仅依赖 `addWorkLog` 的 `[created, ...prev]` 插入顺序，Supabase 加载后顺序不保证
- Modified files (1): WorkLogView.tsx

### Phase 25 — Self-Evolve Dev Console 自进化开发控制台 (2026-03-03)
- **Self-Evolve workflow**: `.github/workflows/self-evolve.yml` — `workflow_dispatch` with `instruction` + `provider` (claude/gemini) inputs
  - Checkout → npm ci → install AI CLI → run instruction with mandatory suffix (update DEVELOPMENT.md, build verification, no self-commit)
  - Independent `npm run build` verification step with all VITE_* secrets
  - Auto-commit by `self-evolve[bot]` + push to main → triggers existing deploy.yml
  - Concurrency group `self-evolve` prevents parallel runs
- **GitHub Service**: `src/services/githubService.ts` — REST API wrapper
  - `triggerWorkflow(instruction, provider)`: POST workflow_dispatch
  - `listRuns(perPage)`: GET workflow runs for self-evolve.yml
  - `getRun(runId)`: GET single run details
  - `isConfigured()`: checks `VITE_GITHUB_TOKEN` availability
  - Auth via Fine-grained PAT (Actions R/W + Contents R/W)
- **DevConsoleView**: `src/views/DevConsoleView.tsx` — self-contained view (no props, like SettingsView)
  - **Instruction input**: textarea + provider toggle (Claude/Gemini) + Execute button
  - **Run history**: status icons (Clock/Loader2-spin/CheckCircle2/XCircle), color-coded status badges, relative timestamps, duration, GitHub external link
  - **Auto-polling**: `useRef` + `setInterval` 5s when active runs exist, auto-stops on completion
  - **Token guard**: unconfigured token shows setup instructions (no crash)
- **Sidebar**: Terminal icon, positioned between SOP Library and Settings
- **Environment**: `VITE_GITHUB_TOKEN` added to vite-env.d.ts, .env.example, deploy.yml
- **API Key 轮换**: 3 个 Anthropic API key 自动 fallback（一个限速自动切换下一个）
  - Workflow input `api_key_slot`: auto / 1 / 2 / 3
  - Auto 模式: `run_number % 3` 选起始 key，失败自动轮换
  - DevConsoleView: Key 选择器 (Auto / #1 / #2 / #3)
- New files (3): self-evolve.yml, githubService.ts, DevConsoleView.tsx
- Modified files (6): sidebarConfig.ts, App.tsx, vite-env.d.ts, .env.example, deploy.yml, DEVELOPMENT.md

### Hotfix — Dashboard "View History" 导航修复 (2026-03-03)
- **DashboardView → Work Logs**: 点击 "View History" 按钮不再自动弹出 New Work Log 表单
  - 之前 `onNavigate('worklogs')` 在 App.tsx 中会同时执行 `setIsWorkLogFormOpen(true)`，导致跳转后立即弹出新建窗口
  - 修复: 移除 `onNavigate` 中的表单自动打开逻辑，仅执行 `setActiveTab(tab)`
- Modified files (1): App.tsx

### Security — GitHub PAT 迁移至服务端 (2026-03-03)
- **问题**: `VITE_GITHUB_TOKEN` 以 `VITE_` 前缀存在，被打包进前端 JS，浏览器 DevTools 可提取完整 PAT
- **方案**: 新建 Supabase Edge Function `github-proxy` 作为服务端代理，前端不再持有 GitHub PAT
- **Edge Function**: `supabase/functions/github-proxy/index.ts`
  - 从 `Deno.env.get('GITHUB_PAT')` 读取服务端密钥
  - 3 个操作: `triggerWorkflow` / `listRuns` / `getRun`
  - 硬编码 OWNER/REPO/WORKFLOW（不暴露通用代理）
  - CORS 头 + preflight 处理
- **githubService.ts**: 完全重写
  - 移除 `getToken()` / `ghFetch()` 直连 GitHub API
  - 改为 `requireSupabase().functions.invoke('github-proxy', { body })` 调代理
  - `isConfigured()` 改为检查 Supabase 是否可用
- **DevConsoleView**: 守卫提示从 "GitHub Token Not Configured" 改为 "Supabase Not Configured"
- **环境变量清理**:
  - 移除 `VITE_GITHUB_TOKEN` 自 `vite-env.d.ts`, `.env.example`, `.env.local`, `deploy.yml`, `self-evolve.yml`
  - GitHub PAT 改为 Supabase Edge Function 服务端密钥: `supabase secrets set GITHUB_PAT=...`
- New files (2): `supabase/functions/_shared/cors.ts`, `supabase/functions/github-proxy/index.ts`
- Modified files (7): githubService.ts, DevConsoleView.tsx, vite-env.d.ts, .env.example, .env.local, deploy.yml, self-evolve.yml

### Phase 26 — SchoolEvent 多模式时间支持 (2026-03-03)
- **需求**: 原 SchoolEvent 仅有单个 `date` 字段，无法表达连续多天、定时、跨天定时等活动场景
- **数据模型**: 新增 `EventTimeMode` 类型 (`'all-day' | 'multi-day' | 'timed' | 'multi-day-timed'`)
  - SchoolEvent 新增 4 字段: `end_date?`, `start_time?`, `end_time?`, `time_mode?`
  - `time_mode` 默认 `'all-day'`，向后兼容旧数据（无字段时按整日处理）
- **SchoolEventForm**: 新增 4 模式按钮组（整日活动/连续数天/定时活动/跨天定时），每个带图标+主题色
  - 根据 mode 条件显示字段：all-day 仅 Date；multi-day 显示 Start Date + End Date；timed 显示 Date + Start/End Time；multi-day-timed 全部显示
  - Category 按钮组独立为单独 section
- **SchoolEventsView**: `formatEventDate()` 按 mode 分支渲染
  - all-day: `Monday, Mar 10, 2026`
  - multi-day: `Mar 10 – Mar 14, 2026`
  - timed: `Monday, Mar 10, 2026 · 14:00–16:00`
  - multi-day-timed: `Mar 10 08:00 – Mar 12 17:00`
- **DashboardView**: `formatEventDateShort()` 简短格式
  - all-day: `Mar 10` / multi-day: `Mar 10–14` / timed: `Mar 10 14:00` / multi-day-timed: `Mar 10–12`
- **GlobalSearch**: `getDisplaySubtitle` 对 schoolEvents 返回 mode-aware 格式化日期
- **Supabase migration**: `20260307000000_school_event_time_modes.sql` — 新增 `end_date`, `start_time`, `end_time`, `time_mode` 四列
- New files (1): migration SQL
- Modified files (5): types.ts, SchoolEventForm.tsx, SchoolEventsView.tsx, DashboardView.tsx, GlobalSearch.tsx

---

## Current Architecture

```
Browser
  ├── React App (Vite build)
  │     ├── Views: Dashboard, Timetable, Students, Teaching, LessonRecords, HPHistory, Ideas, WorkLogs, Goals, SchoolEvents, Meetings, EmailDigest, SOP, Settings
  │     ├── useAppData hook (central state management + bulkImport)
  │     ├── useDarkMode hook (theme toggle with localStorage persistence)
  │     ├── useLocalStorage (cache layer)
  │     ├── GlobalSearch (Cmd+K overlay, cross-entity search)
  │     ├── 14 Service files (Supabase API layer + Edge Function proxy for GitHub Actions)
  │     ├── @dnd-kit (drag-and-drop timetable grid)
  │     ├── geminiService (Gemini 2.5 Flash: transcription, meeting summary, lesson plans, categorization, practice recs, idea/worklog/SOP consolidation, email digest)
  │     └── timetableUtils (conflict detection for recurring/date-specific entries)
  │
  └── Data Flow:
        Load:   Supabase → State (fallback: localStorage → auto-sync to Supabase)
        Write:  Service (Supabase) → State → localStorage (write-through cache)
```

**Key UI Patterns**: glass-card, cn() utility, emerald HP theming, indigo class filters, blue parent-comm theming, fixed floating action bars

**Student Sub-record Forms**: GenericForm (status/request text), WeaknessForm (topic/level/notes), ParentCommForm (date/method/content/follow-up)

**Supabase Tables** (15):
students, student_status_records, student_requests, teaching_units, classes, ideas, sops, work_logs, goals, school_events, timetable_entries, lesson_records, meeting_records, hp_award_logs, email_digests

---

## Roadmap

### ~~Phase 14 — Timetable → Lesson Records 上课记录自动关联~~ ✅ Done
- [x] 上课时在 TimetableEntryForm 记录的 topic/notes 自动写入对应班级的 LessonRecord
- [x] 每周自动新建 LessonRecord，不覆盖历史记录（按 date + class_name 去重）
- [x] Lesson Records view: 按班级分组查看历史上课记录
- [x] LessonRecord 与 TimetableEntry 双向关联（timetable_entry_id）— done in Phase 24

### ~~Phase 15 — Password Protection 增强安全性~~ ✅ Done
- [x] Login gate with SHA-256 password authentication
- [x] Protect all routes behind auth check
- [x] 7-day session expiry with JSON token format
- [x] Logout button in desktop & mobile sidebars
- [x] deploy.yml: added VITE_GEMINI_API_KEY for production meeting transcription

### ~~Phase 16 — Missing Views + Settings 全功能设置~~ ✅ Done
- [x] Goals dedicated view with category/status filters, card grid, full CRUD, clickable status cycle
- [x] School Events dedicated view with category filter, action required flag, full CRUD
- [x] Settings page: profile, password change (SHA-256), data export (JSON), cache clear, about info
- [x] GoalForm + SchoolEventForm modals following IdeaForm pattern
- [x] Sidebar entries: Goals (Target), School Events (CalendarDays), Settings
- [x] Dashboard "View All" links navigate to Goals and School Events views

### ~~Phase 17 — Data & UX Improvements 数据与用户体验~~ ✅ Done
- [x] Idea Pool: 3-state status filter, dashboard visibility toggle, sorted by date (Phase 13)
- [x] Global search (Cmd+K) across all 11 entity types with grouped results
- [x] Bulk JSON import in Settings with validation + confirmation dialog
- [x] Drag-and-drop timetable editing on desktop grid (@dnd-kit, preserves duration)
- [x] Responsive mobile layout: TimetableView day tabs, form padding responsive, WorkLog table scroll
- [x] Dark mode toggle with localStorage persistence + system preference fallback
- [x] File storage: Supabase Storage upload for PDFs/docs in sub-unit resource fields (Phase 11)

### ~~Phase 18 — Calendar View 日历视图~~ ✅ Done
- [x] Month calendar grid with entry count dots and date navigation
- [x] Date-specific entries (one-off overrides) with recurring/date-specific toggle
- [x] Day schedule panel with merged recurring + date-specific entries
- [x] Quick Add inline form for fast entry creation
- [x] Mobile week strip with responsive layout

### ~~Phase 19 — AI Features 智能功能~~ ✅ Done
- [x] Meeting audio transcription via Gemini 2.0 Flash (Phase 12)
- [x] AI meeting summary generation — key points, action items, decisions (Phase 12)
- [x] Gemini-powered lesson plan generation (replaces hardcoded stub)
- [x] Auto-categorization of ideas via AI button in QuickCapture
- [x] Student weakness practice recommendations with inline Markdown rendering
- [x] Smart timetable conflict detection with amber warnings + pulsing red dots

### ~~Phase 20 — AI Idea Consolidation 智能整合~~ ✅ Done
- [x] Select mode in Ideas, Work Logs, SOP Library (checkbox + purple highlight)
- [x] Floating bottom bar with selected count + AI Consolidate button (≥2 to activate)
- [x] Gemini 2.5 Flash consolidation: merges multiple items into one structured note
- [x] Preview modal (purple theme): editable AI result before confirming
- [x] Confirm & Replace: deletes old items, creates merged new item, Supabase synced
- [x] 3 new preview modals, 3 new geminiService methods, 3 new useAppData methods

### ~~Phase 21 — AI Batch Teaching Data 批量备课数据生成~~ ✅ Done
- [x] Offline Node.js scripts: extract .docx → Gemini parse → Gemini generate content
- [x] 55 teaching units × 111 sub-units with vocabulary, exercises, homework
- [x] 1,575 bilingual vocabulary items generated
- [x] LaTeX-in-JSON sanitizer for backslash collision handling
- [x] Incremental save + retry for API failure resilience
- [x] Direct Supabase import: replaced skeleton data with enriched content

### ~~Phase 22 — Learning Objectives 教学目标结构化~~ ✅ Done
- [x] SubUnit objectives: `string[]` → `LearningObjective[]` (id, objective, status, periods, notes)
- [x] Backward-compat normalizer in `teachingAdapter.ts`
- [x] SubUnitForm: structured LO editing (objective, status, periods per LO)
- [x] TeachingView: color-coded LO cards with click-to-cycle status + progress bar
- [x] Class progress tracking: LO-based completion across TeachingView & DashboardView
- [x] Hotfix: `|| []` defensive guards for first-render before normalizer useEffect runs

### ~~Phase 23-UI — Teaching 页面 + 表单体验优化~~ ✅ Done
- [x] LO cards: left-side status icons (Circle/Clock/CheckCircle2) with click-to-cycle, periods below text, completion %
- [x] Sub-Unit cards: mini emerald progress bar, "X/Y LOs completed" text
- [x] Year Units List: total LO count ("3 Sub-Units · 12 LOs")
- [x] Class Progress: color-coded progress bar (red/amber/emerald), LO count text
- [x] SubUnitForm: numbered badges, icon button group for status, section dividers + icons, inline upload error

### ~~Phase 24 — 日程管理增强 + 上课记录自然衔接~~ ✅ Done
- [x] 单日覆盖：编辑重复日程时可"仅修改本日"，克隆为独立条目（`recurring_id` 关联）
- [x] 覆盖条目可"恢复默认"（删除覆盖），日历卡片显示 OVR 标签
- [x] QuickAdd 增强：课程类型选择 / 结束时间 / 班级下拉 / 多天重复 / 完整编辑入口
- [x] 内联上课记录：TimetableEntryForm 内直接编辑 progress / homework / next plan
- [x] LessonRecord ↔ TimetableEntry 双向关联（`timetable_entry_id` + `recurring_id`）
- [x] `addTimetableEntry` 自动创建 LessonRecord + `deleteTimetableEntry` 新增
- [x] 上课记录页面 → 日历跳转（CalendarDays 图标 → 切换到对应日期）
- [x] 日程卡片显示 lesson record 关联图标（teal FileText）
- [x] 上课记录 notes / next_lesson_plan 支持 Markdown + LaTeX 富文本（RichTextEditor + MarkdownRenderer）
- [x] HousePoint 积分分配：LessonRecord 中记录学生积分 awards，自动同步到学生 house_points 总数，支持新建/编辑/删除时的 delta 计算

### ~~Phase 25 — Self-Evolve Dev Console 自进化开发控制台~~ ❌ Removed
- 已下架：Self-Evolve 依赖 Anthropic API 按量付费，实际使用中本地 Claude Code（订阅制）更高效
- 删除：DevConsoleView、githubService、github-proxy Edge Function、self-evolve.yml workflow、侧边栏入口
- Dashboard "View History" 导航修复保留（不依赖 Self-Evolve）

### ~~Phase 26 — SchoolEvent 多模式时间支持~~ ✅ Done
- [x] 新增 `EventTimeMode` 类型 + SchoolEvent 4 个时间字段 (end_date, start_time, end_time, time_mode)
- [x] SchoolEventForm: 4 模式按钮组（整日/连续数天/定时/跨天定时）+ 条件字段显示
- [x] SchoolEventsView: mode-aware 完整日期格式化
- [x] DashboardView: mode-aware 简短日期格式化
- [x] GlobalSearch: subtitle mode-aware 格式化
- [x] Supabase migration: 新增 4 列
- [x] 向后兼容：`time_mode` 默认 `'all-day'`，旧数据无需迁移

### ~~Phase 27 — 会议记录行动方案闭环 Meeting-to-Action Pipeline~~ ✅ Done
- [x] **AI Smart Extract**: 替代旧 Extract to Tasks，Gemini 分析完整 AISummary 4 板块 + 会议元数据，AI 判断优先级/描述/标签/来源
- [x] **SmartExtractModal**: teal 主题预览弹窗，任务列表可 toggle 启用/禁用 + 展开编辑（priority/description/assignee/due_date/tags），来源板块彩色标签
- [x] **Related Tasks Panel**: 会议详情页关联任务追踪面板，进度条 + X/Y completed，可点击 status 循环状态
- [x] **Action Plan Generation**: 一键生成结构化 Markdown 行动方案（会议概要/关键决定/行动计划表格/时间线/风险跟进）
- [x] **ActionPlanModal**: teal 主题展示弹窗，MarkdownRenderer 渲染 + Copy to Clipboard + Save as SOP
- [x] **Per-Item Task Conversion**: Key Points / Decisions / Action Items 每条 hover 显示转换按钮，单条快捷转为任务，转换后图标变绿
- [x] 新增 `SmartTaskPreview` 类型、`generateSmartTasks()` + `generateActionPlan()` geminiService 方法
- [x] App.tsx 传入 `tasks` + `onCycleTaskStatus` + `onAddSOP` 至 MeetingsView

### ~~Phase 27.1 — Hotfix: Tasks 表缺失 + ID 碰撞 + 错误诊断~~ ✅ Done
- [x] **根因修复**: 3 个 Supabase migration 未推送到生产库（`supabase db push`），tasks 表不存在导致所有任务操作 404
- [x] **ID 碰撞修复**: `taskService.genId()` 加随机后缀，防止批量创建时 `Date.now()` 同毫秒主键冲突
- [x] **错误诊断增强**: `addTask` toast 显示实际 Supabase 错误信息（替代笼统 "Failed to add task"），`taskService.create` 输出完整 error + payload 到控制台
- [x] **数据清洗**: `addTask` 调用前 `Object.fromEntries` 过滤 `undefined` 字段，避免 PostgREST 序列化问题
- [x] **批量创建健壮性**: `handleSmartExtractConfirm` 改为 `async/await` 顺序创建，每条独立 try-catch

### ~~Phase 27.2 — Hotfix: 移动端侧边栏滚动~~ ✅ Done
- [x] 移动端 + 桌面端侧边栏 `<nav>` 添加 `overflow-y-auto min-h-0`，14 个菜单项在小屏幕上可滚动
- [x] 标题区域添加 `shrink-0` 防止被压缩

### Phase 28 — Student Management Enhancement 学生管理增强 (2026-03-03)
- **Class-Based Filtering**: "All Students" 标签页新增班级筛选 tabs（indigo 主题）
  - 从 `students.map(s => s.class_name)` 提取唯一班名，动态生成 "All Classes" + 各班级按钮
  - 筛选后 `filteredStudents` 替代原始 `students` 渲染列表
  - 切换 class filter 或 sub-tab 时自动清空选择状态
- **Multi-View Toggle (Card / Table)**: header 区域新增视图切换按钮组（LayoutGrid / TableIcon 图标）
  - Card View（默认）：现有卡片网格，左上角新增 checkbox 选择
  - Table View：紧凑表格，列 = checkbox | Name(+chinese) | Class | Year | HP badge | Weaknesses count | Edit 按钮
  - 选中卡片/行显示 emerald 高亮（ring-2 / bg 着色）
- **Batch HP Award 批量积分分配**: 选中学生后底部浮出操作栏（emerald 主题，fixed bottom）
  - 操作栏：Award 图标 | N selected | 分数选择 (1-10 HP) | 原因输入 | "Award HP" 按钮 | X 取消
  - `batchAwardHP()` in `useAppData.ts`：循环调用 `saveStudent` 累加积分，成功后 toast 显示总分和学生数
  - 表头 checkbox 支持 Select All / Deselect All
- **Props 更新**: StudentsView 新增 `onBatchAwardHP` prop，App.tsx 传入 `data.batchAwardHP`
- Modified files (3): useAppData.ts, App.tsx, StudentsView.tsx

### ~~Phase 28 — Student Management Enhancement 学生管理增强~~ ✅ Done
- [x] Class-Based Filtering：班级筛选 tabs（indigo 主题），动态提取唯一班名
- [x] Multi-View Toggle：Card / Table 视图切换（LayoutGrid / TableIcon），表格含 checkbox、HP badge、Weaknesses count、Edit
- [x] Batch HP Award：批量积分分配，底部浮出 emerald 操作栏（分数 1-10 + 原因 + Award HP）
- [x] Select All / Deselect All 全选支持
- [x] 切换 class filter 或 sub-tab 时自动清空选择

### Phase 28b — HP Award History 积分历史追踪 (2026-03-03)
- **需求**: batchAwardHP 和 LessonRecord 中的积分分配缺少审计日志，reason/date 被丢弃，无法回溯查询
- **数据模型**: 新增 `HPAwardLog` 接口（append-only 审计日志）
  - 字段: id, date, student_id, student_name, class_name, points, reason, source ('batch'|'lesson'), source_id?
  - ID 格式: `hp-{timestamp}-{random}`
- **新增 `hpAwardService.ts`**: CRUD 服务（getAll, create, createBatch, delete, deleteBySourceId），遵循 taskService 模式
- **Supabase migration**: `20260308000000_hp_award_logs.sql` — `hp_award_logs` 表 + RLS policies
- **useAppData 集成**:
  - `hpAwardLogs` state（`useLocalStorage` + Supabase fetchOrSync）
  - `batchAwardHP`: 积分更新后同时 `createBatch` HP logs（source='batch', date=today）
  - `addLessonRecord`: awards 非空时创建 logs（source='lesson', source_id=record.id）
  - `updateLessonRecord`: 删除旧 source_id logs → 重建新 logs（delta 替换）
  - `deleteLessonRecord`: 删除关联 HP logs
  - 新增 `deleteHPAwardLog` 函数
  - `bulkImport` 支持 hpAwardLogs
- **新增 `HousePointHistoryView.tsx`** (emerald 主题):
  - Header: Award 图标 + "HP History"
  - Class filter tabs（emerald active 样式）
  - 筛选行: Student 下拉 + Date From/To + Clear filters
  - Summary 统计卡片 (4个): Total HP / Students / From Lessons / Batch Awards
  - Award 列表: glass-card 行 = 日期 | 学生名+class | reason | +N HP badge | source badge (lesson=indigo, batch=amber)
  - 空状态引导
  - 支持从 Student Detail 传入 `initialStudentFilter` 预筛选
- **Sidebar**: Award 图标 + `hp-history` 入口（Lesson Records 之后）
- **App.tsx**: 注册 HousePointHistoryView 路由；`hpHistoryStudentFilter` state；StudentsView 传 hpAwardLogs + onNavigateToHPHistory；SettingsView data 加 hpAwardLogs
- **StudentsView Student Detail**: Weaknesses 后新增 "House Point History" section
  - 按 student_id 过滤 + 日期倒序，显示最近 10 条
  - 汇总：X HP from Y awards
  - 超 10 条显示 "View All →" 跳转到 HP History 页面并按学生预筛选
- **SettingsView**: KNOWN_KEYS 加 `'hpAwardLogs'`（Export/Import 支持）
- New files (3): hpAwardService.ts, HousePointHistoryView.tsx, migration SQL
- Modified files (6): types.ts, useAppData.ts, sidebarConfig.ts, App.tsx, StudentsView.tsx, SettingsView.tsx

### ~~Phase 28b — HP Award History 积分历史追踪~~ ✅ Done
- [x] HPAwardLog append-only 审计日志数据模型
- [x] hpAwardService CRUD 服务 + Supabase 表
- [x] batchAwardHP / addLessonRecord / updateLessonRecord / deleteLessonRecord 全流程写日志
- [x] HousePointHistoryView: class filter + student dropdown + date range + summary cards + award list
- [x] Student Detail HP History section (最近 10 条 + View All 跳转)
- [x] Settings Export/Import 支持 hpAwardLogs

### Phase 28c — Student Sub-record CRUD 全维度增删改查 (2026-03-03)
- **HP History 实时同步修复**:
  - `saveStudent` 中新增 HP 变化检测：当 `house_points` 直接编辑时自动创建 HPAwardLog
  - 增加 → reason: "Manual HP adjustment"；减少 → reason: "Manual HP deduction"
  - 确保无论通过哪种方式修改 HP（批量奖励、课堂记录、直接编辑），HP History 都实时同步
- **Student Requests 平时诉求全功能 CRUD**:
  - `updateStudentRequest` / `deleteStudentRequest` / `toggleRequestStatus`
  - 状态 badge 可点击切换 pending ↔ resolved；hover 显示编辑/删除图标
  - 新增 `resolved_date` 字段：标记 resolved 时自动记录解决时间，toggle 回 pending 时清空
  - 诉求时间 (提出) 和解决时间 (解决) 均以内联日期选择器展示，支持手动更改
- **Learning Status 学习状况记录 CRUD**:
  - `updateStatusRecord` / `deleteStatusRecord`
  - 记录卡片 hover 显示编辑(Pencil) + 删除(Trash2)，通过 GenericForm 编辑（Markdown + LaTeX 富文本）
- **Weakness 薄弱环节 CRUD**:
  - `addWeakness` / `updateWeakness` / `deleteWeakness`
  - 新增 `WeaknessForm` 组件：Topic 输入 + Level 三色切换 (low/medium/high) + Notes 富文本
  - 卡片 hover 编辑/删除 + "+ Add Weakness" 按钮；Notes 改用 MarkdownRenderer 渲染
- **Parent Communication 家校沟通**（全新结构化系统）:
  - `ParentCommunication` 接口升级：date, method (面谈/电话/微信/邮件/其他), content, status, resolved_date, needs_follow_up, follow_up_plan, follow_up_task_id, follow_ups[]
  - 新增 `ParentCommMethod` / `ParentCommFollowUp` 类型
  - 新增 `ParentCommForm` 专属表单组件：日期 + 沟通方式图标切换 + 内容富文本 + 跟进计划 checkbox + 计划输入
  - useAppData: `addParentCommunication` / `updateParentCommunication` / `addParentCommFollowUp` / `deleteParentCommunication` / `toggleParentCommunicationStatus` / `updateParentCommDate`
  - 勾选"需要后续跟进"→ 保存时自动创建 GTD Task（tag: 家校沟通, source_type: 'parent-comm', status: next）
  - `TaskSource` 类型扩展 `'parent-comm'`
  - 追加跟进记录：多次追加后续跟进状况（时间自动记录），以蓝色左边线时间线展示
  - UI: 沟通方式蓝色 badge + 图标；跟进计划琥珀色卡片；跟进记录蓝色时间线；解决时间自动记录
- New files (2): WeaknessForm.tsx, ParentCommForm.tsx
- Modified files (4): types.ts, useAppData.ts, App.tsx, StudentsView.tsx

### Phase 28d — 班级组扩展 Mixed & Form Group (2026-03-03)
- **YEAR_GROUPS 扩展**: 新增 `Mixed`、`Form` 两个班级组类型
- **教学计划隔离**: Mixed Group 和 Form Group 不关联教学计划（Teaching Units）
  - 新增 `TEACHING_YEAR_GROUPS` 常量（仅 Year 7-12）和 `NON_TEACHING_GROUPS` 集合
  - `TeachingUnitForm`: 年级下拉仅显示 Year 7-12
  - `TeachingView` 年级概览: 仅渲染有教学计划的年级卡片（Year 7-12）
  - `ClassForm`: 选择 Mixed/Form 时自动隐藏 "Current Unit" 选择器
- `StudentForm` 不受影响：学生可属于任意班级组
- Modified files (4): constants.ts, ClassForm.tsx, TeachingUnitForm.tsx, TeachingView.tsx

### Phase 29 — Email Digest 学校邮件摘要 (2026-03-03)
- **需求**: 教师每天收到大量英文学校邮件，需快速提取要点、翻译为中文、生成可勾选的备忘/待办事项
- **数据模型**: 新增 `EmailDigest` + `EmailDigestItem` 接口
  - EmailDigest: id, subject, original_content, chinese_translation, items[], created_at
  - EmailDigestItem: id, content, type ('action'|'memo'), checked, task_id?
  - `TaskSource` 扩展 `'email-digest'`
- **Gemini AI**: `processEmailDigest()` — 输入英文邮件 → 输出 JSON（subject 中文主题、chinese_translation 全文翻译、items 结构化事项 action/memo 分类）
- **emailDigestService.ts**: Supabase + localStorage CRUD（getAll/create/update/delete），ID 格式 `ed-{timestamp}-{random}`
- **EmailDigestView.tsx**: 三模式视图（list/new/detail），遵循 MeetingsView 模式
  - **List**: 卡片网格，显示 subject、日期、action/memo 数量 badge、完成进度条
  - **New**: 大文本框粘贴邮件 + "Process with AI" 按钮（Loader2 spinner）
  - **Detail**: 原文（英文，可折叠）+ 中文翻译（默认展开）+ 事项列表（checkbox 可勾选、type badge 琥珀/蓝色、勾选后划线）
  - Action 事项 → "转为 Task" 按钮 → 创建 GTD Task（source_type: 'email-digest'）
  - Related Tasks 面板：关联任务显示 + 状态循环
- **useAppData**: emailDigests state + addEmailDigest/updateEmailDigest/deleteEmailDigest + bulkImport 支持
- **Sidebar**: Mail 图标，位于 Meetings 之后
- **GlobalSearch**: emailDigests 搜索（按 subject + original_content 匹配）
- **SettingsView**: KNOWN_KEYS 增加 `'emailDigests'`（Export/Import 支持）
- New files (2): emailDigestService.ts, EmailDigestView.tsx
- Modified files (7): types.ts, geminiService.ts, useAppData.ts, sidebarConfig.ts, App.tsx, SettingsView.tsx, GlobalSearch.tsx

### ~~Phase 29 — Email Digest 学校邮件摘要~~ ✅ Done
- [x] EmailDigest + EmailDigestItem 数据模型，TaskSource 扩展 'email-digest'
- [x] Gemini processEmailDigest：英文邮件 → 中文翻译 + action/memo 结构化事项
- [x] emailDigestService CRUD 服务
- [x] EmailDigestView 三模式视图（list/new/detail）+ AI 处理 + checkbox + Task 转换
- [x] useAppData 集成 + Sidebar + GlobalSearch + Settings Export/Import

### Hotfix — Email Digest Supabase 表缺失 (2026-03-03)
- **根因**: Phase 29 功能代码已部署，但 Supabase `email_digests` 表未创建，导致所有写入操作 404 → "Failed to create email digest"
- **修复**: 新增 `20260309000000_email_digests.sql` 迁移（id, subject, original_content, chinese_translation, items jsonb, created_at + RLS policies），执行 `supabase db push` 推送到生产库
- New files (1): `supabase/migrations/20260309000000_email_digests.sql`

### Hotfix — AI 错误信息增强 (2026-03-03)
- **问题**: Meeting 录音转录失败时仅显示笼统的 "Failed to transcribe audio"，无法定位具体原因（API 额度/网络/录音格式等）
- **排查结论**: Gemini API key 有效、额度正常、`gemini-2.5-flash` 支持 inline audio（经 REST API + WAV 测试验证）
- **修复**: MeetingsView 转录和摘要生成的 catch 块改为显示实际 `err.message`（如 `Failed to transcribe audio: <具体错误>`），方便用户和开发者定位问题
- EmailDigestView 同步增加 `console.error` 日志输出
- Modified files (2): MeetingsView.tsx, EmailDigestView.tsx

### Phase 29a — Architecture Refactor (No Feature Change) 架构优化 (2026-03-04)
- **目标**: 在保持现有功能与对外 API 不变的前提下，降低 `useAppData` 单文件复杂度，提升可维护性
- **状态层模块化**:
  - 新增 `src/hooks/appData/useProductivityActions.ts`，抽离 Ideas/SOP/WorkLogs/Goals/SchoolEvents/Meetings/EmailDigests/Tasks 的 CRUD 与状态机逻辑
  - 新增 `src/hooks/appData/housePointUtils.ts`，抽离 `computeHousePointDeltas()` 纯函数
  - `useAppData.ts` 改为编排层：负责跨域协作逻辑（如 timetable ↔ lessonRecords、student ↔ HP）并接线模块化 action
- **基础工具统一**:
  - 新增 `src/lib/id.ts` 的 `randomAlphaId()`，替换多处内联 `Math.random().toString(36).substr(2, 9)`
- **结果**:
  - `useAppData.ts` 从 1409 行下降到 1041 行（-368 行）
  - 对外返回对象（hook API）保持不变，现有视图/组件调用无需改动
  - `npm run lint` 通过，功能回归由 `npm run build` 验证
- New files (3): `src/hooks/appData/useProductivityActions.ts`, `src/hooks/appData/housePointUtils.ts`, `src/lib/id.ts`
- Modified files (1): `src/hooks/useAppData.ts`

### Update Log — 2026-03-04
- **本次发布类型**: 架构优化（无功能变更）
- **核心变更**:
  - `useAppData` 从“全量实现”调整为“编排层 + 领域模块”
  - 业务动作抽离到 `useProductivityActions`，纯算法抽离到 `housePointUtils`
  - 统一短 ID 生成函数 `randomAlphaId()`
- **回归结果**:
  - `npm run lint` ✅
  - `npm run build` ✅
  - 现有功能入口、页面行为、对外 hook API 保持兼容

### Hotfix — Dashboard Class Progress 年级固定显示 (2026-03-04)
- **需求**: Dashboard 首页 Class Progress Tracking 需固定显示 Year 7 / Year 8 / Year 10 / Year 11 / Year 12
- **实现**:
  - `DashboardView` 使用固定年级列表渲染，不再依赖 `classes.slice(0, 4)` 的顺序截断
  - 每个年级优先匹配该年级已分配单元的班级展示进度；无班级时显示 `Not Assigned`
  - 卡片保留原有进度计算与 `View Module` 行为
- **回归结果**:
  - `npm run lint` ✅
  - `npm run build` ✅
- Modified files (1): `src/views/DashboardView.tsx`

### Maintenance — Teaching Data Artifact Hygiene (2026-03-04)
- **背景**: 工作区仅剩 `scripts/output/teaching-units-y7~y11.json` 未跟踪文件；这些文件由增量脚本生成，用于中断恢复和失败重试
- **治理策略**:
  - `.gitignore` 忽略 `scripts/output/teaching-units-*.json` 中间缓存
  - 通过反向规则保留 `scripts/output/teaching-units-all.json` 继续受版本管理（作为导入基线）
- **结果**:
  - Git 工作区不再因本地缓存持续变脏
  - 现有导入链路（`import-to-supabase.mjs` 读取 `teaching-units-all.json`）保持不变
- Modified files (1): `.gitignore`

### Hotfix — Teaching Class Progress 排除 Form / Mixed (2026-03-04)
- **需求**: Class Progress Tracking 中不显示非教学班级 `Form`、`Mixed`
- **实现**:
  - `TeachingView` 在渲染前过滤 `NON_TEACHING_GROUPS`，仅保留教学班级卡片
  - 进度计算、`Change Unit`/`View Unit` 交互保持不变
- **回归结果**:
  - `npm run lint` ✅
- Modified files (1): `src/views/TeachingView.tsx`

### Phase 29b — LO ↔ Lesson 映射系统 (2026-03-06)
- **目标**: 建立 Learning Objective 与课堂授课的双向映射，实现精细化进度追踪
- **数据模型**:
  - `LearningObjective.covered_lesson_dates: string[]` — 记录每个 LO 被哪些课覆盖
  - 移除 `TeachingUnit` 废弃字段 (`learning_objectives`, `lessons`, `core_vocabulary`)
  - 移除 `ClassProfile.completed_lesson_ids`
  - `normalizeTeachingUnit()` 重写：自动剥离废弃字段 + 确保 `covered_lesson_dates` 初始化
- **TimetableEntryForm — LO 覆盖勾选**:
  - 展开 SubUnit → LO checkbox 勾选当前日期覆盖
  - 保存时写入 `covered_lesson_dates`，去重保护 `[...new Set(dates)]`
  - 日期 pill 显示每个覆盖日期（MM-DD），hover 显示完整 ISO 日期
  - Select All / Clear toggle 按钮（每个 SubUnit 展开区顶部）
  - `aria-expanded` + `aria-controls` 无障碍增强
- **TeachingView — 进度统计 & 自动推断**:
  - `computeUnitLOStats()` 新增 `lessonsCovered`（去重日期数）
  - `LOStatusPills` 显示 `· X lessons`
  - `SegmentedProgressBar` 三色进度条（completed/in_progress/not_started）
  - LO 过滤器（All / Not Started / In Progress / Completed）
  - Auto-status 按钮：按覆盖次数 vs periods 自动推断 LO 状态，用 toast 反馈
  - SubUnit 拖拽排序
  - 选中 SubUnit 与 teachingUnits 数据变更自动同步
- **SyllabusModal — 课纲覆盖映射**:
  - 每个课纲条目自动匹配已有 TeachingUnit（模糊匹配标题）
  - 已匹配 → 显示绿色✓ + 点击导航到该 Unit
  - 未匹配 → 显示 "Create Unit" 按钮一键创建
  - 年级覆盖率统计 (X/Y covered · Z%)
- **UI 优化**:
  - 侧边栏样式精修（shadow、间距、渐变背景）
  - 导航自动 scroll-to-top
  - 按钮 active:scale 微交互
  - `glass-card-interactive` CSS 类
  - TipTap 富文本编辑器样式
  - `ToastContainer` 布局调整
- **回归结果**:
  - `npx tsc --noEmit` ✅ 0 errors
  - `npm run build` ✅
- Modified files (24): `src/types.ts`, `src/constants.ts`, `src/App.tsx`, `src/views/TeachingView.tsx`, `src/views/DashboardView.tsx`, `src/views/MeetingsView.tsx`, `src/components/TimetableEntryForm.tsx`, `src/components/SyllabusModal.tsx`, `src/components/TeachingUnitForm.tsx`, `src/components/ToastContainer.tsx`, `src/components/FilterChip.tsx`, `src/components/GlobalSearch.tsx`, `src/components/IdeaForm.tsx`, `src/components/ParentCommForm.tsx`, `src/components/QuickCapture.tsx`, `src/components/SchoolEventForm.tsx`, `src/components/SidebarItem.tsx`, `src/components/WeaknessForm.tsx`, `src/hooks/useAppData.ts`, `src/index.css`, `src/lib/teachingAdapter.ts`, `src/services/geminiService.ts`, `package.json`, `package-lock.json`
- New files (3): `src/components/TipTapEditor.tsx`, `src/components/ToggleSwitch.tsx`, `src/lib/htmlUtils.ts`

### Phase 30 — Sidebar Grouping + Projects Entity + Dashboard Restructure (2026-03-06) ✅

- **侧边栏分组**:
  - 15 个平级 tab 按角色分为 6 组：overview / teaching / tutor / projects / productivity / reference
  - `SIDEBAR_GROUPS` 数组 + 每个 item 加 `group` 字段
  - 桌面端 & 移动端均按分组渲染，组标题以小号大写文字显示
- **Project 实体**:
  - 新增 `Project` 接口（id, name, description, color, status, url, repo_url, created_at）
  - `projectService.ts` — 完整 CRUD，照抄 ideaService 模式
  - `ProjectForm.tsx` — 创建/编辑 modal（预设颜色选择器 + 状态切换）
  - `ProjectsView.tsx` — 项目卡片网格 + 关联 Task 统计
  - Supabase migration: `projects` 表 + RLS policy
- **Task ↔ Project 关联**:
  - `Task.project_id` 字段 + Supabase migration
  - `TaskForm.tsx` 加 project 下拉选择
  - `TasksView.tsx` 显示 project 色标 badge
- **Dashboard 重构**:
  - 按角色分为 4 区块：Teaching / Tutor & Admin / Projects / Productivity
  - 每区块独立卡片 + 图标标题
- **GlobalSearch 扩展**: 搜索范围加入 projects
- **SettingsView**: `KNOWN_KEYS` 加 `'projects'`
- **Hotfix — Supabase 迁移补漏**:
  - `students.parent_communications` JSONB 列从未创建 → 导致家校沟通记录无法保存
  - 新增 `20260306200000_student_parent_comms.sql` 迁移
  - 3 个迁移一次性推送：parent_comms + projects + tasks.project_id
- **回归结果**:
  - GitHub Actions deploy ✅ (2 commits both succeeded)
  - Supabase migrations applied ✅
- Modified files (11): `src/App.tsx`, `src/components/GlobalSearch.tsx`, `src/components/TaskForm.tsx`, `src/constants.ts`, `src/hooks/appData/useProductivityActions.ts`, `src/hooks/useAppData.ts`, `src/shared/sidebarConfig.ts`, `src/types.ts`, `src/views/DashboardView.tsx`, `src/views/SettingsView.tsx`, `src/views/TasksView.tsx`
- New files (6): `src/components/ProjectForm.tsx`, `src/services/projectService.ts`, `src/views/ProjectsView.tsx`, `supabase/migrations/20260306200000_student_parent_comms.sql`, `supabase/migrations/20260310000000_projects.sql`, `supabase/migrations/20260310100000_tasks_project_id.sql`

### Phase 30a — Architecture Refactor II (Planned, No Feature Change)
- [ ] 拆分 Student Domain：把 status/request/weakness/parent-comm/exam CRUD 从 `useAppData` 抽离到 `appData/studentActions`
- [ ] 拆分 Timetable Domain：把 timetable/lessonRecord 联动逻辑抽离到 `appData/timetableActions`
- [ ] 增加 AppData Contract 文档：列出 `useAppData` 返回字段、依赖关系、跨域副作用边界
- [ ] 引入最小测试骨架（Vitest）：先覆盖 `computeHousePointDeltas`、task status cycle、idea status cycle
- [ ] CI 加质量门禁：在 deploy 前增加 `npm run lint`（后续接入测试后补 `npm run test`）

### Phase 30b — Dashboard Progress Hardening (Planned)
- [x] 首页固定显示 Year 7 / 8 / 10 / 11 / 12 教学进度卡片
- [ ] Year 级别聚合：同年级多班时显示加权总进度（按 LO 总数汇总）
- [ ] 空态增强：无班级/无单元时提供引导入口（跳转 Students / Teaching）
- [ ] 交互增强：点击年级标题可快速切换到 Teaching 对应年级
- [ ] 增加 Dashboard progress 映射单测（固定年级、缺失数据、同年级多班）

### Phase 31 — Analytics & Reports (Next)
- [ ] Student progress analytics with charts (Recharts)
- [ ] Teaching unit completion tracking per class (LO-based)
- [ ] Work log time summary (weekly/monthly)
- [ ] Exportable reports (PDF)
- [ ] House Point 积分排行榜 & 趋势图表（按 House 分组 / 按班级 / 按学生）
- [ ] 家校沟通统计面板（沟通频率、待处理跟进汇总、按沟通方式分类统计）

### Phase 32 — Student Reports & Communication
- [ ] Generate Subject Report（基于 exam_records + weaknesses + status_records 自动生成学科报告）
- [ ] Parent Meeting Notes（从家校沟通记录 AI 生成家长会备忘录）
- [ ] 学生画像导出（PDF/Markdown，汇总该生所有维度信息：成绩、薄弱环节、学习状态、诉求、家校沟通）
- [ ] 批量家长邮件通知（基于 parent_email 字段）
- [ ] 家校沟通跟进提醒（Dashboard 显示待跟进事项，超期预警）

### Phase 33 — Advanced
- [ ] Real-time sync (Supabase Realtime subscriptions)
- [ ] Multi-user support with Supabase Auth
- [x] File attachments (Supabase Storage — done in Phase 11)
- [ ] PWA support (offline mode + install)
- [ ] Custom domain setup
- [ ] House Point 批量导入/导出（CSV/Excel 格式，方便与学校系统对接）
- [ ] 家校沟通附件上传（沟通截图、签字文件等）
