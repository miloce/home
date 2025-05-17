<template>
  <aplayer
    showLrc
    ref="player"
    v-if="playList.length > 0 && isPlayerReady"
    :music="currentMusic"
    :list="playList"
    :autoplay="autoplay"
    :theme="theme"
    :repeat="repeat"
    :shuffle="shuffle"
    :listMaxHeight="listMaxHeight"
    :listFolded="listFolded"
    :volume="volume"
    authorKey="author"
    titleKey="title"
    :customLanguage="{unknown: '未知歌手'}"
    @play="onPlay"
    @pause="onPause"
    @timeupdate="onTimeUp"
    @onSelectSong="onSelectSong"
  />
  <div v-else class="player-loading">
    <div class="loading-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="loading-text">音乐列表加载中...</div>
  </div>
</template>
 
<script setup>
import { MusicOne, PlayWrong } from "@icon-park/vue-next";
import aplayer from "vue3-aplayer";
import {
  h,
  ref,
  reactive,
  nextTick,
  onMounted,
  onBeforeUnmount,
  watch,
  computed
} from "vue";
import { getPlayerList } from "@/api";
import { mainStore } from "@/store";
import { safeGet } from "@/utils/index.js";

const store = mainStore();

// 获取播放器 DOM
const player = ref(null);
// 播放器是否准备就绪
const isPlayerReady = ref(false);

// 歌曲播放列表
let playList = ref([]);
let playerLrc = ref("");

// 歌曲播放项
let playIndex = ref(0);
let playListCount = ref(0);

// 计算当前音乐，带有默认值处理
const currentMusic = computed(() => {
  if (playList.value.length === 0 || playIndex.value < 0 || playIndex.value >= playList.value.length) {
    return {
      title: "加载中...",
      author: "未知歌手",
      src: "",
      pic: "https://p2.music.126.net/MITr2Veg1BTqyxuI73jnbg==/109951165628210978.jpg", // 默认封面
      lrc: ""
    };
  }
  return playList.value[playIndex.value];
});

// 配置项
const props = defineProps({
  // 音频自动播放
  autoplay: {
    type: Boolean,
    default: true
  },
  // 主题色
  theme: {
    type: String,
    default: "#efefef",
  },
  // 音频循环播放
  repeat: {
    type: String,
    default: "list", //'list' | 'music' | 'none'
  },
  // 随机播放
  shuffle: {
    type: Boolean,
    default: false,
  },
  // 默认音量
  volume: {
    type: Number,
    default: 0.7,
    validator: (value) => {
      return value >= 0 && value <= 1;
    },
  },
  // 歌曲服务器 ( netease-网易云, tencent-qq音乐, kugou-酷狗, xiami-小米音乐, baidu-百度音乐 )
  songServer: {
    type: String,
    default: "netease", //'netease' | 'tencent' | 'kugou' | 'xiami' | 'baidu'
  },
  // 播放类型 ( song-歌曲, playlist-播放列表, album-专辑, search-搜索, author-艺术家 )
  songType: {
    type: String,
    default: "playlist",
  },
  // id
  songId: {
    type: String,
    default: "7418767218",
  },
  // 列表是否默认折叠
  listFolded: {
    type: Boolean,
    default: false,
  },
  // 列表最大高度
  listMaxHeight: {
    type: String,
    default: "420px",
  },
});

// 延迟加载函数 - 分批处理数据
const processInBatches = (array, batchSize, processFunction) => {
  let index = 0;
  
  function processBatch() {
    const batch = array.slice(index, index + batchSize);
    batch.forEach(processFunction);
    
    index += batchSize;
    
    if (index < array.length) {
      // 使用requestAnimationFrame确保UI响应性
      requestAnimationFrame(processBatch);
    } else {
      // 数据处理完成，标记播放器准备就绪
      setTimeout(() => {
        isPlayerReady.value = true;
      }, 300);
    }
  }
  
  processBatch();
};

// 初始化播放器
onMounted(() => {
  nextTick(() => {
    getPlayerList(props.songServer, props.songType, props.songId)
      .then((res) => {
        // 检查返回数据有效性
        if (!res || !Array.isArray(res) || res.length === 0) {
          throw new Error('音乐列表数据无效');
        }
        
        // 生成歌单信息
        playIndex.value = Math.floor(Math.random() * res.length);
        playListCount.value = res.length;
        // 更改播放器加载状态
        store.musicIsOk = true;
        
        // 使用分批处理来处理歌单数据
        processInBatches(res, 10, (v) => {
          // 确保必要的字段存在
          const item = {
            title: v.title || "未知歌曲",
            author: v.author || "未知歌手",
            artist: v.author || "未知歌手", 
            src: v.url || "",
            pic: v.pic || "https://p2.music.126.net/MITr2Veg1BTqyxuI73jnbg==/109951165628210978.jpg",
            lrc: v.lrc || ""
          };
          playList.value.push(item);
        });
      })
      .catch((error) => {
        console.error("播放器加载失败:", error);
        store.musicIsOk = false;
        ElMessage({
          message: "播放器加载失败",
          grouping: true,
          icon: h(PlayWrong, {
            theme: "filled",
            fill: "#efefef",
          }),
        });
      });
  });
});

// 播放暂停事件
const onPlay = () => {
  try {
    // 安全检查
    if (!player.value || !player.value.audio) return;
    
    // 播放状态
    store.setPlayerState(player.value.audio.paused);
    
    // 储存播放器信息 - 安全获取
    const title = safeGet(player.value, 'currentMusic.title', '未知歌曲');
    const author = safeGet(player.value, 'currentMusic.author', '未知歌手');
    
    store.setPlayerData(title, author);
    
    ElMessage({
      message: store.getPlayerData.title + " - " + store.getPlayerData.author,
      grouping: true,
      icon: h(MusicOne, {
        theme: "filled",
        fill: "#efefef",
      }),
    });
  } catch (error) {
    console.error("播放事件处理错误:", error);
  }
};

const onPause = () => {
  try {
    if (player.value && player.value.audio) {
      store.setPlayerState(player.value.audio.paused);
    }
  } catch (error) {
    console.error("暂停事件处理错误:", error);
  }
};

// 音频时间更新事件
const onTimeUp = () => {
  try {
    if (!player.value || !player.value.$) return;
    
    let playerRef = player.value.$.vnode.el;
    if (playerRef) {
      const lrcElement = playerRef.getElementsByClassName("aplayer-lrc-current")[0];
      if (lrcElement) {
        playerLrc.value = lrcElement.innerHTML;
        store.setPlayerLrc(playerLrc.value);
      }
    }
  } catch (error) {
    console.error("时间更新事件处理错误:", error);
  }
};

// 切换播放暂停事件
const playToggle = () => {
  try {
    if (player.value) {
      player.value.toggle();
    }
  } catch (error) {
    console.error("播放切换错误:", error);
  }
};

// 切换音量事件
const changeVolume = (value) => {
  try {
    if (player.value && player.value.audio) {
      player.value.audio.volume = value;
    }
  } catch (error) {
    console.error("音量调节错误:", error);
  }
};

const onSelectSong = (val) => {
  try {
    if (val && typeof val === 'number') {
      playIndex.value = val;
    }
  } catch (error) {
    console.error("选择歌曲错误:", error);
  }
};

// 切换上下曲
const changeSong = (type) => {
  try {
    if (!player.value) return;
    
    playIndex.value = player.value.playIndex || 0;
    playIndex.value += type ? 1 : -1;
    
    // 判断是否处于最后/第一首
    if (playIndex.value < 0) {
      playIndex.value = playListCount.value - 1;
    } else if (playIndex.value >= playListCount.value) {
      playIndex.value = 0;
    }
    
    nextTick(() => {
      if (player.value) {
        player.value.play();
      }
    });
  } catch (error) {
    console.error("切换歌曲错误:", error);
  }
};

// 暴露子组件方法
defineExpose({ playToggle, changeVolume, changeSong });
</script>
 
<style lang='scss' scoped>
// 加载动画
.player-loading {
  width: 80%;
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ffffff20;
  backdrop-filter: blur(5px);
  border-radius: 6px;
  
  .loading-indicator {
    display: flex;
    gap: 5px;
    
    span {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #efefef;
      animation: bounce 1.4s infinite ease-in-out both;
      
      &:nth-child(1) {
        animation-delay: -0.32s;
      }
      
      &:nth-child(2) {
        animation-delay: -0.16s;
      }
    }
  }
  
  .loading-text {
    margin-top: 8px;
    font-size: 12px;
    color: #efefef;
    opacity: 0.8;
  }
  
  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
}

.aplayer {
  width: 80%;
  background: transparent;
  border-radius: 6px;
  :deep(.aplayer-body) {
    .aplayer-pic {
      display: none;
    }
    .aplayer-info {
      margin-left: 0;
      background-color: #ffffff40;
      border-color: transparent;
      backdrop-filter: blur(5px);
      .aplayer-music {
        flex-grow: initial;
        margin-bottom: 2px;
        overflow: initial;
        .aplayer-title {
          font-size: 16px;
          margin-right: 6px;
        }
        .aplayer-author {
          color: #efefef;
        }
      }
    }
  }
  
  // 移动端优化
  @media (max-width: 720px) {
    width: 100%;
    :deep(.aplayer-body) {
      .aplayer-info {
        padding: 12px 7px 0;
        
        .aplayer-music {
          .aplayer-title {
            font-size: 14px;
          }
          .aplayer-author {
            font-size: 12px;
          }
        }
        
        .aplayer-controller {
          .aplayer-bar-wrap {
            margin: 0 0 0 5px;
          }
        }
      }
      
      .aplayer-list {
        max-height: 300px !important;
        
        ol li {
          .aplayer-list-author {
            font-size: 12px;
            color: #efefef !important;
          }
        }
      }
    }
  }
}
</style>
