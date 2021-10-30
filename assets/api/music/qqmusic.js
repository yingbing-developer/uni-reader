// QQ音乐

import http from '@/plugins/request/index.js'
import Config from '@/assets/js/config.js'
import Utils from '@/assets/js/util.js'
import {
	Single,
	Album,
	Singer
} from '@/assets/music/music.js'

import Sign from '@/assets/other/qqSign.js'

const {
	MUSICURL,
	ERR_OK,
	ERR_FALSE
} = Config
const {
	time2seconds
} = Utils;

const source = 'qqmusic';
const href = MUSICURL[source].href;

//QQ音乐请求常量
const commonParams = {
	g_tk: 5381,
	loginUin: 0,
	hostUin: 0,
	format: 'json',
	inCharset: 'utf8',
	outCharset: 'utf-8',
	notice: 0,
	platform: 'yqq.json',
	needNewCode: 0
}


//转义html特殊字符
const htmlDecodeByRegExp = function(str) {
	let s = "";
	if (str.length == 0) return "";
	s = str.replace(/&#58;/g, ":");
	s = s.replace(/&#32;/g, " ");
	s = s.replace(/&#33;/g, "!");
	s = s.replace(/&#34;/g, '"');
	s = s.replace(/&#35;/g, "#");
	s = s.replace(/&#36;/g, "$");
	s = s.replace(/&#37;/g, "%");
	s = s.replace(/&#38;/g, "&");
	s = s.replace(/&#39;/g, "'");
	s = s.replace(/&#40;/g, "(");
	s = s.replace(/&#41;/g, ")");
	s = s.replace(/&#42;/g, "*");
	s = s.replace(/&#43;/g, "+");
	s = s.replace(/&#44;/g, ",");
	s = s.replace(/&#45;/g, "-");
	s = s.replace(/&#46;/g, ".");
	s = s.replace(/&#47;/g, "/");
	s = s.replace(/&#13;/g, "\n");
	return s;
}

export default {
	/**
	 * 搜索音乐列表
	 * @param {Object} data = {keyword: '搜索关键词', page: '搜索页数'} 
	 **/
	search(data) {
		let dataSync = Object.assign({
			_: '15778592' + Math.floor(Math.random() * Math.pow(10, 5)),
		}, commonParams, {
			w: data.keyword,
			zhidaqu: 1,
			catZhida: 0,
			t: 0,
			flag: 1,
			ie: 'utf-8',
			sem: 1,
			aggr: 0,
			perpage: 20,
			n: 20,
			p: data.page[source],
			remoteplace: 'txt.mqq.all'
		})
		return new Promise((resolve, reject) => {
			http.get(href + '/soso/fcgi-bin/client_search_cp', {
				params: dataSync,
				headers: {
					referer: href,
					host: 'c.y.qq.com',
				}
			}).then((res) => {
				if (res.data.code == 0) {
					let songs = res.data.data.song.list;
					let list = [];
					for (let i in songs) {
						// if ( songs[i].pay.payplay == 0 ) {
						let singer = '';
						songs[i].singer.forEach((sin, k) => {
							singer += sin.name + (k < songs[i].singer.length ? ' ' : '')
						})
						const item = new Single({
							path: songs[i].songmid,
							lyric: songs[i].songid,
							title: songs[i].songname,
							cover: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${songs[i].albummid}.jpg?max_age=2592000`,
							singer: singer,
							source: source
						})
						list.push(item)
						// }
					}
					resolve({
						code: ERR_OK,
						data: {
							list: list,
							source: source
						}
					})
				}

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
	getBannerList() {
		const dataSync = Object.assign({
			'-': 'recom61961704538089270',
		}, commonParams, {
			data: JSON.stringify({
				"comm": {
					"ct": 24
				},
				"focus": {
					"module": "QQMusic.MusichallServer",
					"method": "GetFocus",
					"param": {}
				}
			})
		})
		return new Promise((resolve) => {
			http.get(href + '/cgi-bin/musicu.fcg', {
				params: dataSync,
				headers: {
					referer: href,
					host: href.replace('https://', ''),
				}
			}).then((res) => {
				let list = []
				if (res.data.code == 0) {
					const group = res.data.focus.data.content
					group.forEach(top => {
						const item = new Album({
							albumId: top.jump_info.url,
							title: top.title,
							cover: top.pic_info.url,
							desc: top.type,
							type: 'banner',
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
	 * 获取排行榜
	 *
	 **/
	getToplist() {
		const dataSync = {
			'-': '1577850668501',
			data: JSON.stringify({
				"comm": Object.assign({}, commonParams, {
					"ct": 23,
					"cv": 0
				}),
				"topList": {
					"module": "musicToplist.ToplistInfoServer",
					"method": "GetAll",
					"param": {}
				}
			})
		}
		return new Promise((resolve) => {
			http.get(href + '/cgi-bin/musicu.fcg', {
				params: dataSync,
				headers: {
					referer: href,
					host: href.replace('https://', ''),
				}
			}).then((res) => {
				let list = []
				if (res.data.code == 0) {
					const group = res.data.topList.data.group
					group.forEach(item => {
						item.toplist.forEach(top => {
							const item = new Album({
								albumId: top.topId,
								title: top.musichallTitle,
								cover: top.frontPicUrl,
								desc: top.intro?.replace(/<br>/g, '') || '',
								type: 'top',
								source: source
							})
							list.push(item)
						})
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
	getNewSongList() {
		const dataValue = {
			'comm': {
				'ct': 24
			},
			'new_song': {
				'module': 'newsong.NewSongServer',
				'method': 'get_new_song_info',
				'param': {
					'type': 5
				}
			},
		}
		const sign = Sign(dataValue)
		const dataSync = Object.assign({
			'-': 'recom' + (Math.random() + '').replace('0.', ''),
			sign: sign
		}, commonParams, {
			data: dataValue
		})
		return new Promise((resolve) => {
			http.get(href + '/cgi-bin/musics.fcg', {
				params: dataSync,
				headers: {
					referer: href,
					host: href.replace('https://', ''),
				}
			}).then((res) => {
				let list = []
				if (res.data.code == 0) {
					const group = res.data.new_song.data.songlist
					group.forEach(song => {
						let singer = '';
						song.singer.forEach((sin, k) => {
							singer += sin.name + (k < song.singer.length ? ' ' : '')
						})
						const item = new Single({
							path: song.mid,
							lyric: song.id,
							title: song.title,
							cover: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${song.album.mid}.jpg?max_age=2592000`,
							desc: song.desc,
							singer: singer,
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
				title: '内地',
				typeId: '200',
				source: source
			},{
				title: '港台',
				typeId: '2',
				source: source
			},{
				title: '欧美',
				typeId: '5',
				source: source
			},{
				title: '日本',
				typeId: '4',
				source: source
			},{
				title: '韩国',
				typeId: '3',
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
	getHotSinger() {
		return new Promise((resolve) => {
			this.getSinger({
				area: -100
			}).then((res) => {
				resolve({
					code: res.code,
					data: {
						list: res.data.list.slice(0, 10),
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
	getSinger(data) {
		const dataSync = Object.assign({
			'-': 'getUCGI' + Math.random() * Math.pow(10, 17)
		}, commonParams, {
			data: JSON.stringify({"comm":{"ct":24,"cv":0},"singerList":{"module":"Music.SingerListServer","method":"get_singer_list","param":{"area": parseInt(data.area),"sex":-100,"genre":-100,"index":-100,"sin":0,"cur_page":1}}})
		})
		return new Promise((resolve) => {
			http.get(href + '/cgi-bin/musicu.fcg', {
				params: dataSync,
				headers: {
					referer: href,
					host: href.replace('https://', ''),
				}
			}).then((res) => {
				let list = []
				if (res.data.code == 0) {
					const group = res.data.singerList.data.singerlist
					group.forEach(singer => {
						const item = new Singer({
							singerId: singer.singer_mid,
							title: singer.singer_name,
							cover: singer.singer_pic,
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
	getHotDiscList() {
		const dataSync = Object.assign({}, commonParams, {
			picmid: 1,
			rnd: 0.660100644751829,
			categoryId: 10000000,
			sortId: 5,
			sin: 0,
			ein: 19
		})
		return new Promise((resolve) => {
			http.get('https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg', {
				params: dataSync,
				headers: {
					referer: 'https://c.y.qq.com',
					host: 'c.y.qq.com',
				}
			}).then((res) => {
				let list = []
				if (res.data.code == 0) {
					const group = res.data.data.list
					group.forEach(top => {
						const item = new Album({
							albumId: top.dissid,
							title: top.dissname,
							cover: top.imgurl,
							desc: top.dissname,
							num: top.listennum,
							creator: top.creator.name,
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
	 * 获取歌单
	 * @param {Object} data = {参数} 
	 * @param {String} order = {new or hot} 
	 * @param {Number} limit = {请求数量} 
	 * @param {String} cat = {分类} 
	 **/
	getDiscList(data) {
		const dataValue = {
			"comm": {
				"ct": 24
			},
			"playlist": {
				"param": {
					"caller": "0",
					"category_id": 3,
					"size": 20,
					"page": 0,
					"use_page": 1
				},
				"method": "get_category_content",
				"module": "music.playlist.PlayListCategory"
			}
		}
		const sign = Sign(dataValue)
		const dataSync = Object.assign({
			'-': 'recom' + (Math.random() + '').replace('0.', ''),
			sign: sign
		}, commonParams, {
			data: dataValue
		})
		return new Promise((resolve) => {
			http.get(href + '/cgi-bin/musics.fcg', {
				params: dataSync,
				headers: {
					referer: href,
					host: href.replace('https://', ''),
				}
			}).then((res) => {
				let list = []
				if (res.data.code == 0) {
					const group = res.data.data.list
					group.forEach(top => {
						const item = new Album({
							albumId: top.dissid,
							title: top.dissname,
							cover: top.imgurl,
							desc: top.dissname,
							num: top.listennum,
							creator: top.creator.name,
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
	getPlayUrl(data) {
		const dataSync = Object.assign({
			'-': 'getplaysongvkey700897959535075'
		}, commonParams, {
			data: JSON.stringify({
				"req": {
					"module": "CDN.SrfCdnDispatchServer",
					"method": "GetCdnDispatch",
					"param": {
						"guid": "7764863790",
						"calltype": 0,
						"userip": ""
					}
				},
				"req_0": {
					"module": "vkey.GetVkeyServer",
					"method": "CgiGetVkey",
					"param": {
						"guid": "7764863790",
						"songmid": [data.path],
						"songtype": [0],
						"uin": "0",
						"loginflag": 1,
						"platform": "20"
					}
				},
				"comm": {
					"uin": 0,
					"format": "json",
					"ct": 24,
					"cv": 0
				}
			})
		})
		return new Promise((resolve, reject) => {
			http.get(href + '/cgi-bin/musicu.fcg', {
				params: dataSync,
				headers: {
					referer: href,
					host: href.replace('https://', ''),
				}
			}).then((res) => {
				let playUrl = '';
				if (res.data.code == 0) {
					if (res.data.req_0.data.midurlinfo['0'].purl) {
						playUrl = res.data.req_0.data.midurlinfo['0'].purl ? res.data.req_0.data.sip[
							1] + res.data.req_0.data.midurlinfo['0'].purl : '';
					}
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
	getLyric(data) {
		const dataSync = Object.assign({}, commonParams, {
			'-': 'jsonp1',
			nobase64: 1,
			musicid: data.lyric
		})
		return new Promise((resolve, reject) => {
			http.get('https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_yqq.fcg', {
				params: dataSync,
				headers: {
					referer: 'https://c.y.qq.com',
					host: 'c.y.qq.com',
				}
			}).then((res) => {
				let lyrics = [];
				if (res.data.code == 0) {
					let arr = htmlDecodeByRegExp(res.data.lyric).split('&#10;');
					for (let i in arr) {
						if (i >= 5) {
							let time = arr[i].match(/\[(\S*)\]/) ? arr[i].match(/\[(\S*)\]/)[0] : '';
							let title = arr[i].split(']')[1];
							if (title && time) {
								lyrics.push({
									time: time2seconds(time.substring(1, time.length - 1)),
									title: title
								})
							}
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
