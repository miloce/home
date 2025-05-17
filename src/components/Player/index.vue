<template>
  <aplayer
    showLrc
    ref="player"
    v-if="playList[0]"
    :music="playList[playIndex]"
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
} from "vue";
import { getPlayerList } from "@/api";
import { mainStore } from "@/store";

const store = mainStore();

// 获取播放器 DOM
const player = ref(null);

// 歌曲播放列表
let playList = ref([]);
let playerLrc = ref("");

// 歌曲播放项
let playIndex = ref(0);
let playListCount = ref(0);

// 配置项
let autoplay = ref(false);
let theme = ref("#efefef");
let repeat = ref("all");
let shuffle = ref(false);
let listMaxHeight = ref("420px");
let listFolded = ref(false);
let volume = ref(store.musicVolume ? store.musicVolume : 0.7);

const props = defineProps({
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
});

// 添加用户交互检测
const enableAutoplay = () => {
  // 用户交互后启用自动播放
  document.removeEventListener('click', enableAutoplay);
  document.removeEventListener('keydown', enableAutoplay);
  if (player.value && playList.value.length > 0) {
    player.value.play();
  }
};

// 获取音乐列表
const getMusicList = () => {
  nextTick(() => {
    getPlayerList(props.songServer, props.songType, props.songId)
      .then((res) => {
        // 生成歌单信息
        playIndex.value = Math.floor(Math.random() * res.length);
        playListCount.value = res.length;
        // 更改播放器加载状态
        store.musicIsOk = true;
        console.log(
          "音乐加载完成",
          res,
          playIndex.value,
          playListCount.value
        );
        // 生成歌单
        res.forEach((v) => {
          console.log("歌曲作者信息:", v.author);
          playList.value.push({
            title: v.title,
            author: v.author || "未知歌手",
            artist: v.author || "未知歌手",
            src: v.url,
            pic: v.pic,
            lrc: v.lrc,
          });
        });
        // 打印完整的播放列表数据
        console.log("完整歌单数据:", JSON.stringify(playList.value));
      })
      .catch(() => {
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
};

onMounted(() => {
  // 监听用户交互来启用自动播放
  document.addEventListener('click', enableAutoplay);
  document.addEventListener('keydown', enableAutoplay);
  
  // 获取音乐列表
  getMusicList();
});

onBeforeUnmount(() => {
  // 清除事件监听
  document.removeEventListener('click', enableAutoplay);
  document.removeEventListener('keydown', enableAutoplay);
});

// 播放暂停事件
const onPlay = () => {
  console.log("播放");
  // 播放状态
  store.setPlayerState(player.value.audio.paused);
  // 添加调试代码
  console.log("CurrentMusic:", player.value.currentMusic);
  // 储存播放器信息
  store.setPlayerData(
    player.value.currentMusic.title,
    player.value.currentMusic.author
  );
  console.log("Store数据:", store.getPlayerData);
  ElMessage({
    message: store.getPlayerData.title + " - " + store.getPlayerData.author,
    grouping: true,
    icon: h(MusicOne, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
};
const onPause = () => {
  store.setPlayerState(player.value.audio.paused);
};

// 音频时间更新事件
const onTimeUp = () => {
  let playerRef = player.value.$.vnode.el;
  if (playerRef) {
    playerLrc.value = playerRef.getElementsByClassName(
      "aplayer-lrc-current"
    )[0].innerHTML;
    store.setPlayerLrc(playerLrc.value);
  }
};

// 切换播放暂停事件
const playToggle = () => {
  player.value.toggle();
};

// 切换音量事件
const changeVolume = (value) => {
  player.value.audio.volume = value;
};

const onSelectSong = (val) => {
  console.log(val);
};

// 切换上下曲
const changeSong = (type) => {
  playIndex.value = player.value.playIndex;
  playIndex.value += type ? 1 : -1;
  // 判断是否处于最后/第一首
  if (playIndex.value < 0) {
    playIndex.value = playListCount.value - 1;
  } else if (playIndex.value >= playListCount.value) {
    playIndex.value = 0;
  }
  // console.log(playIndex.value, playList.value[playIndex.value]);
  nextTick(() => {
    player.value.play();
  });
};

// 暴露子组件方法
defineExpose({ playToggle, changeVolume, changeSong });
</script>
 
<style lang='scss' scoped>
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
      .aplayer-lrc {
        text-align: left;
        margin: 4px 0 6px 6px;
        height: 100%;
        mask: linear-gradient(
          #fff 15%,
          #fff 85%,
          hsla(0deg, 0%, 100%, 0.6) 90%,
          hsla(0deg, 0%, 100%, 0)
        );
        -webkit-mask: linear-gradient(
          #fff 15%,
          #fff 85%,
          hsla(0deg, 0%, 100%, 0.6) 90%,
          hsla(0deg, 0%, 100%, 0)
        );
        &::before,
        &::after {
          display: none;
        }
        p {
          color: #efefef;
        }
        .aplayer-lrc-current {
          font-size: 0.95rem;
          margin-bottom: 4px !important;
        }
      }
      .aplayer-controller {
        display: none;
      }
    }
  }
  :deep(.aplayer-list) {
    margin-top: 6px;
    ol {
      &::-webkit-scrollbar-track {
        background-color: transparent;
      }
      li {
        border-color: transparent;
        &.aplayer-list-light {
          background: #ffffff40;
          border-radius: 6px;
        }
        &:hover {
          background: #ffffff26 !important;
          border-radius: 6px !important;
        }
        .aplayer-list-index,
        .aplayer-list-author {
          color: #efefef;
        }
      }
    }
  }
}
</style>
