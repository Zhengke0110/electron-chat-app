<template>
    <div class="inline-block relative" ref="containerRef">
        <!-- 触发按钮 -->
        <button type="button" @click="toggleDropdown"
            class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors min-w-[240px]">
            <div class="flex items-center gap-2 flex-1">
                <!-- 模型图标 -->
                <Icon :icon="getModelIcon(selectedConfig?.modelType)" class="text-lg text-indigo-600" />

                <!-- 当前选中的模型信息 -->
                <div v-if="selectedConfig" class="flex flex-col items-start flex-1">
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-medium text-gray-900">{{ selectedConfig.name }}</span>
                        <!-- 模型类型标签 -->
                        <span class="px-1.5 py-0.5 text-xs rounded"
                            :class="getModelTypeClass(selectedConfig.modelType)">
                            {{ getModelTypeLabel(selectedConfig.modelType) }}
                        </span>
                        <!-- 状态指示器 -->
                        <Icon v-if="selectedConfig.testStatus === 'success'" icon="mdi:check-circle"
                            class="text-sm text-green-600" title="测试成功" />
                        <Icon v-else-if="selectedConfig.testStatus === 'failed'" icon="mdi:alert-circle"
                            class="text-sm text-red-600" title="测试失败" />
                    </div>
                    <span class="text-xs text-gray-500">{{ getProviderDisplayName(selectedConfig.provider) }}</span>
                </div>
                <span v-else class="text-sm text-gray-500">选择模型</span>
            </div>

            <Icon icon="mdi:chevron-down" class="text-base text-gray-400 transition-transform"
                :class="{ 'rotate-180': isOpen }" />
        </button>

        <!-- 下拉菜单 -->
        <Transition name="dropdown">
            <div v-if="isOpen" ref="dropdownRef"
                class="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden min-w-[280px] max-h-[400px] z-[100]">
                <div class="p-1 max-h-[380px] overflow-y-auto">
                    <!-- 空状态 -->
                    <div v-if="activeConfigs.length === 0" class="px-3 py-6 text-center text-gray-500 text-sm">
                        <p class="mb-2">暂无可用模型</p>
                        <p class="text-xs text-gray-400">请先在设置中配置模型</p>
                    </div>

                    <!-- 按模型类型分组显示 -->
                    <div v-for="(configs, type) in groupedConfigs" :key="type" class="mb-2 last:mb-0">
                        <!-- 分组标题 -->
                        <div class="px-3 py-1.5 text-xs font-semibold text-gray-500 flex items-center gap-2">
                            <Icon :icon="getModelIcon(type as any)" class="text-sm" />
                            {{ getModelTypeLabel(type as any) }}
                        </div>

                        <!-- 该类型的模型列表 -->
                        <button v-for="config in configs" :key="config.id" type="button" @click="selectModel(config)"
                            class="w-full py-2.5 pl-5 pr-3 hover:bg-blue-50 rounded cursor-pointer outline-none transition-colors text-left"
                            :class="{ 'bg-blue-50': isModelSelected(config) }">
                            <div class="flex items-center justify-between gap-3">
                                <div class="flex-1">
                                    <div class="flex items-center gap-2">
                                        <span class="text-sm font-medium text-gray-900">
                                            {{ config.name }}
                                        </span>
                                        <!-- 默认标签 -->
                                        <span v-if="config.isDefault"
                                            class="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                            默认
                                        </span>
                                        <!-- 状态标签 -->
                                        <Icon v-if="config.testStatus === 'success'" icon="mdi:check-circle"
                                            class="text-sm text-green-600" title="已测试" />
                                        <Icon v-else-if="config.testStatus === 'failed'" icon="mdi:alert-circle"
                                            class="text-sm text-red-600" title="测试失败" />
                                        <Icon v-else icon="mdi:circle-outline" class="text-sm text-gray-400"
                                            title="未测试" />
                                    </div>
                                    <div class="text-xs text-gray-500 mt-0.5">
                                        {{ getProviderDisplayName(config.provider) }} · {{ config.model }}
                                    </div>
                                </div>

                                <Icon v-if="isModelSelected(config)" icon="mdi:check"
                                    class="text-base text-blue-600 flex-shrink-0" />
                            </div>
                        </button>
                    </div>

                    <!-- 前往设置的链接 -->
                    <div v-if="Object.keys(groupedConfigs).length > 0" class="border-t border-gray-100 mt-1 pt-1">
                        <button type="button" @click="handleGoToSettings"
                            class="w-full px-3 py-2 text-left text-xs text-gray-600 hover:bg-gray-50 rounded transition-colors flex items-center gap-2">
                            <Icon icon="mdi:cog" class="text-sm" />
                            管理模型配置
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import type { ModelSelectorProps, ModelSelectorEmits } from './types';
import type { ModelConfig } from '@/types';

const props = withDefaults(defineProps<ModelSelectorProps & {
    // 为不同类型的模型分别维护选中状态
    chatModelId?: number;
    visionModelId?: number;
    speechModelId?: number;
}>(), {
    chatModelId: undefined,
    visionModelId: undefined,
    speechModelId: undefined
});

const emit = defineEmits<ModelSelectorEmits>();
const router = useRouter();

// 下拉菜单状态
const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);

// 只显示已启用的配置
const activeConfigs = computed(() => {
    const active = props.configs.filter(config => config.isActive);
    console.log('📋 [ModelSelector] 可用配置数量:', active.length, active.map(c => ({ id: c.id, name: c.name, type: c.modelType })));
    return active;
});

// 按模型类型分组
const groupedConfigs = computed(() => {
    const groups: Record<string, ModelConfig[]> = {
        chat: [],
        vision: [],
        speech: []
    };

    activeConfigs.value.forEach(config => {
        const type = config.modelType || 'chat';
        if (groups[type]) {
            groups[type].push(config);
        }
    });

    // 只返回有数据的分组
    return Object.fromEntries(
        Object.entries(groups).filter(([_, configs]) => configs.length > 0)
    );
});

// 当前选中的配置
const selectedConfig = computed(() => {
    if (!props.modelValue) return null;
    return props.configs.find(config => config.id === props.modelValue);
});

// 判断模型是否被选中（根据类型分别判断）
const isModelSelected = (config: ModelConfig): boolean => {
    switch (config.modelType) {
        case 'chat':
            return config.id === props.chatModelId;
        case 'vision':
            return config.id === props.visionModelId;
        case 'speech':
            return config.id === props.speechModelId;
        default:
            return config.id === props.modelValue;
    }
};

// 获取模型类型图标
const getModelIcon = (type?: 'chat' | 'vision' | 'speech'): string => {
    const icons: Record<string, string> = {
        chat: 'mdi:message-text',
        vision: 'mdi:eye',
        speech: 'mdi:microphone'
    };
    return icons[type || 'chat'] || 'mdi:robot';
};

// 获取模型类型标签
const getModelTypeLabel = (type?: 'chat' | 'vision' | 'speech'): string => {
    const labels: Record<string, string> = {
        chat: '对话',
        vision: '视觉',
        speech: '语音'
    };
    return labels[type || 'chat'] || '对话';
};

// 获取模型类型样式类
const getModelTypeClass = (type?: 'chat' | 'vision' | 'speech'): string => {
    const classes: Record<string, string> = {
        chat: 'bg-blue-100 text-blue-700',
        vision: 'bg-purple-100 text-purple-700',
        speech: 'bg-green-100 text-green-700'
    };
    return classes[type || 'chat'] || 'bg-gray-100 text-gray-700';
};

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

// 切换下拉菜单
const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
    console.log('🔽 [ModelSelector] 切换下拉菜单:', isOpen.value);
};

// 选择模型
const selectModel = (config: ModelConfig) => {
    console.log('✅ [ModelSelector] 选择模型:', config.name, config.id);

    emit('update:modelValue', config.id);
    emit('change', config);

    // 关闭下拉菜单
    isOpen.value = false;
};

// 点击外部关闭下拉菜单
const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
        isOpen.value = false;
    }
};

// 前往设置页面
const handleGoToSettings = () => {
    isOpen.value = false;
    router.push('/settings');
};

// 生命周期钩子
onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* 下拉菜单动画 */
.dropdown-enter-active,
.dropdown-leave-active {
    transition: all 0.2s ease;
}

.dropdown-enter-from {
    opacity: 0;
    transform: translateY(-8px);
}

.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

/* 滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
    width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>
