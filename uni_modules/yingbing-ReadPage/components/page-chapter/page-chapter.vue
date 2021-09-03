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
				upper: false,//文章是否到第一章节
				lower: false,//文章是否到最后章节
				restart: false,//是否重绘页面
				isNewChapter: false,//是否绘制新章节
				newChapter: -1,//需要绘制的新章节
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
					restart: this.restart,
					isNewChapter: this.isNewChapter,
					newChapter: parseInt(this.newChapter)
				};
			}
		},
		methods: {
			//初始化
			init (data) {
				this.contents = data.contents || this.contents;
				let index = this.indexOf(this.contents, 'chapter', data.current);
				this.newChapter = data.current;
				// this.nowContent = this.contents[index > -1 ? index : 0];
				this.upper = this.contents[index > -1 ? index : 0].chapter == 1;
				this.lower = this.contents[index > -1 ? index : 0].isEnd;
				this.restart = true;
			},
			//跳转
			change (data) {
				let arr = [];
				let len = data.contents.length;
				for ( let i = 0; i < len; i++ ) {
					let index = this.indexOf(this.contents, 'chapter', data.contents[i].chapter);
					if ( index == -1 ) {
						arr.push(data.contents[i])
					}
				}
				this.contents = this.contents.concat(arr);
				let index = this.indexOf(this.contents, 'chapter', data.current);
				this.newChapter = data.current;
				// this.nowContent = this.contents[index > -1 ? index : 0];
				this.upper = this.contents[index > -1 ? index : 0].chapter == 1;
				this.lower = this.contents[index > -1 ? index : 0].isEnd;
				this.restart = true;
			},
			/**
			 * 数组查找符合条件元素并返回下标
			 * @param {Array} arr 传入数组
			 * @param {String} value 条件元素
			 * @param {String} query 对比key值
			*/
			indexOf (arr, query, value) {
				let len = arr.length;
				for ( let i = 0; i < len; i++ ) {
					if ( arr[i][query] == value ) {
						return parseInt(i);
					}
				}
				return -1;
			},
			getPrevContent (e) {
				if ( this.loading ) {
					return;
				}
				this.upper = e.chapter == 1;
				if ( this.upper ) {
					if ( e.isTop ) {
						uni.showToast({
							title: '前面已经没有了',
							icon: 'none'
						})
					}
					return;
				}
				this.loading = true
				let index = this.indexOf(this.contents, 'chapter', parseInt(e.chapter) - 1);
				if ( index == -1 ) {
					this.$emit('loadmore',
					parseInt(e.chapter) - 1,
					(content) => {
						this.loading = false;
						this.lower = content.isEnd;
						this.contents.push(content);
						this.newChapter = content.chapter;
						this.isNewChapter = true;
					},
					() => {
						this.loading = false;
					});
				} else {
					this.newChapter = parseInt(e.chapter) - 1;
					this.isNewChapter = true;
					this.lower = this.contents[index].isEnd;
					this.loading = false;
				}
			},
			getNextContent (e) {
				if ( this.loading ) {
					return;
				}
				if ( this.lower ) {
					if ( e.isBottom ) {
						uni.showToast({
							title: '后面已经没有了',
							icon: 'none'
						})
					}
					return;
				}
				this.loading = true
				let index = this.indexOf(this.contents, 'chapter', parseInt(e.chapter) + 1);
				if ( index == -1 ) {
					this.$emit('loadmore',
					parseInt(e.chapter) + 1,
					(content) => {
						this.loading = false;
						this.lower = content.isEnd;
						this.contents.push(content);
						this.newChapter = content.chapter;
						this.isNewChapter = true;
					},
					() => {
						this.loading = false;
					});
				} else {
					this.newChapter = parseInt(e.chapter) + 1;
					this.isNewChapter = true;
					this.lower = this.contents[index].isEnd;
					this.loading = false;
				}
			},
			//预加载上下章节
			preload (e) {
				if ( this.preLoading ) {
					return;
				}
				if ( this.lower ) {
					return;
				}
				this.preLoading = true;
				let prevIndex = e.chapter > 1 ? this.indexOf(this.contents, 'chapter', parseInt(e.chapter) - 1) : 0;
				let nextIndex = this.indexOf(this.contents, 'chapter', parseInt(e.chapter) + 1);
				let arr = [];
				if ( prevIndex == -1 ) arr.push(parseInt(e.chapter) - 1);
				if ( nextIndex == -1 ) arr.push(parseInt(e.chapter) + 1);
				if ( prevIndex == -1 || nextIndex == -1 ) {
					this.$emit('preload', arr,
					(contents) => {
						this.preLoading = false;
						this.contents = this.contents.concat(contents);
					},
					() => {
						this.preLoading = false;
					});
				} else {
					this.preLoading = false;
				}
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
			showToast (e) {
				uni.showToast({
					title: e.title,
					icon: 'none'
				})
			}
		}
	}
</script>

<script lang="renderjs" module="page" type="module">
	let myPageDom;
	export default {
		data () {
			return {
				pages: [],
				viewHeight: 0,
				viewWidth: 0,
				updownloading: false,
				currentInfo: {
					chapter: 0,
					start: 0,
					end: 0
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
			//绑定滚动事件
			bindScrollEvent () {
				let scrollBox = document.getElementById('scroll-box' + this.pageProp.dataId);
				if ( scrollBox ) {
					scrollBox.onscroll = () => {
						this.scroll(scrollBox)
					};
				}
			},
			//滚动处理事件（滚动模式下有效）
			scroll (el) {
				let scrollItems = document.getElementsByClassName('scroll-item');
				let scrollTop = el.scrollTop + this.pageProp.topGap + this.pageProp.bottomGap;
				for ( let i = 0; i < scrollItems.length; i++ ) {
					let offsetTop1 = scrollItems[i].offsetTop;
					let offsetTop2 = i < scrollItems.length - 1 ? scrollItems[i+1].offsetTop : offsetTop1 + 2;
					if ( scrollTop >= offsetTop1 &&  scrollTop < offsetTop2 ) {
						let chapter = parseInt(scrollItems[i].getAttribute('chapter'));
						let start = parseInt(scrollItems[i].getAttribute('start'));
						let end = parseInt(scrollItems[i].getAttribute('end'));
						let isChapterEnd = parseInt(scrollItems[i].getAttribute('isChapterEnd'));
						if ( this.currentInfo.chapter != chapter || this.currentInfo.start != start ) {
							this.currentInfo.chapter = chapter;
							this.currentInfo.start = start;
							this.currentInfo.end = end;
							this.currentInfo.isChapterEnd = isChapterEnd;
							this.triggerCurrentChange(this.currentInfo)
						} else {
							this.currentInfo.chapter = chapter;
							this.currentInfo.start = start;
							this.currentInfo.end = end;
							this.currentInfo.isChapterEnd = isChapterEnd;
						}
					}
				}
				if ( Math.ceil(el.scrollTop + el.offsetHeight) >= el.scrollHeight ) {//触底
					let args = {'chapter': el.lastChild.getAttribute('chapter'), 'isBottom': Math.ceil(el.scrollTop + el.offsetHeight) >= el.scrollHeight};
					this.scrollToLower(args);
				}
				if ( el.scrollTop <= 0 ) {//触顶
					let args = {'chapter': el.firstChild.getAttribute('chapter'), 'isTop': el.scrollTop == 0};
					this.scrollToUpper(args);
				}
			},
			//计算页面显示文字
			computedText (content, chapter) {
				let parent = document.getElementById('computed' + this.pageProp.dataId);
				this.viewWidth = parent.offsetWidth;
				this.viewHeight = parent.offsetHeight;
				let computedCanvas = this.createComputedCanvas(parent);
				let context = computedCanvas.getContext('2d');
				context.font = this.pageProp.fontSize + 'px 微软雅黑';
				context.fillStyle = this.pageProp.color;
				context.lineWidth = 1;
				let lastIndex = 0;
				let pages = [];
				const dowhile = () => {
					let pageHeight = this.pageProp.fontSize + this.pageProp.lineHeight;
					let strs = [];
					pages.push({
						chapter: chapter,
						start: lastIndex,
						end: 0,
						text: []
					})
					while ( pageHeight <= this.viewHeight - this.pageProp.topGap - this.pageProp.bottomGap ) {
						strs.push('');
						let lineWidth = 0;
						for ( let i = lastIndex; i < content.length; i++ ) {
							lineWidth += context.measureText(content[i]).width;
							if ( JSON.stringify(content[i]) == JSON.stringify('\r') || JSON.stringify(content[i]) == JSON.stringify('\n') ) {
								lastIndex = i + 1;
								break;
							} else if ( lineWidth >= this.viewWidth - (2 * this.pageProp.slide) ) {
								lastIndex = i;
								break;
							} else {
								strs[strs.length - 1] += content[i];
								lastIndex = i;
							}
						}
						pageHeight += this.pageProp.fontSize + this.pageProp.lineHeight;
						if ( lastIndex >= content.length - 1 ) break;
					}
					pages[pages.length - 1].end = lastIndex;
					pages[pages.length - 1].text = strs;
					if ( lastIndex >= content.length - 1 ) {
						pages[pages.length - 1].isChapterEnd = true;
						this.pages.push({
							chapter: chapter,
							pageItems: pages
						})
						this.drawText(pages);
					} else {
						pages[pages.length - 1].isChapterEnd = false;
						dowhile();
					}
				}
				dowhile();
			},
			//绘制文字到页面上
			drawText (pages) {
				if ( this.pageProp.pageType != 'scroll' ) {
					let parent = document.getElementById('content' + this.pageProp.dataId);
					let type = parent.firstChild ? pages[0].chapter < parent.firstChild.getAttribute('chapter') ? 'prev' : 'next' : 'init';
					for ( let i = 0; i < pages.length; i++ ) {
						let pageItem = this.createPageItem(parent, pages[i], type, i);
						let el = {
							el: pageItem,
							content: pageItem.getElementsByClassName('page-item-canvas')[0],
							bg: pageItem.getElementsByClassName('page-item-bg')[0],
							shadow: pageItem.getElementsByClassName('page-item-shadow')[0]
						}
						// let context = el.content.getContext('2d');
						// context.fillStyle = this.pageProp.bgColor;
						// context.fillRect(0,0,this.viewWidth,this.viewHeight);
						//设置阅读位置前面的页面变成已经翻页的状态
						if ( pages[i].chapter < this.currentInfo.chapter || (pages[i].chapter == this.currentInfo.chapter && this.currentInfo.start > pages[i].end - 1) ) {
							this.pageAnimation(-this.viewWidth, 0, el);
						}
						for ( let j = 0; j < pages[i].text.length; j++ ) {
							this.insetScrollText(pageItem.getElementsByClassName('page-item-canvas')[0], pages[i].text[j], this.pageProp.fontSize);
							// context.font = this.pageProp.fontSize + 'px 微软雅黑';
							// context.fillStyle = this.pageProp.color;
							// context.fillText(pages[i].text[j], this.pageProp.slide, ((j + 1) * (this.pageProp.fontSize + this.pageProp.lineHeight)) + this.pageProp.topGap);
						}
					}
					this.resetProp();
					if ( type == 'init' ) {
						this.currentInfo.isChapterEnd = false;
						if ( this.currentInfo.chapter > 1 ) {
							if ( this.currentInfo.chapter == parent.firstChild.getAttribute('chapter') && this.currentInfo.start >= parent.firstChild.getAttribute('start') && this.currentInfo.start <= parent.firstChild.getAttribute('end') ) {
								let args = {'chapter': this.currentInfo.chapter, 'isTop': true};
								this.scrollToUpper(args);
							}
							if ( this.currentInfo.chapter == parent.lastChild.getAttribute('chapter') && this.currentInfo.start >= parent.lastChild.getAttribute('start') && this.currentInfo.start <= parent.lastChild.getAttribute('end') ) {
								let args = {'chapter': this.currentInfo.chapter, 'isBottom': true};
								this.currentInfo.isChapterEnd = true;
								this.scrollToLower(args);
							}
						}
						this.triggerCurrentChange(this.currentInfo)
						this.preloadContent(this.currentInfo.chapter);
					} else {
						let pageItems = parent.getElementsByClassName('page-item');
						let arr = [];
						for ( let i = 0; i < pageItems.length; i++ ) {
							arr.push(pageItems[i].getAttribute('chapter'));
						}
						const unique = [...new Set(arr)]
						if ( unique.length > 3 ) {
							let length = pageItems.length;
							if ( type == 'prev' ) {
								while ( parent.lastChild.getAttribute('chapter') == unique[unique.length - 1] ) {
									parent.removeChild(parent.lastChild);
								}
							} else {
								while ( parent.firstChild.getAttribute('chapter') == unique[0] ) {
									parent.removeChild(parent.firstChild);
								}
							}
						}
					}
				} else {
					let scrollBox = document.getElementById('scroll-box' + this.pageProp.dataId);
					let type = scrollBox.firstChild ? pages[0].chapter < scrollBox.firstChild.getAttribute('chapter') ? 'prev' : 'next' : 'init';
					let scrollChapter = this.createScrollChapter(scrollBox, pages[0].chapter);
					for ( let i = 0; i < pages.length; i++ ) {
						let scrollDom = this.createScrollItem(scrollChapter, pages[i], i);
						for ( let j = 0; j < pages[i].text.length; j++ ) {
							this.insetScrollText(scrollDom, pages[i].text[j], this.pageProp.fontSize);
						}
					}
					this.resetProp();
					if ( type == 'prev' ) {
						scrollBox.scrollTop = scrollChapter.offsetHeight;
						if ( document.getElementsByClassName('scroll-chapter-box').length > 3 ) scrollBox.removeChild(scrollBox.lastChild);
					} else if ( type == 'next' ) {
						if ( document.getElementsByClassName('scroll-chapter-box').length > 3 ) scrollBox.removeChild(scrollBox.firstChild);
						scrollBox.scrollTop = scrollBox.scrollHeight - scrollBox.lastChild.offsetHeight - scrollBox.offsetHeight;
					} else {
						//初始化时，定位阅读位置
						let scrollItems = document.getElementsByClassName('scroll-item')
						let offsetHeight = 0;
						for ( let i = 0; i < scrollItems.length; i++ ) {
							offsetHeight += i > 0 ? scrollItems[i].offsetHeight : 0;
							if ( this.currentInfo.start >= scrollItems[i].getAttribute('start') && this.currentInfo.start < scrollItems[i].getAttribute('end') ) {
								scrollBox.scrollTop = offsetHeight;
							}
						}
						this.bindScrollEvent();
						this.preloadContent(this.currentInfo.chapter);
						if ( this.currentInfo.chapter > 1 ) {
							this.scroll(scrollBox);
						}
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
			createPageItem (el, info, type, i) {
				let pageItem = document.createElement('div');
				pageItem.style.width = '100%';
				pageItem.style.height = '100%';
				pageItem.style.overflow = 'hidden';
				pageItem.style.position = 'absolute';
				pageItem.style.top = 0;
				pageItem.style.left = 0;
				pageItem.style.zIndex = -(info.chapter * 100000 + i);
				if ( this.currentInfo.start >= info.start && this.currentInfo.start < info.end && this.currentInfo.chapter == info.chapter ) {
					pageItem.setAttribute('class', 'page-item page-item-actived page-item-chapter__' + (info.chapter + info.start));
				} else {
					pageItem.setAttribute('class', 'page-item page-item-chapter__' + (info.chapter + info.start));
				}
				pageItem.setAttribute('chapter', info.chapter);
				pageItem.setAttribute('start', info.start);
				pageItem.setAttribute('end', info.end);
				pageItem.setAttribute('isChapterEnd', info.isChapterEnd);
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
				if ( type == 'init' ) {
					el.appendChild(pageItem);
				} else if ( type == 'next' ) {
					el.appendChild(pageItem);
				} else {
					let node = document.getElementsByClassName('page-item-chapter__' + (info.chapter + 1))[0];
					el.insertBefore(pageItem, node);
				}
				return document.getElementsByClassName('page-item-chapter__' + (info.chapter + info.start))[0];
			},
			//创建滚动布局下的章节盒子
			createScrollChapter (el, chapter) {
				let divDom = document.createElement('div');
				divDom.style.width = '100%';
				divDom.setAttribute('class', 'scroll-chapter-box scroll-box-chapter__' + chapter);
				divDom.setAttribute('chapter', chapter);
				if ( chapter > (el.lastChild ? el.lastChild.getAttribute('chapter') : 0) ) {
					el.appendChild(divDom);
				}
				if ( chapter < (el.firstChild ? el.firstChild.getAttribute('chapter') : 0) ) {
					el.insertBefore(divDom, el.firstChild);
				}
				return document.getElementsByClassName('scroll-box-chapter__' + chapter)[0]
			},
			//创建滚动布局下的的页面盒子
			createScrollItem (el, info, value) {
				let divDom = document.createElement('div');
				divDom.style.width = '100%';
				divDom.setAttribute('class', 'scroll-item scroll-chapter__' + info.chapter);
				divDom.setAttribute('chapter', info.chapter);
				divDom.setAttribute('start', info.start);
				divDom.setAttribute('end', info.end);
				divDom.setAttribute('isChapterEnd', info.isChapterEnd);
				el.appendChild(divDom);
				return document.getElementsByClassName('scroll-chapter__' + info.chapter)[value]
			},
			//创建滚动布局下的的文字盒子
			insetScrollText (el, text, height = 0) {
				let pDom = document.createElement('p');
				pDom.style.fontSize = this.pageProp.fontSize + 'px';
				pDom.style.marginTop = this.pageProp.lineHeight + 'px';
				pDom.style.height = height ? height + 'px' : 'auto';
				pDom.style.whiteSpace = 'pre-wrap';
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
				this.currentInfo.chapter = boxs[index + value].getAttribute('chapter');
				this.currentInfo.start = boxs[index + value].getAttribute('start');
				this.currentInfo.end = boxs[index + value].getAttribute('end');
				this.currentInfo.isChapterEnd = boxs[index + value].getAttribute('isChapterEnd');
				this.triggerCurrentChange(this.currentInfo);
				if ( value < 0 && this.currentInfo.start == 0 && !boxs[index + value - 1] ) {
					let args = {'chapter': this.currentInfo.chapter, 'isTop': true};
					this.scrollToUpper(args);
				}
				if ( value > 0 && !boxs[index + value + 1] ) {
					let args = {'chapter': this.currentInfo.chapter, 'isBottom': true};
					this.scrollToLower(args);
				}
			},
			//参数改变
			pagePropChange (newValue, oldValue) {
				if ( newValue.fontSize != oldValue.fontSize ) {//字体大小改变
					this.restartDrawText(this.currentInfo.chapter);
				}
				if ( newValue.lineHeight != oldValue.lineHeight ) {//字体行高改变
					this.restartDrawText(this.currentInfo.chapter);
				}
				if ( newValue.color != oldValue.color || newValue.bgColor != oldValue.bgColor ) {//字体颜色改变
					if ( this.pageProp.pageType != 'scroll' ) {
						// this.restartDrawText(this.currentInfo.chapter);
						this.colorChange();
					}
				}
				if ( newValue.pageType != oldValue.pageType ) {//翻页模式改变
					this.restartDrawText(this.currentInfo.chapter);
				}
				if ( newValue.isNewChapter != oldValue.isNewChapter ) {//绘制新章节通知
					this.isNewChapterChange(newValue.isNewChapter);
				}
				if ( newValue.restart != oldValue.restart ) {//重绘页面通知
					this.restartChange(newValue.restart);
				}
			},
			//重绘页面
			restartDrawText (chapter) {
				this.pages = [];
				let index = this.indexOfRender(this.pageProp.contents, 'chapter', chapter);
				if ( this.pageProp.pageType == 'scroll' ) {
					document.getElementById('scroll-box' + this.pageProp.dataId).innerHTML = '';
					this.computedText(this.pageProp.contents[index].content, this.pageProp.contents[index].chapter);
				} else {
					document.getElementById('content' + this.pageProp.dataId).innerHTML = '';
					this.computedText(this.pageProp.contents[index].content, this.pageProp.contents[index].chapter);
				}
			},
			restartChange (newValue) {
				if ( newValue ) {
					let index = this.indexOfRender(this.pageProp.contents, 'chapter', this.pageProp.newChapter);
					this.currentInfo.chapter = this.pageProp.contents[index].chapter;
					this.currentInfo.start = this.pageProp.contents[index].start;
					this.restartDrawText(this.currentInfo.chapter);
				}
			},
			isNewChapterChange (newValue) {
				if ( newValue ) {
					let index = this.indexOfRender(this.pageProp.contents, 'chapter', this.pageProp.newChapter);
					this.computedText(this.pageProp.contents[index].content, this.pageProp.newChapter);
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
			scrollToLower (args) {
				// #ifndef H5
				UniViewJSBridge.publishHandler('onWxsInvokeCallMethod', {
					cid: this._$id,
					method: 'getNextContent',
					args: args
				})
				// #endif
				// #ifdef H5
				this.getNextContent(args)
				// #endif
			},
			scrollToUpper (args) {
				// #ifndef H5
				UniViewJSBridge.publishHandler('onWxsInvokeCallMethod', {
					cid: this._$id,
					method: 'getPrevContent',
					args: args
				})
				// #endif
				// #ifdef H5
				this.getPrevContent(args)
				// #endif
			},
			preloadContent (chapter) {
				// #ifndef H5
				UniViewJSBridge.publishHandler('onWxsInvokeCallMethod', {
					cid: this._$id,
					method: 'preload',
					args: {'chapter': chapter}
				})
				// #endif
				// #ifdef H5
				this.preload({'chapter': chapter})
				// #endif
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
				this.preloadContent(currentInfo.chapter);
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
			},
			/**
			 * 数组查找符合条件元素并返回下标
			 * @param {Array} arr 传入数组
			 * @param {String} value 条件元素
			 * @param {String} query 对比key值
			*/
			indexOfRender (arr, query, value) {
				let len = arr.length;
				for ( let i = 0; i < len; i++ ) {
					if ( arr[i][query] == value ) {
						return parseInt(i);
					}
				}
				return -1;
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
		box-sizing: border-box;
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