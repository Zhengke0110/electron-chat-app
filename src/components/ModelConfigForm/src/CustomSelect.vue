<template>
    <div class="relative" ref="selectRef">
        <!-- 触发按钮 -->
        <button type="button" @click="toggleDropdown"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none flex items-center justify-between transition-colors">
            <span class="text-sm text-gray-900">
                {{ displayText }}
            </span>
            <svg class="w-4 h-4 text-gray-400 transition-transform" :class="{ 'rotate-180': isOpen }" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </button>

        <!-- 下拉菜单 -->
        <Transition enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95">
            <div v-if="isOpen"
                class="absolute z-[100] mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto">
                <div class="py-1">
                    <button v-for="option in options" :key="option.value" type="button" @click="selectOption(option)"
                        class="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 transition-colors flex items-center justify-between"
                        :class="{
                            'bg-blue-50 text-blue-700': option.value === modelValue,
                            'text-gray-700': option.value !== modelValue
                        }">
                        <span>{{ option.label }}</span>
                        <svg v-if="option.value === modelValue" class="w-4 h-4 text-blue-600" fill="currentColor"
                            viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

export interface SelectOption {
    label: string;
    value: string;
}

interface CustomSelectProps {
    modelValue: string;
    options: SelectOption[];
    placeholder?: string;
}

interface CustomSelectEmits {
    (e: 'update:modelValue', value: string): void;
}

const props = withDefaults(defineProps<CustomSelectProps>(), {
    placeholder: '请选择'
});

const emit = defineEmits<CustomSelectEmits>();

const isOpen = ref(false);
const selectRef = ref<HTMLElement>();

const displayText = computed(() => {
    const selected = props.options.find(opt => opt.value === props.modelValue);
    return selected?.label || props.placeholder;
});

const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
};

const selectOption = (option: SelectOption) => {
    emit('update:modelValue', option.value);
    isOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
    if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
        isOpen.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>
