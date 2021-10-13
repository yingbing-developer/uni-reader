//书籍临时阅读数据
import Utils from '@/assets/js/util.js';
const { indexOf, suffix, dateFormat, removeSuffix, randomString } = Utils;
const state = {
	bookInfo: '',//当前阅读书籍信息
	bookChapters: [],//当前阅读书籍章节列表
	bookPageInfo: ''//当前阅读页面信息
}

const getters = {
	getBookInfo (state) {
		return state.bookInfo;
	},
	getBookChapters (state) {
		return state.bookChapters;
	},
	getBookPageInfo (state) {
		return state.bookPageInfo;
	}
}

const mutations = {
	setBookInfo (state, bookInfo) {
		state.bookInfo = bookInfo
	},
	setBookChapters (state, chapters) {
		state.bookChapters = chapters
	},
	setBookPageInfo (state, pageInfo) {
		state.bookPageInfo = JSON.parse(JSON.stringify(pageInfo))
	}
}

export default {
    namespaced: true,
    state,
    getters,
    mutations
}