export default {
	//小说网站链接
	BOOKURL: {
		'baoshuu': {
			title: '手机宝书',
			href: 'http://m.baoshuu.com'
		},
		'bamxs': {
			title: '八毛小说',
			href: 'http://m.bamxs.com',
			isAdult: true//是否属于青壮年内容
		},
		'xquge': {
			title: '笔趣阁',
			href: 'https://www.xquge.com'
		}
	},
	
	//漫画网站链接
	COMICURL: {
		'mangabz': {
			title: 'mangaBz',
			href: 'http://www.mangabz.com'
		},
		// '18comic': {
		// 	title: '禁漫天堂',
		// 	href: 'https://18comic2.art'
		// },
		'sixmh': {
			title: '6漫画',
			href: 'http://m.sixmh7.com'
		},
		'dmzj': {
			title: '动漫之家',
			href: 'https://www.dmzj.com'
		},
		'loli': {
			title: '写真网',
			href: 'https://cosplayporn.cc',
			isAdult: true//是否属于青壮年内容
		},
		'wnacg': {
			title: '绅士漫画',
			href: 'https://hentaicomic.org',
			isAdult: true//是否属于青壮年内容
		}
	},
	//音乐网站链接
	MUSICURL: {
		'163music': {
			title: '网易云音乐',
			href: 'https://autumnfish.cn',
			search: true,//是否有搜索功能
			banner: true,//是否有banner功能
			album: true,//是否有歌单功能
			singer: true,//是否有歌手功能
			top: true,//是否有排行榜功能
			newSong: true//是否有新歌首发功能
		},
		'qqmusic': {
			title: 'QQ音乐',
			href: 'https://u.y.qq.com',
			search: true,//是否有搜索功能
			banner: true,//是否有banner功能
			album: true,//是否有歌单功能
			singer: true,//是否有歌手功能
			top: true,//是否有排行榜功能
			newSong: true//是否有新歌首发功能
		}
	},
	
	//请求成功编码
	ERR_OK: 200,
	//请求失败编码
	ERR_FALSE: 300,
	//请求超时时间
	TIMEOUT: 50000
}
