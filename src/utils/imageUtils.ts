/**
 * 图片处理工具函数
 */

import type { ImageAttachment } from '@/db';

// 支持的图片格式
export const SUPPORTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/bmp',
    'image/tiff',
    'image/heic'
];

export const SUPPORTED_IMAGE_EXTENSIONS = [
    '.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tif', '.tiff', '.heic'
];

// 图片大小限制（考虑 Base64 编码后增加 33%）
export const MAX_IMAGE_SIZE = 7.5 * 1024 * 1024; // 7.5MB
export const MAX_BASE64_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * 验证图片文件
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    // 检查文件类型
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: `不支持的图片格式。支持的格式：${SUPPORTED_IMAGE_EXTENSIONS.join(', ')}`
        };
    }

    // 检查文件大小
    if (file.size > MAX_IMAGE_SIZE) {
        const sizeMB = (MAX_IMAGE_SIZE / (1024 * 1024)).toFixed(1);
        return {
            valid: false,
            error: `图片大小超过限制（最大 ${sizeMB}MB）。当前大小：${(file.size / (1024 * 1024)).toFixed(2)}MB`
        };
    }

    return { valid: true };
}

/**
 * 将文件转换为 Base64 Data URL
 */
export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result as string;
            resolve(result);
        };

        reader.onerror = () => {
            reject(new Error('读取文件失败'));
        };

        reader.readAsDataURL(file);
    });
}

/**
 * 从文件创建图片附件对象
 */
export async function createImageAttachment(file: File): Promise<ImageAttachment> {
    // 生成唯一 ID
    const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 获取图片尺寸
    const dimensions = await getImageDimensions(file);

    // 生成缩略图（用于消息列表显示）
    let thumbnail: string | undefined;
    try {
        thumbnail = await generateThumbnail(file, 300); // 生成最大 300px 的缩略图
        console.log('✅ [imageUtils] 缩略图已生成，大小:', thumbnail.length);
    } catch (error) {
        console.warn('⚠️ [imageUtils] 生成缩略图失败:', error);
    }

    // 创建附件对象
    const attachment: ImageAttachment = {
        id,
        fileName: file.name,
        filePath: file.name, // 在浏览器环境中，使用文件名
        fileUrl: URL.createObjectURL(file), // 创建临时 URL 用于预览
        mimeType: file.type,
        fileSize: file.size,
        width: dimensions.width,
        height: dimensions.height,
        thumbnail, // Base64 缩略图
        uploadedAt: new Date().toISOString()
    };

    return attachment;
}

/**
 * 获取图片尺寸
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({
                width: img.width,
                height: img.height
            });
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('无法加载图片'));
        };

        img.src = url;
    });
}

/**
 * 压缩图片（如果需要）
 * 使用 Canvas API 进行压缩
 */
export async function compressImage(
    file: File,
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            // 计算新尺寸（保持宽高比）
            let { width, height } = img;

            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.floor(width * ratio);
                height = Math.floor(height * ratio);
            }

            // 创建 canvas 进行压缩
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('无法创建 Canvas 上下文'));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('图片压缩失败'));
                    }
                },
                file.type,
                quality
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('无法加载图片'));
        };

        img.src = url;
    });
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * 检查是否需要压缩
 */
export function shouldCompressImage(file: File): boolean {
    // 如果文件大小超过 5MB，建议压缩
    return file.size > 5 * 1024 * 1024;
}

/**
 * 生成缩略图
 */
export async function generateThumbnail(
    file: File,
    maxSize = 200
): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            // 计算缩略图尺寸
            let { width, height } = img;
            const ratio = Math.min(maxSize / width, maxSize / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);

            // 创建 canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('无法创建 Canvas 上下文'));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            // 转换为 Base64
            const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
            resolve(thumbnail);
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('无法加载图片'));
        };

        img.src = url;
    });
}
