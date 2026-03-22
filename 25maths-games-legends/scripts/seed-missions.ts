/**
 * Seed script: push MISSIONS data into gl_missions table with KP mappings.
 * Run: npm run seed
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jjjigohjvmyewasmmmyf.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqamlnb2hqdm15ZXdhc21tbXlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTM5ODM0NiwiZXhwIjoyMDg2OTc0MzQ2fQ.ir5BEY5ocILl9tmnq7Nd-g1R3qOKnAxJOASqsKnbTps';

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// KP mapping: mission ID → ExamHub KP ID + section
// Based on plan: 三国故事线 × KP 知识树
const KP_MAP: Record<number, { kpId: string; sectionId: string }> = {
  // Year 7 — CH2.1 代数表示, CH1.12 比, CH4.6 角
  711: { kpId: 'kp-2.1-01', sectionId: 'algebra' },      // Algebraic Notation
  712: { kpId: 'kp-2.1-01', sectionId: 'algebra' },
  721: { kpId: 'kp-1.12-01', sectionId: 'number' },      // Ratio and Sharing
  722: { kpId: 'kp-1.12-01', sectionId: 'number' },
  731: { kpId: 'kp-4.6-01', sectionId: 'geometry' },     // Angles on lines
  732: { kpId: 'kp-4.6-01', sectionId: 'geometry' },
  733: { kpId: 'kp-4.6-01', sectionId: 'geometry' },

  // Year 8 — CH3.5 直线方程, CH5.2 面积, CH5.4 体积, CH1.13 百分比, CH9.3 统计
  811: { kpId: 'kp-3.5-01', sectionId: 'coordinate' },   // y = mx + c
  812: { kpId: 'kp-3.5-01', sectionId: 'coordinate' },
  813: { kpId: 'kp-3.3-01', sectionId: 'coordinate' },   // Gradient
  821: { kpId: 'kp-5.2-01', sectionId: 'mensuration' },  // Perimeter & Area
  822: { kpId: 'kp-5.4-01', sectionId: 'mensuration' },  // Prisms & Cylinders
  823: { kpId: 'kp-5.2-01', sectionId: 'mensuration' },
  831: { kpId: 'kp-1.13-01', sectionId: 'number' },      // Percentage Change
  832: { kpId: 'kp-1.13-01', sectionId: 'number' },
  841: { kpId: 'kp-9.3-01', sectionId: 'statistics' },   // Mean, Median, Mode
  842: { kpId: 'kp-9.3-01', sectionId: 'statistics' },

  // Year 9 — CH1.3 指数, CH6.1 勾股, CH6.2 三角比, CH4.4 相似, CH1.12 比
  911: { kpId: 'kp-1.3-02', sectionId: 'number' },       // Index Laws
  912: { kpId: 'kp-1.3-02', sectionId: 'number' },
  913: { kpId: 'kp-1.3-02', sectionId: 'number' },
  921: { kpId: 'kp-6.1-01', sectionId: 'trigonometry' }, // Pythagoras
  922: { kpId: 'kp-6.2-01', sectionId: 'trigonometry' }, // SOH CAH TOA
  923: { kpId: 'kp-6.1-01', sectionId: 'trigonometry' },
  931: { kpId: 'kp-4.4-01', sectionId: 'geometry' },     // Similarity
  932: { kpId: 'kp-4.4-01', sectionId: 'geometry' },
  941: { kpId: 'kp-1.12-01', sectionId: 'number' },      // Ratio
  942: { kpId: 'kp-1.12-01', sectionId: 'number' },

  // Year 10 — CH2.10 函数图像, CH2.5 联立/二次方程, CH8 概率, CH6.2 三角比, CH2.7 数列
  1011: { kpId: 'kp-2.10-01', sectionId: 'algebra' },    // Graphs of Functions
  1012: { kpId: 'kp-2.5-02', sectionId: 'algebra' },     // Quadratic Equations
  1013: { kpId: 'kp-2.5-02', sectionId: 'algebra' },
  1021: { kpId: 'kp-2.5-01', sectionId: 'algebra' },     // Simultaneous Equations
  1022: { kpId: 'kp-2.5-01', sectionId: 'algebra' },
  1023: { kpId: 'kp-2.5-01', sectionId: 'algebra' },
  1031: { kpId: 'kp-8.1-01', sectionId: 'probability' }, // Basic Probability
  1032: { kpId: 'kp-8.3-02', sectionId: 'probability' }, // Independent Events
  1033: { kpId: 'kp-8.1-02', sectionId: 'probability' }, // Complementary Events
  1041: { kpId: 'kp-6.2-01', sectionId: 'trigonometry' },// SOH CAH TOA
  1042: { kpId: 'kp-6.2-01', sectionId: 'trigonometry' },
  1043: { kpId: 'kp-6.2-01', sectionId: 'trigonometry' },
  1051: { kpId: 'kp-2.7-01', sectionId: 'algebra' },     // Sequences & Nth Term
  1052: { kpId: 'kp-2.7-01', sectionId: 'algebra' },
  1053: { kpId: 'kp-2.7-01', sectionId: 'algebra' },

  // Year 11 — CH2.12 微分 (Extended)
  1111: { kpId: 'kp-2.12-01', sectionId: 'algebra' },    // Differentiation
  1112: { kpId: 'kp-2.12-01', sectionId: 'algebra' },
  1121: { kpId: 'kp-2.12-01', sectionId: 'algebra' },    // Integration
  1122: { kpId: 'kp-2.12-01', sectionId: 'algebra' },
  1131: { kpId: 'kp-2.7-01', sectionId: 'algebra' },     // Sequences

  // Year 12 — CH2.12 + CH8.3
  1211: { kpId: 'kp-2.12-01', sectionId: 'algebra' },
  1221: { kpId: 'kp-8.3-02', sectionId: 'probability' },
};

// Import missions from compiled source
import { MISSIONS } from '../src/data/missions';

async function seed() {
  console.log(`Seeding ${MISSIONS.length} missions...`);

  // Delete existing and re-insert
  const { error: delErr } = await sb.from('gl_missions').delete().gte('id', 0);
  if (delErr) console.warn('Delete warning:', delErr.message);

  const rows = MISSIONS.map(m => {
    const kp = KP_MAP[m.id];
    return {
      id: m.id,
      grade: m.grade,
      unit_id: m.unitId,
      unit_order: m.order,
      unit_title: m.unitTitle,
      title: m.title,
      story: m.story,
      description: m.description,
      topic: m.topic,
      question_type: m.type,
      difficulty: m.difficulty,
      reward: m.reward,
      data: m.data,
      secret: m.secret,
      tutorial_steps: m.tutorialSteps || null,
      kp_id: kp?.kpId || null,
      section_id: kp?.sectionId || null,
      is_active: true,
    };
  });

  // Insert in batches of 20
  for (let i = 0; i < rows.length; i += 20) {
    const batch = rows.slice(i, i + 20);
    const { error } = await sb.from('gl_missions').insert(batch);
    if (error) {
      console.error(`Batch ${i / 20 + 1} failed:`, error.message);
    } else {
      console.log(`  Batch ${i / 20 + 1}: ${batch.length} missions inserted`);
    }
  }

  // Verify
  const { count } = await sb.from('gl_missions').select('*', { count: 'exact', head: true });
  console.log(`\nDone! Total missions in DB: ${count}`);

  // Also update local missions with kpId for future reference
  const kpCount = Object.keys(KP_MAP).length;
  console.log(`KP mappings applied: ${kpCount}/${MISSIONS.length}`);
}

seed().catch(console.error);
