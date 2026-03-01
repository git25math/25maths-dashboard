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

---

## Current Architecture

```
Browser
  ├── React App (Vite build)
  │     ├── Views: Dashboard, Timetable, Students, Teaching, Ideas, WorkLogs, SOP
  │     ├── useAppData hook (central state management)
  │     ├── useLocalStorage (cache layer)
  │     └── 9 Service files (Supabase API layer)
  │
  └── Data Flow:
        Load:   Supabase → State (fallback: localStorage → auto-sync to Supabase)
        Write:  Service (Supabase) → State → localStorage (write-through cache)
```

**Supabase Tables** (12):
students, student_status_records, student_requests, teaching_units, classes, ideas, sops, work_logs, goals, school_events, timetable_entries, lesson_records

---

## Roadmap

### Phase 10 — Password Protection (Next)
- [ ] Login gate with password authentication
- [ ] Protect all routes behind auth check

### Phase 11 — Missing Views
- [ ] Goals dedicated view (currently only on Dashboard)
- [ ] School Events dedicated view
- [ ] Lesson Records view (CRUD for class lesson history)
- [ ] Settings/Profile page

### Phase 12 — Data & UX Improvements
- [ ] Search and filter across all entities
- [ ] Bulk import/export (CSV/JSON)
- [ ] Drag-and-drop timetable editing
- [ ] Responsive mobile layout
- [ ] Dark mode toggle

### Phase 13 — Analytics & Reports
- [ ] Student progress analytics with charts (Recharts)
- [ ] Teaching unit completion tracking per class
- [ ] Work log time summary (weekly/monthly)
- [ ] Exportable reports (PDF)

### Phase 14 — AI Features
- [ ] Gemini-powered lesson plan generation
- [ ] Auto-categorization of ideas and work logs
- [ ] Student weakness analysis suggestions
- [ ] Smart timetable conflict detection

### Phase 15 — Advanced
- [ ] Real-time sync (Supabase Realtime subscriptions)
- [ ] Multi-user support with Supabase Auth
- [ ] File attachments (Supabase Storage)
- [ ] PWA support (offline mode + install)
- [ ] Custom domain setup
