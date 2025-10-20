// MessageInput 组件相关类型
import type { ImageAttachment } from '../../../db';

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
