/**
 * useAIStream - AI 流式响应 Composable
 * 封装 IPC 调用逻辑，提供简洁的 Vue Composition API 接口
 */

import { ref, onUnmounted } from 'vue';
import type { ModelConfig } from '@/types';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface StreamOptions {
    /**
     * 每次接收到新内容时的回调
     */
    onChunk?: (content: string, fullContent: string) => void;

    /**
     * 流式响应完成时的回调
     */
    onDone?: (result: { finishReason?: string; totalTokens?: number }) => void;

    /**
     * 发生错误时的回调
     */
    onError?: (error: { message: string; code?: string }) => void;
}

/**
 * AI 流式响应 Composable
 */
export function useAIStream() {
    // 是否正在流式输出
    const isStreaming = ref(false);

    // 当前流式输出的消息 ID
    const currentMessageId = ref<number | null>(null);

    // 清理函数数组
    const cleanupFunctions: (() => void)[] = [];

    /**
     * 发送流式消息
     */
    const sendStreamMessage = async (
        conversationId: number,
        messageId: number,
        modelConfig: ModelConfig,
        messages: ChatMessage[],
        options: StreamOptions = {}
    ): Promise<void> => {
        // 检查 electronAPI 是否可用
        if (!window.electronAPI?.ai) {
            const error = { message: 'Electron API 不可用', code: 'NO_API' };
            options.onError?.(error);
            throw new Error(error.message);
        }

        // 如果已经有正在进行的流式输出，先取消
        if (currentMessageId.value !== null) {
            cancelStream();
        }

        // 设置状态
        isStreaming.value = true;
        currentMessageId.value = messageId;

        // 累积的完整内容
        let fullContent = '';

        // 监听流式响应块
        const cleanupChunk = window.electronAPI.ai.onStreamChunk((chunk) => {
            // 只处理当前消息的 chunk
            if (chunk.messageId === currentMessageId.value) {
                fullContent += chunk.content;
                options.onChunk?.(chunk.content, fullContent);
            }
        });
        cleanupFunctions.push(cleanupChunk);

        // 监听流式响应完成
        const cleanupDone = window.electronAPI.ai.onStreamDone((done) => {
            // 只处理当前消息的完成事件
            if (done.messageId === currentMessageId.value) {
                isStreaming.value = false;
                currentMessageId.value = null;

                options.onDone?.({
                    finishReason: done.finishReason,
                    totalTokens: done.totalTokens,
                });

                // 清理监听器
                cleanup();
            }
        });
        cleanupFunctions.push(cleanupDone);

        // 监听流式响应错误
        const cleanupError = window.electronAPI.ai.onStreamError((error) => {
            // 只处理当前消息的错误
            if (error.messageId === currentMessageId.value) {
                isStreaming.value = false;
                currentMessageId.value = null;

                options.onError?.({
                    message: error.error,
                    code: error.code,
                });

                // 清理监听器
                cleanup();
            }
        });
        cleanupFunctions.push(cleanupError);

        // 发送消息请求
        try {
            window.electronAPI.ai.sendMessage({
                conversationId,
                messageId,
                modelConfig: {
                    provider: modelConfig.provider,
                    apiKey: modelConfig.apiKey,
                    baseUrl: modelConfig.baseUrl,
                    model: modelConfig.model,
                    temperature: modelConfig.temperature ?? 0.7,
                    maxTokens: modelConfig.maxTokens ?? 2000,
                },
                messages,
            });
        } catch (error) {
            isStreaming.value = false;
            currentMessageId.value = null;
            cleanup();
            throw error;
        }
    };

    /**
     * 取消当前的流式输出
     */
    const cancelStream = () => {
        if (currentMessageId.value !== null && window.electronAPI?.ai) {
            window.electronAPI.ai.cancelStream(currentMessageId.value);
            isStreaming.value = false;
            currentMessageId.value = null;
            cleanup();
        }
    };

    /**
     * 测试连接
     */
    const testConnection = async (
        modelConfig: ModelConfig,
        onResult: (result: { success: boolean; message: string; responseTime?: number; error?: string }) => void
    ): Promise<void> => {
        if (!window.electronAPI?.ai) {
            onResult({
                success: false,
                message: 'Electron API 不可用',
                error: 'NO_API',
            });
            return;
        }

        // 生成唯一的请求 ID（字符串类型）
        const requestId = `test-${Date.now()}`;

        // 监听测试结果
        const cleanupTest = window.electronAPI.ai.onTestResult((result) => {
            if (result.requestId === requestId) {
                onResult({
                    success: result.success,
                    message: result.message,
                    responseTime: result.responseTime,
                    error: result.error,
                });

                // 清理监听器
                cleanupTest();
            }
        });

        // 发送测试请求
        window.electronAPI.ai.testConnection({
            requestId,
            modelConfig: {
                provider: modelConfig.provider,
                apiKey: modelConfig.apiKey,
                baseUrl: modelConfig.baseUrl,
                model: modelConfig.model,
                temperature: modelConfig.temperature ?? 0.7,
                maxTokens: modelConfig.maxTokens ?? 2000,
            },
        });
    };

    /**
     * 清理所有监听器
     */
    const cleanup = () => {
        cleanupFunctions.forEach(fn => fn());
        cleanupFunctions.length = 0;
    };

    // 组件卸载时自动清理
    onUnmounted(() => {
        cancelStream();
        cleanup();
    });

    return {
        // 状态
        isStreaming,
        currentMessageId,

        // 方法
        sendStreamMessage,
        cancelStream,
        testConnection,
    };
}
