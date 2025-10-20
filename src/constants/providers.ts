import type { ProviderTemplate, ModelConfig } from '@/types';

/**
 * 预设的 AI 厂商模板配置
 */
export const PROVIDER_TEMPLATES: ProviderTemplate[] = [
    // ========== 对话模型 ==========
    {
        provider: 'deepseek',
        name: 'DeepSeek',
        modelType: 'chat',
        baseUrl: 'https://api.deepseek.com/v1',
        models: ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'],
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
        modelType: 'chat',
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
        modelType: 'chat',
        baseUrl: 'https://api.anthropic.com/v1',
        models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307', 'claude-3-5-sonnet-20241022'],
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
        modelType: 'chat',
        baseUrl: '',
        models: [],
        icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=custom',
        description: '自定义 OpenAI 兼容的 API 接口',
        defaultParams: {
            temperature: 0.7,
            maxTokens: 4000
        }
    },

    // ========== 视觉模型 ==========
    {
        provider: 'qwen-vision',
        name: '通义千问 VL',
        modelType: 'vision',
        baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        models: ['qwen-vl-max', 'qwen-vl-plus', 'qwen-vl-v1'],
        icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=qwen',
        description: '阿里云通义千问视觉模型，支持图片理解和OCR',
        defaultParams: {
            temperature: 0.8,
            maxTokens: 2000
        }
    },
    {
        provider: 'openai-vision',
        name: 'OpenAI Vision',
        modelType: 'vision',
        baseUrl: 'https://api.openai.com/v1',
        models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4-vision-preview'],
        icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=openai-vision',
        description: 'OpenAI 视觉模型，支持图片识别和分析',
        defaultParams: {
            temperature: 0.7,
            maxTokens: 4096
        }
    },
    {
        provider: 'anthropic-vision',
        name: 'Claude Vision',
        modelType: 'vision',
        baseUrl: 'https://api.anthropic.com/v1',
        models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229'],
        icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=claude-vision',
        description: 'Anthropic Claude 3 视觉模型，支持图片理解',
        defaultParams: {
            temperature: 0.7,
            maxTokens: 4096
        }
    },
    {
        provider: 'gemini-vision',
        name: 'Google Gemini Vision',
        modelType: 'vision',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        models: ['gemini-pro-vision', 'gemini-1.5-pro', 'gemini-1.5-flash'],
        icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=gemini',
        description: 'Google Gemini 视觉模型，支持多模态理解',
        defaultParams: {
            temperature: 0.7,
            maxTokens: 2048
        }
    },
    {
        provider: 'custom-vision',
        name: '自定义视觉模型',
        modelType: 'vision',
        baseUrl: '',
        models: [],
        icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=custom-vision',
        description: '自定义兼容 OpenAI Vision API 的接口',
        defaultParams: {
            temperature: 0.7,
            maxTokens: 2000
        }
    },

    // ========== 语音模型 ==========
    {
        provider: 'openai-whisper',
        name: 'OpenAI Whisper',
        modelType: 'speech',
        baseUrl: 'https://api.openai.com/v1',
        models: ['whisper-1'],
        icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=whisper',
        description: 'OpenAI Whisper 语音识别模型，支持多语言转录',
        defaultParams: {
            temperature: 0.0,
            maxTokens: 0
        }
    },
    {
        provider: 'azure-speech',
        name: 'Azure Speech',
        modelType: 'speech',
        baseUrl: 'https://<region>.api.cognitive.microsoft.com/speechtotext/v3.0',
        models: ['zh-CN-Standard', 'en-US-Standard', 'ja-JP-Standard'],
        icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=azure-speech',
        description: 'Azure 认知服务语音识别，支持实时转录',
        defaultParams: {
            temperature: 0.0,
            maxTokens: 0
        }
    },
    {
        provider: 'deepgram',
        name: 'Deepgram',
        modelType: 'speech',
        baseUrl: 'https://api.deepgram.com/v1',
        models: ['nova-2', 'enhanced', 'base'],
        icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=deepgram',
        description: 'Deepgram 语音识别 API，高精度实时转录',
        defaultParams: {
            temperature: 0.0,
            maxTokens: 0
        }
    },
    {
        provider: 'assemblyai',
        name: 'AssemblyAI',
        modelType: 'speech',
        baseUrl: 'https://api.assemblyai.com/v2',
        models: ['best', 'nano'],
        icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=assemblyai',
        description: 'AssemblyAI 语音识别，支持说话人识别和摘要',
        defaultParams: {
            temperature: 0.0,
            maxTokens: 0
        }
    },
    {
        provider: 'custom-speech',
        name: '自定义语音模型',
        modelType: 'speech',
        baseUrl: '',
        models: [],
        icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=custom-speech',
        description: '自定义兼容 Whisper API 的语音识别接口',
        defaultParams: {
            temperature: 0.0,
            maxTokens: 0
        }
    }
];

/**
 * DeepSeek 默认配置
 * 应用首次启动时会自动创建此配置
 */
export const DEEPSEEK_DEFAULT_CONFIG: Omit<ModelConfig, 'id'> = {
    name: 'DeepSeek Chat (默认)',
    modelType: 'chat',
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
        modelType: template.modelType,
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

/**
 * 根据模型类型获取所有模板
 */
export function getProviderTemplatesByType(modelType: 'chat' | 'vision' | 'speech'): ProviderTemplate[] {
    return PROVIDER_TEMPLATES.filter(t => t.modelType === modelType);
}
