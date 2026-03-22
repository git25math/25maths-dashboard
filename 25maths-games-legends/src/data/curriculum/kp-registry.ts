/**
 * CIE 0580 Knowledge Point Registry — 294 atomic KPs
 * Source of truth: math-video-engine/curriculum/cie_0580/syllabus_tree.yaml
 *
 * This is the IMMUTABLE skeleton. Story themes and school mappings
 * are layered on top. KP IDs never change.
 */

export type ScriptType = 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6' | 'T7' | 'T8';
export type Tier = 'both' | 'ext' | 'core';

export interface KnowledgePoint {
  id: string;            // e.g., "kp-2.5-06"
  title: string;         // English title
  titleZh: string;       // Chinese title
  type: ScriptType;      // T1-T8 determines game mechanic
  tier: Tier;            // core/both/ext
  duration: number;      // video duration in seconds
  prereqs: string[];     // prerequisite KP IDs
  topicId: string;       // e.g., "2.5"
  chapterId: string;     // e.g., "ch2"
}

export interface Topic {
  id: string;            // e.g., "2.5"
  title: string;
  titleZh: string;
  tier: Tier;
  kpIds: string[];
}

export interface Chapter {
  id: string;            // e.g., "ch1"
  title: string;
  titleZh: string;
  topics: Topic[];
}

// ═══════════════════════════════════════════════════════════════
// Chapter 1: Number (64 KPs)
// ═══════════════════════════════════════════════════════════════
const ch1: Chapter = {
  id: 'ch1', title: 'Number', titleZh: '数论',
  topics: [
    { id: '1.1', title: 'Types of number', titleZh: '数的类型', tier: 'both',
      kpIds: ['kp-1.1-01','kp-1.1-02','kp-1.1-03','kp-1.1-04','kp-1.1-05','kp-1.1-06','kp-1.1-07','kp-1.1-08','kp-1.1-09'] },
    { id: '1.2', title: 'Sets', titleZh: '集合与韦恩图', tier: 'both',
      kpIds: ['kp-1.2-01','kp-1.2-02','kp-1.2-03','kp-1.2-04','kp-1.2-05'] },
    { id: '1.3', title: 'Powers and roots', titleZh: '幂与根', tier: 'both',
      kpIds: ['kp-1.3-01','kp-1.3-02','kp-1.3-03'] },
    { id: '1.4', title: 'Fractions, decimals, percentages', titleZh: '分数、小数、百分数', tier: 'both',
      kpIds: ['kp-1.4-01','kp-1.4-02','kp-1.4-03','kp-1.4-04'] },
    { id: '1.5', title: 'Ordering', titleZh: '排序', tier: 'both',
      kpIds: ['kp-1.5-01','kp-1.5-02','kp-1.5-03'] },
    { id: '1.6', title: 'The four operations', titleZh: '四则运算', tier: 'both',
      kpIds: ['kp-1.6-01','kp-1.6-02','kp-1.6-03','kp-1.6-04'] },
    { id: '1.7', title: 'Indices I', titleZh: '指数法则I', tier: 'both',
      kpIds: ['kp-1.7-01','kp-1.7-02'] },
    { id: '1.8', title: 'Standard form', titleZh: '标准式', tier: 'both',
      kpIds: ['kp-1.8-01','kp-1.8-02'] },
    { id: '1.9', title: 'Estimation', titleZh: '估算', tier: 'both',
      kpIds: ['kp-1.9-01','kp-1.9-02','kp-1.9-03','kp-1.9-04','kp-1.9-05','kp-1.9-06','kp-1.9-07'] },
    { id: '1.10', title: 'Limits of accuracy', titleZh: '精度范围', tier: 'ext',
      kpIds: ['kp-1.10-01','kp-1.10-02','kp-1.10-03','kp-1.10-04','kp-1.10-05'] },
    { id: '1.11', title: 'Ratio and proportion', titleZh: '比与比例', tier: 'both',
      kpIds: ['kp-1.11-01','kp-1.11-02','kp-1.11-03','kp-1.11-04','kp-1.11-05'] },
    { id: '1.12', title: 'Rates', titleZh: '速率', tier: 'both',
      kpIds: ['kp-1.12-01','kp-1.12-02','kp-1.12-03'] },
    { id: '1.13', title: 'Percentages', titleZh: '百分数应用', tier: 'both',
      kpIds: ['kp-1.13-01','kp-1.13-02','kp-1.13-03','kp-1.13-04'] },
    { id: '1.14', title: 'Using a calculator', titleZh: '计算器使用', tier: 'core',
      kpIds: ['kp-1.14-01'] },
    { id: '1.15', title: 'Time', titleZh: '时间', tier: 'both',
      kpIds: ['kp-1.15-01','kp-1.15-02','kp-1.15-03'] },
    { id: '1.16', title: 'Money', titleZh: '货币', tier: 'both',
      kpIds: ['kp-1.16-01','kp-1.16-02','kp-1.16-03'] },
    { id: '1.17', title: 'Exponential growth and decay', titleZh: '指数增长与衰减', tier: 'ext',
      kpIds: ['kp-1.17-01'] },
    { id: '1.18', title: 'Surds', titleZh: '根式', tier: 'ext',
      kpIds: ['kp-1.18-01'] },
  ]
};

// ═══════════════════════════════════════════════════════════════
// Chapter 2: Algebra and Graphs (78 KPs)
// ═══════════════════════════════════════════════════════════════
const ch2: Chapter = {
  id: 'ch2', title: 'Algebra and graphs', titleZh: '代数与图像',
  topics: [
    { id: '2.1', title: 'Introduction to algebra', titleZh: '代数入门', tier: 'both',
      kpIds: ['kp-2.1-01','kp-2.1-02','kp-2.1-03'] },
    { id: '2.2', title: 'Algebraic manipulation', titleZh: '代数运算', tier: 'both',
      kpIds: ['kp-2.2-01','kp-2.2-02','kp-2.2-03','kp-2.2-04','kp-2.2-05','kp-2.2-06','kp-2.2-07','kp-2.2-08','kp-2.2-09','kp-2.2-10','kp-2.2-11','kp-2.2-12','kp-2.2-13'] },
    { id: '2.3', title: 'Algebraic fractions', titleZh: '代数分式', tier: 'ext',
      kpIds: ['kp-2.3-01','kp-2.3-02','kp-2.3-03','kp-2.3-04'] },
    { id: '2.4', title: 'Indices II', titleZh: '指数法则II', tier: 'both',
      kpIds: ['kp-2.4-01','kp-2.4-02','kp-2.4-03'] },
    { id: '2.5', title: 'Equations', titleZh: '方程', tier: 'both',
      kpIds: ['kp-2.5-01','kp-2.5-02','kp-2.5-03','kp-2.5-04','kp-2.5-05','kp-2.5-06','kp-2.5-07','kp-2.5-08','kp-2.5-09','kp-2.5-10','kp-2.5-11','kp-2.5-12','kp-2.5-13'] },
    { id: '2.6', title: 'Inequalities', titleZh: '不等式', tier: 'both',
      kpIds: ['kp-2.6-01','kp-2.6-02','kp-2.6-03','kp-2.6-04'] },
    { id: '2.7', title: 'Sequences', titleZh: '数列', tier: 'both',
      kpIds: ['kp-2.7-01','kp-2.7-02','kp-2.7-03','kp-2.7-04','kp-2.7-05'] },
    { id: '2.8', title: 'Proportion', titleZh: '正反比例', tier: 'ext',
      kpIds: ['kp-2.8-01','kp-2.8-02','kp-2.8-03','kp-2.8-04','kp-2.8-05','kp-2.8-06','kp-2.8-07','kp-2.8-08'] },
    { id: '2.9', title: 'Graphs in practical situations', titleZh: '实际问题图像', tier: 'both',
      kpIds: ['kp-2.9-01','kp-2.9-02','kp-2.9-03','kp-2.9-04','kp-2.9-05'] },
    { id: '2.10', title: 'Graphs of functions', titleZh: '函数图像', tier: 'both',
      kpIds: ['kp-2.10-01','kp-2.10-02','kp-2.10-03','kp-2.10-04'] },
    { id: '2.11', title: 'Sketching curves', titleZh: '曲线草图', tier: 'ext',
      kpIds: ['kp-2.11-01','kp-2.11-02','kp-2.11-03'] },
    { id: '2.12', title: 'Differentiation', titleZh: '微分', tier: 'ext',
      kpIds: ['kp-2.12-01','kp-2.12-02'] },
    { id: '2.13', title: 'Functions', titleZh: '函数', tier: 'ext',
      kpIds: ['kp-2.13-01','kp-2.13-02','kp-2.13-03','kp-2.13-04'] },
  ]
};

// ═══════════════════════════════════════════════════════════════
// Chapter 3: Coordinate Geometry (16 KPs)
// ═══════════════════════════════════════════════════════════════
const ch3: Chapter = {
  id: 'ch3', title: 'Coordinate geometry', titleZh: '坐标几何',
  topics: [
    { id: '3.1', title: 'Coordinates', titleZh: '坐标', tier: 'both',
      kpIds: ['kp-3.1-01','kp-3.1-02'] },
    { id: '3.2', title: 'Drawing linear graphs', titleZh: '画线性图像', tier: 'both',
      kpIds: ['kp-3.2-01'] },
    { id: '3.3', title: 'Gradient of linear graphs', titleZh: '线性图像斜率', tier: 'both',
      kpIds: ['kp-3.3-01','kp-3.3-02'] },
    { id: '3.4', title: 'Length and midpoint', titleZh: '长度与中点', tier: 'ext',
      kpIds: ['kp-3.4-01','kp-3.4-02','kp-3.4-03','kp-3.4-04'] },
    { id: '3.5', title: 'Equations of linear graphs', titleZh: '直线方程', tier: 'both',
      kpIds: ['kp-3.5-01','kp-3.5-02','kp-3.5-03','kp-3.5-04'] },
    { id: '3.6', title: 'Parallel lines', titleZh: '平行线', tier: 'both',
      kpIds: ['kp-3.6-01','kp-3.6-02'] },
    { id: '3.7', title: 'Perpendicular lines', titleZh: '垂直线', tier: 'ext',
      kpIds: ['kp-3.7-01'] },
  ]
};

// ═══════════════════════════════════════════════════════════════
// Chapter 4: Geometry (37 KPs)
// ═══════════════════════════════════════════════════════════════
const ch4: Chapter = {
  id: 'ch4', title: 'Geometry', titleZh: '几何',
  topics: [
    { id: '4.1', title: 'Geometrical terms', titleZh: '几何术语', tier: 'both',
      kpIds: ['kp-4.1-01','kp-4.1-02','kp-4.1-03'] },
    { id: '4.2', title: 'Geometrical constructions', titleZh: '几何作图', tier: 'both',
      kpIds: ['kp-4.2-01','kp-4.2-02','kp-4.2-03','kp-4.2-04'] },
    { id: '4.3', title: 'Scale drawings and bearings', titleZh: '比例图与方位角', tier: 'both',
      kpIds: ['kp-4.3-01','kp-4.3-02','kp-4.3-03'] },
    { id: '4.4', title: 'Similarity and congruence', titleZh: '相似与全等', tier: 'both',
      kpIds: ['kp-4.4-01','kp-4.4-02','kp-4.4-03','kp-4.4-04','kp-4.4-05','kp-4.4-06'] },
    { id: '4.5', title: 'Symmetry', titleZh: '对称', tier: 'both',
      kpIds: ['kp-4.5-01','kp-4.5-02'] },
    { id: '4.6', title: 'Angles', titleZh: '角', tier: 'both',
      kpIds: ['kp-4.6-01','kp-4.6-02','kp-4.6-03','kp-4.6-04','kp-4.6-05','kp-4.6-06','kp-4.6-07','kp-4.6-08','kp-4.6-09','kp-4.6-10'] },
    { id: '4.7', title: 'Circle theorems', titleZh: '圆定理', tier: 'ext',
      kpIds: ['kp-4.7-01','kp-4.7-02','kp-4.7-03','kp-4.7-04','kp-4.7-05','kp-4.7-06'] },
    { id: '4.8', title: 'Constructions and loci', titleZh: '作图与轨迹', tier: 'ext',
      kpIds: ['kp-4.8-01','kp-4.8-02','kp-4.8-03'] },
  ]
};

// ═══════════════════════════════════════════════════════════════
// Chapter 5: Mensuration (22 KPs)
// ═══════════════════════════════════════════════════════════════
const ch5: Chapter = {
  id: 'ch5', title: 'Mensuration', titleZh: '度量',
  topics: [
    { id: '5.1', title: 'Units of measure', titleZh: '计量单位', tier: 'both',
      kpIds: ['kp-5.1-01','kp-5.1-02','kp-5.1-03'] },
    { id: '5.2', title: 'Area and perimeter', titleZh: '面积与周长', tier: 'both',
      kpIds: ['kp-5.2-01','kp-5.2-02','kp-5.2-03'] },
    { id: '5.3', title: 'Circles, arcs and sectors', titleZh: '圆、弧与扇形', tier: 'both',
      kpIds: ['kp-5.3-01','kp-5.3-02','kp-5.3-03','kp-5.3-04','kp-5.3-05','kp-5.3-06'] },
    { id: '5.4', title: 'Surface area and volume', titleZh: '表面积与体积', tier: 'both',
      kpIds: ['kp-5.4-01','kp-5.4-02','kp-5.4-03','kp-5.4-04','kp-5.4-05','kp-5.4-06','kp-5.4-07'] },
    { id: '5.5', title: 'Compound shapes', titleZh: '组合图形', tier: 'both',
      kpIds: ['kp-5.5-01','kp-5.5-02','kp-5.5-03'] },
  ]
};

// ═══════════════════════════════════════════════════════════════
// Chapter 6: Trigonometry (19 KPs)
// ═══════════════════════════════════════════════════════════════
const ch6: Chapter = {
  id: 'ch6', title: 'Trigonometry', titleZh: '三角学',
  topics: [
    { id: '6.1', title: "Pythagoras' theorem", titleZh: '勾股定理', tier: 'both',
      kpIds: ['kp-6.1-01','kp-6.1-02'] },
    { id: '6.2', title: 'Right-angled triangles', titleZh: '直角三角形', tier: 'both',
      kpIds: ['kp-6.2-01','kp-6.2-02','kp-6.2-03'] },
    { id: '6.3', title: 'Exact trigonometric values', titleZh: '三角精确值', tier: 'ext',
      kpIds: ['kp-6.3-01','kp-6.3-02'] },
    { id: '6.4', title: 'Trigonometric functions', titleZh: '三角函数', tier: 'ext',
      kpIds: ['kp-6.4-01','kp-6.4-02','kp-6.4-03'] },
    { id: '6.5', title: 'Non-right-angled triangles', titleZh: '非直角三角形', tier: 'ext',
      kpIds: ['kp-6.5-01','kp-6.5-02','kp-6.5-03','kp-6.5-04','kp-6.5-05','kp-6.5-06','kp-6.5-07'] },
    { id: '6.6', title: '3D trigonometry', titleZh: '三维三角', tier: 'ext',
      kpIds: ['kp-6.6-01','kp-6.6-02'] },
  ]
};

// ═══════════════════════════════════════════════════════════════
// Chapter 7: Transformations and Vectors (18 KPs)
// ═══════════════════════════════════════════════════════════════
const ch7: Chapter = {
  id: 'ch7', title: 'Transformations and vectors', titleZh: '变换与向量',
  topics: [
    { id: '7.1', title: 'Transformations', titleZh: '变换', tier: 'both',
      kpIds: ['kp-7.1-01','kp-7.1-02','kp-7.1-03','kp-7.1-04','kp-7.1-05','kp-7.1-06','kp-7.1-07','kp-7.1-08','kp-7.1-09','kp-7.1-10','kp-7.1-11','kp-7.1-12'] },
    { id: '7.2', title: 'Vectors in 2D', titleZh: '二维向量', tier: 'both',
      kpIds: ['kp-7.2-01','kp-7.2-02','kp-7.2-03'] },
    { id: '7.3', title: 'Magnitude of a vector', titleZh: '向量的模', tier: 'ext',
      kpIds: ['kp-7.3-01'] },
    { id: '7.4', title: 'Vector geometry', titleZh: '向量几何', tier: 'ext',
      kpIds: ['kp-7.4-01','kp-7.4-02'] },
  ]
};

// ═══════════════════════════════════════════════════════════════
// Chapter 8: Probability (14 KPs)
// ═══════════════════════════════════════════════════════════════
const ch8: Chapter = {
  id: 'ch8', title: 'Probability', titleZh: '概率',
  topics: [
    { id: '8.1', title: 'Introduction to probability', titleZh: '概率入门', tier: 'both',
      kpIds: ['kp-8.1-01','kp-8.1-02'] },
    { id: '8.2', title: 'Relative and expected frequencies', titleZh: '相对频率与期望频率', tier: 'both',
      kpIds: ['kp-8.2-01','kp-8.2-02'] },
    { id: '8.3', title: 'Combined events', titleZh: '组合事件', tier: 'both',
      kpIds: ['kp-8.3-01','kp-8.3-02','kp-8.3-03','kp-8.3-04','kp-8.3-05','kp-8.3-06','kp-8.3-07','kp-8.3-08'] },
    { id: '8.4', title: 'Conditional probability', titleZh: '条件概率', tier: 'ext',
      kpIds: ['kp-8.4-01','kp-8.4-02'] },
  ]
};

// ═══════════════════════════════════════════════════════════════
// Chapter 9: Statistics (26 KPs)
// ═══════════════════════════════════════════════════════════════
const ch9: Chapter = {
  id: 'ch9', title: 'Statistics', titleZh: '统计',
  topics: [
    { id: '9.1', title: 'Classifying and tabulating data', titleZh: '数据分类与列表', tier: 'both',
      kpIds: ['kp-9.1-01','kp-9.1-02'] },
    { id: '9.2', title: 'Interpreting statistical data', titleZh: '数据解读', tier: 'both',
      kpIds: ['kp-9.2-01','kp-9.2-02','kp-9.2-03'] },
    { id: '9.3', title: 'Averages and measures of spread', titleZh: '平均数与离散度', tier: 'both',
      kpIds: ['kp-9.3-01','kp-9.3-02','kp-9.3-03','kp-9.3-04','kp-9.3-05','kp-9.3-06'] },
    { id: '9.4', title: 'Statistical charts and diagrams', titleZh: '统计图表', tier: 'both',
      kpIds: ['kp-9.4-01','kp-9.4-02','kp-9.4-03','kp-9.4-04','kp-9.4-05'] },
    { id: '9.5', title: 'Scatter diagrams and correlation', titleZh: '散点图与相关性', tier: 'both',
      kpIds: ['kp-9.5-01','kp-9.5-02','kp-9.5-03','kp-9.5-04'] },
    { id: '9.6', title: 'Cumulative frequency', titleZh: '累积频率', tier: 'ext',
      kpIds: ['kp-9.6-01','kp-9.6-02','kp-9.6-03','kp-9.6-04'] },
    { id: '9.7', title: 'Histograms', titleZh: '频率直方图', tier: 'ext',
      kpIds: ['kp-9.7-01','kp-9.7-02'] },
  ]
};

// ═══════════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════════

export const CHAPTERS: Chapter[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9];

/** Flat list of all KP IDs for quick lookup */
export const ALL_KP_IDS: string[] = CHAPTERS.flatMap(ch =>
  ch.topics.flatMap(t => t.kpIds)
);

/** Get topic by KP ID */
export function getTopicForKp(kpId: string): Topic | undefined {
  for (const ch of CHAPTERS) {
    for (const t of ch.topics) {
      if (t.kpIds.includes(kpId)) return t;
    }
  }
  return undefined;
}

/** Get chapter by KP ID */
export function getChapterForKp(kpId: string): Chapter | undefined {
  for (const ch of CHAPTERS) {
    for (const t of ch.topics) {
      if (t.kpIds.includes(kpId)) return ch;
    }
  }
  return undefined;
}

/** Total KP count */
export const TOTAL_KPS = ALL_KP_IDS.length;
