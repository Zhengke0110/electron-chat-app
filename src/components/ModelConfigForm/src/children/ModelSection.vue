<template>
    <div class="space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
            <Icon icon="mdi:robot" class="text-lg" />
            模型配置
        </h3>

        <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
                模型名称 <span class="text-red-500">*</span>
            </label>

            <input :value="modelValue.model" @input="$emit('update:model', ($event.target as HTMLInputElement).value)"
                type="text" placeholder="例如: deepseek-chat, gpt-4-turbo, claude-3-5-sonnet-20241022"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                required />

            <p class="text-xs text-gray-500">
                请输入完整的模型标识符,根据所选厂商的 API 文档填写
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

interface ModelSectionProps {
    modelValue: {
        model: string;
    };
}

interface ModelSectionEmits {
    (e: 'update:model', value: string): void;
}

defineProps<ModelSectionProps>();
defineEmits<ModelSectionEmits>();
</script>
