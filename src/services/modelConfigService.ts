import { createAIService } from './ai';
import type { ModelConfig } from '@/types';

/**
 * 测试连接结果接口
 */
export interface TestConnectionResult {
    success: boolean;
    message: string;
    responseTime?: number;
    error?: string;
}

/**
 * 模型配置服务类
 * 负责处理模型配置相关的业务逻辑
 */
export class ModelConfigService {
    /**
     * 测试模型配置连接
     * @param config 模型配置对象
     * @returns 测试结果
     */
    async testConnection(config: Partial<ModelConfig>): Promise<TestConnectionResult> {
        try {
            // 验证必需字段
            if (!config.provider || !config.baseUrl || !config.model || !config.apiKey) {
                return {
                    success: false,
                    message: '配置不完整',
                    error: '请填写所有必需字段: 厂商、API地址、模型名称、API Key'
                };
            }

            // 创建 AI 服务实例
            const aiService = createAIService(config as ModelConfig);

            // 执行测试连接
            const result = await aiService.testConnection();

            return result;
        } catch (error) {
            console.error('测试连接失败:', error);
            return {
                success: false,
                message: '测试连接时发生错误',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /**
     * 验证配置完整性
     * @param config 模型配置对象
     * @returns 是否有效
     */
    validateConfig(config: Partial<ModelConfig>): {
        valid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        if (!config.name?.trim()) {
            errors.push('配置名称不能为空');
        }

        if (!config.provider) {
            errors.push('请选择厂商');
        }

        if (!config.baseUrl?.trim()) {
            errors.push('API 地址不能为空');
        }

        if (!config.model?.trim()) {
            errors.push('模型名称不能为空');
        }

        if (!config.apiKey?.trim()) {
            errors.push('API Key 不能为空');
        }

        if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) {
            errors.push('温度值应在 0-2 之间');
        }

        if (config.maxTokens !== undefined && config.maxTokens <= 0) {
            errors.push('最大Token数必须大于 0');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * 格式化测试结果消息
     * @param result 测试结果
     * @returns 格式化的消息字符串
     */
    formatTestResultMessage(result: TestConnectionResult): string {
        if (result.success) {
            return `✅ 连接成功!\n${result.message}\n响应时间: ${result.responseTime}ms`;
        } else {
            return `❌ 连接失败!\n${result.message}${result.error ? `\n${result.error}` : ''}`;
        }
    }
}

// 导出单例实例
export const modelConfigService = new ModelConfigService();
