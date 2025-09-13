#!/usr/bin/env node

const LotteryWebClient = require('./web-lottery-client');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const client = new LotteryWebClient();
let currentUser = null;

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function showMainMenu() {
  console.log('\n=== VibeDoge抽奖系统 ===');
  console.log('1. 创建用户');
  console.log('2. 抽奖');
  console.log('3. 查看我的记录');
  console.log('4. 查看全局统计');
  console.log('5. 退出');
  
  const choice = await question('\n请选择操作 (1-5): ');
  
  switch (choice) {
    case '1':
      await createUser();
      break;
    case '2':
      await performLottery();
      break;
    case '3':
      await viewRecords();
      break;
    case '4':
      await viewStats();
      break;
    case '5':
      console.log('👋 再见！');
      rl.close();
      return;
    default:
      console.log('❌ 无效选择，请重试');
  }
  
  await showMainMenu();
}

async function createUser() {
  console.log('\n🎯 创建新用户');
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const mcpUserId = `mcp_${timestamp}_${random}`;
  
  try {
    const user = await client.generateUserId(mcpUserId);
    currentUser = user;
    console.log(`✅ 用户创建成功！`);
    console.log(`👤 用户名: ${user.username}`);
    console.log(`🎫 剩余抽奖次数: ${user.remainingDraws}`);
    console.log(`⏰ 创建时间: ${user.createdAt}`);
  } catch (error) {
    console.error(`❌ 创建失败: ${error.message}`);
  }
}

async function performLottery() {
  if (!currentUser) {
    console.log('❌ 请先创建用户');
    return;
  }
  
  console.log('\n🎲 开始抽奖...');
  
  try {
    const lotteryId = await client.generateLotteryId(currentUser.userId);
    console.log(`📋 抽票ID: ${lotteryId}`);
    
    const prize = await client.draw(lotteryId, currentUser.userId);
    console.log(`🎉 恭喜！您获得了: ${prize.name}`);
    console.log(`💰 奖品价值: ${prize.value}`);
    console.log(`📝 奖品描述: ${prize.description}`);
    
  } catch (error) {
    console.error(`❌ 抽奖失败: ${error.message}`);
  }
}

async function viewRecords() {
  if (!currentUser) {
    console.log('❌ 请先创建用户');
    return;
  }
  
  console.log('\n📊 您的抽奖记录');
  
  try {
    const records = await client.getUserLotteries(currentUser.userId);
    const completed = records.filter(r => r.status === 'completed');
    
    console.log(`总抽奖次数: ${records.length}`);
    console.log(`已完成抽奖: ${completed.length}`);
    
    if (completed.length > 0) {
      console.log('\n🏆 中奖记录:');
      completed.forEach((record, index) => {
        console.log(`${index + 1}. ${record.prize_name} - ${record.draw_time}`);
      });
    } else {
      console.log('暂无中奖记录');
    }
    
  } catch (error) {
    console.error(`❌ 获取记录失败: ${error.message}`);
  }
}

async function viewStats() {
  console.log('\n📈 全局统计信息');
  
  try {
    const stats = await client.getStats();
    console.log(`👥 总用户数: ${stats.totalUsers}`);
    console.log(`🎲 总抽奖次数: ${stats.totalLotteries}`);
    console.log(`🏆 总中奖次数: ${stats.totalWins}`);
    console.log(`💰 总奖品价值: ${stats.totalPrizeValue}`);
    console.log(`📊 中奖率: ${((stats.totalWins / stats.totalLotteries) * 100).toFixed(2)}%`);
    
  } catch (error) {
    console.error(`❌ 获取统计失败: ${error.message}`);
  }
}

// 启动应用
console.log('🎉 欢迎使用 VibeDoge 抽奖系统！');
showMainMenu().catch(console.error);