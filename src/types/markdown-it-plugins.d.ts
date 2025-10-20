// markdown-it 插件类型声明
declare module 'markdown-it-task-lists' {
    import MarkdownIt from 'markdown-it';

    interface TaskListsOptions {
        enabled?: boolean;
        label?: boolean;
        labelAfter?: boolean;
    }

    const taskLists: (md: MarkdownIt, options?: TaskListsOptions) => void;
    export default taskLists;
}

declare module 'markdown-it-mark' {
    import MarkdownIt from 'markdown-it';

    const mark: (md: MarkdownIt) => void;
    export default mark;
}

declare module 'markdown-it-highlightjs' {
    import MarkdownIt from 'markdown-it';
    import { HLJSApi } from 'highlight.js';

    interface HighlightOptions {
        hljs?: HLJSApi;
        auto?: boolean;
        code?: boolean;
        inline?: boolean;
    }

    const highlightjs: (md: MarkdownIt, options?: HighlightOptions) => void;
    export default highlightjs;
}
