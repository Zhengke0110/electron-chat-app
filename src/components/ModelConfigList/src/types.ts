import type { ModelConfig } from '@/types';

export interface ModelConfigListProps {
    configs: ModelConfig[];
}

export interface ModelConfigListEmits {
    (e: 'edit', config: ModelConfig): void;
    (e: 'delete', id: number): void;
    (e: 'test', config: ModelConfig): void;
    (e: 'toggleActive', id: number): void;
    (e: 'setDefault', id: number): void;
}
