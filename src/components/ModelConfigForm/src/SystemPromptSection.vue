<template>
    <div class="space-y-3">
        <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Icon icon="mdi:message-badge" class="text-lg text-indigo-600" />
                系统提示词
            </label>
            <button type="button" @click="showPresets = !showPresets"
                class="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                <Icon icon="mdi:lightbulb-on" class="text-sm" />
                {{ showPresets ? '隐藏预设' : '查看预设' }}
            </button>
        </div>

        <p class="text-xs text-gray-500">
            设置模型的角色和行为，让 AI 的回答更符合您的需求（可选）
        </p>

        <!-- 预设提示词列表 -->
        <div v-if="showPresets" class="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p class="text-xs font-medium text-gray-600 mb-2">点击应用预设：</p>
            <div class="grid grid-cols-1 gap-2">
                <button v-for="preset in systemPromptPresets" :key="preset.name" type="button"
                    @click="applyPreset(preset.prompt)"
                    class="text-left p-2 rounded border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all group">
                    <div class="flex items-start gap-2">
                        <Icon :icon="preset.icon"
                            class="text-base text-gray-400 group-hover:text-blue-500 flex-shrink-0 mt-0.5" />
                        <div class="flex-1 min-w-0">
                            <div class="font-medium text-sm text-gray-800 group-hover:text-blue-700">
                                {{ preset.name }}
                            </div>
                            <div class="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                {{ preset.prompt }}
                            </div>
                        </div>
                    </div>
                </button>
            </div>
        </div>

        <!-- 文本输入框 -->
        <div class="relative">
            <textarea :value="modelValue" @input="handleInput" placeholder="例如：你是一个专业的 Python 编程助手..." rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                :class="{ 'border-gray-200 bg-gray-50': !modelValue }"></textarea>

            <!-- 字符计数 -->
            <div class="absolute bottom-2 right-2 text-xs text-gray-400">
                {{ (modelValue || '').length }} 字符
            </div>
        </div>

        <!-- 清空按钮 -->
        <button v-if="modelValue" type="button" @click="clearPrompt"
            class="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors">
            <Icon icon="mdi:close-circle" class="text-sm" />
            清空提示词
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { getSystemPromptPresetsByType } from '@/constants/prompt';
import type { SystemPromptPreset } from '@/constants/prompt';
import type { ModelType } from '@/types';

const props = defineProps<{
    modelValue?: string;
    modelType: ModelType; // 必需的模型类型
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const showPresets = ref(false);

// 根据模型类型过滤预设
const systemPromptPresets = computed<SystemPromptPreset[]>(() => {
    return getSystemPromptPresetsByType(props.modelType);
});

const handleInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    emit('update:modelValue', target.value);
};

const applyPreset = (prompt: string) => {
    emit('update:modelValue', prompt);
    showPresets.value = false;
};

const clearPrompt = () => {
    emit('update:modelValue', '');
};
</script>
