#!/usr/bin/env node

const http = require('http');

class LocalLotteryClient {
  constructor() {
    this.baseUrl = 'http://localhost:3001/api/lottery';
  }

  async request(endpoint, options = {}) {
    const url = this.baseUrl + endpoint;
    
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      
      const reqOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || 3001,
        path: urlObj.pathname,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LocalLotteryClient/1.0',
          ...options.headers
        }
      };

      const req = http.request(reqOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (e) {
            reject(new Error(`Invalid JSON response: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        console.log(`❌ 本地服务器连接失败: ${error.message}`);
        console.log(`💡 请确保本地服务器正在运行: pnpm dev:server`);
        reject(error);
      });
      
      if (options.body) {
        req.write(JSON.stringify(options.body));
      }
      
      req.end();
    });
  }

  async generateUserId(mcpUserId) {
    const result = await this.request('/generate-user-id', {
      method: 'POST',
      body: { mcpUserId }
    });
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || '生成用户ID失败');
    }
  }

  async generateLotteryId(userId) {
    const result = await this.request('/generate-lottery-id', {
      method: 'POST',
      body: { userId }
    });
    
    if (result.success) {
      return result.data.lotteryId;
    } else {
      throw new Error(result.message || '生成抽奖ID失败');
    }
  }

  async draw(lotteryId, userId) {
    const result = await this.request('/draw', {
      method: 'POST',
      body: { lotteryId, userId }
    });
    
    if (result.success) {
      return result.data.prize;
    } else {
      throw new Error(result.message || '抽奖失败');
    }
  }

  async getUserLotteries(userId) {
    const result = await this.request(`/user/${userId}`);
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || '获取抽奖记录失败');
    }
  }

  async getStats() {
    const result = await this.request('/stats');
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || '获取统计信息失败');
    }
  }
}

async function localTest() {
  console.log('=== 本地抽奖系统测试 ===\n');
  console.log('💡 请确保本地服务器正在运行: pnpm dev:server\n');
  
  const client = new LocalLotteryClient();
  
  try {
    // 1. 创建MCP用户
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const mcpUserId = `mcp_${timestamp}_${random}`;
    
    console.log(`🎯 创建MCP用户: ${mcpUserId}`);
    const user = await client.generateUserId(mcpUserId);
    console.log(`✅ 用户创建成功: ${user.username} (剩余抽奖: ${user.remainingDraws}次)\n`);
    
    // 2. 生成抽奖ID
    console.log('🎲 生成抽奖ID...');
    const lotteryId = await client.generateLotteryId(user.userId);
    console.log(`✅ 抽奖ID: ${lotteryId}\n`);
    
    // 3. 执行抽奖
    console.log('🎉 执行抽奖...');
    const prize = await client.draw(lotteryId, user.userId);
    console.log(`🏆 恭喜获得: ${prize.name} (${prize.value})\n`);
    
    // 4. 获取用户记录
    console.log('📊 获取用户抽奖记录...');
    const records = await client.getUserLotteries(user.userId);
    console.log(`📈 总抽奖次数: ${records.length}\n`);
    
    // 5. 获取全局统计
    console.log('📈 获取全局统计...');
    const stats = await client.getStats();
    console.log(`👥 总用户数: ${stats.totalUsers}`);
    console.log(`🎲 总抽奖次数: ${stats.totalLotteries}`);
    console.log(`🏆 总中奖次数: ${stats.totalWins}`);
    
    console.log('\n✅ 本地测试完成！');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

// 导出类供其他模块使用
module.exports = LocalLotteryClient;

// 如果直接运行此脚本，执行示例
if (require.main === module) {
  localTest();
}