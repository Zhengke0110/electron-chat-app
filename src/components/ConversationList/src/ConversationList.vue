<template>
    <div class="conversation-list">
        <transition-group name="conversation-fade" tag="div" class="space-y-1">
            <div v-for="item in items" :key="item.id"
                class="conversation-item relative group cursor-pointer transition-all duration-200 rounded-lg overflow-hidden border"
                :class="{
                    'bg-blue-50 border-blue-200 shadow-sm': selectedId === item.id,
                    'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300': selectedId !== item.id
                }">
                <!-- 主内容区域 -->
                <div @click.prevent="handleClick(item.id)" class="px-4 py-3 pr-12">
                    <!-- 标题 -->
                    <h2 class="text-base font-semibold text-gray-900 truncate mb-2 leading-tight">
                        {{ item.title }}
                    </h2>

                    <!-- 元数据 - 两行布局 -->
                    <div class="space-y-1">
                        <!-- 第一行：模型 -->
                        <div class="flex items-center gap-1.5 text-xs text-gray-500">
                            <Icon icon="mdi:robot-outline" class="text-sm flex-shrink-0" />
                            <span class="truncate">{{ item.selectedModel }}</span>
                        </div>

                        <!-- 第二行：时间 -->
                        <div class="flex items-center gap-1.5 text-xs text-gray-500">
                            <Icon icon="mdi:clock-outline" class="text-sm flex-shrink-0" />
                            <span class="whitespace-nowrap">{{ formatDateTime(item.updatedAt) }}</span>
                        </div>
                    </div>
                </div>

                <!-- 删除按钮 - 独立定位，不占用文档流 -->
                <button @click.stop="handleDelete(item.id)"
                    class="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-red-500 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:scale-110 transition-all duration-200 shadow-md z-10"
                    title="删除会话">
                    <Icon icon="mdi:delete-outline" class="text-lg" />
                </button>
            </div>
        </transition-group>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import dayjs from 'dayjs';
import type { ConversationProps } from './types';

defineProps<{
    items: ConversationProps[];
}>();

const emit = defineEmits<{
    select: [id: number];
    delete: [id: number];
}>();

// 当前选中的会话 ID
const selectedId = ref<number | null>(null);

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
/* 删除动画 */
.conversation-fade-enter-active {
    transition: all 0.3s ease-out;
}

.conversation-fade-leave-active {
    transition: all 0.3s ease-in;
}

.conversation-fade-enter-from {
    opacity: 0;
    transform: translateX(-30px);
}

.conversation-fade-leave-to {
    opacity: 0;
    transform: translateX(30px);
}

.conversation-fade-move {
    transition: transform 0.3s ease;
}
</style>
