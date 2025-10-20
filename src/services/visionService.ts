/**
 * 视觉模型服务
 * 负责调用视觉模型生成图片描述
 */

import type { ModelConfig } from '@/types';
import type { ImageAttachment } from '@/db';

export interface VisionAnalysisResult {
    success: boolean;
    description?: string;      // 图片描述
    model?: string;            // 使用的模型
    analysisTime?: number;     // 分析耗时（ms）
    error?: string;            // 错误信息
}

/**
 * 视觉模型服务类
 */
export class VisionService {
    /**
     * 分析图片并生成描述
     */
    static async analyzeImage(
        imageBase64: string,
        visionConfig: ModelConfig,
        prompt = '请详细描述这张图片的内容，包括主要对象、场景、颜色、位置关系等信息。'
    ): Promise<VisionAnalysisResult> {
        const startTime = Date.now();

        try {
            console.log('[VisionService] 准备发送 IPC 请求:', {
                hasBase64: !!imageBase64,
                base64Length: imageBase64.length,
                base64Preview: imageBase64.substring(0, 50),
                configName: visionConfig.name,
                promptLength: prompt.length
            });

            // 只传递可序列化的配置信息（避免 IPC 克隆错误）
            const serializableConfig = {
                name: visionConfig.name,
                modelType: visionConfig.modelType,
                provider: visionConfig.provider,
                baseUrl: visionConfig.baseUrl,
                model: visionConfig.model,
                apiKey: visionConfig.apiKey,
                temperature: visionConfig.temperature,
                maxTokens: visionConfig.maxTokens
            };

            console.log('[VisionService] 序列化后的配置:', serializableConfig);

            // 创建可序列化的数据对象
            const requestData = {
                imageBase64: String(imageBase64),  // 确保是字符串
                visionConfig: JSON.parse(JSON.stringify(serializableConfig)),  // 深度克隆
                prompt: String(prompt)  // 确保是字符串
            };

            console.log('[VisionService] 请求数据类型检查:', {
                base64Type: typeof requestData.imageBase64,
                configType: typeof requestData.visionConfig,
                promptType: typeof requestData.prompt,
                configKeys: Object.keys(requestData.visionConfig)
            });

            // 调用主进程的 IPC 通道
            const result = await window.electron.ipcRenderer.invoke(
                'vision:analyze-image',
                requestData
            ) as { success: boolean; description?: string; error?: string };

            const analysisTime = Date.now() - startTime;

            console.log('[VisionService] IPC 响应:', {
                success: result.success,
                hasDescription: !!result.description,
                descriptionLength: result.description?.length || 0,
                error: result.error,
                analysisTime
            });

            if (result.success) {
                return {
                    success: true,
                    description: result.description,
                    model: visionConfig.model,
                    analysisTime
                };
            } else {
                return {
                    success: false,
                    error: result.error || '图片分析失败',
                    analysisTime
                };
            }
        } catch (error) {
            const analysisTime = Date.now() - startTime;
            console.error('[VisionService] 分析图片失败:', error);

            return {
                success: false,
                error: error instanceof Error ? error.message : '未知错误',
                analysisTime
            };
        }
    }

    /**
     * 批量分析图片
     */
    static async analyzeImages(
        images: { base64: string; attachment: ImageAttachment }[],
        visionConfig: ModelConfig,
        prompt = '请分别描述每张图片的内容。'
    ): Promise<VisionAnalysisResult[]> {
        const results: VisionAnalysisResult[] = [];

        for (const { base64, attachment } of images) {
            const imagePrompt = `图片 ${attachment.fileName}: ${prompt}`;
            const result = await this.analyzeImage(base64, visionConfig, imagePrompt);
            results.push(result);
        }

        return results;
    }

    /**
     * 验证视觉模型配置
     */
    static validateVisionConfig(config: ModelConfig): { valid: boolean; error?: string } {
        if (config.modelType !== 'vision') {
            return {
                valid: false,
                error: '请选择视觉模型'
            };
        }

        if (!config.isActive) {
            return {
                valid: false,
                error: '所选视觉模型未启用'
            };
        }

        if (!config.apiKey || config.apiKey.trim() === '') {
            return {
                valid: false,
                error: '视觉模型未配置 API Key'
            };
        }

        return { valid: true };
    }
}

export default VisionService;
