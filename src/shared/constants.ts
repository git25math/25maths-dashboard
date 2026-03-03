export const YEAR_GROUPS = ['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Mixed', 'Form'] as const;

/** Year groups that have teaching plans (excludes Mixed and Form) */
export const TEACHING_YEAR_GROUPS = ['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12'] as const;

export const NON_TEACHING_GROUPS = new Set<string>(['Mixed', 'Form']);

export const USER_CONFIG = {
  name: 'Nalo',
  room: 'A219',
  email: 'upperoncall@harrowhaikou.cn',
} as const;
