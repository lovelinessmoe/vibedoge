// 设置抽奖数据库表结构
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 检查环境变量
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('❌ 缺少必要的环境变量:');
    console.error('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ 已配置' : '❌ 未配置');
    console.error('   SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ 已配置' : '❌ 未配置');
    process.exit(1);
}

// 创建 Supabase 客户端
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function setupLotteryDatabase() {
    try {
        console.log('🚀 开始设置抽奖数据库...');
        
        // 读取 SQL 文件
        const sqlFilePath = path.join(__dirname, 'database', 'lottery-schema.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
        
        console.log('📄 读取 SQL 文件成功');
        
        // 将 SQL 内容分割成单独的语句
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`📝 找到 ${statements.length} 个 SQL 语句`);
        
        // 逐个执行 SQL 语句
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                try {
                    console.log(`⏳ 执行语句 ${i + 1}/${statements.length}...`);
                    
                    const { data, error } = await supabase.rpc('exec_sql', {
                        sql: statement
                    });
                    
                    if (error) {
                        // 尝试直接执行（某些语句可能不支持 rpc）
                        console.log(`⚠️  RPC 执行失败，尝试直接执行: ${error.message}`);
                        
                        // 对于创建表的语句，我们可以尝试使用 from() 方法
                        if (statement.toLowerCase().includes('create table')) {
                            console.log('📋 跳过表创建语句（需要在 Supabase Dashboard 中手动执行）');
                            continue;
                        }
                    } else {
                        console.log(`✅ 语句 ${i + 1} 执行成功`);
                    }
                } catch (execError) {
                    console.error(`❌ 执行语句 ${i + 1} 失败:`, execError.message);
                    console.log('语句内容:', statement.substring(0, 100) + '...');
                }
            }
        }
        
        console.log('\n🎯 数据库设置完成！');
        console.log('\n📋 请在 Supabase Dashboard 的 SQL Editor 中手动执行以下操作:');
        console.log('1. 打开 https://supabase.com/dashboard');
        console.log('2. 选择你的项目');
        console.log('3. 进入 SQL Editor');
        console.log('4. 复制并执行 database/lottery-schema.sql 文件中的内容');
        
        // 测试表是否存在
        console.log('\n🔍 测试数据库连接...');
        
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .in('table_name', ['users', 'lotteries', 'prizes', 'user_stats']);
            
        if (tablesError) {
            console.error('❌ 无法查询表信息:', tablesError.message);
        } else {
            console.log('📊 找到的抽奖相关表:', tables?.map(t => t.table_name) || []);
        }
        
    } catch (error) {
        console.error('❌ 设置数据库时发生错误:', error.message);
        console.error('详细错误:', error);
    }
}

// 运行设置
setupLotteryDatabase();