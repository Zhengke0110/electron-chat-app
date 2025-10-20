import { defineStore } from 'pinia';
import { ref } from 'vue';
import { dbHelpers, type Message, type ModelConfig } from '../db';
import type { ConversationProps } from '@/components/ConversationList';
import type { ProviderProps } from '@/components/ProviderSelect';

export const useDbStore = defineStore('db', () => {
    // State
    const conversations = ref<ConversationProps[]>([]);
    const providers = ref<ProviderProps[]>([]);
    const currentConversationMessages = ref<Message[]>([]);
    const modelConfigs = ref<ModelConfig[]>([]);
    const isLoading = ref(false);

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
        } catch (error) {
            console.error('删除会话失败:', error);
            throw error;
        }
    };

    // Actions - Providers
    const loadProviders = async () => {
        isLoading.value = true;
        try {
            providers.value = await dbHelpers.getAllProviders();
        } catch (error) {
            console.error('加载 Providers 失败:', error);
        } finally {
            isLoading.value = false;
        }
    };

    // Actions - Messages
    const loadMessages = async (conversationId: number) => {
        isLoading.value = true;
        try {
            currentConversationMessages.value = await dbHelpers.getMessagesByConversation(conversationId);
        } catch (error) {
            console.error('加载消息失败:', error);
        } finally {
            isLoading.value = false;
        }
    };

    const addMessage = async (message: Omit<Message, 'id'>) => {
        try {
            const id = await dbHelpers.addMessage(message);
            // 重新加载当前会话的消息
            if (message.conversationId) {
                await loadMessages(message.conversationId);
            }
            return id;
        } catch (error) {
            console.error('添加消息失败:', error);
            throw error;
        }
    };

    const getMessagesByConversation = async (conversationId: number) => {
        try {
            return await dbHelpers.getMessagesByConversation(conversationId);
        } catch (error) {
            console.error('获取消息失败:', error);
            throw error;
        }
    };

    const updateMessage = async (id: number, changes: Partial<Message>) => {
        try {
            await dbHelpers.updateMessage(id, changes);
            // 如果有当前会话，重新加载消息
            if (currentConversationMessages.value.length > 0) {
                const conversationId = currentConversationMessages.value[0]?.conversationId;
                if (conversationId) {
                    await loadMessages(conversationId);
                }
            }
        } catch (error) {
            console.error('更新消息失败:', error);
            throw error;
        }
    };

    // 初始化
    const initialize = async () => {
        await dbHelpers.initializeDefaultData();
        await loadConversations();
        await loadProviders();
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

    const getActiveModelConfigs = async () => {
        try {
            return await dbHelpers.getActiveModelConfigs();
        } catch (error) {
            console.error('获取激活的模型配置失败:', error);
            return [];
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
        providers,
        currentConversationMessages,
        modelConfigs,
        isLoading,

        // Actions
        loadConversations,
        createConversation,
        updateConversation,
        deleteConversation,
        loadProviders,
        loadMessages,
        addMessage,
        getMessagesByConversation,
        updateMessage,
        initialize,

        // ModelConfigs Actions
        loadModelConfigs,
        getActiveModelConfigs,
        getDefaultModelConfig,
        createModelConfig,
        updateModelConfig,
        deleteModelConfig,
        setDefaultModelConfig,
        toggleModelConfigActive,
    };
});
