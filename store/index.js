import Vue from 'vue'
import Vuex from 'vuex'
import book from './modules/book.js'
import bookcertify from './modules/bookcertify.js'
import music from './modules/music.js'
import musiccertify from './modules/musiccertify.js'
import skin from './modules/skin.js'
Vue.use(Vuex)
const store = new Vuex.Store({
	modules: {
		book,
		bookcertify,
		music,
		musiccertify,
		skin
	}
})
export default store