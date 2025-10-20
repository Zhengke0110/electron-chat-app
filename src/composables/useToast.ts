import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    title?: string;
    message: string;
    duration?: number;
}

const toasts = ref<Toast[]>([]);
let toastIdCounter = 0;

export function useToast() {
    const addToast = (
        message: string,
        type: ToastType = 'info',
        title?: string,
        duration = 5000
    ) => {
        const id = `toast-${++toastIdCounter}`;
        const toast: Toast = {
            id,
            type,
            title,
            message,
            duration
        };

        toasts.value.push(toast);

        return id;
    };

    const removeToast = (id: string) => {
        const index = toasts.value.findIndex(t => t.id === id);
        if (index > -1) {
            toasts.value.splice(index, 1);
        }
    };

    const success = (message: string, title?: string, duration?: number) => {
        return addToast(message, 'success', title, duration);
    };

    const error = (message: string, title?: string, duration?: number) => {
        return addToast(message, 'error', title, duration);
    };

    const warning = (message: string, title?: string, duration?: number) => {
        return addToast(message, 'warning', title, duration);
    };

    const info = (message: string, title?: string, duration?: number) => {
        return addToast(message, 'info', title, duration);
    };

    return {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info
    };
}
