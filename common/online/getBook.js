import http from '@/common/request'
import { BOOKURL, ERR_OK, ERR_FALSE } from '@/common/js/config.js'
import HTMLParser from '@/common/js/html-parse.js'
import gb2312 from '@/common/js/gb2312.js'
import store from '@/store' // 获取 Vuex Store 实例，注意是**实例**，而不是 vuex 这个库

const tag1 = 'baoshuu';

function replaceStr (data) {
	let str = JSON.stringify(data);//将html转化为字符
	str = str.replace(/\\n/g,'');//去除\n
	str = str.replace(/\\r/g,'');//去除\r
	str = str.replace(/\\t/g,'');//去除\t
	str = str.replace(/&nbsp;/g,'');//去除&nbsp;
	str = str.replace(/\\/g,'');//去除掉无关的斜杠
	return str;
}


//获取小说列表
export function getBook (data) {
	//判断一下哪些来源被关闭了
	let sources = store.getters['book/getComicSourcesController'];
	let newArr = [];
	if ( sources.indexOf(tag1) == -1 && !data.isLastPage[tag1] ) {
		newArr.push(getBaoshuu(data));
	}
	return Promise.all(newArr.map((promise)=>promise.catch((e)=>{promise.resolve(e)})))
}
//获取小说章节
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
//获取小说详情信息
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


//获取手机宝书网站的小说列表
function getBaoshuu (data) {
	let dataSync = {
		word: gb2312(data.title),
		m: 2,
		ChannelID: 0,
		page: data.page[tag1]
	}
	return new Promise((resolve, reject) => {
		http.get(BOOKURL[tag1].href + '/search.asp', {
			params: dataSync,
			headers: {
				Referer: 'https://m.baoshuu.com',
				Accept: 'text/html; Charset=gb2312',
				Host: 'm.baoshuu.com',
				Cookie: 'READHISTORY=1; Hm_lvt_beea64d95d9d5ffa32d7e7ad09ba18de=1601724566; Hm_lvt_5a43c3dcb5816bfec6637d7a05995393=1601077821,1603372414; Hm_lvt_65c0945a729028f2ff343d44765253f3=1603372436,1603519539; Hm_lvt_a9ca99be8ef2ddaba4a20f9804aedf7e=1601698263,1601724138,1602932152,1603519587; Hm_lvt_b923046ea768e3b4e902caf58b16fc13=1603372435,1603519539,1603801208,1604742086; Hm_lvt_367453fd44f55e3a6e99a7141f1c77d5=1603519539,1603801200,1604742027,1605010807; Hm_lvt_20e3d43a8af94081812f4fa083d50c1d=1609644004,1609727242; Hm_lvt_6d7fb6e0c01f66b2f24eaed304243e3b=1609644005,1609727242; CNZZDATA1276383317=833027924-1598060513-%7C1629325343; Hm_lvt_b13d8dae46c06e1573b8bc063cf7e6b7=1626869876,1628324474,1629117376,1629326644; ASPSESSIONIDQSTSRSQS=LGHNEAIBFFHHGENOCFGKCPKL',
			}
		}).then((res) => {
			let str = replaceStr(res.data);//解析html字符
			let all = str.match(/<div[^>]*class=([""]?)sslist\1[^>]*>*([\s\S]*?)<\/div>/ig);//正则匹配所有小说内容
			console.log(all);
			let arr = all.match(/<li[^>]*>*([\s\S]*?)<\/li>/ig);//正则匹配所有小说内容
			let books = [];
			if ( arr ) {
				for ( let i = 0; i < arr.length; i++ ) {
					let name = arr[i].match(/<h1[^>]*>*([\s\S]*?)<\/h1>/ig);
					let a = name.match(/<a[^>]*>*([\s\S]*?)<\/a>/ig);
					let desc = arr[i].match(/<p[^>]*>*([\s\S]*?)<\/p>/ig);
					let nameObj = HTMLParser(name[0])[0];//将html字符串转化为html数组
					console.log(nameObj);
					let nameText = '';
					let path = ''
					for ( let i in a ) {
						let aObj = HTMLParser(a[i])[0];//将html字符串转化为html数组
						if ( i == 1 ) {
							path = aObj.attrs.href || '';
						}
						nameText += '';
					}
					let descObj = HTMLParser(desc[0])[0];//将html字符串转化为html数组
					books.push({
						image: '/static/cover/cover_' + Math.floor(Math.random()*6 + 1) + '.png',
						name: nameText,
						author: '暂无',
						desc: descObj.children ? descObj.children[0].text : '暂无介绍',
						status: '已完结',
						path: path,
						source: tag1
					})
				}
			}
			resolve({
				code: ERR_OK,
				data: {
					list: books,
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
