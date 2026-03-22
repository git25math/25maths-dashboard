import type { QuestionType } from '../../types';

export type InputField = { id: string; label: string; placeholder: string };

type BilingualInputFields = { zh: InputField[]; en: InputField[] };

export const INPUT_FIELDS: Record<QuestionType, BilingualInputFields> = {
  LINEAR: {
    zh: [{ id: 'm', label: '斜率 m', placeholder: 'm = ?' }, { id: 'c', label: '截距 c', placeholder: 'c = ?' }],
    en: [{ id: 'm', label: 'Slope m', placeholder: 'm = ?' }, { id: 'c', label: 'Intercept c', placeholder: 'c = ?' }],
  },
  AREA: {
    zh: [{ id: 'area', label: '面积', placeholder: '面积 = ?' }],
    en: [{ id: 'area', label: 'Area', placeholder: 'Area = ?' }],
  },
  QUADRATIC: {
    zh: [{ id: 'a', label: '系数 a', placeholder: 'a = ?' }, { id: 'c', label: '系数 c', placeholder: 'c = ?' }],
    en: [{ id: 'a', label: 'Coefficient a', placeholder: 'a = ?' }, { id: 'c', label: 'Coefficient c', placeholder: 'c = ?' }],
  },
  ESTIMATION: {
    zh: [{ id: 'ans', label: '估算结果', placeholder: '结果 = ?' }],
    en: [{ id: 'ans', label: 'Estimate', placeholder: 'Result = ?' }],
  },
  PERCENTAGE: {
    zh: [{ id: 'ans', label: '最终金额', placeholder: '总额 = ?' }],
    en: [{ id: 'ans', label: 'Final Amount', placeholder: 'Total = ?' }],
  },
  INDICES: {
    zh: [{ id: 'x', label: '指数 x', placeholder: 'x = ?' }],
    en: [{ id: 'x', label: 'Exponent x', placeholder: 'x = ?' }],
  },
  PYTHAGORAS: {
    zh: [{ id: 'c', label: '斜边 c', placeholder: 'c = ?' }],
    en: [{ id: 'c', label: 'Hypotenuse c', placeholder: 'c = ?' }],
  },
  SIMULTANEOUS: {
    zh: [{ id: 'x', label: '未知数 x', placeholder: 'x = ?' }, { id: 'y', label: '未知数 y', placeholder: 'y = ?' }],
    en: [{ id: 'x', label: 'Variable x', placeholder: 'x = ?' }, { id: 'y', label: 'Variable y', placeholder: 'y = ?' }],
  },
  SIMPLE_EQ: {
    zh: [{ id: 'x', label: '未知数 x', placeholder: 'x = ?' }],
    en: [{ id: 'x', label: 'Variable x', placeholder: 'x = ?' }],
  },
  ANGLES: {
    zh: [{ id: 'x', label: '角度 x', placeholder: 'x = ?' }],
    en: [{ id: 'x', label: 'Angle x', placeholder: 'x = ?' }],
  },
  VOLUME: {
    zh: [{ id: 'v', label: '体积 V', placeholder: 'V = ?' }],
    en: [{ id: 'v', label: 'Volume V', placeholder: 'V = ?' }],
  },
  TRIGONOMETRY: {
    zh: [{ id: 'tan', label: 'tan(θ)', placeholder: 'tan = ?' }, { id: 'angle', label: '角度 θ', placeholder: 'θ = ?' }, { id: 'c', label: '距离 c', placeholder: 'c = ?' }],
    en: [{ id: 'tan', label: 'tan(θ)', placeholder: 'tan = ?' }, { id: 'angle', label: 'Angle θ', placeholder: 'θ = ?' }, { id: 'c', label: 'Distance c', placeholder: 'c = ?' }],
  },
  PROBABILITY: {
    zh: [{ id: 'p', label: '概率 P', placeholder: 'P = ?' }],
    en: [{ id: 'p', label: 'Probability P', placeholder: 'P = ?' }],
  },
  INTEGRATION: {
    zh: [{ id: 'area', label: '面积', placeholder: '面积 = ?' }],
    en: [{ id: 'area', label: 'Area', placeholder: 'Area = ?' }],
  },
  ROOTS: {
    zh: [{ id: 'x', label: '根 x', placeholder: 'x = ?' }],
    en: [{ id: 'x', label: 'Root x', placeholder: 'x = ?' }],
  },
  ARITHMETIC: {
    zh: [{ id: 'ans', label: '第 n 项', placeholder: 'aₙ = ?' }],
    en: [{ id: 'ans', label: 'Term n', placeholder: 'aₙ = ?' }],
  },
  CIRCLE: {
    zh: [{ id: 'c', label: '周长 C', placeholder: 'C = ?' }, { id: 'area', label: '面积 A', placeholder: 'A = ?' }],
    en: [{ id: 'c', label: 'Circumference C', placeholder: 'C = ?' }, { id: 'area', label: 'Area A', placeholder: 'A = ?' }],
  },
  FUNC_VAL: {
    zh: [{ id: 'y', label: '结果 y', placeholder: 'y = ?' }, { id: 't', label: '时间 t', placeholder: 't = ?' }],
    en: [{ id: 'y', label: 'Result y', placeholder: 'y = ?' }, { id: 't', label: 'Time t', placeholder: 't = ?' }],
  },
  DERIVATIVE: {
    zh: [{ id: 'k', label: '斜率 k', placeholder: 'k = ?' }, { id: 'x', label: '极值点 x', placeholder: 'x = ?' }],
    en: [{ id: 'k', label: 'Slope k', placeholder: 'k = ?' }, { id: 'x', label: 'Critical point x', placeholder: 'x = ?' }],
  },
  STATISTICS: {
    zh: [{ id: 'ans', label: '计算结果', placeholder: '结果 = ?' }],
    en: [{ id: 'ans', label: 'Result', placeholder: 'Result = ?' }],
  },
  RATIO: {
    zh: [{ id: 'ans', label: '结果', placeholder: '= ?' }],
    en: [{ id: 'ans', label: 'Result', placeholder: '= ?' }],
  },
  SIMILARITY: {
    zh: [{ id: 'x', label: '未知边 x', placeholder: 'x = ?' }],
    en: [{ id: 'x', label: 'Unknown side x', placeholder: 'x = ?' }],
  },
  FRACTION: {
    zh: [{ id: 'ans', label: '结果', placeholder: '结果 = ?' }],
    en: [{ id: 'ans', label: 'Result', placeholder: 'Result = ?' }],
  },
  VENN: {
    zh: [{ id: 'ans', label: '结果', placeholder: '结果 = ?' }],
    en: [{ id: 'ans', label: 'Result', placeholder: 'Result = ?' }],
  },
  HCF: {
    zh: [{ id: 'ans', label: 'HCF', placeholder: 'HCF = ?' }],
    en: [{ id: 'ans', label: 'HCF', placeholder: 'HCF = ?' }],
  },
  LCM: {
    zh: [{ id: 'ans', label: 'LCM', placeholder: 'LCM = ?' }],
    en: [{ id: 'ans', label: 'LCM', placeholder: 'LCM = ?' }],
  },
  FACTOR_TREE: {
    zh: [{ id: 'ans', label: '质因数个数', placeholder: '共几个质因数？' }],
    en: [{ id: 'ans', label: 'Prime factor count', placeholder: 'How many prime factors?' }],
  },
  PRIME: {
    zh: [{ id: 'ans', label: '是质数吗？', placeholder: '1=是, 0=否' }],
    en: [{ id: 'ans', label: 'Is it prime?', placeholder: '1=yes, 0=no' }],
  },
  INTEGER_ADD: {
    zh: [{ id: 'ans', label: '结果', placeholder: '= ?' }],
    en: [{ id: 'ans', label: 'Result', placeholder: '= ?' }],
  },
  FRAC_ADD: {
    zh: [{ id: 'ans', label: '结果', placeholder: '分数 = ?' }],
    en: [{ id: 'ans', label: 'Result', placeholder: 'Fraction = ?' }],
  },
  FRAC_MUL: {
    zh: [{ id: 'ans', label: '结果', placeholder: '分数 = ?' }],
    en: [{ id: 'ans', label: 'Result', placeholder: 'Fraction = ?' }],
  },
  SQUARE_CUBE: {
    zh: [{ id: 'ans', label: '结果', placeholder: '= ?' }],
    en: [{ id: 'ans', label: 'Result', placeholder: '= ?' }],
  },
  SQUARE_ROOT: {
    zh: [{ id: 'ans', label: '结果', placeholder: '= ?' }],
    en: [{ id: 'ans', label: 'Result', placeholder: '= ?' }],
  },
  SUBSTITUTION: {
    zh: [{ id: 'ans', label: '结果', placeholder: '= ?' }],
    en: [{ id: 'ans', label: 'Result', placeholder: '= ?' }],
  },
  PERIMETER: {
    zh: [{ id: 'ans', label: '周长', placeholder: '周长 = ?' }],
    en: [{ id: 'ans', label: 'Perimeter', placeholder: 'P = ?' }],
  },
  FACTORS_LIST: {
    zh: [{ id: 'ans', label: '因数个数', placeholder: '共几个因数？' }],
    en: [{ id: 'ans', label: 'Factor count', placeholder: 'How many factors?' }],
  },
  INTEGER_MUL: {
    zh: [{ id: 'ans', label: '结果', placeholder: '= ?' }],
    en: [{ id: 'ans', label: 'Result', placeholder: '= ?' }],
  },
  FDP_CONVERT: {
    zh: [{ id: 'ans', label: '结果', placeholder: '= ?' }],
    en: [{ id: 'ans', label: 'Result', placeholder: '= ?' }],
  },
  BODMAS: {
    zh: [{ id: 'ans', label: '结果', placeholder: '= ?' }],
    en: [{ id: 'ans', label: 'Result', placeholder: '= ?' }],
  },
  SIMPLIFY: {
    zh: [{ id: 'ans', label: '系数', placeholder: '= ?' }],
    en: [{ id: 'ans', label: 'Coefficient', placeholder: '= ?' }],
  },
  MIXED_IMPROPER: {
    zh: [{ id: 'ans', label: '结果', placeholder: '= ?' }],
    en: [{ id: 'ans', label: 'Result', placeholder: '= ?' }],
  },
  COORDINATES: {
    zh: [{ id: 'x', label: 'x 坐标', placeholder: 'x = ?' }, { id: 'y', label: 'y 坐标', placeholder: 'y = ?' }],
    en: [{ id: 'x', label: 'x coordinate', placeholder: 'x = ?' }, { id: 'y', label: 'y coordinate', placeholder: 'y = ?' }],
  },
  EXPAND: {
    zh: [{ id: 'ans', label: '展开结果', placeholder: '= ?' }],
    en: [{ id: 'ans', label: 'Expanded form', placeholder: '= ?' }],
  },
  FACTORISE: {
    zh: [{ id: 'ans', label: '公因子', placeholder: '= ?' }],
    en: [{ id: 'ans', label: 'Common factor', placeholder: '= ?' }],
  },
  INEQUALITY: {
    zh: [{ id: 'ans', label: '临界值', placeholder: '= ?' }],
    en: [{ id: 'ans', label: 'Critical value', placeholder: '= ?' }],
  },
  STD_FORM: {
    zh: [{ id: 'a', label: '系数 a', placeholder: 'a = ?' }, { id: 'n', label: '指数 n', placeholder: 'n = ?' }],
    en: [{ id: 'a', label: 'Coefficient a', placeholder: 'a = ?' }, { id: 'n', label: 'Exponent n', placeholder: 'n = ?' }],
  },
  SYMMETRY: {
    zh: [{ id: 'x', label: '新 x 坐标', placeholder: 'x = ?' }, { id: 'y', label: '新 y 坐标', placeholder: 'y = ?' }],
    en: [{ id: 'x', label: 'New x coordinate', placeholder: 'x = ?' }, { id: 'y', label: 'New y coordinate', placeholder: 'y = ?' }],
  },
};
