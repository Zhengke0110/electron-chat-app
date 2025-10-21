<template>
    <DialogRoot :open="props.isOpen" @update:open="handleOpenChange">
        <DialogPortal>
            <DialogOverlay class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
            <DialogContent
                class="fixed top-1/2 left-1/2 z-50 w-full max-w-3xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white shadow-xl">
                <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <DialogTitle class="text-xl font-semibold text-gray-900">
                        上传图片
                    </DialogTitle>
                    <DialogClose
                        class="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </DialogClose>
                </div>

                <div class="px-6 py-5 space-y-6">
                    <!-- 上传区域 -->
                    <div class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6">
                        <div v-if="!hasImage" class="flex flex-col items-center justify-center text-center space-y-4">
                            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow">
                                <svg class="h-8 w-8 text-indigo-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 15a4 4 0 014-4h5l3-3h3a4 4 0 014 4v5a4 4 0 01-4 4H7a4 4 0 01-4-4v-2z" />
                                </svg>
                            </div>
                            <div class="space-y-2">
                                <p class="text-lg font-medium text-gray-900">选择一张图片上传</p>
                                <p class="text-sm text-gray-500">
                                    支持 JPG、PNG、WEBP 等格式，单张不超过 {{ maxSizeLabel }}
                                </p>
                            </div>
                            <div class="flex items-center gap-3">
                                <button type="button" @click="triggerFileSelect"
                                    class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700">
                                    选择图片
                                </button>
                                <span class="text-xs text-gray-500">或将图片拖拽到此处</span>
                            </div>
                            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
                        </div>

                        <div v-else class="grid gap-6 lg:grid-cols-[220px,1fr]">
                            <!-- 图片预览 -->
                            <div class="space-y-4">
                                <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                    <img :src="currentImage?.fileUrl" :alt="currentImage?.fileName"
                                        class="h-52 w-full object-cover" />
                                </div>

                                <button type="button" @click="handleRemoveImage"
                                    class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:text-gray-800">
                                    重新选择图片
                                </button>
                            </div>

                            <!-- 图片信息 -->
                            <div class="space-y-4">
                                <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                    <h3 class="text-sm font-semibold text-gray-900">图片信息</h3>
                                    <dl class="mt-3 space-y-2 text-sm text-gray-600">
                                        <div class="flex justify-between">
                                            <dt class="text-gray-500">文件名</dt>
                                            <dd class="max-w-[60%] truncate font-medium text-gray-800"
                                                :title="currentImage?.fileName">
                                                {{ currentImage?.fileName }}
                                            </dd>
                                        </div>
                                        <div class="flex justify-between">
                                            <dt class="text-gray-500">文件大小</dt>
                                            <dd class="font-medium text-gray-800">{{ fileSizeLabel }}</dd>
                                        </div>
                                        <div v-if="currentImage?.width && currentImage?.height"
                                            class="flex justify-between">
                                            <dt class="text-gray-500">分辨率</dt>
                                            <dd class="font-medium text-gray-800">
                                                {{ currentImage.width }} × {{ currentImage.height }}
                                            </dd>
                                        </div>
                                        <div class="flex justify-between">
                                            <dt class="text-gray-500">格式</dt>
                                            <dd class="font-medium text-gray-800">{{ currentImage?.mimeType }}</dd>
                                        </div>
                                    </dl>
                                </div>

                                <div v-if="isUploading || uploadProgress > 0"
                                    class="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                                    <p class="text-sm font-medium text-indigo-700">正在处理图片</p>
                                    <div class="mt-2 h-2 w-full rounded-full bg-indigo-100">
                                        <div class="h-2 rounded-full bg-indigo-500 transition-all"
                                            :style="{ width: `${uploadProgress}%` }"></div>
                                    </div>
                                    <p class="mt-2 text-xs text-indigo-600">{{ uploadStatusLabel }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 错误提示 -->
                    <div v-if="uploadError"
                        class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {{ uploadError }}
                    </div>

                    <!-- 视觉分析 -->
                    <div v-if="hasImage" class="space-y-4">
                        <div class="flex items-center justify-between">
                            <h3 class="text-base font-semibold text-gray-900">视觉分析</h3>
                            <span v-if="analysisMeta" class="text-xs text-gray-500">
                                耗时 {{ analysisMeta.analysisTime }} ms · 模型 {{ analysisMeta.model }}
                            </span>
                        </div>

                        <div v-if="visionOptions.length > 0"
                            class="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div class="grid gap-3 md:grid-cols-2">
                                <label class="space-y-2 text-sm">
                                    <span class="font-medium text-gray-700">视觉模型</span>
                                    <select v-model="selectedModelId"
                                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                                        <option v-for="option in visionOptions" :key="option.value"
                                            :value="option.value">
                                            {{ option.label }}
                                        </option>
                                    </select>
                                </label>
                                <label class="space-y-2 text-sm">
                                    <span class="font-medium text-gray-700">提示词</span>
                                    <input v-model="prompt"
                                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                        placeholder="请描述希望模型完成的任务" />
                                </label>
                            </div>
                            <div class="flex flex-wrap items-center gap-2">
                                <button v-for="preset in presetPrompts" :key="preset.value" type="button"
                                    @click="prompt = preset.value"
                                    class="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600">
                                    {{ preset.label }}
                                </button>
                            </div>

                            <div class="flex items-center justify-between">
                                <button type="button" @click="handleAnalyze" :disabled="isAnalyzing || !selectedConfig"
                                    class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300">
                                    <span v-if="isAnalyzing"
                                        class="h-3 w-3 animate-spin rounded-full border-2 border-white/60 border-t-transparent"></span>
                                    <span>{{ isAnalyzing ? '分析中...' : '分析图片' }}</span>
                                </button>
                                <span v-if="analysisError" class="text-sm text-red-500">{{ analysisError }}</span>
                            </div>

                            <div v-if="analysisResult" class="space-y-2">
                                <label class="text-sm font-medium text-gray-700">分析结果</label>
                                <textarea v-model="analysisResult"
                                    class="h-32 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                    placeholder="模型生成的描述会显示在这里" />
                            </div>
                        </div>
                        <div v-else
                            class="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                            当前没有可用的视觉模型配置，请在设置中添加后使用分析功能。
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
                    <button type="button" @click="handleCancel"
                        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-400 hover:text-gray-800">
                        取消
                    </button>
                    <button type="button" @click="handleConfirm" :disabled="!canSubmit"
                        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300">
                        确认添加
                    </button>
                </div>
            </DialogContent>
        </DialogPortal>
    </DialogRoot>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
    DialogRoot,
    DialogPortal,
    DialogOverlay,
    DialogContent,
    DialogTitle,
    DialogClose
} from 'reka-ui';
import { useImageUpload } from '@/composables';
import { formatFileSize, MAX_IMAGE_SIZE } from '@/utils/imageUtils';
import type {
    ImageUploadModalProps,
    ImageUploadModalEmits,
    ImageUploadResult,
    PresetPrompt
} from '../types';
import type { ModelConfig } from '@/types';

const DEFAULT_PROMPT = '请详细描述这张图片的内容，包括主要对象、场景、颜色、位置关系等信息。';

const props = defineProps<ImageUploadModalProps>();
const emit = defineEmits<ImageUploadModalEmits>();

// 调试日志
console.log('🎬 [ImageUploadModal] 组件初始化:', {
    isOpen: props.isOpen,
    visionConfigsCount: props.visionConfigs?.length || 0
});

const fileInput = ref<HTMLInputElement | null>(null);
const prompt = ref(props.defaultPrompt || DEFAULT_PROMPT);
const selectedModelId = ref<number | null>(null);

const uploadError = ref('');
const analysisError = ref('');
const analysisResult = ref('');
const isAnalyzing = ref(false);
const analysisMeta = ref<{ model: string; analysisTime: number } | null>(null);

const presetPrompts = ref<PresetPrompt[]>([{
    label: '详细描述',
    value: DEFAULT_PROMPT
}, {
    label: '识别文字',
    value: '请提取图片中的所有文字内容，并保持原有的段落结构。'
}, {
    label: '识别主要对象',
    value: '请识别图片中的主要对象，并描述它们的外观、颜色和位置关系。'
}, {
    label: '场景总结',
    value: '请总结这张图片展示的场景，包括环境、活动和氛围。'
}]);

const {
    isUploading,
    uploadProgress,
    currentImage,
    imageBase64,
    handleImageSelect,
    analyzeImage,
    reset
} = useImageUpload();

const hasImage = computed(() => !!currentImage.value);
const maxSizeLabel = computed(() => formatFileSize(props.maxSize ?? MAX_IMAGE_SIZE));
const fileSizeLabel = computed(() => currentImage.value ? formatFileSize(currentImage.value.fileSize) : '—');
const uploadStatusLabel = computed(() => {
    if (!isUploading.value && uploadProgress.value === 0) return '';
    if (uploadProgress.value < 30) return '正在验证文件...';
    if (uploadProgress.value < 70) return '正在处理图片...';
    if (uploadProgress.value < 100) return '正在编码图片...';
    return '处理完成';
});

const visionOptions = computed(() => props.visionConfigs
    .filter((config) => config.modelType === 'vision' && config.isActive)
    .map((config) => ({
        label: `${config.name} (${config.model})`,
        value: config.id as number,
        config
    }))
);

const selectedConfig = computed<ModelConfig | undefined>(() => {
    if (selectedModelId.value === null) return undefined;
    return props.visionConfigs.find((config) => config.id === selectedModelId.value);
});

const canSubmit = computed(() => {
    return !!currentImage.value && !!imageBase64.value;
});

watch(() => props.isOpen, (isOpen) => {
    console.log('🔄 [ImageUploadModal] isOpen 变化:', {
        isOpen,
        visionConfigsCount: props.visionConfigs?.length || 0
    });

    if (isOpen) {
        console.log('✅ [ImageUploadModal] 初始化状态');
        initializeState();
    } else {
        console.log('🧹 [ImageUploadModal] 清理状态');
        cleanupState();
    }
});

watch(() => props.visionConfigs, (configs) => {
    if (!configs || configs.length === 0) return;
    if (selectedModelId.value === null) {
        const defaultConfig = configs.find((config) => config.isDefault && config.modelType === 'vision');
        if (defaultConfig?.id) {
            selectedModelId.value = defaultConfig.id;
        } else {
            const firstVision = configs.find((config) => config.modelType === 'vision');
            if (firstVision?.id) {
                selectedModelId.value = firstVision.id;
            }
        }
    }
}, { immediate: true });

watch(currentImage, (image) => {
    if (image) {
        uploadError.value = '';
    }
});

function initializeState() {
    prompt.value = props.defaultPrompt || DEFAULT_PROMPT;
    uploadError.value = '';
    analysisError.value = '';
    analysisResult.value = '';
    analysisMeta.value = null;
}

function cleanupState() {
    reset();
    analysisResult.value = '';
    analysisError.value = '';
    analysisMeta.value = null;
    uploadError.value = '';
    if (fileInput.value) {
        fileInput.value.value = '';
    }
}

function handleOpenChange(open: boolean) {
    console.log('🔄 [ImageUploadModal] handleOpenChange 被调用:', open);
    emit('update:isOpen', open);
    if (!open) {
        cleanupState();
    }
}

function triggerFileSelect() {
    uploadError.value = '';
    fileInput.value?.click();
}

async function onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    uploadError.value = '';
    analysisResult.value = '';
    analysisMeta.value = null;
    analysisError.value = '';

    const result = await handleImageSelect(file);

    if (!result.success) {
        uploadError.value = result.error || '图片处理失败';
        return;
    }

    analysisResult.value = '';
    analysisMeta.value = null;
}

function handleRemoveImage() {
    cleanupState();
}

async function handleAnalyze() {
    console.log('🔍 [ImageUploadModal] 开始分析图片');
    analysisError.value = '';

    if (!selectedConfig.value) {
        console.warn('⚠️ [ImageUploadModal] 未选择视觉模型');
        analysisError.value = '请先选择一个视觉模型';
        return;
    }

    if (!imageBase64.value) {
        console.warn('⚠️ [ImageUploadModal] 没有图片 Base64 数据');
        analysisError.value = '请先上传图片';
        return;
    }

    console.log('📊 [ImageUploadModal] 分析参数:', {
        model: selectedConfig.value.name,
        prompt: prompt.value,
        base64Length: imageBase64.value.length
    });

    isAnalyzing.value = true;
    try {
        console.log('🤖 [ImageUploadModal] 调用 analyzeImage...');
        const result = await analyzeImage(imageBase64.value, selectedConfig.value, prompt.value);

        console.log('📥 [ImageUploadModal] 分析结果:', {
            success: result.success,
            hasDescription: !!result.description,
            descriptionLength: result.description?.length || 0,
            analysisTime: result.analysisTime
        });

        if (result.success && result.description) {
            analysisResult.value = result.description;
            analysisMeta.value = {
                model: selectedConfig.value.model,
                analysisTime: result.analysisTime ?? 0
            };
            console.log('✅ [ImageUploadModal] 图片分析成功');
        } else {
            console.warn('⚠️ [ImageUploadModal] 分析失败:', result.error);
            analysisError.value = result.error || '分析失败，请稍后重试';
        }
    } catch (error) {
        console.error('❌ [ImageUploadModal] handleAnalyze error:', error);
        analysisError.value = error instanceof Error ? error.message : '分析失败';
    } finally {
        isAnalyzing.value = false;
    }
}

function handleCancel() {
    console.log('❌ [ImageUploadModal] 取消上传');
    emit('update:isOpen', false);
}

function handleConfirm() {
    console.log('✅ [ImageUploadModal] 确认提交');

    if (!currentImage.value || !imageBase64.value) {
        console.warn('⚠️ [ImageUploadModal] 缺少必要数据');
        uploadError.value = '请先上传图片';
        return;
    }

    const payload: ImageUploadResult = {
        attachment: currentImage.value,
        base64: imageBase64.value,
        description: analysisResult.value || undefined,
        modelConfig: selectedConfig.value,
        analysisInfo: analysisMeta.value ? {
            model: analysisMeta.value.model,
            analysisTime: analysisMeta.value.analysisTime,
            prompt: prompt.value
        } : undefined
    };

    console.log('📤 [ImageUploadModal] 提交数据:', {
        fileName: payload.attachment.fileName,
        fileSize: payload.attachment.fileSize,
        hasDescription: !!payload.description,
        descriptionLength: payload.description?.length || 0,
        modelUsed: payload.modelConfig?.name,
        base64Length: payload.base64.length
    });

    emit('submitted', payload);
    emit('update:isOpen', false);
    console.log('✅ [ImageUploadModal] 已触发 submitted 事件并关闭弹窗');
}
</script>
