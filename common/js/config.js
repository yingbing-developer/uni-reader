//漫画网站链接
export const COMICURL = {
	'mangabz': {
		title: 'mangaBz',
		href: 'http://www.mangabz.com'
	},
	'18comic': {
		title: '禁漫天堂',
		href: 'https://18comic.art'
	},
	'sixmh6': {
		title: '6漫画',
		href: 'http://m.sixmh6.com'
	},
	'dmzj': {
		title: '动漫之家',
		href: 'https://www.dmzj.com'
	}
};
//音乐网站链接
export const MUSICURL = {
	'qqmusic': {
		title: 'QQ音乐',
		href: 'https://c.y.qq.com'
	},
	'163music': {
		title: '网易云音乐',
		href: 'https://autumnfish.cn'
	}
};

//QQ音乐请求常量
export const commonParams = {
  g_tk: 5381,
  loginUin: 0,
  hostUin: 0,
  format: 'json',
  inCharset: 'utf8',
  outCharset: 'utf-8',
  notice: 0,
  platform: 'yqq.json',
  needNewCode: 0
}


//请求成功编码
export const ERR_OK = 200;
//请求失败编码
export const ERR_FALSE = 300;
//请求超时时间
export const TIMEOUT = 50000;