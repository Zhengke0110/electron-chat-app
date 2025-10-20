/**
 * AI 消息接口
 */
export interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

/**
 * AI 聊天请求参数
 */
export interface AIChatRequest {
    messages: AIMessage[];
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
}

/**
 * AI 聊天响应（非流式）
 */
export interface AIChatResponse {
    content: string;
    finishReason: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

/**
 * AI 流式响应块
 */
export interface AIStreamChunk {
    content: string;
    done: boolean;
}

/**
 * 测试结果
 */
export interface TestResult {
    success: boolean;
    message: string;
    responseTime?: number;
    error?: string;
}

/**
 * API 错误
 */
export class AIError extends Error {
    code: string;
    statusCode?: number;

    constructor(message: string, code: string, statusCode?: number) {
        super(message);
        this.name = 'AIError';
        this.code = code;
        this.statusCode = statusCode;
    }
}
