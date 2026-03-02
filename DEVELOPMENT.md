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

---

## Current Architecture

```
Browser
  ├── React App (Vite build)
  │     ├── Views: Dashboard, Timetable, Students, Teaching, LessonRecords, Ideas, WorkLogs, Goals, SchoolEvents, Meetings, SOP, Settings
  │     ├── useAppData hook (central state management)
  │     ├── useLocalStorage (cache layer)
  │     ├── 11 Service files (Supabase API layer)
  │     └── geminiService (Gemini 2.0 Flash: audio transcription + meeting summary)
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
- [ ] LessonRecord 与 TimetableEntry 双向关联（timetable_entry_id）— deferred

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

### Phase 17 — Data & UX Improvements (Next)
- [x] Idea Pool: 3-state status filter, dashboard visibility toggle, sorted by date (Phase 13)
- [ ] Search and filter across all entities
- [ ] Bulk import/export (CSV/JSON)
- [ ] Drag-and-drop timetable editing
- [ ] Responsive mobile layout
- [ ] Dark mode toggle
- [x] File storage: Supabase Storage upload for PDFs/docs in sub-unit resource fields (Phase 11). External link pasting also supported.

### Phase 18 — Analytics & Reports
- [ ] Student progress analytics with charts (Recharts)
- [ ] Teaching unit completion tracking per class
- [ ] Work log time summary (weekly/monthly)
- [ ] Exportable reports (PDF)

### Phase 19 — AI Features
- [x] Meeting audio transcription via Gemini 2.0 Flash (Phase 12)
- [x] AI meeting summary generation — key points, action items, decisions (Phase 12)
- [ ] Gemini-powered lesson plan generation
- [ ] Auto-categorization of ideas and work logs
- [ ] Student weakness analysis suggestions
- [ ] Smart timetable conflict detection

### Phase 20 — Advanced
- [ ] Real-time sync (Supabase Realtime subscriptions)
- [ ] Multi-user support with Supabase Auth
- [x] File attachments (Supabase Storage — done in Phase 11)
- [ ] PWA support (offline mode + install)
- [ ] Custom domain setup
