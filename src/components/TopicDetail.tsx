import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare, Heart, Send, Clock, Users, Loader2, AlertCircle } from 'lucide-react';
import { communityService, Topic, TopicMessage } from '../services/communityService';

interface TopicDetailProps {
    topic: Topic;
    onBack: () => void;
    currentUser: string;
}

const TopicDetail: React.FC<TopicDetailProps> = ({ topic, onBack, currentUser }) => {
    const [messages, setMessages] = useState<TopicMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 加载话题留言
    const loadTopicMessages = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await communityService.getTopicMessages(topic.id, 1, 50);
            if (response.success && response.data) {
                setMessages(response.data.messages);
            } else {
                setError(response.error || '加载留言失败');
            }
        } catch (err) {
            console.error('加载话题留言失败:', err);
            setError('网络连接失败');
        } finally {
            setLoading(false);
        }
    };

    // 发送话题留言
    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        setLoading(true);
        try {
            const response = await communityService.postTopicMessage(topic.id, currentUser, newMessage.trim());
            if (response.success && response.data) {
                setMessages([response.data, ...messages]);
                setNewMessage('');
                
                // 重新加载话题信息以更新统计数据
                const topicResponse = await communityService.getTopic(topic.id);
                if (topicResponse.success && topicResponse.data) {
                    // 更新父组件的话题数据
                    Object.assign(topic, topicResponse.data);
                }
            } else {
                setError(response.error || '发送留言失败');
            }
        } catch (err) {
            setError('发送失败，请检查网络连接');
        } finally {
            setLoading(false);
        }
    };

    // 点赞话题留言
    const handleLikeMessage = async (messageId: string) => {
        try {
            const response = await communityService.likeTopicMessage(messageId, currentUser);
            if (response.success && response.data) {
                setMessages(messages.map(msg => 
                    msg.id === messageId 
                        ? { ...msg, likes: response.data!.likes }
                        : msg
                ));
            }
        } catch (err) {
            console.error('点赞失败:', err);
        }
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        
        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (minutes < 1440) return `${Math.floor(minutes / 60)}小时前`;
        return `${Math.floor(minutes / 1440)}天前`;
    };

    useEffect(() => {
        loadTopicMessages();

        // 设置话题留言的实时订阅
        const subscription = communityService.subscribeToTopicMessages(topic.id, (payload) => {
            console.log('话题留言实时更新:', payload);
            
            if (payload.eventType === 'INSERT') {
                // 新留言插入
                const newMessage = {
                    id: payload.new.id,
                    topicId: payload.new.topic_id,
                    username: payload.new.username,
                    content: payload.new.content,
                    timestamp: new Date(payload.new.timestamp),
                    likes: payload.new.likes
                };
                setMessages(prev => [newMessage, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
                // 留言更新（如点赞）
                setMessages(prev => prev.map(msg => 
                    msg.id === payload.new.id 
                        ? {
                            ...msg,
                            likes: payload.new.likes
                        }
                        : msg
                ));
            } else if (payload.eventType === 'DELETE') {
                // 留言删除
                setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
            }
        });

        // 清理订阅
        return () => {
            communityService.unsubscribe(subscription);
        };
    }, [topic.id]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            {/* 话题头部 */}
            <div className="bg-white/75 backdrop-blur-md rounded-2xl p-6 border border-white/90">
                <div className="flex items-start gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg bg-blue-600/90 backdrop-blur-sm text-white hover:bg-blue-700/95 transition-colors border border-blue-700/90 shadow-lg"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">{topic.title}</h1>
                        <p className="text-slate-600 mb-4">{topic.description}</p>
                        <div className="flex items-center gap-6 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {topic.messages} 条留言
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {topic.participants} 位参与者
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                创建者: {topic.createdBy}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 错误提示 */}
            {error && (
                <div className="bg-red-50/90 backdrop-blur-md border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700">{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="ml-auto text-red-500 hover:text-red-700"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* 留言输入框 */}
            <div className="bg-white/75 backdrop-blur-md rounded-2xl p-6 border border-white/90">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="参与话题讨论..."
                            className="w-full bg-white/85 border border-gray-700/80 rounded-xl px-4 py-3 text-slate-800 placeholder-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/90 backdrop-blur-sm"
                            rows={3}
                            disabled={loading}
                            maxLength={1000}
                        />
                        <div className="text-right text-sm text-slate-500 mt-1">
                            {newMessage.length}/1000
                        </div>
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={loading || !newMessage.trim()}
                        className="bg-blue-600/90 backdrop-blur-sm border border-blue-700/90 hover:bg-blue-700/95 disabled:bg-gray-400/90 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 h-fit shadow-lg"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                        发送
                    </button>
                </div>
            </div>

            {/* 留言列表 */}
            <div className="space-y-4">
                {loading && messages.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        暂无讨论，快来发表第一条留言吧！
                    </div>
                ) : (
                    messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/75 backdrop-blur-md rounded-2xl p-6 hover:bg-white/85 transition-all duration-300 border border-white/90"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-green-500/20 backdrop-blur-sm border border-green-200/30 rounded-full flex items-center justify-center text-slate-800 font-bold">
                                    {message.username[0]}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-slate-800 font-semibold">{message.username}</h3>
                                        <span className="text-slate-500 text-sm flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {formatTime(message.timestamp)}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 mb-3 whitespace-pre-wrap">{message.content}</p>
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => handleLikeMessage(message.id)}
                                            className="flex items-center gap-1 text-slate-500 hover:text-pink-500 transition-colors"
                                        >
                                            <Heart className="w-4 h-4" />
                                            {message.likes}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
};

export default TopicDetail;