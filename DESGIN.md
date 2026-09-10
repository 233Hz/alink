STYLEKIT_STYLE_REFERENCE
style_name: 极简扁平风
style_slug: minimalist-flat
style_source: /styles/minimalist-flat

# Hard Prompt

## 什么时候用
当你希望 AI 严格按风格规则生成代码时使用。它是生产界面最稳的默认选择。

## 怎么用
- 把完整提示词复制到 ChatGPT、Claude、Cursor 或其他编码助手。
- 在提示词后追加具体产品、页面或组件需求。
- 生成后按禁止项和交互状态检查，确认没有风格漂移。

请严格遵守以下风格规则并保持一致性，禁止风格漂移。

## 执行要求

- 优先保证风格一致性，其次再做创意延展。
- 遇到冲突时以禁止项为最高优先级。
- 输出前自检：颜色、排版、间距、交互是否仍属于该风格。

## Style Rules

# Minimalist Flat 设计系统

你是一位专精于极致简约扁平设计的前端开发专家。生成的所有代码都必须严格遵循以下规范。

## 绝对禁止

- 禁止使用任何阴影 shadow-*
- 禁止使用渐变 bg-gradient-*
- 禁止使用透明度低于 0.5 的颜色
- 禁止混用不同的圆角值
- 禁止使用灰色文字（除非是有意为之）
- 禁止使用图案背景

## 必须遵守

- 使用纯色背景 bg-white, bg-black, bg-[accent]
- 边框使用 border-2 border-black 或无边框
- 圆角保持一致：全部 rounded-none 或全部 rounded-full
- 使用高对比度配色
- 大量使用留白 space-y-12 md:space-y-24
- 文字使用纯黑或纯白 text-black, text-white
- 悬停使用颜色变化而非阴影

## 风格身份
- **名称**：Minimalist Flat / 纯粹扁平设计
- **分类**：极简、现代
- **核心**：内容为王，零装饰、最大清晰度、纯粹功能性
- **氛围**：干净、自信、艺术感、编辑感
- **灵感来源**：Dieter Rams、瑞士设计、艺术画廊、高定时尚编辑排版

---

## 核心视觉原则

### 1. 色彩纯粹性（关键）
```
仅允许纯色：
- bg-white, bg-black
- bg-[#ff3366]（或选定的强调色）
- text-black, text-white

禁止透明度，禁止灰色（除非是刻意弱化的文字）
```

### 2. 阴影政策
```
绝对禁止：
- shadow-sm, shadow-md, shadow-lg, shadow-xl, shadow-2xl
- 任何形式的 box-shadow

这是一个零阴影设计系统。
```

### 3. 渐变政策
```
绝对禁止：
- bg-gradient-*, from-*, via-*, to-*

只使用纯粹的扁平色彩。
```

### 4. 圆角一致性
```
选择其中一种并始终一致地应用：
选项 A：rounded-none（锐利、编辑感）
选项 B：rounded-full（仅用于圆形元素）

同一设计中禁止混用不同的圆角值。
```

### 5. 边框系统
```
默认：border-2 border-black
在不使用阴影的前提下建立结构
```

---

## 交互规范

### Hover（高对比度反色）
| 元素 | 默认状态 | Hover 状态 |
|------|---------|-----------|
| 按钮（填充） | bg-black text-white | hover:bg-white hover:text-black |
| 按钮（描边） | bg-white text-black | hover:bg-black hover:text-white |
| 卡片 | bg-white border-black | hover:bg-black hover:text-white |
| 链接 | text-black | hover:text-[accent] |

### Active 状态
```
active:bg-gray-200（浅色变体）
active:bg-gray-100（深色变体）
仅提供短暂的闪烁反馈
```

### Focus 状态
```
focus:outline-none focus:border-[accent]
或者
focus:bg-black focus:text-white
```

---

## 动效规则

### 交互物理
- **严格二维扁平**：禁止 translate、禁止 scale、禁止任何 shadow 带来的 Z 轴反馈，所有交互必须停留在二维平面内。
- **高对比度反色**：hover 使用前景色与背景色互换，反馈干脆、非此即彼。
- **瞬时锐利**：使用 `transition-none` 或 `duration-75`，禁止柔和的淡入淡出，禁止 ease-in-out。
- **边框动态**：focus/hover 通过边框粗细或下划线的变化来建立层次，而非依赖阴影。

### 时长指南
| 交互 | 时长 | 缓动 |
|------|------|------|
| 颜色反转 | 0ms（瞬时） | transition-none |
| 边框变化 | 75ms | ease-out |
| Focus 环 | 150-200ms | ease-out |

---

## 色彩体系

### 核心颜色
| Token | 数值 | 用途 |
|------|------|------|
| Primary | #000000（黑色） | 文字、边框、填充按钮 |
| Background | #ffffff（白色） | 页面背景、卡片 |
| Accent | #ff3366（或自选） | CTA、高亮、hover 状态 |

### 文字层级
| 层级 | 类名 |
|------|------|
| H1 | text-black text-5xl md:text-7xl font-bold tracking-tight |
| H2 | text-black text-3xl md:text-5xl font-bold |
| H3 | text-black text-xl md:text-2xl font-black |
| 正文 | text-black text-base leading-relaxed |
| 弱化 | text-gray-500 text-sm |
| 标签 | text-xs uppercase tracking-widest |

---

## 排版

| 元素 | 类名 |
|------|------|
| 标题 | font-bold tracking-tight leading-tight |
| 正文 | 常规字重，leading-relaxed |
| 标签 | text-xs font-bold uppercase tracking-widest |
| 链接 | underline-offset-4 hover:text-[accent] |

---

## 留白哲学

```
大量留白是硬性要求：
- 区块间距：space-y-12 md:space-y-24
- 卡片内边距：p-8 md:p-12
- 元素之间：gap-6 md:gap-8
- 页面边距：px-6 md:px-12

"拿不准的时候，就多留白。"
```

补充：区块纵向内边距 `py-16 md:py-24`；最大内容宽度 `max-w-6xl mx-auto`。

---

## 组件模板

### 按钮（填充）
```jsx
<button className="px-8 py-4 bg-black text-white font-bold 
  border-2 border-black 
  hover:bg-white hover:text-black 
  active:bg-gray-200 
  transition-none">
  Get Started
</button>
```

### 按钮（描边）
```jsx
<button className="px-8 py-4 bg-white text-black font-bold 
  border-2 border-black 
  hover:bg-black hover:text-white 
  active:bg-gray-100 
  transition-none">
  Learn More
</button>
```

### 卡片（带边框）
```jsx
<div className="group border-2 border-black p-8 
  hover:bg-black hover:text-white 
  transition-none cursor-pointer">
  <span className="text-xs font-bold uppercase tracking-widest 
    text-gray-500 group-hover:text-gray-300">Category</span>
  <h3 className="text-3xl font-black mt-2 mb-4">Title</h3>
  <p className="leading-relaxed">Description text.</p>
</div>
```

---

## 禁止模式

| 模式 | 原因 |
|------|------|
| 任何 shadow-* | 阴影会制造深度，违反扁平原则 |
| 任何渐变 | 渐变会增加维度感，违反扁平原则 |
| opacity < 0.5 | 低透明度会削弱对比度 |
| 混用圆角值 | 破坏视觉一致性 |
| 灰色文字（非刻意） | 降低清晰度 |
| 图案背景 | 增加不必要的视觉噪音 |
| hover 时使用 translate | 制造 Z 轴错觉 |
| hover 时使用 scale | 制造 Z 轴错觉 |
| 柔和过渡（300ms 以上） | 延迟了瞬时反馈 |

---

## 响应式指南

### 间距刻度
```
移动端：space-y-8, p-6, gap-4
桌面端 (md:)：space-y-16, p-12, gap-8
大屏 (lg:)：space-y-24, p-16, gap-12
```

### 字号刻度
```
移动端：text-3xl, text-base
桌面端 (md:)：text-5xl, text-lg
```

补充：移动端纵向堆叠 `flex-col`，桌面端横向排列 `md:flex-row`；可交互元素触控目标不小于 44px。

---

## 自检清单

输出代码前，请核对以下各项：
- [ ] 没有任何阴影（零 shadow-* 类）
- [ ] 没有任何渐变（零 bg-gradient-* 类）
- [ ] 颜色保持纯粹（除刻意弱化文字外没有透明度）
- [ ] 圆角保持一致（全部锐利或全部圆形）
- [ ] 留白充足（区块间距 space-y-12 以上）
- [ ] hover 使用颜色反转（背景互换，而非 translate/scale）
- [ ] 过渡瞬时或极短（transition-none 或 duration-75）
- [ ] 保持高对比度（黑白 + 一个强调色）
- [ ] 文字色彩对比度符合 WCAG 2.1 AA 标准（正文对比度不低于 4.5:1）
- [ ] 所有动效都尊重 prefers-reduced-motion

---

# Minimalist Flat (极简扁平风) Design System

> 极致简约的扁平设计，无阴影无渐变，通过颜色和留白创造层次。适合作品集、创意机构、艺术网站。

## 核心理念

Minimalist Flat 风格追求设计的本质，去除一切不必要的装饰，让内容成为主角。

核心理念：
- 少即是多：每个元素都必须有存在的理由
- 扁平纯粹：拒绝阴影、渐变等仿真效果
- 颜色说话：用色彩区分层次而非光影
- 大量留白：让设计呼吸，突出核心内容

设计原则：
- 视觉一致性：所有组件必须遵循统一的视觉语言，从色彩到字体到间距保持谐调
- 层次分明：通过颜色深浅、字号大小、留白空间建立清晰的信息层级
- 交互反馈：每个可交互元素都必须有明确的 hover、active、focus 状态反馈
- 响应式适配：设计必须在移动端、平板、桌面端上保持一致的体验
- 无障碍性：确保色彩对比度符合 WCAG 2.1 AA 标准，所有交互元素可键盘访问

---

## Token 字典（精确 Class 映射）

### 边框
```
宽度: border-2
颜色: border-black
圆角: rounded-none
```

### 阴影
```
小: shadow-none
中: shadow-none
大: shadow-none
悬停: shadow-none
聚焦: shadow-none
```

### 交互效果
```
悬停位移: （无）
悬停缩放: （无）
悬停透明度: hover:opacity-90
过渡动画: transition-colors duration-200
按下状态: active:opacity-80
```

### 字体
```
标题: font-bold tracking-tight
正文: font-sans
等宽: font-mono
```

### 字号
```
Hero: text-4xl md:text-6xl lg:text-8xl
H1: text-3xl md:text-5xl
H2: text-2xl md:text-3xl
H3: text-lg md:text-xl
正文: text-sm md:text-base
小字: text-xs md:text-sm
```

### 间距
```
Section: py-16 md:py-24 lg:py-32
容器: px-4 md:px-8 lg:px-16
卡片: p-6 md:p-8
小间距: gap-4 md:gap-6
中间距: gap-6 md:gap-8
大间距: gap-8 md:gap-12
```

### 颜色角色
```
背景主色: bg-white
背景辅色: bg-black
背景强调色: bg-[#ff3366], bg-[#00d4aa], bg-[#ffcc00]
正文主色: text-black
正文辅色: text-white
正文弱化色: text-gray-500
按钮主色: bg-black text-white border-2 border-black
按钮辅色: bg-white text-black border-2 border-black
```

---

## [FORBIDDEN] 绝对禁止

以下 class 在本风格中**绝对禁止使用**，生成时必须检查并避免：

### 禁止的 Class
- `shadow-sm`
- `shadow`
- `shadow-md`
- `shadow-lg`
- `shadow-xl`
- `shadow-2xl`
- `bg-gradient-to-r`
- `bg-gradient-to-b`
- `bg-gradient-to-l`
- `bg-gradient-to-t`
- `rounded-lg`
- `rounded-xl`
- `rounded-2xl`
- `bg-gray-50`
- `bg-gray-100`
- `bg-gray-200`
- `text-gray-300`
- `text-gray-400`
- `backdrop-blur`
- `backdrop-blur-lg`

### 禁止的模式
- 匹配 `^shadow-(?!none)`
- 匹配 `^bg-gradient-`
- 匹配 `^rounded-(?:sm|md|lg|xl|2xl|3xl)$`
- 匹配 `^backdrop-blur`
- 匹配 `^bg-gray-(?:[1-3])`

### 禁止原因
- `shadow-md`: Minimalist Flat uses zero shadows - flat design only
- `bg-gradient-to-r`: Minimalist Flat uses solid pure colors, no gradients
- `rounded-lg`: Minimalist Flat uses consistent corners: all rounded-none or all rounded-full
- `bg-gray-100`: Minimalist Flat uses pure black/white, not grays for backgrounds
- `backdrop-blur`: Minimalist Flat avoids glass/blur effects - pure flat surfaces only

> WARNING: 如果你的代码中包含以上任何 class，必须立即替换。

---

## [REQUIRED] 必须包含

### 按钮必须包含
```
border-2 border-black
font-medium
hover:bg-black hover:text-white
transition-colors duration-200
```

### 卡片必须包含
```
border-2 border-black
hover:bg-black hover:text-white
transition-colors duration-200
```

### 输入框必须包含
```
border-0 border-b-2 border-black
bg-transparent
focus:outline-none
focus:border-[#ff3366]
transition-colors duration-200
```

---

## [COMPARE] Minimalist Flat 错误 vs 正确对比

以下错误示例只代表“未经过当前风格适配的通用默认值”，不要把错误示例当成视觉建议。

### 按钮

[WRONG] **错误示例**（通用组件库默认样式，不要直接复制）：
```html
<button class="{GENERIC_LIBRARY_BUTTON_DEFAULT}">
  点击我
</button>
```

[CORRECT] **正确示例**（使用当前风格的 token）：
```html
<button class="border-2 border-black font-medium hover:bg-black hover:text-white transition-colors duration-200 bg-black text-white border-2 border-black">
  点击我
</button>
```

### 卡片

[WRONG] **错误示例**（未经当前风格适配的通用卡片）：
```html
<div class="{GENERIC_LIBRARY_CARD_DEFAULT}">
  <h3>{TITLE}</h3>
</div>
```

[CORRECT] **正确示例**（使用当前风格的 card token）：
```html
<div class="border-2 border-black hover:bg-black hover:text-white transition-colors duration-200 p-6 md:p-8">
  <h3 class="font-bold tracking-tight text-lg md:text-xl">{TITLE}</h3>
</div>
```

### 输入框

[WRONG] **错误示例**（未经当前风格适配的通用输入框）：
```html
<input class="{GENERIC_LIBRARY_INPUT_DEFAULT}" />
```

[CORRECT] **正确示例**（使用当前风格的 input token）：
```html
<input class="border-0 border-b-2 border-black bg-transparent focus:outline-none focus:border-[#ff3366] transition-colors duration-200" placeholder="{PLACEHOLDER}" />
```

---

## [TEMPLATES] Minimalist Flat 页面骨架模板

以下骨架只使用当前风格的 token。替换 `{PLACEHOLDER}` 时，不要移除或替换这些 token：

### 导航栏骨架
```html
<nav class="bg-white text-black border-2 border-black px-4 md:px-8 lg:px-16">
  <div class="flex items-center justify-between max-w-6xl mx-auto gap-6 md:gap-8">
    <a href="/" class="font-bold tracking-tight text-lg md:text-xl">
      {LOGO_TEXT}
    </a>
    <div class="flex gap-6 md:gap-8 font-sans text-xs md:text-sm">
      {NAV_LINKS}
    </div>
  </div>
</nav>
```

### Hero 区块骨架
```html
<section class="bg-[#ff3366] text-black py-16 md:py-24 lg:py-32 px-4 md:px-8 lg:px-16">
  <div class="max-w-4xl mx-auto">
    <h1 class="font-bold tracking-tight text-4xl md:text-6xl lg:text-8xl">
      {HEADLINE}
    </h1>
    <p class="font-sans text-sm md:text-base max-w-xl">
      {SUBHEADLINE}
    </p>
    <button class="border-2 border-black font-medium hover:bg-black hover:text-white transition-colors duration-200 bg-black text-white border-2 border-black">
      {CTA_TEXT}
    </button>
  </div>
</section>
```

### 卡片网格骨架
```html
<section class="bg-white text-black py-16 md:py-24 lg:py-32 px-4 md:px-8 lg:px-16">
  <div class="max-w-6xl mx-auto">
    <h2 class="font-bold tracking-tight text-2xl md:text-3xl">{SECTION_TITLE}</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      <!-- Card template - repeat for each card -->
      <div class="border-2 border-black hover:bg-black hover:text-white transition-colors duration-200 p-6 md:p-8">
        <h3 class="font-bold tracking-tight text-lg md:text-xl">{CARD_TITLE}</h3>
        <p class="font-sans text-sm md:text-base text-gray-500">{CARD_DESCRIPTION}</p>
      </div>
    </div>
  </div>
</section>
```

### 表单输入骨架
```html
<input class="border-0 border-b-2 border-black bg-transparent focus:outline-none focus:border-[#ff3366] transition-colors duration-200" placeholder="{PLACEHOLDER}" />
```

### 页脚骨架
```html
<footer class="bg-black text-white py-16 md:py-24 lg:py-32 px-4 md:px-8 lg:px-16">
  <div class="max-w-6xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
      <div>
        <span class="font-bold tracking-tight text-lg md:text-xl">{LOGO_TEXT}</span>
        <p class="font-sans text-xs md:text-sm">{TAGLINE}</p>
      </div>
      <div>
        <h4 class="font-bold tracking-tight text-lg md:text-xl">{COLUMN_TITLE}</h4>
        <ul class="font-sans text-xs md:text-sm">
          {FOOTER_LINKS}
        </ul>
      </div>
    </div>
  </div>
</footer>
```

---

## [CHECKLIST] Minimalist Flat 生成后自检清单

**输出代码前，逐项验证当前风格的 token 和规则。如有违反，先修正再交付：**

### Token 检查
- [ ] 按钮包含： `border-2 border-black font-medium hover:bg-black hover:text-white transition-colors duration-200`
- [ ] 卡片包含： `border-2 border-black hover:bg-black hover:text-white transition-colors duration-200`
- [ ] 输入框包含： `border-0 border-b-2 border-black bg-transparent focus:outline-none focus:border-[#ff3366] transition-colors duration-200`

### 禁止项检查
- [ ] 没有使用 `shadow-sm`
- [ ] 没有使用 `shadow`
- [ ] 没有使用 `shadow-md`
- [ ] 没有使用 `shadow-lg`
- [ ] 没有使用 `shadow-xl`
- [ ] 没有使用 `shadow-2xl`
- [ ] 没有使用 `bg-gradient-to-r`
- [ ] 没有使用 `bg-gradient-to-b`

### 风格规则检查
- [ ] 使用纯色背景 bg-white, bg-black, bg-[accent]
- [ ] 边框使用 border-2 border-black 或无边框
- [ ] 圆角保持一致：全部 rounded-none 或全部 rounded-full
- [ ] 使用高对比度配色
- [ ] 大量使用留白 space-y-12 md:space-y-24

### 风格漂移检查
- [ ] 没有违反：禁止使用任何阴影 shadow-*
- [ ] 没有违反：禁止使用渐变 bg-gradient-*
- [ ] 没有违反：禁止使用透明度低于 0.5 的颜色
- [ ] 没有违反：禁止混用不同的圆角值
- [ ] 没有违反：禁止使用灰色文字（除非是有意为之）

### 通用交付检查
- [ ] 响应式布局在手机、平板和桌面下稳定，没有横向溢出
- [ ] 所有交互元素有清晰焦点、可访问名称和 reduced-motion 方案
- [ ] 文本对比度达到 WCAG AA，且没有用颜色单独传递状态
- [ ] 结果仍然能够一眼识别为 Minimalist Flat

---

## [EXAMPLES] 示例 Prompt

### 1. Portfolio

生成极简设计师作品集

```
Create a designer portfolio using Minimalist Flat style:
- Full-screen hero with name and title
- Grid of project cards with hover color inversion
- No shadows, no gradients
- Black and white with one accent color
- Large typography for headings
- Generous whitespace between sections
```

### 2. SaaS 着陆页

生成 极简扁平风风格的 SaaS 产品着陆页

```
Create a SaaS landing page using Minimalist Flat style with hero section, feature grid, testimonials, pricing table, and footer.
```

### 3. 作品集展示

生成 极简扁平风风格的作品集页面

```
Create a portfolio showcase page using Minimalist Flat style with project grid, about section, contact form, and consistent visual language.
```

## 绝对禁止（匹配即拒绝）

以下模式一旦出现，视为风格违规——不找借口，直接重写。

- 使用任何阴影 shadow-*
- 使用渐变 bg-gradient-*
- 使用透明度低于 0.5 的颜色
- 混用不同的圆角值
- 使用灰色文字（除非是有意为之）
- 使用图案背景

## 自检清单（交付前逐条确认）

如果任何一条不通过，说明风格漂移了——修改后再交付。

- [ ] 没有紫色到蓝色的渐变
- [ ] 没有使用 Inter / Roboto / Geist 等过度使用的字体
- [ ] 没有嵌套卡片（卡片里面套卡片）
- [ ] 没有在彩色背景上放灰色文字
- [ ] 正文对比度满足 WCAG AA（≥4.5:1）
- [ ] 没有 bounce / elastic 缓动曲线
- [ ] 动效有 prefers-reduced-motion 备选方案
- [ ] 正文行宽不超过 65-75 个字符
- [ ] 没有单侧粗边框装饰（border-left/right accent stripe）
- [ ] 没有渐变文字（background-clip: text）
- [ ] 没有把玻璃态（glassmorphism）当作默认风格
- [ ] 没有 tiny uppercase tracked eyebrow 放在每个 section 标题上面
- [ ] 禁止使用任何阴影 shadow-*
- [ ] 禁止使用渐变 bg-gradient-*
- [ ] 禁止使用透明度低于 0.5 的颜色
- [ ] 禁止混用不同的圆角值
- [ ] 禁止使用灰色文字（除非是有意为之）