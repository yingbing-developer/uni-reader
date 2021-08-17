<template>
	<view class="content">
		<web-view @message="handlePostMessage" :src="src" :webview-styles="webviewStyles"></web-view>
	</view>
</template>

<script>
	import { COMICURL } from '@/common/js/config.js'
	import { skinMixin } from '@/common/mixin/index.js'
	let bgBox = null;
	let wv = null;
	export default {
		mixins: [skinMixin],
		data () {
			return {
				url: '/hybrid/html/comic.html',
				src: '',
				webviewStyles: {
				    progress: false
				},
				source: '',
				tags: ['mhhanman']
			}
		},
		onLoad (data) {
			this.src = `${this.url}?url=${encodeURIComponent(data.url)}&origin=${encodeURIComponent(COMICURL[data.source].href)}&source=${data.source}&color=${encodeURIComponent(this.skinColor.bgColor)}`;
			// this.src = COMICURL[data.source].href + data.url;
			// this.source = data.source;
		},
		onReady () {
			setTimeout(() => {
				let currentWebview = this.$scope.$getAppWebview();
				wv = currentWebview.children()[0];
				wv.overrideUrlLoading({mode:"reject",match:'.*'}, (e)=>{
					console.log(e.url,'overrideUrlLoading');
				});
			}, 50)
			// setTimeout(() => {
			// 	this.webShow = true;
			// 	let currentWebview = this.$scope.$getAppWebview() //此对象相当于html5plus里的plus.webview.currentWebview()。在uni-app里vue页面直接使用plus.webview.currentWebview()无效，非v3编译模式使用this.$mp.page.$getAppWebview()
			// 	setTimeout(() => {
			// 		let wv = currentWebview.children()[0];
			// 		let globalJS = `
			// 			var script = document.createElement("script");
			// 			script.type = "text/javascript";
			// 			script.src = 'https://js.cdn.aliyun.dcloud.net.cn/dev/uni-app/uni.webview.1.5.2.js';
			// 			script.onload = function () {
			// 				window.setTimeout(function () {
			// 					var data = getContent();
			// 					uni.postMessage({
			// 					    data: data
			// 					});
			// 				}, 1000)
			// 			}
			// 			document.getElementsByTagName('head')[0].appendChild(script);
			// 		`;
			// 		let mangabz = `
			// 			function getContent () {
			// 				var doms = document.getElementsByClassName('lazy');
			// 				var images = new Array(doms.length);
			// 				for ( var i = 0; i < doms.length; i++ ) {
			// 					images[i] = {
			// 						path: doms[i].getAttribute('data-src')
			// 					}
			// 				};
			// 				return images;
			// 			}
			// 		`;
			// 		let actionJs = {
			// 			'mangabz': mangabz
			// 		}
			// 		wv.evalJS(actionJs[this.source] + globalJS);
			// 	}, 2000);
			// }, 50)
		},
		methods: {
			//获取得到的漫画内容
			handlePostMessage (e) {
				uni.$emit('comicContent', {
					data: e.detail.data[0]
				})
			}
		},
		onUnload () {
			if ( wv ) {
				wv.back();
				wv.hide();
			}
		},
		onBackPress (event) {
			//判断是否是手动返回，如果是需要返回两层
			if ( wv ) {
				wv.back();
				wv.hide();
			}
			if ( event.from == 'backbutton' ) {
				let size = plus.screen.getCurrentSize();
				//横屏
				if ( size.width > size.height ) {
					//退出前锁定为竖屏
					plus.screen.lockOrientation('portrait-primary');
				}
				getApp().globalData.$Router.back(2);
				return true
			}
			return false
		}
	}
</script>

<style>
	.content {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}
</style>
