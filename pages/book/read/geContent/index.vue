<template>
	<view class="getInfo" :id="'get-book-info' + dataId" :prop="bookInfoProp" :change:prop="bookInfo.bookInfoChange"></view>
</template>

<script>
	export default {
		data () {
			return {
				xhrs: ''
			}
		},
		computed: {
			bookInfoProp () {
				return {
					xhrs: this.xhrs,
					dataId: this.dataId
				}
			},
			dataId () {
				let mydate = new Date();
				return 'cms' + mydate.getMinutes() + mydate.getSeconds() + mydate.getMilliseconds() + Math.round(Math.random() * 10000);
			}
		},
		created () {
			getApp().globalData.$http.get('https://images.dmzj.com/img/webpic/0/1051440001626095757.jpg', {
				// responseType: 'arraybuffer',
				headers: {
					'Referer': 'https://www.dmzj.com/',
					'Host': 'images.dmzj.com',
					'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML,like Gecko) Chrome/65.0.3325.181 Safari/537.36',
					'Content-Type': 'Charset=gbk'
				}
			}).then((res) => {
				console.log(res);
			})
		},
		methods: {
			get (data) {
				this.xhrs = data || {};
			},
			finish (e) {
				let data = [];
				if ( this.xhrs[0].source == 'baoshuu' ) {
					data = this.getBaoshuuContent(e);
				}
				uni.$emit('book-content-btn', data)
			},
			getBaoshuuContent (res) {
				let contents = [];
				for ( let i in res ) {
					if ( res[i].code == 200 ) {
						let str = this.$utils.replaceStr(res[i].data);
						let content = str.match(/<span[^>]*id=([""]?)Content\1[^>]*>*([\s\S]*?)<\/span>/);//正则匹配所有小说内容
						let unstr = content[2].match(/<font[^>]*>*([\s\S]*?)<\/font>/);//正则匹配所有小说内容
						content = content[2].replace(unstr[0], '');
						content = content.replace('</font>', '');
						content = content.replace(/<br \/>/ig, '\n');
						content = content.replace(/<br>/ig, '\n');
						contents.push({
							chapter: this.xhrs[i].chapter,
							content: content,
							isEnd: this.xhrs[i].isEnd
						})
					}
				}
				return contents;
			}
		},
		onBackPress (event) {
			if ( event.from == 'backbutton' ) {
				this.finish({code: 402, data: '', delta: 2});
				return true
			}
			return false
		}
	}
</script>

<script lang="renderjs" module="bookInfo" type="module">
	let bookInfoDom;
	export default {
		mounted () {
			this.initDom.bind(this);
			let meta = document.createElement('meta');
			meta['http-equiv'] = 'Content-Type';
			meta.content = 'text/html; charset=GB2312';
			document.body.appendChild(meta);
			// let xhr = new plus.net.XMLHttpRequest();
			// xhr.onreadystatechange = function () {
			// 	switch ( xhr.readyState ) {
			// 		case 0:
			// 			console.log( "xhr请求已初始化" );
			// 		break;
			// 		case 1:
			// 			console.log( "xhr请求已打开" );
			// 		break;
			// 		case 2:
			// 			console.log( "xhr请求已发送" );
			// 		break;
			// 		case 3:
			// 			console.log( "xhr请求已响应");
			// 			break;
			// 		case 4:
			// 			if ( xhr.status == 200 ) {
			// 				console.log(xhr.responseText);
			// 				console.log(new Uint8Array(xhr.response).reduce((data, byte) => data + String.fromCharCode(byte), ''));
			// 				console.log('data:image/png;base64,' + btoa(new Uint8Array(xhr.responseText).reduce((data, byte) => data + String.fromCharCode(byte), '')));
			// 				// console.log( "xhr请求成功："+ window.URL.createObjectURL(xhr.responseText));
			// 				// console.log(xhr.getAllResponseHeaders());
			// 				// let reader = new FileReader();
			// 				// reader.readAsDataURL(xhr.response)
			// 				// let dataURL = reader.result
			// 			} else {
			// 				console.log( "xhr请求失败："+xhr.readyState );
			// 			}
			// 			break;
			// 		default :
			// 			break;
			// 	}
			// }
			// xhr.responseType = 'arraybuffer';
			// xhr.open( "GET", "https://images.dmzj.com/img/webpic/0/1051440001626095757.jpg");
			// xhr.responseType = 'arraybuffer';
			// xhr.setRequestHeader('Referer', 'https://www.dmzj.com/');
			// xhr.setRequestHeader('Host', 'images.dmzj.com');
			// xhr.setRequestHeader('Content-Type', 'application/json');
			// xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML,like Gecko) Chrome/65.0.3325.181 Safari/537.36');
			// xhr.send();
		},
		methods: {
			initDom () {
				bookInfoDom = bookInfo.init(document.getElementById('get-book-info' + this.bookInfoProp.dataId));
				// 观测更新的数据在 view 层可以直接访问到
				bookInfoDom.setOption(this.bookInfoProp);
			},
			httpRequest ( data = {} ) {
				return new Promise((resolve) => {
					let http = new XMLHttpRequest();
					const headers = data.options?.headers || '';
					const params = data.options?.params || '';
					let formData = new FormData();
					http.addEventListener('load', (e) => {
						if ( http.status == 200 ) {
							const args = {code: http.status, data: http.response}
							resolve(args);
						} else {
							const args = {code: http.status, data: ''}
							resolve(args);
						}
						http.abort();
						http = '';
					});
					http.addEventListener('error', (e) => {
						const args = {code: 400, data: ''};
						resolve(args);
						http.abort();
						http = '';
					});
					http.addEventListener('timeout', (e) => {
						const args = {code: 401, data: ''}
						resolve(args);
						http.abort();
						http = '';
					});
					http.open(data.type || 'GET', data.url);
					if ( headers ) {
						for ( let i in headers ) {
							http.setRequestHeader(i, headers[i]);
						}
					}
					if ( params ) {
						for ( let i in params ) {
							formData.append(i, params[i]);
						}
					}
					http.send(formData);
				})
			},
			resolve (args) {
				// #ifndef H5
				setTimeout(() => {
					UniViewJSBridge.publishHandler('onWxsInvokeCallMethod', {
						cid: this._$id,
						method: 'finish',
						args: args
					})
				}, 1000)
				// #endif
				// #ifdef H5
				setTimeout(() => {
					this.finish(args);
				}, 1000)
				// #endif
			},
			bookInfoChange (newVal, oldVal) {
				if ( newVal.xhrs != oldVal.xhrs ) {
					if ( Object.prototype.toString.call(this.bookInfoProp.xhrs) === '[object Array]' ) {
						let arr = [];
						for ( let i in this.bookInfoProp.xhrs ) {
							arr.push(this.httpRequest(this.bookInfoProp.xhrs[i]))
						}
						Promise.all(arr).then((res) => {
							this.resolve(res);
						})
					} else {
						this.httpRequest(this.bookInfoProp.xhrs).then((res) => {
							this.resolve(res);
						})
					}
				}
			}
		}
	}
</script>

<style scoped>
	.getInfo {
		display: none;
		position: relative;
		z-index: -1;
	}
</style>
