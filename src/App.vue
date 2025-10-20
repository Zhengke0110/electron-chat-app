<template>
    <div class="flex items-center justify-between h-screen">
        <!-- 左侧边栏 -->
        <div class="w-[300px] bg-gray-200 h-full border-r border-gray-300">
            <!-- 会话列表区域 -->
            <div class="h-[90%] overflow-y-auto">
                <ConversationList :items="conversations" @select="handleSelectConversation"
                    @contextmenu="handleContextMenu" />
            </div>

            <!-- 底部按钮区域 -->
            <div class="h-[10%] grid grid-cols-3 gap-2 p-2">
                <RouterLink to="/">
                    <button
                        class="w-full px-2 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center justify-center gap-1 text-sm">
                        <span>💬</span>
                        <span>新聊天</span>
                    </button>
                </RouterLink>
                <RouterLink to="/settings">
                    <button
                        class="w-full px-2 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 flex items-center justify-center gap-1 text-sm">
                        <span>⚙️</span>
                        <span>设置</span>
                    </button>
                </RouterLink>
                <button @click="handleClearDatabase"
                    class="w-full px-2 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center gap-1 text-sm"
                    title="清空数据库（测试用）">
                    <span>🗑️</span>
                    <span>清空</span>
                </button>
            </div>
        </div>

        <!-- 右侧主内容区域 -->
        <div class="h-full flex-1">
            <RouterView />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import ConversationList from './components/ConversationList';
import { useDbStore } from './store/db';

const router = useRouter();
const dbStore = useDbStore();

// 从 store 获取会话列表
const { conversations } = storeToRefs(dbStore);

// 初始化数据库
onMounted(async () => {
    await dbStore.initialize();
});

// 处理选择会话
const handleSelectConversation = (id: number) => {
    router.push(`/chat/${id}`);
};

// 处理右键菜单
const handleContextMenu = (id: number) => {
    // 可以在这里显示上下文菜单
};

// 清空数据库（测试用）
const handleClearDatabase = async () => {
    const confirmed = confirm('⚠️ 确定要清空所有数据吗？\n\n此操作将删除：\n- 所有会话\n- 所有消息\n- 所有模型配置\n\n此操作不可恢复！');

    if (!confirmed) {
        return;
    }

    try {
        // 导入 dbHelpers
        const { dbHelpers } = await import('./db');

        // 清空所有数据
        await dbHelpers.clearAllData();

        // 重新加载会话列表
        await dbStore.loadConversations();

        // 跳转到首页
        router.push('/');

        alert('✅ 数据库已成功清空！');
    } catch (error) {
        console.error('[清空数据库] 失败:', error);
        alert('❌ 清空数据库失败: ' + error);
    }
};
</script>
