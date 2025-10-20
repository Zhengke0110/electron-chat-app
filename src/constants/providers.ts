import type { ProviderTemplate, ModelConfig } from '@/types';

/**
 * 预设的 AI 厂商模板配置
 */
export const PROVIDER_TEMPLATES: ProviderTemplate[] = [
    {
        provider: 'deepseek',
        name: 'DeepSeek',
        baseUrl: 'https://api.deepseek.com/v1',
        models: ['deepseek-chat', 'deepseek-coder'],
        icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=deepseek',
        description: 'DeepSeek 提供的高性能 AI 模型，支持聊天和代码生成',
        defaultParams: {
            temperature: 0.7,
            maxTokens: 4000
        }
    },
    {
        provider: 'openai',
        name: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1',
        models: ['gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-3.5-turbo'],
        icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=openai',
        description: 'OpenAI 提供的先进 AI 模型',
        defaultParams: {
            temperature: 0.7,
            maxTokens: 4096
        }
    },
    {
        provider: 'anthropic',
        name: 'Anthropic',
        baseUrl: 'https://api.anthropic.com/v1',
        models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
        icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=anthropic',
        description: 'Anthropic Claude 系列模型',
        defaultParams: {
            temperature: 0.7,
            maxTokens: 4096
        }
    },
    {
        provider: 'custom',
        name: '自定义',
        baseUrl: '',
        models: [],
        icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=custom',
        description: '自定义 OpenAI 兼容的 API 接口',
        defaultParams: {
            temperature: 0.7,
            maxTokens: 4000
        }
    }
];

/**
 * DeepSeek 默认配置
 * 应用首次启动时会自动创建此配置
 */
export const DEEPSEEK_DEFAULT_CONFIG: Omit<ModelConfig, 'id'> = {
    name: 'DeepSeek Chat (默认)',
    provider: 'deepseek',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    apiKey: '',  // 用户需要自行配置
    temperature: 0.7,
    maxTokens: 4000,
    isDefault: true,
    isActive: false,  // 未配置 API Key 时不激活
    testStatus: 'untested',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

/**
 * 根据厂商标识获取模板
 */
export function getProviderTemplate(provider: string): ProviderTemplate | undefined {
    return PROVIDER_TEMPLATES.find(p => p.provider === provider);
}

/**
 * 创建基于模板的模型配置
 */
export function createConfigFromTemplate(
    provider: string,
    apiKey: string,
    customName?: string
): Omit<ModelConfig, 'id'> {
    const template = getProviderTemplate(provider);
    if (!template) {
        throw new Error(`未找到厂商模板: ${provider}`);
    }

    const now = new Date().toISOString();
    return {
        name: customName || `${template.name} 配置`,
        provider: template.provider,
        baseUrl: template.baseUrl,
        model: template.models[0] || '',
        apiKey,
        temperature: template.defaultParams.temperature,
        maxTokens: template.defaultParams.maxTokens,
        isDefault: false,
        isActive: true,
        testStatus: 'untested',
        createdAt: now,
        updatedAt: now
    };
}
