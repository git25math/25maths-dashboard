# Kahoot Hub Redesign - Development Plan

> Version: 1.0 | Date: 2026-03-08
> Replaces: `src/views/KahootUploadView.tsx` (1,692 lines, single monolithic component)

---

## 1. Design Philosophy

### Problem
Current KahootUploadView is a form-heavy 4-tab editor (Overview/Questions/Assets/Publish)
with 13 useState hooks, all logic in one file, no workflow guidance, and a cramped layout.

### Solution: Two-Track Architecture
- **Create Flow** (Wizard): Step-by-step guided creation with AI generation
- **Library** (Dashboard): Resource overview with quick-access links and progress tracking

### UX Principles
- One step does one thing (Wizard steps are single-purpose)
- Links are first-class citizens (Play/Creator/Edit visible on every card, not hidden in tabs)
- Read-first, edit-second (Library is browse-oriented, not form-oriented)
- Generous whitespace and breathing room between elements

---

## 2. Information Architecture

```
Kahoot Hub (top-level view)
  |
  +-- Library (default)         -- Overview of all Kahoots
  |     +-- Stats bar           -- Total / Live / Draft / Needs Review
  |     +-- Filters             -- Board, OrgType, Search
  |     +-- Card list           -- One card per Kahoot, horizontal layout
  |     +-- Detail Sheet        -- Slide-in panel on card click (480px right)
  |
  +-- Create Wizard             -- Step-by-step new Kahoot creation
  |     +-- Step 1: Prompt      -- AI instruction or skip
  |     +-- Step 2: Review      -- Paste/edit questions + preview
  |     +-- Step 3: Export      -- Excel preview + download
  |     +-- Step 4: Upload      -- Agent deploy + terminal
  |     +-- Step 5: Done        -- Result confirmation + link copy
  |
  +-- Settings (gear icon)      -- Agent URL, deploy options, guide
        +-- Module Guide        -- Development notes & navigation map
```

---

## 3. Data Model Changes

### New fields on KahootItem (types.ts)

```typescript
export type KahootOrgType = 'standalone' | 'in_course' | 'in_channel';

// Add to KahootItem interface:
org_type?: KahootOrgType;    // How this Kahoot is organized
org_name?: string;            // Course or channel name (if applicable)
```

These are optional fields with no DB migration needed (Supabase JSONB columns are flexible).

---

## 4. File Structure

```
src/views/kahoot/
  KahootHub.tsx              -- Top-level: Library / Create / Settings routing
  KahootLibrary.tsx          -- Stats + filters + card list
  KahootCard.tsx             -- Single resource card (horizontal layout)
  KahootDetailSheet.tsx      -- Right slide-in panel (read + inline edit)
  KahootCreateWizard.tsx     -- 5-step wizard container + step state
  KahootSettings.tsx         -- Agent config + deploy options
  KahootModuleGuide.tsx      -- Module navigation guide modal
  steps/
    StepPrompt.tsx           -- Step 1: AI prompt input
    StepReview.tsx           -- Step 2: Paste questions + live preview
    StepExport.tsx           -- Step 3: Excel preview + download
    StepUpload.tsx           -- Step 4: Agent deploy
    StepDone.tsx             -- Step 5: Result + links

src/hooks/
  useKahootWizard.ts         -- Wizard state: current step, draft item, AI call

src/lib/
  kahootQuestionParser.ts    -- Markdown table / JSON -> KahootQuestion[]
```

### Line count estimates

| File | Est. lines | Responsibility |
|------|-----------|----------------|
| KahootHub.tsx | ~60 | View routing + top nav |
| KahootLibrary.tsx | ~250 | Stats + filters + card list |
| KahootCard.tsx | ~80 | Single card component |
| KahootDetailSheet.tsx | ~200 | Slide-in panel |
| KahootCreateWizard.tsx | ~120 | Wizard container |
| StepPrompt.tsx | ~80 | AI prompt input |
| StepReview.tsx | ~200 | Paste + parse + preview |
| StepExport.tsx | ~100 | Excel preview |
| StepUpload.tsx | ~150 | Deploy terminal |
| StepDone.tsx | ~60 | Result confirmation |
| KahootSettings.tsx | ~100 | Agent + options |
| KahootModuleGuide.tsx | ~120 | Guide modal |
| useKahootWizard.ts | ~120 | Wizard state hook |
| kahootQuestionParser.ts | ~80 | Question parser |
| **Total** | **~1,720** | 14 files, avg 123 lines each |

---

## 5. Module Navigation Guide Feature

### What it is
A built-in documentation modal that explains:
- Why this module exists and what problem it solves
- The two-track workflow (Create Flow vs Library)
- What each step in the wizard does
- How the pipeline connects (AI -> Excel -> Upload -> Links -> Backfill)
- Architecture overview (which files do what)

### Where it appears

**Primary entry point**: A `BookOpen` (or `HelpCircle`) icon button in the KahootHub top bar,
next to the Settings gear. Always visible, never intrusive.

```
Kahoot Hub                    [+ Create New]  [?]  [gear]
                                               ^
                                          Guide button
```

**Secondary entry point**: In Settings view, as a "Module Guide" section at the bottom.

**Wizard contextual help**: Each wizard step has a small `(?)` that opens the guide
scrolled to the relevant section.

### Modal design

```
+--------------------------------------------------------------+
|  x Close                                                      |
|                                                               |
|  Kahoot Hub - Module Guide                                    |
|  How this module works and why it's built this way            |
|                                                               |
|  [Overview]  [Create Flow]  [Library]  [Pipeline]  [Files]    |
|                                                               |
+--------------------------------------------------------------+
|                                                               |
|  ## Overview                                                  |
|                                                               |
|  Kahoot Hub manages the full lifecycle of Kahoot quizzes:     |
|  from AI-assisted question generation to automated upload     |
|  and link backfill to the 25Maths website.                    |
|                                                               |
|  Two workflows:                                               |
|  - Create Flow: Step-by-step wizard for new Kahoots           |
|  - Library: Browse, filter, and manage existing Kahoots       |
|                                                               |
|  ## Create Flow                                               |
|                                                               |
|  Step 1 - Prompt: Give AI a natural language instruction.     |
|    Uses Gemini 2.5 Flash via generate-kahoot-artifacts.mjs.   |
|    Can skip to paste questions directly.                      |
|                                                               |
|  Step 2 - Review: Paste Markdown table or JSON.               |
|    Auto-parses into question cards with live preview.         |
|    Edit title, description, tags here.                        |
|                                                               |
|  Step 3 - Export: Preview and download kahoot-import.xlsx.    |
|    Format matches Kahoot's bulk import spreadsheet.           |
|                                                               |
|  Step 4 - Upload: Local agent runs Playwright automation.     |
|    Requires `npm run agent:local` on your machine.            |
|    Supports dry-run mode.                                     |
|                                                               |
|  Step 5 - Done: Confirms upload, captures challenge link      |
|    and creator link. Auto-backfills website CSV/JSON.         |
|                                                               |
|  ## Pipeline Architecture                                     |
|                                                               |
|  Browser -> POST /jobs/kahoot-upload -> local-agent.mjs       |
|    -> deploy-kahoot-upload.mjs (orchestrator)                 |
|      1. generateKahootArtifacts (Gemini AI)                   |
|      2. resolveCreatorMetadata (Python)                       |
|      3. buildImportManifest (Python -> XLSX)                  |
|      4. ensureKahootSession (Playwright login)                |
|      5. runPlaywrightUpload (auto upload)                     |
|      6. createChallengeLink (capture public link)             |
|      7. syncWebsiteLinks (backfill CSV/JSON/Listing)          |
|                                                               |
|  ## File Map                                                  |
|                                                               |
|  Frontend:                                                    |
|    views/kahoot/KahootHub.tsx        - Top-level routing      |
|    views/kahoot/KahootLibrary.tsx    - Resource overview       |
|    views/kahoot/KahootCard.tsx       - Single resource card   |
|    views/kahoot/KahootDetailSheet.tsx - Slide-in detail panel |
|    views/kahoot/KahootCreateWizard.tsx - 5-step wizard        |
|    views/kahoot/steps/Step*.tsx      - Individual wizard steps|
|    hooks/useKahootWizard.ts          - Wizard state           |
|    lib/kahootQuestionParser.ts       - Question parser        |
|                                                               |
|  Backend (scripts/kahoot/):                                   |
|    deploy-kahoot-upload.mjs          - Orchestrator            |
|    generate-kahoot-artifacts.mjs     - AI generation           |
|    playwright-upload.mjs             - Upload wrapper          |
|    ensure_kahoot_session.py          - Login session            |
|    create_kahoot_challenge_link.py   - Challenge link capture  |
|    sync-website-links.mjs            - Website backfill        |
|    pipeline-lib.mjs                  - Shared utilities        |
|                                                               |
|  Server:                                                      |
|    server/local-agent.mjs            - Express on :4318       |
|                                                               |
+--------------------------------------------------------------+
```

### Implementation approach

The guide content is a **static data object** (not fetched), defined as a typed
constant in `KahootModuleGuide.tsx`. This makes it:
- Zero-cost at runtime (no API calls)
- Easy to update (edit the constant)
- Searchable (just text)
- Type-safe (sections are typed)

```typescript
interface GuideSection {
  id: string;
  title: string;
  content: string;  // Markdown rendered with existing MarkdownRenderer
}

const GUIDE_SECTIONS: GuideSection[] = [
  { id: 'overview', title: 'Overview', content: '...' },
  { id: 'create-flow', title: 'Create Flow', content: '...' },
  { id: 'library', title: 'Library', content: '...' },
  { id: 'pipeline', title: 'Pipeline', content: '...' },
  { id: 'files', title: 'File Map', content: '...' },
];
```

The modal uses the same pattern as `SyllabusModal.tsx`:
- `AnimatePresence` + `motion.div` for entrance/exit
- Left sidebar tabs for sections
- Right content area with `MarkdownRenderer`
- `max-w-4xl max-h-[80vh]` sizing

### Extensibility

This pattern can be reused for other modules. Each module can define its own
`MODULE_GUIDE` constant. If we later want a global "Module Guides" page,
we can aggregate them.

---

## 6. Implementation Order

### Phase 1: Foundation (do first)
1. `types.ts` - Add `KahootOrgType`, extend `KahootItem`
2. `lib/kahootQuestionParser.ts` - Markdown/JSON -> KahootQuestion[] parser
3. `hooks/useKahootWizard.ts` - Wizard state management

### Phase 2: Library View
4. `views/kahoot/KahootCard.tsx` - Single card component
5. `views/kahoot/KahootLibrary.tsx` - Stats + filters + card list
6. `views/kahoot/KahootDetailSheet.tsx` - Slide-in panel

### Phase 3: Create Wizard
7. `views/kahoot/steps/StepPrompt.tsx`
8. `views/kahoot/steps/StepReview.tsx`
9. `views/kahoot/steps/StepExport.tsx`
10. `views/kahoot/steps/StepUpload.tsx`
11. `views/kahoot/steps/StepDone.tsx`
12. `views/kahoot/KahootCreateWizard.tsx` - Wizard container

### Phase 4: Integration
13. `views/kahoot/KahootSettings.tsx` - Agent config
14. `views/kahoot/KahootModuleGuide.tsx` - Guide modal
15. `views/kahoot/KahootHub.tsx` - Top-level routing
16. Update `App.tsx` to use KahootHub instead of KahootUploadView
17. Update `sidebarConfig.ts` label from "Kahoot Upload" to "Kahoot Hub"
18. Delete old `KahootUploadView.tsx`

### Phase 5: Quality
19. Verify all existing pipeline integrations work
20. Test Library filters, card click -> sheet, links
21. Test full Create Wizard flow end-to-end

---

## 7. Pipeline Integration Matrix

| Wizard Step | What happens | Existing script | New code needed |
|-------------|-------------|-----------------|-----------------|
| Step 1: Prompt | User writes prompt, clicks Generate | `generate-kahoot-artifacts.mjs` (via Agent) | `StepPrompt.tsx` calls `localAgentService` |
| Step 2: Review | Paste Markdown/JSON, auto-parse | None (new) | `kahootQuestionParser.ts` (frontend only) |
| Step 3: Export | Generate and preview XLSX | `build_import_xlsx_from_markdown.py` (via Agent) | `StepExport.tsx` calls Agent |
| Step 4: Upload | Playwright automation | `deploy-kahoot-upload.mjs` (via Agent) | `StepUpload.tsx` polls job status |
| Step 5: Done | Show results, copy links | `sync-website-links.mjs` (included in deploy) | `StepDone.tsx` reads job result |

No backend script changes required. All changes are frontend-only.

---

## 8. Key Decisions

### Why a Wizard instead of tabs?
Tabs imply all sections are equally important and can be visited in any order.
But Kahoot creation has a clear sequence: prompt -> questions -> export -> upload -> done.
A wizard enforces this flow and reduces cognitive load.

### Why a separate Detail Sheet instead of editing in the Wizard?
The Wizard is for *creation*. Once a Kahoot is live, you rarely need the full
creation flow again. The Detail Sheet is optimized for *browsing and quick actions*:
copy links, view questions, check status. For actual question editing, you go to
Kahoot's own creator page via the "Edit on Kahoot" link.

### Why static guide content instead of a CMS?
This is an internal tool used by one person. A static constant is the simplest
solution: no API, no loading state, no sync issues. Edit the file, see the change.

### Why org_type instead of inferring from data?
A Kahoot's organization (standalone/course/channel) is a human decision, not
something we can reliably infer from metadata. Making it explicit keeps the
data model honest.
