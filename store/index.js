import Vue from 'vue'
import Vuex from 'vuex'
import Utils from '@/common/js/util.js';
const indexOf = Utils.indexOf;
const suffix = Utils.suffix;
const dateFormat = Utils.dateFormat;
const removeSuffix = Utils.removeSuffix;
const randomString = Utils.randomString;
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
const COMICSOURCES = 'UNI_READER_ONLINE_COMIC_SOURCES'
const MUSICSOURCES = 'UNI_READER_ONLINE_MUSIC_SOURCES'
const BOOKSOURCES = 'UNI_READER_ONLINE_BOOK_SOURCES'
const MUSICLYRICSHOW = 'UNI_READER_ONLINE_MUSIC_LYRIC_SHOW'
const store = new Vuex.Store({
    state: {
		skin: uni.getStorageSync(SKIN) || 'default', //皮肤
		books: uni.getStorageSync(BOOKS) || [],//书籍列表(包括小说和漫画)
		bookRead: uni.getStorageSync(BOOKREAD) || {pageType: 'real', fontSize: 15, light: 1, lineHeight: 15},//小说阅读模式包含字体大小，翻页方式和行间距
		bookPath: uni.getStorageSync(BOOKPATH) || '',//上次访问的小说文件夹路径
		bookmark: uni.getStorageSync(BOOKMARK) || [],//小说书签
		comicPath: uni.getStorageSync(COMICPATH) || '',//上次访问的漫画文件夹路径
		comicOrien: uni.getStorageSync(COMICORIEN) || 'portrait', //漫画阅读方向 默认竖屏
		musicPath: uni.getStorageSync(MUSICPATH) || '', //默认访问的本地音乐资源路径
		musicPlayList: uni.getStorageSync(PLAYLIST) || [], //音乐播放列表
		musicPlayStatus: uni.getStorageSync(PLAYSTATUS) || false, //音乐播放状态
		musicPlayTime: 0,//当前音乐播放位置
		musicPlayDuration: 0,//当前音乐总时长
		musicLyric: [],//当前音乐歌词
		musicPlayMode: uni.getStorageSync(PLAYMODE) || 'loop', //音乐播放模式 loop => 循环播放 once => 单曲循环 random => 乱序播放
		musicPlayRecord: uni.getStorageSync(PLAYRECORD) || '', //音乐播放记录
		musicLyricShow: uni.getStorageSync(MUSICLYRICSHOW) || false, //控制歌词显示
		musicSourcesController: uni.getStorageSync(MUSICSOURCES) || [], //在线音乐来源控制,放进来的表示关闭获取此来源的音乐
		comicSourcesController: uni.getStorageSync(COMICSOURCES) || [], //在线漫画来源控制,放进来的表示关闭获取此来源的漫画
		bookSourcesController: uni.getStorageSync(BOOKSOURCES) || [] //在线小说来源控制,放进来的表示关闭获取此来源的漫画
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
					activeColor: '#FAFAFA',
					activedName: 'actived'
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
					imgMask: 0.3,
					readBackColor: '#393E41',
					readTextColor: '#95A3A6',
					activeBgColor: '#3F3F3F',
					activeColor: '#777777',
					activedName: 'actived-dark'
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
		getBookSourcesController (state) {
			return state.bookSourcesController
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
		getMusicLyric (state) {
			return state.musicLyric
		},
		getMusicPlayMode (state) {
			return state.musicPlayMode
		},
		getMusicPlayRecord (state) {
			return state.musicPlayRecord
		},
		getMusicSourcesController (state) {
			return state.musicSourcesController
		},
		getMusicLyricShow (state) {
			return state.musicLyricShow
		},
		getComicSourcesController (state) {
			return state.comicSourcesController
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
		// 更新书籍名称
		updateBookName (state, book) {
			let index = indexOf(state.books, 'path', book.path);
			state.books[index].name = book.name;
			uni.setStorageSync(BOOKS, state.books);
		},
		// 更新书籍文本长度
		updateBookLength (state, book) {
			let index = indexOf(state.books, 'path', book.path);
			state.books[index].length = book.length;
			uni.setStorageSync(BOOKS, state.books);
		},
		// 更新书籍阅读位置
		updateBookRecord (state, book) {
			let index = indexOf(state.books, 'path', book.path);
			state.books[index].record = book.record;
			uni.setStorageSync(BOOKS, state.books);
		},
		// 更新书籍阅读状态
		updateBookReadStatus (state, book) {
			let index = indexOf(state.books, 'path', book.path);
			state.books[index].isReaded = book.isReaded;
			uni.setStorageSync(BOOKS, state.books);
		},
		// 更新书籍最后阅读时间
		updateBookReadTime (state, path) {
			let index = indexOf(state.books, 'path', path);
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
					image: music[i].image ? music[i].image : '/static/music/music-bg.jpg',
					singer: music[i].singer || '未知歌手' ,
					path: music[i].path,
					lyric: music[i].lyric || false,
					source: music[i].source ? music[i].source : 'local'
				})
			}
			uni.setStorageSync(PLAYLIST, state.musicPlayList);
		},
		//删除指定歌曲
		deleteMusic (state, path) {
			let flag = indexOf(state.musicPlayList, 'path', path);
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
		//更新音乐播放记录
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
		//设置音乐歌词
		setMusicLyric (state, lyric) {
			state.musicLyric = lyric;
		},
		//改变音乐播放模式
		changeMusicPlayMode (state, mode) {
			state.musicPlayMode = mode;
			uni.setStorageSync(PLAYMODE, state.musicPlayMode);
		},
		//更新本地音乐上次访问文件夹位置
		updateMusicPath (state, path) {
			state.musicPath = path;
			uni.setStorageSync(MUSICPATH, state.musicPath);
		},
		//设置在线音乐来源
		setMusicSourcesController (state, sources) {
			state.musicSourcesController = sources;
			uni.setStorageSync(MUSICSOURCES, state.musicSourcesController);
		},
		//改变音乐播放模式
		setMusicLyricShow (state, bool) {
			state.musicLyricShow = bool;
			uni.setStorageSync(MUSICLYRICSHOW, state.musicLyricShow);
		},
		//设置在线漫画来源
		setComicSourcesController (state, sources) {
			state.comicSourcesController = sources;
			uni.setStorageSync(COMICSOURCES, state.comicSourcesController);
		}
	},
    actions: {}
})
export default store