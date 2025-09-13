import { create } from 'zustand';
import { User, Product, LotteryActivity, MarketOverview } from '../types';
import { mcpService, MCPUser, getMCPUserId, restoreMCPUser } from '../services/mcpService';

// 用户状态
interface UserState {
  user: User | null;
  mcpUser: MCPUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  initializeMCPUser: () => Promise<void>;
  login: (user: User) => void;
  logout: () => void;
  updateUserActivity: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  mcpUser: null,
  isAuthenticated: false,
  isInitialized: false,
  
  // 初始化MCP用户
  initializeMCPUser: async () => {
    try {
      // 首先尝试恢复现有用户
      let mcpUser = restoreMCPUser();
      
      if (!mcpUser) {
        // 如果没有现有用户，生成新的
        mcpUser = await getMCPUserId();
      }
      
      // 创建对应的User对象
      const user: User = {
        id: mcpUser.id,
        username: `User_${mcpUser.id.split('_').pop()}`,
        email: `${mcpUser.id}@mcp.local`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mcpUser.id}`,
        createdAt: mcpUser.createdAt,
        updatedAt: mcpUser.lastActiveAt
      };
      
      set({ 
        mcpUser, 
        user, 
        isAuthenticated: true, 
        isInitialized: true 
      });
      
      console.log('MCP User initialized:', mcpUser.id);
    } catch (error) {
      console.error('Failed to initialize MCP user:', error);
      set({ isInitialized: true });
    }
  },
  
  login: (user) => set({ user, isAuthenticated: true }),
  
  logout: () => {
    mcpService.clearSession();
    set({ user: null, mcpUser: null, isAuthenticated: false });
  },
  
  // 更新用户活跃状态
  updateUserActivity: () => {
    const { mcpUser } = get();
    if (mcpUser) {
      mcpService.heartbeat();
    }
  }
}));

// 市场数据状态
interface MarketState {
  products: Product[];
  marketOverview: MarketOverview | null;
  selectedProduct: Product | null;
  setProducts: (products: Product[]) => void;
  setMarketOverview: (overview: MarketOverview) => void;
  setSelectedProduct: (product: Product | null) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  products: [],
  marketOverview: null,
  selectedProduct: null,
  setProducts: (products) => set({ products }),
  setMarketOverview: (marketOverview) => set({ marketOverview }),
  setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
}));

// 抽奖状态
interface LotteryState {
  activities: LotteryActivity[];
  currentActivity: LotteryActivity | null;
  isDrawing: boolean;
  setActivities: (activities: LotteryActivity[]) => void;
  setCurrentActivity: (activity: LotteryActivity | null) => void;
  setIsDrawing: (isDrawing: boolean) => void;
}

export const useLotteryStore = create<LotteryState>((set) => ({
  activities: [],
  currentActivity: null,
  isDrawing: false,
  setActivities: (activities) => set({ activities }),
  setCurrentActivity: (currentActivity) => set({ currentActivity }),
  setIsDrawing: (isDrawing) => set({ isDrawing }),
}));

// UI状态
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  theme: 'light',
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setTheme: (theme) => set({ theme }),
}));

// 留言板状态 - 使用社区API
import { communityService } from '../services/communityService';

interface MessageBoardMessage {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

interface MessageBoardState {
  messages: MessageBoardMessage[];
  isLoading: boolean;
  newMessageCount: number;
  addMessage: (content: string, user: User) => Promise<void>;
  likeMessage: (messageId: string, user: User) => Promise<void>;
  loadMessages: () => Promise<void>;
  clearNewMessageCount: () => void;
}

export const useMessageBoardStore = create<MessageBoardState>((set) => ({
  messages: [],
  isLoading: false,
  newMessageCount: 0,
  
  addMessage: async (content: string, user: User) => {
    try {
      const response = await communityService.postMessage(user.username, content);
      if (response.success && response.data) {
        const newMessage: MessageBoardMessage = {
          id: response.data.id,
          userId: user.id,
          username: response.data.username,
          avatar: user.avatar,
          content: response.data.content,
          timestamp: response.data.timestamp.toISOString(),
          likes: response.data.likes,
          isLiked: false
        };
        
        set((state) => ({
          messages: [newMessage, ...state.messages].slice(0, 100),
          newMessageCount: state.newMessageCount + 1
        }));
      }
    } catch (error) {
      console.error('发送留言失败:', error);
    }
  },
  
  likeMessage: async (messageId: string, user: User) => {
    try {
      const response = await communityService.likeMessage(messageId, user.username);
      if (response.success && response.data) {
        set((state) => ({
          messages: state.messages.map(msg => 
            msg.id === messageId 
              ? { 
                  ...msg, 
                  likes: response.data!.likes,
                  isLiked: response.data!.hasLiked
                }
              : msg
          )
        }));
      }
    } catch (error) {
      console.error('点赞失败:', error);
    }
  },
  
  loadMessages: async () => {
    set({ isLoading: true });
    try {
      const response = await communityService.getMessages(1, 20);
      if (response.success && response.data) {
        const messages: MessageBoardMessage[] = response.data.messages.map(msg => ({
          id: msg.id,
          userId: msg.id, // 使用消息ID作为用户ID的占位符
          username: msg.username,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.username}`,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          likes: msg.likes,
          isLiked: false // 默认未点赞，实际应该检查用户是否已点赞
        }));
        
        set({ messages, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('加载留言失败:', error);
      set({ isLoading: false });
    }
  },
  
  clearNewMessageCount: () => set({ newMessageCount: 0 })
}));