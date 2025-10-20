<template>
    <div class="h-full overflow-y-auto bg-gray-50">
        <div class="max-w-4xl mx-auto p-8">
            <!-- 页面标题 -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">设置</h1>
                <p class="text-gray-600">管理你的 AI 模型配置</p>
            </div>

            <!-- 模型配置区域 -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200">
                <!-- 区域标题 -->
                <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 class="text-lg font-semibold text-gray-900">AI 模型</h2>
                        <p class="text-sm text-gray-500 mt-0.5">配置和管理你的 AI 模型接口</p>
                    </div>
                    <button @click="handleAddConfig"
                        class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4">
                            </path>
                        </svg>
                        添加模型
                    </button>
                </div>

                <!-- 类型筛选标签 -->
                <div class="px-6 py-3 border-b border-gray-200 bg-gray-50">
                    <div class="flex items-center gap-2">
                        <button @click="selectedModelType = 'all'" :class="[
                            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                            selectedModelType === 'all'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                        ]">
                            全部 ({{ configCounts.all }})
                        </button>
                        <button @click="selectedModelType = 'chat'" :class="[
                            'px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1',
                            selectedModelType === 'chat'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                        ]">
                            <span>💬</span>
                            <span>对话模型 ({{ configCounts.chat }})</span>
                        </button>
                        <button @click="selectedModelType = 'vision'" :class="[
                            'px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1',
                            selectedModelType === 'vision'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                        ]">
                            <span>👁️</span>
                            <span>视觉模型 ({{ configCounts.vision }})</span>
                        </button>
                    </div>
                </div>

                <!-- 配置列表 -->
                <div class="p-6">
                    <ModelConfigList :configs="filteredConfigs" @edit="handleEditConfig" @delete="handleDeleteConfig"
                        @test="handleTestConfig" @toggle-active="handleToggleActive" @set-default="handleSetDefault" />
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
import ModelConfigList from '@/components/ModelConfigList';
import ModelConfigForm from '@/components/ModelConfigForm';
import { useDbStore } from '@/store/db';
import { modelConfigService } from '@/services/modelConfigService';
import type { ModelConfig, ModelType } from '@/types';

const dbStore = useDbStore();

// 当前筛选的模型类型
const selectedModelType = ref<ModelType | 'all'>('all');

// ModelConfigForm 相关状态
const isFormOpen = ref(false);
const editingConfig = ref<ModelConfig | undefined>(undefined);

// 从 store 获取 modelConfigs
const { modelConfigs } = storeToRefs(dbStore);

// 根据类型筛选配置
const filteredConfigs = computed(() => {
    if (selectedModelType.value === 'all') {
        return modelConfigs.value;
    }
    return modelConfigs.value.filter(c => c.modelType === selectedModelType.value);
});

// 统计不同类型的配置数量
const configCounts = computed(() => {
    const counts = { chat: 0, vision: 0, all: 0 };
    modelConfigs.value.forEach(c => {
        counts[c.modelType]++;
        counts.all++;
    });
    return counts;
});

// 页面加载时获取配置列表
onMounted(async () => {
    await dbStore.loadModelConfigs();
});

// ModelConfigList 事件处理
const handleAddConfig = () => {
    editingConfig.value = undefined;
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
    } catch (error) {
        console.error('删除失败:', error);
        alert(`删除失败: ${error instanceof Error ? error.message : String(error)}`);
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

        // 显示测试结果
        const message = modelConfigService.formatTestResultMessage(result);
        alert(message);

        // 更新测试状态到数据库
        if (config.id) {
            await dbStore.updateModelConfig(config.id, {
                testStatus: result.success ? 'success' : 'failed',
                testMessage: result.success
                    ? `测试成功 (${result.responseTime}ms)`
                    : (result.error || result.message)
            });
        }
    } catch (error) {
        console.error('测试失败:', error);
        alert(`❌ 测试失败: ${error instanceof Error ? error.message : String(error)}`);

        // 更新测试状态
        if (config.id) {
            await dbStore.updateModelConfig(config.id, {
                testStatus: 'failed',
                testMessage: error instanceof Error ? error.message : String(error)
            });
        }
    }
};

const handleToggleActive = async (id: number) => {
    try {
        await dbStore.toggleModelConfigActive(id);
    } catch (error) {
        console.error('切换失败:', error);
        alert(`切换失败: ${error instanceof Error ? error.message : String(error)}`);
    }
};

const handleSetDefault = async (id: number) => {
    try {
        await dbStore.setDefaultModelConfig(id);
    } catch (error) {
        console.error('设置默认失败:', error);
        alert(`设置默认失败: ${error instanceof Error ? error.message : String(error)}`);
    }
};

// ModelConfigForm 事件处理
const handleSaveConfig = async (config: Omit<ModelConfig, 'id'>) => {
    try {
        await dbStore.createModelConfig(config);
    } catch (error) {
        console.error('创建配置失败:', error);
        alert(`创建配置失败: ${error instanceof Error ? error.message : String(error)}`);
    }
};

const handleUpdateConfig = async (id: number, changes: Partial<ModelConfig>) => {
    try {
        await dbStore.updateModelConfig(id, changes);
    } catch (error) {
        console.error('更新配置失败:', error);
        alert(`更新配置失败: ${error instanceof Error ? error.message : String(error)}`);
    }
};
</script>
