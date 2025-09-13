import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  Heart, 
  Users, 
  Zap, 
  Gift,
  MessageCircle,
  Smile,
  Image,
  Hash,
  BarChart3,
  Code,
  Shield
} from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import AnimatedText from '../components/ui/AnimatedText';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { communityService, Message, Topic } from '../services/communityService';
import RealtimeIndicator from '../components/RealtimeIndicator';

const HomePage: React.FC = () => {
  const { } = useUIStore();
  
  // 真实数据状态
  const [messages, setMessages] = useState<Message[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 实时更新状态
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | undefined>();

  // 模拟在线用户数据（这部分可以保持静态）
  const onlineUsers = [
    "Alice", "Bob", "Charlie", "David", "Eva", "Frank", "Grace", "Henry",
    "Ivy", "Jack", "Kate", "Liam", "Mia", "Noah", "Olivia", "Paul",
    "Quinn", "Ruby", "Sam", "Tina", "Uma", "Victor", "Wendy", "Xander"
  ];

  // 加载真实数据和设置实时更新
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 并行加载留言和话题数据
        const [messagesResponse, topicsResponse] = await Promise.all([
          communityService.getMessages(1, 8), // 获取最新8条留言
          communityService.getTopics(true) // 获取热门话题
        ]);

        if (messagesResponse.success && messagesResponse.data) {
          setMessages(messagesResponse.data.messages);
        }

        if (topicsResponse.success && topicsResponse.data) {
          setTopics(topicsResponse.data.slice(0, 5)); // 只显示前5个话题
        }
      } catch (error) {
        console.error('加载首页数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // 设置实时订阅
    console.log('首页：设置实时订阅...');
    
    const messagesSubscription = communityService.subscribeToMessages((payload) => {
      console.log('🔥 首页留言实时更新:', payload);
      setLastUpdate(new Date());
      
      if (payload.eventType === 'INSERT') {
        console.log('📝 新留言插入:', payload.new);
        // 新留言插入，添加到列表开头，保持最多8条
        const newMessage = {
          id: payload.new.id,
          username: payload.new.username,
          content: payload.new.content,
          timestamp: new Date(payload.new.timestamp),
          likes: payload.new.likes,
          replies: payload.new.replies
        };
        setMessages(prev => {
          const updated = [newMessage, ...prev].slice(0, 8);
          console.log('📝 首页留言列表更新:', updated.length, '条留言');
          return updated;
        });
      } else if (payload.eventType === 'UPDATE') {
        console.log('🔄 留言更新:', payload.new);
        // 留言更新（如点赞）
        setMessages(prev => prev.map(msg => 
          msg.id === payload.new.id 
            ? {
                ...msg,
                likes: payload.new.likes,
                replies: payload.new.replies
              }
            : msg
        ));
      }
    });

    const topicsSubscription = communityService.subscribeToTopics((payload) => {
      console.log('🔥 首页话题实时更新:', payload);
      setLastUpdate(new Date());
      
      if (payload.eventType === 'INSERT') {
        console.log('📋 新话题插入:', payload.new);
        // 新话题插入
        const newTopic = {
          id: payload.new.id,
          title: payload.new.title,
          description: payload.new.description,
          messages: payload.new.messages || 0,
          participants: payload.new.participants || 0,
          lastActivity: new Date(payload.new.last_activity),
          trending: payload.new.trending,
          createdBy: payload.new.created_by
        };
        setTopics(prev => {
          const updated = [newTopic, ...prev].slice(0, 5);
          console.log('📋 首页话题列表更新:', updated.length, '个话题');
          return updated;
        });
      } else if (payload.eventType === 'UPDATE') {
        console.log('🔄 话题更新:', payload.new);
        // 话题更新
        setTopics(prev => prev.map(topic => 
          topic.id === payload.new.id 
            ? {
                ...topic,
                messages: payload.new.messages || 0,
                participants: payload.new.participants || 0,
                lastActivity: new Date(payload.new.last_activity),
                trending: payload.new.trending
              }
            : topic
        ));
      }
    });

    // 监听连接状态
    setIsRealtimeConnected(true);
    console.log('✅ 首页实时订阅已设置');

    // 清理订阅
    return () => {
      console.log('🧹 首页清理实时订阅');
      setIsRealtimeConnected(false);
      communityService.unsubscribe(messagesSubscription);
      communityService.unsubscribe(topicsSubscription);
    };
  }, []);

  // 格式化时间
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}小时前`;
    return `${Math.floor(minutes / 1440)}天前`;
  };

  // 计算统计数据
  const totalMessages = messages.reduce((sum, msg) => sum + 1, 0);
  const totalLikes = messages.reduce((sum, msg) => sum + msg.likes, 0);
  const uniqueUsers = new Set(messages.map(msg => msg.username)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 实时状态指示器 */}
      <RealtimeIndicator 
        isConnected={isRealtimeConnected} 
        lastUpdate={lastUpdate} 
      />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* 动态背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-white/50 to-purple-100/30"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-pink-200/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
          {/* 金色光晕效果 */}
          <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-gradient-to-r from-yellow-300/30 to-amber-400/30 rounded-full blur-3xl animate-pulse delay-500"></div>
          <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-gradient-to-r from-amber-300/25 to-yellow-400/25 rounded-full blur-2xl animate-pulse delay-1500"></div>
          <div className="absolute top-2/3 left-2/3 w-48 h-48 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 rounded-full blur-xl animate-pulse delay-3000"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-16 w-16 text-yellow-400 mr-4 animate-pulse" />
              <Zap className="h-20 w-20 text-blue-400" />
              <Sparkles className="h-16 w-16 text-pink-400 ml-4 animate-pulse" />
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 bg-clip-text text-transparent mb-6">
              VibeDoge
            </h1>
            
            <AnimatedText 
              text="🐕 Vibe Coding时代的新型资产交易平台"
              className="text-2xl md:text-4xl text-gray-600 mb-8 font-light"
            />
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
              探索Vibe Coding时代诞生的创新数字资产，体验全新的智能交易生态与无限可能
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link to="/lottery/detail">
              <Button
                size="lg"
                className="backdrop-blur-md bg-gradient-to-r from-amber-500/90 to-yellow-600/90 border-2 border-amber-600/90 text-white hover:from-amber-600/95 hover:to-yellow-700/95 hover:border-amber-700/95 shadow-xl hover:shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 group"
              >
                🐾 开始体验
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Link to="/about">
              <Button
                variant="outline"
                size="lg"
                className="backdrop-blur-md bg-white/90 border-2 border-amber-600/90 text-amber-700 hover:bg-amber-50/95 hover:border-amber-700/95 hover:text-amber-800 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl hover:shadow-amber-500/20 transition-all duration-300"
              >
                🐶 了解更多
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 业务介绍 */}
      <section className="py-20 relative">
        {/* 金色分割线装饰 */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
        {/* 背景装饰 */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-40 h-40 bg-blue-200/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-200/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              🐕 <span className="bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">Vibe Coding</span> 时代的创新资产平台
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              探索 Vibe Coding 时代诞生的全新数字资产生态，体验超越传统的创新交易体验
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "🐕‍🦺 Vibe 安全矩阵",
                description: "融合传统安全与 Vibe 创新技术，构建多维度安全防护，守护您的数字资产"
              },
              {
                icon: Zap,
                title: "🐕 Vibe 智能引擎",
                description: "基于 Vibe Coding 理念的智能算法，感知市场情绪波动，创造独特的交易体验"
              },
              {
                icon: Users,
                title: "🐾 Vibe 社区生态",
                description: "汇聚 Vibe Coding 时代的创新者，共同探索数字资产的无限可能"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-amber-200/30 hover:bg-white/20 hover:border-amber-300/50 transition-all duration-300 group hover:scale-105 hover:shadow-lg hover:shadow-amber-500/10"
              >
                <div className="w-16 h-16 backdrop-blur-md bg-gradient-to-br from-amber-100/30 to-yellow-100/30 border border-amber-200/40 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-8 w-8 text-gray-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">{feature.title}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 价值观展示 */}
      <section className="py-20 relative">
        {/* 金色分割线装饰 */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <AnimatedText 
              text="🐶 Vibe 时代核心理念"
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent mb-6"
            />
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              传承 Vibe Coding 精神，以创新为驱动，构建属于新时代的数字资产生态
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Heart,
                title: "🐕 Vibe 创新",
                description: "秉承 Vibe Coding 的创新精神，突破传统金融框架，用全新的思维模式重新定义数字资产交易体验",
                color: "from-red-500 to-pink-500"
              },
              {
                icon: Users,
                title: "🐶 情感共鸣",
                description: "不仅仅是技术平台，更是情感连接的桥梁，让每一次交互都充满 Vibe 的温度和人文关怀",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Zap,
                title: "🦮 未来导向",
                description: "面向 Vibe Coding 时代的未来，持续探索数字资产的无限可能，引领行业发展新方向",
                color: "from-yellow-500 to-orange-500"
              },
              {
                icon: Heart,
                title: "🐾 生态共建",
                description: "汇聚 Vibe 社区的集体智慧，与每一位成员共同构建属于新时代的数字资产生态系统",
                color: "from-green-500 to-emerald-500"
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${value.color} mb-6 group-hover:scale-110 transition-transform duration-300 ring-2 ring-amber-200/30 group-hover:ring-amber-300/50`}>
                  <value.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 可视化抽奖横切组件 */}
      <section className="py-20 relative overflow-hidden">
        {/* 金色分割线装饰 */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent z-20"></div>
        {/* 背景装饰 */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-200/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-200/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-6">
              <Gift className="h-16 w-16 text-white mr-4" />
              <Sparkles className="h-12 w-12 text-yellow-200" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 text-center">
              🐕 <span className="bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">VibeDoge</span> 创意抽奖体验
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto text-center mb-12">
              体验 Vibe Coding 时代的创新抽奖机制，每一次参与都是对 VibeDoge 生态的贡献！
            </p>
          </motion.div>
          
          <div className="text-center">
            <div className="backdrop-blur-md bg-white/10 rounded-3xl p-8 border border-amber-200/30 hover:bg-white/20 hover:border-amber-300/50 transition-all duration-300 max-w-4xl mx-auto hover:shadow-xl hover:shadow-amber-500/20">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">🐶 <span className="bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">VibeDoge</span> 奖池</h3>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent mb-2">1,234.56 ETH</div>
                <div className="text-gray-600">≈ <span className="text-amber-600 font-semibold">$2,468,912 USD</span></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="backdrop-blur-sm bg-white/75 border border-amber-200/50 rounded-xl p-4 text-center">
                  <div className="text-sm text-gray-600 mb-1">Vibe 创作者</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">8,765</div>
                </div>
                <div className="backdrop-blur-sm bg-white/75 border border-amber-200/50 rounded-xl p-4 text-center">
                  <div className="text-sm text-gray-600 mb-1">Vibe 时刻</div>
                  <div className="text-lg font-semibold text-purple-600">23:45:12</div>
                </div>
                <div className="backdrop-blur-sm bg-white/75 border border-amber-200/50 rounded-xl p-4 text-center">
                  <div className="text-sm text-gray-600 mb-1">中奖概率</div>
                  <div className="text-lg font-semibold text-green-600">1/8,765</div>
                </div>
              </div>
              
              <Link to="/lottery/detail">
                <Button className="w-full backdrop-blur-md bg-gradient-to-r from-amber-500/90 to-yellow-600/90 border border-amber-600/90 text-white hover:from-amber-600/95 hover:to-yellow-700/95 hover:border-amber-700/95 font-semibold py-3 text-lg shadow-lg hover:shadow-xl hover:shadow-amber-500/25 transition-all duration-300">
                  🐾 加入 VibeDoge 创意之旅
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 公共留言板横切组件 */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
        {/* 金色分割线装饰 */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent z-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-6">
              <MessageCircle className="h-16 w-16 text-blue-600 mr-4" />
              <Users className="h-12 w-12 text-purple-600" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              🐕 <span className="bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">Vibe</span> 社区广场
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              与全球 Vibe 创作者实时交流，分享 VibeDoge 创意灵感和 Coding 心得
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 实时留言流 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="backdrop-blur-md bg-white/75 rounded-2xl p-6 border border-white/90">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                    <MessageCircle className="h-6 w-6 mr-2 text-blue-600" />
                    🐶 Vibe 创意流
                  </h3>
                  <div className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-sm">实时更新</span>
                  </div>
                </div>
                
                {/* 留言列表 */}
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {loading ? (
                    // 加载状态
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    // 空状态
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>暂无留言，快去社区发表第一条留言吧！</p>
                      <Link to="/community" className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block">
                        前往社区 →
                      </Link>
                    </div>
                  ) : (
                    // 真实留言数据
                    messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="backdrop-blur-sm bg-white/75 border border-white/90 rounded-lg p-4 hover:bg-white/85 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">
                              {message.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-gray-800 font-semibold text-sm">{message.username}</span>
                              <span className="text-gray-600 text-xs">{formatTime(message.timestamp)}</span>
                              {message.likes > 10 && (
                                <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-bold">
                                  热门
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">{message.content}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center space-x-1 text-gray-600">
                                <Heart className="h-4 w-4" />
                                <span className="text-xs">{message.likes}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-gray-600">
                                <MessageCircle className="h-4 w-4" />
                                <span className="text-xs">{message.replies}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
                
                {/* 快速发言 */}
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <div className="flex space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">我</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="分享您的 VibeDoge 创意和 Coding 灵感..."
                          className="flex-1 backdrop-blur-sm bg-white/85 border-2 border-gray-700/80 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-600 focus:outline-none focus:border-blue-600 focus:bg-white/90 transition-all duration-300 shadow-md focus:shadow-lg"
                        />
                        <Link to="/community">
                          <Button
                            size="sm"
                            className="backdrop-blur-md bg-blue-600/90 border-2 border-blue-700/90 text-white hover:bg-blue-700/95 hover:border-blue-800 px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            🐾 发布 Vibe
                          </Button>
                        </Link>
                      </div>
                      <div className="flex items-center space-x-4 mt-2">
                        <button className="text-gray-600 hover:text-yellow-600 transition-colors">
                          <Smile className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-green-600 transition-colors">
                          <Image className="h-4 w-4" />
                        </button>
                        <span className="text-xs text-gray-500">Ctrl+Enter 快速发送</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* 侧边栏：用户头像墙和热门话题 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="lg:col-span-1 space-y-6"
            >
              {/* 在线用户头像墙 */}
              <div className="backdrop-blur-md bg-white/75 rounded-2xl p-6 border border-white/90">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  🐕 Vibe 创作者 ({uniqueUsers + onlineUsers.length})
                </h3>
                <div className="grid grid-cols-6 gap-2">
                  {/* 显示真实用户 */}
                  {messages.slice(0, 6).map((message, index) => (
                    <motion.div
                      key={`real-${message.id}`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative group"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                        <span className="text-white font-bold text-xs">
                          {message.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-600 rounded-full border border-white"></div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 backdrop-blur-sm bg-white/80 text-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {message.username}
                      </div>
                    </motion.div>
                  ))}
                  {/* 显示模拟用户 */}
                  {onlineUsers.slice(0, 12).map((user, index) => (
                    <motion.div
                      key={`mock-${index}`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (index + 6) * 0.05 }}
                      className="relative group"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                        <span className="text-white font-bold text-xs">
                          {user.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-600 rounded-full border border-white"></div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 backdrop-blur-sm bg-white/80 text-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {user}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <p className="text-gray-600 text-sm mt-3 text-center">
                  还有更多用户在线...
                </p>
              </div>
              
              {/* 热门话题 */}
              <div className="backdrop-blur-md bg-white/75 rounded-2xl p-6 border border-white/90">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Hash className="h-5 w-5 mr-2 text-orange-600" />
                  🐾 Vibe 热点
                </h3>
                <div className="space-y-3">
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                    </div>
                  ) : topics.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">暂无热门话题</p>
                      <Link to="/community" className="text-orange-600 hover:text-orange-700 text-xs mt-1 inline-block">
                        创建话题 →
                      </Link>
                    </div>
                  ) : (
                    topics.map((topic, index) => (
                      <motion.div
                        key={topic.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 backdrop-blur-sm bg-white/50 border-2 border-white/70 rounded-lg hover:bg-white/60 hover:border-white/80 transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg"
                      >
                        <div>
                          <div className="text-gray-800 font-medium text-sm">#{topic.title}</div>
                          <div className="text-gray-600 text-xs">{topic.messages} 条讨论 · {topic.participants} 位参与者</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {topic.trending && (
                            <span className="bg-orange-500 text-white text-xs px-1 py-0.5 rounded">热</span>
                          )}
                          <div className="text-orange-600 text-xs font-bold">
                            #{index + 1}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
              
              {/* 社区统计 */}
              <div className="backdrop-blur-md bg-white/75 rounded-2xl p-6 border border-white/90">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                  🐕 Vibe 数据
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">最新留言</span>
                    <span className="text-gray-800 font-bold">{totalMessages}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">活跃话题</span>
                    <span className="text-gray-800 font-bold">{topics.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">总点赞数</span>
                    <span className="text-gray-800 font-bold">{totalLikes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">参与用户</span>
                    <span className="text-gray-800 font-bold">{uniqueUsers}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MCP服务器集成入口 */}
      <section className="py-20 relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-200/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-200/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center mb-6">
              <Code className="h-16 w-16 text-blue-400 mr-4" />
              <Zap className="h-12 w-12 text-purple-400 mr-2" />
              <Shield className="h-10 w-10 text-pink-400" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              🐕 Vibe Coding 协作生态
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              融合 Vibe Coding 理念的智能协作平台，连接创新思维与前沿技术，释放无限创造力
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* 智能助手 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="backdrop-blur-md bg-white/75 rounded-2xl p-8 border border-white/90 hover:bg-white/85 transition-all duration-300 group-hover:scale-105">
                <div className="w-20 h-20 backdrop-blur-md bg-white/75 border border-white/90 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300">
                  <Code className="h-10 w-10 text-gray-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">🐕 Vibe AI 伙伴</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  融入 Vibe Coding 精神的智能助手，理解您的创意思维，提供个性化的资产管理建议
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    <span className="text-sm">Vibe 情绪分析</span>
                  </div>
                  <div className="flex items-center text-blue-300">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    <span className="text-sm">创意资产发现</span>
                  </div>
                  <div className="flex items-center text-blue-300">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    <span className="text-sm">个性化 Vibe 匹配</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* 实时数据 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white/75 backdrop-blur-sm rounded-2xl p-8 border border-white/90 hover:bg-white/85 transition-all duration-300 group-hover:scale-105">
                <div className="w-20 h-20 backdrop-blur-md bg-white/75 border border-white/90 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300">
                  <Zap className="h-10 w-10 text-gray-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">🐶 Vibe 数据流</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  实时捕捉 Vibe 社区的情绪波动和创意趋势，让您感知数字资产的真实脉动
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full mr-3"></div>
                    <span className="text-sm">情绪实时同步</span>
                  </div>
                  <div className="flex items-center text-yellow-300">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    <span className="text-sm">Vibe 趋势聚合</span>
                  </div>
                  <div className="flex items-center text-yellow-300">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    <span className="text-sm">创意灵感预警</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* 安全保障 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white/75 backdrop-blur-sm rounded-2xl p-8 border border-white/90 hover:bg-white/85 transition-all duration-300 group-hover:scale-105">
                <div className="w-20 h-20 backdrop-blur-md bg-white/75 border border-white/90 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300">
                  <Shield className="h-10 w-10 text-gray-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">🐕‍🦺 Vibe 守护</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  融合传统安全与 Vibe 创新理念，构建多维度保护体系，守护您的创意资产
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                    <span className="text-sm">Vibe 加密协议</span>
                  </div>
                  <div className="flex items-center text-green-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    <span className="text-sm">创意身份认证</span>
                  </div>
                  <div className="flex items-center text-green-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    <span className="text-sm">分布式资产存储</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* CTA按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-flex flex-col sm:flex-row gap-4">
              <Link to="/community">
                <Button
                  size="lg"
                  className="backdrop-blur-md bg-gradient-to-r from-blue-500/90 to-purple-500/90 border-2 border-blue-600/90 text-white hover:from-blue-600/95 hover:to-purple-600/95 hover:border-blue-700 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 group"
                >
                  🐕 加入 Vibe 生态
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  variant="outline"
                  size="lg"
                  className="backdrop-blur-md bg-white/75 border-2 border-gray-600/90 text-gray-900 hover:bg-white/85 hover:border-gray-700/95 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  🐾 探索 Vibe Coding
                </Button>
              </Link>
            </div>
            
            <p className="text-gray-600 mt-6 text-sm">
              🐕 感受 Vibe Coding 时代的创新魅力，开启数字资产新纪元
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;