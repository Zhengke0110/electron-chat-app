<template>
    <div class="prose prose-sm max-w-none dark:prose-invert prose-pre:bg-gray-900 prose-pre:text-gray-100"
        v-html="renderedHtml">
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import markdownItHighlight from 'markdown-it-highlightjs';
import taskLists from 'markdown-it-task-lists';
import mark from 'markdown-it-mark';

const props = defineProps<{
    content: string;
}>();

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
    .use(mark);            // 支持 ==高亮文本==

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

/* 代码块增强 - 添加语言标签 */
:deep(pre) {
    position: relative;
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
</style>
