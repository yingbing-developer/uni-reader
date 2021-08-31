import Utils from '@/common/js/util.js';
const { indexOf, suffix, dateFormat, removeSuffix, randomString } = Utils;

import {
BOOKS,
BOOKPATH,
BOOKREAD,
BOOKMARK,
COMICPATH,
COMICORIEN,
COMICSOURCES,
BOOKSOURCES} from '../config.js'
const state = {
	books: uni.getStorageSync(BOOKS) || [],//书籍列表(包括小说和漫画)
	bookRead: uni.getStorageSync(BOOKREAD) || {pageType: 'real', fontSize: 15, light: 1, lineHeight: 15},//小说阅读模式包含字体大小，翻页方式和行间距
	bookPath: uni.getStorageSync(BOOKPATH) || '',//上次访问的小说文件夹路径
	bookmark: uni.getStorageSync(BOOKMARK) || [],//小说书签
	comicPath: uni.getStorageSync(COMICPATH) || '',//上次访问的漫画文件夹路径
	comicOrien: uni.getStorageSync(COMICORIEN) || 'portrait', //漫画阅读方向 默认竖屏
	comicSourcesController: uni.getStorageSync(COMICSOURCES) || [], //在线漫画来源控制,放进来的表示关闭获取此来源的漫画
	bookSourcesController: uni.getStorageSync(BOOKSOURCES) || [] //在线小说来源控制,放进来的表示关闭获取此来源的漫画
}

const getters = {
	bookList (state) {
		return state.books;
	},
	bookmarks (state) {
		return state.bookmark;
	},
	bookPathHistory (state) {
		return state.bookPath;
	},
	bookReadMode (state) {
		return state.bookRead;
	},
	getBookSourcesController (state) {
		return state.bookSourcesController
	},
	comicPathHistory (state) {
		return state.comicPath;
	},
	comicOrienMode (state) {
		return state.comicOrien;
	},
	getComicSourcesController (state) {
		return state.comicSourcesController
	}
}

const mutations = {
	//新增书籍
	addBooks (state, books) {
		for ( let i in books ) {
			let time = new Date().getTime();
			state.books.push({
				name: removeSuffix(books[i].name),
				image: books[i].image ? books[i].image : '/static/cover/cover_' + Math.floor(Math.random()*6 + 1) + '.png',
				creatime: time,
				time: dateFormat(time).split(' ')[0],
				path: books[i].path,
				length: books[i].length || 0,
				record: '0-0',
				lastReadTime: time,
				isReaded: false,
				//书籍类型 默认小说story
				type: books[i].type || 'story',
				//来源 网络或者本地
				source: books[i].source || 'local'
			})
		}
		uni.setStorageSync(BOOKS, state.books);
	},
	//删除指定的书籍
	deleteBook (state, path) {
		let flag = indexOf(state.books, 'path', path);
		if ( flag > -1 ) {
			state.books.splice(flag, 1);
			uni.setStorageSync(BOOKS, state.books)
		}
	},
	//清空指定类型的所有书籍
	clearBooks (state, type) {
		state.books = state.books.filter((item) => {
			if ( item.type != type ) {
				return item;
			}
		})
		uni.setStorageSync(BOOKS, state.books);
	},
	// 更新书籍信息
	updateBookInfo (state, bookInfo = {}) {
		let index = indexOf(state.books, 'path', bookInfo.path);
		state.books[index].name = bookInfo.name || state.books[index].name;
		state.books[index].image = bookInfo.image || state.books[index].image;
		state.books[index].length = bookInfo.length || state.books[index].length;
		state.books[index].record = bookInfo.record || state.books[index].record;
		state.books[index].lastReadTime = bookInfo.lastReadTime || state.books[index].lastReadTime;
		state.books[index].isReaded = bookInfo.isReaded || state.books[index].isReaded;
		uni.setStorageSync(BOOKS, state.books);
	},
	//更新访问的小说文件夹路径
	updateBookPath (state, path) {
		state.bookPath = path;
		uni.setStorageSync(BOOKPATH, state.bookPath);
	},
	//改变小说阅读页字体大小
	changeBookFontSize (state, fontSize) {
		state.bookRead.fontSize = fontSize;
		uni.setStorageSync(BOOKREAD, state.bookRead);
	},
	//改变小说点击翻页的动画效果
	changeBookReadPageType (state, type) {
		state.bookRead.pageType = type;
		uni.setStorageSync(BOOKREAD, state.bookRead);
	},
	//改变小说内容行间距
	changeBookReadLineHeight (state, lineHeight) {
		state.bookRead.lineHeight = lineHeight;
		uni.setStorageSync(BOOKREAD, state.bookRead);
	},
	//改变小说阅读页亮度
	changeBookLight (state, light) {
		state.bookRead.light = light;
		uni.setStorageSync(BOOKREAD, state.bookRead);
	},
	//保存小说书签
	saveBookmark (state, mark) {
		//检测此书签是否重复
		let flag = state.bookmark.some((item) => {
			return item.index == mark.index
		})
		if ( !flag ) {
			state.bookmark.push(mark);
			uni.setStorageSync(BOOKMARK, state.bookmark);
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
	//清空小说书签
	clearBookmark (state, path) {
		state.bookmark = state.bookmark.filter((item) => {
			if ( item.path != path ) {
				return item
			}
		});
		uni.setStorageSync(BOOKMARK, state.bookmark);
	},
	//设置在线小说来源
	setBookSourcesController (state, sources) {
		state.bookSourcesController = sources;
		uni.setStorageSync(BOOKSOURCES, state.bookSourcesController);
	},
	//更新漫画资源路径
	updateComicPath (state, path) {
		state.comicPath = path;		uni.setStorageSync(COMICPATH, state.comicPath);
	},
	//删除漫画资源路径
	clearComicPath (state) {
		state.comicPath = '';
		uni.setStorageSync(COMICPATH, state.comicPath);
	},
	//改变漫画屏幕方向
	changeComicOrien (state, orien) {
		state.comicOrien = orien;
		uni.setStorageSync(COMICORIEN, state.comicOrien);
	},
	//设置在线漫画来源
	setComicSourcesController (state, sources) {
		state.comicSourcesController = sources;
		uni.setStorageSync(COMICSOURCES, state.comicSourcesController);
	}
}

export default {
    namespaced: true,
    state,
    getters,
    mutations
}