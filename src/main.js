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

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue错误:', err);
  console.error('错误组件:', vm);
  console.error('错误信息:', info);
};

// 全局未捕获Promise错误
window.addEventListener('unhandledrejection', event => {
  console.warn('未处理的Promise错误:', event.reason);
});

// 全局错误处理
window.onerror = function(message, source, lineno, colno, error) {
  console.error('全局错误:', {
    message,
    source,
    lineno,
    colno,
    error
  });
  // 返回true表示已处理错误，避免默认错误处理
  return true;
};

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
      // 尝试使用相对路径注册
      window.addEventListener('load', async () => {
        try {
          // 先尝试使用Vue应用构建后的正确路径
          const registration = await navigator.serviceWorker.register('./service-worker.js');
          console.log('Service Worker 注册成功:', registration.scope);
        } catch (e) {
          // 如果失败，静默处理错误，不影响主程序运行
          console.warn('Service Worker 注册失败，网站仍可正常使用:', e);
        }
      });
    } catch (error) {
      console.warn('Service Worker 功能不可用:', error);
    }
  }
})();