import Store from "@/store"

const { getters } = Store

export const Single = function (data) {
	this.id = data.path + '_' + data.source
	this.title = data.title
	this.path = data.path
	this.lyric = data.lyric
	this.cover = data.cover || '/static/music/music-bg.jpg'
	this.singer = data.singer || '未知歌手'
	this.desc = data.desc || ''
	this.isCollection = isCollection(this.id)
	this.type = 'single'//单曲类型
	this.source = data.source
}

export const Album = function (data) {
	this.id = data.albumId + '_' + data.source
	this.albumId = data.albumId
	this.title = data.title
	this.cover = data.cover || '/static/music/music-bg.jpg'
	this.desc = data.desc || ''
	this.song = data.song || []
	this.creator = data.creator || ''
	this.num = data.num || 0
	this.type = data.type //type包含 top:<排行榜> banner:<轮播图> album:<歌单>
	this.isCollection = isCollection(this.id)
	this.source = data.source
}

export const Singer = function (data) {
	this.id = data.singerId + '_' + data.source
	this.singerId = data.singerId
	this.title = data.title
	this.cover = data.cover || '/static/music/music-bg.jpg'
	this.desc = data.desc || ''
	this.song = data.song || []
	this.type = 'singer' //歌手类型
	this.isCollection = isCollection(this.id)
	this.source = data.source
}


//是否被收藏
function isCollection (id) {
	const collections = getters['music/getCollection']
	const index = collections.findIndex(collection => collection.id == id)
	return index > -1
}