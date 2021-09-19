import musicMixin from '@/common/mixin/music.js'
import musiccertifyMixin from '@/common/mixin/musiccertify.js'
const lyricMixin = {
	mixins: [musicMixin, musiccertifyMixin],
	computed: {
		//播放记录
		playRecord () {
			return this.getMusicPlayRecord;
		},
		//已播放时长
		playTime () {
			return this.getMusicPlayTime;
		},
		playLyric () {
			return this.getMusicLyric;
		},
		//是否显示歌词
		lyricShow () {
			return this.getMusicLyricShow;
		},
		//当前歌词字符串
		lyricNowTitle () {
			return this.playLyric.length > 0 && this.lyricNowIndex > -1 ? this.playLyric[this.lyricNowIndex].title : this.musicInfo ? this.musicInfo.name : '暂无歌曲';
		},
		//当前歌词位置索引
		lyricNowIndex () {
			let len = this.playLyric.length;
			let nowLyricTime = 0;
			let prevLyricTime = 0;
			let nextLyricTime = 0;
			for ( let i = 0; i < len; i++ ) {
				nowLyricTime = this.playLyric[i].time;
				switch(i) {
				    case 0:
						nextLyricTime = this.playLyric[i + 1].time;
				        if ( this.playTime < nextLyricTime && this.playTime >= nowLyricTime ) return i;
				        break;
				    case this.playLyric.length - 1:
						prevLyricTime = this.playLyric[i - 1].time;
				        if ( this.playTime > prevLyricTime && this.playTime >= nowLyricTime ) return i;
				        break;
				    default:
						prevLyricTime = this.playLyric[i - 1].time;
						nextLyricTime = this.playLyric[i + 1].time;
						if ( this.playTime > prevLyricTime && this.playTime < nextLyricTime && this.playTime >= nowLyricTime ) return i;
				}
			}
			return -1;
		}
	}
}
export default lyricMixin;