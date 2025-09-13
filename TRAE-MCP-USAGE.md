# 在 Trae IDE 中使用 MCP 抽奖服务

## 🎯 当前状态

✅ **后端API服务**: 运行在 http://localhost:3001/api  
✅ **MCP抽奖服务器**: 通过stdio协议运行  
✅ **依赖包**: @modelcontextprotocol/sdk, node-fetch 已安装  
✅ **测试验证**: 6个MCP工具全部可用  

## 📋 配置步骤

### 1. 在 Trae IDE 中配置 MCP 服务器

将以下 JSON 配置粘贴到 Trae IDE 的 MCP 配置输入框中：

```json
{
  "mcpServers": {
    "lottery-mcp": {
      "command": "node",
      "args": ["d:\\VibeCoding_pgm\\vibedoge\\vibedoge\\mcp-lottery-server.cjs"],
      "cwd": "d:\\VibeCoding_pgm\\vibedoge\\vibedoge",
      "env": {
        "LOTTERY_API_URL": "http://localhost:3001/api/lottery",
        "NODE_ENV": "development"
      }
    }
  }
}
```

### 2. 可用的 MCP 工具

| 工具名称 | 描述 | 参数 |
|---------|------|------|
| `create_mcp_user` | 创建新的MCP用户 | 无 |
| `register_user` | 注册MCP用户到数据库 | mcpUserId (string) |
| `generate_lottery_id` | 生成抽奖ID | userId (string) |
| `draw_lottery` | 执行抽奖 | lotteryId (string), userId (string) |
| `get_user_lotteries` | 获取用户抽奖记录 | userId (string) |
| `get_global_stats` | 获取全局统计信息 | 无 |

### 3. 使用示例

在 Trae IDE 中，你可以这样使用 MCP 抽奖服务：

```
用户: 帮我创建一个新用户并进行抽奖

Trae AI: 我来帮你创建用户并进行抽奖操作。

1. 首先创建MCP用户
2. 注册用户到数据库
3. 生成抽奖ID
4. 执行抽奖
5. 查看抽奖结果
```

### 4. 故障排除

**如果MCP服务器无法连接：**
1. 确保后端API服务正在运行：`npm run dev:server`
2. 确保MCP服务器正在运行：`npm run mcp:lottery`
3. 检查路径配置是否正确
4. 运行测试：`node test-mcp-lottery.cjs`

**如果工具调用失败：**
1. 检查API服务器日志
2. 确认数据库连接正常
3. 验证环境变量配置

## 🔗 相关文件

- `mcp-lottery-server.cjs` - MCP服务器实现
- `mcp-config.json` - MCP配置文件
- `test-mcp-lottery.cjs` - 测试脚本
- `MCP-LOTTERY-README.md` - 详细文档
- `server.cjs` - 后端API服务器

## 📞 支持

如果遇到问题，请检查：
1. 终端日志输出
2. API服务器状态
3. MCP服务器状态
4. 网络连接