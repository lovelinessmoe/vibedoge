# Supabase 快速配置指南

## 🚀 快速开始

### 1. 获取 Supabase 配置

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目 (或创建新项目)
3. 进入 **Settings** → **API**
4. 复制以下信息：

```
Project URL: https://xxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **重要**: 使用 `anon public` key，不是 `service_role` key!

### 2. 更新环境变量

编辑 `.env.local` 文件：

```env
VITE_API_URL=http://localhost:3001

# Supabase 配置
VITE_SUPABASE_URL=https://你的项目ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. 创建数据库表

在 Supabase Dashboard 中：

1. 进入 **SQL Editor**
2. 创建新查询
3. 复制并执行 `database/schema.sql` 中的所有 SQL 语句

### 4. 启动项目

```bash
pnpm dev:full
```

## 🔧 故障排除

### 错误: "Forbidden use of secret API key in browser"

**原因**: 使用了 `service_role` key 而不是 `anon public` key

**解决**: 
1. 检查你的 API key 是否以 `eyJ` 开头
2. 如果以 `sb_secret_` 开头，那就是错误的密钥
3. 重新复制 `anon public` key

### 错误: "Invalid supabaseUrl"

**原因**: URL 格式不正确或未配置

**解决**:
1. 确保 URL 格式为: `https://xxx.supabase.co`
2. 检查 `.env.local` 文件是否正确配置

### 错误: "Missing Supabase environment variables"

**原因**: 环境变量未配置或配置错误

**解决**:
1. 检查 `.env.local` 文件是否存在
2. 确保变量名正确: `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
3. 重启开发服务器

## 📋 检查配置

运行配置检查工具：

```bash
node check-supabase-config.js
```

## 🎯 当前功能

- ✅ **社区留言**: 发布、查看、点赞 (使用 Supabase)
- ✅ **话题讨论**: 浏览和创建话题 (使用 Supabase)
- ✅ **抽奖功能**: 继续使用原 Express API

## 📚 相关文档

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript)
- [项目数据库表结构](database/schema.sql)