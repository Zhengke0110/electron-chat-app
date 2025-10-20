<template>
    <div class="space-y-4">
        <!-- 空状态 -->
        <div v-if="configs.length === 0"
            class="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div class="text-gray-400 mb-2">
                <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                    </path>
                </svg>
            </div>
            <p class="text-gray-500 font-medium">暂无模型配置</p>
            <p class="text-gray-400 text-sm mt-1">点击上方"添加模型"按钮创建第一个配置</p>
        </div>

        <!-- 配置列表 -->
        <div v-else class="space-y-3">
            <div v-for="config in configs" :key="config.id" :class="[
                'border rounded-lg p-4 transition-all',
                config.isActive
                    ? 'bg-white border-gray-200 hover:shadow-md'
                    : 'bg-gray-50 border-gray-300 opacity-75'
            ]">
                <div class="flex items-start justify-between">
                    <!-- 左侧信息 -->
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <h4 :class="[
                                'font-semibold text-lg',
                                config.isActive ? 'text-gray-900' : 'text-gray-500'
                            ]">{{ config.name }}</h4>

                            <!-- 模型类型标签 -->
                            <span :class="[
                                'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded',
                                {
                                    'bg-blue-100 text-blue-700': getModelTypeConfig(config.modelType).color === 'blue',
                                    'bg-purple-100 text-purple-700': getModelTypeConfig(config.modelType).color === 'purple',
                                    'bg-green-100 text-green-700': getModelTypeConfig(config.modelType).color === 'green',
                                    'bg-gray-100 text-gray-700': getModelTypeConfig(config.modelType).color === 'gray'
                                }
                            ]">
                                <Icon :icon="getModelTypeConfig(config.modelType).icon" class="text-sm" />
                                {{ getModelTypeConfig(config.modelType).label }}
                            </span>

                            <!-- 默认标签 -->
                            <span v-if="config.isDefault"
                                class="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                                <Icon icon="mdi:star" class="text-sm" />
                                默认
                            </span>

                            <!-- 激活状态 -->
                            <span :class="config.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                                class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded">
                                <Icon :icon="config.isActive ? 'mdi:check-circle' : 'mdi:pause-circle'"
                                    class="text-sm" />
                                {{ config.isActive ? '已启用' : '未启用' }}
                            </span>

                            <!-- 测试状态 -->
                            <Icon v-if="config.testStatus === 'testing'" icon="mdi:loading"
                                class="text-blue-600 text-lg animate-spin" title="测试中" />
                            <Icon v-else-if="config.testStatus === 'success'" icon="mdi:check-circle"
                                class="text-green-600 text-lg" title="测试成功" />
                            <Icon v-else-if="config.testStatus === 'failed'" icon="mdi:close-circle"
                                class="text-red-600 text-lg" title="测试失败" />
                            <Icon v-else icon="mdi:help-circle-outline" class="text-gray-400 text-lg" title="未测试" />
                        </div>

                        <!-- 配置详情 -->
                        <div :class="[
                            'space-y-1 text-sm',
                            config.isActive ? 'text-gray-600' : 'text-gray-400'
                        ]">
                            <p>
                                <span class="font-medium">厂商:</span> {{ getProviderDisplayName(config.provider) }}
                                <span class="mx-2">|</span>
                                <span class="font-medium">模型:</span> {{ config.model }}
                            </p>
                            <p :class="config.isActive ? 'text-gray-500' : 'text-gray-400'">
                                <span class="font-medium">API:</span> {{ config.baseUrl }}
                            </p>
                            <p :class="config.isActive ? 'text-gray-400' : 'text-gray-300'" class="text-xs">
                                温度: {{ config.temperature }} | 最大Token: {{ config.maxTokens }}
                            </p>
                            <p v-if="config.testMessage" class="text-xs"
                                :class="config.testStatus === 'success' ? 'text-green-600' : 'text-red-600'">
                                {{ config.testMessage }}
                            </p>
                        </div>
                    </div>

                    <!-- 右侧操作按钮 - 使用 DropdownMenu -->
                    <div class="ml-4">
                        <DropdownMenuRoot>
                            <DropdownMenuTrigger
                                class="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                                <Icon icon="mdi:cog" class="text-lg" />
                                操作
                            </DropdownMenuTrigger>

                            <DropdownMenuPortal>
                                <DropdownMenuContent
                                    class="min-w-[160px] bg-white rounded-lg shadow-lg border border-gray-200 p-1"
                                    :side-offset="5">
                                    <DropdownMenuItem @select="$emit('test', config)"
                                        class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded cursor-pointer outline-none">
                                        <Icon icon="mdi:test-tube" class="text-base" />
                                        测试连接
                                    </DropdownMenuItem>

                                    <DropdownMenuItem @select="$emit('edit', config)"
                                        class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded cursor-pointer outline-none">
                                        <Icon icon="mdi:pencil" class="text-base" />
                                        编辑配置
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator class="h-px bg-gray-200 my-1" />

                                    <DropdownMenuItem v-if="config.id" @select="$emit('toggleActive', config.id)"
                                        class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded cursor-pointer outline-none">
                                        <Icon :icon="config.isActive ? 'mdi:cancel' : 'mdi:check-circle'"
                                            class="text-base" />
                                        {{ config.isActive ? '禁用' : '启用' }}
                                    </DropdownMenuItem>

                                    <DropdownMenuItem v-if="!config.isDefault && config.id"
                                        @select="$emit('setDefault', config.id)"
                                        class="flex items-center gap-2 px-3 py-2 text-sm text-yellow-700 hover:bg-yellow-50 rounded cursor-pointer outline-none">
                                        <Icon icon="mdi:star" class="text-base" />
                                        设为默认
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator v-if="config.id" class="h-px bg-gray-200 my-1" />

                                    <DropdownMenuItem v-if="config.id" @select="handleDelete(config)"
                                        class="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer outline-none">
                                        <Icon icon="mdi:delete" class="text-base" />
                                        删除
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenuPortal>
                        </DropdownMenuRoot>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import {
    DropdownMenuRoot,
    DropdownMenuTrigger,
    DropdownMenuPortal,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator
} from 'reka-ui';
import type { ModelConfigListProps, ModelConfigListEmits } from './types';
import type { ModelConfig } from '@/types';

// 获取模型类型标签配置
const getModelTypeConfig = (modelType: string) => {
    const configs = {
        'chat': { icon: 'mdi:message-text', label: '对话', color: 'blue' },
        'vision': { icon: 'mdi:eye', label: '视觉', color: 'purple' },
        'speech': { icon: 'mdi:microphone', label: '语音', color: 'green' }
    };
    return configs[modelType as keyof typeof configs] || { icon: 'mdi:robot', label: '未知', color: 'gray' };
};

defineProps<ModelConfigListProps>();
const emit = defineEmits<ModelConfigListEmits>();

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

// 删除确认
const handleDelete = (config: ModelConfig) => {
    if (config.isDefault) {
        alert('无法删除默认配置，请先设置其他配置为默认');
        return;
    }

    if (confirm(`确定要删除配置 "${config.name}" 吗？此操作无法撤销。`)) {
        if (config.id) {
            emit('delete', config.id);
        }
    }
};
</script>
