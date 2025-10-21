import { dbHelpers } from '../db';
import type { ConversationProps } from '@/components/ConversationList';

// 模拟对话标题
const conversationTitles = [
    '如何学习 TypeScript？',
    'Vue 3 Composition API 最佳实践',
    '前端性能优化技巧',
    'Electron 应用开发指南',
    'Tailwind CSS 使用心得',
    'RESTful API 设计原则',
    'JavaScript 异步编程详解',
    'Git 工作流最佳实践',
    'React vs Vue 对比分析',
    'Node.js 后端开发入门',
    'CSS Grid 布局教程',
    'Webpack 配置优化',
    'Docker 容器化部署',
    'MongoDB 数据库设计',
    'GraphQL 入门指南',
    '微服务架构设计',
    'Redis 缓存策略',
    'TypeScript 泛型详解',
    'Vite 构建工具使用',
    '单元测试最佳实践',
    'CI/CD 自动化部署',
    'Nginx 反向代理配置',
    'WebSocket 实时通信',
    '前端安全防护措施',
    '响应式设计原理',
    'PWA 应用开发',
    'SEO 优化技巧',
    'SSR 服务端渲染',
    '跨域问题解决方案',
    'Web Workers 多线程'
];

// 厂商列表
const providers = ['OpenAI', 'DeepSeek', 'Claude', 'Gemini', 'Qwen'];

/**
 * 生成指定数量的模拟对话
 */
export async function seedConversations(count = 30000) {
    console.log(`🌱 开始生成 ${count} 条模拟对话...`);

    const now = new Date();
    const conversations: Omit<ConversationProps, 'id'>[] = [];

    for (let i = 0; i < count; i++) {
        // 生成随机的创建时间（最近 30 天内）
        const daysAgo = Math.floor(Math.random() * 30);
        const hoursAgo = Math.floor(Math.random() * 24);
        const minutesAgo = Math.floor(Math.random() * 60);

        const createdAt = new Date(now);
        createdAt.setDate(createdAt.getDate() - daysAgo);
        createdAt.setHours(createdAt.getHours() - hoursAgo);
        createdAt.setMinutes(createdAt.getMinutes() - minutesAgo);

        // 更新时间略晚于创建时间
        const updatedAt = new Date(createdAt);
        updatedAt.setMinutes(updatedAt.getMinutes() + Math.floor(Math.random() * 30));

        const conversation: Omit<ConversationProps, 'id'> = {
            title: conversationTitles[i % conversationTitles.length],
            selectedModel: `${providers[i % providers.length]} GPT-4`,
            providerId: i % providers.length,
            createdAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString()
        };

        conversations.push(conversation);
    }

    // 批量添加到数据库
    try {
        for (const conv of conversations) {
            await dbHelpers.addConversation(conv);
        }
        console.log(`✅ 成功生成 ${count} 条模拟对话！`);
        return true;
    } catch (error) {
        console.error('❌ 生成模拟对话失败:', error);
        return false;
    }
}

/**
 * 清空所有对话（用于重置）
 */
export async function clearConversations() {
    console.log('🧹 清空所有对话...');
    try {
        const conversations = await dbHelpers.getAllConversations();
        for (const conv of conversations) {
            if (conv.id) {
                await dbHelpers.deleteConversation(conv.id);
            }
        }
        console.log('✅ 已清空所有对话！');
        return true;
    } catch (error) {
        console.error('❌ 清空对话失败:', error);
        return false;
    }
}
