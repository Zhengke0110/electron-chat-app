<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between border-b pb-2">
            <h3 class="text-sm font-semibold text-gray-700">⚙️ 高级参数</h3>
            <button @click="isExpanded = !isExpanded" type="button" class="text-xs text-blue-600 hover:text-blue-700">
                {{ isExpanded ? '收起' : '展开' }}
            </button>
        </div>

        <CollapsibleRoot v-model:open="isExpanded">
            <CollapsibleContent class="space-y-4">
                <!-- Temperature 滑块 -->
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <label class="block text-sm font-medium text-gray-700">
                            温度 (Temperature)
                        </label>
                        <span class="text-sm font-mono text-gray-600">{{ modelValue.temperature }}</span>
                    </div>

                    <SliderRoot :model-value="[modelValue.temperature]"
                        @update:model-value="$emit('update:temperature', $event[0])" :min="0" :max="2" :step="0.1"
                        class="relative flex items-center w-full h-5">
                        <SliderTrack class="relative h-1 w-full bg-gray-200 rounded-full">
                            <SliderRange class="absolute h-full bg-blue-500 rounded-full" />
                        </SliderTrack>
                        <SliderThumb
                            class="block w-4 h-4 bg-white border-2 border-blue-500 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer" />
                    </SliderRoot>

                    <p class="text-xs text-gray-500">
                        较低的值更保守，较高的值更有创意 (0-2)
                    </p>
                </div>

                <!-- Max Tokens -->
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">
                        最大 Tokens
                    </label>
                    <input :value="modelValue.maxTokens"
                        @input="$emit('update:maxTokens', parseInt(($event.target as HTMLInputElement).value) || 0)"
                        type="number" min="1" max="32000" step="100"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                    <p class="text-xs text-gray-500">
                        限制模型生成的最大token数 (建议: 1000-8000)
                    </p>
                </div>
            </CollapsibleContent>
        </CollapsibleRoot>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
    CollapsibleRoot,
    CollapsibleContent,
    SliderRoot,
    SliderTrack,
    SliderRange,
    SliderThumb
} from 'reka-ui';

interface AdvancedSectionProps {
    modelValue: {
        temperature: number;
        maxTokens: number;
    };
}

interface AdvancedSectionEmits {
    (e: 'update:temperature', value: number): void;
    (e: 'update:maxTokens', value: number): void;
}

defineProps<AdvancedSectionProps>();
defineEmits<AdvancedSectionEmits>();

const isExpanded = ref(false);
</script>
