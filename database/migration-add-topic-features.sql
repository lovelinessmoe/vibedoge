-- 数据库迁移：添加话题讨论功能
-- 执行此脚本来更新现有的数据库结构

-- 1. 为 topics 表添加 created_by 字段
ALTER TABLE topics ADD COLUMN IF NOT EXISTS created_by VARCHAR(100) NOT NULL DEFAULT '系统管理员';

-- 2. 创建话题留言表
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

-- 3. 创建话题留言点赞表
CREATE TABLE IF NOT EXISTS topic_message_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_message_id UUID REFERENCES topic_messages(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(topic_message_id, username)
);

-- 4. 添加新的索引
CREATE INDEX IF NOT EXISTS idx_topics_created_by ON topics(created_by);
CREATE INDEX IF NOT EXISTS idx_topic_messages_topic_id ON topic_messages(topic_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_topic_messages_username ON topic_messages(username);
CREATE INDEX IF NOT EXISTS idx_topic_message_likes_message_id ON topic_message_likes(topic_message_id);

-- 5. 添加触发器
CREATE TRIGGER IF NOT EXISTS update_topic_messages_updated_at BEFORE UPDATE ON topic_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. 启用 RLS
ALTER TABLE topic_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_message_likes ENABLE ROW LEVEL SECURITY;

-- 7. 创建安全策略
DROP POLICY IF EXISTS "Allow all operations on topic_messages" ON topic_messages;
DROP POLICY IF EXISTS "Allow all operations on topic_message_likes" ON topic_message_likes;

CREATE POLICY "Allow all operations on topic_messages" ON topic_messages FOR ALL USING (true);
CREATE POLICY "Allow all operations on topic_message_likes" ON topic_message_likes FOR ALL USING (true);

-- 8. 更新现有话题的创建者（如果字段为空）
UPDATE topics SET created_by = '系统管理员' WHERE created_by IS NULL OR created_by = '';

-- 完成提示
SELECT 'Migration completed successfully! Topic discussion features are now available.' as status;