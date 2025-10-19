<template>
    <div class="provider-select w-full">
        <SelectRoot v-model="currentModel">
            <SelectTrigger class="flex w-full items-center justify-between 
                rounded-md py-1.5 px-3 shadow-sm border outline-none data-[placeholder]:text-gray-400">
                <SelectValue :placeholder="placeholder" />
                <span class="h-5 w-5">▼</span>
            </SelectTrigger>
            <SelectPortal>
                <SelectContent class="bg-white rounded-md shadow-md z-[100] border">
                    <SelectViewport class="p-2">
                        <div v-for="provider in items" :key="provider.id">
                            <SelectLabel class="flex items-center px-6 h-7 text-gray-500">
                                <img v-if="provider.avatar" :src="provider.avatar" :alt="provider.name"
                                    class="h-5 w-5 mr-2 rounded">
                                {{ provider.title }}
                            </SelectLabel>
                            <SelectGroup>
                                <SelectItem v-for="(model, index) in provider.models" :key="index"
                                    :value="`${provider.id}/${model}`" class="outline-none rounded flex items-center h-7 px-6 relative
                                        text-green-700 cursor-pointer
                                        data-[highlighted]:bg-green-700 data-[highlighted]:text-white">
                                    <SelectItemIndicator class="absolute left-2 w-6">
                                        <span>✓</span>
                                    </SelectItemIndicator>
                                    <SelectItemText>{{ model }}</SelectItemText>
                                </SelectItem>
                            </SelectGroup>
                            <SelectSeparator class="h-[1px] my-2 bg-gray-300" />
                        </div>
                    </SelectViewport>
                </SelectContent>
            </SelectPortal>
        </SelectRoot>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import {
    SelectRoot,
    SelectTrigger,
    SelectValue,
    SelectPortal,
    SelectContent,
    SelectViewport,
    SelectLabel,
    SelectGroup,
    SelectItem,
    SelectItemIndicator,
    SelectItemText,
    SelectSeparator,
} from 'reka-ui';
import type { ProviderProps } from './types';

const props = withDefaults(defineProps<{
    items: ProviderProps[];
    modelValue?: string;
    placeholder?: string;
}>(), {
    placeholder: '选择模型'
});

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const currentModel = ref(props.modelValue || '');

// 监听 currentModel 变化，发射更新事件
watch(currentModel, (newValue) => {
    emit('update:modelValue', newValue);
});

// 监听外部 modelValue 变化
watch(() => props.modelValue, (newValue) => {
    if (newValue !== undefined) {
        currentModel.value = newValue;
    }
});
</script>

<style scoped>
/* 可以添加自定义样式 */
</style>