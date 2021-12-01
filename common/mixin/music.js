import { mapGetters, mapMutations } from 'vuex'
const musicMixin = {
	computed: {
		...mapGetters({
			playList: 'music/playList',
			musicPathHistory: 'music/musicPathHistory',
			getMusicPlayMode: 'music/getMusicPlayMode',
			getMusicPlayRecord: 'music/getMusicPlayRecord',
			getMusicLyricShow: 'music/getMusicLyricShow',
			getMusicSourcesController: 'music/getMusicSourcesController'
		})
	},
	methods: {
		...mapMutations({
			addMusic: 'music/addMusic',
			deleteMusic: 'music/deleteMusic',
			clearMusic: 'music/clearMusic',
			updateMusicPlayRecord: 'music/updateMusicPlayRecord',
			changeMusicPlayMode: 'music/changeMusicPlayMode',
			setMusicLyricShow: 'music/setMusicLyricShow',
			updateMusicPath: 'music/updateMusicPath',
			setMusicSourcesController: 'music/setMusicSourcesController'
		})
	}
}

export default musicMixin;