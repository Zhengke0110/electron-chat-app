<template>
    <DialogRoot :open="isOpen" @update:open="$emit('update:isOpen', $event)">
        <DialogPortal>
            <DialogOverlay class="fixed inset-0 bg-black/50 z-40" />
            <DialogContent
                class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <!-- 标题 -->
                    <div class="flex items-center justify-between mb-6">
                        <DialogTitle class="text-xl font-bold text-gray-900">
                            {{ isEditMode ? '编辑模型配置' : '添加模型配置' }}
                        </DialogTitle>
                        <DialogClose class="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </DialogClose>
                    </div>

                    <!-- 描述 -->
                    <DialogDescription class="text-sm text-gray-600 mb-4">
                        {{ isEditMode ? '修改现有模型的配置信息' : '配置新的 AI 模型以便在聊天中使用' }}
                    </DialogDescription>

                    <!-- 表单 -->
                    <form @submit.prevent="handleSubmit" class="space-y-6">
                        <!-- 基础信息 -->
                        <BasicInfoSection :model-value="formData" @update:name="formData.name = $event"
                            @update:api-key="formData.apiKey = $event" @update:is-active="formData.isActive = $event"
                            @update:is-default="formData.isDefault = $event" />

                        <!-- 厂商选择 -->
                        <ProviderSection :model-value="formData" @update:provider="formData.provider = $event"
                            @update:base-url="formData.baseUrl = $event" @provider-changed="handleProviderChanged" />

                        <!-- 模型选择 -->
                        <ModelSection :model-value="formData" @update:model="formData.model = $event" />

                        <!-- 高级参数 -->
                        <AdvancedSection :model-value="formData" @update:temperature="formData.temperature = $event"
                            @update:max-tokens="formData.maxTokens = $event" />

                        <!-- 按钮组 -->
                        <div class="flex items-center justify-between gap-3 pt-4 border-t">
                            <!-- 左侧测试按钮 -->
                            <button type="button" @click="handleTest" :disabled="!isTestable || isTesting"
                                class="px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-2">
                                <span v-if="isTesting">⏳</span>
                                <span v-else>🔍</span>
                                {{ isTesting ? '测试中...' : '测试连接' }}
                            </button>

                            <!-- 右侧操作按钮 -->
                            <div class="flex items-center gap-3">
                                <button type="button" @click="$emit('update:isOpen', false)"
                                    class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                    取消
                                </button>
                                <button type="submit" :disabled="!isFormValid"
                                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                                    {{ isEditMode ? '保存修改' : '创建配置' }}
                                </button>
                            </div>
                        </div>

                        <!-- 测试结果提示 -->
                        <div v-if="testResult" :class="[
                            'p-3 rounded-lg text-sm flex items-start gap-2',
                            testResult.success
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                        ]">
                            <span class="text-lg">{{ testResult.success ? '✅' : '❌' }}</span>
                            <div class="flex-1">
                                <p class="font-medium">{{ testResult.success ? '连接成功' : '连接失败' }}</p>
                                <p class="text-xs mt-1 opacity-90">{{ testResult.message }}</p>
                            </div>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </DialogPortal>
    </DialogRoot>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
    DialogRoot,
    DialogPortal,
    DialogOverlay,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose
} from 'reka-ui';
import BasicInfoSection from './BasicInfoSection.vue';
import ProviderSection from './ProviderSection.vue';
import ModelSection from './ModelSection.vue';
import AdvancedSection from './AdvancedSection.vue';
import { PROVIDER_TEMPLATES } from '@/constants/providers';
import type { ModelConfigFormProps, ModelConfigFormEmits, FormData } from './types';
import type { ProviderTemplate } from '@/types';

const props = defineProps<ModelConfigFormProps>();
const emit = defineEmits<ModelConfigFormEmits>();

// 是否编辑模式
const isEditMode = computed(() => !!props.modelValue?.id);

// 测试状态
const isTesting = ref(false);
const testResult = ref<{ success: boolean; message: string } | null>(null);

// 表单数据
const formData = ref<FormData>({
    name: '',
    provider: 'deepseek',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    apiKey: '',
    temperature: 0.7,
    maxTokens: 4000,
    isDefault: false,
    isActive: true
});

// 表单验证
const isFormValid = computed(() => {
    return !!(
        formData.value.name.trim() &&
        formData.value.provider &&
        formData.value.baseUrl.trim() &&
        formData.value.model.trim() &&
        formData.value.apiKey.trim()
    );
});

// 测试连接所需的最小字段验证
const isTestable = computed(() => {
    return !!(
        formData.value.provider &&
        formData.value.baseUrl.trim() &&
        formData.value.model.trim() &&
        formData.value.apiKey.trim()
    );
});

// 监听 modelValue 变化（编辑模式）
watch(() => props.modelValue, (newValue) => {
    if (newValue) {
        formData.value = {
            name: newValue.name,
            provider: newValue.provider,
            baseUrl: newValue.baseUrl,
            model: newValue.model,
            apiKey: newValue.apiKey,
            temperature: newValue.temperature,
            maxTokens: newValue.maxTokens,
            isDefault: newValue.isDefault,
            isActive: newValue.isActive
        };
        // 清除测试结果
        testResult.value = null;
    }
}, { immediate: true });

// 监听打开状态，重置表单（新建模式）
watch(() => props.isOpen, (isOpen) => {
    if (isOpen && !props.modelValue) {
        formData.value = {
            name: '',
            provider: 'deepseek',
            baseUrl: 'https://api.deepseek.com/v1',
            model: 'deepseek-chat',
            apiKey: '',
            temperature: 0.7,
            maxTokens: 4000,
            isDefault: false,
            isActive: true
        };
        // 清除测试结果
        testResult.value = null;
    }
});

// 厂商变化时更新默认参数
const handleProviderChanged = (template: ProviderTemplate) => {
    // 不再自动设置模型名称,让用户自己填写
    formData.value.temperature = template.defaultParams.temperature;
    formData.value.maxTokens = template.defaultParams.maxTokens;
    // 清除测试结果
    testResult.value = null;
};

// 测试连接
const handleTest = async () => {
    if (!isTestable.value || isTesting.value) return;

    isTesting.value = true;
    testResult.value = null;

    try {
        const testConfig = {
            name: formData.value.name || '临时测试配置',
            provider: formData.value.provider,
            baseUrl: formData.value.baseUrl,
            model: formData.value.model,
            apiKey: formData.value.apiKey,
            temperature: formData.value.temperature,
            maxTokens: formData.value.maxTokens,
            isDefault: false,
            isActive: true
        };

        // 直接调用 AI 服务进行测试,而不是通过 emit
        const { createAIService } = await import('@/services');
        const aiService = createAIService(testConfig as any);
        const result = await aiService.testConnection();

        if (result.success) {
            testResult.value = {
                success: true,
                message: `连接成功! 响应时间: ${result.responseTime}ms`
            };
        } else {
            testResult.value = {
                success: false,
                message: result.error || result.message || '连接失败,请检查配置是否正确。'
            };
        }
    } catch (error: any) {
        testResult.value = {
            success: false,
            message: error.message || '连接失败,请检查配置是否正确。'
        };
    } finally {
        isTesting.value = false;
    }
};

// 提交表单
const handleSubmit = () => {
    if (!isFormValid.value) return;

    const now = new Date().toISOString();

    if (isEditMode.value && props.modelValue?.id) {
        // 编辑模式
        emit('update', props.modelValue.id, {
            ...formData.value,
            updatedAt: now
        });
    } else {
        // 新建模式
        emit('save', {
            ...formData.value,
            testStatus: 'untested',
            createdAt: now,
            updatedAt: now
        });
    }

    emit('update:isOpen', false);
};
</script>