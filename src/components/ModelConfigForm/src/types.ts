import type { ModelConfig } from '@/types';

export interface ModelConfigFormProps {
    modelValue?: ModelConfig;  // 编辑时传入
    isOpen: boolean;
}

export interface ModelConfigFormEmits {
    (e: 'update:isOpen', value: boolean): void;
    (e: 'save', config: Omit<ModelConfig, 'id'>): void;
    (e: 'update', id: number, config: Partial<ModelConfig>): void;
}

export interface FormData {
    name: string;
    modelType: 'chat' | 'vision' | 'speech';
    provider: string;
    baseUrl: string;
    model: string;
    apiKey: string;
    temperature: number;
    maxTokens: number;
    systemPrompt?: string;
    isDefault: boolean;
    isActive: boolean;
}
