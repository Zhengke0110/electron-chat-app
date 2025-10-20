/**
 * 数据库功能测试脚本
 * 用于验证 ModelConfig 相关的数据库操作
 */

import { dbHelpers } from '../db';
import { createConfigFromTemplate, PROVIDER_TEMPLATES } from '../constants/providers';

export async function testModelConfigOperations() {
    console.log('=== 开始测试模型配置数据库操作 ===\n');

    try {
        // 1. 测试获取所有模型配置
        console.log('1️⃣ 测试获取所有模型配置');
        const allConfigs = await dbHelpers.getAllModelConfigs();
        console.log(`   ✓ 当前配置数量: ${allConfigs.length}`);
        console.log('   配置列表:', allConfigs);
        console.log('');

        // 2. 测试获取默认配置
        console.log('2️⃣ 测试获取默认配置');
        const defaultConfig = await dbHelpers.getDefaultModelConfig();
        console.log('   ✓ 默认配置:', defaultConfig);
        console.log('');

        // 3. 测试添加新的配置
        console.log('3️⃣ 测试添加 OpenAI 配置');
        const openaiConfig = createConfigFromTemplate('openai', 'sk-test-key-123456', 'OpenAI GPT-4');
        const openaiId = await dbHelpers.addModelConfig(openaiConfig);
        console.log(`   ✓ 成功添加配置，ID: ${openaiId}`);
        console.log('');

        // 4. 测试更新配置
        console.log('4️⃣ 测试更新配置');
        await dbHelpers.updateModelConfig(openaiId as number, {
            testStatus: 'success',
            testMessage: '连接成功',
            model: 'gpt-4-turbo'
        });
        console.log('   ✓ 成功更新配置');
        console.log('');

        // 5. 测试获取激活的配置
        console.log('5️⃣ 测试获取激活的配置');
        const activeConfigs = await dbHelpers.getActiveModelConfigs();
        console.log(`   ✓ 激活的配置数量: ${activeConfigs.length}`);
        console.log('   激活的配置:', activeConfigs);
        console.log('');

        // 6. 测试设置默认配置
        console.log('6️⃣ 测试设置默认配置');
        await dbHelpers.setDefaultModelConfig(openaiId as number);
        const newDefault = await dbHelpers.getDefaultModelConfig();
        console.log(`   ✓ 新的默认配置: ${newDefault?.name}`);
        console.log('');

        // 7. 测试切换激活状态
        console.log('7️⃣ 测试切换激活状态');
        await dbHelpers.toggleModelConfigActive(openaiId as number);
        const config = await dbHelpers.getModelConfig(openaiId as number);
        console.log(`   ✓ 配置激活状态: ${config?.isActive}`);
        console.log('');

        // 8. 打印所有预设模板
        console.log('8️⃣ 所有预设厂商模板');
        PROVIDER_TEMPLATES.forEach(template => {
            console.log(`   - ${template.name} (${template.provider})`);
            console.log(`     API: ${template.baseUrl}`);
            console.log(`     模型: ${template.models.join(', ')}`);
        });
        console.log('');

        console.log('=== ✅ 所有测试通过 ===');
        return true;
    } catch (error) {
        console.error('❌ 测试失败:', error);
        return false;
    }
}

// 清理测试数据
export async function cleanupTestData() {
    console.log('🧹 清理测试数据...');
    const configs = await dbHelpers.getAllModelConfigs();
    for (const config of configs) {
        if (config.id && (config.name.includes('测试') || config.name.includes('OpenAI GPT-4'))) {
            await dbHelpers.deleteModelConfig(config.id);
            console.log(`   ✓ 删除: ${config.name}`);
        }
    }
    console.log('✅ 清理完成');
}
