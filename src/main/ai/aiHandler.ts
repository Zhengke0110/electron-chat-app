/**
 * AI Handler - 主进程 AI 处理器
 * 负责处理所有 AI API 调用和流式响应
 */

import { ipcMain, BrowserWindow } from 'electron';
import OpenAI from 'openai';
import {
    IPC_CHANNELS,
    type AIMessageRequest,
    type AIStreamChunk,
    type AIStreamDone,
    type AIStreamError,
    type AITestConnectionRequest,
    type AITestConnectionResult,
} from '../ipc/channels';

/**
 * AI 处理器类
 */
export class AIHandler {
    // 存储活动的流式传输，用于取消操作
    private activeStreams = new Map<number, AbortController>();

    // 主窗口引用
    private mainWindow: BrowserWindow;

    constructor(mainWindow: BrowserWindow) {
        this.mainWindow = mainWindow;
        this.setupIpcHandlers();
    }

    /**
     * 设置 IPC 处理器
     */
    private setupIpcHandlers() {
        // 处理发送消息请求
        ipcMain.on(IPC_CHANNELS.AI_SEND_MESSAGE, async (event, request: AIMessageRequest) => {
            await this.handleStreamRequest(request);
        });

        // 处理取消流式传输
        ipcMain.on(IPC_CHANNELS.AI_CANCEL_STREAM, (event, messageId: number) => {
            this.cancelStream(messageId);
        });

        // 处理测试连接请求
        ipcMain.on(IPC_CHANNELS.AI_TEST_CONNECTION, async (event, request: AITestConnectionRequest) => {
            await this.handleTestConnection(request);
        });

        // 处理视觉分析请求
        ipcMain.handle('vision:analyze-image', async (event, data: {
            imageBase64: string;
            visionConfig: {
                apiKey: string;
                baseUrl: string;
                model: string;
                temperature: number;
                maxTokens: number;
            };
            prompt: string;
        }) => {
            return await this.handleVisionAnalysis(data);
        });
    }

    /**
     * 处理流式消息请求
     */
    private async handleStreamRequest(request: AIMessageRequest) {
        const { messageId, modelConfig, messages } = request;

        // 创建 AbortController 用于取消
        const abortController = new AbortController();
        this.activeStreams.set(messageId, abortController);

        try {
            // 创建 OpenAI 客户端
            const client = new OpenAI({
                apiKey: modelConfig.apiKey,
                baseURL: modelConfig.baseUrl,
                dangerouslyAllowBrowser: false,
            });

            // 开始流式调用
            const stream = await client.chat.completions.create({
                model: modelConfig.model,
                messages: messages,
                temperature: modelConfig.temperature,
                max_tokens: modelConfig.maxTokens,
                stream: true,
            }, {
                signal: abortController.signal,
            });

            // 处理流式响应
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';

                if (content) {
                    // 发送 chunk 到渲染进程
                    const streamChunk: AIStreamChunk = {
                        messageId,
                        content,
                        timestamp: Date.now(),
                    };

                    this.mainWindow.webContents.send(IPC_CHANNELS.AI_STREAM_CHUNK, streamChunk);
                }

                // 检查是否完成
                const finishReason = chunk.choices[0]?.finish_reason;
                if (finishReason) {
                    // 发送完成事件
                    const streamDone: AIStreamDone = {
                        messageId,
                        finishReason,
                        totalTokens: chunk.usage?.total_tokens,
                        timestamp: Date.now(),
                    };

                    this.mainWindow.webContents.send(IPC_CHANNELS.AI_STREAM_DONE, streamDone);
                    break;
                }
            }
        } catch (error) {
            // 发送错误到渲染进程
            const streamError: AIStreamError = {
                messageId,
                error: error instanceof Error ? error.message : String(error),
                code: error instanceof OpenAI.APIError ? error.code : undefined,
                timestamp: Date.now(),
            };

            this.mainWindow.webContents.send(IPC_CHANNELS.AI_STREAM_ERROR, streamError);
        } finally {
            // 清理
            this.activeStreams.delete(messageId);
        }
    }

    /**
     * 取消流式传输
     */
    private cancelStream(messageId: number) {
        const controller = this.activeStreams.get(messageId);
        if (controller) {
            controller.abort();
            this.activeStreams.delete(messageId);

            // 发送错误事件通知渲染进程
            const streamError: AIStreamError = {
                messageId,
                error: '用户取消了请求',
                code: 'CANCELLED',
                timestamp: Date.now(),
            };

            this.mainWindow.webContents.send(IPC_CHANNELS.AI_STREAM_ERROR, streamError);
        }
    }

    /**
     * 处理测试连接请求
     */
    private async handleTestConnection(request: AITestConnectionRequest) {
        const { requestId, modelConfig } = request;
        const startTime = Date.now();

        try {
            // 验证配置
            if (!modelConfig.apiKey) {
                const result: AITestConnectionResult = {
                    requestId,
                    success: false,
                    message: 'API Key 未配置',
                    error: 'MISSING_API_KEY',
                };

                this.mainWindow.webContents.send(IPC_CHANNELS.AI_TEST_RESULT, result);
                return;
            }

            // 创建 OpenAI 客户端
            const client = new OpenAI({
                apiKey: modelConfig.apiKey,
                baseURL: modelConfig.baseUrl,
                dangerouslyAllowBrowser: false,
            });

            // 发送简单的测试请求
            await client.chat.completions.create({
                model: modelConfig.model,
                messages: [
                    { role: 'user', content: 'Hello' }
                ],
                max_tokens: 10,
                temperature: 0.7,
            });

            const responseTime = Date.now() - startTime;

            // 发送成功结果
            const result: AITestConnectionResult = {
                requestId,
                success: true,
                message: '连接成功',
                responseTime,
            };

            this.mainWindow.webContents.send(IPC_CHANNELS.AI_TEST_RESULT, result);
        } catch (error) {
            const responseTime = Date.now() - startTime;

            let errorMessage = '连接失败';
            let errorCode: string | undefined;

            if (error instanceof OpenAI.APIError) {
                errorMessage = `连接失败: ${error.message}`;
                errorCode = error.code;
            } else if (error instanceof Error) {
                errorMessage = `连接失败: ${error.message}`;
            }

            // 发送失败结果
            const result: AITestConnectionResult = {
                requestId,
                success: false,
                message: errorMessage,
                responseTime,
                error: errorCode || errorMessage,
            };

            this.mainWindow.webContents.send(IPC_CHANNELS.AI_TEST_RESULT, result);
        }
    }

    /**
     * 处理视觉分析请求
     */
    private async handleVisionAnalysis(data: {
        imageBase64: string;
        visionConfig: {
            apiKey: string;
            baseUrl: string;
            model: string;
            temperature: number;
            maxTokens: number;
        };
        prompt: string;
    }): Promise<{ success: boolean; description?: string; error?: string }> {
        const { imageBase64, visionConfig, prompt } = data;

        try {
            // 创建 OpenAI 客户端
            const client = new OpenAI({
                apiKey: visionConfig.apiKey,
                baseURL: visionConfig.baseUrl,
                dangerouslyAllowBrowser: false,
            });

            // 调用视觉模型
            const response = await client.chat.completions.create({
                model: visionConfig.model,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image_url',
                                image_url: {
                                    url: imageBase64, // Base64 Data URL
                                },
                            },
                            {
                                type: 'text',
                                text: prompt,
                            },
                        ],
                    },
                ],
                temperature: visionConfig.temperature,
                max_tokens: visionConfig.maxTokens,
            });

            // 提取描述
            const description = response.choices[0]?.message?.content || '';

            return {
                success: true,
                description,
            };
        } catch (error) {
            console.error('[AIHandler] 视觉分析失败:', error);

            let errorMessage = '视觉分析失败';

            if (error instanceof OpenAI.APIError) {
                errorMessage = `API 错误: ${error.message}`;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    /**
     * 清理资源
     */
    public cleanup() {
        // 取消所有活动的流式传输
        this.activeStreams.forEach((controller) => {
            controller.abort();
        });
        this.activeStreams.clear();

        // 移除所有 IPC 监听器
        ipcMain.removeAllListeners(IPC_CHANNELS.AI_SEND_MESSAGE);
        ipcMain.removeAllListeners(IPC_CHANNELS.AI_CANCEL_STREAM);
        ipcMain.removeAllListeners(IPC_CHANNELS.AI_TEST_CONNECTION);
        ipcMain.removeAllListeners('vision:analyze-image');
    }
}
