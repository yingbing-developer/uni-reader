import { mapGetters, mapMutations, mapActions } from 'vuex'
const appMixin = {
	computed: {
		...mapGetters({
			getAdult: 'app/getAdult',
			getAdultPwd: 'app/getAdultPwd',
			skinMode: 'app/skinMode',
			skinColor: 'app/skinColor'
		}),
		app () {
			return getApp().globalData
		}
	},
	methods: {
		...mapMutations({
			setAdult: 'app/setAdult',
			setAdultPwd: 'app/setAdultPwd'
		}),
		...mapActions({
			changeSkin: 'app/changeSkinAction'
		})
	}
}

export default appMixin;