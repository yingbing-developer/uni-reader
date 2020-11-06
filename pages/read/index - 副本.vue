<template>
	<view class="read" :style="{'background-color': skinColor.readBackColor, filter: 'brightness(' + light + '%)'}">
		
		<!-- renderjs模块 -->
		<view :prop="domProp" :change:prop="dom.readChange" id="dom"></view>
		
		<view id="readTop" class="read-top" :style="{color: skinColor.readTextColor, 'background-color': skinColor.readBackColor}">
			<gap-bar></gap-bar>
			<view class="read-top-line">
				<text class="read-top-text" style="width: 80%;">{{bookInfo.name}}</text>
				<text class="read-top-text">{{progress}}%</text>
			</view>
		</view>
		
		<!-- 顶部间隔 -->
		<view id="gapBar"></view>
		
		<!-- 文本内容区域 -->
		<view class="box-view">
			<view
			:class="{'noWrap': readMode.scroll == 'paging'}"
			id="contentBox"
			:style="{
			'font-size': fontSize + 'px',
			'line-height': (fontSize + 10) + 'px',
			color: skinColor.readTextColor}">
			</view>
		</view>
		
		<!-- 触摸区域 -->
		<view class="touch-box touch-prev" v-if="scrollMode == 'paging'">
			上一页
		</view>
		<view class="touch-box touch-menu" @tap="openSettingNvue">
			菜单
		</view>
		<view class="touch-box touch-next" v-if="scrollMode == 'paging'">
			下一页
		</view>
	</view>
</template>

<script>
	import { mapGetters, mapMutations } from 'vuex'
	import { skinMixin } from '@/common/mixin/index.js'
	import { indexOf } from '@/common/js/util.js'
	import NavBar from '@/components/nav-bar/nav-bar.nvue'
	import GapBar from '@/components/nav-bar/nav-bar.nvue'
	export default {
		mixins: [skinMixin],
		data () {
			return {
				//设置窗口是否打开
				settingShow: false,
				catalog: [],
				markTitle: ''
			}
		},
		computed: {
			...mapGetters(['readMode', 'bookList']),
			//书籍信息
			bookInfo () {
				const pages = getCurrentPages();
				const page = pages[pages.length - 1];
				let index =  page.options.index;
				return this.bookList[index];
			},
			//文件路径
			path () {
				return this.bookInfo.path;
			},
			//滚动方式
			scrollMode () {
				return this.readMode.scroll;
			},
			fontSize () {
				return this.readMode.fontSize;
			},
			domProp () {
				return {
					fontSize: this.readMode.fontSize,
					scrollMode: this.readMode.scroll,
					record: this.bookInfo.record,
					path: this.path
				};
			},
			progress () {
				if ( this.bookInfo.record == 0 ) {
					return 0
				} else {
					return parseFloat(((this.bookInfo.record / this.bookInfo.length) * 100).toFixed(2))
				}
			},
			light () {
				return (100 - ((1 - this.readMode.light) * 50)).toFixed(2);
			}
		},
		created () {
			this.updateBookReadTime(this.path);
			
			//监听原生子窗体显示
			uni.$on('setting-isShow', (data) => {
				this.settingShow = data.show;
			})
		},
		methods: {
			...mapMutations(['updateBookReadStatus', 'updateBookLength', 'updateBookReadTime', 'updateBookRecord']),
			//更新阅读记录
			updateRecord (e) {
				this.updateBookRecord({
					path: this.path,
					record: e.record
				});
			},
			//更新阅读状态
			updateReadStatus (e) {
				this.updateBookReadStatus({
					path: this.path,
					isReaded: e.status
				});
			},
			//填充章节目录
			setCatalog (e) {
				this.catalog = e.catalog;
			},
			//设置文本总长度
			updatetLength (e) {
				this.updateBookLength({
					path: this.path,
					length: e.length
				})
			},
			//设置书签的前50个字
			setMarkTitle (e) {
				this.markTitle = e.title;
				uni.$emit('setting-mark', {
					markTitle: this.markTitle
				})
			},
			//打开设置子窗体
			openSettingNvue () {
				const subNvue = uni.getSubNVueById('setting');
				
				//向子窗体传值
				uni.$emit('setting-popup', {  
					path: this.path,
				    markTitle: this.markTitle,
				    catalog: this.catalog
				});
				
				// 打开 nvue 子窗体 
				subNvue.show();
			}
		},
		beforeDestroy () {
			//注销监听原生子窗体是否显示
			uni.$off('setting-isShow');
		},
		onBackPress (event) {
			if ( event.from == 'backbutton' ) {
				if ( this.settingShow ) {
					uni.$emit('setting-hide');
					return true;
				}
			}
			return false;
		},
		components: {
			GapBar,
			NavBar
		}
	}
</script>
<script lang="renderjs" module="dom">
	let myDom
	export default {
		data () {
			return {
				//每页内容的全部文字
				bookContent: '',
				//行数的倍数的容器高度
				viewHeight: 0,
				//当前页文字的开始和结束位置
				nowIndex: [0,0]
			}
		},
		mounted () {
			this.initDom.bind(this);
			this.initMonitor();
			this.initView();
			plus.nativeUI.showWaiting("读取文本中..")
			setTimeout(() => {
				this.getContent();
			}, 400)
			window.οnresize= () => {  
				this.initView();
				setTimeout(() => {
					this.setNowPage();
				}, 50)
			} 
			// window.onscroll = () => {
			// 	//为了保证兼容性，这里取两个值，哪个有值取哪一个
			// 	//scrollTop就是触发滚轮事件时滚轮的高度
			// 	let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
			// 	let scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
			// 	let clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
			// 	if ( scrollHeight - scrollTop == clientHeight ) {
			// 		console.log('到达底部');
			// 	}
			// 	if ( scrollTop == 0 ) {
			// 		console.log('到达顶部');
			// 	}
			// 	UniViewJSBridge.publishHandler('onWxsInvokeCallMethod', {
			// 		cid: this._$id,
			// 		method: 'updateProgress',
			// 		args: {'scrollTop': scrollTop}
			// 	})
			// }
		},
		methods: {
			//初始化监听
			initMonitor () {
				//上一页
				document.getElementsByClassName('touch-prev')[0].addEventListener('click', () => {
					if ( this.nowIndex[0] > 0 ) {
						this.setPrevPage();
					} else {
						plus.nativeUI.toast("已经是最前面了", {verticalAlign: 'center'});
					}
				})
				//下一页
				document.getElementsByClassName('touch-next')[0].addEventListener('click', () => {
					if ( this.nowIndex[1] < this.bookContent.length ) {
						this.updateRecord(this.nowIndex[1]);
					} else {
						plus.nativeUI.toast("已经是最后面了", {verticalAlign: 'center'});
					}
				})
			},
			//初始化数据
			initDom() {
				myDom = dom.init(document.getElementById('dom'));
				// 观测更新的数据在 view 层可以直接访问到
				myDom.setOption(this.domProp);
			},
			getContent () {
				
				//获取内容 正式用
				let ReadTxt = plus.android.importClass('com.itstudy.io.GetText');
				let readTxt = new ReadTxt();
				this.bookContent = readTxt.getTextFromText(plus.io.convertLocalFileSystemURL(this.domProp.path));
				plus.nativeUI.closeWaiting();
				this.updateLength();
				this.nowIndex[0] = this.domProp.record;
				this.setNowPage();
				this.getCatalog();
				
				//获取内容 调试用
				// plus.io.resolveLocalFileSystemURL('file://' + this.domProp.path, ( entry ) => {
				// 	entry.file( ( file ) => {
				// 		let reader = new plus.io.FileReader();
				// 		reader.onloadend = ( e ) => {
				// 			plus.nativeUI.closeWaiting();
				// 			this.bookContent = e.target.result;
				// 			this.updateLength();
				// 			this.nowIndex[0] = this.domProp.record;
				// 			this.setNowPage();
				// 			this.getCatalog();
				// 		};
				// 		reader.readAsText( file, 'gb2312' );
				// 	}, ( fail ) => {
				// 		console.log("Request file system failed: " + fail.message);
				// 	});
				// }, ( fail ) => {
				// 	console.log( "Request file system failed: " + fail.message );
				// });
			},
			//获取章节目录
			getCatalog () {
				const reg = new RegExp(/(第?[一二两三四五六七八九十○零百千万亿0-9１２３４５６７８９０]{1,6}[章回卷节折篇幕集部]?[.\s][^\n]*)[_,-]?/g);
				let match = '';
				let catalog = [];
				while ((match = reg.exec(this.bookContent)) != null) {
					catalog.push({
						title: match[0],
						index: match.index
					})
				}
				UniViewJSBridge.publishHandler('onWxsInvokeCallMethod', {
					cid: this._$id,
					method: 'setCatalog',
					args: {'catalog': catalog}
				})
			},
			//设置当前页/下页内容
			setNowPage () {
				this.updateReadStatus(false);
				//截取内容
				let text = this.bookContent.substr(this.nowIndex[0], 1500);
				//创建新的文本容器，插入节点中
				const box = this.createContent();
				const contentBox = document.getElementById('contentBox');
				contentBox.appendChild(box);
				const contents = document.getElementsByClassName('content');
				//如果为翻页模式移除原本的内容
				if ( this.domProp.scrollMode == 'paging' && contents.length > 1 ) {
					contentBox.removeChild(contents[0])
				}
				
				//获取新插入的文本容器
				const content = contents[contents.length - 1];
				let len = text.length % 20 > 0 ? parseInt(text.length / 20) + 1 : parseInt(text.length / 20);
				//打断循环
				let isBreak = false;
				//每次添加20个字符
				for ( let i = 0; i < len; i++ ) {
					content.textContent += text.substring(i * 20, (i + 1) * 20);
					//文本高度超过规定高度
					if ( content.offsetHeight > this.viewHeight ) {
						len = content.textContent.length;
						//文本每次减去最后一个字符
						for ( let j = 0; j < len; j++ ) {
							content.textContent = content.textContent.substr(0, content.textContent.length-1);
							//文本高度等于规定高度，结束循环
							if ( content.offsetHeight == this.viewHeight ) {
								//当前页内容最后的位置
								this.nowIndex[1] = this.nowIndex[0] + content.textContent.length;
								//通知外层循环中断
								isBreak = true;
								break;
							}
						}
					} else {
						//如果文本遍历完了，但文本高度没有超过容器高度则表示这是最后一页
						if ( i == len - 1 ) {
							this.nowIndex[1] = this.nowIndex[0] + text.length;
							this.updateReadStatus(true);
						}
					}
					if ( isBreak ) {
						break;
					}
				}
				this.setMarkTitle();
			},
			//设置上一页内容
			setPrevPage () {
				this.updateReadStatus(false);
				
				//将内容的开始位置变为结束位置
				this.nowIndex[1] = this.nowIndex[0];
				
				//截取结束位置前1500个字，如果没有1500个字，则截取到首位
				let index = this.nowIndex[1] - 1500 > 0 ? this.nowIndex[1] - 1500 : 0;
				let text = this.bookContent.substring(index, this.nowIndex[1]);
				
				//创建新的文本容器
				const box = this.createContent();
				const contentBox = document.getElementById('contentBox');
				let content = document.getElementsByClassName('content')[0];
				//插入当前文本的前方
				contentBox.insertBefore(box, content);
				
				//如果为翻页模式，则移除当前的文本容器
				if ( this.domProp.scrollMode == 'paging' ) {
					contentBox.removeChild(content);
					content = document.getElementsByClassName('content')[0];
				}
				
				//遍历截取的文本内容，从文本的末尾开始循环放入新建的文本容器
				let len = text.length % 20 > 0 ? parseInt(text.length / 20) + 1 : parseInt(text.length / 20);
				//打断循环
				let isBreak = false;
				for ( let i = 0; i < len; i++) {
					//每次从最后面添加20个字符
					content.textContent = text.substr(-(i + 1) * 20, 20) + content.textContent;
					if ( content.offsetHeight > this.viewHeight ) {
						len = content.textContent.length;
						//文本每次减去最前面的一个字符
						for ( let j = 0; j < len; j++ ) {
							content.textContent = content.textContent.substr(1);
							//文本高度等于规定高度，结束循环
							if ( content.offsetHeight == this.viewHeight ) {
								//更新当前页内容的初始位置
								this.nowIndex[0] = this.nowIndex[1] - content.textContent.length > 0 ? this.nowIndex[1] - content.textContent.length : 0;
								//通知外层循环中断
								isBreak = true;
								break;
							}
						}
					} else {
						//如果文本遍历完后文本高度还是小于等于规定的高度, 这是第一页, 则请求新的文本补全整个页面
						if ( i == len - 1 ) {
							this.nowIndex[0] = 0;
						}
					}
					if ( isBreak ) {
						break;
					}
				}
				this.updateRecord(this.nowIndex[0]);
				this.setMarkTitle();
			},
			//阅读设置改变
			readChange (newVal, oldVal) {
				//字体改变
				if ( newVal.fontSize != oldVal.fontSize ) {
					this.fontChange(newVal.fontSize, oldVal.fontSize);
				}
				//翻页方式改变
				if ( newVal.scrollMode != oldVal.scrollMode ) {
					this.scrollModeChange(newVal.scrollMode, oldVal.scrollMode)
				}
				//阅读位置改变
				if ( newVal.record != oldVal.record ) {
					this.recordChange(newVal.record, oldVal.record)
				}
			},
			//字体改变
			fontChange (newVal, oldVal) {
				const content = document.getElementsByClassName('content')[0];
				this.initLine();
				clearTimeout(this.timer);
				this.timer = setTimeout(() => {
					//字体变大
					if ( oldVal < newVal ) {
						//如果文本高度没有超过规定高度则不操作
						if ( content.offsetHeight <= this.viewHeight ) {
							return;
						}
						let len = content.textContent.length;
						for ( let i = 0; i < len; i++ ) {
							content.textContent = content.textContent.substr(0, content.textContent.length - 1);
							if ( content.offsetHeight <= this.viewHeight ) {
								this.nowIndex[1] = this.nowIndex[0] + content.textContent.length;
								break;
							}
						}
					} else {
						//字体变小
						//如果已经是最后面了则不操作
						if ( this.nowIndex[1] >= this.bookContent.length ) {
							return;
						}
						let text = this.bookContent.substr(this.nowIndex[1], 400);
						let isBreak = false;
						//遍历截取的文本内容，从文本的末尾开始循环放入新建的文本容器
						let len = text.length % 20 > 0 ? parseInt(text.length / 20) + 1 : parseInt(text.length / 20);
						for ( let i = 0; i < len; i++ ) {
							content.textContent += text.substring(i * 20, (i + 1) * 20);
							//文本高度超过规定高度
							if ( content.offsetHeight > this.viewHeight ) {
								len = content.textContent.length;
								//文本每次减去最后一个字符
								for ( let j = 0; j < len; j++ ) {
									content.textContent = content.textContent.substr(0, content.textContent.length-1);
									//文本高度等于规定高度，结束循环
									if ( content.offsetHeight == this.viewHeight ) {
										//当前页内容最后的位置
										this.nowIndex[1] = this.nowIndex[0] + content.textContent.length;
										//通知外层循环中断
										isBreak = true;
										break;
									}
								}
							}
							if ( isBreak ) {
								break;
							}
						}
					}
				}, 50)
			},
			//翻页模式改变
			scrollModeChange (newVal, oldVal) {
			},
			//阅读记录改变
			recordChange (newVal, oldVal) {
				this.nowIndex[0] = newVal;
				this.setNowPage();
			},
			//初始化容器
			initView () {
				const top = document.getElementById('readTop');
				const gap = document.getElementById('gapBar');
				const contentBox = document.getElementById('contentBox');
				this.initLine();
				//设置顶部间隔高度
				gap.style.height = top.offsetHeight + 'px';
			},
			//设置行高和规定高度
			initLine () {
				const top = document.getElementById('readTop');
				let lineHeight = this.domProp.fontSize + 10;
				let windowHeight = document.body.offsetHeight || window.innerHeight;
				this.viewHeight = parseInt((windowHeight - top.offsetHeight) / lineHeight) * lineHeight;
			},
			createContent() {
				const dom = document.createElement('text');
				dom.style.whiteSpace = 'pre-wrap';
				dom.style.wordBreak = 'break-all';
				dom.style.wordWrap = 'break-word';
				dom.style.width = '100%';
				dom.style.display = 'inline-block';
				dom.setAttribute('class', 'content');
				return dom;
			},
			//更新阅读记录
			updateRecord (record) {
				UniViewJSBridge.publishHandler('onWxsInvokeCallMethod', {
					cid: this._$id,
					method: 'updateRecord',
					args: {'record': record}
				})
			},
			//更新阅读状态
			updateReadStatus (status) {
				UniViewJSBridge.publishHandler('onWxsInvokeCallMethod', {
					cid: this._$id,
					method: 'updateReadStatus',
					args: {'status': status}
				})
			},
			//更新文本总长度
			updateLength () {
				UniViewJSBridge.publishHandler('onWxsInvokeCallMethod', {
					cid: this._$id,
					method: 'updatetLength',
					args: {'length': this.bookContent.length}
				})
			},
			//设置标签的前50个字
			setMarkTitle () {
				const title = document.getElementsByClassName('content')[0].textContent;
				UniViewJSBridge.publishHandler('onWxsInvokeCallMethod', {
					cid: this._$id,
					method: 'setMarkTitle',
					args: {'title': title.substr(0, 50)}
				})
			}
		}
	}
</script>

<style scoped>
	.read {
		min-height: 100vh;
		font-family: '微软雅黑';
		padding: 0 20rpx;
		box-sizing: border-box;
	}
	.read-top {
		font-size: 14px;
		position: fixed;
		top: 0;
		left: 20rpx;
		right: 20rpx;
	}
	.read-top-line {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.read-top-text {
		font-size: 22rpx;
		white-space:nowrap;/* 规定文本是否折行 */  
		overflow: hidden;/* 规定超出内容宽度的元素隐藏 */
		text-overflow: ellipsis;
	}
	.box-view {
		overflow-x: hidden;
	}
	.noWrap {
		white-space: nowrap;
	}
	.touch-box  {
		display: flex;
		align-items: center;
		justify-content: center;
		position: fixed;
		top: 50%;
		transform: translateY(-50%);
		width: 200rpx;
		height: 400rpx;
		border: 5rpx dashed #FFFFFF;
		color: #333;
		font-size: 30rpx;
		background-color: rgba(255,255,255,0.4);
		font-weight: bold;
		opacity: 0;
	}
	.touch-prev {
		left: 0;
		border-top-right-radius: 20rpx;
		border-bottom-right-radius: 20rpx;
	}
	.touch-next {
		right: 0;
		border-top-left-radius: 20rpx;
		border-bottom-left-radius: 20rpx;
	}
	.touch-menu {
		left: 50%;
		transform: translate(-50%, -50%);
		border-radius: 20rpx;
	}
</style>
