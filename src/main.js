import {
    createApp
} from 'vue';
import '@/style/style.scss';
import App from '@/App.vue';
// 引入 pinia
import {
    createPinia
} from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);

// 使用立即调用的异步函数实现懒加载挂载
(async () => {
  // 等待DOM内容加载完成
  if (document.readyState !== 'loading') {
    app.mount('#app');
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      app.mount('#app');
    });
  }
  
  // 注册 Service Worker，提供离线访问和性能优化
  if ('serviceWorker' in navigator) {
    try {
      // 在页面加载完成后注册 Service Worker 可以改善首次加载性能
      window.addEventListener('load', async () => {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker 注册成功:', registration.scope);
      });
    } catch (error) {
      console.error('Service Worker 注册失败:', error);
    }
  }
})();