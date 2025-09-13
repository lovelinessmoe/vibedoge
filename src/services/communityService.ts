// 社区API服务
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Message {
    id: string;
    username: string;
    content: string;
    timestamp: Date;
    likes: number;
    replies: number;
    likedBy?: string[];
}

export interface Topic {
    id: string;
    title: string;
    description: string;
    messages: number;
    participants: number;
    lastActivity: Date;
    trending: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

export interface MessagesResponse {
    messages: Message[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalMessages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

class CommunityService {
    private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
        try {
            const url = `${API_BASE_URL}/api/community${endpoint}`;
            console.log('发起API请求:', url);
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
                ...options,
            });

            console.log('API响应状态:', response.status);
            const data = await response.json();
            console.log('API响应数据:', data);
            
            // 转换日期字符串为Date对象
            if (data.success && data.data) {
                if (Array.isArray(data.data)) {
                    data.data = data.data.map(this.transformDates);
                } else if (data.data.messages) {
                    data.data.messages = data.data.messages.map(this.transformDates);
                } else {
                    data.data = this.transformDates(data.data);
                }
            }

            return data;
        } catch (error) {
            console.error('API请求失败:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '网络请求失败'
            };
        }
    }

    private transformDates(item: any): any {
        if (item.timestamp) {
            item.timestamp = new Date(item.timestamp);
        }
        if (item.lastActivity) {
            item.lastActivity = new Date(item.lastActivity);
        }
        return item;
    }

    // 获取留言列表
    async getMessages(page: number = 1, limit: number = 10): Promise<ApiResponse<MessagesResponse>> {
        return this.request<MessagesResponse>(`/messages?page=${page}&limit=${limit}`);
    }

    // 发送新留言
    async postMessage(username: string, content: string): Promise<ApiResponse<Message>> {
        return this.request<Message>('/messages', {
            method: 'POST',
            body: JSON.stringify({ username, content }),
        });
    }

    // 点赞留言
    async likeMessage(messageId: string, username: string): Promise<ApiResponse<{ messageId: string; likes: number; hasLiked: boolean }>> {
        return this.request<{ messageId: string; likes: number; hasLiked: boolean }>(`/messages/${messageId}/like`, {
            method: 'POST',
            body: JSON.stringify({ username }),
        });
    }

    // 获取话题列表
    async getTopics(trending?: boolean): Promise<ApiResponse<Topic[]>> {
        const query = trending ? '?trending=true' : '';
        return this.request<Topic[]>(`/topics${query}`);
    }

    // 获取话题详情
    async getTopic(topicId: string): Promise<ApiResponse<Topic>> {
        return this.request<Topic>(`/topics/${topicId}`);
    }

    // 创建新话题
    async createTopic(title: string, description: string): Promise<ApiResponse<Topic>> {
        return this.request<Topic>('/topics', {
            method: 'POST',
            body: JSON.stringify({ title, description }),
        });
    }
}

export const communityService = new CommunityService();