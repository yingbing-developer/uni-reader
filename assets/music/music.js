import Store from "@/store"

const { getters } = Store

export const Single = function (data) {
	this.id = data.path + '_' + data.source
	this.title = data.title
	this.path = data.path
	this.lyric = data.lyric
	this.cover = data.cover || '/static/music/music-bg.jpg'
	this.singer = data.singer || '未知歌手'
	this.isCollection = isCollection(this.id)
	this.type = 'single'//单曲类型
	this.source = data.source
}

export const Album = function (data) {
	this.id = data.id
	this.title = data.title
	this.cover = data.cover || '/static/music/music-bg.jpg'
	this.desc = data.desc
	this.type = 'album'//歌单类型
	this.isCollection = isCollection(this.id)
	this.source = data.source
}


//是否被收藏
function isCollection (id) {
	const collections = getters['music/getCollection']
	const index = collections.findIndex(collection => collection.id == id)
	return index > -1
}