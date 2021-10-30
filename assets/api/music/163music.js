// 网易云音乐

import http from '@/plugins/request/index.js'
import Config from '@/assets/js/config.js'
import Utils from '@/assets/js/util.js'
import { Single, Album, Singer } from '@/assets/music/music.js'

const { MUSICURL, ERR_OK, ERR_FALSE } = Config
const { time2seconds } = Utils;

const source = '163music';
const href = MUSICURL[source].href;

export default {
	/**
	 * 搜索音乐列表
	 * @param {Object} data = {keyword: '搜索关键词', page: '搜索页数'} 
	 **/
	search (data) {
		const dataSync = {
			keywords: data.keyword,
			limit: 20,
			offset: (data.page[source] - 1) * 20
		}
		return new Promise((resolve) => {
			http.get(href + '/cloudsearch', {
				params: dataSync
			}).then((res) => {
				let songs = res.data.result.songs;
				let list = [];
				if ( res.data.code == 200 ) {
					for ( let i in songs ) {
						let singer = '';
						songs[i].ar.forEach((sin, k) => {
							singer += sin.name + (k < songs[i].ar.length ? ' ' : '')
						})
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
	},
	
	/**
	 * 获取轮播图列表
	 *
	 **/
	getBannerList () {
		return new Promise((resolve) => {
			http.get(href + '/banner', {
				params: {
					type: 1
				}
			}).then((res) => {
				let list = []
				if ( res.data.code == 200 ) {
					res.data.banners.forEach(top => {
						let item = ''
						// if ( top.targetType == 10 ) {
						// 	item = new Single({
						// 		path: top.targetId,
						// 		lyric: top.targetId,
						// 		title: top.typeTitle,
						// 		cover: top.pic,
						// 		source: source
						// 	})
						// }
						if ( top.targetType == 1 ) {
							const song = top.song
							let singer = '';
							song.ar.forEach((sin, k) => {
								singer += sin.name + (k < song.ar.length ? ' ' : '')
							})
							const single = new Single({
								path: song.id,
								lyric: song.id,
								title: song.name,
								cover: song.al.picUrl + '?imageView&thumbnail=360y360&quality=75&tostatic=0',
								singer: singer || '未知歌手',
								source: source
							})
							item = new Album({
								albumId: top.bannerId,
								title: top.typeTitle,
								cover: top.pic,
								desc: top.typeTitle,
								song: [single],
								type: 'banner',
								source: source
							})
						}
						item ? list.push(item) : null
						// console.log(list);
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
				resolve({
					code: ERR_FALSE,
					data: {
						list: [],
						source: source
					}
				})
			})
		})
	},
	
	/**
	 * 获取排行榜
	 *
	 **/
	getToplist () {
		return new Promise((resolve) => {
			http.get(href + '/toplist').then((res) => {
				let list = []
				if ( res.data.code == 200 ) {
					res.data.list.forEach(top => {
						const item = new Album({
							albumId: top.id,
							title: top.name,
							cover: top.coverImgUrl + '?imageView&thumbnail=360y360&quality=75&tostatic=0',
							desc: top.description?.replace(/<br>/g, '') || '',
							type: 'top',
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
				resolve({
					code: ERR_FALSE,
					data: {
						list: [],
						source: source
					}
				})
			})
		})
	},
	
	/**
	 * 获取最新歌曲
	 * 
	 **/
	getNewSongList () {
		return new Promise((resolve) => {
			http.get(href + '/top/song', {
				params: {
					type: 0
				}
			}).then((res) => {
				let list = []
				if ( res.data.code == 200 ) {
					res.data.data.forEach(song => {
						let singer = '';
						song.artists.forEach((sin, k) => {
							singer += sin.name + (k < song.artists.length ? ' ' : '')
						})
						const item = new Single({
							path: song.id,
							lyric: song.id,
							title: song.name,
							cover: song.album.picUrl + '?imageView&thumbnail=360y360&quality=75&tostatic=0',
							singer: singer || '未知歌手',
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
				resolve({
					code: ERR_FALSE,
					data: {
						list: [],
						source: source
					}
				})
			})
		})
	},
	
	/**
	 * 获取歌手类型
	 *
	 **/
	getSingerType() {
		return new Promise((resolve) => {
			const list = [{
				title: '华语',
				typeId: '7',
				source: source
			},{
				title: '欧美',
				typeId: '96',
				source: source
			},{
				title: '日本',
				typeId: '8',
				source: source
			},{
				title: '韩国',
				typeId: '16',
				source: source
			},{
				title: '其它',
				typeId: '0',
				source: source
			}]
			resolve({
				code: ERR_OK,
				data: {
					list: list,
					source: source
				}
			})
		})
	},
	
	/**
	 * 获取热门歌手
	 *
	 **/
	getHotSinger () {
		return new Promise((resolve) => {
			http.get(href + '/top/artists', {
				params: {
					limit: 10
				}
			}).then((res) => {
				let list = []
				if ( res.data.code == 200 ) {
					res.data.artists.forEach(singer => {
						const item = new Singer({
							singerId: singer.id,
							title: singer.name,
							cover: singer.picUrl + '?imageView&thumbnail=360y360&quality=75&tostatic=0',
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
				resolve({
					code: ERR_FALSE,
					data: {
						list: [],
						source: source
					}
				})
			})
		})
	},
	
	/**
	 * 获取歌手
	 * @param {Object} data = {area: 地区} 
	 **/
	getSinger (data) {
		return new Promise((resolve) => {
			http.get(href + '/artist/list', {
				params: {
					limit: 80,
					initial: -1,
					type: -1,
					area: data.area
				}
			}).then((res) => {
				let list = []
				if ( res.data.code == 200 ) {
					res.data.artists.forEach(singer => {
						const item = new Singer({
							singerId: singer.id,
							title: singer.name,
							cover: singer.picUrl + '?imageView&thumbnail=360y360&quality=75&tostatic=0',
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
				resolve({
					code: ERR_FALSE,
					data: {
						list: [],
						source: source
					}
				})
			})
		})
	},
	
	/**
	 * 获取热门歌单
	 *
	 **/
	getHotDiscList () {
		return new Promise((resolve) => {
			this.getDiscList({
				order: 'hot',
				cat: '全部',
				limit: 6
			}).then((res) => {
				resolve({
					code: res.code,
					data: {
						list: res.data.list,
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
	},
	
	/**
	 * 获取歌单
	 * @param {Object} data = {参数} 
	 * @param {String} order = {new or hot} 
	 * @param {Number} limit = {请求数量} 
	 * @param {String} cat = {分类} 
	 **/
	getDiscList (data) {
		return new Promise((resolve) => {
			http.get(href + '/top/playlist', {
				params: {
					order: data.order,
					limit: data.limit,
					cat: data.cat
				}
			}).then((res) => {
				let list = []
				if ( res.data.code == 200 ) {
					res.data.playlists.forEach(top => {
						const item = new Album({
							albumId: top.id,
							title: top.name,
							cover: top.coverImgUrl + '?imageView&thumbnail=360y360&quality=75&tostatic=0',
							desc: top.description,
							num: top.playCount,
							creator: top.creator.nickname,
							type: 'album',
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
				resolve({
					code: ERR_FALSE,
					data: {
						list: [],
						source: source
					}
				})
			})
		})
	},
	
	/**
	 * 获取播放链接
	 * @param {Object} data = {path: '获取音乐播放链接所需路径'} 
	 **/
	getPlayUrl (data) {
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
	},
	
	/**
	 * 获取歌词
	 * @param {Object} data = {lyric: '获取歌词所需链接'} 
	 **/
	getLyric (data) {
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
	},
	source: source
}