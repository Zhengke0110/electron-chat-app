<template>
    <div class="h-full overflow-y-auto p-6 bg-gray-50">
        <div class="max-w-2xl mx-auto">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">设置</h2>

            <div class="bg-white rounded shadow p-6 space-y-6">
                <!-- 模型选择示例 -->
                <div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">选择 AI 模型</h3>
                    <ProviderSelect v-model="selectedModel" :items="providers" placeholder="请选择模型" />
                    <p class="mt-2 text-sm text-gray-600">
                        当前选择: {{ selectedModel || '未选择' }}
                    </p>
                </div>

                <!-- 其他设置 -->
                <div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">其他设置</h3>
                    <p class="text-gray-600">更多设置选项...</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ProviderSelect, { type ProviderProps } from '@/components/ProviderSelect';

// 当前选择的模型
const selectedModel = ref('');

// Provider 数据示例
const providers = ref<ProviderProps[]>([
    {
        id: 1,
        name: 'openai',
        title: 'OpenAI',
        desc: 'OpenAI 提供的先进 AI 模型',
        avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=openai',
        createdAt: '2025-10-01T00:00:00',
        updatedAt: '2025-10-19T00:00:00',
        models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo']
    },
    {
        id: 2,
        name: 'anthropic',
        title: 'Anthropic',
        desc: 'Claude 系列模型',
        avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=anthropic',
        createdAt: '2025-10-01T00:00:00',
        updatedAt: '2025-10-19T00:00:00',
        models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']
    },
    {
        id: 3,
        name: 'google',
        title: 'Google',
        desc: 'Google Gemini 模型',
        avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=google',
        createdAt: '2025-10-01T00:00:00',
        updatedAt: '2025-10-19T00:00:00',
        models: ['gemini-pro', 'gemini-ultra']
    }
]);
</script>
