import Store from '@/store' // 获取 Vuex Store 实例，注意是**实例**，而不是 vuex 这个库
import Config  from '@/assets/js/config.js'
import api_163music from './163music.js'
import api_qqmusic from './qqmusic.js'

const { getters } = Store;
const { MUSICURL } = Config;

const api = {
	[api_163music.source]: api_163music,
	[api_qqmusic.source]: api_qqmusic
}

export default {
	//搜索音乐列表
	search (data) {
		//判断一下哪些来源被关闭了
		const sources = getters['music/getMusicSourcesController'];
		const adult = getters['app/getAdult'];
		let newArr = [];
		Object.keys(api).forEach(key => {
			if ( sources.indexOf(key) == -1 && !data.isLastPage[key] && (!MUSICURL[key].isAdult || adult) && MUSICURL[key].search ) {
				newArr.push(api[key].search(data));
			}
		})
		return Promise.all(newArr.map((promise)=>promise.catch((e)=>{promise.resolve(e)})))
	},
	
	//获取轮播图列表
	getBannerList () {
		const sources = getters['music/getMusicSourcesController'];
		const adult = getters['app/getAdult'];
		let newArr = [];
		Object.keys(api).forEach(key => {
			if ( sources.indexOf(key) == -1 && (!MUSICURL[key].isAdult || adult) && MUSICURL[key].banner ) {
				newArr.push(api[key].getBannerList());
			}
		})
		return Promise.all(newArr.map((promise)=>promise.catch((e)=>{promise.resolve(e)})))
	},
	
	//获取排行榜列表
	getToplist () {
		const sources = getters['music/getMusicSourcesController'];
		const adult = getters['app/getAdult'];
		let newArr = [];
		Object.keys(api).forEach(key => {
			if ( sources.indexOf(key) == -1 && (!MUSICURL[key].isAdult || adult) && MUSICURL[key].top ) {
				newArr.push(api[key].getToplist());
			}
		})
		return Promise.all(newArr.map((promise)=>promise.catch((e)=>{promise.resolve(e)})))
	},
	
	//获取热门歌单
	getHotDiscList () {
		const sources = getters['music/getMusicSourcesController'];
		const adult = getters['app/getAdult'];
		let newArr = [];
		Object.keys(api).forEach(key => {
			if ( sources.indexOf(key) == -1 && (!MUSICURL[key].isAdult || adult) && MUSICURL[key].album ) {
				newArr.push(api[key].getHotDiscList());
			}
		})
		return Promise.all(newArr.map((promise)=>promise.catch((e)=>{promise.resolve(e)})))
	},
	
	//获取新发单曲
	getNewSongList () {
		const sources = getters['music/getMusicSourcesController'];
		const adult = getters['app/getAdult'];
		let newArr = [];
		Object.keys(api).forEach(key => {
			if ( sources.indexOf(key) == -1 && (!MUSICURL[key].isAdult || adult) && MUSICURL[key].newSong ) {
				newArr.push(api[key].getNewSongList());
			}
		})
		return Promise.all(newArr.map((promise)=>promise.catch((e)=>{promise.resolve(e)})))
	},
	
	//获取音乐播放链接列表
	getPlayUrl (data) {
		return Object.keys(api).map(key => {
			if ( data.source == key ) {
				return api[key].getPlayUrl(data)
			}
		})
	},
	
	//获取音乐歌词
	getLyric (data) {
		return Object.keys(api).map(key => {
			if ( data.source == key ) {
				return api[key].getLyric(data)
			}
		})
	}
}