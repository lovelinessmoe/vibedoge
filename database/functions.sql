-- 数据库函数：话题统计自动更新（可选）
-- 在 Supabase SQL Editor 中执行（可选，不是必需的）

-- 1. 创建函数：更新话题统计数据
CREATE OR REPLACE FUNCTION update_topic_stats(topic_uuid UUID)
RETURNS void AS $$
DECLARE
    message_count INTEGER;
    participant_count INTEGER;
BEGIN
    -- 计算留言数
    SELECT COUNT(*) INTO message_count
    FROM topic_messages
    WHERE topic_id = topic_uuid;
    
    -- 计算参与者数（去重）
    SELECT COUNT(DISTINCT username) INTO participant_count
    FROM topic_messages
    WHERE topic_id = topic_uuid;
    
    -- 更新话题表
    UPDATE topics
    SET 
        messages = message_count,
        participants = participant_count,
        updated_at = NOW()
    WHERE id = topic_uuid;
END;
$$ LANGUAGE plpgsql;

-- 2. 创建触发器：自动更新统计数据（可选）
CREATE OR REPLACE FUNCTION trigger_update_topic_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- 当话题留言发生变化时，更新对应话题的统计数据
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_topic_stats(NEW.topic_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_topic_stats(OLD.topic_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. 绑定触发器到话题留言表（可选）
-- 注意：这个触发器是可选的，如果不需要自动更新可以跳过
-- DROP TRIGGER IF EXISTS topic_messages_stats_trigger ON topic_messages;
-- CREATE TRIGGER topic_messages_stats_trigger
--     AFTER INSERT OR UPDATE OR DELETE ON topic_messages
--     FOR EACH ROW EXECUTE FUNCTION trigger_update_topic_stats();

-- 完成提示
SELECT 'Topic statistics functions created successfully (optional)!' as status;