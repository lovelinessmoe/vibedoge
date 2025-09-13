-- Vibe Coding 社区留言数据库表结构
-- 在 Supabase SQL Editor 中执行以下语句

-- 1. 社区留言表
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    likes INTEGER DEFAULT 0,
    replies INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 话题表
CREATE TABLE IF NOT EXISTS topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    messages INTEGER DEFAULT 0,
    participants INTEGER DEFAULT 0,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    trending BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 话题留言表
CREATE TABLE IF NOT EXISTS topic_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 话题留言点赞表
CREATE TABLE IF NOT EXISTS topic_message_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_message_id UUID REFERENCES topic_messages(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(topic_message_id, username)
);

-- 3. 留言点赞表
CREATE TABLE IF NOT EXISTS message_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, username)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_username ON messages(username);
CREATE INDEX IF NOT EXISTS idx_topics_trending ON topics(trending, last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_topics_created_by ON topics(created_by);
CREATE INDEX IF NOT EXISTS idx_message_likes_message_id ON message_likes(message_id);
CREATE INDEX IF NOT EXISTS idx_topic_messages_topic_id ON topic_messages(topic_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_topic_messages_username ON topic_messages(username);
CREATE INDEX IF NOT EXISTS idx_topic_message_likes_message_id ON topic_message_likes(topic_message_id);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加更新时间触发器
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topic_messages_updated_at BEFORE UPDATE ON topic_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入一些初始数据

-- 插入话题数据
INSERT INTO topics (title, description, messages, participants, trending, created_by) VALUES
('Vibe Coding 技术讨论', '分享 Vibe Coding 相关的技术心得和经验', 45, 23, true, '系统管理员'),
('社区建设与反馈', '对平台功能的建议和反馈', 32, 18, true, '系统管理员'),
('新手入门指南', '帮助新用户快速上手平台功能', 28, 15, false, '系统管理员'),
('创意分享', '分享你的创意想法和灵感', 19, 12, false, '系统管理员'),
('技术支持', '遇到问题？在这里寻求帮助', 15, 8, false, '系统管理员');

-- 插入一些示例留言
INSERT INTO messages (username, content) VALUES
('CryptoTrader', '欢迎来到Vibe交易所！这里有最新的加密货币交易机会！'),
('BlockchainFan', '今天体验了平台功能，界面设计真的很棒！'),
('DeFiExplorer', '这个平台的用户体验真的很棒，界面设计很现代化！'),
('VibeCoder', '刚刚体验了Vibe Coding功能，AI助手真的很智能！'),
('TechEnthusiast', '社区氛围很好，大家都很友善，学到了很多东西。'),
('CreativeUser', '期待更多有趣的功能上线，加油！💪'),
('DevMaster', '代码质量很高，可以看出团队很用心在做产品'),
('UIDesigner', '界面设计简洁美观，用户体验很流畅');

-- 启用行级安全策略 (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_message_likes ENABLE ROW LEVEL SECURITY;

-- 创建基本的安全策略（允许所有操作，你可以根据需要调整）
CREATE POLICY "Allow all operations on messages" ON messages FOR ALL USING (true);
CREATE POLICY "Allow all operations on topics" ON topics FOR ALL USING (true);
CREATE POLICY "Allow all operations on message_likes" ON message_likes FOR ALL USING (true);
CREATE POLICY "Allow all operations on topic_messages" ON topic_messages FOR ALL USING (true);
CREATE POLICY "Allow all operations on topic_message_likes" ON topic_message_likes FOR ALL USING (true);