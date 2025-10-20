import type {
    AIMessageRequest,
    AIStreamChunk,
    AIStreamDone,
    AIStreamError,
    AITestConnectionRequest,
    AITestConnectionResult,
} from './main/ipc/channels';

export interface ElectronAPI {
    versions: {
        node: string;
        chrome: string;
        electron: string;
    };

    // AI 相关 API
    ai: {
        /**
         * 发送消息到主进程进行 AI 调用
         * @param request 消息请求
         */
        sendMessage: (request: AIMessageRequest) => void;

        /**
         * 取消流式传输
         * @param messageId 消息 ID
         */
        cancelStream: (messageId: number) => void;

        /**
         * 监听流式 chunk 事件
         * @param callback 回调函数
         * @returns 清理函数
         */
        onStreamChunk: (callback: (chunk: AIStreamChunk) => void) => () => void;

        /**
         * 监听流式完成事件
         * @param callback 回调函数
         * @returns 清理函数
         */
        onStreamDone: (callback: (data: AIStreamDone) => void) => () => void;

        /**
         * 监听流式错误事件
         * @param callback 回调函数
         * @returns 清理函数
         */
        onStreamError: (callback: (error: AIStreamError) => void) => () => void;

        /**
         * 测试 AI 连接
         * @param request 测试请求
         */
        testConnection: (request: AITestConnectionRequest) => void;

        /**
         * 监听测试结果
         * @param callback 回调函数
         * @returns 清理函数
         */
        onTestResult: (callback: (result: AITestConnectionResult) => void) => () => void;
    };
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
