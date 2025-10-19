<template>
    <div class="message-input flex gap-2 items-center">
        <!-- 输入框 -->
        <input v-model="inputValue" type="text" :placeholder="placeholder" :disabled="disabled"
            @keyup.enter="handleCreate" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                disabled:bg-gray-100 disabled:cursor-not-allowed
                transition-all" />

        <!-- 发送按钮 -->
        <button @click="handleCreate" :disabled="disabled || !inputValue.trim()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg 
                hover:bg-indigo-700 active:scale-95
                disabled:bg-gray-300 disabled:cursor-not-allowed
                flex items-center gap-2 transition-all">
            <Icon icon="mdi:send" class="text-xl" />
            <span>发送</span>
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Icon } from '@iconify/vue';
import type { MessageInputProps } from './types';

const props = withDefaults(defineProps<MessageInputProps>(), {
    modelValue: '',
    placeholder: '输入消息...',
    disabled: false
});

const emit = defineEmits<{
    'update:modelValue': [value: string];
    'create': [message: string];
}>();

// 内部输入值
const inputValue = ref(props.modelValue);

// 监听输入值变化，同步到父组件
watch(inputValue, (newValue) => {
    emit('update:modelValue', newValue);
});

// 监听外部 modelValue 变化
watch(() => props.modelValue, (newValue) => {
    inputValue.value = newValue;
});

// 处理创建消息
const handleCreate = () => {
    const message = inputValue.value.trim();
    if (message && !props.disabled) {
        emit('create', message);
        // 发送后清空输入框
        inputValue.value = '';
    }
};
</script>