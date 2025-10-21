<template>
    <div class="conversation-list h-full">
        <!-- 虚拟滚动容器 -->
        <div ref="parentRef" class="h-full overflow-auto px-1">
            <!-- 虚拟滚动列表 -->
            <div :style="{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative'
            }">
                <!-- 只渲染可见的项目 -->
                <div v-for="virtualItem in virtualizer.getVirtualItems()" :key="String(virtualItem.key)" :style="{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`
                }">
                    <div class="conversation-item relative group cursor-pointer transition-all duration-200 rounded-lg overflow-hidden border mb-1"
                        :class="{
                            'bg-blue-50 border-blue-200 shadow-sm': selectedId === items[virtualItem.index].id,
                            'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300': selectedId !== items[virtualItem.index].id
                        }">
                        <!-- 主内容区域 -->
                        <div @click.prevent="handleClick(items[virtualItem.index].id)" class="px-4 py-3 pr-12">
                            <!-- 标题 -->
                            <h2 class="text-base font-semibold text-gray-900 truncate mb-2 leading-tight">
                                {{ items[virtualItem.index].title }}
                            </h2>

                            <!-- 元数据 - 两行布局 -->
                            <div class="space-y-1">
                                <!-- 第一行：模型 -->
                                <div class="flex items-center gap-1.5 text-xs text-gray-500">
                                    <Icon icon="mdi:robot-outline" class="text-sm flex-shrink-0" />
                                    <span class="truncate">{{ items[virtualItem.index].selectedModel }}</span>
                                </div>

                                <!-- 第二行：时间 -->
                                <div class="flex items-center gap-1.5 text-xs text-gray-500">
                                    <Icon icon="mdi:clock-outline" class="text-sm flex-shrink-0" />
                                    <span class="whitespace-nowrap">{{
                                        formatDateTime(items[virtualItem.index].updatedAt) }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- 删除按钮 - 独立定位，不占用文档流 -->
                        <button @click.stop="handleDelete(items[virtualItem.index].id)"
                            class="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-red-500 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:scale-110 transition-all duration-200 shadow-md z-10"
                            title="删除会话">
                            <Icon icon="mdi:delete-outline" class="text-lg" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';
import { Icon } from '@iconify/vue';
import dayjs from 'dayjs';
import type { ConversationProps } from './types';

const props = defineProps<{
    items: ConversationProps[];
}>();

const emit = defineEmits<{
    select: [id: number];
    delete: [id: number];
}>();

// 当前选中的会话 ID
const selectedId = ref<number | null>(null);

// 滚动容器引用
const parentRef = ref<HTMLElement | null>(null);

// 配置虚拟滚动
const virtualizer = useVirtualizer(computed(() => ({
    count: props.items.length,
    getScrollElement: () => parentRef.value,
    estimateSize: () => 100, // 估计每个项目的高度（px）
    overscan: 5, // 预渲染可见区域外的项目数量
})));

// 格式化日期时间 - 使用 dayjs
const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss');
};

// 处理点击事件
const handleClick = (id: number) => {
    selectedId.value = id;
    emit('select', id);
};

// 处理删除事件
const handleDelete = (id: number) => {
    emit('delete', id);
};
</script>

<style scoped>
/* 优化滚动条样式 - 更细更美观 */
.conversation-list ::-webkit-scrollbar {
    width: 4px;
}

.conversation-list ::-webkit-scrollbar-track {
    background: transparent;
    margin: 4px 0;
}

.conversation-list ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
    transition: background 0.2s;
}

.conversation-list ::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

/* 滚动时显示滚动条 */
.conversation-list ::-webkit-scrollbar-thumb {
    background: transparent;
}

.conversation-list:hover ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
}

.conversation-list:hover ::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>
