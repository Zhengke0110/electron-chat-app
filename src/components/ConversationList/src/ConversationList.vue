<template>
    <div class="conversation-list">
        <transition-group name="conversation-fade" tag="div">
            <div class="item border-gray-300 border-t cursor-pointer transition-all duration-200 relative group" :class="{
                'bg-gray-100': selectedId === item.id,
                'bg-white': selectedId !== item.id
            }" v-for="item in items" :key="item.id">
                <!-- 主内容区域 -->
                <div @click.prevent="handleClick(item.id)" class="p-2 pr-10 hover:bg-gray-200 transition-colors"
                    :class="{ 'bg-gray-300': selectedId === item.id }">
                    <div class="flex justify-between items-center text-sm leading-5 text-gray-500">
                        <span>{{ item.selectedModel }}</span>
                        <span>{{ formatDate(item.updatedAt) }}</span>
                    </div>
                    <h2 class="font-semibold leading-6 text-gray-900 truncate">{{ item.title }}</h2>
                </div>

                <!-- 删除按钮 - 独立定位，不占用文档流 -->
                <button @click.stop="handleDelete(item.id)"
                    class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-red-500 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:scale-110 transition-all duration-200 shadow-md z-10"
                    title="删除会话">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </transition-group>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
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

// 格式化日期 - 使用 dayjs
const formatDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY-MM-DD');
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
