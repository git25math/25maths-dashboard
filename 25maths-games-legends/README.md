# 25 数学三国 (25 Math Legends)

> 用数学征战天下 — 结合三国演义与 CIE 0580 考纲的闯关式数学学习平台

🌐 **在线体验**: [play.25maths.com](https://play.25maths.com)

## 项目特色

- **练习模式**: 看例题 → 有提示练习 → 独立练习 → 技能勋章
- **闯关模式**: 5 题连闯 + 连击系统 + Roguelike 技能卡
- **全考纲覆盖**: 49 个关卡，24 种题型生成器，涵盖 Y7-Y12
- **动态难度**: ★→★★→★★★ 自适应（连对升级/连错降级）
- **三国故事线**: 按史实编年 9 章（桃园结义→天下归晋）
- **数学输入**: 支持分数(3/4)、根号(√5)、负数，概率用分数显示
- **科学计算器**: 内置 🧮 计算器
- **双语支持**: 中英文切换
- **移动端适配**: iPhone SE → iPad 全兼容

## 技术栈

- **前端**: React 19 + TypeScript + Tailwind CSS v4
- **动画**: Motion (Framer Motion)
- **数学渲染**: KaTeX
- **后端**: Supabase (Auth + Database)
- **部署**: GitHub Pages (自动部署)
- **测试**: 980 自动化生成器验证

## 如何运行

```bash
git clone https://github.com/git25math/25maths-games-legends.git
cd 25maths-games-legends
npm install
npm run dev
```

## 项目结构

```
src/
├── screens/          # 4 个页面 (Welcome, GradeSelect, Map, Practice)
├── components/       # UI 组件 (MathBattle, SkillCards, Calculator, etc.)
├── data/             # 49 个 mission + 6 角色 + 课程映射
├── hooks/            # 5 个 hooks (Auth, Profile, Audio, etc.)
├── utils/            # 生成器(24种) + 答案验证 + 插值 + 解析器
└── i18n/             # 双语翻译
```
