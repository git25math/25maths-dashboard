/**
 * Three Kingdoms (三国演义) Story Theme
 *
 * This is a PLUGGABLE story layer. The same 294 KPs can use
 * different themes (西游记, 哈利波特, etc.) by swapping this file.
 *
 * Each chapter maps to a historical arc. Each topic gets a battle/event.
 * Each KP gets a specific scenario within that event.
 *
 * === 历史编年顺序 (游戏章节推进顺序) ===
 * CH1(数论·184AD) → CH4(几何·190AD) → CH3(坐标·200AD) → CH2(代数·207AD)
 * → CH6(三角·208AD) → CH5(度量·209AD) → CH7(向量·228AD) → CH9(统计·263AD)
 *                          ↗ CH8(概率) 以支线任务形式穿插各章 ↗
 *
 * CIE 章节编号仅作 KP 标识符，不决定学习顺序。
 */

export interface StoryTheme {
  id: string;
  name: { zh: string; en: string };
  chapterStories: Record<string, ChapterStory>;
  /** 章节间过渡叙事 */
  chapterTransitions: ChapterTransition[];
  /** CH8 概率 KP 嵌入映射 — 概率不作独立章节，以支线任务穿插各章 */
  probabilityEmbeddings: ProbabilityEmbedding[];
}

export interface ChapterStory {
  arc: { zh: string; en: string };           // Story arc name
  historicalPeriod: string;                   // e.g. "184 AD"
  chronologicalOrder: number;                 // 1-9, game progression order
  narrator: string;                           // Default narrator for this chapter
  narrators: string[];                        // Available narrators
  topicEvents: Record<string, TopicEvent>;   // Topic ID → event
}

export interface TopicEvent {
  event: { zh: string; en: string };         // Battle/event name
  setting: { zh: string; en: string };       // Scene description
  narrator: string;                           // Override narrator
  /** 军师讲堂模式 — 对于无法自然融入战场的 KP */
  isMasterClass?: boolean;
}

export interface ChapterTransition {
  from: string;  // e.g. "ch1"
  to: string;    // e.g. "ch4"
  narrative: { zh: string; en: string };
}

export interface ProbabilityEmbedding {
  kpId: string;           // e.g. "kp-8.1-01"
  title: { zh: string; en: string };
  embedInChapter: string; // e.g. "ch1"
  narrativeHook: { zh: string; en: string };
}

export const THREE_KINGDOMS: StoryTheme = {
  id: 'three-kingdoms',
  name: { zh: '三国演义', en: 'Romance of the Three Kingdoms' },

  // ══════════════════════════════════════════════════════
  // CH8 概率 KP 嵌入映射 — "谋略博弈·概率篇" 贯穿全线
  // ══════════════════════════════════════════════════════
  probabilityEmbeddings: [
    { kpId: 'kp-8.1-01', title: { zh: '概率基础', en: 'Basic Probability' }, embedInChapter: 'ch1', narrativeHook: { zh: '刘备占卜：起义成功的可能性', en: 'Liu Bei divines: what are the chances of success?' } },
    { kpId: 'kp-8.1-02', title: { zh: '互补事件', en: 'Complementary Events' }, embedInChapter: 'ch1', narrativeHook: { zh: '"不成功"的概率 = 1 - P(成功)', en: 'P(failure) = 1 - P(success)' } },
    { kpId: 'kp-8.2-01', title: { zh: '相对频率', en: 'Relative Frequency' }, embedInChapter: 'ch4', narrativeHook: { zh: '吕布过往10战8胜，估算胜率', en: 'Lü Bu won 8 of 10 battles — estimate his win rate' } },
    { kpId: 'kp-8.2-02', title: { zh: '期望频率', en: 'Expected Frequency' }, embedInChapter: 'ch4', narrativeHook: { zh: '若再战50场，预计吕布赢几场？', en: 'If 50 more battles, how many would Lü Bu win?' } },
    { kpId: 'kp-8.3-01', title: { zh: '样本空间', en: 'Sample Space' }, embedInChapter: 'ch3', narrativeHook: { zh: '曹操列出所有可能的进攻路线', en: 'Cao Cao lists all possible attack routes' } },
    { kpId: 'kp-8.3-02', title: { zh: '树形图', en: 'Tree Diagrams' }, embedInChapter: 'ch6', narrativeHook: { zh: '借东风→火攻→追击，三步决策树', en: 'East wind → fire → pursuit: 3-step decision tree' } },
    { kpId: 'kp-8.3-03', title: { zh: '独立事件', en: 'Independent Events' }, embedInChapter: 'ch6', narrativeHook: { zh: '东风(P=0.6)和火攻(P=0.8)同时成功', en: 'East wind (P=0.6) AND fire attack (P=0.8) both succeed' } },
    { kpId: 'kp-8.3-04', title: { zh: '互斥事件', en: 'Mutually Exclusive Events' }, embedInChapter: 'ch6', narrativeHook: { zh: '曹操走水路或陆路（二选一）', en: 'Cao Cao takes water OR land route (one only)' } },
    { kpId: 'kp-8.3-05', title: { zh: '加法法则', en: 'Addition Rule' }, embedInChapter: 'ch6', narrativeHook: { zh: 'P(水路) + P(陆路) = 1', en: 'P(water) + P(land) = 1' } },
    { kpId: 'kp-8.3-06', title: { zh: '乘法法则', en: 'Multiplication Rule' }, embedInChapter: 'ch6', narrativeHook: { zh: '连续两次伏击都成功的概率', en: 'Probability both ambushes succeed in succession' } },
    { kpId: 'kp-8.3-07', title: { zh: '韦恩图概率', en: 'Venn Diagram Probability' }, embedInChapter: 'ch1', narrativeHook: { zh: '诸侯中同时会骑马和射箭的比例', en: 'Proportion of lords skilled in both riding and archery' } },
    { kpId: 'kp-8.3-08', title: { zh: '列表法', en: 'Two-Way Tables' }, embedInChapter: 'ch3', narrativeHook: { zh: '两支部队出击组合的系统列举', en: 'Systematically listing all troop deployment combinations' } },
    { kpId: 'kp-8.4-01', title: { zh: '条件概率', en: 'Conditional Probability' }, embedInChapter: 'ch6', narrativeHook: { zh: '华容道：已知关羽守一路，曹操逃脱概率', en: 'Huarong Pass: given Guan Yu guards one path, P(Cao Cao escapes)' } },
    { kpId: 'kp-8.4-02', title: { zh: '不放回抽样', en: 'Without Replacement' }, embedInChapter: 'ch7', narrativeHook: { zh: '空城计：司马懿从5条路选2条，恰好避开诸葛亮的概率', en: 'Empty Fort: Sima Yi picks 2 of 5 roads — P(avoids Zhuge Liang)' } },
  ],

  // ══════════════════════════════════════════════════════
  // 章节间过渡叙事（卷轴动画，2-3 秒）
  // ══════════════════════════════════════════════════════
  chapterTransitions: [
    { from: 'ch1', to: 'ch4', narrative: { zh: '桃园结义后，刘关张响应讨董联盟。大军行至虎牢关，吕布骑赤兔马横刀立马……', en: 'After the Peach Garden Oath, the brothers join the coalition against Dong Zhuo. At Hulao Pass, Lü Bu stands guard on his Red Hare…' } },
    { from: 'ch4', to: 'ch3', narrative: { zh: '董卓伏诛，群雄割据。曹操挟天子令诸侯，与袁绍对峙于官渡。郭嘉献策："先画地图，标注敌营……"', en: 'Dong Zhuo falls, warlords rise. Cao Cao faces Yuan Shao at Guandu. Guo Jia advises: "First, map the enemy camps…"' } },
    { from: 'ch3', to: 'ch2', narrative: { zh: '官渡大胜，曹操统一北方。刘备三顾茅庐，诸葛亮出山。"天下三分，可用代数推演……"', en: 'After Guandu, Cao Cao unifies the north. Liu Bei visits the thatched cottage thrice. Zhuge Liang emerges: "The realm split three ways can be analyzed with algebra…"' } },
    { from: 'ch2', to: 'ch6', narrative: { zh: '隆中对定策，孙刘联盟抗曹。八十万大军压境赤壁，周瑜倚剑而立："水战决胜，在于三角！"', en: 'The Longzhong Plan forged, Sun-Liu alliance confronts Cao Cao. 800,000 troops descend on Red Cliffs. Zhou Yu: "Victory on water depends on trigonometry!"' } },
    { from: 'ch6', to: 'ch5', narrative: { zh: '赤壁大捷，刘备入主荆州。百废待兴，诸葛亮说："先丈量土地，修建粮仓。度量乃治国之本。"', en: 'Victory at Red Cliffs! Liu Bei takes Jingzhou. Zhuge Liang: "First measure the land, build granaries. Measurement is the foundation of governance."' } },
    { from: 'ch5', to: 'ch7', narrative: { zh: '荆州安定，但曹魏虎视眈眈。诸葛亮挥师北伐，在鱼腹浦布下八阵图……', en: 'Jingzhou secured, but Cao Wei looms. Zhuge Liang launches the Northern Expedition, deploying the Stone Sentinel Maze at Fish Belly Creek…' } },
    { from: 'ch7', to: 'ch9', narrative: { zh: '六出祁山，壮志未酬。天下终归司马氏。新朝初立，张华奏请："当务之急，清查人口、统计版图。"', en: 'Six campaigns from Qishan, ambitions unfulfilled. The realm falls to the Sima clan. Zhang Hua petitions: "Our priority: census the population, survey the territory."' } },
  ],

  chapterStories: {
    // ═══════════════════════════════════════
    // CH1: Number → 桃园结义·奠基篇 (184 AD 黄巾起义)
    // ═══════════════════════════════════════
    ch1: {
      arc: { zh: '桃园结义·奠基篇', en: 'Peach Garden Oath — Foundation' },
      historicalPeriod: '184 AD',
      chronologicalOrder: 1,
      narrator: '刘备',
      narrators: ['刘备', '关羽', '张飞', '诸葛亮'],
      topicEvents: {
        '1.1': { event: { zh: '桃园三结义', en: 'Oath of the Peach Garden' }, setting: { zh: '刘关张桃园结义，点算兵马，整数清点', en: 'Three brothers count soldiers and resources' }, narrator: '刘备' },
        '1.2': { event: { zh: '诸侯分阵', en: 'Lords Form Alliances' }, setting: { zh: '诸侯结盟，集合运算分清敌友', en: 'Lords ally, using sets to distinguish friend from foe' }, narrator: '曹操' },
        '1.3': { event: { zh: '军粮翻倍', en: 'Grain Doubling' }, setting: { zh: '粮仓每月翻倍，2¹→2²→2³，指数增长的力量', en: 'Granary doubles monthly: 2¹→2²→2³, the power of exponential growth' }, narrator: '张飞' },
        '1.4': { event: { zh: '粮草分配', en: 'Grain Distribution' }, setting: { zh: '军粮按比例分配各营', en: 'Distribute grain proportionally to camps' }, narrator: '关羽' },
        '1.5': { event: { zh: '兵力排序', en: 'Ranking Military Strength' }, setting: { zh: '各路诸侯兵力排序', en: 'Rank lords by military strength' }, narrator: '曹操' },
        '1.6': { event: { zh: '后勤运算', en: 'Logistics Calculation' }, setting: { zh: '粮草运输的四则运算', en: 'Four operations in supply logistics' }, narrator: '诸葛亮' },
        '1.7': { event: { zh: '粮仓扩建', en: 'Granary Expansion' }, setting: { zh: '合并两批粮草 3²×3³=3⁵，指数法则', en: 'Combining two grain stores: 3²×3³=3⁵, index laws' }, narrator: '曹操' },
        '1.8': { event: { zh: '军报大数', en: 'Military Report Numbers' }, setting: { zh: '百万大军、万石粮草，用标准式简记军报中的极大数字。"探马来报：曹军八十三万！军师记为 8.3×10⁵"', en: 'Millions of troops, vast supplies — standard form for the enormous numbers in military dispatches' }, narrator: '诸葛亮' },
        '1.9': { event: { zh: '战场估算', en: 'Battlefield Estimation' }, setting: { zh: '敌军数量的快速估算', en: 'Rapid estimation of enemy forces' }, narrator: '周瑜' },
        '1.10': { event: { zh: '精确侦察', en: 'Precision Scouting' }, setting: { zh: '探马回报的精度分析', en: 'Analyzing accuracy of scout reports' }, narrator: '郭嘉' },
        '1.11': { event: { zh: '军粮配比', en: 'Supply Ratios' }, setting: { zh: '按比例调配各营粮草', en: 'Proportional supply allocation' }, narrator: '荀彧' },
        '1.12': { event: { zh: '急行军速率', en: 'March Speed Rates' }, setting: { zh: '行军速率决定战机', en: 'March rates determine battle timing' }, narrator: '曹操' },
        '1.13': { event: { zh: '赋税百分', en: 'Tax Percentages' }, setting: { zh: '屯田制的百分比税率', en: 'Percentage tax rates in the tuntian system' }, narrator: '曹操' },
        '1.14': { event: { zh: '军师讲堂·神器', en: 'Master Class — The Calculator' }, setting: { zh: '诸葛亮："后世有一神器，可代人运算……今日教你使用此器。"', en: 'Zhuge Liang: "In future ages, a wondrous device will compute for you… let me teach you its ways."' }, narrator: '诸葛亮', isMasterClass: true },
        '1.15': { event: { zh: '行军时辰', en: 'March Timing' }, setting: { zh: '古时辰与现代时间换算', en: 'Converting ancient time units' }, narrator: '关羽' },
        '1.16': { event: { zh: '军饷钱粮', en: 'Military Pay' }, setting: { zh: '发放军饷的货币计算', en: 'Currency calculations for soldier pay' }, narrator: '张飞' },
        '1.17': { event: { zh: '瘟疫蔓延', en: 'Plague Spread' }, setting: { zh: '军中瘟疫的指数扩散', en: 'Exponential spread of plague in camp' }, narrator: '华佗' },
        '1.18': { event: { zh: '营地开方', en: 'Camp Square Root' }, setting: { zh: '正方形营地面积144平方丈，求边长 √144。"赵云：此营边长几何？"', en: 'Square camp area is 144 sq zhang — find side length √144. "Zhao Yun: How long is each side?"' }, narrator: '赵云' },
      }
    },

    // ═══════════════════════════════════════
    // CH2: Algebra → 隆中对·代数篇 (207 AD 三顾茅庐)
    // ═══════════════════════════════════════
    ch2: {
      arc: { zh: '隆中对·代数篇', en: 'Longzhong Plan — Algebra' },
      historicalPeriod: '207 AD',
      chronologicalOrder: 4,
      narrator: '诸葛亮',
      narrators: ['诸葛亮', '曹操', '周瑜', '司马懿'],
      topicEvents: {
        '2.1': { event: { zh: '军令如山', en: 'Military Orders' }, setting: { zh: '用代数表达军令', en: 'Express military orders in algebra' }, narrator: '诸葛亮' },
        '2.2': { event: { zh: '军需调配', en: 'Supply Dispatch' }, setting: { zh: '调配公式 3(x+2)=3x+6，展开化简是调配步骤', en: 'Supply formula 3(x+2)=3x+6 — expanding and simplifying are dispatch steps' }, narrator: '诸葛亮' },
        '2.3': { event: { zh: '军粮人均', en: 'Per Capita Rations' }, setting: { zh: '总粮÷总兵=人均配给，分式化简', en: 'Total grain ÷ total soldiers = per capita ration — simplifying algebraic fractions' }, narrator: '荀彧' },
        '2.4': { event: { zh: '军力倍增', en: 'Force Multiplication' }, setting: { zh: '(2³)²=2⁶，兵力翻倍再翻倍的指数法则', en: '(2³)²=2⁶ — doubling then doubling again, index laws' }, narrator: '曹操' },
        '2.5': { event: { zh: '联军会师', en: 'Allied Forces Meet' }, setting: { zh: '联立方程求解兵力部署', en: 'Simultaneous equations for troop deployment' }, narrator: '周瑜' },
        '2.6': { event: { zh: '兵力约束', en: 'Force Constraints' }, setting: { zh: '不等式限制的兵力调度', en: 'Inequality constraints on deployments' }, narrator: '司马懿' },
        '2.7': { event: { zh: '等差军阵', en: 'Arithmetic Formations' }, setting: { zh: '等差数列排兵布阵', en: 'Arithmetic sequences in battle formations' }, narrator: '诸葛亮' },
        '2.8': { event: { zh: '军需比例', en: 'Supply Proportions' }, setting: { zh: '正反比例分配军需', en: 'Direct/inverse proportion in supplies' }, narrator: '荀彧' },
        '2.9': { event: { zh: '行军图谱', en: 'March Charts' }, setting: { zh: '速度-时间图分析行军', en: 'Speed-time graphs for march analysis' }, narrator: '曹操' },
        '2.10': { event: { zh: '天下大势图', en: 'Strategic Trend Chart' }, setting: { zh: '诸葛亮用曲线图分析三方势力消长。"魏国国力如 y=x²，初慢后快"', en: 'Zhuge Liang charts the rise and fall of three kingdoms. "Wei\'s power grows like y=x², slow then fast"' }, narrator: '诸葛亮' },
        '2.11': { event: { zh: '势力推演', en: 'Power Projection' }, setting: { zh: '诸葛亮草图绘制魏蜀吴势力消长曲线 y=x², y=1/x 等', en: 'Zhuge Liang sketches power curves for Wei/Shu/Wu: y=x², y=1/x, etc.' }, narrator: '诸葛亮' },
        '2.12': { event: { zh: '军师讲堂·微分', en: 'Master Class — Differentiation' }, setting: { zh: '诸葛亮："若后世有此法，可求曲线之变化率，进而求极大极小之值。"', en: 'Zhuge Liang: "If future ages discover this method, one can find rates of change, and hence maxima and minima."' }, narrator: '诸葛亮', isMasterClass: true },
        '2.13': { event: { zh: '连环妙计', en: 'Chain Strategies' }, setting: { zh: '复合函数与反函数的连锁计策', en: 'Composite and inverse functions as chain strategies' }, narrator: '庞统', isMasterClass: true },
      }
    },

    // ═══════════════════════════════════════
    // CH3: Coordinate Geometry → 官渡谍报·坐标篇 (200 AD 官渡之战)
    // ═══════════════════════════════════════
    ch3: {
      arc: { zh: '官渡谍报·坐标篇', en: 'Battle of Guandu — Coordinates' },
      historicalPeriod: '200 AD',
      chronologicalOrder: 3,
      narrator: '曹操',
      narrators: ['曹操', '郭嘉', '许褚', '荀攸'],
      topicEvents: {
        '3.1': { event: { zh: '军事地图', en: 'Military Map' }, setting: { zh: '建立坐标系标注敌营', en: 'Coordinate system for marking enemy camps' }, narrator: '曹操' },
        '3.2': { event: { zh: '进军路线', en: 'March Route' }, setting: { zh: '画出线性进军路线', en: 'Drawing linear march routes' }, narrator: '曹操' },
        '3.3': { event: { zh: '地势分析', en: 'Terrain Analysis' }, setting: { zh: '斜率分析地势陡缓', en: 'Gradient analysis of terrain' }, narrator: '郭嘉' },
        '3.4': { event: { zh: '侦察距离', en: 'Scouting Range' }, setting: { zh: '计算两营距离与中点', en: 'Distance and midpoint between camps' }, narrator: '许褚' },
        '3.5': { event: { zh: '奇袭路线', en: 'Surprise Attack Route' }, setting: { zh: '直线方程规划奇袭', en: 'Linear equations for surprise attacks' }, narrator: '曹操' },
        '3.6': { event: { zh: '平行包围', en: 'Parallel Encirclement' }, setting: { zh: '平行部署形成包围', en: 'Parallel deployments for encirclement' }, narrator: '荀攸' },
        '3.7': { event: { zh: '垂直截击', en: 'Perpendicular Intercept' }, setting: { zh: '垂直截击敌军退路', en: 'Perpendicular intercept of retreat path' }, narrator: '郭嘉' },
      }
    },

    // ═══════════════════════════════════════
    // CH4: Geometry → 虎牢关·几何篇 (190 AD 讨伐董卓)
    // ═══════════════════════════════════════
    ch4: {
      arc: { zh: '虎牢关·几何篇', en: 'Hulao Pass — Geometry' },
      historicalPeriod: '190 AD',
      chronologicalOrder: 2,
      narrator: '吕布',
      narrators: ['吕布', '关羽', '赵云', '诸葛亮'],
      topicEvents: {
        '4.1': { event: { zh: '城池识别', en: 'Fortress Recognition' }, setting: { zh: '识别城池几何形状', en: 'Recognizing fortress shapes' }, narrator: '赵云' },
        '4.2': { event: { zh: '工事修筑', en: 'Fortification Construction' }, setting: { zh: '几何作图修筑防线', en: 'Geometric constructions for defense lines' }, narrator: '关羽' },
        '4.3': { event: { zh: '比例沙盘', en: 'Scale Model' }, setting: { zh: '比例图制作战场沙盘', en: 'Scale drawings for battlefield models' }, narrator: '诸葛亮' },
        '4.4': { event: { zh: '沙盘推演', en: 'War Table Simulation' }, setting: { zh: '沙盘模型与实际城池的相似比 1:1000', en: 'Sand table model to real fortress: similarity ratio 1:1000' }, narrator: '诸葛亮' },
        '4.5': { event: { zh: '阵法对称', en: 'Formation Symmetry' }, setting: { zh: '八卦阵的对称性', en: 'Symmetry in the Eight Trigrams formation' }, narrator: '诸葛亮' },
        '4.6': { event: { zh: '城门角度', en: 'Gate Angles' }, setting: { zh: '城门与箭塔的角度计算', en: 'Angle calculations for gates and towers' }, narrator: '吕布' },
        '4.7': { event: { zh: '辕门射戟', en: 'Archery at the Gate' }, setting: { zh: '吕布在圆形辕门前射箭，圆定理的军事应用', en: 'Lü Bu\'s legendary archery at the circular camp gate — circle theorems in action' }, narrator: '吕布' },
        '4.8': { event: { zh: '行军轨迹', en: 'March Loci' }, setting: { zh: '作图与轨迹规划行军', en: 'Constructions and loci for march planning' }, narrator: '赵云' },
      }
    },

    // ═══════════════════════════════════════
    // CH5: Mensuration → 荆州屯田·度量篇 (209-219 AD 荆州治理)
    // ═══════════════════════════════════════
    ch5: {
      arc: { zh: '荆州屯田·度量篇', en: 'Jingzhou Farming — Mensuration' },
      historicalPeriod: '209-219 AD',
      chronologicalOrder: 6,
      narrator: '诸葛亮',
      narrators: ['诸葛亮', '曹操', '鲁肃', '荀彧'],
      topicEvents: {
        '5.1': { event: { zh: '度量标准', en: 'Measurement Standards' }, setting: { zh: '统一度量衡丈量土地', en: 'Standardizing measurements for land survey' }, narrator: '诸葛亮' },
        '5.2': { event: { zh: '屯田面积', en: 'Farmland Area' }, setting: { zh: '丈量屯田面积与围栏周长', en: 'Measuring farmland area and fence perimeter' }, narrator: '诸葛亮' },
        '5.3': { event: { zh: '铁锁连舟', en: 'Iron Chain Ships' }, setting: { zh: '圆形铁环与扇形甲板', en: 'Circular iron rings and sector decks' }, narrator: '周瑜' },
        '5.4': { event: { zh: '粮仓修筑', en: 'Granary Construction' }, setting: { zh: '粮仓的表面积与体积', en: 'Surface area and volume of granaries' }, narrator: '荀彧' },
        '5.5': { event: { zh: '复合工事', en: 'Compound Fortification' }, setting: { zh: '组合图形的城防面积', en: 'Compound shapes in fortress design' }, narrator: '诸葛亮' },
      }
    },

    // ═══════════════════════════════════════
    // CH6: Trigonometry → 赤壁水战·三角篇 (208 AD 赤壁之战)
    // ═══════════════════════════════════════
    ch6: {
      arc: { zh: '赤壁水战·三角篇', en: 'Battle of Red Cliffs — Trigonometry' },
      historicalPeriod: '208 AD',
      chronologicalOrder: 5,
      narrator: '周瑜',
      narrators: ['周瑜', '诸葛亮', '黄盖', '甘宁'],
      topicEvents: {
        '6.1': { event: { zh: '云梯攻城', en: 'Siege Ladders' }, setting: { zh: '勾股定理求云梯长度', en: "Pythagoras' theorem for ladder length" }, narrator: '许褚' },
        '6.2': { event: { zh: '江上测距', en: 'River Distance' }, setting: { zh: 'SOH CAH TOA 测量水面距离', en: 'SOH CAH TOA for river measurements' }, narrator: '甘宁' },
        '6.3': { event: { zh: '精确射击', en: 'Precision Archery' }, setting: { zh: '特殊角精确值瞄准', en: 'Exact trig values for aiming' }, narrator: '黄忠' },
        '6.4': { event: { zh: '潮汐预测', en: 'Tide Prediction' }, setting: { zh: '三角函数图像预测潮汐', en: 'Trig graphs for tide prediction' }, narrator: '诸葛亮' },
        '6.5': { event: { zh: '战船编队', en: 'Ship Formation' }, setting: { zh: '正弦余弦定理调度战船', en: 'Sine/cosine rules for ship deployment' }, narrator: '周瑜' },
        '6.6': { event: { zh: '立体攻防', en: '3D Warfare' }, setting: { zh: '三维空间的攻城计算', en: '3D trigonometry in siege warfare' }, narrator: '诸葛亮' },
      }
    },

    // ═══════════════════════════════════════
    // CH7: Transformations → 八阵图·变换篇 (228-234 AD 北伐中原)
    // ═══════════════════════════════════════
    ch7: {
      arc: { zh: '八阵图·变换篇', en: 'Eight Formations — Vectors' },
      historicalPeriod: '228-234 AD',
      chronologicalOrder: 7,
      narrator: '诸葛亮',
      narrators: ['诸葛亮', '姜维', '赵云', '魏延'],
      topicEvents: {
        '7.1': { event: { zh: '八阵图变', en: 'Eight Formations Transform' }, setting: { zh: '八卦阵的平移、旋转、反射变换', en: 'Translation, rotation, reflection in formations' }, narrator: '诸葛亮' },
        '7.2': { event: { zh: '行军向量', en: 'March Vectors' }, setting: { zh: '用向量描述行军方向', en: 'Vectors for march direction' }, narrator: '赵云' },
        '7.3': { event: { zh: '行军距离', en: 'March Distance' }, setting: { zh: '向量的模 = 行军实际距离', en: 'Vector magnitude = actual marching distance' }, narrator: '姜维' },
        '7.4': { event: { zh: '夹击合围', en: 'Pincer Attack' }, setting: { zh: '向量几何规划合围路线', en: 'Vector geometry for pincer movements' }, narrator: '诸葛亮' },
      }
    },

    // ═══════════════════════════════════════
    // CH8: Probability → 谋略博弈·概率篇 (贯穿全线)
    // 概率不作独立章节，以支线任务形式穿插各章。
    // 此处保留完整 topic 结构供 KP 注册和数据完整性使用。
    // ═══════════════════════════════════════
    ch8: {
      arc: { zh: '谋略博弈·概率篇', en: 'Strategic Gambles — Probability' },
      historicalPeriod: 'Throughout',
      chronologicalOrder: 0, // 0 = woven throughout, no fixed position
      narrator: '诸葛亮',
      narrators: ['诸葛亮', '司马懿', '关羽', '庞统'],
      topicEvents: {
        '8.1': { event: { zh: '卜卦问天', en: 'Divination' }, setting: { zh: '占卜吉凶的基础概率——嵌入CH1桃园结义', en: 'Basic probability in fortune telling — embedded in CH1' }, narrator: '诸葛亮' },
        '8.2': { event: { zh: '战场统计', en: 'Battle Statistics' }, setting: { zh: '历次战役的频率分析——嵌入CH4虎牢关', en: 'Frequency analysis of past battles — embedded in CH4' }, narrator: '司马懿' },
        '8.3': { event: { zh: '连环计策', en: 'Chain Strategies' }, setting: { zh: '独立事件与组合概率——嵌入CH3/CH6', en: 'Independent and combined event probabilities — embedded in CH3/CH6' }, narrator: '庞统' },
        '8.4': { event: { zh: '华容道赌', en: 'Huarong Pass Gamble' }, setting: { zh: '条件概率的博弈——嵌入CH6赤壁/CH7北伐', en: 'Conditional probability in pursuit — embedded in CH6/CH7' }, narrator: '关羽' },
      }
    },

    // ═══════════════════════════════════════
    // CH9: Statistics → 归晋统计·数据篇 (263-280 AD 天下归晋)
    // ═══════════════════════════════════════
    ch9: {
      arc: { zh: '归晋统计·数据篇', en: 'Unification — Statistics' },
      historicalPeriod: '263-280 AD',
      chronologicalOrder: 8,
      narrator: '司马懿',
      narrators: ['司马懿', '张昭', '诸葛亮', '鲁肃'],
      topicEvents: {
        '9.1': { event: { zh: '军籍登记', en: 'Census Registration' }, setting: { zh: '数据分类与列表编制', en: 'Data classification and tabulation' }, narrator: '张昭' },
        '9.2': { event: { zh: '战报分析', en: 'Battle Report Analysis' }, setting: { zh: '解读战报数据', en: 'Interpreting battle report data' }, narrator: '司马懿' },
        '9.3': { event: { zh: '战力评估', en: 'Combat Assessment' }, setting: { zh: '平均数、中位数评估战力', en: 'Mean, median for combat assessment' }, narrator: '鲁肃' },
        '9.4': { event: { zh: '天下大势图', en: 'Strategic Charts' }, setting: { zh: '用图表展示天下格局', en: 'Charts showing the state of kingdoms' }, narrator: '诸葛亮' },
        '9.5': { event: { zh: '战果相关', en: 'Victory Correlation' }, setting: { zh: '散点图分析胜负因素', en: 'Scatter diagrams for victory factors' }, narrator: '司马懿' },
        '9.6': { event: { zh: '人口统计', en: 'Population Census' }, setting: { zh: '累积频率分析人口分布', en: 'Cumulative frequency for population' }, narrator: '张昭' },
        '9.7': { event: { zh: '兵器分布', en: 'Weapon Distribution' }, setting: { zh: '频率直方图统计兵器', en: 'Histograms for weapon distribution' }, narrator: '司马懿' },
      }
    },
  }
};

/**
 * 军师讲堂 KP 完整清单
 * 对于无法自然融入战场情境的 KP，采用军师直接教学模式。
 */
export const MASTER_CLASS_KPS: Record<string, { zh: string; en: string }> = {
  'kp-1.14-01': { zh: '诸葛亮："后世有一神器，可代人运算……"', en: 'Zhuge Liang: "A future device that computes for you…"' },
  'kp-2.12-01': { zh: '诸葛亮："若有一术，可求曲线之变化率……"', en: 'Zhuge Liang: "A method to find rates of change on curves…"' },
  'kp-2.12-02': { zh: '诸葛亮："知变化率，可求极大极小之值"', en: 'Zhuge Liang: "Knowing the rate of change, find maxima and minima"' },
  'kp-2.13-01': { zh: '司马懿："以 f(x) 记一法则，简洁优雅"', en: 'Sima Yi: "Let f(x) denote a rule — elegant and concise"' },
  'kp-2.13-02': { zh: '庞统："连环计之妙，在于 f(g(x))——先施一计，再叠一计"', en: 'Pang Tong: "The beauty of chain strategies: f(g(x)) — one plan atop another"' },
  'kp-2.13-03': { zh: '诸葛亮："知正则知反，f⁻¹ 可逆推原值"', en: 'Zhuge Liang: "Know the forward, know the reverse — f⁻¹ reverses the rule"' },
  'kp-2.13-04': { zh: '诸葛亮："图像平移伸缩，如阵法之变"', en: 'Zhuge Liang: "Graph translations and stretches, like formation shifts"' },
};

/**
 * 游戏中章节推进顺序（按历史编年）
 * 用于地图 UI 解锁逻辑
 */
export const CHAPTER_CHRONOLOGICAL_ORDER = [
  'ch1', // 184 AD 黄巾起义 — 桃园结义
  'ch4', // 190 AD 讨伐董卓 — 虎牢关
  'ch3', // 200 AD 官渡之战 — 谍报
  'ch2', // 207 AD 三顾茅庐 — 隆中对
  'ch6', // 208 AD 赤壁之战 — 水战
  'ch5', // 209 AD 荆州治理 — 屯田
  'ch7', // 228 AD 北伐中原 — 八阵图
  'ch9', // 263 AD 天下归晋 — 统计
  // ch8 概率穿插在以上各章中，不单独列出
];
