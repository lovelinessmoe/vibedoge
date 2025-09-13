# 实时功能故障排除指南

## 🚨 问题：Vibe 创意流不是实时的

### 可能的原因和解决方案

## 1. 检查 Supabase 实时功能是否启用

### 问题
Supabase 默认不为所有表启用实时功能。

### 解决方案
在 Supabase SQL Editor 中执行：
```sql
-- 执行 database/enable-realtime.sql 中的所有语句
```

### 验证方法
```sql
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```
应该看到 `messages`, `topics`, `topic_messages` 等表。

## 2. 检查浏览器控制台日志

### 查看订阅状态
打开浏览器开发者工具，查看控制台输出：

**正常情况应该看到：**
```
🔗 设置留言实时订阅...
📡 留言订阅状态: SUBSCRIBED
🔗 设置话题实时订阅...
📡 话题订阅状态: SUBSCRIBED
✅ 首页实时订阅已设置
```

**异常情况可能看到：**
```
📡 留言订阅状态: CHANNEL_ERROR
📡 话题订阅状态: TIMED_OUT
```

### 查看实时事件
当有新留言或话题时，应该看到：
```
📨 收到留言变化事件: {eventType: "INSERT", new: {...}}
🔥 首页留言实时更新: {...}
📝 新留言插入: {...}
📝 首页留言列表更新: 8 条留言
```

## 3. 检查网络连接

### WebSocket 连接
Supabase 实时功能依赖 WebSocket 连接。

**检查方法：**
1. 打开浏览器开发者工具
2. 进入 Network 标签
3. 筛选 WS (WebSocket)
4. 应该看到到 Supabase 的 WebSocket 连接

### 防火墙/代理问题
某些网络环境可能阻止 WebSocket 连接。

## 4. 检查 Supabase 配置

### 环境变量
确认 `.env.local` 中的配置正确：
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (anon public key)
```

### API Key 权限
确认使用的是 `anon public` key，不是 `service_role` key。

## 5. 测试实时功能

### 手动测试
1. 打开两个浏览器窗口
2. 一个窗口打开首页
3. 另一个窗口打开社区页面
4. 在社区页面发表留言
5. 观察首页是否实时更新

### 数据库直接测试
在 Supabase SQL Editor 中直接插入数据：
```sql
INSERT INTO messages (username, content) 
VALUES ('测试用户', '这是一条测试留言');
```
观察前端是否收到实时更新。

## 6. 常见错误和解决方案

### 错误：CHANNEL_ERROR
**原因：** 表未启用实时功能
**解决：** 执行 `database/enable-realtime.sql`

### 错误：TIMED_OUT
**原因：** 网络连接问题
**解决：** 检查网络，重新加载页面

### 错误：SUBSCRIPTION_ERROR
**原因：** 权限问题或表不存在
**解决：** 检查 RLS 策略和表结构

### 错误：无任何日志输出
**原因：** JavaScript 错误或订阅未设置
**解决：** 检查浏览器控制台错误

## 7. 调试步骤

### 步骤 1：检查基础配置
```bash
# 重启项目
pnpm dev:full
```

### 步骤 2：检查数据库
```sql
-- 在 Supabase SQL Editor 中
SELECT * FROM messages ORDER BY timestamp DESC LIMIT 5;
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

### 步骤 3：检查前端连接
1. 打开首页
2. 查看右上角实时状态指示器
3. 应该显示"实时连接"

### 步骤 4：测试实时更新
1. 在社区页面发表留言
2. 观察首页是否更新
3. 查看控制台日志

## 8. 临时解决方案

如果实时功能暂时无法工作，可以：

### 定时刷新
```typescript
// 在 HomePage.tsx 中添加
useEffect(() => {
  const interval = setInterval(() => {
    loadData(); // 重新加载数据
  }, 30000); // 每30秒刷新一次

  return () => clearInterval(interval);
}, []);
```

### 手动刷新按钮
在页面添加刷新按钮，让用户手动更新数据。

## 9. 联系支持

如果以上步骤都无法解决问题：

1. 收集浏览器控制台日志
2. 检查 Supabase 项目设置
3. 确认数据库表结构正确
4. 验证网络连接正常

## 🎯 预期结果

正确配置后，你应该看到：
- ✅ 实时状态指示器显示"实时连接"
- ✅ 在社区发表留言后，首页立即显示新留言
- ✅ 控制台显示实时事件日志
- ✅ 多个浏览器窗口之间数据同步

现在按照这个指南逐步排查，应该能解决实时更新问题！🚀