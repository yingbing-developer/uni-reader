import http from '@/plugins/request/index.js'
import HTMLParser from '@/assets/js/html-parse.js'
import Store from '@/store' // 获取 Vuex Store 实例，注意是**实例**，而不是 vuex 这个库
import Utils from '@/assets/js/util.js'
import Config from '@/assets/js/config.js'

const { COMICURL, ERR_OK, ERR_FALSE, ADULTS } = Config
const { replaceStr } = Utils;
const { getters } = Store;

const tag1 = 'mangabz';
const tag2 = 'loli';
const tag4 = '18comic';
const tag5 = 'sixmh';
const tag6 = 'wnacg';
const tag7 = 'dmzj';


//获取漫画列表
export function getComic (data) {
	//判断一下哪些来源被关闭了
	const sources = getters['book/getComicSourcesController'];
	const adult = getters['app/getAdult'];
	let newArr = [];
	if ( sources.indexOf(tag1) == -1 && !data.isLastPage[tag1] && (ADULTS.indexOf(tag1) == -1 || adult) ) {
		newArr.push(getMangabz(data));
	}
	if ( sources.indexOf(tag2) == -1 && !data.isLastPage[tag2] && (ADULTS.indexOf(tag2) == -1 || adult) ) {
		newArr.push(getLoli(data));
	}
	// if ( sources.indexOf(tag4) == -1 && !data.isLastPage[tag4] ) {
	// 	newArr.push(get18comic(data));
	// }
	if ( sources.indexOf(tag5) == -1 && !data.isLastPage[tag5] && (ADULTS.indexOf(tag5) == -1 || adult) ) {
		newArr.push(getSixmh6(data));
	}
	if ( sources.indexOf(tag6) == -1 && !data.isLastPage[tag6] && (ADULTS.indexOf(tag6) == -1 || adult) ) {
		newArr.push(getWnacg(data));
	}
	if ( sources.indexOf(tag7) == -1 && !data.isLastPage[tag7] && (ADULTS.indexOf(tag7) == -1 || adult) ) {
		newArr.push(getDmzj(data));
	}
	return Promise.all(newArr.map((promise)=>promise.catch((e)=>{promise.resolve(e)})))
}
//获取漫画章节
export function getComicNum (data) {
	if ( data.source == tag1 ) {
		return getMangabzNum(data.href);
	}
	if ( data.source == tag2 ) {
		return getLoliNum(data.href);
	}
	if ( data.source == tag4 ) {
		return get18comicNum(data.href);
	}
	if ( data.source == tag5 ) {
		return getSixmh6Num(data.href);
	}
	if ( data.source == tag6 ) {
		return getWnacgNum(data.href);
	}
	if ( data.source == tag7 ) {
		return getDmzjNum(data.href);
	}
}
//获取漫画详情信息
export function getComicDetail (data) {
	if ( data.source == tag1 ) {
		return getMangabzDetail(data.href);
	}
	if ( data.source == tag2 ) {
		return getLoliDetail(data.href);
	}
	if ( data.source == tag4 ) {
		return get18comicDetail(data.href);
	}
	if ( data.source == tag5 ) {
		return getSixmh6Detail(data.href);
	}
	if ( data.source == tag6 ) {
		return getWnacgDetail(data.href);
	}
	if ( data.source == tag7 ) {
		return getDmzjDetail(data.href);
	}
}

//获取漫画详情信息
export function getComicContent (data) {
	if ( data.source == tag1 ) {
		return getMangabzContent(data.href);
	}
	if ( data.source == tag2 ) {
		return getLoliContent(data.href);
	}
	if ( data.source == tag4 ) {
		return get18comicContent(data.href);
	}
	if ( data.source == tag5 ) {
		return getSixmh6Content(data.href);
	}
	if ( data.source == tag6 ) {
		return getWnacgContent(data.href);
	}
	if ( data.source == tag7 ) {
		return getDmzjContent(data.href);
	}
}




//获取mangaBz网站的漫画列表
function getMangabz (data) {
	let dataSync = {
		t: 3,
		f: 0,
		d: 'Sat%20Aug%2021%202021%2009:31:43%20GMT+0800%20(中国标准时间)',
		title: data.title,
		pageSize: 12,
		pageindex: data.page[tag1]
	}
	return new Promise((resolve, reject) => {
		http.get(COMICURL[tag1].href + '/pager.ashx', {
			params: dataSync
		}).then((res) => {
			let comic = [];
			if ( res.data?.length > 0 ) {
				for ( let i in res.data ) {
					comic.push({
						image: res.data[i].Pic,
						name: res.data[i].Title || '暂无',
						author: res.data[i].Author.toString().replace(/,/g, ' '),
						intro: res.data[i].Content || '暂无介绍',
						path: res.data[i].Url || '',
						source: tag1
					})
				}
			}
			resolve({
				code: ERR_OK,
				data: {
					list: comic,
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

//获取mangaBz网站的漫画章节
function getMangabzNum (href) {
	let abort;
	let p1 = new Promise((resolve, reject) => {
		http.get(COMICURL[tag1].href + href).then((res) => {
			let str = replaceStr(res.data);//解析html字符
			let arr = str.match(/<div[^>]*class=([""]?)detail-list-item\1[^>]*>*([\s\S]*?)<\/div>/ig);//正则匹配漫画全部章节
			let nums = [];
			if ( arr ) {
				for ( let i = 0; i < arr.length; i++ ) {
					let obj = HTMLParser(arr[i])[0];//将html字符串转化为html数组
					nums.push({
						path: obj.children ? COMICURL[tag1].href + obj.children[0].attrs.href : '',
						name: obj.children[0].children ? obj.children[0].children[0].text.replace(/\s+/g,"") : '未知'
					})
				}
			}
			resolve({
				code: ERR_OK,
				data: nums
			})
		}).catch((err) => {
			reject({
				code: ERR_FALSE,
				data: []
			})
		})
	})
	let p2 = new Promise((resolve, reject) => (abort = reject));
	let p = Promise.race([p1, p2]);
	p.abort = abort;
	return p;
}

//获取mangaBz网站的漫画详情信息
function getMangabzDetail (href) {
	return new Promise((resolve, reject) => {
		http.get(COMICURL[tag1].href + href).then((res) => {
			let str = replaceStr(res.data);//解析html字符
			let subtitle = str.match(/<p[^>]*class=([""]?)detail-main-subtitle\1[^>]*>*([\s\S]*?)<\/p>/ig);//正则匹配漫画详情信息
			let strs = subtitle[0].match(/<span[^\s]>*([\s\S]*?)<\/span>/ig);//正则匹配漫画作者和类型
			let data = {
				name: '',
				author : '',
				intro: ''
			}
			if ( strs ) {
				for ( let i in strs ) {
					let obj = HTMLParser(strs[i])[0]
					data.author += obj.children ? obj.children[0].text + ' ' : ''
				} 
			}
			subtitle = str.match(/<p[^>]*class=([""]?)detail-main-content\1[^>]*>*([\s\S]*?)<\/p>/ig);//正则匹配漫画介绍
			data.intro = HTMLParser(subtitle[0])[0].children ? HTMLParser(subtitle[0])[0].children[0].text : '';
			subtitle = str.match(/<p[^>]*class=([""]?)detail-main-title\1[^>]*>*([\s\S]*?)<\/p>/ig);//正则匹配漫画介绍
			data.name = HTMLParser(subtitle[0])[0].children ? HTMLParser(subtitle[0])[0].children[0].text : '';
			resolve({
				code: ERR_OK,
				data: data
			})
		}).catch((err) => {
			reject({
				code: ERR_FALSE,
				data: {}
			})
		})
	})
}

//获取mangaBz网站的漫画内容
function getMangabzContent (href) {
	return new Promise((resolve, reject) => {
		http.get(href).then((res) => {
			let str = res.data;//解析html字符
			let body = str.match(/<body[^>]*([\s\S]*?)<\/body>/);
			let scripts = body[0].match(/<script[^>]*([\s\S]*?)<\/script>/ig);
			let jsStr = scripts[11].match(/<script[^>]*([\s\S]*?)<\/script>/);
			jsStr = JSON.stringify(jsStr[1]);
			let func = jsStr.substring(jsStr.indexOf('(') + 1, jsStr.lastIndexOf(')'));
			func = func.replace(/\\\\/g, '\\');
			func = func.replace(/\\n/g, '');
			func = func.replace(/\\"/g, '"');
			let imageStr = eval("(" + func + ")");
			imageStr = imageStr.substring(imageStr.indexOf("'") + 1, imageStr.lastIndexOf("'"));
			let arr = imageStr.split("','");
			let images = [];
			for ( let i in arr ) {
				images.push({
					path: arr[i]
				})
			}
			resolve(images)
		}).catch((err) => {
			reject([])
		})
	})
}

//获取写真网站的漫画列表
function getLoli (data) {
	let dataSync = {
		s: data.title,
		page: data.page[tag2]
	}
	return new Promise((resolve, reject) => {
		http.get(COMICURL[tag2].href + '/page/' + data.page[tag2] + '/', {
			params: dataSync
		}).then((res) => {
			let str = replaceStr(res.data);//解析html字符
			let arr = str.match(/<li[^>]*class=([""]?)g1-collection-item\1[^>]*>*([\s\S]*?)<\/li>/ig);//正则匹配所有漫画标签内容
			let comic = [];
			if ( arr ) {
				for ( let i = 0; i < arr.length; i++ ) {
					let img = arr[i].match(/<img[^>]*class=([""]?)attachment-bimber-grid-2of3 size-bimber-grid-2of3 wp-post-image\1[^>]*>/ig);
					let name = arr[i].match(/<h2[^>]*class=([""]?)g1-mega g1-mega-1st entry-title\1[^>]*>*([\s\S]*?)<\/h2>/ig);
					let intro = arr[i].match(/<div[^>]*class=([""]?)entry-before-title\1[^>]*>*([\s\S]*?)<\/div>/ig);
					let intro2 = intro[0].match(/<a[^>]*>*([\s\S]*?)<\/a>/ig);
					let imgObj = HTMLParser(img[0])[0];//将html字符串转化为html数组
					let nameObj = HTMLParser(name[0])[0];//将html字符串转化为html数组
					let desc = '';
					for ( let i in intro2 ) {
						let introObj = HTMLParser(intro2[i])[0];//将html字符串转化为html数组
						desc += introObj.children[0].text + (i < intro2.length - 1 ? ' ' : '')
					}
					comic.push({
						image: imgObj.attrs.src || '',
						name: nameObj.children ? nameObj.children[0].children ? nameObj.children[0].children[0].text : '暂无' : '暂无',
						author: '暂无',
						intro: desc || '暂无介绍',
						path: nameObj.children ? nameObj.children[0].attrs.href : '暂无',
						source: tag2
					})
				}
			}
			resolve({
				code: ERR_OK,
				data: {
					list: comic,
					source: tag2
				}
			})
		}).catch((err) => {
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

//获取写真网站的漫画性情
function getLoliDetail (href) {
	return new Promise((resolve, reject) => {
		http.get(href, {
			headers: {
				referer: 'https://cosplayporn.cc',
				host: 'cosplayporn.cc',
			}
		}).then((res) => {
			let str = replaceStr(res.data);//解析html字符
			let data = {
				name: '',
				author : '暂无作者',
				intro: ''
			}
			let name = str.match(/<h1[^>]*class=([""]?)g1-mega g1-mega-1st entry-title\1[^>]*>*([\s\S]*?)<\/h1>/ig);
			let intro = str.match(/<div[^>]*class=([""]?)entry-before-title\1[^>]*>*([\s\S]*?)<\/div>/ig);
			let intro2 = intro[0].match(/<a[^>]*>*([\s\S]*?)<\/a>/ig);
			let nameObj = HTMLParser(name[0])[0];//将html字符串转化为html数组
			data.name = nameObj.children[0].text;
			for ( let i in intro2 ) {
				let introObj = HTMLParser(intro2[i])[0];//将html字符串转化为html数组
				data.intro += introObj.children[0].children[0].text + (i < intro2.length - 1 ? ' ' : '')
			}
			let response = {
				code: ERR_OK,
				data: data
			}
			resolve(response)
		}).catch((err) => {
			let response = {
				code: ERR_FALSE,
				data: {}
			}
			reject(response)
		})
	})
}

//获取写真网站的漫画章节
function getLoliNum (href) {
	let abort;
	let p1 = new Promise((resolve, reject) => {
		let nums = [{
			path: href,
			name: '全本'
		}]
		let response = {
			code: ERR_OK,
			data: nums
		}
		resolve(response)
	})
	let p2 = new Promise((resolve, reject) => (abort = reject));
	let p = Promise.race([p1, p2]);
	p.abort = abort;
	return p;
}

//获取写真网的漫画内容
function getLoliContent (href) {
	return new Promise((resolve, reject) => {
		http.get(href).then((res) => {
			let str = replaceStr(res.data);//解析html字符
			let div = str.match(/<div[^>]*class=([""]?)adace-slot-wrapper adace-before-content  adace-slot-wrapper-main\1[^>]*>*([\s\S]*?)<\/p>/);
			let imgs = div[0].match(/<img[^>]*>/ig)
			let images = [];
			for ( let i in imgs ) {
				let imgObj = HTMLParser(imgs[i])[0]
				images.push({
					path: imgObj.attrs.src
				})
			}
			resolve(images)
		}).catch((err) => {
			reject([])
		})
	})
}


//获取禁漫天堂漫画网站的漫画列表
function get18comic (data) {
	let dataSync = {
		search_query: data.title,
		main_tag: 0,
		page: data.page[tag4]
	}
	return new Promise((resolve, reject) => {
		http.get(COMICURL[tag4].href + '/search/photos', {
			params: dataSync
		}).then((res) => {
			let comic = [];
			let str = replaceStr(res.data);//解析html字符
			let arr = str.match(/<div[^>]*class=([""]?)well well-sm\1[^>]*>*([\s\S]*?)<\/div>/ig);//正则匹配所有漫画列表内容
			let tags = str.match(/<div[^>]*class=([""]?)title-truncate tags\1[^>]*>*([\s\S]*?)<\/div>/ig);//正则匹配所有漫画标签内容
			if ( arr ) {
				for ( let i = 1; i < arr.length; i++ ) {
					let a = arr[i].match(/<a[^>]*([\s\S]*?)<\/a>/ig);
					let img = a[0].match(/<img[^>]*class=([""]?)lazy_img img-responsive img-rounded \1[^>]*>/ig);
					let tag = tags[i - 1].match(/<a[^>]*([\s\S]*?)<\/a>/ig);
					let tagStr = '';
					for ( let i in tag ) {
						let tagObj = HTMLParser(tag[i])[0];
						tagStr += tagObj.children ? tagObj.children[0].text + (i < tag.length - 1 ? ' ' : '') : '';
					}
					let aObj = HTMLParser(a[0])[0];
					let imgObj = HTMLParser(img[0])[0];
					comic.push({
						image: imgObj.attrs['data-original'] || '',
						name: imgObj.attrs.title || '暂无',
						author: '佚名',
						intro: tagStr || '暂无介绍',
						path: aObj.attrs.href || '',
						source: tag4
					})
				}
			}
			resolve({
				code: ERR_OK,
				data: {
					list: comic,
					source: tag4
				}
			})
		}).catch((err) => {
			resolve({
				code: ERR_FALSE,
				data: {
					list: [],
					source: tag4
				}
			})
		})
	})
}

//获取禁漫天堂漫画网站的漫画章节
function get18comicNum (href) {
	let abort;
	let p1 = new Promise((resolve, reject) => {
		http.get(COMICURL[tag4].href + href).then((res) => {
			let str = replaceStr(res.data);//解析html字符
			let ul = str.match(/<ul[^>]*class=([""]?)btn-toolbar \1[^>]*>*([\s\S]*?)<\/ul>/ig);//正则匹配漫画全部章节
			let nums = [];
			if ( ul ) {
				let arr = ul[0].match(/<a[^>]*([\s\S]*?)<\/a>/ig);
				if ( arr ) {
					for ( let i = 0; i < arr.length; i++ ) {
						let li = arr[i].match(/<li[^>]*([\s\S]*?)<\/li>/ig);
						let aObj = HTMLParser(arr[i])[0];//将html字符串转化为html数组
						let liObj = HTMLParser(li[0])[0];//将html字符串转化为html数组
						nums.push({
							path: COMICURL[tag4].href + aObj.attrs.href,
							name: liObj.children ? liObj.children[0].text : ''
						})
					}
				}
			} else {
				let a = str.match(/<a[^>]*class=([""]?)col btn btn-primary dropdown-toggle reading\1[^>]*>*([\s\S]*?)<\/a>/ig);//正则匹配漫画开始阅读
				let obj = HTMLParser(a[0])[0];//将html字符串转化为html数组
				nums.push({
					path: COMICURL[tag4].href + obj.attrs.href,
					name: '全本'
				})
			}
			nums.reverse();
			resolve({
				code: ERR_OK,
				data: nums
			})
		}).catch((err) => {
			reject({
				code: ERR_FALSE,
				data: []
			})
		})
	})
	let p2 = new Promise((resolve, reject) => (abort = reject));
	let p = Promise.race([p1, p2]);
	p.abort = abort;
	return p;
}

//获取禁漫天堂漫画网站的漫画详情信息
function get18comicDetail (href) {
	return new Promise((resolve, reject) => {
		http.get(COMICURL[tag4].href + href).then((res) => {
			let str = replaceStr(res.data);//解析html字符
			let intro = str.match(/<div[^>]*id=([""]?)intro-block\1[^>]*>*([\s\S]*?)<\/div>/ig);//正则匹配漫画介绍
			let author = str.match(/<span[^>]*itemprop=([""]?)author\1[^>]*>*([\s\S]*?)<\/span>/ig);//正则匹配漫画作者
			let name = str.match(/<div[^>]*itemprop=([""]?)name\1[^>]*>*([\s\S]*?)<\/div>/ig);//正则匹配漫画作者
			let data = {
				name: '',
				author : '',
				intro: ''
			}
			if ( intro ) {
				let p = intro[0].match(/<div[^>]*class=([""]?)p-t-5 p-b-5\1[^>]*>*([\s\S]*?)<\/div>/ig);
				let obj = HTMLParser(p[0])[0];
				data.intro = obj.children ? obj.children[0].text.replace('叙述：', '') : '暂无简介';
			}
			if ( author ) {
				let a = author[2].match(/<a[^>]*class=([""]?)btn btn-sm btn-primary\1[^>]*>*([\s\S]*?)<\/a>/ig);//正则匹配漫画作者标签
				if ( a ) {
					for ( let i in a ) {
						let obj = HTMLParser(a[i])[0];
						data.author += obj.children ? obj.children[0].text + (i < a.length - 1 ? ' ' : '') : '';
					} 
				}
			}
			if ( name ) {
				let h = name[0].match(/<h1[^>]*([\s\S]*?)<\/h1>/ig);
				let obj = HTMLParser(h[0])[0];
				data.name = obj.children ? obj.children[0].text : '';
			}
			let response = {
				code: ERR_OK,
				data: data
			}
			resolve(response)
		}).catch((err) => {
			console.log(err);
			let response = {
				code: ERR_FALSE,
				data: {}
			}
			reject(response)
		})
	})
}


//获取6漫画网站的漫画列表
function getSixmh6 (data) {
	let dataSync = {
		keyword: data.title
	}
	return new Promise((resolve, reject) => {
		if ( data.page[tag5] > 1 ) {
			resolve({
				code: ERR_OK,
				data: {
					list: [],
					source: tag5
				}
			});
			return;
		}
		http.get(COMICURL[tag5].href + '/search', {
			params: dataSync
		}).then((res) => {
			let comic = [];
			let str = replaceStr(res.data);//解析html字符
			let ul = str.match(/<ul[^>]*class=([""]?)result-list\1[^>]*>*([\s\S]*?)<\/ul>/ig);//正则匹配所有漫画列表内容
			let arr = ul[0].match(/<a[^>]*([\s\S]*?)<\/a>/ig);//正则匹配所有漫画列表内容
			if ( arr ) {
				for ( let i = 0; i < arr.length; i++ ) {
					let img = arr[i].match(/<img[^>]*class=([""]?)cartoon-poster\1[^>]*>/ig);
					let info = arr[i].match(/<div[^>]*class=([""]?)cartoon-info\1[^>]*>*([\s\S]*?)<\/div>/ig);
					let name = info[0].match(/<h2[^>]*([\s\S]*?)<\/h2>/ig);
					let p = info[0].match(/<p[^>]*([\s\S]*?)<\/p>/ig);
					let aObj = HTMLParser(arr[i])[0];
					let imgObj = HTMLParser(img[0])[0];
					let nameObj = HTMLParser(name[0])[0];
					let authorObj = HTMLParser(p[0])[0];
					let introObj = HTMLParser(p[1])[0];
					comic.push({
						image: imgObj.attrs.src || '',
						name: nameObj.children ? nameObj.children[0].text : '暂无',
						author: authorObj.children ? authorObj.children[0].text : '佚名',
						intro: introObj.children ? introObj.children[0].text : '暂无介绍',
						path: aObj.attrs.href || '',
						source: tag5
					})
				}
			}
			resolve({
				code: ERR_OK,
				data: {
					list: comic,
					source: tag5
				}
			})
		}).catch((err) => {
			resolve({
				code: ERR_FALSE,
				data: {
					list: [],
					source: tag5
				}
			})
		})
	})
}

//获取6漫画网站的漫画章节
function getSixmh6Num (href) {
	let abort;
	let p1 = new Promise((resolve, reject) => {
		http.get(COMICURL[tag5].href + href).then((res) => {
			let str = replaceStr(res.data);//解析html字符
			let div1 = str.match(/<div[^>]*id=([""]?)chapter-list1\1[^>]*>*([\s\S]*?)<\/div>/);//正则匹配漫画全部章节
			let div2 = str.match(/<div[^>]*id=([""]?)chapter-list2\1[^>]*>*([\s\S]*?)<\/div>/);//正则匹配漫画全部章节
			let arrs = [false, false];
			arrs[0] = div1[0].match(/<a[^>]*([\s\S]*?)<\/a>/ig);//正则匹配漫画全部章节1
			arrs[1] = div2[0].match(/<a[^>]*([\s\S]*?)<\/a>/ig);//正则匹配漫画全部章节2
			let arr = arrs[0].length > arrs[1].length ? arrs[0] : arrs[1];
			let nums = [];
			for ( let i = 0; i < arr.length; i++ ) {
				let title = arr[i].match(/<p[^>]*class=([""]?)chapter-title\1[^>]*>*([\s\S]*?)<\/p>/ig);//正则匹配章节名称
				let aObj = HTMLParser(arr[i])[0];//将html字符串转化为html数组
				let titleObj = HTMLParser(title[0])[0];//将html字符串转化为html数组
				nums.push({
					path: aObj.attrs.href ? COMICURL[tag5].href + aObj.attrs.href : '',
					name: titleObj.children ? titleObj.children[0].text : ''
				})
			}
			let response = {
				code: ERR_OK,
				data: nums
			}
			resolve(response)
		}).catch((err) => {
			let response = {
				code: ERR_FALSE,
				data: []
			}
			reject(response)
		})
	});
	let p2 = new Promise((resolve, reject) => {
		let id = href.replace(/\//g, '')
		http.post(COMICURL[tag5].href + '/bookchapter/', {
			params: {
				id: id,
				id2: 1
			},
			headers: {
				'Referer': 'http://m.sixmh7.com/',
				'Host': 'm.sixmh7.com',
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			}
		}).then((res) => {
			let data = res.data;
			let nums = [];
			for ( let i in data ) {
				nums.push({
					path: COMICURL[tag5].href + href + data[i].chapterid + '.html',
					name: data[i].chaptername
				})
			}
			let response = {
				code: ERR_OK,
				data: nums
			}
			resolve(response)
		}).catch((err) => {
			let response = {
				code: ERR_FALSE,
				data: []
			}
			reject(response)
		})
	})
	return new Promise((resolve, reject) => {
		Promise.all([p1, p2]).then((res) => {
			resolve({
				code: ERR_OK,
				data: res[0].data.concat(res[1].data)
			})
		}).catch((err) => {
			reject({
				code: ERR_FALSE,
				data: []
			})
		})
	});
}

//获取6漫画网站的漫画详情
function getSixmh6Detail (href) {
	let abort;
	let p1 = new Promise((resolve, reject) => {
		http.get(COMICURL[tag5].href + href).then((res) => {
			let str = replaceStr(res.data);//解析html字符
			let name = str.match(/<h1[^>]*class=([""]?)cartoon-title\1[^>]*>*([\s\S]*?)<\/h1>/ig);//正则匹配所有漫画名称
			let author = str.match(/<p[^>]*class=([""]?)author\1[^>]*>*([\s\S]*?)<\/p>/ig);//正则匹配所有漫画作者
			let intro = str.match(/<p[^>]*class=([""]?)introduction\1[^>]*>*([\s\S]*?)<\/p>/ig);//正则匹配所有漫画介绍
			
			let nameObj = HTMLParser(name[0])[0];
			let authorObj = HTMLParser(author[0])[0];
			let introObj = HTMLParser(intro[0])[0];
			let data = {
				name: nameObj.children ? nameObj.children[0].text : '暂无',
				author: authorObj.children ? authorObj.children[0].text.replace('作者：', '') : '佚名',
				intro: introObj.children ? introObj.children[0].text : '暂无介绍'
			};
			let response = {
				code: ERR_OK,
				data: data
			}
			resolve(response)
		}).catch((err) => {
			let response = {
				code: ERR_FALSE,
				data: {}
			}
			reject(response)
		})
	})
	let p2 = new Promise((resolve, reject) => (abort = reject));
	let p = Promise.race([p1, p2]);
	p.abort = abort;
	return p;
}

//获取Sixmh6网站的漫画内容
function getSixmh6Content (href) {
	return new Promise((resolve, reject) => {
		http.get(href).then((res) => {
			let str = res.data;//解析html字符
			let body = str.match(/<body[^>]*([\s\S]*?)<\/body>/);
			let scripts = body[0].match(/<script[^>]*([\s\S]*?)<\/script>/ig);
			let jsStr = scripts[0].match(/<script[^>]*([\s\S]*?)<\/script>/);
			jsStr = JSON.stringify(jsStr[1]);
			let func = jsStr.substring(jsStr.indexOf('(') + 1, jsStr.lastIndexOf(')'));
			func = func.replace(/\\\\/g, '\\');
			func = func.replace(/\\n/g, '');
			func = func.replace(/\\"/g, '"');
			let imageStr = eval("(" + func + ")");
			imageStr = imageStr.substring(imageStr.indexOf('"') + 1, imageStr.lastIndexOf('"'));
			let arr = imageStr.split('","');
			let images = [];
			for ( let i in arr ) {
				images.push({
					path: arr[i]
				})
			}
			resolve(images)
		}).catch((err) => {
			reject([])
		})
	})
}

//获取绅士漫画网站的漫画列表
function getWnacg (data) {
	let dataSync = {
		q: data.title,
		p: data.page[tag6],
		m: '',
		f: '_all',
		s: 'create_time_DESC'
	}
	return new Promise((resolve, reject) => {
		http.get(COMICURL[tag6].href + '/search/', {
			params: dataSync
		}).then((res) => {
			let comic = [];
			let str = replaceStr(res.data);//解析html字符
			let arr = str.match(/<li[^>]*class=([""]?)li gallary_item\1[^>]*>*([\s\S]*?)<\/li>/ig);//正则匹配所有漫画列表内容
			if ( arr ) {
				for ( let i = 0; i < arr.length; i++ ) {
					let info = arr[i].match(/<div[^>]*class=([""]?)info_col\1[^>]*>*([\s\S]*?)<\/div>/ig);
					let a = arr[i].match(/<a[^>]*([\s\S]*?)<\/a>/ig);
					let aObj = HTMLParser(a[0])[0];
					let introObj = HTMLParser(info[0])[0];
					comic.push({
						image: aObj.children ? ('https:' + aObj.children[0].attrs.src) : '',
						name: aObj.attrs.title.replace(/<em>/g, '').replace(/<\/em>/g, '') || '暂无名称',
						author: '佚名',
						intro: introObj.children ? introObj.children[0].text : '暂无介绍',
						path: aObj.attrs.href,
						source: tag6
					})
				}
			}
			resolve({
				code: ERR_OK,
				data: {
					list: comic,
					source: tag6
				}
			})
		}).catch((err) => {
			resolve({
				code: ERR_FALSE,
				data: {
					list: [],
					source: tag6
				}
			})
		})
	})
}

//获取绅士漫画网站的漫画章节
function getWnacgNum (href) {
	let abort;
	let p1 = new Promise((resolve, reject) => {
		http.get(COMICURL[tag6].href + href).then((res) => {
			let str = replaceStr(res.data);//解析html字符
			let num = str.match(/<a[^>]*class=([""]?)Btn right\1[^>]*>*([\s\S]*?)<\/a>/ig);
			let numObj = HTMLParser(num[1])[0];//将html字符串转化为html数组
			let url = numObj.attrs.href.replace('slide', 'gallery');
			url = url.replace('list', 'gallery');
			resolve({
				code: ERR_OK,
				data: [{
					path: COMICURL[tag6].href +url,
					name: '全本'
				}]
			})
		}).catch((err) => {
			reject({
				code: ERR_FALSE,
				data: []
			})
		})
	})
	let p2 = new Promise((resolve, reject) => (abort = reject));
	let p = Promise.race([p1, p2]);
	p.abort = abort;
	return p;
}

//获取绅士漫画网站的漫画性情
function getWnacgDetail (href) {
	return new Promise((resolve, reject) => {
		http.get(COMICURL[tag6].href + href).then((res) => {
			let str = replaceStr(res.data);//解析html字符
			let data = {
				name: '',
				author : '暂无作者',
				intro: ''
			}
			let name = str.match(/<div[^>]*class=([""]?)BarTit\1[^>]*>*([\s\S]*?)<\/div>/ig);
			let intro = str.match(/<a[^>]*class=([""]?)tagshow\1[^>]*>*([\s\S]*?)<\/a>/ig);
			let nameObj = HTMLParser(name[0])[0];//将html字符串转化为html数组
			for ( let i in intro ) {
				let introObj = HTMLParser(intro[i])[0];//将html字符串转化为html数组
				data.intro += introObj.children[0].text + (i < intro.length - 1 ? ' ' : '')
			}
			data.name = nameObj.children ? nameObj.children[0].text : '';
			resolve({
				code: ERR_OK,
				data: data
			})
		}).catch((err) => {
			reject({
				code: ERR_FALSE,
				data: {}
			})
		})
	})
}

//获取绅士漫画网的漫画内容
function getWnacgContent (href) {
	return new Promise((resolve, reject) => {
		http.get(href).then((res) => {
			let str = replaceStr(res.data);
			let write = str.match(/document.writeln\("*([\s\S]*?)"\);/ig);
			let imgStr = write[10].match(/document.writeln\(\"var imglist = \[\{*([\s\S]*?)\}\];\"\);/)[1];
			let arr = imgStr.split('},{');
			let images = [];
			for ( let i in arr ) {
				let img = arr[i].match(/fast_img_host\+\"*([\s\S]*?)\",/)[1];
				images.push({
					path: 'https://' + img.replace('//', '')
				})
			}
			resolve(images)
		}).catch((err) => {
			reject([])
		})
	})
}


//获取dmzj漫画网站的漫画列表
function getDmzj (data) {
	return new Promise((resolve, reject) => {
		http.get(COMICURL[tag7].href + '/dynamic/o_search/index/' + data.title + '/' + data.page[tag7]).then((res) => {
			let comic = [];
			let str = replaceStr(res.data);//解析html字符
			let ul = str.match(/<ul[^>]*class=([""]?)update_con autoHeight\1[^>]*>*([\s\S]*?)<\/ul>/ig);//正则匹配所有漫画内容
			let arr = ul[0].match(/<li[^>]*([\s\S]*?)<\/li>/ig);//正则匹配所有漫画列表内容
			if ( arr ) {
				for ( let i = 0; i < arr.length; i++ ) {
					let img = arr[i].match(/<img[^>]*>/ig);
					let intro = arr[i].match(/<p[^>]*class=([""]?)newPage\1[^>]*>*([\s\S]*?)<\/p>/ig);
					let author = arr[i].match(/<p[^>]*class=([""]?)auth\1[^>]*>*([\s\S]*?)<\/p>/ig);
					let a = arr[i].match(/<a[^>]*>/ig);
					let aObj = HTMLParser(a[1])[0];
					let imgObj = HTMLParser(img[0])[0];
					let authorObj = HTMLParser(author[0])[0];
					let introObj = HTMLParser(intro[0])[0];
					comic.push({
						image: imgObj.attrs.src || '',
						name: aObj.attrs.title || '暂无',
						author: authorObj.children ? authorObj.children[0].text : '佚名',
						intro: introObj.children ? introObj.children[0].text : '暂无介绍',
						path: '/info/' + aObj.attrs.href.split('/')[aObj.attrs.href.split('/').length - 1] + '.html' || '',
						source: tag7
					})
				}
			}
			resolve({
				code: ERR_OK,
				data: {
					list: comic,
					source: tag7
				}
			})
		}).catch((err) => {
			resolve({
				code: ERR_FALSE,
				data: {
					list: [],
					source: tag7
				}
			})
		})
	})
}

//获取dmzj漫画网站的漫画章节
function getDmzjNum (href) {
	let abort;
	let p1 = new Promise((resolve, reject) => {
		http.get(COMICURL[tag7].href + href).then((res) => {
			let str = replaceStr(res.data);//解析html字符
			let ul = str.match(/<ul[^>]*class=([""]?)list_con_li autoHeight\1[^>]*>*([\s\S]*?)<\/ul>/ig);//正则匹配所有漫画标签内容
			let arr = ul[0].match(/<a[^>]*([\s\S]*?)<\/a>/ig);//正则匹配所有漫画标签内容
			let nums = [];
			if ( arr ) {
				for ( let i = 0; i < arr.length; i++ ) {
					let name = arr[i].match(/<span[^>]*class=([""]?)list_con_zj\1[^>]*>*([\s\S]*?)<\/span>/ig);
					let aObj = HTMLParser(arr[i])[0];//将html字符串转化为html数组
					let nameObj = HTMLParser(name[0])[0];//将html字符串转化为html数组
					nums.push({
						path: aObj.attrs.href.replace('www', 'm') || '',
						name: nameObj.children ? nameObj.children[0].text : '未知'
					})
				}
			}
			resolve({
				code: ERR_OK,
				data: nums
			})
		}).catch((err) => {
			reject({
				code: ERR_FALSE,
				data: []
			})
		})
	})
	let p2 = new Promise((resolve, reject) => (abort = reject));
	let p = Promise.race([p1, p2]);
	p.abort = abort;
	return p;
}

//获取dmzj漫画网站的漫画详情
function getDmzjDetail (href) {
	let abort;
	let p1 = new Promise((resolve, reject) => {
		http.get(COMICURL[tag7].href + href).then((res) => {
			let str = replaceStr(res.data);//解析html字符
			let name = str.match(/<h1[^>]*([\s\S]*?)<\/h1>/ig)[0].match(/<a[^>]*([\s\S]*?)<\/a>/ig);//正则匹配漫画名称
			let ul = str.match(/<ul[^>]*class=([""]?)comic_deCon_liO\1[^>]*>*([\s\S]*?)<\/ul>/ig);//正则匹配漫画信息
			let li = ul[0].match(/<li[^>]*([\s\S]*?)<\/li>/ig);//正则匹配所有漫画信息
			let intro = str.match(/<p[^>]*class=([""]?)comic_deCon_d\1[^>]*>*([\s\S]*?)<\/p>/ig);//正则匹配漫画信息
			let nameObj = HTMLParser(name[0])[0];
			let authorObj = HTMLParser(li[0])[0];
			let introObj = HTMLParser(intro[0])[0];
			let data = {
				name: nameObj.children ? nameObj.children[0].text : '暂无',
				author: authorObj.children ? authorObj.children[0].text.replace('作者:', '') : '佚名',
				intro: introObj.children ? introObj.children[0].text.replace(/<br>/g, '\r') : '暂无介绍'
			};
			resolve({
				code: ERR_OK,
				data: data
			})
		}).catch((err) => {
			reject({
				code: ERR_FALSE,
				data: {}
			})
		})
	})
	let p2 = new Promise((resolve, reject) => (abort = reject));
	let p = Promise.race([p1, p2]);
	p.abort = abort;
	return p;
}

//获取dmzj漫画网站的漫画详情
function getDmzjContent (href) {
	return new Promise((resolve, reject) => {
		http.get(href).then((res) => {
			let str = res.data;//解析html字符
			let body = str.match(/<body[^>]*([\s\S]*?)<\/body>/);
			let scripts = body[0].match(/<script[^>]*([\s\S]*?)<\/script>/ig)
			let jsonStr = scripts[5].match(/\"page_url\":*([\s\S]*?)],/);
			jsonStr = jsonStr[1] + ']';
			let arr = JSON.parse(jsonStr);
			let images = []
			for ( let i in arr ) {
				images.push({
					path: arr[i]
				})
			}
			resolve(images)
		}).catch((err) => {
			reject([])
		})
	})
}
