import { IMAGECACHE } from '../config.js'

const state = {
	imageCache: uni.getStorageSync(IMAGECACHE) || [] //图片临时文件存放
}

const getters = {
	getImageCache (state) {
		return state.imageCache
	}
}

const mutations = {
	addImageCache (state, obj) {
		const index = state.imageCache.findIndex(cache => cache.key == obj.key)
		if ( index > -1 )
			state.imageCache[index] = obj;
		else
			state.imageCache.push(obj);
		uni.setStorageSync(IMAGECACHE, state.imageCache)
	},
	removeImageCache (state, key) {
		const index = state.imageCache.findIndex(item => item.key == key)
		if ( index > -1 ) state.imageCache.splice(index, 1);
		uni.setStorageSync(IMAGECACHE, state.imageCache)
	},
	clearImageCache (state) {
		state.imageCache = []
		uni.removeStorageSync(IMAGECACHE)
	}
}

export default {
    namespaced: true,
    state,
    getters,
    mutations
}