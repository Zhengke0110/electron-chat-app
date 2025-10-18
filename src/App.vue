<template>
    <div class="flex flex-col min-h-screen text-center">
        <!-- Header -->
        <header class="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-8 shadow-lg">
            <h1 class="text-4xl font-bold mb-2">{{ title }}</h1>
            <p class="text-lg opacity-90">欢迎使用 Electron + Vue 3 + TypeScript + Tailwind CSS</p>
        </header>

        <!-- Main Content -->
        <main class="flex-1 p-8 max-w-4xl mx-auto w-full">
            <!-- Counter Section -->
            <div class="bg-white rounded-lg p-8 mb-8 shadow-md hover:shadow-xl transition-shadow">
                <h2 class="text-2xl font-semibold mb-4 text-gray-800">计数器示例</h2>
                <p class="text-5xl font-bold text-indigo-500 my-6">{{ count }}</p>
                <div class="flex gap-4 justify-center">
                    <button @click="increment"
                        class="px-6 py-3 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 active:scale-95 transform transition-all shadow-md hover:shadow-lg">
                        增加
                    </button>
                    <button @click="decrement"
                        class="px-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 active:scale-95 transform transition-all shadow-md hover:shadow-lg">
                        减少
                    </button>
                    <button @click="reset"
                        class="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 active:scale-95 transform transition-all shadow-md hover:shadow-lg">
                        重置
                    </button>
                </div>
            </div>

            <!-- Info Section -->
            <div class="bg-white rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow">
                <h2 class="text-2xl font-semibold mb-6 text-gray-800">环境信息</h2>
                <ul class="space-y-3 max-w-md mx-auto">
                    <li
                        class="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span class="font-medium text-gray-700">Node:</span>
                        <code
                            class="px-3 py-1 bg-indigo-500 text-white rounded font-mono text-sm">{{ versions.node }}</code>
                    </li>
                    <li
                        class="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span class="font-medium text-gray-700">Chrome:</span>
                        <code
                            class="px-3 py-1 bg-indigo-500 text-white rounded font-mono text-sm">{{ versions.chrome }}</code>
                    </li>
                    <li
                        class="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span class="font-medium text-gray-700">Electron:</span>
                        <code
                            class="px-3 py-1 bg-indigo-500 text-white rounded font-mono text-sm">{{ versions.electron }}</code>
                    </li>
                </ul>
            </div>
        </main>

        <!-- Footer -->
        <footer class="bg-gray-100 p-6 text-gray-600 border-t border-gray-200">
            <p class="flex items-center justify-center gap-2">
                Built with <span class="text-red-500">❤️</span> using Electron Forge + Vite + Vue 3 + Tailwind CSS
            </p>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const title = ref('Chat App');
const count = ref(0);
const versions = ref({
    node: '',
    chrome: '',
    electron: ''
});

const increment = () => {
    count.value++;
};

const decrement = () => {
    count.value--;
};

const reset = () => {
    count.value = 0;
};

onMounted(() => {
    // 获取 Electron 版本信息
    if (window.electronAPI) {
        versions.value = window.electronAPI.versions;
    } else {
        versions.value = {
            node: 'N/A',
            chrome: 'N/A',
            electron: 'N/A'
        };
    }
});
</script>
