import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue'),
    },
    {
        path: '/chat/:id?',
        name: 'Chat',
        component: () => import('../views/Chat.vue'),
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import('../views/Settings.vue'),
    },
    {
        path: '/about',
        name: 'About',
        component: () => import('../views/About.vue'),
    },
];

const router = createRouter({
    // 在 Electron 中使用 hash 模式
    history: createWebHashHistory(),
    routes,
});

// 路由守卫 - 添加调试信息
router.beforeEach((to, from, next) => {
    console.log('');
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║         路由导航守卫 (beforeEach)              ║');
    console.log('╠════════════════════════════════════════════════╣');
    console.log('  从:', from.path || '(初始)');
    console.log('  到:', to.path);
    console.log('  名称:', to.name);
    console.log('  参数:', JSON.stringify(to.params));
    console.log('  Query:', JSON.stringify(to.query));
    console.log('╚════════════════════════════════════════════════╝');
    console.log('');
    next();
});

router.afterEach((to, from) => {
    console.log('');
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║         路由导航完成 (afterEach)               ║');
    console.log('╠════════════════════════════════════════════════╣');
    console.log('  ✓ 已从', from.path || '(初始)', '导航到', to.path);
    console.log('  ✓ 当前页面:', to.name);
    console.log('╚════════════════════════════════════════════════╝');
    console.log('');
});

router.onError((error) => {
    console.error('');
    console.error('╔════════════════════════════════════════════════╗');
    console.error('║           ❌ 路由错误                          ║');
    console.error('╠════════════════════════════════════════════════╣');
    console.error('  错误信息:', error.message);
    console.error('  错误堆栈:', error.stack);
    console.error('╚════════════════════════════════════════════════╝');
    console.error('');
});

export default router;
