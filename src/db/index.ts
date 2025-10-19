import { Dexie, type Table } from 'dexie';
import type { ConversationProps } from '@/components/ConversationList';
import type { ProviderProps } from '@/components/ProviderSelect';

// 消息类型
export interface Message {
    id?: number;
    conversationId: number;
    role: 'user' | 'assistant' | 'system';
    content: string;
    type: 'question' | 'answer';
    status?: 'loading' | 'success' | 'error';
    createdAt: string;
    updatedAt?: string;
}

// 数据库类
export class ChatDatabase extends Dexie {
    // 定义表
    conversations!: Table<ConversationProps>;
    providers!: Table<ProviderProps>;
    messages!: Table<Message>;

    constructor() {
        super('ChatAppDB');

        // 定义数据库版本和表结构
        this.version(1).stores({
            conversations: '++id, title, selectedModel, createdAt, updatedAt, providerId',
            providers: '++id, name, title, createdAt, updatedAt',
            messages: '++id, conversationId, role, type, status, createdAt'
        });
    }
}

// 创建数据库实例
export const db = new ChatDatabase();

// 数据库操作辅助函数
export const dbHelpers = {
    // Conversations
    async getAllConversations() {
        return await db.conversations.orderBy('updatedAt').reverse().toArray();
    },

    async getConversation(id: number) {
        return await db.conversations.get(id);
    },

    async addConversation(conversation: Omit<ConversationProps, 'id'>) {
        return await db.conversations.add(conversation as ConversationProps);
    },

    async updateConversation(id: number, changes: Partial<ConversationProps>) {
        return await db.conversations.update(id, changes);
    },

    async deleteConversation(id: number) {
        // 删除会话时也删除相关消息
        await db.messages.where('conversationId').equals(id).delete();
        return await db.conversations.delete(id);
    },

    // Providers
    async getAllProviders() {
        return await db.providers.toArray();
    },

    async getProvider(id: number) {
        return await db.providers.get(id);
    },

    async addProvider(provider: Omit<ProviderProps, 'id'>) {
        return await db.providers.add(provider as ProviderProps);
    },

    async updateProvider(id: number, changes: Partial<ProviderProps>) {
        return await db.providers.update(id, changes);
    },

    async deleteProvider(id: number) {
        return await db.providers.delete(id);
    },

    // Messages
    async getMessagesByConversation(conversationId: number) {
        return await db.messages
            .where('conversationId')
            .equals(conversationId)
            .sortBy('createdAt');
    },

    async addMessage(message: Omit<Message, 'id'>) {
        return await db.messages.add(message as Message);
    },

    async updateMessage(id: number, changes: Partial<Message>) {
        return await db.messages.update(id, changes);
    },

    async deleteMessage(id: number) {
        return await db.messages.delete(id);
    },

    // 工具方法
    async clearAllData() {
        await db.conversations.clear();
        await db.providers.clear();
        await db.messages.clear();
    },

    async initializeDefaultData() {
        // 检查是否已有数据
        const providerCount = await db.providers.count();
        if (providerCount === 0) {
            // 添加默认 Providers
            await db.providers.bulkAdd([
                {
                    id: 1,
                    name: 'openai',
                    title: 'OpenAI',
                    desc: 'OpenAI 提供的先进 AI 模型',
                    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=openai',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo']
                },
                {
                    id: 2,
                    name: 'anthropic',
                    title: 'Anthropic',
                    desc: 'Claude 系列模型',
                    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=anthropic',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']
                },
                {
                    id: 3,
                    name: 'google',
                    title: 'Google',
                    desc: 'Google Gemini 模型',
                    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=google',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    models: ['gemini-pro', 'gemini-ultra']
                }
            ]);
        }
    }
};
