<template>
    <div class="inline-block">
        <SelectRoot :model-value="modelValue?.toString()" @update:model-value="handleModelChange">
            <SelectTrigger
                class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors min-w-[200px]">
                <div class="flex items-center gap-2 flex-1">
                    <!-- 模型图标 -->
                    <span class="text-lg">🤖</span>

                    <!-- 当前选中的模型信息 -->
                    <div v-if="selectedConfig" class="flex flex-col items-start flex-1">
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-medium text-gray-900">{{ selectedConfig.name }}</span>
                            <!-- 状态指示器 -->
                            <span v-if="selectedConfig.testStatus === 'success'" class="text-xs" title="测试成功">✅</span>
                            <span v-else-if="selectedConfig.testStatus === 'failed'" class="text-xs"
                                title="测试失败">⚠️</span>
                        </div>
                        <span class="text-xs text-gray-500">{{ getProviderDisplayName(selectedConfig.provider) }}</span>
                    </div>
                    <SelectValue v-else placeholder="选择模型" class="text-sm text-gray-500" />
                </div>

                <SelectIcon class="text-gray-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </SelectIcon>
            </SelectTrigger>

            <SelectPortal>
                <SelectContent
                    class="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden min-w-[280px]"
                    :side-offset="5">
                    <SelectViewport class="p-1">
                        <!-- 空状态 -->
                        <div v-if="activeConfigs.length === 0" class="px-3 py-6 text-center text-gray-500 text-sm">
                            <p class="mb-2">暂无可用模型</p>
                            <p class="text-xs text-gray-400">请先在设置中配置模型</p>
                        </div>

                        <!-- 模型列表 -->
                        <SelectItem v-for="config in activeConfigs" :key="config.id"
                            :value="config.id?.toString() || ''"
                            class="px-3 py-2.5 hover:bg-blue-50 rounded cursor-pointer outline-none transition-colors">
                            <div class="flex items-center justify-between gap-3">
                                <div class="flex-1">
                                    <div class="flex items-center gap-2">
                                        <SelectItemText class="text-sm font-medium text-gray-900">
                                            {{ config.name }}
                                        </SelectItemText>
                                        <!-- 默认标签 -->
                                        <span v-if="config.isDefault"
                                            class="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                            默认
                                        </span>
                                        <!-- 状态标签 -->
                                        <span v-if="config.testStatus === 'success'" class="text-xs"
                                            title="已测试">✅</span>
                                        <span v-else-if="config.testStatus === 'failed'" class="text-xs text-red-500"
                                            title="测试失败">❌</span>
                                        <span v-else class="text-xs text-gray-400" title="未测试">⚪</span>
                                    </div>
                                    <div class="text-xs text-gray-500 mt-0.5">
                                        {{ getProviderDisplayName(config.provider) }} · {{ config.model }}
                                    </div>
                                </div>

                                <SelectItemIndicator class="flex-shrink-0">
                                    <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clip-rule="evenodd" />
                                    </svg>
                                </SelectItemIndicator>
                            </div>
                        </SelectItem>

                        <!-- 前往设置的链接 -->
                        <div v-if="activeConfigs.length > 0" class="border-t border-gray-100 mt-1 pt-1">
                            <button @click.stop="handleGoToSettings"
                                class="w-full px-3 py-2 text-left text-xs text-gray-600 hover:bg-gray-50 rounded transition-colors flex items-center gap-2">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                管理模型配置
                            </button>
                        </div>
                    </SelectViewport>
                </SelectContent>
            </SelectPortal>
        </SelectRoot>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import {
    SelectRoot,
    SelectTrigger,
    SelectValue,
    SelectIcon,
    SelectPortal,
    SelectContent,
    SelectViewport,
    SelectItem,
    SelectItemText,
    SelectItemIndicator
} from 'reka-ui';
import type { ModelSelectorProps, ModelSelectorEmits } from './types';

const props = defineProps<ModelSelectorProps>();
const emit = defineEmits<ModelSelectorEmits>();
const router = useRouter();

// 只显示已启用的配置
const activeConfigs = computed(() => {
    return props.configs.filter(config => config.isActive);
});

// 当前选中的配置
const selectedConfig = computed(() => {
    if (!props.modelValue) return null;
    return props.configs.find(config => config.id === props.modelValue);
});

// 获取厂商显示名称
const getProviderDisplayName = (provider: string): string => {
    const displayNames: Record<string, string> = {
        'deepseek': 'DeepSeek',
        'openai': 'OpenAI',
        'anthropic': 'Anthropic',
        'google': 'Google',
        'custom': '自定义'
    };
    return displayNames[provider] || provider;
};

// 处理模型变化
const handleModelChange = (value: string) => {
    const configId = parseInt(value);
    emit('update:modelValue', configId);

    const config = props.configs.find(c => c.id === configId);
    if (config) {
        emit('change', config);
    }
};

// 前往设置页面
const handleGoToSettings = () => {
    router.push('/settings');
};
</script>
