import { mapGetters, mapMutations } from 'vuex'
const cacheMixin = {
	computed: {
		...mapGetters({
			imageCache: 'cache/getImageCache'
		})
	},
	methods: {
		...mapMutations({
			addImageCache: 'cache/addImageCache',
			removeImageCache: 'cache/removeImageCache',
			clearImageCache: 'cache/clearImageCache'
		})
	}
}

export default cacheMixin;