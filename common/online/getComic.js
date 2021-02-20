import http from '@/common/request'
import { COMICURL, ERR_OK, ERR_FALSE } from '@/common/js/config.js'
import HTMLParser from '@/common/js/html-parse.js'

//获取漫画列表
export function getComic (data) {
	const mangaBz = getMangabz(data);
	return Promise.all([
	    mangaBz
	])
}
//获取漫画章节
export function getComicNum (data) {
	if ( data.source == 'mangabz' ) {
		return getMangabzNum(data.href);
	}
}
//获取漫画详情信息
export function getComicDetail (data) {
	if ( data.source == 'mangabz' ) {
		return getMangabzDetail(data.href);
	}
}




//获取mangaBz网站的漫画列表
function getMangabz (data) {
	return new Promise((resolve, reject) => {
		http.get(COMICURL['mangabz'] + '/search', data).then((res) => {
			let str = JSON.stringify(res.data);//将获得的html转化为字符串
			str = str.replace(/\\/g,'');//替换无关的斜杠
			let arr = str.match(/<a[^>]*class=([""]?)manga-item\1[^>]*>*([\s\S]*?)<\/a>/ig);//正则匹配所有漫画标签内容
			let comic = [];
			if ( arr ) {
				for ( let i = 0; i < arr.length; i++ ) {
					let obj = HTMLParser(arr[i])[0];//将html字符串转化为html数组
					comic.push({
						image: obj.children[1] ? obj.children[1].attrs.src : '',
						name: obj.children[3].children ? obj.children[3].children[0].text : '暂无',
						author: obj.children[5].children ? obj.children[5].children[0].text : '暂无',
						intro: obj.children[9].children ? obj.children[9].children[0].text : '暂无',
						path: obj.attrs ? obj.attrs.href : '',
						source: 'mangabz'
					})
				}
			}
			let response = {
				code: ERR_OK,
				data: comic
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
}

//获取mangaBz网站的漫画章节
function getMangabzNum (href) {
	return new Promise((resolve, reject) => {
		http.get(COMICURL['mangabz'] + href).then((res) => {
			let str = JSON.stringify(res.data);//将获得的html转化为字符串
			str = str.replace(/\\/g,'');//替换无关的斜杠
			let arr = str.match(/<div[^>]*class=([""]?)detail-list-item\1[^>]*>*([\s\S]*?)<\/div>/ig);//正则匹配漫画全部章节
			let nums = [];
			if ( arr ) {
				for ( let i = 0; i < arr.length; i++ ) {
					let obj = HTMLParser(arr[i])[0];//将html字符串转化为html数组
					nums.push({
						path: obj.children ? obj.children[0].attrs.href : '',
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
}

//获取mangaBz网站的漫画详情信息
function getMangabzDetail (href) {
	return new Promise((resolve, reject) => {
		http.get(COMICURL['mangabz'] + href).then((res) => {
			let str = JSON.stringify(res.data);//将获得的html转化为字符串
			str = str.replace(/\\/g,'');//替换无关的斜杠
			let subtitle = str.match(/<p[^>]*class=([""]?)detail-main-subtitle\1[^>]*>*([\s\S]*?)<\/p>/ig);//正则匹配漫画详情信息
			let strs = subtitle[0].match(/<span[^\s]>*([\s\S]*?)<\/span>/ig);//正则匹配漫画作者和类型
			let author = '';
			let subject = '';
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