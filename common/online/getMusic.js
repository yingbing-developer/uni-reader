import http from '@/plugins/request/index.js'
import Store from '@/store' // 获取 Vuex Store 实例，注意是**实例**，而不是 vuex 这个库
import Config from '@/assets/js/config.js'

const { MUSICURL, ERR_OK, ERR_FALSE, commonParams, ADULTS } = Config
const { getters } = Store;

const tag1 = 'qqmusic';
const tag2 = '163music';

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

//将时间转化为秒数
const time2seconds = function (time){
	let seconds = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1].split('.')[0]) + parseInt(time.split(':')[1].split('.')[1]) / 1000;
	return seconds; 
}


//获取音乐列表
export function getMusic (data) {
	//判断一下哪些来源被关闭了
	const sources = getters['music/getMusicSourcesController'];
	const adult = getters['app/getAdult'];
	let newArr = [];
	if ( sources.indexOf(tag1) == -1 && !data.isLastPage[tag1] && (ADULTS.indexOf(tag1) == -1 || adult) ) {
		newArr.push(getQqmusic(data));
	}
	if ( sources.indexOf(tag2) == -1 && !data.isLastPage[tag2] && (ADULTS.indexOf(tag2) == -1 || adult) ) {
		newArr.push(getwangyimusic(data));
	}
	return Promise.all(newArr.map((promise)=>promise.catch((e)=>{promise.resolve(e)})))
}

//获取音乐播放链接列表
export function getPlayUrl (data) {
	if ( data.source == tag1 ) {
		return getQqmusicPlayUrl(data);
	}
	if ( data.source == tag2 ) {
		return getwangyiPlayUrl(data);
	}
}

//获取音乐歌词
export function getLyric (data) {
	if ( data.source == tag1 ) {
		return getQqmusicLyric(data);
	}
	if ( data.source == tag2 ) {
		return getwangyiLyric(data);
	}
}


//获取QQ音乐网站的音乐列表
function getQqmusic (data) {
	let dataSync = Object.assign({
        _: '15778592' + Math.floor(Math.random() * Math.pow(10, 5)),
    }, commonParams, {
        w: data.title,
        zhidaqu: 1,
        catZhida: 0,
        t: 0,
        flag: 1,
        ie: 'utf-8',
        sem: 1,
        aggr: 0,
        perpage: 20,
        n: 20,
        p: data.page[tag1],
        remoteplace: 'txt.mqq.all'
    })
	return new Promise((resolve, reject) => {
		http.get(MUSICURL[tag1].href + '/soso/fcgi-bin/client_search_cp', {
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
						music.push({
							path: songs[i].songmid,
							lyric: songs[i].songid,
							name: songs[i].songname,
							image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${songs[i].albummid}.jpg?max_age=2592000`,
							singer: singer,
							source: tag1
						})
					// }
				}
				resolve({
					code: ERR_OK,
					data: {
						list: music,
						source: tag1
					}
				})
			}
			
		}).catch((err) => {
			resolve({
				code: ERR_FALSE,
				data: {
					list: [],
					source: tag1
				}
			})
		})
	})
}

//获取qq音乐播放链接
function getQqmusicPlayUrl(data) {
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
					source: tag1
				}
			})
			
		}).catch((err) => {
			reject({
				code: ERR_FALSE,
				data: {
					src: '',
					source: tag1
				}
			})
		})
	})
}

//获取QQ音乐歌词
function getQqmusicLyric (data) {
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
					source: tag1
				}
			})
		}).catch((err) => {
			reject({
				code: ERR_FALSE,
				data: {
					lyric: [],
					source: tag1
				}
			})
		})
	})
}


//获取网易云网站的音乐列表
function getwangyimusic (data) {
	let dataSync = {
		keywords: data.title,
		limit: 20,
		offset: (data.page[tag2] - 1) * 20
	}
	return new Promise((resolve, reject) => {
		http.get(MUSICURL[tag2].href + '/cloudsearch', {
			params: dataSync
		}).then((res) => {
			let songs = res.data.result.songs;
			let music = [];
			if ( res.data.code == 200 ) {
				for ( let i in songs ) {
					let singer = '';
					for ( let j in songs[i].ar ) {
						singer += songs[i].ar[j].name + (j < songs[i].ar.length ? ' ' : '')
					}
					music.push({
						path: songs[i].id,
						lyric: songs[i].id,
						name: songs[i].name,
						image: songs[i].al.picUrl + '?imageView&thumbnail=360y360&quality=75&tostatic=0',
						singer: singer || '未知歌手',
						source: tag2
					})
				}
			}
			resolve({
				code: ERR_OK,
				data: {
					list: music,
					source: tag2
				}
			})
			
		}).catch((err) => {
			resolve({
				code: ERR_FALSE,
				data: {
					list: [],
					source: tag2
				}
			})
		})
	})
}

//获取q网易云音乐播放链接
function getwangyiPlayUrl(data) {
	const dataSync = {
		id: data.path
	}
	return new Promise((resolve, reject) => {
		http.get(MUSICURL[tag2].href + '/song/url', {
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
					source: tag2
				}
			})
		}).catch((err) => {
			reject({
				code: ERR_FALSE,
				data: {
					src: '',
					source: tag2
				}
			})
		})
	})
}

//获取网易云音乐歌词
function getwangyiLyric (data) {
	const dataSync = {
		id: data.path
	}
	return new Promise((resolve, reject) => {
		http.get(MUSICURL[tag2].href + '/lyric', {
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
					source: tag2
				}
			})
		}).catch((err) => {
			reject({
				code: ERR_FALSE,
				data: {
					lyric: [],
					source: tag2
				}
			})
		})
	})
}