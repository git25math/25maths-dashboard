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

---

## Current Architecture

```
Browser
  ├── React App (Vite build)
  │     ├── Views: Dashboard, Timetable, Students, Teaching, LessonRecords, Ideas, WorkLogs, Goals, SchoolEvents, Meetings, SOP, Settings
  │     ├── useAppData hook (central state management + bulkImport)
  │     ├── useDarkMode hook (theme toggle with localStorage persistence)
  │     ├── useLocalStorage (cache layer)
  │     ├── GlobalSearch (Cmd+K overlay, cross-entity search)
  │     ├── 11 Service files (Supabase API layer, with timetable_entry_id linkage)
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

### Phase 25 — Analytics & Reports (Next)
- [ ] Student progress analytics with charts (Recharts)
- [ ] Teaching unit completion tracking per class (LO-based)
- [ ] Work log time summary (weekly/monthly)
- [ ] Exportable reports (PDF)

### Phase 26 — Advanced
- [ ] Real-time sync (Supabase Realtime subscriptions)
- [ ] Multi-user support with Supabase Auth
- [x] File attachments (Supabase Storage — done in Phase 11)
- [ ] PWA support (offline mode + install)
- [ ] Custom domain setup
