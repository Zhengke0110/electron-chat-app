<template>
    <div class="space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
            <Icon icon="mdi:office-building" class="text-lg" />
            厂商选择
        </h3>

        <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
                AI 厂商 <span class="text-red-500">*</span>
            </label>

            <CustomSelect :model-value="modelValue.provider" :options="providerOptions"
                @update:model-value="handleProviderChange" placeholder="请选择厂商" />

            <p v-if="selectedTemplate" class="text-xs text-gray-500">
                {{ selectedTemplate.description }}
            </p>
        </div>

        <!-- API 地址 -->
        <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
                API 地址 <span class="text-red-500">*</span>
            </label>
            <input :value="modelValue.baseUrl"
                @input="$emit('update:baseUrl', ($event.target as HTMLInputElement).value)" type="url"
                placeholder="https://api.example.com/v1"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                required />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import CustomSelect from './children/CustomSelect.vue';
import type { SelectOption } from '../types';
import { PROVIDER_TEMPLATES } from '@/constants/providers';
import type { ProviderTemplate } from '@/types';

interface ProviderSectionProps {
    modelValue: {
        modelType: 'chat' | 'vision' | 'speech';
        provider: string;
        baseUrl: string;
    };
}

interface ProviderSectionEmits {
    (e: 'update:provider', value: string): void;
    (e: 'update:baseUrl', value: string): void;
    (e: 'providerChanged', template: ProviderTemplate): void;
}

const props = defineProps<ProviderSectionProps>();
const emit = defineEmits<ProviderSectionEmits>();

// 根据模型类型过滤厂商模板
const providerTemplates = computed(() => {
    return PROVIDER_TEMPLATES.filter(t => t.modelType === props.modelValue.modelType);
});

const providerOptions = computed<SelectOption[]>(() => {
    return providerTemplates.value.map(t => ({
        label: t.name,
        value: t.provider
    }));
});

const selectedTemplate = computed(() => {
    return providerTemplates.value.find(t => t.provider === props.modelValue.provider);
});

const handleProviderChange = (value: string) => {
    emit('update:provider', value);
    const template = providerTemplates.value.find(t => t.provider === value);
    if (template) {
        emit('update:baseUrl', template.baseUrl);
        emit('providerChanged', template);
    }
};
</script>
