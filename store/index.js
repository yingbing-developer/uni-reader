import Vue from 'vue'
import Vuex from 'vuex'
import { indexOf, suffix, dateFormat, removeSuffix, randomString } from '@/common/js/util.js'
Vue.use(Vuex)
const SKIN = 'UNI_READER_SKIN'
const BOOKS = 'UNI_READER_BOOK_LIST'
const BOOKPATH = 'UNI_READER_BOOK_PATH'
const BOOKREAD = 'UNI_READER_BOOK_READ'
const BOOKMARK = 'UNI_READER_BOOK_MARK'
const COMICPATH = 'UNI_READER_COMIC_PATH'
const COMICORIEN = 'UNI_READER_COMIC_ORIEN'
const MUSICPATH = 'UNI_READER_MUSIC_PATH'
const PLAYLIST = 'UNI_READER_MUSIC_PLAY_LIST'
const PLAYSTATUS = 'UNI_READER_MUSIC_PLAY_STATUS'
const PLAYMODE = 'UNI_READER_MUSIC_PLAY_MODE'
const PLAYRECORD = 'UNI_READER_MUSIC_PLAY_RECORD'
const store = new Vuex.Store({
    state: {
		skin: uni.getStorageSync(SKIN) || 'default', //皮肤
		books: uni.getStorageSync(BOOKS) || [],//书籍列表(包括小说和漫画)
		bookRead: uni.getStorageSync(BOOKREAD) || {pageMode: 'L2RTrans', pageType: 'touch', fontSize: 20, light: 1},//小说阅读模式包含字体大小，翻页方式和动画时间
		bookPath: uni.getStorageSync(BOOKPATH) || '',//上次访问的小说文件夹路径
		bookmark: uni.getStorageSync(BOOKMARK) || [],//小说书签
		comicPath: uni.getStorageSync(COMICPATH) || '',//上次访问的漫画文件夹路径
		comicOrien: uni.getStorageSync(COMICORIEN) || 'portrait', //漫画阅读方向 默认竖屏
		musicPath: uni.getStorageSync(MUSICPATH) || '', //默认访问的本地音乐资源路径
		musicPlayList: uni.getStorageSync(PLAYLIST) || [], //音乐播放列表
		musicPlayStatus: uni.getStorageSync(PLAYSTATUS) || false, //音乐播放状态
		musicPlayTime: 0,//当前音乐播放位置
		musicPlayDuration: 0,//当前音乐总时长
		musicPlayMode: uni.getStorageSync(PLAYMODE) || 'loop', //音乐播放模式 loop => 循环播放 once => 单曲循环 random => 乱序播放
		musicPlayRecord: uni.getStorageSync(PLAYRECORD) || '' //音乐播放记录
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
		bookPathHistory (state) {
			return state.bookPath;
		},
		bookReadMode (state) {
			return state.bookRead;
		},
		comicPathHistory (state) {
			return state.comicPath;
		},
		comicOrienMode (state) {
			return state.comicOrien;
		},
		musicPathHistory (state) {
			return state.musicPath
		},
		playList (state) {
			return state.musicPlayList
		},
		getMusicPlayStatus (state) {
			return state.musicPlayStatus
		},
		getMusicPlayTime (state) {
			return state.musicPlayTime
		},
		getMusicPlayDuration (state) {
			return state.musicPlayDuration
		},
		getMusicPlayMode (state) {
			return state.musicPlayMode
		},
		getMusicPlayRecord (state) {
			return state.musicPlayRecord
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
					image: books[i].image ? books[i].image : '/static/cover/cover_' + Math.floor(Math.random()*6 + 1) + '.png',
					creatime: time,
					time: dateFormat(time).split(' ')[0],
					path: books[i].path,
					length: books[i].length || 0,
					record: books[i].type == 'story' ? 0 : '0-0',
					lastReadTime: time,
					isReaded: false,
					//书籍类型 默认小说story
					type: books[i].type || 'story'
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
				if ( item.type != type ) {
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
		//改变小说翻页模式
		changeBookPageMode (state, scroll) {
			state.bookRead.pageMode = scroll;
			uni.setStorageSync(BOOKREAD, state.bookRead);
		},
		//改变小说点击翻页的动画效果
		changeBookReadPageType (state, type) {
			state.bookRead.pageType = type;
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
		//更新漫画资源路径
		updateComicPath (state, path) {
			state.comicPath = path;			uni.setStorageSync(COMICPATH, state.comicPath);
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
		//新增歌曲
		addMusic (state, music) {
			for ( let i in music ) {
				state.musicPlayList.push({
					name: removeSuffix(music[i].name),
					path: music[i].path
				})
			}
			uni.setStorageSync(PLAYLIST, state.musicPlayList);
		},
		//删除指定歌曲
		deleteMusic (state, path) {
			let flag = indexOf(state.musicPlayList, path, 'path');
			if ( flag > -1 ) {
				state.musicPlayList.splice(flag, 1);
				uni.setStorageSync(PLAYLIST, state.musicPlayList)
			}
		},
		//清空所有歌曲
		clearMusic (state, type) {
			state.musicPlayList = [];
			uni.setStorageSync(PLAYLIST, state.musicPlayList);
			state.musicPlayRecord = '';
			uni.setStorageSync(PLAYRECORD, state.musicPlayRecord);
			state.musicPlayTime = 0;
			state.musicPlayDuration = 0;
		},
		updateMusicPlayRecord (state, record) {
			state.musicPlayRecord = record;
			uni.setStorageSync(PLAYRECORD, state.musicPlayRecord);
		},
		//改变音乐播放状态
		changeMusicPlayStatus (state, status) {
			state.musicPlayStatus = status;
		},
		//改变音乐播放时长
		changeMusicPlayTime (state, time) {
			state.musicPlayTime = time;
		},
		//改变音乐总时长
		changeMusicPlayDuration (state, duration) {
			state.musicPlayDuration = duration;
		},
		//改变音乐播放模式
		changeMusicPlayMode (state, mode) {
			state.musicPlayMode = mode;
			uni.setStorageSync(PLAYMODE, state.musicPlayMode);
		},
		updateMusicPath (state, path) {
			state.musicPath = path;
			uni.setStorageSync(MUSICPATH, state.musicPath);
		}
	},
    actions: {}
})
export default store