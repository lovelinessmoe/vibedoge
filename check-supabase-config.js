// Supabase 配置检查工具
import fs from 'fs';
import path from 'path';

console.log('🔍 检查 Supabase 配置...\n');

// 读取环境变量文件
const envPath = '.env.local';
if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local 文件不存在');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

let supabaseUrl = '';
let supabaseKey = '';

lines.forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
        supabaseUrl = line.split('=')[1];
    }
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
        supabaseKey = line.split('=')[1];
    }
});

console.log('📋 配置检查结果:');
console.log('================');

// 检查 URL
if (!supabaseUrl || supabaseUrl.includes('your_supabase')) {
    console.log('❌ SUPABASE_URL: 未配置或使用占位符');
} else if (supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co')) {
    console.log('✅ SUPABASE_URL: 格式正确');
} else {
    console.log('⚠️  SUPABASE_URL: 格式可能不正确');
}

// 检查 Key
if (!supabaseKey || supabaseKey.includes('your_supabase')) {
    console.log('❌ SUPABASE_ANON_KEY: 未配置或使用占位符');
} else if (supabaseKey.startsWith('sb_secret_')) {
    console.log('❌ SUPABASE_ANON_KEY: 错误！使用了服务端密钥，应使用 anon public key');
    console.log('   正确的 anon key 应该以 "eyJ" 开头');
} else if (supabaseKey.startsWith('eyJ')) {
    console.log('✅ SUPABASE_ANON_KEY: 格式正确');
} else {
    console.log('⚠️  SUPABASE_ANON_KEY: 格式可能不正确');
}

console.log('\n📝 配置指南:');
console.log('============');
console.log('1. 登录 Supabase 项目: https://supabase.com/dashboard');
console.log('2. 选择你的项目');
console.log('3. 进入 Settings → API');
console.log('4. 复制以下内容:');
console.log('   - Project URL (用于 VITE_SUPABASE_URL)');
console.log('   - anon public key (用于 VITE_SUPABASE_ANON_KEY)');
console.log('   ⚠️  注意: 不要使用 service_role key!');

if (supabaseKey.startsWith('sb_secret_')) {
    console.log('\n🚨 重要提醒:');
    console.log('你当前使用的是 service_role key (以 sb_secret_ 开头)');
    console.log('这个密钥只能在服务端使用，不能在浏览器中使用！');
    console.log('请使用 anon public key (以 eyJ 开头)');
}