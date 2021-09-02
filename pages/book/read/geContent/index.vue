<template>
	<view class="content" :id="'iframe-box' + dataId" :prop="iframeProp" :change:prop="iframe.iframePropChange">
	</view>
</template>

<script>
	import { BOOKURL } from '@/assets/js/config.js'
	export default {
		props: {
			dataId: {
				type: String,
				default () {
					let mydate = new Date();
					return 'cms' + mydate.getMinutes() + mydate.getSeconds() + mydate.getMilliseconds() + Math.round(Math.random() * 10000);
				}
			},
			data: {
				type: Object,
				default () {
					return new Object;
				}
			}
		},
		computed: {
			iframeProp () {
				return {
					dataId: this.dataId,
					url: this.data.url || '',
					origin: this.data.source ? BOOKURL[this.data.source].href : '',
					source: this.data.source || ''
				}
			}
		},
		mounted () {
			setTimeout(() => {
				let currentWebview = this.$scope.$getAppWebview();
				currentWebview.overrideUrlLoading({mode:"reject",match:'.*'}, (e)=>{
					console.log(e.url,'overrideUrlLoading');
				});
			}, 50)
		},
		methods: {
			finish (e) {
				this.$emit('finish', e)
			}
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
				iframeDom = iframe.init(document.getElementById('iframe-box' + this.iframeProp.dataId));
				// 观测更新的数据在 view 层可以直接访问到
				iframeDom.setOption(this.iframeProp);
			},
			createIframe () {
				//创建一个iframe元素加载漫画内容
				let iframe = document.createElement("iframe");
				let timer = null;
				iframe.src = this.iframeProp.url;
				iframe.id = 'myIframe' + this.iframeProp.dataId;
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
				//如果25秒后iframe还没触发onload事件，直接去获取小说内容
				timer = window.setTimeout(() => {
					iframe.onload = null;
					this.loadIframe();
				}, 25000)
				document.getElementById("iframe-box" + this.iframeProp.dataId).appendChild(iframe);
				window.setTimeout( function () {
					let child = document.getElementById('myIframe' + this.iframeProp.dataId).contentWindow;
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
					if ( source == 'baoshuu' ) {
						data = this.getBaoshuuContent();
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
			    return document.getElementById('myIframe' + this.iframeProp.dataId).contentWindow;
			},
			//获取mangabz漫画内容
			getBaoshuuContent () {
				let child = this.getIframeDom();
				console.log(child)
			}
		}
	}
</script>

<style>
</style>
