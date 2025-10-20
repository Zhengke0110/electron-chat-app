import { Dexie, type Table } from 'dexie';
import type { ConversationProps } from '@/components/ConversationList';
import type { ProviderProps } from '@/components/ProviderSelect';
import type { ModelConfig } from '@/types';

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

// 导出 ModelConfig 类型供其他模块使用
export type { ModelConfig };

// 数据库类
export class ChatDatabase extends Dexie {
    // 定义表
    conversations!: Table<ConversationProps>;
    providers!: Table<ProviderProps>;
    messages!: Table<Message>;
    modelConfigs!: Table<ModelConfig>;

    constructor() {
        super('ChatAppDB');

        // 定义数据库版本和表结构
        this.version(1).stores({
            conversations: '++id, title, selectedModel, createdAt, updatedAt, providerId',
            providers: '++id, name, title, createdAt, updatedAt',
            messages: '++id, conversationId, role, type, status, createdAt'
        });

        // 版本 2: 添加 modelConfigs 表
        this.version(2).stores({
            conversations: '++id, title, selectedModel, createdAt, updatedAt, providerId',
            providers: '++id, name, title, createdAt, updatedAt',
            messages: '++id, conversationId, role, type, status, createdAt',
            modelConfigs: '++id, provider, isDefault, isActive, createdAt, updatedAt'
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

    // ModelConfigs
    async getAllModelConfigs() {
        return await db.modelConfigs.orderBy('createdAt').toArray();
    },

    async getActiveModelConfigs() {
        const allConfigs = await db.modelConfigs.toArray();
        return allConfigs.filter(c => c.isActive === true);
    },

    async getDefaultModelConfig() {
        const allConfigs = await db.modelConfigs.toArray();
        return allConfigs.find(c => c.isDefault === true);
    },

    async getModelConfig(id: number) {
        return await db.modelConfigs.get(id);
    },

    async addModelConfig(config: Omit<ModelConfig, 'id'>) {
        // 如果设置为默认，先取消其他配置的默认状态
        if (config.isDefault) {
            await db.modelConfigs.toCollection().modify({ isDefault: false });
        }
        return await db.modelConfigs.add(config as ModelConfig);
    },

    async updateModelConfig(id: number, changes: Partial<ModelConfig>) {
        // 如果设置为默认，先取消其他配置的默认状态
        if (changes.isDefault) {
            await db.modelConfigs.toCollection().modify({ isDefault: false });
        }
        // 更新 updatedAt
        changes.updatedAt = new Date().toISOString();
        return await db.modelConfigs.update(id, changes);
    },

    async deleteModelConfig(id: number) {
        return await db.modelConfigs.delete(id);
    },

    async setDefaultModelConfig(id: number) {
        // 取消所有配置的默认状态
        await db.modelConfigs.toCollection().modify({ isDefault: false });
        // 设置指定配置为默认
        return await db.modelConfigs.update(id, {
            isDefault: true,
            updatedAt: new Date().toISOString()
        });
    },

    async toggleModelConfigActive(id: number) {
        const config = await db.modelConfigs.get(id);
        if (config) {
            return await db.modelConfigs.update(id, {
                isActive: !config.isActive,
                updatedAt: new Date().toISOString()
            });
        }
    },

    // 工具方法
    async clearAllData() {
        await db.conversations.clear();
        await db.providers.clear();
        await db.messages.clear();
        await db.modelConfigs.clear();
    },

    async initializeDefaultData() {
        // 初始化默认的 DeepSeek 模型配置
        const modelConfigCount = await db.modelConfigs.count();
        if (modelConfigCount === 0) {
            const { DEEPSEEK_DEFAULT_CONFIG } = await import('../constants/providers');
            await db.modelConfigs.add(DEEPSEEK_DEFAULT_CONFIG as ModelConfig);
        }
    }
};
