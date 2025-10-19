<template>
    <div class="flex flex-col h-screen bg-gray-50">
        <!-- Header -->
        <header class="bg-indigo-600 text-white shadow">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <h1 class="text-xl font-bold">Chat App</h1>

                    <!-- Navigation -->
                    <nav class="flex gap-2">
                        <router-link v-for="route in navRoutes" :key="route.path" :to="route.path"
                            class="px-3 py-1.5 rounded transition-colors" :class="isActiveRoute(route.path)
                                ? 'bg-white text-indigo-600'
                                : 'hover:bg-indigo-700'">
                            {{ route.name }}
                        </router-link>
                    </nav>
                </div>
            </div>
        </header>

        <!-- Main Content - Router View -->
        <main class="flex-1 overflow-hidden">
            <router-view />
        </main>
    </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();

// 导航路由配置
const navRoutes = [
    { path: '/', name: '首页' },
    { path: '/chat', name: '聊天' },
    { path: '/settings', name: '设置' },
    { path: '/about', name: '关于' }
];

// 检查当前路由是否激活
const isActiveRoute = (path: string) => {
    return route.path === path;
};
</script>
