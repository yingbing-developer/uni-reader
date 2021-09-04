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
