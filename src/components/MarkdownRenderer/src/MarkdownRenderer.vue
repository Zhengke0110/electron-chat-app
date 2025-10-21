<template>
    <div :class="proseClasses" v-html="renderedHtml">
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import markdownItHighlight from 'markdown-it-highlightjs';
import taskLists from 'markdown-it-task-lists';
import mark from 'markdown-it-mark';
// @ts-ignore
import texmath from 'markdown-it-texmath';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const props = withDefaults(
    defineProps<{
        content: string;
        variant?: 'default' | 'user'; // 'default' 用于 AI 消息，'user' 用于用户消息
    }>(),
    {
        variant: 'default'
    }
);

// 根据 variant 动态生成 prose 类名
const proseClasses = computed(() => {
    const baseClasses = 'prose prose-sm max-w-none';

    if (props.variant === 'user') {
        // 用户消息样式：纯白色文本，适配深色背景（indigo-500）
        return `${baseClasses} prose-invert 
            prose-p:text-white 
            prose-headings:text-white 
            prose-strong:text-white 
            prose-em:text-white 
            prose-code:text-white prose-code:bg-white/20 
            prose-pre:bg-white/10 prose-pre:text-white 
            prose-a:text-blue-200 hover:prose-a:text-blue-100 prose-a:font-medium
            prose-ul:text-white prose-ol:text-white prose-li:text-white
            prose-li:marker:text-white
            prose-blockquote:text-white prose-blockquote:border-white/30`;
    }

    // 默认样式：AI 消息，适配白色背景（明亮模式）
    return `${baseClasses} 
        prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200
        prose-code:text-pink-600 prose-code:bg-pink-50 
        prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
        prose-code:before:content-none prose-code:after:content-none`;
});

// 创建 markdown-it 实例并配置插件
const md = new MarkdownIt({
    html: true,        // 启用 HTML 标签
    linkify: true,     // 自动将 URL 转换为链接
    typographer: true, // 启用智能引号和其他排版优化
    breaks: true,      // 将换行符转换为 <br>
    highlight: function (str, lang) {
        // 代码高亮回退处理
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(str, { language: lang }).value;
            } catch (__) { }
        }
        return ''; // 使用默认转义
    }
})
    .use(markdownItHighlight, {
        hljs,
        auto: true,        // 自动检测语言
        code: true,        // 高亮代码块
        inline: false      // 不高亮行内代码
    })
    .use(taskLists, {
        enabled: true,     // 启用任务列表
        label: true,       // 添加 label 标签
        labelAfter: true   // label 在 checkbox 后面
    })
    .use(mark)            // 支持 ==高亮文本==
    .use(texmath, {       // 支持 LaTeX 数学公式
        engine: katex,
        delimiters: ['dollars', 'brackets'], // 支持 $...$ $$...$$ 和 \(...\) \[...\]
        katexOptions: {
            throwOnError: false,
            errorColor: '#cc0000'
        }
    });

// 渲染 Markdown
const renderedHtml = computed(() => {
    if (!props.content) return '';
    return md.render(props.content);
});
</script>

<style scoped>
/* Tailwind Typography 已经提供了大部分样式，这里只需要微调 */

/* 任务列表样式 */
:deep(.task-list-item) {
    list-style-type: none;
    margin-left: 0;
}

:deep(.task-list-item input[type="checkbox"]) {
    margin-right: 0.5rem;
}

/* 代码块样式优化 */
:deep(pre) {
    position: relative;
    border-radius: 0.5rem;
    padding: 1rem;
    overflow-x: auto;
}

/* 代码块内的代码元素 */
:deep(pre code) {
    background: transparent !important;
    padding: 0 !important;
    border: none !important;
}

/* 行内代码优化 */
:deep(:not(pre) > code) {
    font-weight: 500;
}

/* 标记文本样式 */
:deep(mark) {
    background-color: rgb(254 240 138);
    /* yellow-200 */
    padding: 0.125rem 0.25rem;
    border-radius: 0.125rem;
}

/* 链接在新标签页打开的视觉提示 */
:deep(a[target="_blank"]::after) {
    content: "↗";
    margin-left: 0.25rem;
    font-size: 0.75rem;
    opacity: 0.6;
}

/* KaTeX 数学公式样式优化 */
:deep(.katex) {
    font-size: 1.05em;
}

:deep(.katex-display) {
    margin: 1em 0;
    overflow-x: auto;
    overflow-y: hidden;
}

/* 确保用户消息中的数学公式也能正确显示 */
:deep(.katex .base) {
    color: inherit;
}
</style>
