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

Kahoot Hub manages the full lifecycle of Kahoot quizzes for 25Maths: from AI-assisted question generation to automated upload and link backfill.

### Two workflows

- **Create Flow**: A step-by-step wizard for creating new Kahoots. Follow 5 steps: Prompt, Review, Export, Upload, Done.
- **Library**: Browse, filter, and manage all existing Kahoots. Click any card to see details, copy links, or jump to Kahoot's editor.

### Organisation types

Each Kahoot can be tagged as:
- **Standalone** - an independent quiz
- **In Course** - part of a Kahoot course
- **In Channel** - published within a Kahoot channel`,
  },
  {
    id: 'create-flow',
    title: 'Create Flow',
    content: `## Create Flow (Wizard)

### Step 1 - Prompt
Set the board (CIE 0580 / Edexcel 4MA1), track (Core/Extended), and topic code. Write a natural language instruction for the AI, or skip to paste questions directly.

The AI uses Gemini 2.5 Flash via \`generate-kahoot-artifacts.mjs\`.

### Step 2 - Review
Paste a Markdown table or JSON array of questions. The parser auto-detects the format and shows a live preview with validation.

Edit title, description, and tags here. Questions with missing prompts or options are flagged in red.

**Supported paste formats:**

Markdown table:
\`\`\`
| # | Question | A | B | C | D | Correct | Time |
| 1 | What is 2+2? | 3 | 4 | 5 | 6 | B | 20 |
\`\`\`

JSON array:
\`\`\`json
[{ "prompt": "What is 2+2?", "option_a": "3", "option_b": "4", "option_c": "5", "option_d": "6", "correct_option": "B", "time_limit": 20 }]
\`\`\`

### Step 3 - Export
Preview the import table and download a CSV file matching Kahoot's bulk import format. You can upload this manually, or proceed to auto-upload.

### Step 4 - Upload
The local agent (\`npm run agent:local\`) runs Playwright automation to upload the quiz to Kahoot. Supports dry-run mode. Requires the agent to be running on your machine.

### Step 5 - Done
Confirms success, shows the Play link and Creator link, and reports whether website backfill was performed.`,
  },
  {
    id: 'library',
    title: 'Library',
    content: `## Library View

### Stats bar
Four cards showing Total, Live, Draft, and Needs Review counts at a glance.

### Filters
- **Board**: All / CIE 0580 / Edexcel 4MA1
- **Type**: All / Standalone / In Course / In Channel
- **Search**: Free-text search across title, topic code, tags, and links

### Card layout
Each Kahoot appears as a horizontal card with:
- Cover thumbnail (left)
- Topic code, board, track, org type (top line)
- Title (main line)
- Status dot + Play link + Creator link (bottom line)

Click a card to open the **Detail Sheet** - a slide-in panel on the right showing full details, collapsible question list, links with copy buttons, and timeline.

### Actions in Detail Sheet
- **Copy links**: One-click copy for Play, Creator, or Page links
- **External links**: Open Play link, Creator link, or edit directly on Kahoot
- **Duplicate / Delete**: Quick actions at the bottom`,
  },
  {
    id: 'pipeline',
    title: 'Pipeline',
    content: `## Pipeline Architecture

The deployment pipeline runs on your local machine, triggered from the browser via a local Express agent.

\`\`\`
Browser  ->  POST /jobs/kahoot-upload  ->  local-agent.mjs (:4318)
                                                |  spawn
                                       deploy-kahoot-upload.mjs
                                                |
  1. generateKahootArtifacts    (Gemini AI fill)
  2. resolveCreatorMetadata     (Python URL resolver)
  3. buildImportManifest        (Python -> XLSX)
  4. ensureKahootSession        (Playwright login check)
  5. runPlaywrightUpload        (auto upload to Kahoot)
  6. createChallengeLink        (capture public link)
  7. syncWebsiteLinks           (backfill CSV/JSON/Listing)
\`\`\`

### Prerequisites
- \`python3\` with \`openpyxl\` and \`playwright\`
- Installed Chromium for Playwright
- Valid Kahoot creator login session
- Sibling repo \`25maths-website\` (or \`KAHOOT_WEBSITE_ROOT\` env var)

### Starting the agent
\`\`\`bash
npm run agent:local
\`\`\`

### Agent endpoints
- \`GET /health\` - Health check
- \`GET /jobs/:id\` - Job status + logs
- \`POST /jobs/kahoot-upload\` - Start a deploy job`,
  },
  {
    id: 'files',
    title: 'File Map',
    content: `## File Map

### Frontend (src/)

| File | Purpose |
|------|---------|
| \`views/kahoot/KahootHub.tsx\` | Top-level view routing |
| \`views/kahoot/KahootLibrary.tsx\` | Resource overview + filters |
| \`views/kahoot/KahootCard.tsx\` | Single resource card |
| \`views/kahoot/KahootDetailSheet.tsx\` | Slide-in detail panel |
| \`views/kahoot/KahootCreateWizard.tsx\` | 5-step wizard container |
| \`views/kahoot/steps/StepPrompt.tsx\` | Step 1: AI prompt |
| \`views/kahoot/steps/StepReview.tsx\` | Step 2: Paste + preview |
| \`views/kahoot/steps/StepExport.tsx\` | Step 3: CSV export |
| \`views/kahoot/steps/StepUpload.tsx\` | Step 4: Agent deploy |
| \`views/kahoot/steps/StepDone.tsx\` | Step 5: Confirmation |
| \`views/kahoot/KahootSettings.tsx\` | Agent + options config |
| \`views/kahoot/KahootModuleGuide.tsx\` | This guide modal |
| \`hooks/useKahootWizard.ts\` | Wizard state management |
| \`lib/kahootQuestionParser.ts\` | Markdown/JSON parser |

### Backend (scripts/kahoot/)

| File | Purpose |
|------|---------|
| \`deploy-kahoot-upload.mjs\` | End-to-end orchestrator |
| \`generate-kahoot-artifacts.mjs\` | AI generation (Gemini) |
| \`playwright-upload.mjs\` | Upload wrapper |
| \`ensure_kahoot_session.py\` | Login session check |
| \`create_kahoot_challenge_link.py\` | Challenge link capture |
| \`sync-website-links.mjs\` | Website backfill |
| \`pipeline-lib.mjs\` | Shared utilities |

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
