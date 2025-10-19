<template>
    <div class="conversation-list">
        <div class="item border-gray-300 border-t cursor-pointer p-2" :class="{
            'bg-gray-100 hover:bg-gray-300': selectedId === item.id,
            'bg-white hover:bg-gray-200': selectedId !== item.id
        }" v-for="item in items" :key="item.id" @contextmenu.prevent="handleContextMenu(item.id)">
            <a @click.prevent="handleClick(item.id)">
                <div class="flex justify-between items-center text-sm leading-5 text-gray-500">
                    <span>{{ item.selectedModel }}</span>
                    <span>{{ formatDate(item.updatedAt) }}</span>
                </div>
                <h2 class="font-semibold leading-6 text-gray-900 truncate">{{ item.title }}</h2>
            </a>
        </div>
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
    contextmenu: [id: number];
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

// 处理右键菜单
const handleContextMenu = (id: number) => {
    emit('contextmenu', id);
};
</script>
