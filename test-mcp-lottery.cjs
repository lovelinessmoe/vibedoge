// 测试MCP抽奖服务的简单脚本
const { spawn } = require('child_process');

// 启动MCP服务器进程
const mcpProcess = spawn('node', ['mcp-lottery-server.cjs'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

console.log('🎲 启动MCP抽奖服务器测试...');

// 测试请求
const testRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
};

// 发送测试请求
mcpProcess.stdin.write(JSON.stringify(testRequest) + '\n');

// 监听响应
mcpProcess.stdout.on('data', (data) => {
  const response = data.toString().trim();
  console.log('📨 MCP服务器响应:', response);
  
  try {
    const parsed = JSON.parse(response);
    if (parsed.result && parsed.result.tools) {
      console.log('✅ MCP抽奖服务器正常运行!');
      console.log('🛠️  可用工具:', parsed.result.tools.map(t => t.name).join(', '));
    }
  } catch (e) {
    console.log('⚠️  解析响应时出错:', e.message);
  }
  
  // 关闭进程
  mcpProcess.kill();
});

mcpProcess.stderr.on('data', (data) => {
  console.error('❌ 错误:', data.toString());
});

mcpProcess.on('close', (code) => {
  console.log(`🔚 MCP服务器进程结束，退出码: ${code}`);
});

// 5秒后自动关闭
setTimeout(() => {
  console.log('⏰ 测试超时，关闭进程');
  mcpProcess.kill();
}, 5000);