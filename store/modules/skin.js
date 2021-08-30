import { SKIN } from '../config.js'

const state = {
	skin: uni.getStorageSync(SKIN) || 'default' //皮肤
}

const getters = {
	//当前皮肤模式
	skinMode (state) {
		return state.skin
	},
	skinColor (state) {
		// 默认皮肤
		if ( state.skin == 'default' ) {
			return {
				bgColor: '#FAFAFA',
				titleColor: '#333333',
				textColor: '#666666',
				itemColor: '#1776D3',
				navColor: '#2196F5',
				iconColor: '#FFFFFF',
				gapColor: '#E0E0E0',
				menuBgColor: '#FAFAFA',
				menuIconColor: '#737373',
				menuTitleColor: '#727272',
				menuActiveColor: '#2397EE',
				menuActiveBgColor: '#DDDDDD',
				imgMask: 0,
				readBackColor: '#BFAD8A',
				readTextColor: '#2E2B23',
				activeBgColor: '#2397EE',
				activeColor: '#FAFAFA',
				activedName: 'actived'
			}
		} else if ( state.skin == 'night' ) {// 夜间模式
			return {
				bgColor: '#2C2C2C',
				titleColor: '#8F8F8F',
				textColor: '#5E5E5E',
				itemColor: '#3D3D3D',
				navColor: '#3C3C3C',
				iconColor: '#777777',
				gapColor: '#3F3F3F',
				menuBgColor: '#373737',
				menuIconColor: '#777777',
				menuTitleColor: '#8F8F8F',
				menuActiveColor: '#FAFAFA',
				menuActiveBgColor: '#3F3F3F',
				imgMask: 0.3,
				readBackColor: '#393E41',
				readTextColor: '#95A3A6',
				activeBgColor: '#3F3F3F',
				activeColor: '#777777',
				activedName: 'actived-dark'
			}
		}
	}
}

const mutations = {
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