import http from '@/plugins/request/index.js'
import Utils from '@/assets/js/util.js'
import HTMLParser from '@/assets/js/html-parse.js'
import gb2312 from '@/assets/js/gb2312.js'
import Store from '@/store' // 获取 Vuex Store 实例，注意是**实例**，而不是 vuex 这个库
import Config from '@/assets/js/config.js'

const { BOOKURL, ERR_OK, ERR_FALSE, ADULTS } = Config
const { replaceStr, removeUrl } = Utils;
const { getters } = Store;

const tag1 = 'baoshuu';
const tag2 = 'bamxs';


//获取小说列表
export function getBook (data) {
	//判断一下哪些来源被关闭了
	const sources = getters['book/getBookSourcesController'];
	const adult = getters['app/getAdult'];
	let newArr = [];
	if ( sources.indexOf(tag1) == -1 && !data.isLastPage[tag1] && (ADULTS.indexOf(tag1) == -1 || adult) ) {
		newArr.push(getBaoshuu(data));
	}
	if ( sources.indexOf(tag2) == -1 && !data.isLastPage[tag2] && (ADULTS.indexOf(tag2) == -1 || adult) ) {
		newArr.push(getBamxs(data));
	}
	return Promise.all(newArr.map((promise)=>promise.catch((e)=>{promise.resolve(e)})))
}
//获取小说详情信息
export function getBookInfo (data) {
	if ( data.source == tag1 ) {
		return getBaoshuuInfo(data.href);
	}
	if ( data.source == tag2 ) {
		return getBamxsInfo(data.href);
	}
}

//获取小说内容
export function getBookContent (data) {
	if ( data[0].source == tag1 ) {
		return getBaoshuuContent(data);
	}
	if ( data[0].source == tag2 ) {
		return getBamxsContent(data);
	}
}


//获取手机宝书网站的小说列表
function getBaoshuu (data) {
	let dataSync = {
		word: gb2312(data.title),
		m: 2,
		ChannelID: 0,
		page: data.page[tag1]
	}
	return new Promise((resolve, reject) => {
		http.postget(BOOKURL[tag1].href + '/search.asp', {
			params: dataSync,
			headers: {
				Referer: BOOKURL[tag1].href,
				Host: BOOKURL[tag1].href.replace('http://', ''),
				Charset: 'gb2312',//自定义字符格式
				Cookie: 'UM_distinctid=1783b0d7fe43f8-0224fcecd87da9-376b4502-1fa400-1783b0d7fe59f7; READHISTORY=1; Hm_lvt_fed71f7d1edb5bacb3fe60e703a761aa=1629376402,1629415930,1629810834,1629845299; CNZZDATA1276437823=1507837864-1615895385-%7C1630353326',
			}
		}).then((res) => {
			let str = replaceStr(res.data);//解析html字符
			let all = str.match(/<div[^>]*class=([""]?)sslist\1[^>]*>*([\s\S]*?)<\/div>/ig);//正则匹配所有小说内容
			let arr = all[0].match(/<li[^>]*>*([\s\S]*?)<\/p>/ig);//正则匹配所有小说内容
			let list = [];
			if ( arr ) {
				for ( let i = 0; i < arr.length; i++ ) {
					let h1 = arr[i].match(/<h1[^>]*>*([\s\S]*?)<\/h1>/ig);
					let a = h1[0].match(/<a[^>]*>*([\s\S]*?)<\/a>/ig);
					let tag = HTMLParser(a[0])[0];//将html字符串转化为html数组
					a[1] = a[1].replace('<font color="red">', '');
					a[1] = a[1].replace('</font>', '');
					let nameObj = HTMLParser(a[1])[0];//将html字符串转化为html数组
					let desc = arr[i].match(/<p[^>]*>*([\s\S]*?)<\/p>/);
					list.push({
						image: '/static/cover/cover_default.jpg',
						name: '【' + tag.children[0].text + '】' + nameObj.children[0].text,
						author: '暂无',
						desc: desc[1] || '暂无介绍',
						status: '已完结',
						path: nameObj.attrs.href,
						source: tag1
					})
				}
			}
			resolve({
				code: ERR_OK,
				data: {
					list: list,
					source: tag1
				}
			})
		}).catch((err) => {
			resolve({
				code: ERR_FALSE,
				data: {
					list: [],
					source: tag1
				}
			})
		})
	})
}

//获取手机宝书网站的小说信息
function getBaoshuuInfo (href) {
	return new Promise(async(resolve, reject) => {
		let data = await getBaoshuuDetails(BOOKURL[tag1].href + href);
		data.chapters = await getBaoshuuChapters(data.href);
		resolve({
			code: ERR_OK,
			data: {
				data: data,
				source: tag1
			}
		})
	}).catch(() => {
		reject({
			code: ERR_FALSE,
			data: {
				data: {},
				source: tag1
			}
		})
	})
}

//获取手机宝书网站的小说详情
function getBaoshuuDetails (href) {
	return new Promise((resolve, reject) => {
		getApp().globalData.$xhr.get(href, {
			mimeType: 'text/html;charset=gb2312',
			headers: {
				Referer: BOOKURL[tag1].href,
				Host: BOOKURL[tag1].href.replace('http://', '')
			}
		}).then((res) => {
			if ( res.code == 200 ) {
				let str = replaceStr(res.data);//解析html字符
				let subtilte = str.match(/<div[^>]*class=([""]?)mlist\1[^>]*>*([\s\S]*?)<\/div>/);
				let name = subtilte[0].match(/<h1[^\s]>*([\s\S]*?)<\/h1>/);//正则匹配小说详情信息
				let mlist = str.match(/<div[^>]*class=([""]?)mlist\1[^>]*>*([\s\S]*?)<\/a>/);
				let image = mlist[0].match(/<img[^>]*>/ig);//正则匹配小说详情信息
				let imageObj = image ? HTMLParser(image[0])[0] : '';//将html字符串转化为html数组
				let cover = imageObj ? (BOOKURL[tag1].href + imageObj.attrs.src) : '';
				let li = subtilte[0].match(/<li[^\s]>*([\s\S]*?)<\/a>/ig);//正则匹配小说详情信息
				let author = li[0].match(/<a[^>]*>*([\s\S]*?)<\/a>/);
				let content = str.match(/<div[^>]*class=([""]?)conten\1[^>]*>*([\s\S]*?)<\/div>/);
				let readUrl = str.match(/<a[^>]*class=([""]?)left\1[^>]*>*([\s\S]*?)<\/a>/ig);
				let readUrlObj = HTMLParser(readUrl[1])[0];//将html字符串转化为html数组
				let desc = content[0].match(/<p[^>]*>*([\s\S]*?)<\/p>/)[1];
				let hr = desc.match(/<span[^>]*>*([\s\S]*?)<\/span>/);
				if ( hr ) {
					desc = desc.replace(hr[0], '');
				}
				desc = desc.replace(/<br\/>/ig, '\n');
				let lastIndex = readUrlObj.attrs.href.lastIndexOf('/');
				let allLength = readUrlObj.attrs.href.length;
				let urlTxt = gb2312(readUrlObj.attrs.href.substring(lastIndex + 1, allLength));
				let data = {
					name: name[1],
					author: author[1],
					cover: cover,
					desc: desc,
					href: BOOKURL[tag1].href + readUrlObj.attrs.href.substr(0, lastIndex + 1) + urlTxt,
					chapters: []
				}
				resolve(data)
			}
		}).catch(() => {
			resolve({})
		})
	})
}

//获取手机宝书网站的小说章节
function getBaoshuuChapters (href) {
	return new Promise((resolve, reject) => {
		getApp().globalData.$xhr.get(href, {
			mimeType: 'text/html;charset=gb2312',
			headers: {
				Referer: BOOKURL[tag1].href,
				Host: BOOKURL[tag1].href.replace('http://', '')
			}
		}).then((res) => {
			if ( res.code == 200 ) {
				let str = replaceStr(res.data);//解析html字符
				let bottom = str.match(/<div[^>]*id=([""]?)gobottom\1[^>]*>*([\s\S]*?)<br\/>/);
				let div = bottom[0].match(/<div[^>]*>*([\s\S]*?)<\/div>/ig);
				let divObj = HTMLParser(div[div.length - 1])[0];//将html字符串转化为html数组
				let divStr = divObj.children[0].text;
				let lastChapter = divStr.split('/')[1].replace('页', '');
				let chapters = [];
				for ( let i = 0; i <= lastChapter; i++ ) {
					chapters.push({
						title: '第' + (i + 1) + '页',
						chapter: i + 1,
						path: href + '&yeshu=' + i,
						source: tag1,
						isStart: i == 0,
						isEnd: i == lastChapter
					})
				}
				chapters.reverse();
				resolve(chapters)
			}
		}).catch(() => {
			resolve([])
		})
	})
}

//获取手机宝书网站的小说内容
function getBaoshuuContent (data) {
	return new Promise((resolve, reject) => {
		let arr = [];
		for ( let i in data ) {
			arr.push(getApp().globalData.$xhr.get(data[i].url, {
				mimeType: 'text/html;charset=gb2312',
				headers: {
					Referer: BOOKURL[tag1].href,
					Host: BOOKURL[tag1].href.replace('http://', '')
				}
			}))
		}
		Promise.all(arr).then((res) => {
			let contents = [];
			for ( let i in res ) {
				if ( res[i].code == 200 ) {
					let str = getApp().globalData.$utils.replaceStr(res[i].data);
					let content = str.match(/<span[^>]*id=([""]?)Content\1[^>]*>*([\s\S]*?)<\/span>/);//正则匹配所有小说内容
					let unstr = content[2].match(/<font[^>]*>*([\s\S]*?)<\/font>/);//正则匹配所有小说内容
					content = content[2].replace(unstr[0], '');
					content = content.replace('</font>', '');
					content = content.replace(/<br \/>/ig, '\n');
					content = content.replace(/<br>/ig, '\n');
					contents.push({
						chapter: data[i].chapter,
						content: content,
						title: data[i].title,
						isStart: data[i].isStart,
						isEnd: data[i].isEnd
					})
				}
			}
			resolve(contents)
		}).catch(() => {
			reject('')
		})
	})
}

//获取八毛小说网小说列表
function getBamxs (data) {
	let dataSync = {
		word: gb2312(data.title),
		page: data.page[tag2]
	}
	return new Promise((resolve, reject) => {
		getApp().globalData.$xhr.postget(BOOKURL[tag2].href + '/search.asp', {
			params: dataSync,
			mimeType: 'text/html;charset=gb2312',
			headers: {
				Referer: BOOKURL[tag2].href,
				Charset: 'gb2312',//自定义字符格式
				Host: BOOKURL[tag2].href.replace('http://', '')
			}
		}).then((res) => {
			if ( res.code == 200 ) {
				const str = replaceStr(res.data);//解析html字符
				const arr = str.match(/<li[^>]*>*([\s\S]*?)<\/li>/ig);//正则匹配所有小说内容
				let list = [];
				if ( arr ) {
					for ( let i = 0; i < arr.length; i++ ) {
						const img = arr[i].match(/<div[^>]*class=([""]?)img\1[^>]*>*([\s\S]*?)<\/div>/);
						const main = arr[i].match(/<div[^>]*class=([""]?)main\1[^>]*>*([\s\S]*?)<\/div>/);
						if ( img || main ) {
							const imgSrc = img[0].match(/<img[^>]*>/)[0].match(/src=\"*(\S*)\"/)[1];
							let name = main[0].match(/<strong[^>]*>*([\s\S]*?)<\/strong>/)[1]
							const redNameStr = name.match(/<font[^>]*>*([\s\S]*?)<\/font>/)
							if ( redNameStr ) {
								const regExp = new RegExp(`${redNameStr[0]}`, 'g')
								name = name.replace(regExp, redNameStr[1])
							} 
							const spans = main[0].match(/<span[^>]*>*([\s\S]*?)<\/span>/ig)
							let author = spans[1].match(/<span[^>]*>*([\s\S]*?)<\/span>/)[1]
							author = author.match(/作者:*([\s\S]*?)时间/)[1]
							const redAuthorStr = author.match(/<font[^>]*>*([\s\S]*?)<\/font>/)
							if ( redAuthorStr ) {
								const regExp = new RegExp(`${redAuthorStr[0]}`, 'g');
								author = author.replace(regExp, redAuthorStr[1])
							} 
							const desc = spans[2].match(/<span[^>]*>*([\s\S]*?)<\/span>/)[1]
							const a = img[0].match(/<a[^>]*>*([\s\S]*?)<\/a>/)[0]
							const href = removeUrl(a.match(/href=\"*(\S*)\"/)[1])
							list.push({
								image: BOOKURL[tag2].href + imgSrc,
								name: name ,
								author: author || '暂无作者',
								desc: desc || '暂无介绍',
								status: '已完结',
								path: BOOKURL[tag2].href + '/' + href,
								source: tag2
							})
						}
					}
				}
				resolve({
					code: ERR_OK,
					data: {
						list: list,
						source: tag2
					}
				})
			}
		}).catch(() => {
			resolve({
				code: ERR_FALSE,
				data: {
					list: [],
					source: tag2
				}
			})
		})
	})
}

//获取八毛小说网的小说信息
function getBamxsInfo (href) {
	return new Promise((resolve, reject) => {
		getApp().globalData.$xhr.get(href, {
			mimeType: 'text/html;charset=gb2312',
			headers: {
				Referer: BOOKURL[tag2].href,
				Host: BOOKURL[tag2].href.replace('http://', '')
			}
		}).then((res) => {
			if ( res.code == 200 ) {
				const str = replaceStr(res.data);//解析html字符
				const pic = str.match(/<div[^>]*class=([""]?)pic\1[^>]*>*([\s\S]*?)<\/div>/)[0];
				const img = pic.match(/<img[^>]*>/)[0];
				const imgSrc = img.match(/src=\"*(\S*)\"/)[1]
				const name = img.match(/alt=\"*(\S*)\"/)[1]
				let desc = str.match(/<div[^>]*class=([""]?)novelinfo\1[^>]*>*([\s\S]*?)<\/div>/)[2]
				const imgTexts = desc.match(/<img[^>]*>/ig);
				if ( imgTexts ) {
					imgTexts.forEach(imgText => {
						const pinyin = imgText.match(/in\/*(\S*).jpg/)[1];
						const regExp = new RegExp(`${imgText}`, 'g');
						desc = desc.replace(regExp, pinyin);
					})
				}
				const jie = str.match(/<div[^>]*class=([""]?)jie\1[^>]*>*([\s\S]*?)<\/div>/)[0];
				const author = jie.match(/作者：*([\s\S]*?)<\/a>/)[0].match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1]
				const ul = str.match(/<div[^>]*class=([""]?)sso_a\1[^>]*>*([\s\S]*?)<\/div>/)[0];
				const a = ul.match(/<a[^>]*>*([\s\S]*?)<\/a>/ig)
				let chapters = [];
				if ( a ) {
					a.forEach((item, key) => {
						const title = item.match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1]
						const href = item.match(/href=\"*(\S*)\"/)[1]
						chapters.push({
							title: title,
							chapter: parseInt(key) + 1,
							path: href,
							source: tag2,
							isStart: key == 0,
							isEnd: key == a.length - 1
						})
					})
					chapters.reverse();
				}
				const data = {
					name: name,
					author: author,
					cover: BOOKURL[tag2].href + imgSrc,
					desc: desc,
					chapters: chapters
				}
				resolve({
					code: ERR_OK,
					data: {
						data: data,
						source: tag2
					}
				})
			}
		}).catch(() => {
			reject({
				code: ERR_FALSE,
				data: {
					data: {},
					source: tag2
				}
			})
		})
	})
}

//获取八毛小说网的小说内容
function getBamxsContent (data) {
	return new Promise((resolve, reject) => {
		let arr = [];
		for ( let i in data ) {
			arr.push(getApp().globalData.$xhr.get(data[i].url, {
				mimeType: 'text/html;charset=gb2312',
				headers: {
					Referer: BOOKURL[tag2].href,
					Host: BOOKURL[tag2].href.replace('http://', '')
				}
			}))
		}
		Promise.all(arr).then((res) => {
			let contents = [];
			for ( let i in res ) {
				if ( res[i].code == 200 ) {
					const str = getApp().globalData.$utils.replaceStr(res[i].data);
					let content = str.match(/<div[^>]*class=([""]?)novelinfvie\1[^>]*>*([\s\S]*?)<\/div>/)[2];//正则匹配所有小说内容
					const imgs = content.match(/<img[^>]*>/ig);
					if ( imgs ) {
						imgs.forEach(img => {
							const pinyin = img.match(/image\/*(\S*).jpg/)[1];
							const regExp = new RegExp(`${img}`, 'g');
							content = content.replace(regExp, pinyin);
						})
					}
					content = content.replace(/<br \/>/ig, '\n');
					content = content.replace(/<br>/ig, '\n');
					contents.push({
						chapter: data[i].chapter,
						content: content,
						title: data[i].title,
						isStart: data[i].isStart,
						isEnd: data[i].isEnd
					})
				}
			}
			resolve(contents)
		}).catch(() => {
			reject('')
		})
	})
}
