/**
 * IPC 通道定义
 * 定义主进程和渲染进程之间的通信通道和数据类型
 */

// ==================== IPC 通道名称常量 ====================

export const IPC_CHANNELS = {
    // AI 相关通道
    AI_SEND_MESSAGE: 'ai:sendMessage',       // 渲染进程 → 主进程：发送消息请求
    AI_STREAM_CHUNK: 'ai:streamChunk',       // 主进程 → 渲染进程：流式 chunk
    AI_STREAM_DONE: 'ai:streamDone',         // 主进程 → 渲染进程：流式完成
    AI_STREAM_ERROR: 'ai:streamError',       // 主进程 → 渲染进程：流式错误
    AI_CANCEL_STREAM: 'ai:cancelStream',     // 渲染进程 → 主进程：取消流式传输

    // 测试连接
    AI_TEST_CONNECTION: 'ai:testConnection', // 渲染进程 → 主进程：测试连接
    AI_TEST_RESULT: 'ai:testResult',         // 主进程 → 渲染进程：测试结果
} as const;

// ==================== 类型定义 ====================

/**
 * 模型配置
 */
export interface ModelConfigData {
    provider: string;
    baseUrl: string;
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt?: string; // 系统提示词（可选）
}

/**
 * 消息对象
 */
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

/**
 * AI 消息请求（渲染进程 → 主进程）
 */
export interface AIMessageRequest {
    conversationId: number;      // 会话 ID
    messageId: number;           // 消息 ID（用于追踪）
    modelConfig: ModelConfigData; // 模型配置
    messages: ChatMessage[];     // 消息历史
}

/**
 * AI 流式 Chunk（主进程 → 渲染进程）
 */
export interface AIStreamChunk {
    messageId: number;           // 对应的消息 ID
    content: string;             // 内容片段
    timestamp: number;           // 时间戳
}

/**
 * AI 流式完成（主进程 → 渲染进程）
 */
export interface AIStreamDone {
    messageId: number;           // 对应的消息 ID
    totalTokens?: number;        // 总 token 数（如果可用）
    finishReason?: string;       // 完成原因
    timestamp: number;           // 时间戳
}

/**
 * AI 流式错误（主进程 → 渲染进程）
 */
export interface AIStreamError {
    messageId: number;           // 对应的消息 ID
    error: string;               // 错误消息
    code?: string;               // 错误代码
    timestamp: number;           // 时间戳
}

/**
 * 测试连接请求（渲染进程 → 主进程）
 */
export interface AITestConnectionRequest {
    modelConfig: ModelConfigData; // 模型配置
    requestId: string;           // 请求 ID（用于匹配响应）
}

/**
 * 测试连接结果（主进程 → 渲染进程）
 */
export interface AITestConnectionResult {
    requestId: string;           // 对应的请求 ID
    success: boolean;            // 是否成功
    message: string;             // 结果消息
    responseTime?: number;       // 响应时间（ms）
    error?: string;              // 错误信息
}

// ==================== 工具类型 ====================

/**
 * IPC 通道类型映射
 */
export type IPCChannelMap = typeof IPC_CHANNELS;

/**
 * 获取通道名称类型
 */
export type IPCChannelName = IPCChannelMap[keyof IPCChannelMap];
