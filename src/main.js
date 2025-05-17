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
})();

// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/sw.js')
//         .then(() => {
//             console.log('Service worker registered.');
//         })
//         .catch(err => {
//             console.log('Failed to register service worker: ', err);
//         });
// }

// 添加全局passive event listener来解决Chrome警告
document.addEventListener('touchstart', function() {}, { passive: true });
document.addEventListener('touchmove', function() {}, { passive: true });
document.addEventListener('touchend', function() {}, { passive: true });