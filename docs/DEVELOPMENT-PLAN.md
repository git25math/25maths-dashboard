# 25Maths Dashboard — 开发计划与版本历程

> 完整开发规范见 `docs/CONTRIBUTING.md`。
> 详细开发日志见 `DEVELOPMENT.md`（80KB，含每个 Phase 的完整技术细节）。

---

## 项目信息

- **版本**: v1.0.0 (2026-03-19)
- **仓库**: `git25math/25maths-dashboard`
- **线上**: https://git25math.github.io/25maths-dashboard/
- **规模**: 251 TypeScript 文件, ~94K 行代码, 25+ 视图, 44 组件, 31 服务

---

## 版本历程

### Phase 1-9 — 基础搭建 (2026-02 ~ 2026-03-01)

| Phase | 内容 |
|-------|------|
| 1 | 项目初始化 (React + Vite + TS)，核心类型定义，mock 数据 |
| 2 | 核心视图：Dashboard / Timetable / Students / Teaching |
| 3 | Goals + Work Logs + QuickCapture |
| 4 | Student Profile 增强（状态/诉求/弱项/班级） |
| 5 | KaTeX 数学公式集成 |
| 6-7 | UI 打磨（toast 替代 alert、SOP/WorkLog CRUD） |
| 8 | Supabase 后端（12 表 + RLS + 9 个 service + 写穿缓存） |
| 9 | GitHub Actions CI/CD + GitHub Pages 部署 |

### Phase 10-17 — 功能扩展 (2026-03-01 ~ 03-02)

| Phase | 内容 |
|-------|------|
| 10 | Sub-Unit 模块（大单元→小单元，JSONB 结构） |
| 11 | Supabase Storage + 5 种资源链接上传 |
| 12 | Meeting Records（浏览器录音 + Gemini 转录 + AI 摘要） |
| 13 | Idea Pool 增强（3 态状态 + Dashboard 可见性） |
| 14 | Timetable → Lesson Records 自动关联 |
| 15 | 密码保护（7 天 session + 登出） |
| 16 | Goals / SchoolEvents / Settings 完整视图 |
| 17 | 暗色模式 + 全局搜索(Cmd+K) + 批量导入 + 响应式 + 拖拽课表 |

### Phase 18-26 — 深度功能 (2026-03-02 ~ 03-04)

| Phase | 内容 |
|-------|------|
| 18 | Calendar View（月历 + 日程 + 快速添加） |
| 19 | Timetable 增强（周期/单日模式 + 冲突检测 + prep 状态） |
| 20 | LaTeX-in-JSON 清洗 + `teachingAdapter` 数据迁移 |
| 21 | Timetable-Lesson 双向关联 + HP 奖励 inline 编辑 |
| 22 | SchoolEvent 4 种时间模式 + 日历事件集成 |
| 23 | Student Detail 增强（弱项/诉求/HP 全功能 CRUD） |
| 24 | Lesson Plan AI 生成 + AI 分类建议 + AI 合并 |
| 25 | AI 练习推荐 + AI 诊断 + 邮件摘要 |
| 26 | Meeting 增强（Smart Tasks + Action Plan + 关联任务面板） |

### Phase 27-29 — 项目管理 + GTD (2026-03-03)

| Phase | 内容 |
|-------|------|
| 27 | GTD Tasks + Projects（Inbox/Next/Waiting/Someday/Done） |
| 27.1 | **Hotfix**: Tasks 表缺失 + ID 碰撞 + 错误诊断 |
| 27.2 | **Hotfix**: 移动端侧边栏滚动 |
| 28 | Student Management 增强（班级筛选/Card-Table/批量 HP） |
| 28b | HP Award History 审计日志 |
| 28c | Student Sub-record 全维度 CRUD + Parent Communication |
| 28d | Mixed & Form Group 班级组扩展 |
| 29 | Email Digest（英文邮件 → 中文翻译 + 结构化事项） |

### Phase 29a-30h — 架构优化 + 内容管线 (2026-03-04 ~ 03-13)

| Phase | 内容 |
|-------|------|
| 29a | 架构重构 I（useAppData 模块化，-368 行） |
| 30c | Teaching Prep 层级（大单元→小单元→教学目标 4 类备课） |
| 30d | Harrow Y7-Y11 全部 407 个 LO 内容填充 |
| 30e | Objective Prep 聚合仪表 + 报告导出 |
| 30f | Unit Plans + AI Summary + Knowledge Cards 补齐 |
| 30g | Paper Generator（5,962 题组卷）+ Cover Designer（SVG 编辑器） |
| 30h | 架构优化 II（主包 -40%, 组件拆分 4 大视图→20+ 子组件, React.memo 77 个） |

### Chronicle 演进 (2026-03-13 ~ 03-16)

| 版本 | 内容 |
|------|------|
| V1 | 里程碑 + DevLog + 活动时间线 + 里程碑回顾 |
| V2 | DevLog 扩展、孵化状态、成长时间线、项目切换、叙事线 |
| V3 | 状态筛选、孵化看板、模板系统、内联任务、导出 |
| V4 | 搜索、星标、速度仪表盘、排序、批量操作、键盘快捷键 |
| V5 | 日志引用、标签热力图、里程碑时间线、差异对比、周报、自定义模板 |

### Video Hub + Agent (2026-03-16)

| Phase | 内容 |
|-------|------|
| Video Hub P1 | 多考试局视频脚本管理（8 boards: CIE/IAL/AMC/UKMT/BMMT/Kangaroo/ASDAN） |
| Video Hub P2 | MVE Agent 集成（SSE + TypedEvents + 自动重连） |

---

## 当前统计 (v1.0.0)

| 维度 | 数量 |
|------|------|
| TypeScript 文件 | 251 |
| 总代码行数 | ~94K |
| 视图 (Views) | 25+ (全部 lazy-load) |
| 组件 (Components) | 44 |
| 服务 (Services) | 31 |
| Supabase 表 | 18 |
| Supabase 迁移 | 26 |
| npm 脚本 | 17 |
| Gemini AI 端点 | 8+ |

---

## 下一步规划

### Phase 31 — Analytics & Reports
- [ ] Student progress analytics (图表)
- [ ] Teaching unit completion tracking per class
- [ ] Work log 时间统计（周/月）
- [ ] 可导出报告 (PDF)
- [ ] House Point 排行榜 & 趋势图表
- [ ] 家校沟通统计面板

### Phase 32 — Student Reports & Communication
- [ ] AI 生成学科报告（基于 exam_records + weaknesses + status_records）
- [ ] AI 生成家长会备忘录
- [ ] 学生画像导出（PDF/Markdown）
- [ ] 批量家长邮件通知
- [ ] 家校沟通跟进提醒

### Phase 33 — Advanced
- [ ] Supabase Realtime 实时同步
- [ ] Multi-user Auth
- [ ] PWA 离线模式
- [ ] Custom domain

### Phase 30a — 架构债务（待定）
- [ ] Student/Timetable/Meeting domain hooks 进一步拆分
- [ ] AppData Contract 文档
- [ ] Vitest 最小测试骨架
- [ ] CI lint 质量门禁
