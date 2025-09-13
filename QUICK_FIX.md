# 快速修复指南

## 🚨 问题
错误：`Could not find the table 'public.topics_with_stats'`

## ✅ 解决方案

### 已自动修复
代码已经修改为不依赖数据库视图，现在直接查询基础表并实时计算统计数据。

### 需要确保的数据库表
确保以下表已创建（执行 `database/migration-add-topic-features.sql`）：

1. ✅ `topics` - 话题表（需要有 `created_by` 字段）
2. ✅ `topic_messages` - 话题留言表
3. ✅ `topic_message_likes` - 话题留言点赞表

### 检查方法
在 Supabase Dashboard → Table Editor 中确认这些表存在。

## 🔧 如果表不存在

### 方法1：执行迁移脚本
在 Supabase SQL Editor 中执行：
```sql
-- 复制并执行 database/migration-add-topic-features.sql 的内容
```

### 方法2：手动创建缺失的字段
如果只是缺少 `created_by` 字段：
```sql
ALTER TABLE topics ADD COLUMN IF NOT EXISTS created_by VARCHAR(100) NOT NULL DEFAULT '系统管理员';
```

## 🚀 测试
1. 重启项目：`pnpm dev:full`
2. 访问首页，查看 Vibe 创意流
3. 访问社区页面，测试话题功能

## 📊 当前实现
- ✅ 实时计算统计数据（不依赖视图）
- ✅ 错误处理和回退机制
- ✅ 兼容不完整的数据库结构
- ✅ 优雅降级（如果统计计算失败，使用数据库中的值）

现在系统应该可以正常工作，即使数据库结构不完整！🎉