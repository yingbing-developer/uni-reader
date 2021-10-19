<template>
	<div :prop="flipPageProp" :change:prop="flipPage.propChange" id="flipPage" class="flip-page"
		:style="{background: bgColor}" @touchstart="flipPage.pageTouchstart" @touchmove="flipPage.pageTouchmove"
		@touchend="flipPage.pageTouchend">
		<div id="flip-content"></div>
		<computed-page ref="computedPage" :pageType="pageType" :fontSize="fontSize" :lineHeight="lineHeight"
			:slide="slide" :topGap="topGap" :bottomGap="bottomGap"></computed-page>
			
		<div class="loading" v-if="initLoading" :style="{background: bgColor, color: color, 'font-size': fontSize + 'px'}" @tap="refresh">
			<page-refresh v-if="loadStatus == 'none'" :color="color">{{loadingText}}</page-refresh>
			<text v-else>{{loadingText}}</text>
		</div>
	</div>
</template>

<script>
	export default {
		props: {
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
			},
			//开启预加载
			enablePreload: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				contents: [],
				pages: [],
				currentPageDataId: -1,
				moreLoading: false,
				initLoading: true,
				loadingText: '正在加载内容',
				loadStatus: 'none',
				loadChapter: -1,
				loadValue: 0
			}
		},
		computed: {
			flipPageProp() {
				return {
					pageType: this.pageType,
					pages: JSON.parse(JSON.stringify(this.pages)),
					topGap: this.topGap,
					bottomGap: this.bottomGap,
					slide: this.slide,
					color: this.color,
					fontSize: this.fontSize,
					lineHeight: this.lineHeight,
					bgColor: this.bgColor,
					currentPageDataId: this.currentPageDataId
				}
			}
		},
		methods: {
			init(data) {
				this.initLoading = true;
				this.contents = data.contents;
				this.resetPage(data);
			},
			//绘制页面
			resetPage(data) {
				setTimeout(() => {
					//一次最多渲染3章的内容，根据定位的章节剪切出3章内容渲染
					const nowIndex = this.contents.findIndex(item => item.chapter == data.currentChapter);
					let prevIndex = -1;
					let nextIndex = -1;
					let contents = [];
					if (!this.contents[nowIndex].isStart) prevIndex = this.contents.findIndex(item => item
						.chapter == data.currentChapter - 1);
					if (!this.contents[nowIndex].isEnd) nextIndex = this.contents.findIndex(item => item.chapter ==
						data.currentChapter + 1);
					if (prevIndex > -1) {
						contents.push(this.contents[prevIndex])
					}
					contents.push(this.contents[nowIndex])
					if (nextIndex > -1) {
						contents.push(this.contents[nextIndex])
					}
					let arr = [];
					const dowhile = (i) => {
						let item = contents[i];
						this.computedChapter(item).then(pages => {
							if (data.currentChapter == item.chapter) {
								let index = Object.keys(pages).findIndex(key => data.start >= pages[
										key].start &&
									data.start < pages[key].end)
								this.currentPageDataId = pages[index].dataId;
							}
							arr = arr.concat(pages)
							if (i == contents.length - 1) {
								arr.unshift({
									chapter: contents[0].chapter,
									type: contents[0].isStart ? 'top' : 'prevLoading',
									dataId: arr[0].dataId - 1,
									start: 0,
									end: 0
								})
								arr.push({
									chapter: item.chapter,
									type: item.isEnd ? 'bottom' : 'nextLoading',
									dataId: arr[arr.length - 1].dataId + 1,
									start: 0,
									end: 0
								})
								this.pages = arr;
								this.$nextTick(() => {
									this.currentChange();
									this.initLoading = false;
									this.preload(data.currentChapter);
								})
							} else {
								setTimeout(() => {
									dowhile(i + 1)
								}, 100)
							}
						})
					}
					dowhile(0)
				}, 50)
			},
			//预加载章节
			preload(chapter) {
				if (!this.enablePreload) return false
				const nowIndex = this.contents.findIndex(item => item.chapter == chapter);
				let prevIndex = -2;
				let nextIndex = -2;
				let chapters = [];
				if (!this.contents[nowIndex].isStart) prevIndex = this.contents.findIndex(item => item.chapter == chapter -
					1);
				if (!this.contents[nowIndex].isEnd) nextIndex = this.contents.findIndex(item => item.chapter == chapter +
					1);
				if (prevIndex == -1) {
					chapters.push(chapter - 1);
				}
				if (nextIndex == -1) {
					chapters.push(chapter + 1);
				}
				if (chapters.length > 0) {
					this.$emit('preload', chapters, (status, contents) => {
						if (status == 'success') {
							this.contents = JSON.parse(JSON.stringify(contents))
						}
					})
				}
			},
			computedChapter(content) {
				return new Promise((resolve) => {
					this.$refs.computedPage.computed({
						content: content.content,
						chapter: content.chapter
					}).then((pages) => {
						resolve(pages);
					})
				}).catch(() => {
					resolve([])
				})
			},
			computedPage(e) {
				this.computedChapter(e.content).then((pages) => {
					let arr = [];
					let newPages = [];
					const pagesSync = e.type == 'prev' ? pages.concat(this.pages) : this.pages.concat(pages);
					pagesSync.forEach(item => {
						if (arr.indexOf(item.chapter) == -1) arr.push(item.chapter)
					})
					if (arr.length > 3) {
						let reChapter = e.type == 'prev' ? pagesSync[pagesSync.length - 1].chapter : pagesSync[0]
							.chapter;
						newPages = pagesSync.filter(item => item.chapter != reChapter && item.type == 'text');
					} else {
						newPages = pagesSync.filter(item => item.type == 'text');
					}
					const prevIndex = this.contents.findIndex(content => content.chapter == newPages[0].chapter);
					const nextIndex = this.contents.findIndex(content => content.chapter == newPages[newPages
						.length - 1].chapter);
					newPages.unshift({
						chapter: this.contents[prevIndex].chapter,
						type: this.contents[prevIndex].isStart ? 'top' : 'prevLoading',
						dataId: newPages[0].dataId - 1,
						start: 0,
						end: 0
					})
					newPages.push({
						chapter: this.contents[nextIndex].chapter,
						type: this.contents[nextIndex].isEnd ? 'bottom' : 'nextLoading',
						dataId: newPages[newPages.length - 1].dataId + 1,
						start: 0,
						end: 0
					})
					this.pages = JSON.parse(JSON.stringify(newPages))
					const nowIndex = newPages.findIndex(page => page.dataId == this.currentPageDataId);
					if ( nowIndex == -1 ) {
						this.currentPageDataId = e.type == 'next' ? pages[0].dataId : pages[pages.length - 1].dataId;
						this.currentChange()
					} 
				});
			},
			changePageActived(value) {
				let index = this.pages.findIndex(page => page.dataId == this.currentPageDataId)
				let newIndex = index + value;
				this.currentPageDataId = this.pages[newIndex].dataId;
				this.currentChange();
				const nowType = this.pages[newIndex].type;
				const newType = this.pages[newIndex + value] ? this.pages[newIndex + value].type : null;
				if (nowType == 'nextLoading' || nowType == 'prevLoading' || newType == 'nextLoading' || newType ==
					'prevLoading') {
					if (this.moreLoading) return
					this.moreLoading = true;
					const loadChapter = this.pages[newIndex].chapter + value;
					const contentIndex = this.contents.findIndex(content => content.chapter == loadChapter)
					if (contentIndex > -1) {
						const data = {
							content: this.contents[contentIndex],
							type: value > 0 ? 'next' : 'prev'
						}
						this.computedPage(data);
						this.preload(loadChapter)
						this.moreLoading = false;
					} else {
						this.loadmore(loadChapter, value)
					}
				}
			},
			refresh () {
				if ( this.loadStatus == 'fail' || this.loadStatus == 'timeout' ) {
					this.initLoading = false
					this.loadingText = '正在加载内容'
					this.loadStatus = 'none';
					this.loadmore(this.loadChapter, this.loadValue);
					this.loadChapter = -1;
					this.loadValue = 0;
				}
			},
			loadmore (chapter, value) {
				this.$emit('loadmore', chapter, (status, contents) => {
					if (status == 'success') {
						this.contents = JSON.parse(JSON.stringify(contents))
						const index = this.contents.findIndex(item => item.chapter == chapter)
						const data = {
							content: this.contents[index],
							type: value > 0 ? 'next' : 'prev'
						}
						this.computedPage(data);
						this.preload(chapter)
						this.moreLoading = false;
					} else if ( status == 'fail' ) {
						this.loadStatus = status;
						this.loadingText = '请求失败，点击重试'
						this.initLoading = true
						this.loadChapter = chapter;
						this.loadValue = value;
					} else {
						this.loadStatus = status;
						this.loadingText = '请求超时，点击重试'
						this.initLoading = true
						this.loadChapter = chapter;
						this.loadValue = value;
					}
				})
			},
			currentChange() {
				const types = ['top', 'bottom', 'prevLoading', 'nextLoading'];
				const index = this.pages.findIndex(page => page.dataId == this.currentPageDataId);
				const type = this.pages[index].type;
				let pageInfo = types.indexOf(type) == -1 ? this.pages[index] : (type == 'top' || type == 'prevLoading') ?
					JSON.parse(JSON.stringify(this.pages[index + 1])) : JSON.parse(JSON.stringify(this.pages[index - 1]));
				const nowChapters = this.pages.filter(item => item.chapter == pageInfo.chapter)
				const contentIndex = this.contents.findIndex(content => content.chapter == pageInfo.chapter)
				pageInfo.totalPage = nowChapters.length;
				pageInfo.currentPage = nowChapters.findIndex(item => item.dataId == pageInfo.dataId) + 1;
				if ( this.contents[contentIndex].title ) pageInfo.title = this.contents[contentIndex].title;
				this.$emit('currentChange', pageInfo);
			},
			showToast(e) {
				uni.showToast({
					title: e.title,
					icon: 'none'
				})
			}
		}
	}
</script>

<script lang="renderjs" type="module" module="flipPage">
	let myFlipPageDom
	const animationRotate = `@keyframes animationRotate{
	    0% {
	      transform: rotateZ(0);
	    }
	    100% {
	      transform: rotateZ(360deg);
	    }
	}`
	import Vue from 'vue'
	export default {
		data() {
			return {
				pagesSync: [],
				disableTouch: true,
				pageEl: null,
				pageDirection: '',
				touchstart: {
					x: 0,
					y: 0
				},
				touchTime: 0,
				moveX: 0,
				viewWidth: 0,
				viewHeight: 0,
				colorSync: '',
				bgColorSync: '',
				currentPageDataIdSync: -1
			}
		},
		mounted() {
			this.initDom.bind(this);
			this.colorSync = this.flipPageProp.color;
			this.bgColorSync = this.flipPageProp.bgColor;
			const flip = document.getElementById('flipPage');
			this.viewWidth = flip.offsetWidth;
			this.viewHeight = flip.offsetHeight;
			this.currentPageDataIdSync = this.flipPageProp.currentPageDataId
			// const style = document.createElement('style')
			// style.type = 'text/css'
			// style.innerHTML = animationRotate
			// document.head.appendChild(style)
			new Vue({
				el: '#flip-content',
				render: (h) => {
					return h('div', {
						attrs: {
							class: 'flip-content'
						},
						style: {
							width: '100%',
							height: '100%',
							position: 'absolute',
							left: 0,
							top: 0,
							'box-sizing': 'border-box',
							overflow: 'hidden',
							'z-index': 1,
						}
					}, this.pagesSync.map((item, key) => {
						if (item.dataId == this.currentPageDataIdSync || (this.pagesSync[key + 1] ?
								this.pagesSync[key + 1].dataId : -1) == this
							.currentPageDataIdSync || (this.pagesSync[key - 1] ? this.pagesSync[
								key - 1].dataId : -1) == this.currentPageDataIdSync) {
								return h('div', {
									class: 'flip-item',
									key: item.dataId,
									attrs: {
										chapter: item.chapter,
										start: item.start,
										end: item.end,
										type: item.type,
										'data-id': item.dataId
									},
									style: this.createItemStyle(item)
								}, [
									h('div', {
										class: 'flip-item-content',
										style: this.createContentStyle(item)
									}, item.type == 'text' ? item.text.map((text, key) => {
										return h('p', {
											class: 'flip-text',
											key: key,
											style: {
												width: '100%',
												'box-sizing': 'border-box',
												'white-space': 'pre-wrap',
												'font-family': '"Microsoft YaHei", 微软雅黑',
												'margin-top': this.flipPageProp
													.lineHeight + 'px',
												height: this.flipPageProp
													.fontSize + 'px'
											}
										}, text)
									}) : (item.type == 'nextLoading' || item.type ==
										'prevLoading') ? [
										h('div', {
											class: 'loading',
											style: {
												position: 'absolute',
												width: '100%',
												height: '100%',
												top: 0,
												left: 0,
												'box-sizing': 'border-box',
												display: 'flex',
												'align-items': 'center',
												'justify-content': 'center'
											}
										}, [
											h('div', {
												style: {
													color: this.colorSync
												}
											}, '正在加载内容...')
										])
									] : [
										h('div', {
											class: 'loading',
											style: {
												position: 'absolute',
												width: '100%',
												height: '100%',
												top: 0,
												left: 0,
												'box-sizing': 'border-box',
												display: 'flex',
												'align-items': 'center',
												'justify-content': 'center'
											}
										}, item.type == 'top' ? '已经到第一章了' : '已经到最后一章了')
									]),
									h('div', {
										class: 'flip-item-bg',
										style: this.createBgStyle(item)
									}),
									h('div', {
										class: 'flip-item-shadow',
										style: this.createShadowStyle(item)
									})
								])
							}
					}))
				}
			})

			// Vue.component('page-refresh', {
			// 	props: {
			// 		color: {
			// 			type: String,
			// 			default: '#333'
			// 		}
			// 	},
			// 	render: function(h) {
			// 		const title = this.$slots.default
			// 		return h('div', {
			// 			class: 'page-refresh',
			// 			style: {
			// 				width: '100%',
			// 				height: '100rpx',
			// 				display: ' flex',
			// 				'align-items': 'center',
			// 				'justify-content': 'center'
			// 			}
			// 		}, [
			// 			h('div', {
			// 				style: {
			// 					'border-top': '5rpx solid' + this.color,
			// 					'border-left': '5rpx solid' + this.color,
			// 					'border-bottom': '5rpx solid' + this.color,
			// 					'border-right': '5rpx solid transparent',
			// 					width: '30rpx',
			// 					height: '30rpx',
			// 					'border-radius': '30rpx',
			// 					'margin-right': '10rpx',
			// 					animation: 'animationRotate 1s linear infinite'
			// 				}
			// 			})
			// 		])
			// 	}
			// })
			// const script = document.createElement('script');
			// script.src = 'https://cdn.bootcdn.net/ajax/libs/eruda/2.3.3/eruda.js'
			// script.onload = () => {
			// 	eruda.init()
			// }
			// document.head.appendChild(script);
		},
		methods: {
			initDom() {
				myFlipPageDom = flipPage.init(document.getElementById('flipPage'));
				// 观测更新的数据在 view 层可以直接访问到
				myFlipPageDom.setOption(this.flipPageProp);
			},
			//参数改变
			propChange(newValue, oldValue) {
				for (let i in newValue.pages) {
					if (!this.diff(newValue.pages[i], oldValue.pages.length > 0 ? oldValue.pages[i] : '')) {
						this.pagesSync = JSON.parse(JSON.stringify(newValue.pages));
						// this.disableTouch = false;
						this.pagesChange();
						break;
					}
				}
				if (newValue.currentPageDataId != oldValue.currentPageDataId) {
					this.currentPageDataIdSync = newValue.currentPageDataId
				}
				if (newValue.fontSize != oldValue.fontSize) {
					this.triggerResetPage();
				}
				if (newValue.lineHeight != oldValue.lineHeight) {
					this.triggerResetPage();
				}
				if (newValue.pageType != oldValue.pageType) {
					this.pagesChange();
				}
				if (newValue.color != oldValue.color) {
					this.colorSync = newValue.color
				}
				if (newValue.bgColor != oldValue.bgColor) {
					this.bgColorSync = newValue.bgColor
				}

			},
			pagesChange() {
				this.$nextTick(() => {
					const flip = document.getElementById('flipPage');
					this.viewWidth = flip.offsetWidth;
					this.viewHeight = flip.offsetHeight;
					const flipItems = flip.getElementsByClassName('flip-item');
					Object.keys(flipItems).forEach(key => {
						if (key >= 0) {
							if (parseInt(flipItems[key].getAttribute('data-id')) < this.flipPageProp
								.currentPageDataId) {
								this.pageAnimation(flipItems[key], 'next', -this.viewWidth);
							} else {
								this.pageAnimation(flipItems[key], 'next', 0);
							}
						}
					})
					this.disableTouch = false;
				})
			},
			diff(obj1, obj2) {
				var o1 = obj1 instanceof Object;
				var o2 = obj2 instanceof Object;
				// 判断是不是对象
				if (!o1 || !o2) {
					return obj1 === obj2;
				}

				//Object.keys() 返回一个由对象的自身可枚举属性(key值)组成的数组,
				//例如：数组返回下表：let arr = ["a", "b", "c"];console.log(Object.keys(arr))->0,1,2;
				if (Object.keys(obj1).length !== Object.keys(obj2).length) {
					return false;
				}

				for (var o in obj1) {
					var t1 = obj1[o] instanceof Object;
					var t2 = obj2[o] instanceof Object;
					if (t1 && t2) {
						return this.diff(obj1[o], obj2[o]);
					} else if (obj1[o] !== obj2[o]) {
						return false;
					}
				}
				return true;
			},
			getPageActived(value) {
				const flip = document.getElementById('flipPage')
				const flipItems = flip.getElementsByClassName('flip-item');
				const pageActivedIndex = Object.keys(flipItems).findIndex(key => {
					if (key >= 0) return parseInt(flipItems[key].getAttribute('data-id')) == this.flipPageProp
						.currentPageDataId
				});
				const pageActivedPrevIndex = pageActivedIndex - 1 >= 0 ? pageActivedIndex - 1 : -1;
				const pageActived = flipItems[pageActivedIndex];
				const pageActivedPrev = pageActivedPrevIndex > -1 ? flipItems[pageActivedPrevIndex] : null;
				if (pageActived.getAttribute('type') == 'bottom') {
					if (value == 0) {
						this.triggerShowToast({
							title: '已经到最后了'
						})
						return false
					} else {
						return pageActivedPrev
					}
				} else if (pageActived.getAttribute('type') == 'top') {
					if (value < 0) {
						this.triggerShowToast({
							title: '已经到最前面了'
						})
						return false
					} else {
						return pageActived
					}
				} else if (pageActived.getAttribute('type') == 'prevLoading') {
					if (value < 0) {
						this.triggerShowToast({
							title: '请等待内容加载'
						})
						return false
					} else {
						return pageActived
					}
				} else if (pageActived.getAttribute('type') == 'nextLoading') {
					if (value == 0) {
						this.triggerShowToast({
							title: '请等待内容加载'
						})
						return false
					} else {
						return pageActivedPrev
					}
				} else {
					if (value == 0) {
						return pageActived
					} else {
						return pageActivedPrev
					}
				}
				return false;
			},
			pageTouchstart(e) {
				if (this.disableTouch) {
					return;
				}
				if (e.touches.length == 1) {
					this.touchTimer = window.setInterval(() => {
						this.touchTime += 50;
					}, 50)
					let touch = e.touches[0];
					this.touchstart.x = touch.pageX;
					this.touchstart.y = touch.pageY;
					if (this.touchstart.x > (this.viewWidth / 4) * 3) {
						this.pageEl = this.getPageActived(0);
						this.pageDirection = 'next'
					}
					if (this.touchstart.x < (this.viewWidth / 4)) {
						this.pageEl = this.getPageActived(-1);
						this.pageDirection = 'prev'
					}
				}
			},
			pageTouchmove(e) {
				if (this.disableTouch || this.flipPageProp.pageType == 'none') {
					return;
				}
				if (e.touches.length == 1) {
					if (this.pageEl) {
						let touch = e.touches[0];
						let height = this.viewHeight / 2;
						let maxDeg = height / 5;
						let rotateZ = this.pageDirection == 'next' ? ((touch.pageY - height) / maxDeg) : -((touch.pageY -
							height) / maxDeg);
						if (this.touchstart.x > (this.viewWidth / 4) * 3 || this.touchstart.x < (this.viewWidth / 4)) {
							this.moveX = touch.pageX - this.touchstart.x;
						}
						this.pageAnimation(this.pageEl, this.pageDirection, this.moveX, rotateZ);
					}
				}
			},
			pageTouchend(e) {
				window.clearInterval(this.touchTimer);
				if (this.disableTouch) {
					return;
				}
				if (this.pageEl) {
					this.disableTouch = true;
					if (this.touchTime <= 200) {
						const duration = (this.flipPageProp.pageType == 'real' || this.flipPageProp.pageType == 'cover') ?
							1000 : 0
						const value = this.pageDirection == 'next' ? 1 : -1;
						this.pageDuration(this.pageEl, duration);
						this.$nextTick(() => {
							this.pageAnimation(this.pageEl, this.pageDirection, -value * this.viewWidth);
							window.setTimeout(() => {
								this.resetPageMove();
								this.triggerChangePageActived(value);
							}, duration + 50)
						})
					} else {
						const duration = (this.flipPageProp.pageType == 'real' || this.flipPageProp.pageType == 'cover') ?
							500 : 0
						if (Math.abs(this.moveX) >= this.viewWidth / 2.5) {
							const value = this.pageDirection == 'next' ? 1 : -1;
							this.pageDuration(this.pageEl, duration);
							this.$nextTick(() => {
								this.pageAnimation(this.pageEl, this.pageDirection, -value * this.viewWidth);
								window.setTimeout(() => {
									this.resetPageMove();
									this.triggerChangePageActived(value);
								}, duration + 50)
							})
						} else {
							this.pageDuration(this.pageEl, duration);
							this.$nextTick(() => {
								this.pageAnimation(this.pageEl, this.pageDirection, 0);
								window.setTimeout(() => {
									this.resetPageMove();
								}, duration + 50)
							})
						}
					}
				} else {
					this.resetPageMove();
				}
			},
			createItemStyle(item) {
				return {
					position: 'absolute',
					width: '100%',
					height: '100%',
					top: 0,
					left: 0,
					'box-sizing': 'border-box',
					overflow: 'hidden',
					'z-index': -item.dataId,
					transform: item.dataId < this.flipPageProp.currentPageDataId ? `translateX(${-this.viewWidth}px)` : ''
				}
			},
			createContentStyle(item) {
				return {
					position: 'absolute',
					width: '100%',
					height: '100%',
					left: 0,
					top: 0,
					'box-sizing': 'border-box',
					padding: `${this.flipPageProp.topGap}px ${this.flipPageProp.slide}px ${this.flipPageProp.bottomGap}px ${this.flipPageProp.slide}px`,
					background: this.bgColorSync,
					color: this.colorSync,
					'font-size': this.flipPageProp.fontSize + 'px',
					transform: item.dataId < this.flipPageProp.currentPageDataId ? this.flipPageProp.pageType == 'real' ?
						`translateX(${-this.viewWidth}px)` : 'translateX(0)' : ''
				}
			},
			createBgStyle(item) {
				return {
					position: 'absolute',
					width: '100%',
					height: '150vh',
					top: '50%',
					left: '100%',
					transform: 'translateY(-50%)',
					'box-shadow': '-5px 0 20px rgba(0,0,0,0.1)',
					background: this.bgColorSync,
					transform: item.dataId < this.flipPageProp.currentPageDataId ? this.flipPageProp.pageType == 'real' ?
						`translate(${-this.viewWidth}px, -50%)` : 'translateY(-50%)' : 'translateY(-50%)'
				}
			},
			createShadowStyle(item) {
				return {
					position: 'absolute',
					width: 0,
					height: '100%',
					top: 0,
					right: 0,
					'z-index': 9,
					'box-shadow': item.dataId < this.flipPageProp.currentPageDataId ? this.flipPageProp.pageType ==
						'real' ? '0 0 60px 30px rgba(0,0,0,0.5)' : '' : ''
				}
			},
			//翻页动画
			pageAnimation(el, direction, moveX, rotateZ = 0) {
				const lateX = direction == 'next' ? moveX : moveX - this.viewWidth;
				const content = el.getElementsByClassName('flip-item-content')[0];
				const bg = el.getElementsByClassName('flip-item-bg')[0];
				const shadow = el.getElementsByClassName('flip-item-shadow')[0];
				el.style.transform = `translateX(${lateX}px)`;
				content.style.transform = this.flipPageProp.pageType == 'real' ? `translateX(${-lateX}px)` :
					'translateX(0)';
				bg.style.transform = this.flipPageProp.pageType == 'real' ?
					`translate(${lateX}px, -50%) rotateZ(${rotateZ}deg)` : 'translateY(-50%)';
				shadow.style.boxShadow = '0 0 60px ' + (this.flipPageProp.pageType == 'real' ? Math.abs(lateX) > 30 ? 30 :
					Math.abs(lateX) : 0) + 'px rgba(0,0,0,0.5)';
			},
			pageDuration(el, duration) {
				const content = el.getElementsByClassName('flip-item-content')[0];
				const bg = el.getElementsByClassName('flip-item-bg')[0];
				const shadow = el.getElementsByClassName('flip-item-shadow')[0];
				el.style.transition = duration > 0 ? 'transform ' + duration + 'ms' : '';
				content.style.transition = duration > 0 ? 'transform ' + duration + 'ms' : '';
				bg.style.transition = duration > 0 ? 'transform ' + duration + 'ms' : '';
				shadow.style.transition = duration > 0 ? 'box-shadow ' + duration + 'ms' : '';
			},
			resetPageMove() {
				this.pageEl ? this.pageDuration(this.pageEl, 0) : false;
				this.disableTouch = false;
				this.moveX = 0;
				this.pageEl = '';
				this.pageDirection = 'next';
				this.touchTime = 0;
				this.touchstart.x = 0;
				this.touchstart.y = 0;
			},
			triggerShowToast(e) {
				// #ifndef H5
				this.$ownerInstance.callMethod('showToast', e);
				// #endif
				// #ifdef H5
				this.showToast(e);
				// #endif
			},
			triggerChangePageActived(value) {
				// #ifndef H5
				this.$ownerInstance.callMethod('changePageActived', value);
				// #endif
				// #ifdef H5
				this.changePageActived(value);
				// #endif
			},
			triggerResetPage() {
				const index = this.pagesSync.findIndex(page => page.dataId == this.flipPageProp.currentPageDataId);
				const data = {
					start: this.pagesSync[index].start,
					currentChapter: this.pagesSync[index].chapter
				}
				// #ifndef H5
				this.$ownerInstance.callMethod('resetPage', data);
				// #endif
				// #ifdef H5
				this.resetPage(data);
				// #endif
			},
		}
	}
</script>

<style scoped>
	.flip-page {
		width: 100%;
		height: 100%;
		position: absolute;
		left: 0;
		top: 0;
		box-sizing: border-box;
		overflow: hidden;
	}
	.loading {
		width: 100%;
		height: 100%;
		position: absolute;
		left: 0;
		top: 0;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2;
	}
</style>
