import type { ModelConfig } from '@/types';
import type { ImageAttachment } from '@/db';

// 带图片的消息接口
export interface MessageWithImage {
    text: string;
    image?: {
        attachment: ImageAttachment;
        base64: string;
        description: string;
    };
}

export interface MessageInputProps {
    modelValue?: string;
    placeholder?: string;
    disabled?: boolean;
}

export interface MessageInputEmits {
    'update:modelValue': [value: string];
    'create': [message: string];
    'createWithImage': [data: MessageWithImage];
    'openImageUpload': [];
}

// 重新导出 ImageAttachment 供外部使用
export type { ImageAttachment };


/**
 * 组件 Props
 */
export interface ImageUploadModalProps {
    isOpen: boolean;                    // 是否打开弹窗
    visionConfigs: ModelConfig[];       // 可用的视觉模型配置
    defaultPrompt?: string;             // 默认提示词
    maxSize?: number;                   // 最大文件大小（字节，可选）
}

/**
 * 组件 Emits
 */
export interface ImageUploadModalEmits {
    (event: 'update:isOpen', value: boolean): void;
    (event: 'submitted', payload: ImageUploadResult): void;
}

/**
 * 上传并分析成功的数据
 */
export interface ImageUploadResult {
    attachment: ImageAttachment;        // 图片附件信息
    base64: string;                     // Base64 编码
    description?: string;               // AI 生成的描述
    modelConfig?: ModelConfig;          // 使用的视觉模型配置
    analysisInfo?: AnalysisInfo;        // 分析信息
}

/**
 * 分析信息
 */
export interface AnalysisInfo {
    model: string;                      // 使用的模型名称
    analysisTime: number;               // 分析耗时（ms）
    prompt: string;                     // 使用的提示词
}

/**
 * 预设提示词
 */
export interface PresetPrompt {
    label: string;
    value: string;
}
