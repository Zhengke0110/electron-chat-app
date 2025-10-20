import { ref, computed } from 'vue';
import { modelConfigService, type TestConnectionResult } from '../services/modelConfigService';
import type { ModelConfig } from '@/types';

/**
 * 模型配置测试 Composable
 * 统一管理测试连接的状态和逻辑
 */
export function useModelConfigTest() {
    // 测试状态
    const isTesting = ref(false);
    const testResult = ref<TestConnectionResult | null>(null);

    // 是否可以测试 (基于最小必需字段)
    const isTestable = (config: Partial<ModelConfig>): boolean => {
        return !!(
            config.provider &&
            config.baseUrl?.trim() &&
            config.model?.trim() &&
            config.apiKey?.trim()
        );
    };

    // 计算属性: 是否有测试结果
    const hasTestResult = computed(() => testResult.value !== null);

    // 计算属性: 测试是否成功
    const testSuccess = computed(() => testResult.value?.success ?? false);

    /**
     * 执行测试连接
     * @param config 要测试的配置
     */
    const testConnection = async (config: Partial<ModelConfig>): Promise<TestConnectionResult> => {
        // 防止重复测试
        if (isTesting.value) {
            return {
                success: false,
                message: '正在测试中，请稍候...'
            };
        }

        // 验证可测试性
        if (!isTestable(config)) {
            const result: TestConnectionResult = {
                success: false,
                message: '配置不完整',
                error: '请填写厂商、API地址、模型名称和API Key'
            };
            testResult.value = result;
            return result;
        }

        isTesting.value = true;
        testResult.value = null;

        try {
            // 调用 Service 层执行测试
            const result = await modelConfigService.testConnection(config);
            testResult.value = result;
            return result;
        } catch (error) {
            const errorResult: TestConnectionResult = {
                success: false,
                message: '测试失败',
                error: error instanceof Error ? error.message : String(error)
            };
            testResult.value = errorResult;
            return errorResult;
        } finally {
            isTesting.value = false;
        }
    };

    /**
     * 清除测试结果
     */
    const clearTestResult = () => {
        testResult.value = null;
    };

    /**
     * 重置测试状态
     */
    const resetTestState = () => {
        isTesting.value = false;
        testResult.value = null;
    };

    /**
     * 获取格式化的测试消息
     */
    const getFormattedMessage = (): string => {
        if (!testResult.value) return '';
        return modelConfigService.formatTestResultMessage(testResult.value);
    };

    return {
        // 状态
        isTesting,
        testResult,
        hasTestResult,
        testSuccess,

        // 方法
        testConnection,
        isTestable,
        clearTestResult,
        resetTestState,
        getFormattedMessage
    };
}
