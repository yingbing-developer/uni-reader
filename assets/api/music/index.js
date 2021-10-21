import Store from '@/store' // 获取 Vuex Store 实例，注意是**实例**，而不是 vuex 这个库
import Config  from '@/assets/js/config.js'
import api_163music from './163music.js'
import api_qqmusic from './qqmusic.js'

const { getters } = Store;
const { ADULTS } = Config;

const api = {
	[api_163music.source]: api_163music,
	[api_qqmusic.source]: api_qqmusic
}

//搜索音乐列表
export function search (data) {
	//判断一下哪些来源被关闭了
	const sources = getters['music/getMusicSourcesController'];
	const adult = getters['app/getAdult'];
	let newArr = [];
	Object.keys(api).forEach(key => {
		if ( sources.indexOf(key) == -1 && !data.isLastPage[key] && (ADULTS.indexOf(key) == -1 || adult) ) {
			newArr.push(api[key].search(data));
		}
	})
	return Promise.all(newArr.map((promise)=>promise.catch((e)=>{promise.resolve(e)})))
}

//获取音乐播放链接列表
export function getPlayUrl (data) {
	return Object.keys(api).map(key => {
		if ( data.source == key ) {
			return api[key].getPlayUrl(data)
		}
	})
}

//获取音乐歌词
export function getLyric (data) {
	return Object.keys(api).map(key => {
		if ( data.source == key ) {
			return api[key].getLyric(data)
		}
	})
}