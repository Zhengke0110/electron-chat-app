<template>
    <div class="flex items-center justify-between h-screen">
        <!-- 左侧边栏 -->
        <div class="w-[300px] bg-gray-200 h-full border-r border-gray-300">
            <!-- 会话列表区域 -->
            <div class="h-[90%] overflow-y-auto">
                <ConversationList :items="conversations" @select="handleSelectConversation"
                    @delete="openDeleteDialog" />
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

        <!-- Toast 通知 -->
        <Toast />

        <!-- 删除确认对话框 -->
        <AlertDialogRoot v-model:open="deleteDialogOpen">
            <AlertDialogPortal>
                <AlertDialogOverlay
                    class="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <AlertDialogContent
                    class="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg shadow-lg p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
                    <div class="space-y-4">
                        <!-- 标题 -->
                        <AlertDialogTitle class="flex items-center gap-2 text-xl font-semibold text-gray-900">
                            <span class="text-2xl">⚠️</span>
                            <span>确定要删除这个会话吗？</span>
                        </AlertDialogTitle>

                        <!-- 描述 -->
                        <AlertDialogDescription class="space-y-3 text-gray-600">
                            <p>此操作将会：</p>
                            <ul class="list-disc list-inside space-y-1 pl-2">
                                <li>永久删除该会话</li>
                                <li>删除该会话的所有消息记录</li>
                            </ul>
                            <p class="text-red-600 font-semibold pt-2">⚠️ 此操作不可恢复！</p>
                        </AlertDialogDescription>

                        <!-- 按钮组 -->
                        <div class="flex gap-3 pt-4">
                            <AlertDialogCancel
                                class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium">
                                取消
                            </AlertDialogCancel>
                            <AlertDialogAction @click="confirmDelete"
                                class="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium">
                                确定删除
                            </AlertDialogAction>
                        </div>
                    </div>
                </AlertDialogContent>
            </AlertDialogPortal>
        </AlertDialogRoot>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import ConversationList from './components/ConversationList';
import Toast from './components/Toast';
import {
    AlertDialogRoot,
    AlertDialogPortal,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction,
} from 'reka-ui';
import { useDbStore } from './store/db';

const router = useRouter();
const dbStore = useDbStore();

// 从 store 获取会话列表
const { conversations } = storeToRefs(dbStore);

// 删除对话框状态
const deleteDialogOpen = ref(false);
const conversationToDelete = ref<number | null>(null);

// 初始化数据库
onMounted(async () => {
    await dbStore.initialize();
});

// 处理选择会话
const handleSelectConversation = (id: number) => {
    router.push(`/chat/${id}`);
};

// 打开删除确认对话框
const openDeleteDialog = (id: number) => {
    conversationToDelete.value = id;
    deleteDialogOpen.value = true;
};

// 确认删除会话
const confirmDelete = async () => {
    if (conversationToDelete.value === null) return;

    try {
        const deletedId = conversationToDelete.value;

        // 如果删除的是当前正在查看的会话，跳转到首页
        if (router.currentRoute.value.path === `/chat/${deletedId}`) {
            router.push('/');
        }

        // 执行删除
        await dbStore.deleteConversation(deletedId);

        // 关闭对话框
        deleteDialogOpen.value = false;
        conversationToDelete.value = null;
    } catch (error) {
        console.error('[删除会话] 失败:', error);
        alert('❌ 删除会话失败: ' + error);
    }
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
