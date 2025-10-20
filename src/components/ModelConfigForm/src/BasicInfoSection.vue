<template>
    <div class="space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 border-b pb-2">📝 基础信息</h3>

        <!-- 配置名称 -->
        <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
                配置名称 <span class="text-red-500">*</span>
            </label>
            <input :value="modelValue.name" @input="$emit('update:name', ($event.target as HTMLInputElement).value)"
                type="text" placeholder="例如: 我的 DeepSeek"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required />
        </div>

        <!-- API Key -->
        <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
                API Key <span class="text-red-500">*</span>
            </label>
            <input :value="modelValue.apiKey" @input="$emit('update:apiKey', ($event.target as HTMLInputElement).value)"
                type="password" placeholder="sk-..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                required />
            <p class="text-xs text-gray-500">您的 API Key 将被安全加密存储</p>
        </div>

        <!-- 状态设置 -->
        <div class="space-y-3 pt-2">
            <label class="flex items-center gap-2 cursor-pointer">
                <input :checked="modelValue.isActive"
                    @change="$emit('update:isActive', ($event.target as HTMLInputElement).checked)" type="checkbox"
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span class="text-sm text-gray-700">启用此配置</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer">
                <input :checked="modelValue.isDefault"
                    @change="$emit('update:isDefault', ($event.target as HTMLInputElement).checked)" type="checkbox"
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span class="text-sm text-gray-700">设为默认配置</span>
            </label>
        </div>
    </div>
</template>

<script setup lang="ts">
interface BasicInfoProps {
    modelValue: {
        name: string;
        apiKey: string;
        isActive: boolean;
        isDefault: boolean;
    };
}

interface BasicInfoEmits {
    (e: 'update:name', value: string): void;
    (e: 'update:apiKey', value: string): void;
    (e: 'update:isActive', value: boolean): void;
    (e: 'update:isDefault', value: boolean): void;
}

defineProps<BasicInfoProps>();
defineEmits<BasicInfoEmits>();
</script>
