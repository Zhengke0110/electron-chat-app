/**
 * Constants - 统一导出所有常量
 */

// 导出厂商模板相关
export {
    PROVIDER_TEMPLATES,
    getProviderTemplatesByType,
    getProviderTemplate
} from './providers';

// 导出系统提示词预设相关
export {
    SYSTEM_PROMPT_PRESETS,
    getSystemPromptPresetByName,
    getSystemPromptPresetNames
} from './prompt';

// 导出类型
export type { SystemPromptPreset } from './prompt';
