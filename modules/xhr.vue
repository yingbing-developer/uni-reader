<template>
	<view class="getInfo" id="get-book-info" :prop="bookInfoProp" :change:prop="bookInfo.bookInfoChange"></view>
</template>

<script>
	export default {
		data () {
			return {
				type: '',
				url: '',
				options: ''
			}
		},
		computed: {
			bookInfoProp () {
				return {
					type: this.type,
					url: this.url,
					options: this.options || {}
				}
			}
		},
		onLoad (data) {
			this.type = data.type;
			this.url = decodeURIComponent(data.url);
			this.options = data.options ? JSON.parse(decodeURIComponent(data.options)) : {};
		},
		methods: {
			finish (e) {
				uni.$emit('xhr-btn', {
					status: e.status,
					data: e.response
				})
			}
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
			meta.content = 'text/html; charset=UTF-8';
			document.body.appendChild(meta);
			this.httpRequest();
		},
		methods: {
			initDom () {
				bookInfoDom = bookInfo.init(document.getElementById('get-book-info'));
				// 观测更新的数据在 view 层可以直接访问到
				bookInfoDom.setOption(this.bookInfoProp);
			},
			httpRequest () {
				const http = new XMLHttpRequest();
				const url = this.bookInfoProp.url;
				const type = this.bookInfoProp.type;
				const headers = this.bookInfoProp.options.headers || '';
				if ( headers ) {
					for ( let i in headers ) {
						http.setRequestHeader(i, headers[i]);
					}
				}
				http.open('GET', url);
				http.send();
				http.onreadystatechange = (e) => {
					if ( http.status == 200 ) {
						const args = {status: http.status, 'response': http.responseText}
						this.resolve(args);
					} else {
						const args = {status: http.status, 'response': ''}
						this.resolve(args);
					}
				}
			},
			resolve (args) {
				// #ifndef H5
				UniViewJSBridge.publishHandler('onWxsInvokeCallMethod', {
					cid: this._$id,
					method: 'finish',
					args: args
				})
				// #endif
				// #ifdef H5
				this.finish(args);
				// #endif
			},
			bookInfoChange () {
				
			}
		}
	}
</script>

<style>
</style>
