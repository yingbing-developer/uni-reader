import Vue from 'vue'
import Vuex from 'vuex'
import { indexOf, suffix, dateFormat, removeSuffix, randomString } from '@/common/js/util.js'
Vue.use(Vuex)
const SKIN = 'UNI_READER_SKIN'
const BOOKS = 'UNI_READER_BOOK'
const COMIC = 'UNI_READER_COMIC'
const PATH = 'UNI_READER_PATH'
const READ = 'UNI_READER_READ'
const MARK = 'UNI_READER_MARK'
const store = new Vuex.Store({
    state: {
		skin: uni.getStorageSync(SKIN) || 'default', //皮肤
		books: uni.getStorageSync(BOOKS) || [],//导入的书籍列表
		read: uni.getStorageSync(READ) || {pageMode: 'L2RTrans', duration: 200, fontSize: 20, light: 1},//阅读模式包含字体大小，翻页方式和动画时间
		path: uni.getStorageSync(PATH) || '',//上次访问的文件夹路径
		bookmark: uni.getStorageSync(MARK) || []//书签
	},
	getters: {
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
					activeColor: '#FAFAFA'
				}
			}
			// 夜间模式
			if ( state.skin == 'night' ) {
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
					imgMask: 0.45,
					readBackColor: '#393E41',
					readTextColor: '#95A3A6',
					activeBgColor: '#3F3F3F',
					activeColor: '#777777'
				}
			}
		},
		bookList (state) {
			return state.books;
		},
		bookmarks (state) {
			return state.bookmark;
		},
		pathHistory (state) {
			return state.path;
		},
		readMode (state) {
			return state.read;
		}
	},
    mutations: {
		//改变皮肤模式
		changeSkin (state, skin) {
			state.skin = skin;
			uni.setStorageSync(SKIN, skin)
		},
		//新增书籍
		addBooks (state, books) {
			for ( let i in books ) {
				let time = new Date().getTime();
				state.books.push({
					name: removeSuffix(books[i].name),
					image: '/static/cover/cover_' + Math.floor(Math.random()*6 + 1) + '.png',
					creatime: time,
					time: dateFormat(time).split(' ')[0],
					path: books[i].path,
					size: books[i].size,
					length: 0,
					record: 0,
					lastReadTime: time,
					isReaded: false
				})
			}
			uni.setStorageSync(BOOKS, state.books);
		},
		//删除指定的书籍
		deleteBook (state, path) {
			let flag = indexOf(state.books, path, 'path');
			if ( flag > -1 ) {
				state.books.splice(flag, 1);
				uni.setStorageSync(BOOKS, state.books)
			}
		},
		//清空指定类型的所有书籍
		clearBooks (state, type) {
			state.books = state.books.filter((item) => {
				if ( item.isReaded != type ) {
					return item;
				}
			})
			uni.setStorageSync(BOOKS, state.books);
		},
		// 更新书籍文本长度
		updateBookLength (state, book) {
			let index = indexOf(state.books, book.path, 'path');
			state.books[index].length = book.length;
			uni.setStorageSync(BOOKS, state.books);
		},
		// 更新书籍阅读位置
		updateBookRecord (state, book) {
			let index = indexOf(state.books, book.path, 'path');
			state.books[index].record = book.record;
			uni.setStorageSync(BOOKS, state.books);
		},
		// 更新书籍阅读状态
		updateBookReadStatus (state, book) {
			let index = indexOf(state.books, book.path, 'path');
			state.books[index].isReaded = book.isReaded;
			uni.setStorageSync(BOOKS, state.books);
		},
		// 更新书籍最后阅读时间
		updateBookReadTime (state, path) {
			let index = indexOf(state.books, path, 'path');
			state.books[index].lastReadTime = new Date().getTime();
			uni.setStorageSync(BOOKS, state.books);
		},
		//更新访问的文件夹路径
		updatePath (state, path) {
			state.path = path;
			uni.setStorageSync(PATH, state.path);
		},
		//改变字体大小
		changeFontSize (state, fontSize) {
			state.read.fontSize = fontSize;
			uni.setStorageSync(READ, state.read);
		},
		//改变翻页模式
		changePageMode (state, scroll) {
			state.read.pageMode = scroll;
			uni.setStorageSync(READ, state.read);
		},
		//改变翻页时间
		changeReadDuration (state, duration) {
			state.read.duration = duration;
			uni.setStorageSync(READ, state.read);
		},
		//改变阅读页亮度
		changeLight (state, light) {
			state.read.light = light;
			uni.setStorageSync(READ, state.read);
		},
		//保存书签
		saveBookmark (state, mark) {
			//检测此书签是否重复
			let flag = state.bookmark.some((item) => {
				return item.index == mark.index
			})
			if ( !flag ) {
				state.bookmark.push(mark);
				uni.setStorageSync(MARK, state.bookmark);
				uni.showToast({
					icon: 'none',
					title: '添加书签成功'
				})
			} else {
				uni.showToast({
					icon: 'none',
					title: '已添加过此书签'
				})
			}
		},
		//清空书签
		clearBookmark (state, path) {
			state.bookmark = state.bookmark.filter((item) => {
				if ( item.path != path ) {
					return item
				}
			});
			uni.setStorageSync(MARK, state.bookmark);
		}
	},
    actions: {}
})
export default store