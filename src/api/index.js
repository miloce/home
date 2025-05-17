// import axios from "axios";

// fetch API 增强版，添加错误处理和超时控制
const enhancedFetch = async (url, options = {}) => {
    // 默认超时时间设置为10秒
    const timeout = options.timeout || 10000;
    
    // 检查是否为JSONP请求
    if(url.includes('output=jsonp')) {
        return new Promise((resolve, reject) => {
            const callbackName = 'jsonp_' + Date.now() + Math.floor(Math.random() * 1000);
            const script = document.createElement('script');
            let timeoutId;
            
            // 设置全局回调函数
            window[callbackName] = (data) => {
                // 清除超时计时器
                clearTimeout(timeoutId);
                // 清理DOM和全局变量
                document.body.removeChild(script);
                delete window[callbackName];
                resolve(data);
            };
            
            // 处理超时
            timeoutId = setTimeout(() => {
                // 清理DOM和全局变量
                document.body.removeChild(script);
                delete window[callbackName];
                reject(new Error(`请求超时: ${url}`));
            }, timeout);
            
            // 处理脚本错误
            script.onerror = () => {
                // 清除超时计时器
                clearTimeout(timeoutId);
                // 清理DOM和全局变量
                document.body.removeChild(script);
                delete window[callbackName];
                reject(new Error(`JSONP请求失败: ${url}`));
            };
            
            // 添加callback参数到URL
            const jsonpUrl = url.replace('callback=callback', `callback=${callbackName}`);
            script.src = jsonpUrl;
            
            // 将脚本添加到DOM
            document.body.appendChild(script);
        });
    }
    
    // 常规fetch请求
    // 创建一个AbortController来处理超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new Error(`请求超时: ${url}`);
        }
        
        // 重新抛出原始错误或包装为更友好的错误
        throw new Error(`请求失败: ${error.message}`);
    }
};

/**
 * 音乐播放器
 */

// 获取音乐播放列表
export const getPlayerList = async (server, type, id) => {
    return await enhancedFetch(`${import.meta.env.VITE_SONG_API}?server=${server}&type=${type}&id=${id}`);
}

/**
 * 一言
 */

// 获取一言数据
export const getHitokoto = async () => {
    return await enhancedFetch("https://v1.hitokoto.cn");
}

/**
 * 天气
 */

// 获取腾讯地图IP定位信息
export const getAdcode = async (key) => {
    return await enhancedFetch(`https://apis.map.qq.com/ws/location/v1/ip?key=${key}&output=jsonp&callback=callback`);
}

// 获取高德地理天气信息
export const getWeather = async (key, city) => {
    return await enhancedFetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${key}&city=${city}`);
}
