import './index.css';
import { createApp } from 'vue';
import App from './App.vue';
import pinia from './store';
import router from './router';

// 创建并挂载 Vue 应用
const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount('#app');
