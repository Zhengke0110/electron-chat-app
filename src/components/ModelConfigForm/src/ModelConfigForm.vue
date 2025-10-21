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
                            <Icon icon="mdi:close" class="text-2xl" />
                        </DialogClose>
                    </div>

                    <!-- 描述 -->
                    <DialogDescription class="text-sm text-gray-600 mb-4">
                        {{ isEditMode ? '修改现有模型的配置信息' : '配置新的 AI 模型以便在聊天中使用' }}
                    </DialogDescription>

                    <!-- 表单 -->
                    <form @submit.prevent="handleSubmit" class="space-y-6">
                        <!-- 模型类型选择 -->
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">
                                模型类型 <span class="text-red-500">*</span>
                            </label>
                            <div class="grid grid-cols-3 gap-3">
                                <button type="button" @click="handleModelTypeChange('chat')" :class="[
                                    'px-4 py-3 border-2 rounded-lg text-left transition-all',
                                    formData.modelType === 'chat'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                ]">
                                    <div class="font-semibold flex items-center gap-2">
                                        <Icon icon="mdi:message-text" class="text-lg" />
                                        对话模型
                                    </div>
                                    <div class="text-xs mt-1 opacity-75">文本对话和推理</div>
                                </button>
                                <button type="button" @click="handleModelTypeChange('vision')" :class="[
                                    'px-4 py-3 border-2 rounded-lg text-left transition-all',
                                    formData.modelType === 'vision'
                                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                ]">
                                    <div class="font-semibold flex items-center gap-2">
                                        <Icon icon="mdi:eye" class="text-lg" />
                                        视觉模型
                                    </div>
                                    <div class="text-xs mt-1 opacity-75">图片识别和分析</div>
                                </button>
                                <button type="button" @click="handleModelTypeChange('speech')" :class="[
                                    'px-4 py-3 border-2 rounded-lg text-left transition-all',
                                    formData.modelType === 'speech'
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                ]">
                                    <div class="font-semibold flex items-center gap-2">
                                        <Icon icon="mdi:microphone" class="text-lg" />
                                        语音模型
                                    </div>
                                    <div class="text-xs mt-1 opacity-75">语音识别转文字</div>
                                </button>
                            </div>
                        </div>

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

                        <!-- 系统提示词（根据模型类型显示不同的预设） -->
                        <SystemPromptSection v-model="formData.systemPrompt" :model-type="formData.modelType" />

                        <!-- 按钮组 -->
                        <div class="flex items-center justify-between gap-3 pt-4 border-t">
                            <!-- 左侧测试按钮 -->
                            <button type="button" @click="handleTest" :disabled="!isTestable || isTesting"
                                class="px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-2">
                                <Icon v-if="isTesting" icon="mdi:loading" class="animate-spin text-lg" />
                                <Icon v-else icon="mdi:test-tube" class="text-lg" />
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
                            'p-4 rounded-lg text-sm flex items-start gap-3',
                            testResult.success
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                        ]">
                            <Icon :icon="testResult.success ? 'mdi:check-circle' : 'mdi:alert-circle'"
                                class="text-xl flex-shrink-0 mt-0.5" />
                            <div class="flex-1 min-w-0">
                                <div class="flex items-baseline justify-between gap-2 mb-1">
                                    <p class="font-semibold">
                                        {{ testResult.success ? '连接成功' : '连接失败' }}
                                    </p>
                                    <span v-if="testResult.success && testResult.responseTime"
                                        class="text-xs font-medium opacity-75 whitespace-nowrap">
                                        {{ testResult.responseTime }}ms
                                    </span>
                                </div>
                                <p v-if="testResult.error || testResult.message"
                                    class="text-xs opacity-90 leading-relaxed">
                                    {{ testResult.error || testResult.message }}
                                </p>
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
import { Icon } from '@iconify/vue';
import BasicInfoSection from './BasicInfoSection.vue';
import ProviderSection from './ProviderSection.vue';
import ModelSection from './ModelSection.vue';
import AdvancedSection from './AdvancedSection.vue';
import SystemPromptSection from './SystemPromptSection.vue';
import { PROVIDER_TEMPLATES, getProviderTemplatesByType } from '@/constants/providers';
import { useModelConfigTest } from '@/composables/useModelConfigTest';
import { useToast } from '@/composables';
import type { ModelConfigFormProps, ModelConfigFormEmits, FormData } from './types';
import type { ProviderTemplate } from '@/types';

const props = defineProps<ModelConfigFormProps>();
const emit = defineEmits<ModelConfigFormEmits>();

// 使用测试 Composable
const {
    isTesting,
    testResult,
    testConnection,
    isTestable: isConfigTestable,
    clearTestResult
} = useModelConfigTest();

// 使用 Toast
const toast = useToast();

// 是否编辑模式
const isEditMode = computed(() => !!props.modelValue?.id);

// 表单数据
const formData = ref<FormData>({
    name: '',
    modelType: 'chat',
    provider: 'deepseek',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    apiKey: '',
    temperature: 0.7,
    maxTokens: 4000,
    systemPrompt: undefined,
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
    return isConfigTestable(formData.value);
});

// 监听 modelValue 变化（编辑模式）
watch(() => props.modelValue, (newValue) => {
    if (newValue) {
        formData.value = {
            name: newValue.name,
            modelType: newValue.modelType,
            provider: newValue.provider,
            baseUrl: newValue.baseUrl,
            model: newValue.model,
            apiKey: newValue.apiKey,
            temperature: newValue.temperature,
            maxTokens: newValue.maxTokens,
            systemPrompt: newValue.systemPrompt,
            isDefault: newValue.isDefault,
            isActive: newValue.isActive
        };
        // 清除测试结果
        clearTestResult();
    }
}, { immediate: true });

// 监听打开状态，重置表单（新建模式）
watch(() => props.isOpen, (isOpen) => {
    if (isOpen && !props.modelValue) {
        formData.value = {
            name: '',
            modelType: 'chat',
            provider: 'deepseek',
            baseUrl: 'https://api.deepseek.com/v1',
            model: 'deepseek-chat',
            apiKey: '',
            temperature: 0.7,
            maxTokens: 4000,
            systemPrompt: undefined,
            isDefault: false,
            isActive: true
        };
        // 清除测试结果
        clearTestResult();
    }
});

// 模型类型切换
const handleModelTypeChange = (type: 'chat' | 'vision' | 'speech') => {
    if (formData.value.modelType === type) return;

    formData.value.modelType = type;

    // 根据类型设置默认厂商
    const templates = getProviderTemplatesByType(type);

    if (templates.length > 0) {
        const defaultTemplate = templates[0];
        formData.value.provider = defaultTemplate.provider;
        formData.value.baseUrl = defaultTemplate.baseUrl;
        formData.value.model = defaultTemplate.models[0] || '';
        formData.value.temperature = defaultTemplate.defaultParams.temperature;
        formData.value.maxTokens = defaultTemplate.defaultParams.maxTokens;
    }

    // 清除测试结果
    clearTestResult();
};

// 厂商变化时更新默认参数
const handleProviderChanged = (template: ProviderTemplate) => {
    // 不再自动设置模型名称,让用户自己填写
    formData.value.temperature = template.defaultParams.temperature;
    formData.value.maxTokens = template.defaultParams.maxTokens;
    // 清除测试结果
    clearTestResult();
};

// 测试连接
const handleTest = async () => {
    if (!isTestable.value || isTesting.value) return;

    // 如果是编辑模式且有 id,先设置测试中状态
    if (isEditMode.value && props.modelValue?.id) {
        const { useDbStore } = await import('@/store/db');
        const dbStore = useDbStore();

        await dbStore.updateModelConfig(props.modelValue.id, {
            testStatus: 'testing',
            testMessage: undefined
        });
    }

    // 调用 composable 的测试方法
    const result = await testConnection(formData.value);

    // 显示测试结果 Toast
    if (result.success) {
        toast.success(
            `连接成功！响应时间: ${result.responseTime}ms`,
            '测试成功',
            3000
        );
    } else {
        toast.error(
            result.error || result.message,
            '测试失败',
            5000
        );
    }

    // 如果是编辑模式且有 id,同步测试结果到数据库
    if (isEditMode.value && props.modelValue?.id) {
        const { useDbStore } = await import('@/store/db');
        const dbStore = useDbStore();

        await dbStore.updateModelConfig(props.modelValue.id, {
            testStatus: result.success ? 'success' : 'failed',
            testMessage: result.success
                ? `测试成功 (${result.responseTime}ms)`
                : (result.error || result.message)
        });
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
        // 新建模式 - 保留测试结果
        emit('save', {
            ...formData.value,
            testStatus: testResult.value ? (testResult.value.success ? 'success' : 'failed') : 'untested',
            testMessage: testResult.value ? testResult.value.message : undefined,
            createdAt: now,
            updatedAt: now
        });
    }

    emit('update:isOpen', false);
};
</script>