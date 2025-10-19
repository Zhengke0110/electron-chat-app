// ProviderSelect 组件相关类型
export interface ProviderProps {
    id: number;
    name: string;
    title?: string;
    desc?: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
    models: string[];
}
