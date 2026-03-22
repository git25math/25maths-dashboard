# CONTRIBUTING.md 模板（25Maths 项目通用）

> 为每个 25Maths 项目创建 `docs/CONTRIBUTING.md` 时，按此模板的 15 节结构填写。
> 内容因项目不同，但**结构和质量标准必须一致**。

---

## 必须包含的 15 节

### 第一节：项目概览
- 项目名称 + 一句话定位
- GitHub 仓库地址
- 部署方式 + 线上地址
- 技术栈
- 当前版本 + 日期

### 第二节：目标用户
- 用户是谁？（学生/老师/管理员？）
- 用户的能力起点是什么？
- 核心原则（如"基础最薄弱的学生能否理解"）
- 具体的"可以/不可以"示例

### 第三节：质量标准
- 本项目的"金标准"是什么？（每个项目不同）
- 用表格列出具体规则（可量化的）
- 反面示例（Anti-patterns）表

### 第四节：内容/设计原则
- Play: 叙事设计原则 + 角色分配
- ExamHub: FLM 学习模式设计原则
- Website: 内容撰写 + SEO 原则
- CIE 分析: 标注精度 + 质量控制标准
- 视频: 脚本结构 + 时长 + 视觉标准

### 第五节：架构原则
- 数据/知识/内容的组织方式
- 依赖关系规则
- 模块间的接口约定

### 第六节：新增功能流程
- 添加新功能需要修改哪些文件？按什么顺序？
- 每一步的具体操作（像 Play 的 7 文件流程）

### 第七节：国际化/多语言
- 支持哪些语言？
- 如何添加新语言的翻译？
- 特殊字符/编码注意事项

### 第八节：可视化/UI 规范
- 组件库清单
- 响应式标准（最小屏幕宽度）
- 动画/交互同步规则

### 第九节：Bug 防范规则
- 历史 bug 总结（根因+修复）
- 防范规则列表（带检查方法）
- 如果项目还没有 bug 记录 → 创建空的 BUG-POSTMORTEM.md

### 第十节：审查标准
- 功能正确性 checklist
- 内容质量 checklist
- UI/UX checklist
- 每项必须可打勾（具体、可验证）

### 第十一节：关联项目
- 与其他 25Maths 项目的数据流
- 共享资源（Supabase/用户账号/知识点）
- 修改时的跨项目影响

### 第十二节：Git 规范
- commit message 格式
- 部署方式 + 验证命令
- 禁止事项（force push 等）

### 第十三节：数据/ID 分配规则
- Play: mission ID 范围
- ExamHub: level/kp ID 规则
- CIE 分析: paper/question 编号规则

### 第十四节：工作流
- 开发流程（回顾→执行→验证→部署）
- 审查流程（量化→对标→修复→再审）
- 交接流程（13+6 步自动 checklist）
- **一致性验证脚本**（每个项目自己的版本）

### 第十五节：核心文件索引
- 列出项目中所有重要文件 + 用途

---

## 每个项目还需要创建的文件

| 文件 | 用途 |
|------|------|
| `docs/CONTRIBUTING.md` | 按上述 15 节结构填写（唯一权威规范） |
| `docs/DEVELOPMENT-PLAN.md` | 版本历程 + 开发计划 + 下一步 |
| `docs/BUG-POSTMORTEM.md` | Bug 根因分析 + 防范规则（可以从空文件开始） |
| `CLAUDE.md` | Claude Code 启动协议（指向 CONTRIBUTING.md） |

---

## 交接一致性验证脚本（通用版）

```bash
# 1. 文档互引
for f in docs/*.md CLAUDE.md; do
  [ -f "$f" ] && echo "$(basename $f): $(grep -c CONTRIBUTING $f)"
done

# 2. 版本一致
grep '"version"' package.json 2>/dev/null
grep -i "版本\|version" docs/DEVELOPMENT-PLAN.md 2>/dev/null | head -1

# 3. 未提交改动
git status -s | grep '^ M src/'

# 4. 最近部署
REPO=$(git remote get-url origin 2>/dev/null | sed 's/.*github.com\///' | sed 's/.git$//')
[ -n "$REPO" ] && gh run list --repo "$REPO" --limit 1

# 5. build
npm run build 2>&1 | tail -1
```

---

## 适配指南

| Play 中的概念 | ExamHub 等价概念 | Website 等价概念 | CIE 分析等价概念 |
|--------------|-----------------|-----------------|-----------------|
| mission (关卡) | level (级别) | page (页面) | paper (试卷) |
| generator (生成器) | mode (学习模式) | template (模板) | stage (流水线阶段) |
| tutorialSteps | study hints | — | config rules |
| QuestionType | QuizType | — | TagCategory |
| BilingualText {zh,en} | 同 | lang_links | — |
| kp-registry.ts | levels.js | — | configs/*.json |
| Supabase gl_user_progress | Supabase 同表 | — | — |
