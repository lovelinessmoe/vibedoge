// 简单的 Supabase 连接测试
import { createClient } from '@supabase/supabase-js'

// 检查环境变量
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl ? '已配置' : '未配置')
console.log('Supabase Key:', supabaseAnonKey ? '已配置' : '未配置')

if (supabaseUrl && supabaseAnonKey) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('Supabase 客户端创建成功')
  
  // 测试连接
  supabase
    .from('messages')
    .select('count', { count: 'exact', head: true })
    .then(({ count, error }) => {
      if (error) {
        console.error('连接测试失败:', error.message)
      } else {
        console.log('连接测试成功! 当前留言数量:', count)
      }
    })
} else {
  console.log('请先配置 Supabase 环境变量')
}