import { defineStore } from 'pinia';
import { ref } from 'vue';
import { dbHelpers, type Message, type ModelConfig } from '../db';
import type { ConversationProps } from '@/components/ConversationList';

export const useDbStore = defineStore('db', () => {
    // State
    const conversations = ref<ConversationProps[]>([]);
    const modelConfigs = ref<ModelConfig[]>([]);
    const isLoading = ref(false);

    // ✨ 消息管理状态
    const currentConversationId = ref<number | null>(null);
    const currentMessages = ref<Message[]>([]);

    // Actions - Conversations
    const loadConversations = async () => {
        isLoading.value = true;
        try {
            conversations.value = await dbHelpers.getAllConversations();
        } catch (error) {
            console.error('加载会话失败:', error);
        } finally {
            isLoading.value = false;
        }
    };

    const createConversation = async (conversation: Omit<ConversationProps, 'id'>) => {
        try {
            const id = await dbHelpers.addConversation(conversation);
            await loadConversations();
            return id;
        } catch (error) {
            console.error('创建会话失败:', error);
            throw error;
        }
    };

    const updateConversation = async (id: number, changes: Partial<ConversationProps>) => {
        try {
            await dbHelpers.updateConversation(id, changes);
            await loadConversations();
        } catch (error) {
            console.error('更新会话失败:', error);
            throw error;
        }
    };

    const deleteConversation = async (id: number) => {
        try {
            await dbHelpers.deleteConversation(id);
            await loadConversations();

            // 如果删除的是当前会话，清空消息列表
            if (currentConversationId.value === id) {
                currentConversationId.value = null;
                currentMessages.value = [];
            }
        } catch (error) {
            console.error('删除会话失败:', error);
            throw error;
        }
    };

    // ✨ Actions - Messages（优化后的消息管理）
    const loadConversationMessages = async (conversationId: number) => {
        isLoading.value = true;
        try {
            currentConversationId.value = conversationId;
            currentMessages.value = await dbHelpers.getMessagesByConversation(conversationId);
        } catch (error) {
            console.error('加载消息失败:', error);
        } finally {
            isLoading.value = false;
        }
    };

    const addMessageToConversation = async (message: Omit<Message, 'id'>) => {
        try {
            const id = await dbHelpers.addMessage(message);

            // 如果是当前会话，自动更新消息列表
            if (message.conversationId === currentConversationId.value) {
                await loadConversationMessages(message.conversationId);
            }

            return id;
        } catch (error) {
            console.error('添加消息失败:', error);
            throw error;
        }
    };

    const updateMessageInConversation = async (id: number, changes: Partial<Message>) => {
        try {
            // 更新数据库
            await dbHelpers.updateMessage(id, changes);

            // 本地更新消息（避免重新加载数据库，优化流式更新性能）
            const msg = currentMessages.value.find(m => m.id === id);
            if (msg) {
                Object.assign(msg, changes);
            }
        } catch (error) {
            console.error('更新消息失败:', error);
            throw error;
        }
    };

    // 初始化
    const initialize = async () => {
        await loadConversations();
        await loadModelConfigs();
    };

    // Actions - ModelConfigs
    const loadModelConfigs = async () => {
        isLoading.value = true;
        try {
            modelConfigs.value = await dbHelpers.getAllModelConfigs();
        } catch (error) {
            console.error('加载模型配置失败:', error);
        } finally {
            isLoading.value = false;
        }
    };

    const getDefaultModelConfig = async () => {
        try {
            return await dbHelpers.getDefaultModelConfig();
        } catch (error) {
            console.error('获取默认模型配置失败:', error);
            return null;
        }
    };

    const createModelConfig = async (config: Omit<ModelConfig, 'id'>) => {
        try {
            const id = await dbHelpers.addModelConfig(config);
            await loadModelConfigs();
            return id;
        } catch (error) {
            console.error('创建模型配置失败:', error);
            throw error;
        }
    };

    const updateModelConfig = async (id: number, changes: Partial<ModelConfig>) => {
        try {
            await dbHelpers.updateModelConfig(id, changes);
            await loadModelConfigs();
        } catch (error) {
            console.error('更新模型配置失败:', error);
            throw error;
        }
    };

    const deleteModelConfig = async (id: number) => {
        try {
            await dbHelpers.deleteModelConfig(id);
            await loadModelConfigs();
        } catch (error) {
            console.error('删除模型配置失败:', error);
            throw error;
        }
    };

    const setDefaultModelConfig = async (id: number) => {
        try {
            await dbHelpers.setDefaultModelConfig(id);
            await loadModelConfigs();
        } catch (error) {
            console.error('设置默认模型配置失败:', error);
            throw error;
        }
    };

    const toggleModelConfigActive = async (id: number) => {
        try {
            await dbHelpers.toggleModelConfigActive(id);
            await loadModelConfigs();
        } catch (error) {
            console.error('切换模型配置激活状态失败:', error);
            throw error;
        }
    };

    return {
        // State
        conversations,
        modelConfigs,
        isLoading,

        // ✨ 消息状态
        currentConversationId,
        currentMessages,

        // Conversation Actions
        loadConversations,
        createConversation,
        updateConversation,
        deleteConversation,

        // ✨ Message Actions（优化后）
        loadConversationMessages,
        addMessageToConversation,
        updateMessageInConversation,

        // Initialize
        initialize,

        // ModelConfig Actions
        loadModelConfigs,
        getDefaultModelConfig,
        createModelConfig,
        updateModelConfig,
        deleteModelConfig,
        setDefaultModelConfig,
        toggleModelConfigActive,
    };
});