export default {
	//小说网站链接
	BOOKURL: {
		'baoshuu': {
			title: '手机宝书',
			href: 'http://m.baoshuu.com'
		}
	},
	
	//漫画网站链接
	COMICURL: {
		'mangabz': {
			title: 'mangaBz',
			href: 'http://www.mangabz.com'
		},
		'sixmh': {
			title: '6漫画',
			href: 'http://m.sixmh7.com'
		},
		'dmzj': {
			title: '动漫之家',
			href: 'https://www.dmzj.com'
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
	ADULTS: [],
	
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
