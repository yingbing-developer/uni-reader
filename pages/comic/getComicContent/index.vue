<template>
	<view class="content" id="iframe-box" :prop="iframeProp" :change:prop="iframe.iframePropChange">
	</view>
</template>

<script>
	import { COMICURL } from '@/assets/js/config.js'
	let bgBox = null;
	let wv = null;
	export default {
		data () {
			return {
				url: '',
				origin: '',
				source: ''
			}
		},
		computed: {
			iframeProp () {
				return {
					url: this.url,
					origin: this.origin,
					source: this.source
				}
			}
		},
		onLoad (data) {
			this.url = data.url;
			this.origin = COMICURL[data.source].href;
			this.source = data.source;
		},
		onReady () {
			setTimeout(() => {
				let currentWebview = this.$scope.$getAppWebview();
				currentWebview.overrideUrlLoading({mode:"reject",match:'.*'}, (e)=>{
					console.log(e.url,'overrideUrlLoading');
				});
			}, 50)
		},
		methods: {
			finish (e) {
				uni.$emit('comicContent', {
					data: e.comics
				})
			}
		},
		onBackPress (event) {
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
<script lang="renderjs" module="iframe" type="module">
	let iframeDom;
	export default {
		mounted () {
			this.initDom.bind(this);
			setTimeout(() => {
				if ( this.iframeProp.url ) {
					this.createIframe();
				}
			}, 1000)
		},
		methods: {
			initDom () {
				iframeDom = iframe.init(document.getElementById('iframe-box'));
				// 观测更新的数据在 view 层可以直接访问到
				iframeDom.setOption(this.iframeProp);
			},
			createIframe () {
				//创建一个iframe元素加载漫画内容
				let iframe = document.createElement("iframe");
				let timer = null;
				iframe.src = this.iframeProp.url;
				iframe.id = 'myIframe';
				iframe.style.display = 'none';
				iframe.style.opacity = 0;
				iframe.sandbox = 'allow-scripts allow-same-origin';
				//等待iframe加载完毕
				iframe.onload = () => {
					if ( timer ) {
						window.clearTimeout(timer);
					}
					this.loadIframe();
				}
				//如果25秒后iframe还没触发onload事件，直接去获取漫画图片
				timer = window.setTimeout(() => {
					iframe.onload = null;
					this.loadIframe();
				}, 25000)
				document.getElementById("iframe-box").appendChild(iframe);
				window.setTimeout( function () {
					let child = document.getElementById('myIframe').contentWindow;
					//重构iframe的confirm alert方法，屏蔽三方网站上的弹窗行为
					child.window.alert = function () { return false; }
					child.window.confirm = function () { return false; }
					child.window.onbeforeunload = function () { return false; }
				}, 5)
			},
			loadIframe () {
				window.setTimeout( () => {
					let data = [];
					let source = this.iframeProp.source;
					if ( source == 'mangabz' ) {
						data = this.getMangabzContent();
					}
					if ( source == 'loli' ) {
						data = this.getLoliContent();
					}
					if ( source == '18comic' ) {
						data = this.get18comicContent();
					}
					if ( source == 'sixmh6' ) {
						data = this.getSixmh6Content();
					}
					if ( source == 'wnacg' ) {
						data = this.getWnacgContent();
					}
					if ( source == 'dmzj' ) {
						data = this.getDmzjContent();
					}
					// #ifndef H5
					UniViewJSBridge.publishHandler('onWxsInvokeCallMethod', {
						cid: this._$id,
						method: 'finish',
						args: {'comics': data}
					})
					// #endif
				}, 1000)
			},
			iframePropChange (newVal, oldVal) {
				if ( newVal.url != oldVal.url ) {
					if ( newVal.url ) {
						this.createIframe();
					}
				}
			},
			//获取iframe对象
			getIframeDom () {
			    return document.getElementById('myIframe').contentWindow;
			},
			//获取mangabz漫画内容
			getMangabzContent () {
				let child = this.getIframeDom();
				let doms = child.document.getElementsByClassName('lazy');
				let images = new Array(doms.length);
				for ( let i = 0; i < doms.length; i++ ) {
					images[i] = {
						path: doms[i].getAttribute('data-src')
					}
				};
				return images;
			},
			//获取写真网漫画内容
			getLoliContent () {
				let child = this.getIframeDom();
				let dom = child.document.getElementsByClassName('entry-content')[0];
				let doms = dom.getElementsByTagName('img');
				let images = new Array(doms.length);
				for ( let i = 0; i < doms.length; i++ ) {
					images[i] = {
						path: doms[i].src
					}
				};
				return images;
			},
			//获取18comic漫画内容
			get18comicContent () {
				let child = this.getIframeDom();
				let div = child.document.getElementsByClassName('row thumb-overlay-albums')[0];
				let doms = div.getElementsByClassName('lazy_img');
				let images = new Array(doms.length);
				for ( let i = 0; i < doms.length; i++ ) {
					images[i] = {
						path: doms[i].getAttribute('data-original')
					}
				};
				return images;
			},
			//获取6漫画内容
			getSixmh6Content () {
				let child = this.getIframeDom();
				let doms = child.document.getElementsByClassName('chapter-img-box');
				let images = new Array(doms.length);
				for ( let i = 0; i < doms.length; i++ ) {
					images[i] = {
						path: doms[i].getElementsByClassName('lazy')[0].getAttribute('data-original') || doms[i].getElementsByClassName('lazy')[0].src
					}
				};
				return images;
			},
			//获取绅士漫画内容
			getWnacgContent () {
				let child = this.getIframeDom();
				let head = child.document.getElementsByTagName('head')[0];
				let scripts = head.getElementsByTagName('script');
				let str = scripts[scripts.length - 1].innerHTML.match(/var imglist = *([\s\S]*?)}]/ig)[0].replace('var imglist = ', '');
				let arr = str.split('},{');
				let images = new Array(arr.length - 1);
				for ( let i = 0; i < images.length; i++ ) {
					images[i] = {
						path: 'https:' + arr[i].match(/url: fast_img_host\+\"*([\s\S]*?)\", caption:/)[1],
					}
				}
				return images;
			},
			//获取dmzj漫画内容
			getDmzjContent () {
				let child = this.getIframeDom();
				let div = child.document.getElementById('commicBox');
				let doms = div.getElementsByClassName('comic_img');
				let images = new Array(doms.length);
				for ( let i = 0; i < doms.length; i++ ) {
					images[i] = {
						path: doms[i].getAttribute('data-original') || doms[i].src
					}
				};
				return images;
			}
		}
	}
</script>

<style>
</style>
