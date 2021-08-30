import { mapGetters, mapMutations } from 'vuex'
const musicMixin = {
	computed: {
		...mapGetters({
			playList: 'music/playList',
			musicPathHistory: 'music/musicPathHistory',
			getMusicPlayStatus: 'music/getMusicPlayStatus',
			getMusicPlayTime: 'music/getMusicPlayTime',
			getMusicPlayDuration: 'music/getMusicPlayDuration',
			getMusicLyric: 'music/getMusicLyric',
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
			changeMusicPlayStatus: 'music/changeMusicPlayStatus',
			changeMusicPlayTime: 'music/changeMusicPlayTime',
			changeMusicPlayDuration: 'music/changeMusicPlayDuration',
			setMusicLyric: 'music/setMusicLyric',
			changeMusicPlayMode: 'music/changeMusicPlayMode',
			setMusicLyricShow: 'music/setMusicLyricShow',
			updateMusicPath: 'music/updateMusicPath',
			setMusicSourcesController: 'music/setMusicSourcesController'
		})
	}
}

export default musicMixin;