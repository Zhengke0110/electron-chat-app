import { createPinia } from 'pinia';

const pinia = createPinia();

export default pinia;

// 导出所有 stores
export { useDbStore } from './db';
