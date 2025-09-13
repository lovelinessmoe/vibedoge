#!/usr/bin/env node

/**
 * VibeDoge 抽奖 MCP 服务器
 * 提供抽奖相关的 MCP 工具和功能
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} = require('@modelcontextprotocol/sdk/types.js');
const fetch = require('node-fetch');

class LotteryMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'vibedoge-lottery-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.apiBaseUrl = process.env.LOTTERY_API_URL || 'http://localhost:3001/api';
    this.fetch = fetch; // 绑定fetch到实例
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_mcp_user',
            description: '创建新的MCP用户',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
          {
            name: 'register_user',
            description: '注册MCP用户到数据库',
            inputSchema: {
              type: 'object',
              properties: {
                mcpUserId: {
                  type: 'string',
                  description: 'MCP用户ID',
                },
              },
              required: ['mcpUserId'],
            },
          },
          {
            name: 'generate_lottery_id',
            description: '生成抽奖ID',
            inputSchema: {
              type: 'object',
              properties: {
                userId: {
                  type: 'string',
                  description: '用户ID',
                },
              },
              required: ['userId'],
            },
          },
          {
            name: 'draw_lottery',
            description: '执行抽奖',
            inputSchema: {
              type: 'object',
              properties: {
                lotteryId: {
                  type: 'string',
                  description: '抽奖ID',
                },
                userId: {
                  type: 'string',
                  description: '用户ID',
                },
              },
              required: ['lotteryId', 'userId'],
            },
          },
          {
            name: 'get_user_lotteries',
            description: '获取用户抽奖记录',
            inputSchema: {
              type: 'object',
              properties: {
                userId: {
                  type: 'string',
                  description: '用户ID',
                },
              },
              required: ['userId'],
            },
          },
          {
            name: 'get_global_stats',
            description: '获取全局统计信息',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
        ],
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_mcp_user':
            return await this.createMCPUser();
          
          case 'register_user':
            return await this.registerUser(args.mcpUserId);
          
          case 'generate_lottery_id':
            return await this.generateLotteryId(args.userId);
          
          case 'draw_lottery':
            return await this.drawLottery(args.lotteryId, args.userId);
          
          case 'get_user_lotteries':
            return await this.getUserLotteries(args.userId);
          
          case 'get_global_stats':
            return await this.getGlobalStats();
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${name}: ${error.message}`
        );
      }
    });
  }

  // 创建MCP用户
  async createMCPUser() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const userId = `mcp_${timestamp}_${random}`;
    const sessionToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const user = {
      id: userId,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      sessionToken,
      remainingDraws: 0,
      isRegistered: false
    };

    return {
      content: [
        {
          type: 'text',
          text: `MCP用户创建成功！\n用户ID: ${user.id}\n创建时间: ${user.createdAt}\n会话令牌: ${user.sessionToken}\n\n请保存此信息，并使用 register_user 工具注册到数据库以获得抽奖机会。`,
        },
      ],
      user,
    };
  }

  // 注册用户到数据库
  async registerUser(mcpUserId) {
    try {
      const response = await this.fetch(`${this.apiBaseUrl}/lottery/generate-user-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mcpUserId }),
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          content: [
            {
              type: 'text',
              text: `用户注册成功！\n数据库用户ID: ${result.data.databaseUserId}\n用户名: ${result.data.username}\n创建时间: ${result.data.createdAt}\n\n您已获得3次免费抽奖机会！`,
            },
          ],
          registrationData: result.data,
        };
      } else {
        throw new Error(result.message || '注册失败');
      }
    } catch (error) {
      throw new Error(`注册用户失败: ${error.message}`);
    }
  }

  // 生成抽奖ID
  async generateLotteryId(userId) {
    try {
      const response = await this.fetch(`${this.apiBaseUrl}/lottery/generate-lottery-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          content: [
            {
              type: 'text',
              text: `抽奖ID生成成功！\n抽奖ID: ${result.data.lotteryId}\n用户ID: ${userId}\n生成时间: ${new Date().toISOString()}\n\n请使用此抽奖ID进行抽奖。`,
            },
          ],
          lotteryId: result.data.lotteryId,
        };
      } else {
        throw new Error(result.message || '生成抽奖ID失败');
      }
    } catch (error) {
      throw new Error(`生成抽奖ID失败: ${error.message}`);
    }
  }

  // 执行抽奖
  async drawLottery(lotteryId, userId) {
    try {
      const response = await this.fetch(`${this.apiBaseUrl}/lottery/draw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lotteryId, userId }),
      });

      const result = await response.json();
      
      if (result.success) {
        const prize = result.data.prize;
        return {
          content: [
            {
              type: 'text',
              text: `🎉 抽奖成功！\n\n🏆 恭喜您获得: ${prize.name}\n💰 奖品价值: ${prize.value}\n📝 奖品描述: ${prize.description}\n🎯 中奖概率: ${prize.probability}%\n⏰ 抽奖时间: ${new Date().toISOString()}\n\n感谢您参与VibeDoge抽奖活动！`,
            },
          ],
          prize,
        };
      } else {
        throw new Error(result.message || '抽奖失败');
      }
    } catch (error) {
      throw new Error(`抽奖失败: ${error.message}`);
    }
  }

  // 获取用户抽奖记录
  async getUserLotteries(userId) {
    try {
      const response = await this.fetch(`${this.apiBaseUrl}/lottery/user/${userId}`);
      const result = await response.json();
      
      if (result.success) {
        const lotteries = result.data;
        const completedLotteries = lotteries.filter(l => l.status === 'completed');
        
        let text = `📊 用户抽奖记录\n\n`;
        text += `总抽奖次数: ${lotteries.length}\n`;
        text += `已完成抽奖: ${completedLotteries.length}\n\n`;
        
        if (completedLotteries.length > 0) {
          text += `🏆 中奖记录:\n`;
          completedLotteries.forEach((lottery, index) => {
            text += `${index + 1}. ${lottery.prize_name} (${lottery.prize_value}) - ${lottery.draw_time}\n`;
          });
        } else {
          text += `暂无中奖记录\n`;
        }
        
        return {
          content: [
            {
              type: 'text',
              text,
            },
          ],
          lotteries,
        };
      } else {
        throw new Error(result.message || '获取抽奖记录失败');
      }
    } catch (error) {
      throw new Error(`获取抽奖记录失败: ${error.message}`);
    }
  }

  // 获取全局统计
  async getGlobalStats() {
    try {
      const response = await this.fetch(`${this.apiBaseUrl}/lottery/stats`);
      const result = await response.json();
      
      if (result.success) {
        const stats = result.data;
        
        const text = `📈 VibeDoge抽奖全局统计\n\n` +
          `👥 总用户数: ${stats.totalUsers}\n` +
          `🎲 总抽奖次数: ${stats.totalLotteries}\n` +
          `🏆 总中奖次数: ${stats.totalWins}\n` +
          `💰 总奖品价值: ${stats.totalPrizeValue}\n` +
          `📊 中奖率: ${((stats.totalWins / stats.totalLotteries) * 100).toFixed(2)}%\n` +
          `⏰ 统计时间: ${new Date().toISOString()}`;
        
        return {
          content: [
            {
              type: 'text',
              text,
            },
          ],
          stats,
        };
      } else {
        throw new Error(result.message || '获取统计信息失败');
      }
    } catch (error) {
      throw new Error(`获取统计信息失败: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('VibeDoge Lottery MCP Server running on stdio');
  }
}

// 启动服务器
const server = new LotteryMCPServer();
server.run().catch(console.error);