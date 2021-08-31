import { mapGetters, mapMutations } from 'vuex'
const bookMixin = {
	computed: {
		...mapGetters({
			bookList: 'book/bookList',
			bookmarks: 'book/bookmarks',
			bookPathHistory: 'book/bookPathHistory',
			bookReadMode: 'book/bookReadMode',
			getBookSourcesController: 'book/getBookSourcesController',
			comicPathHistory: 'book/comicPathHistory',
			comicOrienMode: 'book/comicOrienMode',
			getComicSourcesController: 'book/getComicSourcesController',
		})
	},
	methods: {
		...mapMutations({
			addBooks: 'book/addBooks',
			deleteBook: 'book/deleteBook',
			clearBooks: 'book/clearBooks',
			updateBookInfo: 'book/updateBookInfo',
			updateBookPath: 'book/updateBookPath',
			changeBookFontSize: 'book/changeBookFontSize',
			changeBookReadPageType: 'book/changeBookReadPageType',
			changeBookReadLineHeight: 'book/changeBookReadLineHeight',
			changeBookLight: 'book/changeBookLight',
			saveBookmark: 'book/saveBookmark',
			clearBookmark: 'book/clearBookmark',
			setBookSourcesController: 'book/setBookSourcesController',
			setComicSourcesController: 'book/setComicSourcesController',
			updateComicPath: 'book/updateComicPath',
			clearComicPath: 'book/clearComicPath',
			changeComicOrien: 'book/changeComicOrien',
			setComicSourcesController: 'book/setComicSourcesController'
		})
	}
}

export default bookMixin;