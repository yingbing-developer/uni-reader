import { mapGetters, mapMutations } from 'vuex'
const musiccertifyMixin = {
	computed: {
		...mapGetters({
			musicInfo: 'musiccertify/getMusicInfo',
			getMusicPlayStatus: 'musiccertify/getMusicPlayStatus',
			getMusicPlayTime: 'musiccertify/getMusicPlayTime',
			getMusicPlayDuration: 'musiccertify/getMusicPlayDuration',
			getMusicLyric: 'musiccertify/getMusicLyric'
		})
	},
	methods: {
		...mapMutations({
			setMusicInfo: 'musiccertify/setMusicInfo',
			setMusicPlayStatus: 'musiccertify/setMusicPlayStatus',
			setMusicPlayTime: 'musiccertify/setMusicPlayTime',
			setMusicPlayDuration: 'musiccertify/setMusicPlayDuration',
			setMusicLyric: 'musiccertify/setMusicLyric'
		})
	}
}

export default musiccertifyMixin;