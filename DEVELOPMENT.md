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

---

## Current Architecture

```
Browser
  ├── React App (Vite build)
  │     ├── Views: Dashboard, Timetable, Students, Teaching, Ideas, WorkLogs, Meetings, SOP
  │     ├── useAppData hook (central state management)
  │     ├── useLocalStorage (cache layer)
  │     ├── 10 Service files (Supabase API layer)
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

### Phase 13 — Password Protection (Next)
- [ ] Login gate with password authentication
- [ ] Protect all routes behind auth check

### Phase 14 — Missing Views
- [ ] Goals dedicated view (currently only on Dashboard)
- [ ] School Events dedicated view
- [ ] Lesson Records view (CRUD for class lesson history)
- [ ] Settings/Profile page

### Phase 15 — Data & UX Improvements
- [ ] Search and filter across all entities
- [ ] Bulk import/export (CSV/JSON)
- [ ] Drag-and-drop timetable editing
- [ ] Responsive mobile layout
- [ ] Dark mode toggle
- [x] File storage: Supabase Storage upload for PDFs/docs in sub-unit resource fields (Phase 11). External link pasting also supported.

### Phase 16 — Analytics & Reports
- [ ] Student progress analytics with charts (Recharts)
- [ ] Teaching unit completion tracking per class
- [ ] Work log time summary (weekly/monthly)
- [ ] Exportable reports (PDF)

### Phase 17 — AI Features
- [x] Meeting audio transcription via Gemini 2.0 Flash (Phase 12)
- [x] AI meeting summary generation — key points, action items, decisions (Phase 12)
- [ ] Gemini-powered lesson plan generation
- [ ] Auto-categorization of ideas and work logs
- [ ] Student weakness analysis suggestions
- [ ] Smart timetable conflict detection

### Phase 18 — Advanced
- [ ] Real-time sync (Supabase Realtime subscriptions)
- [ ] Multi-user support with Supabase Auth
- [x] File attachments (Supabase Storage — done in Phase 11)
- [ ] PWA support (offline mode + install)
- [ ] Custom domain setup
