import type { ModelConfig } from '@/types';

export interface ModelSelectorProps {
    modelValue?: number;  // 选中的模型配置 ID
    configs: ModelConfig[];  // 可用的模型配置列表
}

export interface ModelSelectorEmits {
    (e: 'update:modelValue', value: number): void;
    (e: 'change', config: ModelConfig): void;
}
