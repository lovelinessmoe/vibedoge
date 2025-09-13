# VibeDoge MCP 抽奖服务

这是一个基于 Model Context Protocol (MCP) 的抽奖服务，允许您通过 MCP 客户端（如 Claude Desktop、Trae AI 等）直接调用抽奖功能。

## 🚀 快速开始

### 1. 安装依赖 ✅ 已完成

```bash
# 安装 MCP 相关依赖
npm run mcp:install

# 或者手动安装
npm install @modelcontextprotocol/sdk node-fetch
```

### 2. 启动后端API服务 ✅ 正在运行

```bash
# 启动 VibeDoge 后端 API 服务
npm run dev:server
# 服务运行在: http://localhost:3001/api
```

### 3. 启动MCP抽奖服务 ✅ 正在运行

```bash
# 在新的终端窗口中启动 MCP 服务器
npm run mcp:lottery
# MCP服务器通过stdio协议运行
```

### 4. 测试MCP服务 ✅ 测试通过

```bash
node test-mcp-lottery.cjs
```

**测试结果：**
- ✅ MCP服务器正常启动
- ✅ 6个工具全部可用：create_mcp_user, register_user, generate_lottery_id, draw_lottery, get_user_lotteries, get_global_stats
- ✅ JSON-RPC 2.0 协议通信正常

## 🔧 配置 MCP 客户端

### 方法一：使用配置文件（推荐）

将 `mcp-config.json` 文件的内容复制到您的 MCP 客户端配置中：

```json
{
  "mcpServers": {
    "vibedoge-lottery": {
      "command": "node",
      "args": ["d:\\VibeCoding_pgm\\vibedoge\\vibedoge\\mcp-lottery-server.js"],
      "cwd": "d:\\VibeCoding_pgm\\vibedoge\\vibedoge",
      "env": {
        "LOTTERY_API_URL": "http://localhost:3001/api"
      }
    }
  }
}
```

### 方法二：使用 NPX（适用于 Trae AI）

```json
{
  "mcpServers": {
    "vibedoge-lottery": {
      "command": "node",
      "args": [
        "d:\\VibeCoding_pgm\\vibedoge\\vibedoge\\mcp-lottery-server.cjs"
      ],
      "cwd": "d:\\VibeCoding_pgm\\vibedoge\\vibedoge",
      "env": {
        "LOTTERY_API_URL": "http://localhost:3001/api/lottery",
        "NODE_ENV": "development"
      }
    }
  }
}
```

## 🎯 可用的 MCP 工具

### 1. `create_mcp_user`
创建新的 MCP 用户

**参数：** 无

**示例：**
```
请帮我创建一个新的 MCP 用户
```

### 2. `register_user`
将 MCP 用户注册到数据库

**参数：**
- `mcpUserId` (string): MCP 用户 ID

**示例：**
```
请帮我注册用户 mcp_1704067200000_abc123def456
```

### 3. `generate_lottery_id`
生成抽奖 ID

**参数：**
- `userId` (string): 用户 ID

**示例：**
```
请为用户 mcp_1704067200000_abc123def456 生成一个抽奖 ID
```

### 4. `draw_lottery`
执行抽奖

**参数：**
- `lotteryId` (string): 抽奖 ID
- `userId` (string): 用户 ID

**示例：**
```
请使用抽奖 ID lottery_1704067200000_xyz789 为用户 mcp_1704067200000_abc123def456 进行抽奖
```

### 5. `get_user_lotteries`
获取用户抽奖记录

**参数：**
- `userId` (string): 用户 ID

**示例：**
```
请查看用户 mcp_1704067200000_abc123def456 的抽奖记录
```

### 6. `get_global_stats`
获取全局统计信息

**参数：** 无

**示例：**
```
请显示 VibeDoge 抽奖的全局统计信息
```

## 📝 完整使用流程

1. **创建 MCP 用户**
   ```
   请帮我创建一个新的 MCP 用户
   ```

2. **注册用户到数据库**
   ```
   请帮我注册用户 [从步骤1获得的用户ID]
   ```

3. **生成抽奖 ID**
   ```
   请为用户 [用户ID] 生成一个抽奖 ID
   ```

4. **执行抽奖**
   ```
   请使用抽奖 ID [抽奖ID] 为用户 [用户ID] 进行抽奖
   ```

5. **查看结果**
   ```
   请查看用户 [用户ID] 的抽奖记录
   ```

## 🛠️ 故障排除

### 问题：MCP 服务器无法启动

**解决方案：**
1. 确保已安装所有依赖：`npm run mcp:install`
2. 检查 Node.js 版本（推荐 18+）
3. 确保后端 API 服务正在运行：`npm run dev:server`

### 问题：API 调用失败

**解决方案：**
1. 检查后端服务是否在 `http://localhost:3001` 运行
2. 检查防火墙设置
3. 查看 MCP 服务器日志输出

### 问题：抽奖失败

**解决方案：**
1. 确保用户已注册到数据库
2. 确保用户有剩余的抽奖次数
3. 检查抽奖 ID 是否有效

## 🔍 调试模式

启动 MCP 服务器时，可以看到详细的日志输出：

```bash
# 启动时会显示
VibeDoge Lottery MCP Server running on stdio
```

## 📚 相关文档

- [Model Context Protocol 官方文档](https://modelcontextprotocol.io/)
- [VibeDoge 项目文档](./VibeDoge-Complete-Documentation.md)
- [API 文档](./docs/comprehensive-api-docs.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个 MCP 服务！

## 📄 许可证

MIT License