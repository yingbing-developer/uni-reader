//音乐播放临时阅读数据
import Utils from '@/assets/js/util.js';
const { indexOf, suffix, dateFormat, removeSuffix, randomString } = Utils;
const state = {
	musicInfo: '',//当前播放音乐信息
	musicPlayStatus: false,//音乐播放状态
	musicPlayTime: 0,//当前音乐播放位置
	musicPlayDuration: 0,//当前音乐总时长
	musicLyric: [],//当前音乐歌词
}

const getters = {
	getMusicInfo (state) {
		return state.musicInfo;
	},
	getMusicPlayStatus (state) {
		return state.musicPlayStatus
	},
	getMusicPlayTime (state) {
		return state.musicPlayTime
	},
	getMusicPlayDuration (state) {
		return state.musicPlayDuration
	},
	getMusicLyric (state) {
		return state.musicLyric
	}
}

const mutations = {
	setMusicInfo (state, musicInfo) {
		state.musicInfo = musicInfo
	},
	//设置音乐播放状态
	setMusicPlayStatus (state, status) {
		state.musicPlayStatus = status;
	},
	//设置音乐播放时长
	setMusicPlayTime (state, time) {
		state.musicPlayTime = time;
	},
	//设置音乐总时长
	setMusicPlayDuration (state, duration) {
		state.musicPlayDuration = duration;
	},
	//设置音乐歌词
	setMusicLyric (state, lyric) {
		state.musicLyric = lyric;
	},
}

export default {
    namespaced: true,
    state,
    getters,
    mutations
}