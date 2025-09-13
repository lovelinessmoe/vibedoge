// 社区控制器
class CommunityController {
    constructor() {
        // 模拟数据存储（实际项目中应该使用数据库）
        this.messages = [
            {
                id: '1',
                username: 'VibeTrader',
                content: '今天的抽奖活动太精彩了！恭喜所有中奖的朋友们 🎉',
                timestamp: new Date(Date.now() - 1000 * 60 * 5),
                likes: 12,
                replies: 3,
                likedBy: []
            },
            {
                id: '2',
                username: 'CryptoExplorer',
                content: 'Vibe交易所的用户体验真的很棒，界面设计很现代化！',
                timestamp: new Date(Date.now() - 1000 * 60 * 15),
                likes: 8,
                replies: 1,
                likedBy: []
            },
            {
                id: '3',
                username: 'BlockchainFan',
                content: '期待更多有趣的功能上线，社区氛围越来越好了 💪',
                timestamp: new Date(Date.now() - 1000 * 60 * 30),
                likes: 15,
                replies: 5,
                likedBy: []
            }
        ];

        this.topics = [
            {
                id: '1',
                title: '抽奖活动讨论',
                description: '分享你的抽奖体验和建议',
                messages: 156,
                participants: 42,
                lastActivity: new Date(Date.now() - 1000 * 60 * 2),
                trending: true
            },
            {
                id: '2',
                title: '交易策略分享',
                description: '交流交易心得和市场分析',
                messages: 89,
                participants: 28,
                lastActivity: new Date(Date.now() - 1000 * 60 * 10),
                trending: true
            },
            {
                id: '3',
                title: '新手指南',
                description: '帮助新用户快速上手',
                messages: 234,
                participants: 67,
                lastActivity: new Date(Date.now() - 1000 * 60 * 45),
                trending: false
            }
        ];
    }  
  // 获取所有留言
    getMessages = (req, res) => {
        try {
            const { page = 1, limit = 10 } = req.query;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + parseInt(limit);
            
            const paginatedMessages = this.messages
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(startIndex, endIndex);

            res.json({
                success: true,
                data: {
                    messages: paginatedMessages,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(this.messages.length / limit),
                        totalMessages: this.messages.length,
                        hasNext: endIndex < this.messages.length,
                        hasPrev: page > 1
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '获取留言失败',
                error: error.message
            });
        }
    };

    // 发送新留言
    postMessage = (req, res) => {
        try {
            const { username, content } = req.body;

            if (!username || !content) {
                return res.status(400).json({
                    success: false,
                    message: '用户名和内容不能为空'
                });
            }

            if (content.length > 500) {
                return res.status(400).json({
                    success: false,
                    message: '留言内容不能超过500字符'
                });
            }

            const newMessage = {
                id: Date.now().toString(),
                username: username.trim(),
                content: content.trim(),
                timestamp: new Date(),
                likes: 0,
                replies: 0,
                likedBy: []
            };

            this.messages.unshift(newMessage);

            res.status(201).json({
                success: true,
                message: '留言发送成功',
                data: newMessage
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '发送留言失败',
                error: error.message
            });
        }
    };

    // 点赞留言
    likeMessage = (req, res) => {
        try {
            const { messageId } = req.params;
            const { username } = req.body;

            const message = this.messages.find(m => m.id === messageId);
            if (!message) {
                return res.status(404).json({
                    success: false,
                    message: '留言不存在'
                });
            }

            const hasLiked = message.likedBy.includes(username);
            
            if (hasLiked) {
                // 取消点赞
                message.likedBy = message.likedBy.filter(user => user !== username);
                message.likes = Math.max(0, message.likes - 1);
            } else {
                // 点赞
                message.likedBy.push(username);
                message.likes += 1;
            }

            res.json({
                success: true,
                message: hasLiked ? '取消点赞成功' : '点赞成功',
                data: {
                    messageId,
                    likes: message.likes,
                    hasLiked: !hasLiked
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '操作失败',
                error: error.message
            });
        }
    };

    // 获取所有话题
    getTopics = (req, res) => {
        try {
            const { trending } = req.query;
            let filteredTopics = this.topics;

            if (trending === 'true') {
                filteredTopics = this.topics.filter(topic => topic.trending);
            }

            filteredTopics.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

            res.json({
                success: true,
                data: filteredTopics
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '获取话题失败',
                error: error.message
            });
        }
    };

    // 获取单个话题详情
    getTopic = (req, res) => {
        try {
            const { topicId } = req.params;
            const topic = this.topics.find(t => t.id === topicId);

            if (!topic) {
                return res.status(404).json({
                    success: false,
                    message: '话题不存在'
                });
            }

            res.json({
                success: true,
                data: topic
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '获取话题详情失败',
                error: error.message
            });
        }
    };

    // 创建新话题
    createTopic = (req, res) => {
        try {
            const { title, description } = req.body;

            if (!title || !description) {
                return res.status(400).json({
                    success: false,
                    message: '话题标题和描述不能为空'
                });
            }

            const newTopic = {
                id: Date.now().toString(),
                title: title.trim(),
                description: description.trim(),
                messages: 0,
                participants: 0,
                lastActivity: new Date(),
                trending: false
            };

            this.topics.unshift(newTopic);

            res.status(201).json({
                success: true,
                message: '话题创建成功',
                data: newTopic
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '创建话题失败',
                error: error.message
            });
        }
    };
}

module.exports = new CommunityController();