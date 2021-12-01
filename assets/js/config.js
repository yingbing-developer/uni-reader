export default {
	//小说网站链接
	BOOKURL: {
		'baoshuu': {
			title: '手机宝书',
			href: 'http://m.baoshuu.com'
		},
		'bamxs': {
			title: '八毛小说',
			href: 'http://m.bamxs.com'
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
			href: 'https://cosplayporn.cc'
		},
		'wnacg': {
			title: '绅士漫画',
			href: 'https://hentaicomic.org'
		}
	},
	//音乐网站链接
	MUSICURL: {
		'qqmusic': {
			title: 'QQ音乐',
			href: 'https://c.y.qq.com'
		},
		'163music': {
			title: '网易云音乐',
			href: 'https://autumnfish.cn'
		}
	},
	
	//青壮年内容
	ADULTS: [
		'loli',
		'wnacg',
		'bamxs'
	],
	
	//QQ音乐请求常量
	commonParams: {
	  g_tk: 5381,
	  loginUin: 0,
	  hostUin: 0,
	  format: 'json',
	  inCharset: 'utf8',
	  outCharset: 'utf-8',
	  notice: 0,
	  platform: 'yqq.json',
	  needNewCode: 0
	},
	
	
	//请求成功编码
	ERR_OK: 200,
	//请求失败编码
	ERR_FALSE: 300,
	//请求超时时间
	TIMEOUT: 50000
}
