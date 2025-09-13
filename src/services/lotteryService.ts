// 抽奖API服务
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface LotteryPrize {
    id: string;
    name: string;
    description: string;
    value: number;
    quantity: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface LotteryActivity {
    id: string;
    title: string;
    description: string;
    ticketPrice: number;
    maxTickets: number;
    soldTickets: number;
    startTime: string;
    endTime: string;
    status: 'upcoming' | 'active' | 'ended';
    prizes: LotteryPrize[];
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

export interface UserLotteryRecord {
    lotteryId: string;
    userId: string;
    createdAt: string;
    status: string;
}

class LotteryService {
    private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
        try {
            const url = `${API_BASE_URL}/api/lottery${endpoint}`;
            console.log('发起抽奖API请求:', url);
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
                ...options,
            });

            console.log('抽奖API响应状态:', response.status);
            const data = await response.json();
            console.log('抽奖API响应数据:', data);

            return data;
        } catch (error) {
            console.error('抽奖API请求失败:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '网络请求失败'
            };
        }
    }

    // 生成用户ID
    async generateUserId(): Promise<ApiResponse<{ userId: string; createdAt: string }>> {
        return this.request<{ userId: string; createdAt: string }>('/generate-user-id', {
            method: 'POST',
        });
    }

    // 生成抽奖ID
    async generateLotteryId(userId: string): Promise<ApiResponse<{ lotteryId: string; userId: string; createdAt: string }>> {
        return this.request<{ lotteryId: string; userId: string; createdAt: string }>('/generate-lottery-id', {
            method: 'POST',
            body: JSON.stringify({ userId }),
        });
    }

    // 获取用户抽奖记录
    async getUserLotteries(userId: string): Promise<ApiResponse<{ userId: string; lotteries: UserLotteryRecord[]; total: number }>> {
        return this.request<{ userId: string; lotteries: UserLotteryRecord[]; total: number }>(`/user-lotteries/${userId}`);
    }

    // 获取抽奖信息
    async getLotteryInfo(lotteryId: string): Promise<ApiResponse<any>> {
        return this.request<any>(`/info/${lotteryId}`);
    }

    // 获取抽奖活动列表（使用模拟数据，因为API暂时没有这个端点）
    async getLotteryActivities(): Promise<ApiResponse<LotteryActivity[]>> {
        // 返回模拟数据，直到API支持这个功能
        const mockActivities: LotteryActivity[] = [
            {
                id: '1',
                title: 'Vibe Coding 新年抽奖',
                description: '庆祝Vibe Coding平台上线，参与抽奖赢取丰厚奖励！',
                ticketPrice: 5,
                maxTickets: 1000,
                soldTickets: 756,
                startTime: '2024-01-01T00:00:00Z',
                endTime: '2024-01-31T23:59:59Z',
                status: 'active',
                prizes: [
                    {
                        id: '1',
                        name: '1000 VIBE代币',
                        description: '价值1250美元的VIBE代币',
                        value: 1250,
                        quantity: 1,
                        rarity: 'legendary'
                    },
                    {
                        id: '2',
                        name: '500 VIBE代币',
                        description: '价值625美元的VIBE代币',
                        value: 625,
                        quantity: 2,
                        rarity: 'epic'
                    },
                    {
                        id: '3',
                        name: '100 VIBE代币',
                        description: '价值125美元的VIBE代币',
                        value: 125,
                        quantity: 5,
                        rarity: 'rare'
                    },
                    {
                        id: '4',
                        name: '10 VIBE代币',
                        description: '价值12.5美元的VIBE代币',
                        value: 12.5,
                        quantity: 20,
                        rarity: 'common'
                    }
                ]
            },
            {
                id: '2',
                title: 'AI编程助手体验抽奖',
                description: '体验最新AI编程助手，参与抽奖获得免费使用权限！',
                ticketPrice: 3,
                maxTickets: 500,
                soldTickets: 234,
                startTime: '2024-02-01T00:00:00Z',
                endTime: '2024-02-28T23:59:59Z',
                status: 'upcoming',
                prizes: [
                    {
                        id: '2',
                        name: '500 VIBE代币',
                        description: '价值625美元的VIBE代币',
                        value: 625,
                        quantity: 2,
                        rarity: 'epic'
                    },
                    {
                        id: '3',
                        name: '100 VIBE代币',
                        description: '价值125美元的VIBE代币',
                        value: 125,
                        quantity: 5,
                        rarity: 'rare'
                    },
                    {
                        id: '4',
                        name: '10 VIBE代币',
                        description: '价值12.5美元的VIBE代币',
                        value: 12.5,
                        quantity: 20,
                        rarity: 'common'
                    }
                ]
            }
        ];

        return {
            success: true,
            data: mockActivities,
            message: '获取抽奖活动成功'
        };
    }

    // 获取随机抽奖结果
    getRandomLotteryResult(prizes: LotteryPrize[]): LotteryPrize {
        const weights = {
            legendary: 1,
            epic: 5,
            rare: 15,
            common: 79
        };
        
        const random = Math.random() * 100;
        let cumulative = 0;
        
        for (const [rarity, weight] of Object.entries(weights)) {
            cumulative += weight;
            if (random <= cumulative) {
                const availablePrizes = prizes.filter(p => p.rarity === rarity && p.quantity > 0);
                if (availablePrizes.length > 0) {
                    return availablePrizes[Math.floor(Math.random() * availablePrizes.length)];
                }
            }
        }
        
        // 如果没有找到合适的奖品，返回最常见的奖品
        const commonPrizes = prizes.filter(p => p.rarity === 'common' && p.quantity > 0);
        return commonPrizes[Math.floor(Math.random() * commonPrizes.length)] || prizes[0];
    }
}

export const lotteryService = new LotteryService();