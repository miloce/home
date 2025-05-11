if('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { 
      scope: '/',
      type: 'classic',
      updateViaCache: 'none' 
    })
    .then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
      
      // 定期检查更新
      setInterval(() => {
        registration.update();
      }, 3600000); // 每小时检查一次更新
    })
    .catch(error => {
      console.error('Service Worker registration failed:', error);
    });
  });
}