<template>
    <div class="h-full flex flex-col bg-gray-50">
        <!-- 聊天头部 -->
        <div class="border-b bg-white px-6 py-4">
            <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold text-gray-800">
                    {{ conversationId ? `会话 #${conversationId}` : '新对话' }}
                </h2>

                <!-- 模型选择器 -->
                <ModelSelector v-model="selectedModelId" :configs="modelConfigs" @change="handleModelChange" />
            </div>
        </div>

        <!-- 消息列表区域 -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto px-6 py-4">
            <div v-if="currentMessages.length === 0" class="h-full flex items-center justify-center text-gray-400">
                暂无消息
            </div>
            <div v-else class="space-y-4 max-w-4xl mx-auto">
                <div v-for="msg in currentMessages" :key="msg.id" class="flex"
                    :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
                    <div class="max-w-[70%] px-4 py-3 rounded-lg"
                        :class="msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200'">
                        <!-- 如果是 loading 状态且没有内容，显示加载动画 -->
                        <div v-if="msg.status === 'loading' && !msg.content" class="flex items-center gap-2">
                            <span class="text-gray-500">正在生成回答...</span>
                            <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        </div>
                        <!-- 显示内容 -->
                        <div v-else>
                            <!-- 用户消息：纯文本显示 -->
                            <div v-if="msg.role === 'user'" class="whitespace-pre-wrap">
                                {{ msg.content }}
                            </div>
                            <!-- AI 消息：Markdown 渲染 -->
                            <div v-else>
                                <MarkdownRenderer :content="msg.content" />
                                <!-- 打字机光标效果：只在正在流式输出时显示 -->
                                <span v-if="isStreaming && msg.status === 'loading'"
                                    class="inline-block w-0.5 h-4 bg-gray-600 ml-0.5 animate-pulse"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 消息输入区域 -->
        <div class="border-t bg-white px-6 py-4">
            <MessageInput v-model="userInput" placeholder="输入消息..." @create="handleSendMessage" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import MessageInput from '@/components/MessageInput';
import ModelSelector from '@/components/ModelSelector';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { useDbStore } from '@/store/db';
import { useAIStream } from '@/composables';
import type { ModelConfig } from '@/types';

const route = useRoute();
const router = useRouter();
const dbStore = useDbStore();

// 使用 AI Stream composable
const { isStreaming, sendStreamMessage, cancelStream } = useAIStream();

const conversationId = ref<number | null>(null);
const userInput = ref('');
const selectedModelId = ref<number | undefined>(undefined);
const messagesContainer = ref<HTMLElement | null>(null); // 消息容器引用

// ✨ 从 store 获取响应式数据
const { modelConfigs, currentMessages } = storeToRefs(dbStore);

// 自动滚动到底部
const scrollToBottom = () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    });
};

// 使用 nextTick 确保 DOM 更新后滚动
const scrollToBottomSmooth = () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTo({
                top: messagesContainer.value.scrollHeight,
                behavior: 'smooth'
            });
        }
    });
};

// 初始化模型选择
const initializeModelSelection = async () => {
    // 加载模型配置
    await dbStore.loadModelConfigs();

    // 检查是否有可用的模型配置
    const activeConfigs = modelConfigs.value.filter(c => c.isActive);

    if (activeConfigs.length === 0) {
        // 没有可用模型,引导用户去配置
        const goToSettings = confirm(
            '⚠️ 未找到可用的模型配置\n\n' +
            '您需要先配置至少一个 AI 模型才能开始聊天。\n\n' +
            '是否现在前往设置页面进行配置？'
        );

        if (goToSettings) {
            router.push('/settings');
        }
        return false;
    }

    // 如果还没有选中模型，设置默认模型
    if (!selectedModelId.value) {
        const defaultConfig = await dbStore.getDefaultModelConfig();
        if (defaultConfig?.id) {
            selectedModelId.value = defaultConfig.id;
        } else if (activeConfigs.length > 0) {
            // 如果没有默认模型,但有可用模型,选择第一个
            selectedModelId.value = activeConfigs[0].id;
        }
    }

    return true;
};

// 初始化：加载模型配置和设置默认模型
onMounted(async () => {
    await initializeModelSelection();

    // 注意: loadConversation 会在 watch 的 immediate: true 中自动调用
});

// 处理模型切换
const handleModelChange = (config: ModelConfig) => {
    // 模型切换逻辑
};

// 生成 AI 回答
const generateAIResponse = async (userMessage: string) => {
    if (!conversationId.value || !selectedModelId.value) {
        console.error('无法生成回答：缺少会话ID或模型ID');
        return;
    }

    // 获取当前选中的模型配置
    const modelConfig = modelConfigs.value.find(c => c.id === selectedModelId.value);
    if (!modelConfig) {
        console.error('未找到模型配置');
        return;
    }

    const now = new Date().toISOString();

    // ✨ 创建一条 loading 状态的 answer 消息
    const answerId = await dbStore.addMessageToConversation({
        conversationId: conversationId.value,
        role: 'assistant',
        content: '',
        type: 'answer',
        status: 'loading',
        createdAt: now
    });

    // ✨ 找到刚创建的消息对象（保持引用）
    const streamingMessage = currentMessages.value.find(m => m.id === answerId);

    if (!streamingMessage) {
        console.error('未找到创建的消息');
        return;
    }

    // 滚动到底部
    scrollToBottomSmooth();

    try {
        // 准备消息历史
        const aiMessages = currentMessages.value
            .filter(m => m.id !== answerId && m.status === 'success')
            .map(m => ({
                role: m.role as 'user' | 'assistant' | 'system',
                content: m.content
            }));

        let updateCounter = 0;
        const UPDATE_INTERVAL = 10; // 每10个chunk更新一次数据库

        // 使用 IPC 流式响应
        await sendStreamMessage(
            conversationId.value,
            answerId as number,
            modelConfig,
            aiMessages,
            {
                // 每次接收到新内容
                onChunk: (content, fullContent) => {
                    updateCounter++;

                    // 🎯 直接修改消息对象的属性，Vue 3 会自动追踪
                    streamingMessage.content = fullContent;
                    streamingMessage.updatedAt = new Date().toISOString();

                    // 每次内容更新时滚动到底部
                    scrollToBottom();

                    // 定期更新数据库（减少频繁写入）
                    if (updateCounter % UPDATE_INTERVAL === 0) {
                        dbStore.updateMessageInConversation(answerId as number, {
                            content: fullContent,
                            updatedAt: new Date().toISOString()
                        });
                    }
                },

                // 流式完成
                onDone: async ({ finishReason, totalTokens }) => {
                    console.log('[AI] 流式输出完成, 总字符数:', streamingMessage.content.length);

                    // 最终更新：标记为成功并保存完整内容到数据库
                    streamingMessage.status = 'success';
                    streamingMessage.updatedAt = new Date().toISOString();

                    await dbStore.updateMessageInConversation(answerId as number, {
                        content: streamingMessage.content,
                        status: 'success',
                        updatedAt: new Date().toISOString()
                    });
                },

                // 发生错误
                onError: async ({ message: errorMessage, code }) => {
                    console.error('[AI] 回答生成失败:', errorMessage);

                    const errorText = `生成回答失败: ${errorMessage}`;

                    // 更新本地消息显示错误
                    streamingMessage.content = errorText;
                    streamingMessage.status = 'error';
                    streamingMessage.updatedAt = new Date().toISOString();

                    // 标记为失败
                    await dbStore.updateMessageInConversation(answerId as number, {
                        content: errorText,
                        status: 'error',
                        updatedAt: new Date().toISOString()
                    });
                },
            }
        );
    } catch (error) {
        console.error('[AI] 发送消息异常:', error);

        const errorText = `发送消息失败: ${error instanceof Error ? error.message : String(error)}`;

        // 更新本地消息显示错误
        streamingMessage.content = errorText;
        streamingMessage.status = 'error';
        streamingMessage.updatedAt = new Date().toISOString();

        // 标记为失败
        await dbStore.updateMessageInConversation(answerId as number, {
            content: errorText,
            status: 'error',
            updatedAt: new Date().toISOString()
        });
    }
};

// 从路由获取会话 ID
const loadConversation = async () => {
    const id = route.params.id;

    if (id) {
        conversationId.value = Number(id);

        // 确保模型已初始化
        const hasModel = await initializeModelSelection();
        if (!hasModel) {
            return;
        }

        // ✨ 加载该会话的所有消息
        await dbStore.loadConversationMessages(conversationId.value);

        // 滚动到底部
        scrollToBottomSmooth();

        // 检查是否是新创建的会话（通过 query 参数）
        const query = route.query.q;

        if (query && currentMessages.value.length === 1 && currentMessages.value[0].type === 'question') {
            await generateAIResponse(currentMessages.value[0].content);
        }
    }
};

// 发送消息
const handleSendMessage = async (message: string) => {
    if (!conversationId.value) {
        return;
    }

    // 检查是否选择了模型
    if (!selectedModelId.value) {
        alert('⚠️ 请先选择一个 AI 模型');
        return;
    }

    // 检查选中的模型是否存在且启用
    const selectedConfig = modelConfigs.value.find(c => c.id === selectedModelId.value);
    if (!selectedConfig) {
        alert('⚠️ 选中的模型配置不存在，请重新选择');
        return;
    }

    if (!selectedConfig.isActive) {
        alert('⚠️ 选中的模型已被禁用，请选择其他模型或前往设置页面启用');
        return;
    }

    const now = new Date().toISOString();

    // ✨ 添加用户消息
    await dbStore.addMessageToConversation({
        conversationId: conversationId.value,
        role: 'user',
        content: message,
        type: 'question',
        status: 'success',
        createdAt: now
    });

    // 滚动到底部显示新消息
    scrollToBottomSmooth();

    // 生成 AI 回答
    await generateAIResponse(message);
};

// 监听路由变化
watch(
    () => route.params.id,
    () => {
        loadConversation();
    },
    { immediate: true }
);
</script>
