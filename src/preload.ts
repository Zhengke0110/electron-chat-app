// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from './main/ipc/channels';
import type {
    AIMessageRequest,
    AIStreamChunk,
    AIStreamDone,
    AIStreamError,
    AITestConnectionRequest,
    AITestConnectionResult,
} from './main/ipc/channels';

// 暴露 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
    // 版本信息
    versions: {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron,
    },

    // AI API
    ai: {
        /**
         * 发送消息到 AI
         */
        sendMessage: (request: AIMessageRequest) => {
            ipcRenderer.send(IPC_CHANNELS.AI_SEND_MESSAGE, request);
        },

        /**
         * 取消流式传输
         */
        cancelStream: (messageId: number) => {
            ipcRenderer.send(IPC_CHANNELS.AI_CANCEL_STREAM, messageId);
        },

        /**
         * 监听流式响应块
         */
        onStreamChunk: (callback: (chunk: AIStreamChunk) => void) => {
            const listener = (_event: Electron.IpcRendererEvent, chunk: AIStreamChunk) => {
                callback(chunk);
            };
            ipcRenderer.on(IPC_CHANNELS.AI_STREAM_CHUNK, listener);

            // 返回清理函数
            return () => {
                ipcRenderer.removeListener(IPC_CHANNELS.AI_STREAM_CHUNK, listener);
            };
        },

        /**
         * 监听流式响应完成
         */
        onStreamDone: (callback: (done: AIStreamDone) => void) => {
            const listener = (_event: Electron.IpcRendererEvent, done: AIStreamDone) => {
                callback(done);
            };
            ipcRenderer.on(IPC_CHANNELS.AI_STREAM_DONE, listener);

            // 返回清理函数
            return () => {
                ipcRenderer.removeListener(IPC_CHANNELS.AI_STREAM_DONE, listener);
            };
        },

        /**
         * 监听流式响应错误
         */
        onStreamError: (callback: (error: AIStreamError) => void) => {
            const listener = (_event: Electron.IpcRendererEvent, error: AIStreamError) => {
                callback(error);
            };
            ipcRenderer.on(IPC_CHANNELS.AI_STREAM_ERROR, listener);

            // 返回清理函数
            return () => {
                ipcRenderer.removeListener(IPC_CHANNELS.AI_STREAM_ERROR, listener);
            };
        },

        /**
         * 测试连接
         */
        testConnection: (request: AITestConnectionRequest) => {
            ipcRenderer.send(IPC_CHANNELS.AI_TEST_CONNECTION, request);
        },

        /**
         * 监听测试连接结果
         */
        onTestResult: (callback: (result: AITestConnectionResult) => void) => {
            const listener = (_event: Electron.IpcRendererEvent, result: AITestConnectionResult) => {
                callback(result);
            };
            ipcRenderer.on(IPC_CHANNELS.AI_TEST_RESULT, listener);

            // 返回清理函数
            return () => {
                ipcRenderer.removeListener(IPC_CHANNELS.AI_TEST_RESULT, listener);
            };
        },
    },
});
