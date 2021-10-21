// QQ音乐

import http from '@/plugins/request/index.js'
import Config from '@/assets/js/config.js'
import Utils from '@/assets/js/util.js'
import Music from '@/assets/music/music.js'

const { MUSICURL, ERR_OK, ERR_FALSE, commonParams } = Config
const { time2seconds } = Utils;

const source = 'qqmusic';
const href = MUSICURL[source].href;

//转义html特殊字符
const htmlDecodeByRegExp = function (str){ 
	let s = "";
	if( str.length == 0 ) return "";
	s = str.replace(/&#58;/g,":");
	s = s.replace(/&#32;/g," ");
	s = s.replace(/&#33;/g,"!");
	s = s.replace(/&#34;/g,'"');
	s = s.replace(/&#35;/g,"#");
	s = s.replace(/&#36;/g,"$");
	s = s.replace(/&#37;/g,"%");
	s = s.replace(/&#38;/g,"&");
	s = s.replace(/&#39;/g,"'");
	s = s.replace(/&#40;/g,"(");
	s = s.replace(/&#41;/g,")");
	s = s.replace(/&#42;/g,"*");
	s = s.replace(/&#43;/g,"+");
	s = s.replace(/&#44;/g,",");
	s = s.replace(/&#45;/g,"-");
	s = s.replace(/&#46;/g,".");
	s = s.replace(/&#47;/g,"/");
	s = s.replace(/&#13;/g,"\n");
	return s; 
}


/**
 * 搜索音乐列表
 * @param {Object} data = {keyword: '搜索关键词', page: '搜索页数'} 
 **/
const search = function (data) {
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
				referer: 'https://c.y.qq.com',
				host: 'c.y.qq.com',
			}
		}).then((res) => {
			if ( res.data.code == 0 ) {
				let songs = res.data.data.song.list;
				let music = [];
				for ( let i in songs ) {
					// if ( songs[i].pay.payplay == 0 ) {
						let singer = '';
						for ( let j in songs[i].singer ) {
							singer += songs[i].singer[j].name + (j < songs[i].singer.length ? ' ' : '')
						}
						const item = new Music({
							path: songs[i].songmid,
							lyric: songs[i].songid,
							name: songs[i].songname,
							cover: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${songs[i].albummid}.jpg?max_age=2592000`,
							singer: singer,
							source: source
						})
						music.push(item)
					// }
				}
				resolve({
					code: ERR_OK,
					data: {
						list: music,
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
}

/**
 * 获取播放链接
 * @param {Object} data = {path: '获取音乐播放链接所需路径'} 
 **/
const getPlayUrl = function (data) {
	const dataSync = Object.assign({
	    '-': 'getplaysongvkey700897959535075'
	}, commonParams, {
	    data: JSON.stringify({"req":{"module":"CDN.SrfCdnDispatchServer","method":"GetCdnDispatch","param":{"guid":"7764863790","calltype":0,"userip":""}},"req_0":{"module":"vkey.GetVkeyServer","method":"CgiGetVkey","param":{"guid":"7764863790","songmid":[data.path],"songtype":[0],"uin":"0","loginflag":1,"platform":"20"}},"comm":{"uin":0,"format":"json","ct":24,"cv":0}})
	})
	return new Promise((resolve, reject) => {
		http.get('https://u.y.qq.com/cgi-bin/musicu.fcg', {
			params: dataSync,
			headers: {
				referer: 'https://u.y.qq.com',
				host: 'u.y.qq.com',
			}
		}).then((res) => {
			let playUrl = '';
			if ( res.data.code == 0 ) {
				if ( res.data.req_0.data.midurlinfo['0'].purl ) {
					playUrl = res.data.req_0.data.midurlinfo['0'].purl ? res.data.req_0.data.sip[1] + res.data.req_0.data.midurlinfo['0'].purl : '';
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
}

/**
 * 获取歌词
 * @param {Object} data = {lyric: '获取歌词所需链接'} 
 **/
const getLyric = function (data) {
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
			if ( res.data.code == 0 ) {
				let arr = htmlDecodeByRegExp(res.data.lyric).split('&#10;');
				for ( let i in arr ) {
					if ( i >= 5 ) {
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
	getPlayUrl,
	getLyric,
	source
}