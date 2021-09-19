import Utils from '@/assets/js/util.js';
const { indexOf, suffix, dateFormat, removeSuffix, randomString } = Utils;

import {
MUSICPATH,
PLAYLIST,
PLAYMODE,
PLAYRECORD,
MUSICSOURCES,
MUSICLYRICSHOW } from '../config.js'

const state = {
	musicPath: uni.getStorageSync(MUSICPATH) || '', //默认访问的本地音乐资源路径
	musicPlayList: uni.getStorageSync(PLAYLIST) || [], //音乐播放列表
	musicPlayMode: uni.getStorageSync(PLAYMODE) || 'loop', //音乐播放模式 loop => 循环播放 once => 单曲循环 random => 乱序播放
	musicPlayRecord: uni.getStorageSync(PLAYRECORD) || '', //音乐播放记录
	musicLyricShow: uni.getStorageSync(MUSICLYRICSHOW) || false, //控制歌词显示
	musicSourcesController: uni.getStorageSync(MUSICSOURCES) || [] //在线音乐来源控制,放进来的表示关闭获取此来源的音乐
}

const getters = {
	musicPathHistory (state) {
		return state.musicPath
	},
	playList (state) {
		return state.musicPlayList
	},
	getMusicPlayMode (state) {
		return state.musicPlayMode
	},
	getMusicPlayRecord (state) {
		return state.musicPlayRecord
	},
	getMusicSourcesController (state) {
		return state.musicSourcesController
	},
	getMusicLyricShow (state) {
		return state.musicLyricShow
	}
}

const mutations = {
	//新增歌曲
	addMusic (state, music) {
		for ( let i in music ) {
			state.musicPlayList.push({
				name: removeSuffix(music[i].name),
				image: music[i].image ? music[i].image : '/static/music/music-bg.jpg',
				singer: music[i].singer || '未知歌手' ,
				path: music[i].path,
				lyric: music[i].lyric || false,
				source: music[i].source ? music[i].source : 'local'
			})
		}
		uni.setStorageSync(PLAYLIST, state.musicPlayList);
	},
	//删除指定歌曲
	deleteMusic (state, path) {
		let flag = indexOf(state.musicPlayList, 'path', path);
		if ( flag > -1 ) {
			state.musicPlayList.splice(flag, 1);
			uni.setStorageSync(PLAYLIST, state.musicPlayList)
		}
	},
	//清空所有歌曲
	clearMusic (state, type) {
		state.musicPlayList = [];
		uni.setStorageSync(PLAYLIST, state.musicPlayList);
		state.musicPlayRecord = '';
		uni.setStorageSync(PLAYRECORD, state.musicPlayRecord);
		state.musicPlayTime = 0;
		state.musicPlayDuration = 0;
	},
	//更新音乐播放记录
	updateMusicPlayRecord (state, record) {
		state.musicPlayRecord = record;
		uni.setStorageSync(PLAYRECORD, state.musicPlayRecord);
	},
	//改变音乐播放模式
	changeMusicPlayMode (state, mode) {
		state.musicPlayMode = mode;
		uni.setStorageSync(PLAYMODE, state.musicPlayMode);
	},
	//更新本地音乐上次访问文件夹位置
	updateMusicPath (state, path) {
		state.musicPath = path;
		uni.setStorageSync(MUSICPATH, state.musicPath);
	},
	//设置歌词是否展示
	setMusicLyricShow (state, bool) {
		state.musicLyricShow = bool;
		uni.setStorageSync(MUSICLYRICSHOW, state.musicLyricShow);
	},
	//设置在线音乐来源
	setMusicSourcesController (state, sources) {
		state.musicSourcesController = sources;
		uni.setStorageSync(MUSICSOURCES, state.musicSourcesController);
	}
}

export default {
    namespaced: true,
    state,
    getters,
    mutations
}