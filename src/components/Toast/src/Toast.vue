<template>
    <ToastProvider>
        <ToastRoot v-for="toast in toasts" :key="toast.id" :duration="toast.duration" :type="type" :class="[
            'relative w-full max-w-[390px] overflow-hidden rounded-lg border bg-white p-4 shadow-lg pointer-events-auto',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
            'data-[swipe=move]:translate-x-[var(--reka-toast-swipe-move-x)]',
            'data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform data-[swipe=cancel]:duration-200',
            'data-[swipe=end]:animate-[swipe-out_100ms_ease-out_forwards]',
            getToastBorderClass(toast.type)
        ]" @update:open="(open) => !open && removeToast(toast.id)">
            <div class="flex items-start gap-3">
                <!-- 图标 -->
                <div class="flex-shrink-0">
                    <Icon :icon="getToastIcon(toast.type)" :class="getIconClass(toast.type)" class="text-xl" />
                </div>

                <!-- 内容 -->
                <div class="flex-1 min-w-0 pr-6">
                    <ToastTitle v-if="toast.title" class="text-sm font-semibold text-gray-900 mb-1">
                        {{ toast.title }}
                    </ToastTitle>
                    <ToastDescription class="text-sm text-gray-600">
                        {{ toast.message }}
                    </ToastDescription>
                </div>

                <!-- 关闭按钮 -->
                <ToastClose
                    class="absolute top-3 right-3 inline-flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-gray-400 hover:text-gray-900">
                    <Icon icon="mdi:close" class="text-lg" />
                </ToastClose>
            </div>
        </ToastRoot>

        <ToastViewport
            class="fixed top-0 right-0 z-[9999] flex max-w-[min(100vw-3rem,420px)] flex-col items-end gap-3 p-6 m-0 list-none outline-none pointer-events-none" />
    </ToastProvider>
</template>

<script setup lang="ts">
import {
    ToastProvider,
    ToastRoot,
    ToastTitle,
    ToastDescription,
    ToastClose,
    ToastViewport
} from 'reka-ui';
import { Icon } from '@iconify/vue';
import { useToast, type ToastType } from '@/composables/useToast';

const { toasts, removeToast } = useToast();
const type = 'foreground';

const getToastIcon = (type: ToastType): string => {
    const icons = {
        success: 'mdi:check-circle',
        error: 'mdi:alert-circle',
        warning: 'mdi:alert',
        info: 'mdi:information'
    };
    return icons[type];
};

const getToastBorderClass = (type: ToastType): string => {
    const classes = {
        success: 'border-l-4 border-l-green-500',
        error: 'border-l-4 border-l-red-500',
        warning: 'border-l-4 border-l-yellow-500',
        info: 'border-l-4 border-l-blue-500'
    };
    return classes[type];
};

const getIconClass = (type: ToastType): string => {
    const classes = {
        success: 'text-green-600',
        error: 'text-red-600',
        warning: 'text-yellow-600',
        info: 'text-blue-600'
    };
    return classes[type];
};
</script>

<style>
@keyframes swipe-out {
    from {
        transform: translateX(var(--reka-toast-swipe-end-x));
    }

    to {
        transform: translateX(calc(100% + 1.5rem));
    }
}
</style>
