/**
 * Phase 2 quality gate: verify all 24 generators produce data
 * that checkAnswer can validate correctly.
 *
 * Run: npx tsx scripts/verify-generators.ts
 */

import { MISSIONS } from '../src/data/missions';
import { generateMission } from '../src/utils/generateMission';
import { checkAnswer } from '../src/utils/checkCorrectness';

const ITERATIONS = 20; // test each generator 20 times
let totalTests = 0;
let failures: string[] = [];

const generatorMissions = MISSIONS.filter(m => m.data?.generatorType);

console.log(`\nVerifying ${generatorMissions.length} missions × ${ITERATIONS} iterations...\n`);

for (const mission of generatorMissions) {
  const genType = mission.data.generatorType;
  let missionFails = 0;

  for (let i = 0; i < ITERATIONS; i++) {
    totalTests++;
    const generated = generateMission(mission);

    // Verify generated data has required fields for checkAnswer
    const result = checkAnswer(generated, {});
    if (!result.expected || Object.keys(result.expected).length === 0) {
      missionFails++;
      if (missionFails === 1) {
        failures.push(`[${mission.id}] ${mission.title.zh} (${genType}): checkAnswer returned empty expected`);
      }
      continue;
    }

    // Verify that checkAnswer returns correct=true when given the expected values
    const correctResult = checkAnswer(generated, result.expected);
    if (!correctResult.correct) {
      missionFails++;
      if (missionFails === 1) {
        failures.push(
          `[${mission.id}] ${mission.title.zh} (${genType}): ` +
          `expected ${JSON.stringify(result.expected)} but checkAnswer says wrong! ` +
          `data=${JSON.stringify(generated.data)}`
        );
      }
    }

    // Verify title was NOT replaced (should match original)
    if (generated.title.zh !== mission.title.zh) {
      failures.push(
        `[${mission.id}] ${mission.title.zh} (${genType}): ` +
        `title was replaced! Got "${generated.title.zh}"`
      );
      break; // Only report once
    }
  }

  const status = missionFails === 0 ? '✅' : `❌ (${missionFails}/${ITERATIONS} failed)`;
  console.log(`  ${status} ${mission.id} ${mission.title.zh} [${genType}]`);
}

console.log(`\n${'═'.repeat(60)}`);
console.log(`Total: ${totalTests} tests, ${failures.length} failures`);

if (failures.length > 0) {
  console.log(`\nFAILURES:`);
  failures.forEach(f => console.log(`  ❌ ${f}`));
  process.exit(1);
} else {
  console.log(`\n✅ All generators verified — data ↔ checkAnswer consistent.`);
  console.log(`✅ All titles preserved (no narrative replacement).`);
}
