# ALink - 现代化响应式网页聚合与分类导航平台

基于 **Vue 3 + Vite + TypeScript + Tailwind CSS + Pinia** 构建的高性能、自适应、多用户网页聚合导航系统，后端依托 **Supabase (`p2p-drop`)** 进行云端数据持久化和行级安全（Row Level Security, RLS）隔离。

---

## ✨ 核心特性

- 📱 **全终端响应式适配**
  - **PC 宽屏端**：左侧分类折叠侧边栏 + 分类徽标与网址计数 + 悬浮快捷菜单 + 响应式网格流（1~5列平滑伸缩）。
  - **移动手机端**：吸顶横向单手滑动分类胶囊条 + 抽屉式侧边栏菜单 + 底部浮动添加按钮（FAB）。
- 📂 **分类与网址双重全生命周期管理**
  - **分类管理**：支持自定义名称、图标预设（内置常用图标集与 Emoji 任意选择）、排序序号。
  - **安全级联删除保护**：删除分类时二次确认，可选择“将网址安全转移至未分类”或“连同分类下网址彻底删除”。
  - **网址管理**：支持名称、URL、描述/备注、自定义图标、所属分类及排序序号。
- 🪄 **智能 Favicon 与标题提取**
  - 输入 URL 时自动利用高分辨率 Favicon 服务与域名解析提取图标和建议标题。
  - 支持首字母文字徽标兜底，绝无图片破损占位。
- 🔢 **表单序号与按钮快速排序**
  - 卡片与列表中提供直观的“向前移动 / 向后移动”一键置换次序。
  - 编辑弹窗中可直接指定排序数字。
  - 提供统一的**排序管理中心**，支持分类与网址的集中数值微调与快速重置连续序号。
- 🔍 **全局即时搜索**
  - 顶部搜索框支持根据网站名称、网址域名、描述备注实时模糊过滤。
- 🌓 **亮色 / 暗黑双主题**
  - 支持 System 跟随与用户手动一键切换，持久化至 LocalStorage，防白屏闪烁（Zero-FOUC）。
- 🔐 **多用户安全鉴权与开箱即用体验**
  - 基于 Supabase Auth 邮箱注册/登录，配合 PostgreSQL RLS 策略物理隔离不同用户的数据。
  - **新用户自动预置种子数据**：注册首次登录自动填充精选常用导航（搜索、AI 工具、开发社区、设计效率）。
  - **免登录访客体验模式**：无需注册即可本地体验全套增删改查与排序功能。

---

## 🛠️ 技术栈

| 层次 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **前端框架** | Vue 3 (`<script setup lang="ts">`) | 响应式 Composition API |
| **构建工具** | Vite 8 + TypeScript | 秒级热重载与快速构建 |
| **样式库** | Tailwind CSS v3 + Autoprefixer | 现代化原子化样式与暗黑模式 |
| **状态管理** | Pinia | 模块化 Store (`auth`, `nav`, `theme`) |
| **图标集** | `@lucide/vue` | 极简矢量图标，按需 Tree-shaking 优化 |
| **后端/数据库** | Supabase (`p2p-drop`) | PostgreSQL + Auth + Row Level Security |

---

## 🚀 快速启动

### 1. 依赖安装
```bash
npm install
# 或在 Windows PowerShell 下:
npm.cmd install
```

### 2. 环境变量配置
项目已预先配置好 `.env` 文件，指向 Supabase `p2p-drop` 数据库：
```env
VITE_SUPABASE_URL=https://angslcexviasghvjbcqe.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. 启动开发服务器
```bash
npm.cmd run dev
```
启动后访问：[http://127.0.0.1:5173/](http://127.0.0.1:5173/)

### 4. 生产打包构建
```bash
npm.cmd run build
```
构建产物输出至 `dist/` 目录，可直接部署至 Vercel、Cloudflare Pages、GitHub Pages 或 Nginx 服务器。

---

## 🗄️ 数据库表结构说明 (Supabase)

### `public.categories` (分类表)
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | `uuid` | 主键 (默认 `gen_random_uuid()`) |
| `user_id` | `uuid` | 关联 `auth.users(id)`，启用级联删除 |
| `name` | `text` | 分类名称 |
| `icon` | `text` | 图标名称或 Emoji |
| `order_index` | `integer` | 排序序号（越小越靠前） |
| `created_at` / `updated_at` | `timestamptz` | 时间戳 |

### `public.websites` (网址表)
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | `uuid` | 主键 (默认 `gen_random_uuid()`) |
| `user_id` | `uuid` | 关联 `auth.users(id)`，启用级联删除 |
| `category_id` | `uuid` | 关联 `categories(id)`，允许为 NULL（未分类） |
| `title` | `text` | 网站标题 |
| `url` | `text` | 目标网址链接 |
| `description` | `text` | 描述或备注 |
| `icon_url` | `text` | 自定义图标或自动 Favicon 链接 |
| `order_index` | `integer` | 排序序号 |
| `created_at` / `updated_at` | `timestamptz` | 时间戳 |

两张表均开启了 PostgreSQL **Row Level Security (RLS)**，仅允许当前认证用户读取与修改属于自己的记录。
