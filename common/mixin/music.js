import { mapGetters, mapMutations } from 'vuex'
const musicMixin = {
	computed: {
		...mapGetters({
			playList: 'music/getPlayList',
			collectionList: 'music/getCollection',
			musicPathHistory: 'music/musicPathHistory',
			getMusicPlayMode: 'music/getMusicPlayMode',
			getMusicPlayRecord: 'music/getMusicPlayRecord',
			getMusicLyricShow: 'music/getMusicLyricShow',
			getMusicSourcesController: 'music/getMusicSourcesController'
		})
	},
	methods: {
		...mapMutations({
			addPlayList: 'music/addPlayList',
			removePlayList: 'music/removePlayList',
			clearPlayList: 'music/clearPlayList',
			addCollection: 'music/addCollection',
			removeCollection: 'music/removeCollection',
			clearCollection: 'music/clearCollection',
			updateMusicPlayRecord: 'music/updateMusicPlayRecord',
			changeMusicPlayMode: 'music/changeMusicPlayMode',
			setMusicLyricShow: 'music/setMusicLyricShow',
			updateMusicPath: 'music/updateMusicPath',
			setMusicSourcesController: 'music/setMusicSourcesController'
		})
	}
}

export default musicMixin;