import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { MarkdownRenderer } from '../../components/RichTextEditor';

interface GuideSection {
  id: string;
  title: string;
  content: string;
}

const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    content: `## What is Kahoot Hub?

Kahoot Hub manages the full lifecycle of **202 Kahoot quizzes** for 25Maths across CIE 0580 and Edexcel 4MA1, from AI-assisted question generation to automated upload, verification, and publishing.

### Two workflows

- **Create Flow**: A 5-step wizard (Prompt → Review → Export → Upload → Done) for new Kahoots
- **Library**: Browse, filter, and manage all 202 Kahoots with advanced filtering, pipeline tracking, and batch operations

### Organisation types

- **Standalone** — an independent quiz
- **In Course** — part of a Kahoot course
- **In Channel** — published within a Kahoot channel

### Boards & Tracks

- **CIE 0580**: Core / Extended
- **Edexcel 4MA1**: Foundation / Higher`,
  },
  {
    id: 'create-flow',
    title: 'Create Flow',
    content: `## Create Flow (Wizard)

### Step 1 — Prompt
Set the board (CIE 0580 / Edexcel 4MA1), track, and topic code. Write a natural language instruction for the AI, or skip to paste questions directly.

The AI uses Gemini 2.5 Flash via \`generate-kahoot-artifacts.mjs\`.

### Step 2 — Review
Paste a Markdown table or JSON array of questions. The parser auto-detects the format and shows a live preview with validation.

Edit title, description, and tags. Questions with missing prompts or options are flagged in red.

**Supported paste formats:**

Markdown table:
\`\`\`
| # | Question | A | B | C | D | Correct | Time |
| 1 | What is 2+2? | 3 | 4 | 5 | 6 | B | 20 |
\`\`\`

JSON array:
\`\`\`json
[{ "prompt": "What is 2+2?", "option_a": "3", ... }]
\`\`\`

### Step 3 — Export
Preview the import table and download a CSV file matching Kahoot's bulk import format.

### Step 4 — Upload
The local agent (\`npm run agent:local\`) runs Playwright automation to upload the quiz to Kahoot. Supports dry-run mode.

### Step 5 — Done
Confirms success, shows the Play link and Creator link, and reports whether website backfill was performed.`,
  },
  {
    id: 'library',
    title: 'Library',
    content: `## Library View

### Stats bar
Four cards: **Total** (all items), **All Done** (all 6 pipeline stages complete), **Published**, **AI Generated**.

### Filters (3 rows)

**Row 1 — Board + Track + Search**
- Board: All / CIE 0580 / Edexcel 4MA1
- Track: Smart-filtered by board — CIE shows Core/Extended, Edexcel shows Foundation/Higher
- Search: Free-text across title, topic code, tags, and links

**Row 2 — Pipeline toggles**
Six tri-state buttons (one per pipeline stage). Click cycles: no filter → done only → not done only → no filter. Each shows a count badge.

**Row 3 — Type + Sort + Clear**
- Type: All / Standalone / In Course / In Channel
- Sort: Topic Code (natural sort C1.1 < C1.10 < C2.1) or Last Updated
- Clear Filters: resets all filters at once

### Card layout
Each card shows:
- Cover thumbnail (left, desktop only)
- Topic code · Board · Track · Org type (top line)
- Title (main line)
- Pipeline dots (6 colored dots + fraction "4/6") + question count + Play/Creator links

### Detail Sheet
Click a card to open a slide-in panel with:
- Cover image, meta badges, full pipeline checklist with progress bar
- **Pipeline toggles**: Click any stage to toggle done/pending
- **Bulk actions**: "Mark All Done" / "Reset All"
- Links section with copy buttons
- Collapsible question list with answer highlights
- Timeline (created, updated, uploaded dates)
- Duplicate / Delete actions`,
  },
  {
    id: 'pipeline',
    title: 'Pipeline',
    content: `## Pipeline Status

Each Kahoot tracks **6 independent boolean stages**:

| Stage | Meaning |
|-------|---------|
| AI Generated | Questions have been created by AI |
| Reviewed | Human has verified question quality |
| Excel Exported | CSV/XLSX file has been generated |
| Uploaded | Quiz has been uploaded to Kahoot platform |
| Verified | Web verification confirms quiz is live and correct |
| Published | Quiz is published and accessible to students |

Each stage is **independently toggleable** — they are not sequential gates. You can mark "Published" without "Excel Exported" if the quiz was created manually on Kahoot.

### Toggling pipeline status
- **From the Detail Sheet**: Click any stage checkbox, or use "Mark All Done" / "Reset All"
- **From the Library**: Pipeline filter buttons show which stages are done/pending across all items

### Deploy Agent Architecture

\`\`\`
Browser  →  POST /jobs/kahoot-upload  →  local-agent.mjs (:4318)
                                                |  spawn
                                       deploy-kahoot-upload.mjs
                                                |
  1. generateKahootArtifacts    (Gemini AI fill)
  2. resolveCreatorMetadata     (Python URL resolver)
  3. buildImportManifest        (Python → XLSX)
  4. ensureKahootSession        (Playwright login check)
  5. runPlaywrightUpload        (auto upload to Kahoot)
  6. createChallengeLink        (capture public link)
  7. syncWebsiteLinks           (backfill CSV/JSON/Listing)
\`\`\`

### Starting the agent
\`\`\`bash
npm run agent:local
\`\`\``,
  },
  {
    id: 'files',
    title: 'File Map',
    content: `## File Map

### Frontend (src/)

| File | Purpose |
|------|---------|
| \`views/kahoot/KahootHub.tsx\` | Top-level view routing + pipeline handlers |
| \`views/kahoot/KahootLibrary.tsx\` | Library with smart filters + pipeline toggles |
| \`views/kahoot/KahootCard.tsx\` | Card with pipeline dots + fraction |
| \`views/kahoot/KahootDetailSheet.tsx\` | Detail panel with pipeline checklist + bulk actions |
| \`views/kahoot/KahootCreateWizard.tsx\` | 5-step wizard container |
| \`views/kahoot/steps/Step*.tsx\` | Individual wizard steps (Prompt/Review/Export/Upload/Done) |
| \`views/kahoot/KahootSettings.tsx\` | Agent + deploy options config |
| \`views/kahoot/KahootModuleGuide.tsx\` | This guide modal |
| \`hooks/useKahootWizard.ts\` | Wizard state management |
| \`hooks/appData/useKahootActions.ts\` | CRUD + pipeline actions |
| \`lib/kahootQuestionParser.ts\` | Markdown/JSON parser |
| \`lib/kahootInterop.ts\` | Import normalization |
| \`constants-kahoot.ts\` | 202-item seed data (auto-generated) |
| \`types.ts\` | KahootPipeline, KahootItem, etc. |

### Data Pipeline (scripts/)

| File | Purpose |
|------|---------|
| \`extract-kahoot-from-listings.mjs\` | Parse Listing.md → seed JSON |
| \`kahoot/deploy-kahoot-upload.mjs\` | End-to-end deploy orchestrator |
| \`kahoot/generate-kahoot-artifacts.mjs\` | AI generation (Gemini) |
| \`kahoot/playwright-upload.mjs\` | Playwright upload wrapper |
| \`kahoot/sync-website-links.mjs\` | Website backfill |

### Server

| File | Purpose |
|------|---------|
| \`server/local-agent.mjs\` | Express on :4318 |`,
  },
];

interface KahootModuleGuideProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: string;
}

export function KahootModuleGuide({ isOpen, onClose, initialSection }: KahootModuleGuideProps) {
  const [activeSection, setActiveSection] = useState(initialSection || 'overview');

  const section = GUIDE_SECTIONS.find(s => s.id === activeSection) ?? GUIDE_SECTIONS[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Kahoot Hub - Module Guide</h3>
                <p className="text-sm text-slate-500 mt-0.5">How this module works and why it's built this way</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Body: sidebar + content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <div className="w-44 border-r border-slate-100 bg-slate-50/30 p-4 space-y-1.5 shrink-0">
                {GUIDE_SECTIONS.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSection(s.id)}
                    className={cn(
                      'w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition',
                      activeSection === s.id
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                        : 'text-slate-600 hover:bg-slate-100',
                    )}
                  >
                    {s.title}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                <MarkdownRenderer
                  content={section.content}
                  className="prose prose-slate prose-sm max-w-none [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-0 [&_h3]:text-base [&_h3]:font-bold [&_table]:text-xs"
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
