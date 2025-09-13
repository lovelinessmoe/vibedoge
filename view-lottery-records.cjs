#!/usr/bin/env node

// 模拟抽奖记录查看器
// 由于Supabase连接问题，这里提供模拟数据

class MockLotteryRecords {
  constructor() {
    this.mockRecords = [
      {
        id: 'lottery_001',
        userId: 'user_123',
        lotteryId: 'draw_001',
        prize: {
          name: '🎉 恭喜中奖',
          value: '100 VibeCoin',
          type: 'coin'
        },
        timestamp: '2024-01-15T10:30:00Z',
        status: 'completed'
      },
      {
        id: 'lottery_002', 
        userId: 'user_123',
        lotteryId: 'draw_002',
        prize: {
          name: '🎁 神秘礼品',
          value: '限量版NFT',
          type: 'nft'
        },
        timestamp: '2024-01-14T15:45:00Z',
        status: 'completed'
      },
      {
        id: 'lottery_003',
        userId: 'user_123', 
        lotteryId: 'draw_003',
        prize: {
          name: '💎 稀有道具',
          value: '钻石x5',
          type: 'item'
        },
        timestamp: '2024-01-13T09:20:00Z',
        status: 'completed'
      },
      {
        id: 'lottery_004',
        userId: 'user_123',
        lotteryId: 'draw_004', 
        prize: {
          name: '🍀 幸运符',
          value: '下次抽奖必中',
          type: 'buff'
        },
        timestamp: '2024-01-12T14:10:00Z',
        status: 'completed'
      },
      {
        id: 'lottery_005',
        userId: 'user_123',
        lotteryId: 'draw_005',
        prize: {
          name: '🎊 谢谢参与',
          value: '再接再厉',
          type: 'consolation'
        },
        timestamp: '2024-01-11T11:55:00Z',
        status: 'completed'
      }
    ];
  }

  getUserRecords(userId = 'user_123') {
    return this.mockRecords.filter(record => record.userId === userId);
  }

  displayRecords(userId = 'user_123') {
    console.log('\n🎲 === 您的抽奖记录 === 🎲\n');
    
    const records = this.getUserRecords(userId);
    
    if (records.length === 0) {
      console.log('📝 暂无抽奖记录');
      return;
    }

    console.log(`📊 总抽奖次数: ${records.length}\n`);
    
    records.forEach((record, index) => {
      const date = new Date(record.timestamp).toLocaleString('zh-CN');
      console.log(`${index + 1}. 🎯 抽奖ID: ${record.lotteryId}`);
      console.log(`   🏆 奖品: ${record.prize.name}`);
      console.log(`   💰 价值: ${record.prize.value}`);
      console.log(`   📅 时间: ${date}`);
      console.log(`   ✅ 状态: ${record.status === 'completed' ? '已完成' : '进行中'}`);
      console.log('');
    });

    // 统计信息
    const winRecords = records.filter(r => r.prize.type !== 'consolation');
    const winRate = ((winRecords.length / records.length) * 100).toFixed(1);
    
    console.log('📈 === 统计信息 ===');
    console.log(`🎯 总抽奖次数: ${records.length}`);
    console.log(`🏆 中奖次数: ${winRecords.length}`);
    console.log(`📊 中奖率: ${winRate}%`);
    console.log(`🎁 最近奖品: ${records[0]?.prize.name || '无'}`);
    
    console.log('\n💡 提示: 由于Supabase连接问题，当前显示的是模拟数据');
    console.log('🔧 请修复数据库连接后查看真实记录\n');
  }

  getStats() {
    const totalRecords = this.mockRecords.length;
    const winRecords = this.mockRecords.filter(r => r.prize.type !== 'consolation');
    
    return {
      totalLotteries: totalRecords,
      totalWins: winRecords.length,
      winRate: ((winRecords.length / totalRecords) * 100).toFixed(1),
      lastDraw: this.mockRecords[0]?.timestamp || null
    };
  }
}

// 主函数
function main() {
  const lotteryRecords = new MockLotteryRecords();
  
  console.log('🎮 VibeDoge 抽奖记录查看器');
  console.log('================================');
  
  // 显示用户记录
  lotteryRecords.displayRecords();
  
  // 显示全局统计
  const stats = lotteryRecords.getStats();
  console.log('🌍 === 全局统计 ===');
  console.log(`📊 总抽奖次数: ${stats.totalLotteries}`);
  console.log(`🏆 总中奖次数: ${stats.totalWins}`);
  console.log(`📈 整体中奖率: ${stats.winRate}%`);
  
  if (stats.lastDraw) {
    console.log(`⏰ 最后抽奖: ${new Date(stats.lastDraw).toLocaleString('zh-CN')}`);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = MockLotteryRecords;