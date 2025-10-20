import OpenAI from 'openai';
import type { ModelConfig } from '../types';
import type {
    AIChatRequest,
    AIChatResponse,
    AIStreamChunk,
    TestResult
} from './types';
import { AIError } from './types';

/**
 * AI 服务类
 * 统一管理 AI API 调用，支持多厂商（OpenAI 兼容接口）
 */
export class AIService {
    private config: ModelConfig;
    private client: OpenAI;
    private abortController: AbortController | null = null;

    constructor(config: ModelConfig) {
        this.config = config;
        this.client = this.createClient(config);
    }

    /**
     * 创建 OpenAI 客户端
     */
    private createClient(config: ModelConfig): OpenAI {
        return new OpenAI({
            apiKey: config.apiKey,
            baseURL: config.baseUrl,
            dangerouslyAllowBrowser: true // Electron 环境允许浏览器端使用
        });
    }

    /**
     * 更新配置
     */
    updateConfig(config: ModelConfig) {
        this.config = config;
        this.client = this.createClient(config);
    }

    /**
     * 测试连接
     */
    async testConnection(): Promise<TestResult> {
        const startTime = Date.now();

        try {
            // 验证配置
            if (!this.config.apiKey) {
                return {
                    success: false,
                    message: 'API Key 未配置',
                    error: 'MISSING_API_KEY'
                };
            }

            // 发送简单的测试请求
            await this.client.chat.completions.create({
                model: this.config.model,
                messages: [
                    { role: 'user', content: 'Hello' }
                ],
                max_tokens: 10,
                temperature: 0.7
            });

            const responseTime = Date.now() - startTime;

            return {
                success: true,
                message: '连接成功',
                responseTime
            };
        } catch (error) {
            const responseTime = Date.now() - startTime;

            if (error instanceof OpenAI.APIError) {
                return {
                    success: false,
                    message: `连接失败: ${error.message}`,
                    responseTime,
                    error: error.message
                };
            }

            return {
                success: false,
                message: `连接失败: ${error instanceof Error ? error.message : '未知错误'}`,
                responseTime,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /**
     * 发送聊天请求（非流式）
     */
    async chat(request: AIChatRequest): Promise<AIChatResponse> {
        try {
            const completion = await this.client.chat.completions.create({
                model: this.config.model,
                messages: request.messages,
                temperature: request.temperature ?? this.config.temperature,
                max_tokens: request.maxTokens ?? this.config.maxTokens,
                stream: false
            });

            const choice = completion.choices[0];

            if (!choice) {
                throw new AIError('无效的响应格式', 'INVALID_RESPONSE');
            }

            return {
                content: choice.message?.content || '',
                finishReason: choice.finish_reason || 'unknown',
                usage: completion.usage ? {
                    promptTokens: completion.usage.prompt_tokens,
                    completionTokens: completion.usage.completion_tokens,
                    totalTokens: completion.usage.total_tokens
                } : undefined
            };
        } catch (error) {
            if (error instanceof AIError) {
                throw error;
            }

            if (error instanceof OpenAI.APIError) {
                throw new AIError(
                    error.message,
                    error.code || 'API_ERROR',
                    error.status
                );
            }

            throw new AIError(
                error instanceof Error ? error.message : '未知错误',
                'UNKNOWN_ERROR'
            );
        }
    }

    /**
     * 发送聊天请求（流式）
     */
    async *chatStream(request: AIChatRequest): AsyncGenerator<AIStreamChunk> {
        try {
            const stream = await this.client.chat.completions.create({
                model: this.config.model,
                messages: request.messages,
                temperature: request.temperature ?? this.config.temperature,
                max_tokens: request.maxTokens ?? this.config.maxTokens,
                stream: true
            });

            for await (const chunk of stream) {
                const delta = chunk.choices[0]?.delta;
                const content = delta?.content || '';

                if (content) {
                    yield {
                        content,
                        done: false
                    };
                }

                if (chunk.choices[0]?.finish_reason) {
                    yield {
                        content: '',
                        done: true
                    };
                }
            }
        } catch (error) {
            if (error instanceof AIError) {
                throw error;
            }

            if (error instanceof OpenAI.APIError) {
                throw new AIError(
                    error.message,
                    error.code || 'API_ERROR',
                    error.status
                );
            }

            throw new AIError(
                error instanceof Error ? error.message : '未知错误',
                'UNKNOWN_ERROR'
            );
        }
    }

    /**
     * 取消当前请求
     */
    abort() {
        // OpenAI SDK 会自动处理中断
        // 这里保留接口以保持向后兼容性
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
    }
}

/**
 * 创建 AI 服务实例
 */
export function createAIService(config: ModelConfig): AIService {
    return new AIService(config);
}
