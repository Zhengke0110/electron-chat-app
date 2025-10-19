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
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import ProviderSelect from '@/components/ProviderSelect';
import { useDbStore } from '@/store/db';

const route = useRoute();
const dbStore = useDbStore();

// 当前选择的模型
const selectedModel = ref('');

// 从 store 获取 providers
const { providers } = storeToRefs(dbStore);

// 调试信息
onMounted(() => {
    console.log('=== Settings 页面已加载 ===');
    console.log('当前路由路径:', route.path);
    console.log('当前路由名称:', route.name);
    console.log('Providers 数量:', providers.value.length);
    console.log('Providers 列表:', providers.value);
});

// 监听选中的模型变化
watch(selectedModel, (newValue, oldValue) => {
    console.log('=== 模型选择变化 ===');
    console.log('旧值:', oldValue);
    console.log('新值:', newValue);
});
</script>
