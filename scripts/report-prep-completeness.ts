import { readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { mergePrepCompletenessSummaries, summarizeUnitPrep, summarizeYearPrep } from '../src/lib/prepCompleteness';
import { sortTeachingUnits } from '../src/lib/teachingUnitOrder';
import { getObjectivePrepMetrics } from '../src/lib/objectivePrep';
import { TeachingUnit } from '../src/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, 'output', 'teaching-units-all.json');
const OUTPUT_JSON = resolve(__dirname, 'output', 'prep-completeness-report.json');
const OUTPUT_MD = resolve(__dirname, 'output', 'prep-completeness-report.md');
const TARGET_YEARS = ['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11'];

interface MissingObjectiveRow {
  year: string;
  unit: string;
  subUnit: string;
  objectiveId: string;
  objective: string;
  readySections: number;
  totalSections: number;
  missingSections: string[];
}

const payload = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
const teachingUnits = (Array.isArray(payload.teachingUnits) ? payload.teachingUnits : []) as TeachingUnit[];

const byYear = TARGET_YEARS.map(year => {
  const yearUnits = sortTeachingUnits(teachingUnits.filter(unit => unit.year_group === year));
  const summary = summarizeYearPrep(year, teachingUnits);
  const unitRows = yearUnits.map(unit => {
    const unitSummary = summarizeUnitPrep(unit);
    const incompleteObjectives: MissingObjectiveRow[] = [];

    for (const subUnit of unit.sub_units || []) {
      for (const objective of subUnit.learning_objectives || []) {
        const metrics = getObjectivePrepMetrics(objective, subUnit);
        if (metrics.readySections === metrics.totalSections) continue;

        const missingSections: string[] = [];
        if (metrics.vocabulary.length === 0) missingSections.push('vocabulary');
        if (!metrics.concept) missingSections.push('concept');
        if (!metrics.examplesReady) missingSections.push('examples');
        if (metrics.resources.length === 0) missingSections.push('resources');

        incompleteObjectives.push({
          year,
          unit: unit.title,
          subUnit: subUnit.title,
          objectiveId: objective.id,
          objective: objective.objective,
          readySections: metrics.readySections,
          totalSections: metrics.totalSections,
          missingSections,
        });
      }
    }

    return {
      id: unit.id,
      title: unit.title,
      subUnitCount: unit.sub_units.length,
      summary: unitSummary,
      incompleteObjectives,
    };
  });

  return {
    year,
    summary,
    units: unitRows,
  };
});

const overall = mergePrepCompletenessSummaries(byYear.map(item => item.summary));
const missingObjectives = byYear.flatMap(item => item.units.flatMap(unit => unit.incompleteObjectives));
const report = {
  generatedAt: new Date().toISOString(),
  dataSource: 'scripts/output/teaching-units-all.json',
  overall,
  missingObjectiveCount: missingObjectives.length,
  byYear,
  missingObjectives,
};

const markdown = [
  '# Objective Prep Completeness Report',
  '',
  `Generated at: ${report.generatedAt}`,
  '',
  '## Overall',
  '',
  `- Objective-ready: ${overall.objectivesReady}/${overall.objectivesTotal} (${overall.readinessPct}%)`,
  `- Section coverage: ${overall.sectionsReady}/${overall.sectionsTotal} (${overall.sectionPct}%)`,
  `- Missing objectives: ${report.missingObjectiveCount}`,
  '',
  '| Year | Objective-ready | Section coverage | Missing objectives |',
  '| --- | ---: | ---: | ---: |',
  ...byYear.map(item => {
    const missingCount = item.units.reduce((sum, unit) => sum + unit.incompleteObjectives.length, 0);
    return `| ${item.year} | ${item.summary.objectivesReady}/${item.summary.objectivesTotal} (${item.summary.readinessPct}%) | ${item.summary.sectionsReady}/${item.summary.sectionsTotal} (${item.summary.sectionPct}%) | ${missingCount} |`;
  }),
  '',
];

for (const item of byYear) {
  markdown.push(`## ${item.year}`);
  markdown.push('');
  markdown.push('| Unit | Objectives | Objective-ready | Section coverage | Missing objectives |');
  markdown.push('| --- | ---: | ---: | ---: | ---: |');
  for (const unit of item.units) {
    markdown.push(
      `| ${unit.title} | ${unit.summary.objectivesTotal} | ${unit.summary.objectivesReady}/${unit.summary.objectivesTotal} (${unit.summary.readinessPct}%) | ${unit.summary.sectionsReady}/${unit.summary.sectionsTotal} (${unit.summary.sectionPct}%) | ${unit.incompleteObjectives.length} |`
    );
  }
  markdown.push('');
}

markdown.push('## Missing Objectives');
markdown.push('');

if (missingObjectives.length === 0) {
  markdown.push('- None. All tracked objectives are fully prep-ready.');
} else {
  for (const row of missingObjectives) {
    markdown.push(`- ${row.year} / ${row.unit} / ${row.subUnit} / ${row.objectiveId}: ${row.missingSections.join(', ')}`);
  }
}

markdown.push('');

writeFileSync(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(OUTPUT_MD, `${markdown.join('\n')}\n`);

console.log(`Wrote ${OUTPUT_JSON}`);
console.log(`Wrote ${OUTPUT_MD}`);
console.log(`Missing objectives: ${report.missingObjectiveCount}`);
