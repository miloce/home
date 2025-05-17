/**
 * 通用工具函数
 */

/**
 * 节流函数 - 控制函数在一定时间内只执行一次
 * @param {Function} fn - 要执行的函数
 * @param {Number} delay - 延迟时间（毫秒）
 * @returns {Function} - 节流处理后的函数
 */
export const throttle = (fn, delay = 300) => {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      return fn.apply(this, args);
    }
  };
};

/**
 * 防抖函数 - 函数在最后一次调用后延迟执行
 * @param {Function} fn - 要执行的函数
 * @param {Number} delay - 延迟时间（毫秒）
 * @returns {Function} - 防抖处理后的函数
 */
export const debounce = (fn, delay = 300) => {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

/**
 * 图片懒加载处理
 * @param {String} selector - 图片选择器
 */
export const lazyLoadImages = (selector = 'img[data-src]') => {
  const imgObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.getAttribute('data-src');
        if (src) {
          img.setAttribute('src', src);
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  });
  
  // 为所有懒加载图片添加观察器
  document.querySelectorAll(selector).forEach(img => {
    imgObserver.observe(img);
  });
};

/**
 * 检查是否为移动设备
 * @returns {Boolean} - 是否为移动设备
 */
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * 安全地访问深层嵌套对象属性
 * @param {Object} object - 要访问的对象 
 * @param {String} path - 属性路径，如 'user.profile.name'
 * @param {*} defaultValue - 如果路径不存在，返回的默认值
 * @returns {*} - 属性值或默认值
 */
export const safeGet = (object, path, defaultValue = undefined) => {
  const keys = path.split('.');
  let result = object;
  
  for (const key of keys) {
    if (result === undefined || result === null) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result === undefined ? defaultValue : result;
}; 