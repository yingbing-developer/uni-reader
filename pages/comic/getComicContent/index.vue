<template>
	<view class="content" :style="{'background-color': skinColor.bgColor}">
		<web-view @message="handlePostMessage" :src="src" :webview-styles="webviewStyles"></web-view>
	</view>
</template>

<script>
	import { COMICURL } from '@/common/js/config.js'
	import { skinMixin } from '@/common/mixin/index.js'
	export default {
		mixins: [skinMixin],
		data () {
			return {
				url: '/hybrid/html/comic.html',
				src: '',
				webviewStyles: {
				    progress: false
				}
			}
		},
		onLoad (data) {
			this.src = `${this.url}?url=${COMICURL[data.source] + data.url}&source=${data.source}`;
		},
		onReady () {
			let currentWebview = this.$scope.$getAppWebview() //此对象相当于html5plus里的plus.webview.currentWebview()。在uni-app里vue页面直接使用plus.webview.currentWebview()无效，非v3编译模式使用this.$mp.page.$getAppWebview()
			setTimeout(function() {
				let wv = currentWebview.children()[0]
				wv.hide();
			}, 100);
		},
		methods: {
			//获取得到的漫画内容
			handlePostMessage (e) {
				uni.$emit('comicContent', {
					data: e.detail.data[0]
				})
			}
		},
		onBackPress (event) {
			//判断是否是手动返回，如果是需要返回两层
			if ( event.from == 'backbutton' ) {
				getApp().globalData.routeBack(2);
				return true
			}
			return false
		},
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
