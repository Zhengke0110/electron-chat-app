import { dbHelpers } from '../db';
import { createConfigFromTemplate } from '../constants/providers';

/**
 * 添加 DeepSeek 配置
 */
export async function addDeepSeekConfig(apiKey: string) {
    try {
        console.log('🚀 开始添加 DeepSeek 配置...');

        const config = createConfigFromTemplate(
            'deepseek',
            apiKey,
            'DeepSeek Chat'
        );

        // 将其设为默认配置
        config.isDefault = true;

        const id = await dbHelpers.addModelConfig(config);

        console.log('✅ DeepSeek 配置添加成功！');
        console.log('配置 ID:', id);
        console.log('配置详情:', config);

        return id;
    } catch (error) {
        console.error('❌ 添加 DeepSeek 配置失败:', error);
        throw error;
    }
}
