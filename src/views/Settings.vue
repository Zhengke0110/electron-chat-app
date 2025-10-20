<template>
    <div class="h-full overflow-y-auto bg-gray-50">
        <div class="max-w-4xl mx-auto p-8">
            <!-- 页面标题 -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">设置</h1>
                <p class="text-gray-600">管理你的 AI 模型配置</p>
            </div>

            <!-- 💬 对话模型配置区域 -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                <!-- 区域标题 -->
                <div class="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                                <Icon icon="mdi:message-text" class="text-2xl" />
                            </div>
                            <div>
                                <h2 class="text-xl font-bold text-gray-900">对话模型</h2>
                                <p class="text-sm text-gray-600 mt-0.5">用于文本对话和问答的 AI 模型（共 {{ chatConfigs.length }} 个）
                                </p>
                            </div>
                        </div>
                        <button @click="handleAddChatConfig"
                            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm">
                            <Icon icon="mdi:plus" class="text-lg" />
                            添加对话模型
                        </button>
                    </div>
                </div>

                <!-- 配置列表 -->
                <div class="p-6">
                    <div v-if="chatConfigs.length === 0" class="text-center py-12 text-gray-400">
                        <Icon icon="mdi:message-off-outline" class="text-6xl mx-auto mb-4 opacity-50" />
                        <p class="text-lg font-medium mb-2">还没有对话模型</p>
                        <p class="text-sm">点击上方按钮添加你的第一个对话模型</p>
                    </div>
                    <ModelConfigList v-else :configs="chatConfigs" @edit="handleEditConfig" @delete="handleDeleteConfig"
                        @test="handleTestConfig" @toggle-active="handleToggleActive" @set-default="handleSetDefault" />
                </div>
            </div>

            <!-- 👁️ 视觉模型配置区域 -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                <!-- 区域标题 -->
                <div class="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                                <Icon icon="mdi:eye" class="text-2xl" />
                            </div>
                            <div>
                                <h2 class="text-xl font-bold text-gray-900">视觉模型</h2>
                                <p class="text-sm text-gray-600 mt-0.5">用于图片分析和识别的多模态 AI 模型（共 {{ visionConfigs.length }}
                                    个）</p>
                            </div>
                        </div>
                        <button @click="handleAddVisionConfig"
                            class="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors shadow-sm">
                            <Icon icon="mdi:plus" class="text-lg" />
                            添加视觉模型
                        </button>
                    </div>
                </div>

                <!-- 配置列表 -->
                <div class="p-6">
                    <div v-if="visionConfigs.length === 0" class="text-center py-12 text-gray-400">
                        <Icon icon="mdi:image-off-outline" class="text-6xl mx-auto mb-4 opacity-50" />
                        <p class="text-lg font-medium mb-2">还没有视觉模型</p>
                        <p class="text-sm">点击上方按钮添加你的第一个视觉模型</p>
                    </div>
                    <ModelConfigList v-else :configs="visionConfigs" @edit="handleEditConfig"
                        @delete="handleDeleteConfig" @test="handleTestConfig" @toggle-active="handleToggleActive"
                        @set-default="handleSetDefault" />
                </div>
            </div>

            <!-- 🎤 语音模型配置区域 -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200">
                <!-- 区域标题 -->
                <div class="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-teal-50">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center text-white">
                                <Icon icon="mdi:microphone" class="text-2xl" />
                            </div>
                            <div>
                                <h2 class="text-xl font-bold text-gray-900">语音模型</h2>
                                <p class="text-sm text-gray-600 mt-0.5">用于语音识别转文字的 AI 模型（共 {{ speechConfigs.length }} 个）
                                </p>
                            </div>
                        </div>
                        <button @click="handleAddSpeechConfig"
                            class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors shadow-sm">
                            <Icon icon="mdi:plus" class="text-lg" />
                            添加语音模型
                        </button>
                    </div>
                </div>

                <!-- 配置列表 -->
                <div class="p-6">
                    <div v-if="speechConfigs.length === 0" class="text-center py-12 text-gray-400">
                        <Icon icon="mdi:microphone-off" class="text-6xl mx-auto mb-4 opacity-50" />
                        <p class="text-lg font-medium mb-2">还没有语音模型</p>
                        <p class="text-sm">点击上方按钮添加你的第一个语音模型</p>
                    </div>
                    <ModelConfigList v-else :configs="speechConfigs" @edit="handleEditConfig"
                        @delete="handleDeleteConfig" @test="handleTestConfig" @toggle-active="handleToggleActive"
                        @set-default="handleSetDefault" />
                </div>
            </div>

            <!-- ModelConfigForm 对话框 -->
            <ModelConfigForm v-model:is-open="isFormOpen" :model-value="editingConfig" @save="handleSaveConfig"
                @update="handleUpdateConfig" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { Icon } from '@iconify/vue';
import ModelConfigList from '@/components/ModelConfigList';
import ModelConfigForm from '@/components/ModelConfigForm';
import { useDbStore } from '@/store/db';
import { modelConfigService } from '@/services/modelConfigService';
import { useToast } from '@/composables';
import type { ModelConfig, ModelType } from '@/types';

const toast = useToast();

const dbStore = useDbStore();

// ModelConfigForm 相关状态
const isFormOpen = ref(false);
const editingConfig = ref<ModelConfig | undefined>(undefined);

// 从 store 获取 modelConfigs
const { modelConfigs } = storeToRefs(dbStore);

// 分别获取对话模型、视觉模型和语音模型
const chatConfigs = computed(() => {
    return modelConfigs.value.filter(c => c.modelType === 'chat');
});

const visionConfigs = computed(() => {
    return modelConfigs.value.filter(c => c.modelType === 'vision');
});

const speechConfigs = computed(() => {
    return modelConfigs.value.filter(c => c.modelType === 'speech');
});

// 页面加载时获取配置列表
onMounted(async () => {
    await dbStore.loadModelConfigs();
});

// ModelConfigList 事件处理 - 添加对话模型
const handleAddChatConfig = () => {
    editingConfig.value = {
        name: '',
        modelType: 'chat',
        provider: '',
        baseUrl: '',
        model: '',
        apiKey: '',
        temperature: 0.7,
        maxTokens: 2000,
        isDefault: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    } as ModelConfig;
    isFormOpen.value = true;
};

// 添加视觉模型
const handleAddVisionConfig = () => {
    editingConfig.value = {
        name: '',
        modelType: 'vision',
        provider: '',
        baseUrl: '',
        model: '',
        apiKey: '',
        temperature: 0.7,
        maxTokens: 2000,
        isDefault: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    } as ModelConfig;
    isFormOpen.value = true;
};

// 添加语音模型
const handleAddSpeechConfig = () => {
    editingConfig.value = {
        name: '',
        modelType: 'speech',
        provider: '',
        baseUrl: '',
        model: '',
        apiKey: '',
        temperature: 0.7,
        maxTokens: 2000,
        isDefault: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    } as ModelConfig;
    isFormOpen.value = true;
};

const handleEditConfig = (config: ModelConfig) => {
    editingConfig.value = config;
    isFormOpen.value = true;
};

const handleDeleteConfig = async (id: number) => {
    if (!confirm('确定要删除这个模型配置吗？')) {
        return;
    }

    try {
        await dbStore.deleteModelConfig(id);
        toast.success('模型配置已删除');
    } catch (error) {
        console.error('删除失败:', error);
        toast.error(error instanceof Error ? error.message : String(error), '删除失败');
    }
};

const handleTestConfig = async (config: ModelConfig) => {
    // 设置为测试中状态
    if (config.id) {
        await dbStore.updateModelConfig(config.id, {
            testStatus: 'testing',
            testMessage: undefined
        });
    }

    try {
        // 使用 Service 层进行测试
        const result = await modelConfigService.testConnection(config);

        // 更新测试状态到数据库
        if (config.id) {
            await dbStore.updateModelConfig(config.id, {
                testStatus: result.success ? 'success' : 'failed',
                testMessage: result.success
                    ? `测试成功 (${result.responseTime}ms)`
                    : (result.error || result.message)
            });
        }

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
    } catch (error) {
        console.error('测试失败:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);

        toast.error(errorMessage, '测试失败', 5000);

        // 更新测试状态
        if (config.id) {
            await dbStore.updateModelConfig(config.id, {
                testStatus: 'failed',
                testMessage: errorMessage
            });
        }
    }
};

const handleToggleActive = async (id: number) => {
    try {
        await dbStore.toggleModelConfigActive(id);
        toast.success('状态已更新');
    } catch (error) {
        console.error('切换失败:', error);
        toast.error(error instanceof Error ? error.message : String(error), '切换失败');
    }
};

const handleSetDefault = async (id: number) => {
    try {
        await dbStore.setDefaultModelConfig(id);
        toast.success('默认模型已设置');
    } catch (error) {
        console.error('设置默认失败:', error);
        toast.error(error instanceof Error ? error.message : String(error), '设置默认失败');
    }
};

// ModelConfigForm 事件处理
const handleSaveConfig = async (config: Omit<ModelConfig, 'id'>) => {
    try {
        await dbStore.createModelConfig(config);
        toast.success('模型配置已创建');
    } catch (error) {
        console.error('创建配置失败:', error);
        toast.error(error instanceof Error ? error.message : String(error), '创建配置失败');
    }
};

const handleUpdateConfig = async (id: number, changes: Partial<ModelConfig>) => {
    try {
        await dbStore.updateModelConfig(id, changes);
        toast.success('模型配置已更新');
    } catch (error) {
        console.error('更新配置失败:', error);
        toast.error(error instanceof Error ? error.message : String(error), '更新配置失败');
    }
};
</script>
