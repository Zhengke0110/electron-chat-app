// 模型配置接口
export interface ModelConfig {
    id?: number;
    name: string;                  // 配置名称 (用户自定义，如 "我的 DeepSeek")
    provider: string;              // 厂商标识 (deepseek, openai, anthropic, custom)
    baseUrl: string;               // API 接口路径
    model: string;                 // 模型类型/名称
    apiKey: string;                // API Key (存储时需加密)
    temperature: number;           // 温度参数 (0-2)
    maxTokens: number;             // 最大token数
    isDefault: boolean;            // 是否为默认模型
    isActive: boolean;             // 是否启用
    testStatus?: 'success' | 'failed' | 'untested' | 'testing';  // 测试状态
    testMessage?: string;          // 测试结果信息
    createdAt: string;
    updatedAt: string;
}

// 预设厂商模板接口
export interface ProviderTemplate {
    provider: string;              // 厂商唯一标识
    name: string;                  // 显示名称
    baseUrl: string;               // 默认 API 地址
    models: string[];              // 支持的模型列表
    icon?: string;                 // 图标 URL
    description?: string;          // 描述信息
    defaultParams: {
        temperature: number;
        maxTokens: number;
    };
}

// API 测试结果接口
export interface TestResult {
    success: boolean;
    message: string;
    responseTime?: number;         // 响应时间 (ms)
    error?: string;
}
