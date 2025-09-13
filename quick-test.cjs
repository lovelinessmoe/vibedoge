#!/usr/bin/env node

const https = require('https');

async function quickTest() {
  const baseUrl = 'https://traevibedoge2vroc-13141305408-3707-chenxings-projects-b7dbfe13.vercel.app/api/lottery';
  
  // 创建MCP用户ID
  const mcpUserId = `mcp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  
  console.log('=== 快速测试 VibeDoge 抽奖系统 ===\n');
  console.log(`🎯 测试用户: ${mcpUserId}\n`);
  
  // 1. 创建用户
  console.log('1️⃣ 创建用户...');
  await makeRequest(`${baseUrl}/generate-user-id`, 'POST', { mcpUserId });
  
  // 2. 获取统计信息
  console.log('\n2️⃣ 获取统计信息...');
  await makeRequest(`${baseUrl}/stats`, 'GET');
  
  // 3. 创建抽奖ID
  console.log('\n3️⃣ 生成抽奖ID...');
  await makeRequest(`${baseUrl}/generate-lottery-id`, 'POST', { userId: mcpUserId });
  
  console.log('\n✅ 测试完成！');
}

function makeRequest(url, method, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : require('http');
    
    const reqOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'QuickTest/1.0'
      }
    };

    const req = client.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log(`📥 响应: ${JSON.stringify(result, null, 2)}`);
          resolve(result);
        } catch (e) {
          console.log(`📥 原始响应: ${data}`);
          resolve(data);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ 请求失败: ${error.message}`);
      reject(error);
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

// 运行测试
quickTest().catch(console.error);