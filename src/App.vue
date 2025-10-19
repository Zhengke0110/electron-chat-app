<template>
    <div class="flex items-center justify-between h-screen">
        <!-- 左侧边栏 -->
        <div class="w-[300px] bg-gray-200 h-full border-r border-gray-300">
            <!-- 会话列表区域 -->
            <div class="h-[90%] overflow-y-auto">
                <ConversationList :items="conversationItems" @select="handleSelectConversation"
                    @contextmenu="handleContextMenu" />
            </div>

            <!-- 底部按钮区域 -->
            <div class="h-[10%] grid grid-cols-2 gap-2 p-2">
                <RouterLink to="/">
                    <button
                        class="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center justify-center gap-2">
                        <span>💬</span>
                        <span>新建聊天</span>
                    </button>
                </RouterLink>
                <RouterLink to="/settings">
                    <button
                        class="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 flex items-center justify-center gap-2">
                        <span>⚙️</span>
                        <span>设置</span>
                    </button>
                </RouterLink>
            </div>
        </div>

        <!-- 右侧主内容区域 -->
        <div class="h-full flex-1">
            <RouterView />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ConversationList, { type ConversationProps } from './components/ConversationList';

const router = useRouter();

// 会话列表数据
const conversationItems = ref<ConversationProps[]>([
    {
        id: 1,
        title: 'AI 助手对话',
        selectedModel: 'gpt-4',
        createdAt: '2025-10-19T09:00:00',
        updatedAt: '2025-10-19T10:30:00',
        providerId: 1
    },
    {
        id: 2,
        title: '代码问题咨询',
        selectedModel: 'gpt-3.5-turbo',
        createdAt: '2025-10-18T14:20:00',
        updatedAt: '2025-10-19T08:15:00',
        providerId: 1
    },
    {
        id: 3,
        title: 'Vue3 学习笔记',
        selectedModel: 'claude-3',
        createdAt: '2025-10-17T16:45:00',
        updatedAt: '2025-10-18T22:10:00',
        providerId: 2
    },
    {
        id: 4,
        title: 'TypeScript 项目开发',
        selectedModel: 'gpt-4-turbo',
        createdAt: '2025-10-16T11:30:00',
        updatedAt: '2025-10-17T19:20:00',
        providerId: 1
    }
]);

// 处理选择会话
const handleSelectConversation = (id: number) => {
    console.log('选择会话:', id);
    // 可以在这里导航到聊天页面
    router.push(`/chat/${id}`);
};

// 处理右键菜单
const handleContextMenu = (id: number) => {
    console.log('右键菜单:', id);
    // 可以在这里显示上下文菜单
};
</script>
