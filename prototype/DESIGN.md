# MediData AI — 医疗数据治理智能平台 设计文档

> 文档版本：v1.0
> 生成日期：2026-09-09
> 适用范围：`c:\Users\84197\Desktop\prototype` 下的 HTML 原型

---

## 1. 产品概述

**MediData AI** 是一款面向医疗行业的数据治理智能平台原型，围绕“大模型 + 数据治理”构建核心体验。覆盖数据源接入、元数据管理、标准库、字段智能映射、SQL 开发、字典映射、ETL 脚本生成、数据质量、数据血缘、任务管理等完整数据工程链路。

### 1.1 设计目标

- 为医院/医疗机构数据工程师提供高效、可信赖的治理工作台。
- 通过 AI 能力标识降低智能化功能认知成本。
- 在信息密度高的企业级后台中保持清晰的视觉层级与操作路径。
- 支持亮/暗双主题，满足长时间操作场景。

### 1.2 页面清单（共 14 页）

| 页面文件 | 页面名称 | 核心用途 |
| --- | --- | --- |
| `login.html` | 登录页 | 账号密码登录入口 |
| `index.html` | 工作台 | 全局指标、AI 快捷入口、项目进度、最近活动 |
| `datasource.html` | 数据源管理 | 数据源接入、连接、状态监控 |
| `metadata-management.html` | 元数据管理 | 元数据浏览、检索、维护 |
| `standard-lib.html` | 标准库管理 | 标准表、字段、版本管理 |
| `field-mapping.html` | 字段智能映射 | AI 辅助源表与标准表字段映射 |
| `sql-developer.html` | SQL 开发 | SQL 编辑、执行、结果展示 |
| `dictionary.html` | 字典映射 | 医疗字典（ICD-10、性别等）映射维护 |
| `script-generator.html` | 脚本生成 | ETL 脚本自动生成与预览 |
| `data-quality.html` | 数据质量管理 | 质量规则、检测、评分与报告 |
| `lineage.html` | 数据血缘 | 血缘关系图谱与追溯 |
| `task-management.html` | 任务管理 | 任务分配、进度、执行状态 |
| `settings.html` | 系统设置 | 平台配置、权限、参数 |
| `audit-log.html` | 审计日志 | 操作审计、安全合规 |

---

## 2. 设计系统

### 2.1 色彩体系

平台以医疗行业信赖感为核心，主色采用**青绿色（Teal）**，辅以中性灰阶、状态语义色。所有颜色均提供 50-900 的完整色阶，并适配暗色模式。

#### 主色：Medical（医疗青）

| Token | 色值 | 用途 |
| --- | --- | --- |
| `medical-50` | `#f0fdfa` | 浅色背景、标签底色 |
| `medical-100` | `#ccfbf1` |  hover 背景、边框 |
| `medical-500` | `#14b8a6` | 图标、辅助高亮 |
| `medical-600` | `#0d9488` | **主按钮、链接、主题色** |
| `medical-700` | `#0f766e` | 深色 hover、渐变终点 |
| `medical-800` | `#115e59` | 侧边栏深色渐变 |
| `medical-900` | `#134e4a` | 暗色模式背景、边框 |

#### 辅助色：Primary（科技蓝）

| Token | 色值 | 用途 |
| --- | --- | --- |
| `primary-50` | `#eff6ff` | 信息卡片背景 |
| `primary-500` | `#3b82f6` | 进度条、图表 |
| `primary-600` | `#2563eb` | 信息链接 |

#### 语义色

| 语义 | Token | 色值 | 用途 |
| --- | --- | --- | --- |
| 成功 | `success-600` | `#16a34a` | 正常状态、成功提示 |
| 警告 | `warning-600` | `#d97706` | 告警、待处理 |
| 危险 | `danger-600` | `#dc2626` | 失败、删除、错误提示 |

#### 中性色

| Token | 亮模式 | 暗模式 | 用途 |
| --- | --- | --- | --- |
| 页面背景 | `gray-50` | `gray-900` | body 背景 |
| 卡片背景 | `white` | `gray-800` | 卡片、面板 |
| 主要文字 | `gray-900` | `gray-100` | 标题、关键数字 |
| 次要文字 | `gray-500` | `gray-400` | 说明、辅助信息 |
| 边框 | `gray-100` / `gray-200` | `gray-700` | 卡片边框、分割线 |

### 2.2 字体规范

- **主字体**：`Inter`, `Noto Sans SC`, `system-ui`, `-apple-system`, sans-serif
- **等宽字体**：`Consolas`, `Monaco`, `Courier New`, monospace（用于 SQL、代码块）
- **加载策略**：Google Fonts CDN + `font-display: swap`

| 层级 | 字号 | 行高 | 字重 | 用途 |
| --- | --- | --- | --- | --- |
| 页面大标题 | `text-2xl` (24px) | 32px | 700 | 工作台问候语 |
| 卡片标题 | `text-lg` (18px) | 28px | 600/700 | 区块标题 |
| 正文 | `text-sm` (14px) | 20px | 400/500 | 说明文字、表格内容 |
| 辅助文本 | `text-xs` (12px) | 16px | 400/500 | 标签、时间、状态 |
| 核心数字 | `text-2xl` / `text-3xl` | - | 700 | 指标卡片数值 |

### 2.3 间距与圆角

- **基础间距单位**：4px（Tailwind `spacing: 0.25rem`）
- **卡片内边距**：`p-6` (24px)
- **页面边距**：`p-6` (24px)
- **网格间距**：`gap-6` (24px)
- **卡片圆角**：`rounded-2xl` (16px)
- **按钮圆角**：`rounded-xl` (12px)
- **标签圆角**：`rounded-full` (药丸形)
- **输入框圆角**：`rounded-xl` (12px)

### 2.4 阴影与层级

| Token | 值 | 用途 |
| --- | --- | --- |
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)` | 默认卡片 |
| `--shadow-card-hover` | `0 12px 32px rgba(15,118,110,0.08), 0 4px 8px rgba(0,0,0,0.04)` | 卡片 hover |
| `--shadow-popover` | `0 12px 40px rgba(0,0,0,0.12)` | 下拉、抽屉、弹窗 |

### 2.5 图标系统

- **图标库**：Font Awesome 6.4.0（CDN）
- **图标尺寸**：默认继承文字大小，大图标 `text-xl` / `text-2xl`
- **使用规范**：装饰性图标统一使用 `aria-hidden="true"`，关键状态配合文字说明

---

## 3. 全局布局

### 3.1 页面骨架

所有内部页面采用统一的三栏/三区布局：

```
┌─────────────────────────────────────────────────────────┐
│  侧边栏 (Sidebar)      │  顶部栏 (Header)                │
│  w-64 / 可折叠          ├─────────────────────────────────┤
│                        │  面包屑 (Breadcrumb)            │
│                        ├─────────────────────────────────┤
│                        │                                 │
│                        │  主内容区 (Main Content)        │
│                        │  flex-1 overflow-y-auto         │
│                        │                                 │
└────────────────────────┴─────────────────────────────────┘
```

### 3.2 侧边栏

- **默认宽度**：256px (`w-64`)
- **折叠宽度**：64px (`sidebar-collapsed`)
- **背景**：线性渐变 `medical-700 → medical-900`（亮）/ `emerald-900 → emerald-950`（暗）
- **结构**：
  - 顶部 Logo 区：医院图标 + MediData AI 名称 + 副标题
  - 中部导航：分组展示“核心功能”与“系统”
  - 底部用户区：头像 + 姓名/角色 + 退出按钮
- **AI 标识**：智能功能右侧带 `AI` 小标签
- **交互**：
  - 当前页面高亮（右侧 3px 指示条 + 背景色变化）
  - hover 时背景变白 8%
  - 桌面端可折叠；移动端变为抽屉式侧滑

### 3.3 顶部栏

- **高度**：约 64px（`py-4` + 内容高度）
- **样式**：毛玻璃效果 (`glass-effect`) + 底部边框
- **左侧**：菜单折叠按钮 + 全局搜索框（支持 ⌘K 快捷联想）
- **右侧**：
  - 暗色模式切换
  - 通知铃铛（未读红点）
  - 消息信封（未读数字）
  - 分隔线
  - 当前机构/项目标识

### 3.4 面包屑

- 固定在顶部栏下方
- 格式：`工作台 / 当前页面`
- 当前页使用主色高亮

### 3.5 主内容区

- 可滚动区域，`flex-1 overflow-y-auto`
- 内容统一使用 `p-6` 内边距
- 页面模块通过 `data-reveal` 触发滚动渐显动画

---

## 4. 组件规范

### 4.1 指标卡片（Stats Card）

- 白色/暗色卡片背景，`rounded-2xl`，`p-6`
- 顶部左侧：48px 圆角图标背景（按指标类型着色）
- 顶部右侧：趋势标签（本周增量/待处理）
- 中部：核心数值（`text-2xl font-bold`）
- 底部：描述 + 辅助信息（进度条 / 状态点 / 分类标签）
- Hover：上浮 3px + 阴影增强 + 边框泛医疗青色

### 4.2 AI 智能助手卡片

- 医疗青渐变背景 `from-medical-600 to-medical-700`
- 装饰性半透明圆形光斑
- 顶部：机器人图标 + 标题 + AI 在线状态
- 下方 5 个快捷入口：智能映射、生成 SQL、生成脚本、字典映射、智能问答
- 入口使用半透明背景 + 毛玻璃效果，hover 变亮

### 4.3 按钮

| 类型 | 样式 | 用途 |
| --- | --- | --- |
| 主按钮 | `bg-medical-600 text-white rounded-xl` + 阴影 | 主要操作（新建、保存、执行） |
| 次按钮 | `bg-white border rounded-xl text-gray-700` | 次要操作（导出、取消） |
| 图标按钮 | `p-2 rounded-lg hover:bg-gray-100` | 工具栏操作 |
| 危险按钮 | `bg-danger-600 text-white` | 删除、禁用 |

- 所有按钮统一 `btn-transition` 过渡
- 加载状态使用 `btn-loading`（显示 spinner）
- Focus-visible 使用 2px `medical-400` 描边

### 4.4 输入框 / 表单

- 背景：`bg-gray-100`（亮）/ `bg-gray-700`（暗）
- 圆角：`rounded-xl`
- 聚焦：`focus:ring-2 focus:ring-medical-500`
- 在 `overflow:hidden` 容器内使用 `.form-control-focus` 内阴影聚焦样式，防止 ring 被裁切

### 4.5 表格

- 表头使用灰色背景区分
- 行 hover：`table-row-hover` → `var(--bg-hover)`
- 固定列宽使用 `table-fixed`
- 单元格内操作按钮通常右对齐

### 4.6 标签 / 徽章

- 药丸形圆角 `rounded-full`
- 按语义使用 `success` / `warning` / `danger` / `medical` / `primary` 底色
- 文字使用对应 600/700 色

### 4.7 进度条

- 背景轨道：`bg-gray-100 rounded-full h-2`
- 填充条：`bg-medical-500 / bg-primary-500 h-2 rounded-full`
- 页面加载时从 0% 动画到目标宽度

### 4.8 状态点

| 状态 | 类名 | 颜色 |
| --- | --- | --- |
| 在线/正常 | `status-online` | 绿色 #10b981 |
| 告警 | `status-warning` | 橙色 #f59e0b |
| 离线/失败 | `status-offline` | 红色 #ef4444 |

### 4.9 弹窗与抽屉

- **确认弹窗**：居中显示，最大宽度 420px，带图标 + 标题 + 描述 + 双按钮
- **Toast**：右上角堆叠，最多 4 条，3 秒自动消失
- **AI 抽屉**：右侧固定 400px 宽，用于智能问答，overlay 遮罩

---

## 5. 交互与动效

### 5.1 过渡动画

| 元素 | 效果 | 时长 | 缓动 |
| --- | --- | --- | --- |
| 卡片 hover | translateY(-3px) + shadow | 250ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| 按钮 hover | 背景/颜色变化 | 200ms | ease |
| 侧边栏折叠 | 宽度变化 + 图标居中 | 300ms | ease |
| AI 抽屉 | right 属性滑动 | 300ms | ease |
| 进度条 | width 0% → target | 500ms | ease |
| 页面内容 reveal | opacity + translateY | 自定义 | ease |

### 5.2 滚动揭示

- 使用 `IntersectionObserver`，threshold 0.08
- 元素进入视口时添加 `.is-visible`
- 支持 `prefers-reduced-motion: reduce`，自动关闭动画

### 5.3 暗色模式

- 通过 `html.dark` 类切换
- 状态持久化到 `localStorage` (`medidata-theme`)
- 默认跟随系统 `prefers-color-scheme`
- 切换时派发 `medidata:theme-change` 事件，供图表组件响应

### 5.4 全局搜索

- 输入框支持实时联想（300ms debounce）
- 结果按类型分组：数据源、标准表、元数据、字典、功能、系统
- Enter 触发全局结果面板
- Escape 关闭下拉
- 快捷键：⌘K / Ctrl+K

---

## 6. 响应式策略

### 6.1 断点

基于 Tailwind CSS 默认断点：

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### 6.2 布局变化

| 场景 | 行为 |
| --- | --- |
| 桌面端 (≥1024px) | 侧边栏常驻 256px，可折叠为 64px |
| 平板 (768px–1024px) | 侧边栏可折叠，主内容自适应 |
| 移动端 (<768px) | 侧边栏变为抽屉式，点击汉堡菜单滑出；主内容单列堆叠 |

### 6.3 网格适配

- 指标卡片：`grid-cols-2 md:grid-cols-4`
- 主内容 12 列布局：`col-span-12 lg:col-span-8` + `lg:col-span-4`
- AI 快捷入口在窄屏自动换行

---

## 7. 无障碍设计

- **Skip Link**：提供“跳转到主内容”链接，聚焦时显示在顶部
- **焦点可见性**：全局 `:focus-visible` 使用 2px `medical` 色描边
- **ARIA 标签**：导航、搜索、按钮、通知均配置 `aria-label` / `aria-expanded` / `aria-current`
- **语义化**：使用 `<main>`、`<aside>`、`<nav>`、`<header>` 等结构标签
- **减少动效**：`prefers-reduced-motion: reduce` 下关闭所有动画与 hover 位移动效
- **色彩对比**：主文字与背景保持 WCAG AA 以上对比度

---

## 8. 技术实现

### 8.1 文件结构

```
prototype/
├── components/
│   ├── common.css        # 全局样式、变量、组件样式
│   ├── common.js         # 公共脚本：侧边栏、顶部栏、搜索、主题、弹窗等
│   ├── tailwind.css      # Tailwind CSS v4 编译产物
│   └── tailwind.src.css  # Tailwind 源文件（如使用）
├── *.html                # 14 个业务页面
└── DESIGN.md             # 本设计文档
```

### 8.2 技术栈

- **HTML5**：语义化结构
- **Tailwind CSS v4**：工具类样式 + 自定义主题扩展
- **Font Awesome 6.4.0**：图标
- **原生 JavaScript**：无框架依赖，公共逻辑集中在 `common.js`
- **Google Fonts**：Inter + Noto Sans SC

### 8.3 自定义 Tailwind 扩展

在 `tailwind.css` 中扩展了以下颜色：

- `medical-50 ~ medical-900`
- `primary-50 ~ primary-900`
- `success-50 ~ success-900`
- `warning-50 ~ warning-900`
- `danger-50 ~ danger-900`

### 8.4 公共脚本能力

- `renderSidebar()`：动态渲染侧边栏导航
- `renderHeader()`：动态渲染顶部栏
- `renderBreadcrumb()`：动态渲染面包屑
- `MediData.darkMode`：暗色模式管理
- `handleSearchInput()`：全局搜索联想
- `showToast()`：轻量提示
- `showConfirm()`：确认弹窗
- `initReveal()`：滚动揭示动画
- `animateProgressBars()`：进度条入场动画

---

## 9. 关键页面设计要点

### 9.1 工作台 (`index.html`)

- 顶部问候语 + 待处理任务数 + 导出日报 / 新建任务按钮
- 4 个核心指标卡片：数据源、字段映射、ETL 任务、数据质量评分
- AI 智能助手卡片：5 大 AI 快捷入口
- 项目进度列表 + 最近活动列表
- 整体采用“数据概览 → AI 能力 → 详细进度”的信息层级

### 9.2 字段智能映射 (`field-mapping.html`)

- 左右分栏：源表树 / 标准表树 + 映射关系表格
- 置信度标签：`confidence-high` / `confidence-medium` / `confidence-low`
- 源/目标标签使用不同渐变色区分

### 9.3 SQL 开发 (`sql-developer.html`)

- 顶部数据源选择 + 操作按钮
- 左侧对象树 / 右侧 SQL 编辑器 + 结果面板
- 代码块使用等宽字体

### 9.4 数据血缘 (`lineage.html`)

- 全宽画布区域，用于展示节点关系图
- 图例说明节点类型与关系

### 9.5 任务管理 (`task-management.html`)

- 看板式任务卡片
- 右侧任务详情抽屉
- 任务状态标签 + 优先级标识

---

## 10. 设计原则

1. **医疗专业感**：青绿色主调传递洁净、安全、可信的医疗气质。
2. **AI 显性化**：智能功能通过 `AI` 标签、渐变卡片、机器人图标突出展示。
3. **信息密度与呼吸感平衡**：卡片化布局 + 充足留白 + 清晰分隔线。
4. **一致性**：所有页面共享侧边栏、顶部栏、面包屑、按钮、表单样式。
5. **可访问性**：支持键盘导航、屏幕阅读器、减少动效、暗色模式。
6. **性能优先**：使用 `content-visibility`、`will-change`、IntersectionObserver 等优化手段。

---

## 11. 后续迭代建议

- 引入 ECharts / D3 实现数据血缘与质量趋势可视化。
- 为 SQL 编辑器接入 Monaco Editor 提升编辑体验。
- 统一表单校验与错误提示样式。
- 完善移动端侧边栏手势滑动关闭。
- 考虑将常用表格抽象为可复用组件。

---

*本设计文档基于当前 HTML 原型代码结构、样式变量与交互逻辑整理，可作为后续开发与迭代的视觉与交互基准。*
