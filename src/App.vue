<template>
    <div class="flex items-center justify-between h-screen overflow-hidden">
        <!-- 左侧边栏 - 可折叠 -->
        <div class="relative h-full transition-all duration-300 ease-in-out flex-shrink-0" :style="{
            width: sidebarCollapsed ? '0px' : `${sidebarWidth}px`
        }">
            <!-- 侧边栏内容 -->
            <div class="absolute inset-0 bg-gray-200 border-r border-gray-300 flex flex-col transition-opacity duration-300"
                :class="[
                    sidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
                ]">
                <!-- 会话列表区域 -->
                <div class="flex-1 overflow-y-auto p-1">
                    <ConversationList :items="conversations" @select="handleSelectConversation"
                        @delete="openDeleteDialog" />
                </div>

                <!-- 底部按钮区域 -->
                <div class="border-t border-gray-300 p-3 bg-gray-100">
                    <div class="grid grid-cols-3 gap-2 mb-2">
                        <RouterLink to="/">
                            <button
                                class="w-full px-2 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex flex-col items-center justify-center gap-1 text-xs font-medium shadow-sm">
                                <Icon icon="mdi:message-plus" class="text-xl" />
                                <span>新聊天</span>
                            </button>
                        </RouterLink>
                        <RouterLink to="/settings">
                            <button
                                class="w-full px-2 py-2.5 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors flex flex-col items-center justify-center gap-1 text-xs font-medium shadow-sm">
                                <Icon icon="mdi:cog" class="text-xl" />
                                <span>设置</span>
                            </button>
                        </RouterLink>
                        <button @click="handleClearDatabase"
                            class="w-full px-2 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex flex-col items-center justify-center gap-1 text-xs font-medium shadow-sm"
                            title="清空数据库（测试用）">
                            <Icon icon="mdi:delete-sweep" class="text-xl" />
                            <span>清空</span>
                        </button>
                    </div>
                    <!-- 测试数据按钮 -->
                    <button @click="handleSeedConversations"
                        class="w-full px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-xs font-medium shadow-sm"
                        title="生成30条测试对话">
                        <Icon icon="mdi:database-plus" class="text-lg" />
                        <span>生成测试数据</span>
                    </button>
                </div>
            </div>

            <!-- 拖动调整手柄 - 只在侧边栏展开时显示 -->
            <div v-if="!sidebarCollapsed" @mousedown="startResize"
                class="absolute right-0 top-0 bottom-0 w-1 bg-transparent hover:bg-gray-400 cursor-col-resize transition-colors group">
                <div
                    class="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-20 bg-gray-400 group-hover:bg-gray-500 rounded-full transition-colors">
                </div>
            </div>

            <!-- 切换按钮 - 固定在侧边栏右侧边缘的中心 -->
            <button @click="toggleSidebar" :class="[
                'absolute top-1/2 -translate-y-1/2 z-50 transition-all duration-300',
                'bg-gray-200/80 backdrop-blur-md border shadow-lg',
                'hover:bg-gray-100/90 hover:scale-105',
                'rounded-lg px-1.5 py-6',
                sidebarCollapsed
                    ? 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700'
            ]" :style="{
                right: sidebarCollapsed ? 'auto' : '-14px',
                left: sidebarCollapsed ? '-14px' : 'auto'
            }" :title="sidebarCollapsed ? '显示侧边栏' : '隐藏侧边栏'">
                <Icon :icon="sidebarCollapsed ? 'mdi:chevron-right' : 'mdi:chevron-left'" class="text-base" />
            </button>
        </div>

        <!-- 右侧主内容区域 -->
        <div class="h-full flex-1 min-w-0">
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
                            <Icon icon="mdi:alert-circle" class="text-3xl text-orange-500" />
                            <span>确定要删除这个会话吗？</span>
                        </AlertDialogTitle>

                        <!-- 描述 -->
                        <AlertDialogDescription class="space-y-3 text-gray-600">
                            <p>此操作将会：</p>
                            <ul class="space-y-1 pl-2">
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:circle-small" class="text-gray-400" />
                                    永久删除该会话
                                </li>
                                <li class="flex items-center gap-2">
                                    <Icon icon="mdi:circle-small" class="text-gray-400" />
                                    删除该会话的所有消息记录
                                </li>
                            </ul>
                            <p class="text-red-600 font-semibold pt-2 flex items-center gap-2">
                                <Icon icon="mdi:alert" class="text-xl" />
                                此操作不可恢复！
                            </p>
                        </AlertDialogDescription>

                        <!-- 按钮组 -->
                        <div class="flex gap-3 pt-4">
                            <AlertDialogCancel
                                class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium flex items-center justify-center gap-2">
                                <Icon icon="mdi:close" class="text-lg" />
                                取消
                            </AlertDialogCancel>
                            <AlertDialogAction @click="confirmDelete"
                                class="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2">
                                <Icon icon="mdi:delete" class="text-lg" />
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
import { Icon } from '@iconify/vue';
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

// 侧边栏状态
const sidebarCollapsed = ref(false);
const sidebarWidth = ref(300); // 默认宽度
const MIN_SIDEBAR_WIDTH = 200; // 最小宽度
const MAX_SIDEBAR_WIDTH = 500; // 最大宽度
const isResizing = ref(false);

// 删除对话框状态
const deleteDialogOpen = ref(false);
const conversationToDelete = ref<number | null>(null);

// 切换侧边栏
const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
};

// 开始调整宽度
const startResize = (e: MouseEvent) => {
    isResizing.value = true;
    e.preventDefault();

    const startX = e.clientX;
    const startWidth = sidebarWidth.value;

    const onMouseMove = (moveEvent: MouseEvent) => {
        if (!isResizing.value) return;

        const deltaX = moveEvent.clientX - startX;
        const newWidth = startWidth + deltaX;

        // 限制宽度范围
        if (newWidth >= MIN_SIDEBAR_WIDTH && newWidth <= MAX_SIDEBAR_WIDTH) {
            sidebarWidth.value = newWidth;
        } else if (newWidth < MIN_SIDEBAR_WIDTH) {
            sidebarWidth.value = MIN_SIDEBAR_WIDTH;
        } else if (newWidth > MAX_SIDEBAR_WIDTH) {
            sidebarWidth.value = MAX_SIDEBAR_WIDTH;
        }

        // 如果拖到很窄（小于最小宽度的一半），自动收起
        if (newWidth < MIN_SIDEBAR_WIDTH / 2) {
            sidebarCollapsed.value = true;
            isResizing.value = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    };

    const onMouseUp = () => {
        isResizing.value = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
};

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

// 生成测试对话数据
const handleSeedConversations = async () => {
    const confirmed = confirm('📊 要生成 3000 条测试对话吗？\n\n这将帮助您测试滚动和展示功能。');

    if (!confirmed) {
        return;
    }

    try {
        // 导入测试数据生成函数
        const { seedConversations } = await import('./utils/seed-conversations');

        // 生成 30 条测试对话
        await seedConversations(3000);

        // 重新加载会话列表
        await dbStore.loadConversations();

        alert('✅ 已成功生成 3000 条测试对话！');
    } catch (error) {
        console.error('[生成测试数据] 失败:', error);
        alert('❌ 生成测试数据失败: ' + error);
    }
};
</script>
