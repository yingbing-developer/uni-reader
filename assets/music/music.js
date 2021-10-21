import Store from "@/store"

const { getters } = Store

const Music = function (data) {
	this.id = data.path + '_' + data.source
	this.name = data.name
	this.path = data.path
	this.lyric = data.lyric
	this.cover = data.cover || '/static/music/music-bg.jpg'
	this.singer = data.singer || '未知歌手'
	this.isCollection = isCollection(this.id)
	this.source = data.source
}

//是否被收藏
function isCollection (id) {
	const collections = getters['music/getCollection']
	const index = collections.findIndex(collection => collection.id == id)
	return index > -1
}

export default Music