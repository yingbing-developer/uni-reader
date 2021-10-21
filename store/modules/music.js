import Utils from '@/assets/js/util.js';
const { indexOf, suffix, dateFormat, removeSuffix, randomString } = Utils;

import {
MUSICPATH,
MUSICCOLLECTION,
MUSICPLAYLIST,
PLAYMODE,
PLAYRECORD,
MUSICSOURCES,
MUSICLYRICSHOW } from '../config.js'

const state = {
	playList: uni.getStorageSync(MUSICPLAYLIST) || [],//播放列表
	musicPath: uni.getStorageSync(MUSICPATH) || '', //默认访问的本地音乐资源路径
	collectionList: uni.getStorageSync(MUSICCOLLECTION) || [], //音乐收藏列表
	musicPlayMode: uni.getStorageSync(PLAYMODE) || 'loop', //音乐播放模式 loop => 循环播放 once => 单曲循环 random => 乱序播放
	musicPlayRecord: uni.getStorageSync(PLAYRECORD) || '', //音乐播放记录
	musicLyricShow: uni.getStorageSync(MUSICLYRICSHOW) || false, //控制歌词显示
	musicSourcesController: uni.getStorageSync(MUSICSOURCES) || [] //在线音乐来源控制,放进来的表示关闭获取此来源的音乐
}

const getters = {
	getPlayList (state) {
		return state.playList;
	},
	musicPathHistory (state) {
		return state.musicPath
	},
	getCollection (state) {
		return state.collectionList
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
	//添加播放列表
	addPlayList (state, musics) {
		for ( let i in musics ) {
			state.playList.push(musics[i])
		}
		uni.setStorageSync(MUSICPLAYLIST, state.playList);
	},
	removePlayList (state, id) {
		const index = state.playList.findIndex(music => music.id == id)
		if ( index > -1 ) {
			state.playList.splice(index ,1)
			uni.setStorageSync(MUSICPLAYLIST, state.playList);
		}
	},
	clearPlayList (state) {
		state.playList = []
		uni.removeStorageSync(MUSICPLAYLIST)
	},
	//新增收藏列表
	addCollection (state, musics) {
		for ( let i in musics ) {
			state.collectionList.push(musics[i])
		}
		uni.setStorageSync(MUSICCOLLECTION, state.collectionList);
	},
	//删除指定收藏歌曲
	removeCollection (state, id) {
		const index = state.collectionList.findIndex(collection => collection.id == id)
		if ( index > -1 ) {
			state.collectionList.splice(index, 1);
			uni.setStorageSync(MUSICCOLLECTION, state.collectionList)
		}
	},
	//清空所有收藏歌曲
	clearCollection (state, type) {
		state.collectionList = [];
		uni.removeStorageSync(MUSICCOLLECTION)
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