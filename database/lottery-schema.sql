-- VibeDoge 抽奖系统数据库表结构
-- 在 Supabase SQL Editor 中执行以下语句

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mcp_user_id VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    avatar_url TEXT,
    total_draws INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    membership_level VARCHAR(20) DEFAULT 'basic',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 抽奖表
CREATE TABLE IF NOT EXISTS lotteries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lottery_id VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mcp_user_id VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, drawn, expired
    prize_type VARCHAR(50),
    prize_value DECIMAL(10,2),
    prize_description TEXT,
    draw_timestamp TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 奖品配置表
CREATE TABLE IF NOT EXISTS prizes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- cash, points, membership, special
    value DECIMAL(10,2),
    description TEXT,
    probability DECIMAL(5,4) NOT NULL, -- 0.0001 to 1.0000
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 用户统计表
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mcp_user_id VARCHAR(100) NOT NULL,
    total_draws INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_prize_value DECIMAL(10,2) DEFAULT 0,
    last_draw_at TIMESTAMPTZ,
    win_rate DECIMAL(5,4) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_mcp_user_id ON users(mcp_user_id);
CREATE INDEX IF NOT EXISTS idx_lotteries_lottery_id ON lotteries(lottery_id);
CREATE INDEX IF NOT EXISTS idx_lotteries_user_id ON lotteries(user_id);
CREATE INDEX IF NOT EXISTS idx_lotteries_mcp_user_id ON lotteries(mcp_user_id);
CREATE INDEX IF NOT EXISTS idx_lotteries_status ON lotteries(status);
CREATE INDEX IF NOT EXISTS idx_lotteries_created_at ON lotteries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_mcp_user_id ON user_stats(mcp_user_id);
CREATE INDEX IF NOT EXISTS idx_prizes_type ON prizes(type);
CREATE INDEX IF NOT EXISTS idx_prizes_is_active ON prizes(is_active);

-- 创建更新时间触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加更新时间触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lotteries_updated_at BEFORE UPDATE ON lotteries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prizes_updated_at BEFORE UPDATE ON prizes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入默认奖品配置
INSERT INTO prizes (name, type, value, description, probability) VALUES
('现金奖励 ¥1', 'cash', 1.00, '获得1元现金奖励', 0.3000),
('现金奖励 ¥5', 'cash', 5.00, '获得5元现金奖励', 0.1500),
('现金奖励 ¥10', 'cash', 10.00, '获得10元现金奖励', 0.0800),
('现金奖励 ¥50', 'cash', 50.00, '获得50元现金奖励', 0.0200),
('现金奖励 ¥100', 'cash', 100.00, '获得100元现金奖励', 0.0050),
('积分奖励 100分', 'points', 100.00, '获得100积分', 0.2000),
('积分奖励 500分', 'points', 500.00, '获得500积分', 0.1000),
('VIP会员 1个月', 'membership', 30.00, '获得1个月VIP会员', 0.0300),
('VIP会员 3个月', 'membership', 90.00, '获得3个月VIP会员', 0.0100),
('特殊奖励', 'special', 0.00, '神秘大奖！', 0.0010),
('谢谢参与', 'none', 0.00, '很遗憾，这次没有中奖，下次再来！', 0.1040)
ON CONFLICT DO NOTHING;

-- 启用行级安全策略 (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotteries ENABLE ROW LEVEL SECURITY;
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- 创建基本的安全策略（允许所有操作）
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on lotteries" ON lotteries FOR ALL USING (true);
CREATE POLICY "Allow all operations on prizes" ON prizes FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_stats" ON user_stats FOR ALL USING (true);

-- 创建视图用于统计
CREATE OR REPLACE VIEW lottery_global_stats AS
SELECT 
    COUNT(DISTINCT u.id) as total_users,
    COUNT(l.id) as total_draws,
    COUNT(CASE WHEN l.prize_type != 'none' AND l.prize_type IS NOT NULL THEN 1 END) as total_wins,
    COALESCE(SUM(CASE WHEN l.prize_type != 'none' THEN l.prize_value ELSE 0 END), 0) as total_prize_value,
    COALESCE(ROUND(
        COUNT(CASE WHEN l.prize_type != 'none' AND l.prize_type IS NOT NULL THEN 1 END)::DECIMAL / 
        NULLIF(COUNT(l.id), 0) * 100, 2
    ), 0) as win_rate
FROM users u
LEFT JOIN lotteries l ON u.id = l.user_id;

-- 创建用户统计视图
CREATE OR REPLACE VIEW user_lottery_stats AS
SELECT 
    u.id,
    u.mcp_user_id,
    u.username,
    COUNT(l.id) as total_draws,
    COUNT(CASE WHEN l.prize_type != 'none' AND l.prize_type IS NOT NULL THEN 1 END) as total_wins,
    COALESCE(SUM(CASE WHEN l.prize_type != 'none' THEN l.prize_value ELSE 0 END), 0) as total_prize_value,
    COALESCE(ROUND(
        COUNT(CASE WHEN l.prize_type != 'none' AND l.prize_type IS NOT NULL THEN 1 END)::DECIMAL / 
        NULLIF(COUNT(l.id), 0) * 100, 2
    ), 0) as win_rate,
    MAX(l.draw_timestamp) as last_draw_at
FROM users u
LEFT JOIN lotteries l ON u.id = l.user_id
GROUP BY u.id, u.mcp_user_id, u.username;