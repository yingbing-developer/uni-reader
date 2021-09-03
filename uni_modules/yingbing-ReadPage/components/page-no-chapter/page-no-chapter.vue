<template>
	<view class="page" :id="'page' + dataId" :prop="pageProp" :change:prop="page.pagePropChange">
		<!-- 翻页模式 -->
		<view class="box">
			<view class="content"
			:id="'content' + dataId"
			v-if="pageType != 'scroll'"
			@touchstart="page.pageTouchstart"
			@touchmove="page.pageTouchmove"
			@touchend="page.pageTouchend"></view>
			<view class="content" style="z-index: -1000;" :id="'computed' + dataId"></view>
		</view>
		<!-- 滚动模式 -->
		<view
		:id="'scroll-box' + dataId"
		class="scroll-box"
		:style="{
		'color': color,
		'padding-left': slide + 'px',
		'padding-right': slide + 'px',
		'border-top': `${topGap}px solid ${bgColor}`,
		'padding-bottom': bottomGap + 'px',
		'background': bgColor}"
		v-if="pageType == 'scroll'"></view>
	</view>
</template>

<script>
	export default {
		props: {
			//传入唯一标识动态命名ID用于获取dom对象（可选）默认已经生成
			dataId: {
				type: String,
				default () {
					let mydate = new Date();
					return 'cms' + mydate.getMinutes() + mydate.getSeconds() + mydate.getMilliseconds() + Math.round(Math.random() * 10000);
				}
			},
			//字体颜色
			color: {
				type: String,
				default: '#333333'
			},
			//字体大小（单位px）
			fontSize: {
				type: String | Number,
				default: 15
			},
			//背景颜色
			bgColor: {
				type: String,
				default: '#fcd281'
			},
			//翻页方式
			pageType: {
				type: String,
				default: 'scroll'
			},
			//行间距（单位px）
			lineHeight: {
				type: Number | String,
				default: 15
			},
			//页面左右边距（单位px）
			slide: {
				type: Number | String,
				default: 40
			},
			//页面上边距（单位px）
			topGap: {
				type: Number | String,
				default: 10
			},
			//页面下边距（单位px）
			bottomGap: {
				type: Number | String,
				default: 10
			}
		},
		data () {
			return {
				contents: [],
				loading: false,//等待内容请求
				upper: false,//文章是否到最前面
				lower: false,//文章是否到最后面
				restart: false,//是否重绘页面
				preLoading: false//等待预加载请求
			}
		},
		computed: {
			pageProp () {
				return {
					contents: this.contents,
					dataId: this.dataId,
					color: this.color,
					bgColor: this.bgColor,
					slide: this.slide > 0 ? parseInt(this.slide) : 0,
					topGap: this.topGap > 0 ? parseInt(this.topGap) : 0,
					bottomGap: this.bottomGap > 0 ? parseInt(this.bottomGap) : 0,
					fontSize: this.fontSize >= 12 ? parseInt(this.fontSize) : 12,//字体大小最小只能到12px，因为谷歌浏览器最小只支持12px
					pageType: this.pageType || 'none',
					lineHeight: this.lineHeight >= 5 ? parseInt(this.lineHeight) : 5,
					restart: this.restart
				};
			}
		},
		methods: {
			//初始化
			init (data) {
				this.contents = data.contents || this.contents;
				this.restart = true;
				this.getCatalog(this.contents[0].content);
			},
			//跳转
			change (data) {
				this.contents[0].start = data.position;
				this.restart = true;
			},
			showToast (e) {
				uni.showToast({
					title: e.title,
					icon: 'none'
				})
			},
			//抛出阅读页面改变事件
			currentChange (e) {
				this.$emit('currentChange', e.currentInfo);
			},
			//重置部分变量，方便下次使用
			resetPageProp () {
				this.restart = false;
				this.isNewChapter = false;
			},
			//使用正则获取章节目录 并抛出事件
			getCatalog (content) {
				const reg = new RegExp(/(第?[一二两三四五六七八九十○零百千万亿0-9１２３４５６７８９０※✩★☆]{1,6}[章回卷节折篇幕集部]?[、.-\s][^\n]*)[_,-]?/g);
				let match = '';
				let catalog = [];
				while ((match = reg.exec(content)) != null) {
					catalog.push({
						title: match[0],
						position: match.index
					})
				}
				this.$emit('setCatalog', catalog);
			}
		}
	}
</script>

<script lang="renderjs" module="page" type="module">
	let myPageDom;
	export default {
		data () {
			return {
				viewHeight: 0,
				viewWidth: 0,
				updownloading: false,
				currentInfo: {
					start: 0,
					end: 0,
					text: ''
				},
				touchstart: {
					x: 0,
					y: 0
				},
				pageWating: false,//等待翻页
				moveX: 0,//翻页距离
				pageEl: '',//翻页对象
				pageDirection: 'next',//翻页方向
				touchTime: 0//触摸屏幕时间
			}
		},
		mounted () {
			this.initDom.bind(this);
		},
		methods: {
			initDom () {
				myPageDom = page.init(document.getElementById('page' + this.pageProp.dataId));
				// 观测更新的数据在 view 层可以直接访问到
				myPageDom.setOption(this.pageProp);
			},
			//绑定滚动事件（滚动模式下有效）
			bindScrollEvent () {
				let scrollBox = document.getElementById('scroll-box' + this.pageProp.dataId);
				if ( scrollBox ) {
					scrollBox.onscroll = () => {
						let scrollItems = scrollBox.getElementsByClassName('scroll-item');
						let scrollTop = scrollBox.scrollTop + this.pageProp.topGap + this.pageProp.bottomGap;
						for ( let i = 0; i < scrollItems.length; i++ ) {
							let offsetTop1 = scrollItems[i].offsetTop;
							let offsetTop2 = i < scrollItems.length - 1 ? scrollItems[i+1].offsetTop : offsetTop1 + 2;
							if ( scrollTop >= offsetTop1 &&  scrollTop < offsetTop2 ) {
								let start = parseInt(scrollItems[i].getAttribute('start'));
								let end = parseInt(scrollItems[i].getAttribute('end'));
								if ( this.currentInfo.start != start ) {
									this.currentInfo.start = start;
									this.currentInfo.end = end;
									this.currentInfo.text = scrollItems[i].innerText;
									this.triggerCurrentChange(this.currentInfo)
								}
							}
						}
						if ( Math.ceil(scrollBox.scrollTop + scrollBox.offsetHeight) >= scrollBox.scrollHeight ) {//触底
							if ( this.updownloading ) {
								return;
							}
							this.updownloading = true;
							let end = parseInt(scrollBox.lastChild.getAttribute('end'));
							if ( end < this.pageProp.contents[0].content.length - 1 ) {
								this.drawText(end, 'next');
							} else {
								this.triggerShowToast('后面已经没有了')
							}
							this.updownloading = false;
						}
						if ( scrollBox.scrollTop <= 0 ) {//触顶
							if ( this.updownloading ) {
								return;
							}
							this.updownloading = true;
							let start = parseInt(scrollBox.firstChild.getAttribute('start'));
							if ( start > 0 ) {
								this.drawText(start, 'prev');
							} else {
								this.triggerShowToast('前面已经没有了')
							}
							this.updownloading = false;
						}
					};
				}
			},
			//计算页面显示文字
			computedText (start) {
				let parent = document.getElementById('computed' + this.pageProp.dataId);
				this.viewWidth = parent.offsetWidth;
				this.viewHeight = parent.offsetHeight;
				let computedCanvas = this.createComputedCanvas(parent);
				let context = computedCanvas.getContext('2d');
				context.font = this.pageProp.fontSize + 'px 微软雅黑';
				context.fillStyle = this.pageProp.color;
				context.lineWidth = 1;
				let pageHeight = this.pageProp.fontSize + this.pageProp.lineHeight;
				let strs = [];
				let page = {
					start: start,
					end: 0,
					text: []
				}
				let length = 0;
				let contentSync = this.pageProp.contents[0].content.substr(start);
				let lastIndex = 0;
				while ( pageHeight <= this.viewHeight - this.pageProp.topGap - this.pageProp.bottomGap ) {
					strs.push('');
					let lineWidth = 0;
					for ( let i = lastIndex; i < contentSync.length; i++ ) {
						lineWidth += context.measureText(contentSync[i]).width;
						if ( JSON.stringify(contentSync[i]) == JSON.stringify('\r') || JSON.stringify(contentSync[i]) == JSON.stringify('\n') ) {
							length += 1
							lastIndex = i + 1;
							break;
						} else if ( lineWidth >= this.viewWidth - (2 * this.pageProp.slide) ) {
							lastIndex = i;
							break;
						} else {
							strs[strs.length - 1] += contentSync[i];
							length += 1;
							page.end = page.start + length;
						}
					}
					pageHeight += this.pageProp.fontSize + this.pageProp.lineHeight;
					if ( page.end >= this.pageProp.contents[0].content.length - 1 ) break;
				}
				page.text = strs;
				return page;
			},
			//计算当前显示页面上一页显示文字
			computedPrevText (end) {
				let parent = document.getElementById('computed' + this.pageProp.dataId);
				this.viewWidth = parent.offsetWidth;
				this.viewHeight = parent.offsetHeight;
				let computedCanvas = this.createComputedCanvas(parent);
				let context = computedCanvas.getContext('2d');
				context.font = this.pageProp.fontSize + 'px 微软雅黑';
				context.fillStyle = this.pageProp.color;
				context.lineWidth = 1;
				let pageHeight = this.pageProp.fontSize + this.pageProp.lineHeight;
				let strs = [];
				let page = {
					start: 0,
					end: end,
					text: []
				}
				let length = 0;
				let lastIndex1 = 0;
				let lastIndex2 = 0;
				while ( pageHeight <= this.viewHeight - this.pageProp.topGap - this.pageProp.bottomGap ) {
					if ( end - length > 0 ) {
						strs.unshift('');
						let lineWidth = 0;
						let contentSync = this.pageProp.contents[0].content.substring(0, end);
						for ( let i = lastIndex1 || contentSync.length - 1; i >= 0; i-- ) {
							lineWidth += context.measureText(contentSync[i]).width;
							if ( JSON.stringify(contentSync[i]) == JSON.stringify('\r') || JSON.stringify(contentSync[i]) == JSON.stringify('\n') ) {
								lastIndex1 = i - 1;
								length += 1
								break;
							} else if ( lineWidth >= this.viewWidth - (2 * this.pageProp.slide) ) {
								lastIndex1 = i;
								break;
							} else {
								strs[0] = contentSync[i] + strs[0];
								length += 1
								page.start = end - length;
							}
							if ( page.start == 0 ) break;
						}
						pageHeight += this.pageProp.fontSize + this.pageProp.lineHeight;
					} else {
						if ( this.pageProp.pageType != 'scroll' ) {
							strs.push('');
							let lineWidth = 0;
							let contentSync = this.pageProp.contents[0].content.substr(end);
							for ( let i = lastIndex2; i < contentSync.length; i++ ) {
								lineWidth += context.measureText(contentSync[i]).width;
								if ( JSON.stringify(contentSync[i]) == JSON.stringify('\r') || JSON.stringify(contentSync[i]) == JSON.stringify('\n') ) {
									lastIndex2 = i + 1;
									length += 1
									break;
								} else if ( lineWidth >= this.viewWidth - (2 * this.pageProp.slide) ) {
									lastIndex2 = i;
									break;
								} else {
									strs[strs.length - 1] += contentSync[i];
									length += 1;
									page.end = page.start + length;
								}
							}
							pageHeight += this.pageProp.fontSize + this.pageProp.lineHeight;
							if ( page.end >= this.pageProp.contents[0].content.length - 1 ) break;
						} else {
							break;
						}
					}
				}
				page.text = strs;
				return page;
			},
			//绘制文字到页面上
			drawText (start, type = 'init') {
				if ( this.pageProp.pageType != 'scroll' ) {
					let parent = document.getElementById('content' + this.pageProp.dataId);
					let page = type == 'prev' ? this.computedPrevText(start) : this.computedText(start);
					let pageItem = this.createPageItem(parent, page, type);
					let el = {
						el: pageItem,
						content: pageItem.getElementsByClassName('page-item-canvas')[0],
						bg: pageItem.getElementsByClassName('page-item-bg')[0],
						shadow: pageItem.getElementsByClassName('page-item-shadow')[0]
					}
					for ( let i = 0; i < page.text.length; i++ ) {
						this.insetScrollText(el.content, page.text[i], this.pageProp.fontSize);
						// context.font = this.pageProp.fontSize + 'px 微软雅黑';
						// context.fillStyle = this.pageProp.color;
						// context.fillText(pages[i].text[j], this.pageProp.slide, ((j + 1) * (this.pageProp.fontSize + this.pageProp.lineHeight)) + this.pageProp.topGap);
					}
					this.resetProp();
					if ( type == 'init' ) {
						if ( page.start > 0 ) {
							this.drawText(page.start, 'prev')
						}
						if ( page.end < this.pageProp.contents[0].content.length - 1 ) {
							this.drawText(page.end, 'next')
						}
						this.currentInfo.start = parseInt(el.el.getAttribute('start'));
						this.currentInfo.end = parseInt(el.el.getAttribute('end'));
						this.currentInfo.text = el.content.innerText;
						this.triggerCurrentChange(this.currentInfo);
					} else if ( type == 'prev' ) {
						this.pageAnimation(-this.viewWidth, 0, el);
						if ( parent.getElementsByClassName('page-item').length > 3 ) parent.removeChild(parent.lastChild);
					} else {
						if ( parent.getElementsByClassName('page-item').length > 3 ) parent.removeChild(parent.firstChild);
					}
				} else {
					let scrollBox = document.getElementById('scroll-box' + this.pageProp.dataId);
					let page = type == 'prev' ? this.computedPrevText(start) : this.computedText(start);
					let scrollItem = this.createScrollItem(scrollBox, page, type);
					for ( let i = 0; i < page.text.length; i++ ) {
						this.insetScrollText(scrollItem, page.text[i], this.pageProp.fontSize);
					}
					this.resetProp();
					if ( type == 'init' ) {
						if ( page.start > 0 ) {
							this.drawText(page.start, 'prev')
						}
						if ( page.end < this.pageProp.contents[0].content.length - 1 ) {
							this.drawText(page.end, 'next')
						}
						let scrollItems = scrollBox.getElementsByClassName('scroll-item')
						let offsetHeight = 0;
						for ( let i = 0; i < scrollItems.length; i++ ) {
							offsetHeight += i > 0 ? scrollItems[i - 1].offsetHeight : 0;
							if ( this.currentInfo.start >= scrollItems[i].getAttribute('start') && this.currentInfo.start < scrollItems[i].getAttribute('end') ) {
								scrollBox.scrollTop = offsetHeight;
								this.currentInfo.text = scrollItems[i].innerText;
								this.currentInfo.end = scrollItems[i].getAttribute('end');
							}
						}
						this.bindScrollEvent();
						this.triggerCurrentChange(this.currentInfo);
					} else if ( type == 'prev' ) {
						scrollBox.scrollTop = scrollItem.offsetHeight;
						if ( scrollBox.getElementsByClassName('scroll-item').length > 3 ) scrollBox.removeChild(scrollBox.lastChild);
					} else {
						if ( scrollBox.getElementsByClassName('scroll-item').length > 3 ) scrollBox.removeChild(scrollBox.firstChild);
						scrollBox.scrollTop = scrollBox.scrollHeight - scrollBox.lastChild.offsetHeight - scrollBox.offsetHeight;
					}
				}
			},
			//创建一个独立的canvas画板，用于计算文字布局
			createComputedCanvas (el) {
				if ( document.getElementsByClassName('computedCanvas')[0] ) return document.getElementsByClassName('computedCanvas')[0];
				let canvasDom = document.createElement('canvas');
				canvasDom.width = this.viewWidth;
				canvasDom.height = this.viewHeight;
				canvasDom.style.position = 'absolute';
				canvasDom.style.top = 0;
				canvasDom.style.left = 0;
				canvasDom.setAttribute('class', 'computedCanvas');
				el.appendChild(canvasDom);
				return document.getElementsByClassName('computedCanvas')[0];
			},
			//创建翻页的文章盒子
			createPageItem (el, info, type) {
				let pageItem = document.createElement('div');
				pageItem.style.width = '100%';
				pageItem.style.height = '100%';
				pageItem.style.overflow = 'hidden';
				pageItem.style.position = 'absolute';
				pageItem.style.top = 0;
				pageItem.style.left = 0;
				pageItem.style.zIndex = -info.start;
				if ( this.currentInfo.start == info.start ) {
					pageItem.setAttribute('class', 'page-item page-item-actived page-item-start__' + info.start);
				} else {
					pageItem.setAttribute('class', 'page-item page-item-start__' + info.start);
				}
				pageItem.setAttribute('start', info.start);
				pageItem.setAttribute('end', info.end);
				// let canvas = document.createElement('canvas');
				// canvas.width = this.viewWidth;
				// canvas.height = this.viewHeight;
				// canvas.style.position = 'absolute';
				// canvas.style.top = 0;
				// canvas.style.left = 0;
				// // canvas.style.background = this.pageProp.bgColor;
				// canvas.style.zIndex = -1;
				// canvas.setAttribute('class', 'page-item-canvas');
				let pageContent = document.createElement('div');
				pageContent.style.width = this.viewWidth + 'px';
				pageContent.style.height = this.viewHeight + 'px';
				pageContent.style.position = 'absolute';
				pageContent.style.top = 0;
				pageContent.style.left = 0;
				pageContent.style.background = this.pageProp.bgColor;
				pageContent.style.color = this.pageProp.color;
				pageContent.style.overflow = 'hidden';
				pageContent.style.padding = `${this.pageProp.topGap}px ${this.pageProp.slide}px ${this.pageProp.bottomGap}px ${this.pageProp.slide}px`;
				pageContent.style.boxSizing = 'border-box';
				pageContent.setAttribute('class', 'page-item-canvas');
				pageItem.appendChild(pageContent);
				let pageBg = document.createElement('div');
				pageBg.style.width = '100%';
				pageBg.style.height = Math.sqrt(Math.pow(this.viewHeight, 2) + Math.pow(this.viewWidth, 2)) + 'px';
				pageBg.style.boxShadow = '-5px 0 20px rgba(0,0,0,0.2)';
				pageBg.style.position = 'absolute';
				pageBg.style.top = '50%';
				pageBg.style.left = '100%';
				pageBg.style.transform = 'translateY(-50%)';
				pageBg.style.background = this.pageProp.bgColor;
				pageBg.setAttribute('class', 'page-item-bg');
				pageItem.appendChild(pageBg);
				let pageShadow = document.createElement('div');
				pageShadow.style.width = '0';
				pageShadow.style.height = '100%';
				pageShadow.style.position = 'absolute';
				pageShadow.style.top = 0;
				pageShadow.style.right = 0;
				pageShadow.style.zIndex = '9';
				pageShadow.setAttribute('class', 'page-item-shadow');
				pageItem.appendChild(pageShadow);
				if ( type == 'prev' ) {
					el.insertBefore(pageItem, el.firstChild);
				} else {
					el.appendChild(pageItem);
				}
				return document.getElementsByClassName('page-item-start__' + info.start)[0];
			},
			//创建滚动布局下的的页面盒子
			createScrollItem (el, info, type) {
				let divDom = document.createElement('div');
				divDom.style.width = '100%';
				divDom.setAttribute('class', 'scroll-item scroll-start__' + info.start);
				divDom.setAttribute('start', info.start);
				divDom.setAttribute('end', info.end);
				if ( type == 'prev' ) {
					el.insertBefore(divDom, el.firstChild);
				} else {
					el.appendChild(divDom);
				}
				return document.getElementsByClassName('scroll-start__' + info.start)[0]
			},
			//创建滚动布局下的的文字盒子
			insetScrollText (el, text, height = 0) {
				let pDom = document.createElement('p');
				pDom.style.height = height ? height + 'px' : 'auto';
				pDom.style.marginTop = this.pageProp.lineHeight + 'px';
				pDom.style.fontSize = this.pageProp.fontSize + 'px';
				pDom.style.whiteSpace = 'pre-wrap';
				pDom.style.fontFamily = '"Microsoft YaHei",微软雅黑';
				pDom.setAttribute('class', 'scroll-text');
				pDom.innerHTML = text || ' ';
				el.appendChild(pDom);
			},
			pageTouchstart (e) {
				if ( this.pageWating ) {
					return;
				}
				if ( e.touches.length == 1 ) {
					this.touchTimer = window.setInterval(() => {
						this.touchTime += 50;
					}, 50)
					let touch = e.touches[0];
					this.touchstart.x = touch.pageX;
					this.touchstart.y = touch.pageY;
					if ( this.touchstart.x > (this.viewWidth / 4) * 3 ) {
						this.pageEl = this.getPageActived(0);
						this.pageDirection = 'next'
					}
					if ( this.touchstart.x < (this.viewWidth / 4) ) {
						this.pageEl = this.getPageActived(-1);
						this.pageDirection = 'prev'
					}
				}
			},
			pageTouchmove (e) {
				if ( this.pageWating || (this.pageProp.pageType != 'real' && this.pageProp.pageType != 'cover') ) {
					return;
				}
				if ( e.touches.length == 1 ) {
					if ( this.pageEl ) {
						let touch = e.touches[0];
						let height = this.viewHeight / 2;
						let maxDeg = height / 5;
						let rotateZ = this.pageDirection == 'next' ? ((touch.pageY - height) / maxDeg) : -((touch.pageY - height) / maxDeg);
						if ( this.touchstart.x > (this.viewWidth / 4) * 3 || this.touchstart.x < (this.viewWidth / 4) ) {
							this.moveX = touch.pageX - this.touchstart.x;
						}
						this.pageAnimation(this.moveX, rotateZ);
					}
				}
			},
			pageTouchend (e) {
				window.clearInterval(this.touchTimer);
				if ( this.pageWating ) {
					return;
				}
				if ( this.pageEl ) {
					this.pageWating = true;
					if ( this.touchTime <= 200 ) {
						let duration = (this.pageProp.pageType == 'real' || this.pageProp.pageType == 'cover') ? 1000 : 0
						let value = this.pageDirection == 'next' ? 1 : -1;
						this.pageDuration(duration);
						this.$nextTick(() => {
							this.pageAnimation(-value * this.viewWidth);
							setTimeout(() => {
								this.changePageActived(value);
								this.resetPageMove();
							}, duration + 50)
						})
					} else {
						let duration = (this.pageProp.pageType == 'real' || this.pageProp.pageType == 'cover') ? 500 : 0
						if ( Math.abs(this.moveX) >= this.viewWidth / 2.5 ) {
							let value = this.pageDirection == 'next' ? 1 : -1;
							this.pageDuration(duration);
							this.$nextTick(() => {
								this.pageAnimation(-value * this.viewWidth);
								setTimeout(() => {
									this.changePageActived(value);
									this.resetPageMove();
								}, duration + 50)
							})
						} else {
							this.pageDuration(duration);
							this.$nextTick(() => {
								this.pageAnimation(0);
								setTimeout(() => {
									this.resetPageMove();
								}, duration + 50)
							})
						}
					}
				}
			},
			//重置翻页数据
			resetPageMove () {
				this.pageDuration(0);
				this.isStart = false;
				this.pageWating = false;
				this.moveX = 0;
				this.pageEl = '';
				this.pageDirection = 'next';
				this.touchTime = 0;
				this.touchstart.x = 0;
				this.touchstart.y = 0;
			},
			//设置翻页对象动画效果
			pageAnimation (moveX, rotateZ = 0, el) {
				let lateX = this.pageDirection == 'next' ? moveX : moveX - this.viewWidth;
				let pageEl = el || this.pageEl;
				pageEl.el.style.transform = `translateX(${lateX}px)`;
				pageEl.content.style.transform = this.pageProp.pageType == 'real' ? `translateX(${-lateX}px)` : pageEl.content.style.transform;
				pageEl.bg.style.transform = this.pageProp.pageType == 'real' ? `translate(${lateX}px, -50%) rotateZ(${rotateZ}deg)` : pageEl.bg.style.transform;
				pageEl.shadow.style.boxShadow = '0 0 60px ' + (this.pageProp.pageType == 'real' ? Math.abs(lateX) > 30 ? 30 : Math.abs(lateX) : 0) + 'px rgba(0,0,0,0.5)';
			},
			//设置翻页对象动画时间
			pageDuration (duration) {
				this.pageEl.el.style.transition = duration > 0 ? 'transform ' + duration + 'ms' : '';
				this.pageEl.content.style.transition = duration > 0 ? 'transform ' + duration + 'ms' : '';
				this.pageEl.bg.style.transition = duration > 0 ? 'transform ' + duration + 'ms' : '';
				this.pageEl.shadow.style.transition = duration > 0 ? 'box-shadow ' + duration + 'ms' : '';
			},
			//获取翻页对象
			getPageActived (value = 0) {
				let boxs = document.getElementsByClassName('page-item');
				for ( let i = 0; i < boxs.length; i++ ) {
					if ( boxs[i].getAttribute('class').indexOf('page-item-actived') > 1 ) {
						if ( boxs[i + value + 1] && boxs[i + value] ) {
							return {
								el: boxs[i + value],
								content: boxs[i + value].getElementsByClassName('page-item-canvas')[0],
								bg: boxs[i + value].getElementsByClassName('page-item-bg')[0],
								shadow: boxs[i + value].getElementsByClassName('page-item-shadow')[0]
							};
						}
					}
				}
				if ( value < 0 ) {
					this.triggerShowToast('前面已经没有了')
				} else {
					this.triggerShowToast('后面已经没有了')
				}
				return false;
			},
			//改变翻页对象
			changePageActived (value) {
				let content = document.getElementById('content' + this.pageProp.dataId);
				let boxs = content.getElementsByClassName('page-item');
				let index = -1
				for ( let i = 0; i < boxs.length; i++ ) {
					if ( boxs[i].getAttribute('class').indexOf('page-item-actived') > -1 ) {
						index = i;
					}
				}
				boxs[index].setAttribute('class', boxs[index].getAttribute('class').replace('page-item-actived', ''));
				boxs[index + value].setAttribute('class', boxs[index + value].getAttribute('class') + ' page-item-actived');
				this.currentInfo.start = parseInt(boxs[index + value].getAttribute('start'));
				this.currentInfo.end = parseInt(boxs[index + value].getAttribute('end'));
				this.currentInfo.text = boxs[index + value].getElementsByClassName('page-item-canvas')[0].innerText;
				this.triggerCurrentChange(this.currentInfo);
				if ( value < 0 && !boxs[index + value - 1] ) {
					if ( this.updownloading ) {
						return;
					}
					this.updownloading = true;
					let start = parseInt(content.firstChild.getAttribute('start'));
					if ( start > 0 ) {
						this.drawText(start, 'prev');
					} else {
						this.triggerShowToast('前面已经没有了')
					}
					this.updownloading = false;
				}
				if ( value > 0 && !boxs[index + value + 1] ) {
					if ( this.updownloading ) {
						return;
					}
					this.updownloading = true;
					let end = parseInt(content.lastChild.getAttribute('end'));
					if ( end < this.pageProp.contents[0].content.length - 1 ) {
						this.drawText(end, 'next');
					} else {
						this.triggerShowToast('后面已经没有了')
					}
					this.updownloading = false;
				}
				if ( value < 0 ) {
					if ( boxs[index + value].getAttribute('end') != boxs[index + value + 1].getAttribute('start') ) {
						this.restartDrawText();
					}
				}
			},
			//参数改变
			pagePropChange (newValue, oldValue) {
				if ( newValue.fontSize != oldValue.fontSize ) {//字体大小改变
					this.restartDrawText();
				}
				if ( newValue.lineHeight != oldValue.lineHeight ) {//字体行高改变
					this.restartDrawText();
				}
				if ( newValue.color != oldValue.color || newValue.bgColor != oldValue.bgColor ) {//字体颜色改变
					if ( this.pageProp.pageType != 'scroll' ) {
						// this.restartDrawText(this.currentInfo.chapter);
						this.colorChange();
					}
				}
				if ( newValue.pageType != oldValue.pageType ) {//翻页模式改变
					this.restartDrawText();
				}
				if ( newValue.restart != oldValue.restart ) {//重绘页面通知
					this.restartChange(newValue.restart);
				}
			},
			//重绘页面
			restartDrawText () {
				if ( this.pageProp.pageType == 'scroll' ) {
					document.getElementById('scroll-box' + this.pageProp.dataId).innerHTML = '';
					this.drawText(this.currentInfo.start);
				} else {
					document.getElementById('content' + this.pageProp.dataId).innerHTML = '';
					this.drawText(this.currentInfo.start);
				}
			},
			restartChange (newValue) {
				if ( newValue ) {
					this.currentInfo.start = this.pageProp.contents[0].start;
					this.restartDrawText();
				}
			},
			colorChange () {
				let items = document.getElementsByClassName('page-item');
				for ( let i = 0; i < items.length; i++ ) {
					items[i].getElementsByClassName('page-item-canvas')[0].style.background = this.pageProp.bgColor;
					items[i].getElementsByClassName('page-item-bg')[0].style.background = this.pageProp.bgColor;
					items[i].getElementsByClassName('page-item-canvas')[0].style.color = this.pageProp.color;
				}
			},
			triggerCurrentChange (currentInfo) {
				// #ifndef H5
				UniViewJSBridge.publishHandler('onWxsInvokeCallMethod', {
					cid: this._$id,
					method: 'currentChange',
					args: {'currentInfo': currentInfo}
				})
				// #endif
				// #ifdef H5
				this.currentChange({'currentInfo': currentInfo})
				// #endif
			},
			triggerShowToast (title) {
				// #ifndef H5
				UniViewJSBridge.publishHandler('onWxsInvokeCallMethod', {
					cid: this._$id,
					method: 'showToast',
					args: {'title': title}
				})
				// #endif
				// #ifdef H5
				this.showToast({'title': title})
				// #endif
			},
			//重置部分传过来的属性
			resetProp () {
				// #ifndef H5
				UniViewJSBridge.publishHandler('onWxsInvokeCallMethod', {
					cid: this._$id,
					method: 'resetPageProp'
				})
				// #endif
				// #ifdef H5
				this.resetPageProp()
				// #endif
			}
		}
	}
</script>

<style scoped>
	.page {
		width: 100vw;
		height: 100vh;
		position: relative;
	}
	.scroll {
		width: 100%;
		height: 100%;
		position: absolute;
		left: 0;
		top: 0;
	}
	.scroll-box {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		/* overflow-anchor: auto; */
		overflow-y: auto;
	}
	.box {
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		position: absolute;
		left: 0;
		top: 0;
		overflow: hidden;
	}
	.content {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
	}
</style>