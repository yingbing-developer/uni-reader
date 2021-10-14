import { mapGetters, mapMutations } from 'vuex'
const bookcertifyMixin = {
	computed: {
		...mapGetters({
			bookInfo: 'bookcertify/getBookInfo',
			bookChapters: 'bookcertify/getBookChapters',
			pageInfo: 'bookcertify/getBookPageInfo'
		})
	},
	methods: {
		...mapMutations({
			setBookInfo: 'bookcertify/setBookInfo',
			setBookChapters: 'bookcertify/setBookChapters',
			setBookPageInfo: 'bookcertify/setBookPageInfo'
		})
	}
}

export default bookcertifyMixin;