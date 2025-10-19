import { createPinia } from 'pinia';

const pinia = createPinia();

export default pinia;

// 导出所有 stores
export { useAppStore } from './app';
export { useCounterStore } from './counter';
export { useDbStore } from './db';
