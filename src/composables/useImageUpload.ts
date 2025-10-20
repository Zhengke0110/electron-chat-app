/**
 * 图片上传 Composable
 * 封装图片上传和处理的业务逻辑
 */

import { ref } from 'vue';
import {
    validateImageFile,
    fileToBase64,
    createImageAttachment,
    compressImage,
    shouldCompressImage
} from '../utils/imageUtils';
import type { ImageAttachment } from '../db';
import { VisionService } from '../services/visionService';
import type { ModelConfig } from '../types';

export function useImageUpload() {
    const isUploading = ref(false);
    const uploadProgress = ref(0);
    const currentImage = ref<ImageAttachment | null>(null);
    const imageBase64 = ref<string>('');

    /**
     * 处理图片选择
     */
    const handleImageSelect = async (file: File): Promise<{
        success: boolean;
        attachment?: ImageAttachment;
        base64?: string;
        error?: string;
    }> => {
        console.log('📁 [useImageUpload] 开始处理图片:', {
            name: file.name,
            size: file.size,
            type: file.type
        });

        try {
            isUploading.value = true;
            uploadProgress.value = 0;

            // 1. 验证文件
            console.log('✅ [useImageUpload] 步骤 1: 验证文件...');
            const validation = validateImageFile(file);
            if (!validation.valid) {
                console.warn('⚠️ [useImageUpload] 文件验证失败:', validation.error);
                return {
                    success: false,
                    error: validation.error
                };
            }
            console.log('✅ [useImageUpload] 文件验证通过');

            uploadProgress.value = 20;

            // 2. 检查是否需要压缩
            console.log('🔄 [useImageUpload] 步骤 2: 检查是否需要压缩...');
            let processedFile = file;
            if (shouldCompressImage(file)) {
                console.log('🗜️ [useImageUpload] 开始压缩图片...');
                try {
                    const compressed = await compressImage(file);
                    processedFile = new File([compressed], file.name, { type: file.type });
                    console.log(`✅ [useImageUpload] 图片已压缩: ${file.size} -> ${processedFile.size}`);
                } catch (error) {
                    console.warn('⚠️ [useImageUpload] 压缩失败，使用原图:', error);
                }
            } else {
                console.log('ℹ️ [useImageUpload] 无需压缩');
            }

            uploadProgress.value = 50;

            // 3. 创建附件对象
            console.log('📋 [useImageUpload] 步骤 3: 创建附件对象...');
            const attachment = await createImageAttachment(processedFile);
            currentImage.value = attachment;
            console.log('✅ [useImageUpload] 附件对象已创建:', {
                id: attachment.id,
                fileName: attachment.fileName,
                fileSize: attachment.fileSize,
                dimensions: `${attachment.width}x${attachment.height}`
            });

            uploadProgress.value = 70;

            // 4. 转换为 Base64
            console.log('🔄 [useImageUpload] 步骤 4: 转换为 Base64...');
            const base64 = await fileToBase64(processedFile);
            imageBase64.value = base64;
            console.log(`✅ [useImageUpload] Base64 转换完成，长度: ${base64.length}`);

            uploadProgress.value = 100;

            console.log('🎉 [useImageUpload] 图片处理完成！');
            return {
                success: true,
                attachment,
                base64
            };
        } catch (error) {
            console.error('❌ [useImageUpload] 处理图片失败:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '图片处理失败'
            };
        } finally {
            isUploading.value = false;
        }
    };

    /**
     * 分析图片（调用视觉模型）
     */
    const analyzeImage = async (
        base64: string,
        visionConfig: ModelConfig,
        prompt?: string
    ) => {
        console.log('🤖 [useImageUpload] 开始分析图片:', {
            model: visionConfig.name,
            modelType: visionConfig.modelType,
            hasPrompt: !!prompt,
            promptLength: prompt?.length || 0,
            base64Length: base64.length
        });

        try {
            console.log('📡 [useImageUpload] 调用 VisionService.analyzeImage...');
            const result = await VisionService.analyzeImage(base64, visionConfig, prompt);

            console.log('📥 [useImageUpload] 分析结果:', {
                success: result.success,
                hasDescription: !!result.description,
                descriptionLength: result.description?.length || 0,
                analysisTime: result.analysisTime,
                error: result.error
            });

            return result;
        } catch (error) {
            console.error('❌ [useImageUpload] 分析图片失败:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '图片分析失败'
            };
        }
    };

    /**
     * 重置状态
     */
    const reset = () => {
        isUploading.value = false;
        uploadProgress.value = 0;
        currentImage.value = null;
        imageBase64.value = '';
    };

    return {
        // 状态
        isUploading,
        uploadProgress,
        currentImage,
        imageBase64,

        // 方法
        handleImageSelect,
        analyzeImage,
        reset
    };
}
