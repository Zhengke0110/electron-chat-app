<template>
    <div class="message-input flex flex-col gap-2">
        <!-- 图片附件预览 -->
        <div v-if="attachedImage" class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div class="relative flex-shrink-0">
                <img :src="attachedImage.fileUrl" :alt="attachedImage.fileName"
                    class="w-20 h-20 object-cover rounded-lg border border-gray-300" />
                <button @click="handleRemoveImage" type="button"
                    class="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm">
                    <Icon icon="mdi:close" class="text-sm" />
                </button>
            </div>
            <div class="flex-1 min-w-0 space-y-1">
                <p class="text-sm font-medium text-gray-900 truncate">{{ attachedImage.fileName }}</p>
                <p class="text-xs text-gray-500">{{ formatFileSize(attachedImage.fileSize) }}</p>
                <p v-if="imageDescription" class="text-xs text-gray-600 line-clamp-2 italic">
                    "{{ imageDescription }}"
                </p>
            </div>
        </div>

        <div class="flex gap-2 items-center">
            <!-- 图片上传按钮 -->
            <button @click="handleOpenImageUpload" type="button" :disabled="disabled"
                class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="上传图片">
                <Icon icon="mdi:image-plus" class="text-2xl" />
            </button>

            <!-- 输入框 -->
            <input v-model="inputValue" type="text" :placeholder="placeholder" :disabled="disabled"
                @keyup.enter="handleCreate" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                    transition-all" />

            <!-- 发送按钮 -->
            <button @click="handleCreate" :disabled="disabled || !canSend" class="px-4 py-2 bg-indigo-600 text-white rounded-lg 
                    hover:bg-indigo-700 active:scale-95
                    disabled:bg-gray-300 disabled:cursor-not-allowed
                    flex items-center gap-2 transition-all">
                <Icon icon="mdi:send" class="text-xl" />
                <span>发送</span>
            </button>
        </div>

        <!-- 图片上传弹窗（内置） -->
        <ImageUploadModal v-model:isOpen="isImageUploadOpen" :vision-configs="visionModelConfigs"
            @submitted="handleImageUploaded" />
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { storeToRefs } from 'pinia';
import ImageUploadModal from './children/ImageUploadModal.vue';
import type { ImageUploadResult } from './types';
import { useDbStore } from '../../../store/db';
import type { MessageInputProps, MessageWithImage, ImageAttachment } from './types';

const props = withDefaults(defineProps<MessageInputProps>(), {
    modelValue: '',
    placeholder: '输入消息...',
    disabled: false
});

const emit = defineEmits<{
    'update:modelValue': [value: string];
    'create': [message: string];
    'createWithImage': [data: MessageWithImage];
}>();

// 获取数据库 store
const dbStore = useDbStore();
const { modelConfigs } = storeToRefs(dbStore);

// 筛选出视觉模型配置
const visionModelConfigs = computed(() => {
    return modelConfigs.value.filter(config => config.modelType === 'vision' && config.isActive);
});

// 图片上传弹窗状态
const isImageUploadOpen = ref(false);

// 内部输入值
const inputValue = ref(props.modelValue);

// 图片附件状态
const attachedImage = ref<ImageAttachment | null>(null);
const imageBase64 = ref<string>('');
const imageDescription = ref<string>('');

// 是否可以发送
const canSend = computed(() => {
    return inputValue.value.trim() || attachedImage.value;
});

// 监听输入值变化，同步到父组件
watch(inputValue, (newValue) => {
    emit('update:modelValue', newValue);
});

// 监听外部 modelValue 变化
watch(() => props.modelValue, (newValue) => {
    inputValue.value = newValue;
});

// 处理创建消息
const handleCreate = () => {
    console.log('📨 [MessageInput] 处理创建消息:', {
        canSend: canSend.value,
        disabled: props.disabled,
        hasImage: !!attachedImage.value,
        hasText: !!inputValue.value.trim()
    });

    if (!canSend.value || props.disabled) {
        console.warn('⚠️ [MessageInput] 无法发送，条件不满足');
        return;
    }

    const message = inputValue.value.trim();

    // 如果有图片附件
    if (attachedImage.value) {
        console.log('📸 [MessageInput] 发送带图片的消息:', {
            text: message,
            imageName: attachedImage.value.fileName,
            descriptionLength: imageDescription.value.length
        });

        emit('createWithImage', {
            text: message,
            image: {
                attachment: attachedImage.value,
                base64: imageBase64.value,
                description: imageDescription.value
            }
        });

        console.log('✅ [MessageInput] 已触发 createWithImage 事件');

        // 清空图片状态
        attachedImage.value = null;
        imageBase64.value = '';
        imageDescription.value = '';
        console.log('🧹 [MessageInput] 已清空图片状态');
    } else if (message) {
        // 纯文本消息
        console.log('💬 [MessageInput] 发送纯文本消息:', message.substring(0, 50));
        emit('create', message);
    }

    // 清空输入框
    inputValue.value = '';
};

// 打开图片上传
const handleOpenImageUpload = () => {
    console.log('🖼️ [MessageInput] 触发打开图片上传弹窗');
    console.log('📊 [MessageInput] 可用视觉模型数量:', visionModelConfigs.value.length);

    if (visionModelConfigs.value.length === 0) {
        console.warn('⚠️ [MessageInput] 没有可用的视觉模型');
        alert('⚠️ 没有可用的视觉模型\n\n请先在设置页面配置至少一个视觉模型（如 Qwen-VL）');
        return;
    }

    console.log('✅ [MessageInput] 打开图片上传弹窗');
    isImageUploadOpen.value = true;
};

// 处理图片上传完成
const handleImageUploaded = (result: ImageUploadResult) => {
    console.log('✅ [MessageInput] 图片上传完成:', {
        fileName: result.attachment.fileName,
        fileSize: result.attachment.fileSize,
        dimensions: `${result.attachment.width}x${result.attachment.height}`,
        descriptionLength: result.description?.length || 0,
        base64Length: result.base64.length
    });

    // 设置图片附件
    attachedImage.value = result.attachment;
    imageBase64.value = result.base64;
    imageDescription.value = result.description || '';

    // 关闭弹窗
    isImageUploadOpen.value = false;

    console.log('✅ [MessageInput] 图片已设置到输入框');
};

// 移除图片
const handleRemoveImage = () => {
    console.log('🗑️ [MessageInput] 移除图片附件');
    attachedImage.value = null;
    imageBase64.value = '';
    imageDescription.value = '';
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// 设置图片附件（供父组件调用）
const setImageAttachment = (
    attachment: ImageAttachment,
    base64: string,
    description: string
) => {
    console.log('📥 [MessageInput] 设置图片附件:', {
        fileName: attachment.fileName,
        fileSize: attachment.fileSize,
        dimensions: `${attachment.width}x${attachment.height}`,
        base64Length: base64.length,
        descriptionLength: description.length
    });

    attachedImage.value = attachment;
    imageBase64.value = base64;
    imageDescription.value = description;

    console.log('✅ [MessageInput] 图片附件已设置，当前状态:', {
        hasAttachedImage: !!attachedImage.value,
        hasBase64: !!imageBase64.value,
        hasDescription: !!imageDescription.value
    });
};

// 暴露方法供父组件使用
defineExpose({
    setImageAttachment
});
</script>