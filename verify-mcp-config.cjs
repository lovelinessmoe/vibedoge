// MCP配置验证脚本
const fs = require('fs');
const path = require('path');

console.log('🔍 验证MCP抽奖服务配置...');

// 检查必要文件是否存在
const requiredFiles = [
  'mcp-lottery-server.cjs',
  'mcp-config.json',
  'TRAE-MCP-USAGE.md',
  'MCP-LOTTERY-README.md'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} 存在`);
  } else {
    console.log(`❌ ${file} 不存在`);
    allFilesExist = false;
  }
});

// 检查配置文件内容
if (fs.existsSync('mcp-config.json')) {
  try {
    const config = JSON.parse(fs.readFileSync('mcp-config.json', 'utf8'));
    
    if (config.mcpServers && config.mcpServers['lottery-mcp']) {
      const lotteryConfig = config.mcpServers['lottery-mcp'];
      
      console.log('\n📋 配置检查:');
      
      // 检查命令
      if (lotteryConfig.command === 'node') {
        console.log('✅ 命令配置正确: node');
      } else {
        console.log(`❌ 命令配置错误: ${lotteryConfig.command}`);
      }
      
      // 检查参数
      if (lotteryConfig.args && lotteryConfig.args[0] && lotteryConfig.args[0].includes('mcp-lottery-server.cjs')) {
        console.log('✅ 参数配置正确: 指向 .cjs 文件');
      } else {
        console.log('❌ 参数配置错误: 未正确指向 .cjs 文件');
      }
      
      // 检查工作目录
      if (lotteryConfig.cwd) {
        console.log(`✅ 工作目录已设置: ${lotteryConfig.cwd}`);
      } else {
        console.log('⚠️  工作目录未设置');
      }
      
      // 检查环境变量
      if (lotteryConfig.env && lotteryConfig.env.LOTTERY_API_URL) {
        console.log(`✅ API URL 已配置: ${lotteryConfig.env.LOTTERY_API_URL}`);
      } else {
        console.log('❌ API URL 未配置');
      }
      
    } else {
      console.log('❌ 配置文件中未找到 lottery-mcp 配置');
    }
    
  } catch (error) {
    console.log('❌ 配置文件格式错误:', error.message);
  }
}

// 检查依赖包
console.log('\n📦 依赖检查:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

if (dependencies['@modelcontextprotocol/sdk']) {
  console.log('✅ @modelcontextprotocol/sdk 已安装');
} else {
  console.log('❌ @modelcontextprotocol/sdk 未安装');
}

if (dependencies['node-fetch']) {
  console.log('✅ node-fetch 已安装');
} else {
  console.log('❌ node-fetch 未安装');
}

// 检查脚本
console.log('\n🔧 脚本检查:');
if (packageJson.scripts && packageJson.scripts['mcp:lottery']) {
  console.log(`✅ mcp:lottery 脚本已配置: ${packageJson.scripts['mcp:lottery']}`);
} else {
  console.log('❌ mcp:lottery 脚本未配置');
}

console.log('\n🎯 总结:');
if (allFilesExist) {
  console.log('✅ 所有必要文件都存在');
  console.log('🚀 MCP抽奖服务配置完成！');
  console.log('\n📝 下一步:');
  console.log('1. 确保后端API服务正在运行: npm run dev:server');
  console.log('2. 启动MCP服务: npm run mcp:lottery');
  console.log('3. 在Trae IDE中使用mcp-config.json或TRAE-MCP-USAGE.md中的配置');
} else {
  console.log('❌ 配置不完整，请检查缺失的文件');
}