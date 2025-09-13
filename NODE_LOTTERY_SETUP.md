# Node.js 抽奖系统配置指南

## 前置要求
- Node.js 16+ 已安装
- 可访问互联网

## 快速开始

### 1. 测试连接
```bash
# 进入项目目录
cd /mnt/d/VibeCoding_pgm/vibedoge/vibedoge

# 运行快速测试
node quick-test.js
```

### 2. 使用交互式CLI
```bash
# 启动交互式抽奖工具
node lottery-cli.js
```

### 3. 使用API客户端库
```bash
# 运行完整演示
node web-lottery-client.js
```

## 工具说明

### quick-test.js
**用途：** 快速测试API连接和基本功能
**特点：** 无需交互，自动完成测试流程

### lottery-cli.js
**用途：** 交互式命令行抽奖工具
**功能：**
- 创建用户
- 执行抽奖
- 查看个人记录
- 查看全局统计

### web-lottery-client.js
**用途：** 完整的API客户端库
**功能：**
- 可在代码中导入使用
- 提供所有API接口的封装
- 包含错误处理和重试机制

## 代码示例

### 在其他项目中使用
```javascript
// 导入客户端
const LotteryWebClient = require('./web-lottery-client');

// 创建客户端实例
const client = new LotteryWebClient();

// 创建用户
const user = await client.generateUserId('your_mcp_user_id');

// 抽奖
const prize = await client.draw(lotteryId, user.userId);
```

## API端点
- **基础URL**: `https://traevibedoge2vroc-13141305408-3707-chenxings-projects-b7dbfe13.vercel.app/api/lottery`
- **创建用户**: `POST /generate-user-id`
- **生成抽奖ID**: `POST /generate-lottery-id`
- **执行抽奖**: `POST /draw`
- **获取用户记录**: `GET /user/:userId`
- **获取统计**: `GET /stats`

## 注意事项
1. 所有工具都使用HTTPS连接
2. 无需安装额外依赖
3. 纯网络访问，无需本地服务器
4. 支持跨平台使用（Windows/Linux/macOS）

## 故障排除
- 检查网络连接
- 确认Node.js版本（16+）
- 检查防火墙设置