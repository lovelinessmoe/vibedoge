# Supabase 配置指南 - 社区留言功能

## 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并注册账号
2. 创建新项目
3. 等待项目初始化完成

## 2. 获取项目配置

在 Supabase 项目仪表板中：

1. 点击左侧菜单的 "Settings" → "API"
2. 复制以下信息：
   - `Project URL`
   - `anon public` key

## 3. 配置环境变量

在项目根目录的 `.env.local` 文件中添加：

```env
# Supabase 配置
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

将 `your_supabase_project_url` 和 `your_supabase_anon_key` 替换为实际的值。

## 4. 执行数据库迁移

1. 在 Supabase 项目仪表板中，点击左侧菜单的 "SQL Editor"
2. 创建新查询
3. 复制 `database/schema.sql` 文件中的所有 SQL 语句
4. 粘贴到 SQL Editor 中并执行

## 5. 验证配置

执行 SQL 后，你应该能在 "Table Editor" 中看到以下表：

- `messages` - 社区留言
- `topics` - 话题讨论
- `message_likes` - 留言点赞记录

## 6. 安装依赖

```bash
npm install
# 或
pnpm install
```

## 7. 启动项目

```bash
npm run dev
# 或
pnpm dev
```

## 功能说明

### 已集成 Supabase 的功能
- ✅ **社区留言** - 发布、查看、点赞留言
- ✅ **话题讨论** - 浏览和创建话题
- ✅ **实时数据** - 所有留言数据存储在 Supabase

### 继续使用原 API 的功能
- 🔄 **抽奖功能** - 继续使用 Express API (`/api/lottery`)

## 数据库表结构说明

### messages 表
存储社区留言数据，包含用户名、内容、时间戳、点赞数等。

### topics 表
存储话题讨论数据，包含标题、描述、参与人数等。

### message_likes 表
存储留言点赞关系，防止重复点赞。

## 安全策略

当前配置使用了基本的 RLS（行级安全）策略，允许所有操作。在生产环境中，你应该：

1. 实现用户认证
2. 配置更严格的 RLS 策略
3. 限制匿名用户的操作权限

## 故障排除

### 连接问题
- 检查环境变量是否正确配置
- 确认 Supabase 项目 URL 和 API Key 是否有效

### 权限问题
- 确认 RLS 策略已正确配置
- 检查表的权限设置

### 数据问题
- 确认所有表都已创建
- 检查初始数据是否已插入

## 混合架构说明

当前项目采用混合架构：

- **社区功能** → Supabase 数据库
- **抽奖功能** → Express API 服务器

这样的设计让你可以：
1. 体验 Supabase 的实时数据库功能
2. 保持抽奖 API 的现有实现
3. 逐步迁移其他功能到 Supabase（如需要）