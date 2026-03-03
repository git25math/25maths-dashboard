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
  │     ├── Views: Dashboard, Timetable, Students, Teaching, LessonRecords, Ideas, WorkLogs, Goals, SchoolEvents, Meetings, SOP, DevConsole, Settings
  │     ├── useAppData hook (central state management + bulkImport)
  │     ├── useDarkMode hook (theme toggle with localStorage persistence)
  │     ├── useLocalStorage (cache layer)
  │     ├── GlobalSearch (Cmd+K overlay, cross-entity search)
  │     ├── 12 Service files (Supabase API layer + Edge Function proxy for GitHub Actions)
  │     ├── @dnd-kit (drag-and-drop timetable grid)
  │     ├── geminiService (Gemini 2.5 Flash: transcription, meeting summary, lesson plans, categorization, practice recs, idea/worklog/SOP consolidation)
  │     └── timetableUtils (conflict detection for recurring/date-specific entries)
  │
  └── Data Flow:
        Load:   Supabase → State (fallback: localStorage → auto-sync to Supabase)
        Write:  Service (Supabase) → State → localStorage (write-through cache)
```

**Supabase Tables** (13):
students, student_status_records, student_requests, teaching_units, classes, ideas, sops, work_logs, goals, school_events, timetable_entries, lesson_records, meeting_records

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

### ~~Phase 25 — Self-Evolve Dev Console 自进化开发控制台~~ ✅ Done
- [x] Self-Evolve GitHub Actions workflow (workflow_dispatch, Claude/Gemini provider, build verification, auto-commit)
- [x] GitHub REST API service (trigger workflow, list/get runs, token check)
- [x] Dev Console view (instruction input, provider selection, run history with auto-polling)
- [x] Token guard: unconfigured state shows setup instructions
- [x] Sidebar entry (Terminal icon), App.tsx routing, env var plumbing
- [x] API key 3-slot 自动轮换（限速自动 fallback 到下一个 key）
- [x] Dashboard "View History" 导航修复（不再弹出新建表单）
- [x] **安全加固**: GitHub PAT 从前端 `VITE_GITHUB_TOKEN` 迁移至 Supabase Edge Function 服务端密钥，前端 bundle 不再泄露 PAT

### ~~Phase 26 — SchoolEvent 多模式时间支持~~ ✅ Done
- [x] 新增 `EventTimeMode` 类型 + SchoolEvent 4 个时间字段 (end_date, start_time, end_time, time_mode)
- [x] SchoolEventForm: 4 模式按钮组（整日/连续数天/定时/跨天定时）+ 条件字段显示
- [x] SchoolEventsView: mode-aware 完整日期格式化
- [x] DashboardView: mode-aware 简短日期格式化
- [x] GlobalSearch: subtitle mode-aware 格式化
- [x] Supabase migration: 新增 4 列
- [x] 向后兼容：`time_mode` 默认 `'all-day'`，旧数据无需迁移

### Phase 27 — Self-Evolve Enhancement 自进化增强 (Next)
- [ ] Gemini CLI 集成（当前仅 Claude，Gemini provider 需接入）
- [ ] Dev Console 显示 workflow 日志输出（当前仅状态，无详细 log）
- [ ] 指令模板/历史记录（常用指令一键复用）
- [ ] 自动 PR 模式（AI 改动走 PR review 而非直接 push main）

### Phase 28 — Analytics & Reports
- [ ] Student progress analytics with charts (Recharts)
- [ ] Teaching unit completion tracking per class (LO-based)
- [ ] Work log time summary (weekly/monthly)
- [ ] Exportable reports (PDF)
- [ ] House Point 积分排行榜 & 趋势图表（按 House 分组 / 按班级 / 按学生）
- [ ] House Point 历史记录查询（按学生查看所有积分来源 LessonRecord）

### Phase 29 — Advanced
- [ ] Real-time sync (Supabase Realtime subscriptions)
- [ ] Multi-user support with Supabase Auth
- [x] File attachments (Supabase Storage — done in Phase 11)
- [ ] PWA support (offline mode + install)
- [ ] Custom domain setup
- [ ] House Point 批量导入/导出（CSV/Excel 格式，方便与学校系统对接）
