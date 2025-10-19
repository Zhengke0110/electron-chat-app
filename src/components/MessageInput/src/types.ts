// MessageInput 组件相关类型
export interface MessageInputProps {
    modelValue?: string;
    placeholder?: string;
    disabled?: boolean;
}

export interface MessageInputEmits {
    'update:modelValue': [value: string];
    'create': [message: string];
}
