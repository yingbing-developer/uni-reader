import { mapGetters, mapMutations } from 'vuex'
const appMixin = {
	computed: {
		...mapGetters({
			getAdult: 'app/getAdult',
			getAdultPwd: 'app/getAdultPwd',
			skinMode: 'app/skinMode',
			skinColor: 'app/skinColor'
		})
	},
	methods: {
		...mapMutations({
			setAdult: 'app/setAdult',
			setAdultPwd: 'app/setAdultPwd',
			changeSkin: 'app/changeSkin'
		})
	}
}

export default appMixin;