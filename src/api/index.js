// import axios from "axios";

// fetch API 增强版，添加错误处理和超时控制
const enhancedFetch = async (url, options = {}) => {
    // 默认超时时间设置为10秒
    const timeout = options.timeout || 10000;
    
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
    return await enhancedFetch(`https://apis.map.qq.com/ws/location/v1/ip?key=${key}`);
}

// 获取腾讯地图天气信息
export const getWeather = async (key, adcode) => {
    return await enhancedFetch(`https://apis.map.qq.com/ws/weather/v1/?key=${key}&adcode=${adcode}`);
}
