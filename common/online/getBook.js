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
//获取小说详情信息
export function getBookInfo (data) {
	if ( data.source == tag1 ) {
		return getBaoshuuInfo(data.href);
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
				Referer: 'https://m.baoshuu.com',
				Charset: 'gb2312',//自定义字符格式
				Host: 'm.baoshuu.com',
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
						image: '/static/cover/cover_' + Math.floor(Math.random()*6 + 1) + '.png',
						name: '【' + tag.children[0].text + '】' + nameObj.children[0].text,
						author: '暂无',
						desc: desc[1] || '暂无介绍',
						status: '已完结',
						path: BOOKURL[tag1].href + nameObj.attrs.href,
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

//获取手机宝书网站的小说详情信息
function getBaoshuuInfo (href) {
	return new Promise((resolve, reject) => {
		getApp().globalData.$dom.xhr({
			type: 'GET',
			url: href
		}).then((res) => {
			if ( res.code == 200 ) {
				let str = replaceStr(res.data);//解析html字符
				let subtilte = str.match(/<div[^>]*class=([""]?)mlist\1[^>]*>*([\s\S]*?)<\/div>/);
				let name = subtilte[0].match(/<h1[^\s]>*([\s\S]*?)<\/h1>/);//正则匹配小说详情信息
				let li = subtilte[0].match(/<li[^\s]>*([\s\S]*?)<\/a>/ig);//正则匹配小说详情信息
				let author = li[0].match(/<a[^>]*>*([\s\S]*?)<\/a>/);
				let content = str.match(/<div[^>]*class=([""]?)conten\1[^>]*>*([\s\S]*?)<\/div>/);
				let readUrl = str.match(/<a[^>]*class=([""]?)left\1[^>]*>*([\s\S]*?)<\/a>/ig);
				let readUrlObj = HTMLParser(readUrl[1])[0];//将html字符串转化为html数组
				let desc = content[0].match(/<p[^>]*>*([\s\S]*?)<\/p>/)[1];
				desc = desc.replace('<span style="color: #ff0000">', '');
				desc = desc.replace('</span>', '\n');
				desc = desc.replace(/<br\/>/ig, '\n');
				let data = {
					name: name[1],
					author: author[1],
					desc: desc,
					chapters: []
				}
				setTimeout(() => {
					getBaoshuuChapters(BOOKURL[tag1].href + readUrlObj.attrs.href).then((res) => {
						console.log(res);
						resolve({
							code: ERR_OK,
							data: data
						})
					}).catch((err) => {
						resolve({
							code: ERR_OK,
							data: data
						})
					})
				}, 200)
			} else {
				reject({
					code: ERR_FALSE,
					data: {}
				})
			}
		})
	})
}

//获取手机宝书网站的小说章节
function getBaoshuuChapters (href) {
	console.log(href);
	return new Promise((resolve, reject) => {
		getApp().globalData.$dom.xhr({
			type: 'GET',
			url: href,
			options: {
				headers: {
					'Content-Type': 'text/html; charset=GB2312'
				}
			}
		}).then((res) => {
			if ( res.code == 200 ) {
				let str = replaceStr(res.data);//解析html字符
				console.log(str);
				let div = str.match(/<div[^>]*id=([""]?)gobottom\1[^>]*>*([\s\S]*?)<\/div>/);
				console.log(div);
				resolve([])
			} else {
				reject([])
			}
		})
	})
}
