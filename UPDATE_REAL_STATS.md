# 真实统计数据更新指南

## 🎯 目标
让话题的留言数和参与者数显示真实的数据库统计数字，而不是静态数据。

## 📋 需要执行的 SQL 脚本

### 1. 基础表结构（如果还没执行）
```sql
-- 执行 database/migration-add-topic-features.sql
```

### 2. 统计函数和触发器（新增）
```sql
-- 执行 database/functions.sql
```

## 🔧 实现的功能

### ✅ 自动统计更新
- **留言数**：实时统计每个话题的留言数量
- **参与者数**：实时统计每个话题的唯一参与者数量
- **触发器**：当留言增删改时自动更新统计数据

### ✅ 优化查询性能
- **数据库视图**：`topics_with_stats` 提供预计算的统计数据
- **数据库函数**：`update_topic_stats()` 高效更新统计
- **自动触发器**：无需手动维护统计数据

### ✅ 前端实时显示
- 话题列表显示真实的留言数和参与者数
- 话题详情页面实时更新统计数据
- 发送留言后自动刷新统计

## 🚀 执行步骤

### 1. 更新数据库
在 Supabase SQL Editor 中依次执行：

1. `database/migration-add-topic-features.sql`（如果还没执行）
2. `database/functions.sql`（新增的统计功能）

### 2. 重启项目
```bash
pnpm dev:full
```

### 3. 测试功能
1. 访问社区页面 → 话题讨论
2. 创建新话题
3. 在话题中发表留言
4. 观察留言数和参与者数的实时变化

## 📊 数据库结构

### 新增的数据库对象：

1. **函数**：
   - `update_topic_stats(topic_uuid)` - 更新话题统计
   - `trigger_update_topic_stats()` - 触发器函数

2. **触发器**：
   - `topic_messages_stats_trigger` - 自动更新统计

3. **视图**：
   - `topics_with_stats` - 带实时统计的话题视图

## 🔍 验证结果

执行成功后，你应该看到：

1. **话题列表**：显示真实的留言数（从0开始）
2. **参与者数**：显示真实的唯一参与者数量
3. **实时更新**：发送留言后数字立即更新
4. **性能优化**：查询速度快，无需复杂计算

## 📈 统计逻辑

- **留言数** = `COUNT(*)` from `topic_messages` where `topic_id = ?`
- **参与者数** = `COUNT(DISTINCT username)` from `topic_messages` where `topic_id = ?`
- **自动更新** = 每次留言增删改时触发统计更新

现在话题的统计数据完全基于真实的数据库数据！🎉