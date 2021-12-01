import { ADULT, ADULTPWD } from '../config.js'

const state = {
	adult: uni.getStorageSync(ADULT) || false, //青壮年模式
	adultPwd: uni.getStorageSync(ADULTPWD) || '' //青壮年模式密码
}

const getters = {
	getAdult (state) {
		return state.adult
	},
	getAdultPwd (state) {
		return state.adultPwd
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
	}
}

export default {
    namespaced: true,
    state,
    getters,
    mutations
}