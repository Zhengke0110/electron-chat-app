<template>
    <div class="flex flex-col min-h-screen bg-gray-50">
        <!-- Header -->
        <header class="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-8 shadow-lg text-center">
            <div class="flex items-center justify-center gap-3 mb-2">
                <Icon icon="mdi:chat" class="text-5xl" />
                <h1 class="text-4xl font-bold">{{ title }}</h1>
            </div>
            <p class="text-lg opacity-90">
                Electron + Vue 3 + Pinia + Tailwind CSS + Iconify
            </p>
        </header>

        <!-- Main Content -->
        <main class="flex-1 p-8 max-w-4xl mx-auto w-full space-y-6">
            <!-- Counter Section -->
            <div class="bg-white rounded-lg p-8 shadow-md">
                <div class="flex items-center justify-center gap-2 mb-4">
                    <Icon icon="mdi:counter" class="text-3xl text-indigo-500" />
                    <h2 class="text-2xl font-semibold text-gray-800">计数器 (Pinia Store)</h2>
                </div>

                <div class="text-center mb-6">
                    <p class="text-6xl font-bold text-indigo-500 mb-4">{{ count }}</p>
                    <div class="flex gap-3 justify-center text-sm">
                        <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                            双倍值: {{ doubleCount }}
                        </span>
                        <span class="px-3 py-1 rounded-full"
                            :class="isEven ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'">
                            {{ isEven ? '偶数' : '奇数' }}
                        </span>
                    </div>
                </div>

                <div class="flex gap-3 justify-center flex-wrap">
                    <button @click="increment"
                        class="px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg hover:bg-indigo-600 active:scale-95 flex items-center gap-2">
                        <Icon icon="mdi:plus" />
                        +1
                    </button>
                    <button @click="decrement"
                        class="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg hover:bg-purple-600 active:scale-95 flex items-center gap-2">
                        <Icon icon="mdi:minus" />
                        -1
                    </button>
                    <button @click="() => incrementBy(5)"
                        class="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg hover:bg-blue-600 active:scale-95 flex items-center gap-2">
                        <Icon icon="mdi:plus-circle-multiple" />
                        +5
                    </button>
                    <button @click="reset"
                        class="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg hover:bg-gray-600 active:scale-95 flex items-center gap-2">
                        <Icon icon="mdi:refresh" />
                        重置
                    </button>
                </div>
            </div>

            <!-- Environment Info -->
            <div class="bg-white rounded-lg p-6 shadow-md">
                <div class="flex items-center justify-center gap-2 mb-4">
                    <Icon icon="mdi:information" class="text-2xl text-indigo-500" />
                    <h3 class="text-xl font-semibold text-gray-800">环境信息</h3>
                </div>
                <div class="grid grid-cols-3 gap-4 text-center">
                    <div class="p-3 bg-gray-50 rounded-lg">
                        <Icon icon="mdi:nodejs" class="text-3xl text-green-600 mx-auto mb-1" />
                        <p class="text-xs text-gray-600">Node</p>
                        <p class="text-sm font-mono font-bold">{{ versions.node }}</p>
                    </div>
                    <div class="p-3 bg-gray-50 rounded-lg">
                        <Icon icon="mdi:google-chrome" class="text-3xl text-blue-600 mx-auto mb-1" />
                        <p class="text-xs text-gray-600">Chrome</p>
                        <p class="text-sm font-mono font-bold">{{ versions.chrome }}</p>
                    </div>
                    <div class="p-3 bg-gray-50 rounded-lg">
                        <Icon icon="simple-icons:electron" class="text-3xl text-cyan-600 mx-auto mb-1" />
                        <p class="text-xs text-gray-600">Electron</p>
                        <p class="text-sm font-mono font-bold">{{ versions.electron }}</p>
                    </div>
                </div>
            </div>
        </main>

        <!-- Footer -->
        <footer class="bg-white p-4 text-center text-gray-600 border-t text-sm">
            <p class="flex items-center justify-center gap-2">
                Built with
                <Icon icon="mdi:heart" class="text-red-500" />
                using Electron + Vue 3 + Pinia
            </p>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { storeToRefs } from 'pinia';
import { useAppStore } from './store/app';
import { useCounterStore } from './store/counter';

// 使用 Pinia stores
const appStore = useAppStore();
const counterStore = useCounterStore();

// 解构响应式状态 (使用 storeToRefs 保持响应性)
const { title, versions } = storeToRefs(appStore);
const { count, doubleCount, isEven } = storeToRefs(counterStore);

// 解构 actions (直接解构即可)
const { increment, decrement, reset, incrementBy } = counterStore;

onMounted(() => {
    // 获取并设置 Electron 版本信息
    if (window.electronAPI) {
        appStore.setVersions(window.electronAPI.versions);
    } else {
        appStore.setVersions({
            node: 'N/A',
            chrome: 'N/A',
            electron: 'N/A'
        });
    }
});
</script>
