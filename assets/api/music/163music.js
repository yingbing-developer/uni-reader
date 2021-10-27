// 网易云音乐

import http from '@/plugins/request/index.js'
import Config from '@/assets/js/config.js'
import Utils from '@/assets/js/util.js'
import { Single, Album } from '@/assets/music/music.js'

const { MUSICURL, ERR_OK, ERR_FALSE } = Config
const { time2seconds } = Utils;

const source = '163music';
const href = MUSICURL[source].href;

/**
 * 搜索音乐列表
 * @param {Object} data = {keyword: '搜索关键词', page: '搜索页数'} 
 **/
const search = function (data) {
	const dataSync = {
		keywords: data.keyword,
		limit: 20,
		offset: (data.page[source] - 1) * 20
	}
	return new Promise((resolve, reject) => {
		http.get(href + '/cloudsearch', {
			params: dataSync
		}).then((res) => {
			let songs = res.data.result.songs;
			let list = [];
			if ( res.data.code == 200 ) {
				for ( let i in songs ) {
					let singer = '';
					for ( let j in songs[i].ar ) {
						singer += songs[i].ar[j].name + (j < songs[i].ar.length ? ' ' : '')
					}
					const item = new Single({
						path: songs[i].id,
						lyric: songs[i].id,
						title: songs[i].name,
						cover: songs[i].al.picUrl + '?imageView&thumbnail=360y360&quality=75&tostatic=0',
						singer: singer || '未知歌手',
						source: source
					})
					list.push(item)
				}
			}
			resolve({
				code: ERR_OK,
				data: {
					list: list,
					source: source
				}
			})
			
		}).catch((err) => {
			resolve({
				code: ERR_FALSE,
				data: {
					list: [],
					source: source
				}
			})
		})
	})
}

/**
 * 获取排行榜
 *
 **/
const getToplist = function (data) {
	return new Promise((resolve, reject) => {
		http.get(href + '/toplist').then((res) => {
			let list = []
			if ( res.data.code == 200 ) {
				res.data.list.forEach(top => {
					const item = new Album({
						id: top.id,
						title: top.name,
						cover: top.coverImgUrl,
						desc: top.description?.replace(/<br>/g, '') || '',
						source: source
					})
					list.push(item)
				})
			}
			resolve({
				code: ERR_OK,
				data: {
					list: list,
					source: source
				}
			})
		}).catch((err) => {
			reject({
				code: ERR_FALSE,
				data: {
					list: [],
					source: source
				}
			})
		})
	})
}

/**
 * 获取播放链接
 * @param {Object} data = {path: '获取音乐播放链接所需路径'} 
 **/
const getPlayUrl = function (data) {
	const dataSync = {
		id: data.path
	}
	return new Promise((resolve, reject) => {
		http.get(href + '/song/url', {
			params: dataSync
		}).then((res) => {
			let playUrl = ''
			if ( res.data.code == 200 ) {
				playUrl = res.data.data[0].url || '';
			} else {
				playUrl = `https://music.163.com/song/media/outer/url?id=${data.path}.mp3`
			}
			resolve({
				code: ERR_OK,
				data: {
					src: playUrl,
					source: source
				}
			})
		}).catch((err) => {
			reject({
				code: ERR_FALSE,
				data: {
					src: '',
					source: source
				}
			})
		})
	})
}

/**
 * 获取歌词
 * @param {Object} data = {lyric: '获取歌词所需链接'} 
 **/
const getLyric = function (data) {
	const dataSync = {
		id: data.lyric
	}
	return new Promise((resolve, reject) => {
		http.get(href + '/lyric', {
			params: dataSync
		}).then((res) => {
			let lyrics = [];
			if ( res.data.code == 200 ) {
				let arr = res.data.lrc.lyric.split('\n');
				for ( let i in arr ) {
					let time = arr[i].match(/\[(\S*)\]/) ? arr[i].match(/\[(\S*)\]/)[0] : '';
					let title = arr[i].split(']')[1];
					if ( title && time ) {
						lyrics.push({
							time: time2seconds(time.substring(1, time.length-1)),
							title: title
						})
					}
				}
			}
			resolve({
				code: ERR_OK,
				data: {
					lyric: lyrics,
					source: source
				}
			})
		}).catch((err) => {
			reject({
				code: ERR_FALSE,
				data: {
					lyric: [],
					source: source
				}
			})
		})
	})
}

export default {
	namespaced: true,
	search,
	getToplist,
	getPlayUrl,
	getLyric,
	source
}