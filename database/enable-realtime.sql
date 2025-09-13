-- 启用 Supabase 实时功能
-- 在 Supabase SQL Editor 中执行

-- 1. 为 messages 表启用实时功能
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 2. 为 topics 表启用实时功能
ALTER PUBLICATION supabase_realtime ADD TABLE topics;

-- 3. 为 topic_messages 表启用实时功能
ALTER PUBLICATION supabase_realtime ADD TABLE topic_messages;

-- 4. 为 message_likes 表启用实时功能
ALTER PUBLICATION supabase_realtime ADD TABLE message_likes;

-- 5. 为 topic_message_likes 表启用实时功能
ALTER PUBLICATION supabase_realtime ADD TABLE topic_message_likes;

-- 验证实时功能已启用
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- 完成提示
SELECT 'Realtime enabled for all community tables!' as status;