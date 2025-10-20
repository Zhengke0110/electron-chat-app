import { dbHelpers } from '../db';

/**
 * 移除不需要的模型配置
 * 保留 DeepSeek 配置,删除其他配置(如测试时添加的 OpenAI 等)
 */
export async function removeUnwantedConfigs() {
    try {
        console.log('🧹 开始清理不需要的模型配置...');

        const allConfigs = await dbHelpers.getAllModelConfigs();
        console.log(`📊 当前配置总数: ${allConfigs.length}`);

        let removedCount = 0;

        for (const config of allConfigs) {
            // 保留 DeepSeek 配置,删除其他配置
            if (config.provider !== 'deepseek' && config.id) {
                await dbHelpers.deleteModelConfig(config.id);
                console.log(`   ✓ 删除: ${config.name} (${config.provider})`);
                removedCount++;
            }
        }

        if (removedCount > 0) {
            console.log(`✅ 清理完成,共删除 ${removedCount} 个配置`);

            // 显示剩余的配置
            const remainingConfigs = await dbHelpers.getAllModelConfigs();
            console.log(`📊 剩余配置数量: ${remainingConfigs.length}`);
            remainingConfigs.forEach(config => {
                console.log(`   - ${config.name} (${config.provider})`);
            });
        } else {
            console.log('✅ 没有需要删除的配置');
        }

        return removedCount;
    } catch (error) {
        console.error('❌ 清理配置失败:', error);
        throw error;
    }
}
