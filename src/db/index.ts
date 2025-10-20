import { Dexie, type Table } from 'dexie';
import type { ConversationProps } from '@/components/ConversationList';
import type { ModelConfig } from '@/types';

// 图片附件类型
export interface ImageAttachment {
    id: string;                    // 附件唯一标识
    fileName: string;              // 文件名
    filePath: string;              // 本地文件路径
    fileUrl: string;               // 可访问的 URL（file:// 或 http://）
    mimeType: string;              // MIME 类型（如 image/jpeg）
    fileSize: number;              // 文件大小（字节）
    width?: number;                // 图片宽度
    height?: number;               // 图片高度
    thumbnail?: string;            // 缩略图（可选）
    uploadedAt: string;            // 上传时间
}

// 消息类型
export interface Message {
    id?: number;
    conversationId: number;
    role: 'user' | 'assistant' | 'system';
    content: string;
    type: 'question' | 'answer' | 'image_description';  // 新增 image_description 类型
    status?: 'loading' | 'success' | 'error';
    imageAttachments?: ImageAttachment[];  // 图片附件数组
    metadata?: {                           // 元数据（用于存储额外信息）
        visionModel?: string;              // 使用的视觉模型
        analysisTime?: number;             // 分析耗时（ms）
        [key: string]: string | number | boolean | undefined;
    };
    createdAt: string;
    updatedAt?: string;
}

// 导出 ModelConfig 类型供其他模块使用
export type { ModelConfig };

// 数据库类
export class ChatDatabase extends Dexie {
    // 定义表
    conversations!: Table<ConversationProps>;
    messages!: Table<Message>;
    modelConfigs!: Table<ModelConfig>;

    constructor() {
        super('ChatAppDB');

        // 版本 1: 初始版本
        this.version(1).stores({
            conversations: '++id, title, selectedModel, createdAt, updatedAt, providerId',
            messages: '++id, conversationId, role, type, status, createdAt',
            modelConfigs: '++id, provider, isDefault, isActive, createdAt, updatedAt'
        });

        // 版本 2: 添加 modelType 字段
        this.version(2).stores({
            conversations: '++id, title, selectedModel, createdAt, updatedAt, providerId',
            messages: '++id, conversationId, role, type, status, createdAt',
            modelConfigs: '++id, provider, modelType, isDefault, isActive, createdAt, updatedAt'
        }).upgrade(async (trans) => {
            // 数据迁移：为现有配置添加 modelType = 'chat'
            const configs = await trans.table('modelConfigs').toArray();
            for (const config of configs) {
                await trans.table('modelConfigs').update(config.id, {
                    modelType: 'chat'
                });
            }
        });

        // 版本 3: 消息表添加图片附件支持
        // 注意：Dexie 不需要为 JSON 字段添加索引，imageAttachments 和 metadata 会自动存储
        this.version(3).stores({
            conversations: '++id, title, selectedModel, createdAt, updatedAt, providerId',
            messages: '++id, conversationId, role, type, status, createdAt',
            modelConfigs: '++id, provider, modelType, isDefault, isActive, createdAt, updatedAt'
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

    async getDefaultModelConfig(modelType: 'chat' | 'vision' = 'chat') {
        const allConfigs = await db.modelConfigs.toArray();
        return allConfigs.find(c => c.isDefault === true && c.modelType === modelType);
    },

    async getModelConfigsByType(modelType: 'chat' | 'vision') {
        const allConfigs = await db.modelConfigs.toArray();
        return allConfigs.filter(c => c.modelType === modelType);
    },

    async getModelConfig(id: number) {
        return await db.modelConfigs.get(id);
    },

    async addModelConfig(config: Omit<ModelConfig, 'id'>) {
        // 如果设置为默认，先取消同类型其他配置的默认状态
        if (config.isDefault) {
            const allConfigs = await db.modelConfigs.toArray();
            const sameTypeConfigs = allConfigs.filter(c => c.modelType === config.modelType);
            for (const c of sameTypeConfigs) {
                if (c.id) {
                    await db.modelConfigs.update(c.id, { isDefault: false });
                }
            }
        }
        return await db.modelConfigs.add(config as ModelConfig);
    },

    async updateModelConfig(id: number, changes: Partial<ModelConfig>) {
        // 如果设置为默认，先取消同类型其他配置的默认状态
        if (changes.isDefault) {
            const config = await db.modelConfigs.get(id);
            if (config) {
                const allConfigs = await db.modelConfigs.toArray();
                const sameTypeConfigs = allConfigs.filter(c => c.modelType === config.modelType && c.id !== id);
                for (const c of sameTypeConfigs) {
                    if (c.id) {
                        await db.modelConfigs.update(c.id, { isDefault: false });
                    }
                }
            }
        }
        // 更新 updatedAt
        changes.updatedAt = new Date().toISOString();
        return await db.modelConfigs.update(id, changes);
    },

    async deleteModelConfig(id: number) {
        return await db.modelConfigs.delete(id);
    },

    async setDefaultModelConfig(id: number) {
        const config = await db.modelConfigs.get(id);
        if (config) {
            // 取消同类型所有配置的默认状态
            const allConfigs = await db.modelConfigs.toArray();
            const sameTypeConfigs = allConfigs.filter(c => c.modelType === config.modelType && c.id !== id);
            for (const c of sameTypeConfigs) {
                if (c.id) {
                    await db.modelConfigs.update(c.id, { isDefault: false });
                }
            }
            // 设置指定配置为默认
            return await db.modelConfigs.update(id, {
                isDefault: true,
                updatedAt: new Date().toISOString()
            });
        }
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
