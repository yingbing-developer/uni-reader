import { ADULT, ADULTPWD, SKIN } from '../config.js'
import SkinColor from '@/assets/skin/index.js'

const state = {
	adult: uni.getStorageSync(ADULT) || false, //青壮年模式
	adultPwd: uni.getStorageSync(ADULTPWD) || '', //青壮年模式密码
	skin: uni.getStorageSync(SKIN) || 'default' //皮肤
}

const getters = {
	getAdult (state) {
		return state.adult
	},
	getAdultPwd (state) {
		return state.adultPwd
	},
	skinMode (state) {
		return state.skin
	},
	skinColor (state) {
		return SkinColor[state.skin]
	}
}

const mutations = {
	setAdult (state, bol) {
		state.adult = bol;
		uni.setStorageSync(ADULT, bol)
	},
	setAdultPwd (state, pwd) {
		state.adultPwd = pwd;
		uni.setStorageSync(ADULTPWD, pwd)
	},
	//改变皮肤模式
	changeSkin (state, skin) {
		state.skin = skin;
		uni.setStorageSync(SKIN, skin)
	}
}

export default {
    namespaced: true,
    state,
    getters,
    mutations
}