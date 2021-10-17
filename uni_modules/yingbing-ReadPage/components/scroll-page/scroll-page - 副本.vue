<template>
	<div :prop="scrollPageProp" :change:prop="scrollPage.propChange" id="scrollPage" class="scroll-page" :style="{
	'color': color,
	'background': bgColor}">
		<!-- <div>
			<div class="pulldown-wrapper">
				<div class="pulldown-loading">
					<page-refresh :padding="`${topGap}px 0 0 0`" :color="color">下拉加载内容
					</page-refresh>
				</div>
				<div class='pulldown-finish' :style="{color: color, 'padding-top': topGap + 'px'}"></div>
			</div>
			<div :style="{height: topGap + 'px', width: '100%'}"></div>
			<div id="scrollContent" class="infinity-timeline"></div>
			<div :style="{height: bottomGap + 'px', width: '100%'}"></div>
			<div class="pullup-tips">
				<div class="pullup-loading">
					<page-refresh :padding="`0 0 ${bottomGap}px 0`" :color="color">正在加载内容
					</page-refresh>
				</div>
				<div class='pullup-finish' :style="{color: color, 'padding-top': topGap + 'px'}"></div>
			</div>
		</div> -->
		<computed-page ref="computedPage" :pageType="pageType" :fontSize="fontSize" :lineHeight="lineHeight"
			:slide="slide" :topGap="topGap" :bottomGap="bottomGap"></computed-page>
		<div class="template">
			<li ref="list" class="infinity-item infinity-list">
			</li>
			<li ref="tombstone" class="infinity-item tombstone">
				<page-refresh :color="color">正在加载内容
				</page-refresh>
			</li>
		</div>
		<!-- <div class="pulldown-wrapper">
			<div class="pulldown-loading">
				<page-refresh :padding="`${topGap}px 0 0 0`" :color="color">下拉加载内容
				</page-refresh>
			</div>
			<div class='pulldown-finish' :style="{color: color, 'padding-top': topGap + 'px'}"></div>
		</div> -->
		<div class="infinity-timeline">
			<ul :style="{padding: `${topGap}px 0 ${bottomGap}px 0`}"></ul>
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
				pullupStatus: 'none',
				pulldownStatus: 'none'
			}
		},
		computed: {
			scrollPageProp() {
				return {
					slide: this.slide,
					topGap: this.topGap,
					bottomGap: this.bottomGap,
					fontSize: this.fontSize,
					lineHeight: this.lineHeight,
					refreshHeight: uni.upx2px(100),
					contents: JSON.parse(JSON.stringify(this.contents)),
					pages: JSON.parse(JSON.stringify(this.pages)),
					pullupStatus: this.pullupStatus,
					pulldownStatus: this.pulldownStatus
				}
			}
		},
		methods: {
			init(data) {
				this.contents = data.contents;
				// this.resetPage(data);
			},
			//重绘页面
			resetPage(data) {
				this.pages = [];
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
								pages[index].init = true;
							}
							arr = arr.concat(pages)
							if (i == contents.length - 1) {
								this.pages = arr;
								this.preload(data.currentChapter);
							} else {
								setTimeout(() => {
									dowhile(i + 1)
								}, 100)
							}
						})
					}
					dowhile(0)
				}, 20)
			},
			//加载更多章节
			loadmore(load) {
				const chapter = load.chapter;
				const type = load.type;
				const contentIndex = this.contents.findIndex(item => item.chapter == chapter);
				if (contentIndex > -1) {
					const data = {
						content: this.contents[contentIndex],
						type: type
					}
					this.computedPage(data);
					this.preload(chapter)
					if (type == 'next')
						this.pullupStatus = 'success';
					else
						this.pulldownStatus = 'success';
				} else {
					this.$emit('loadmore', chapter, (status, contents) => {
						if (status == 'success') {
							this.contents = JSON.parse(JSON.stringify(contents))
							const index = this.contents.findIndex(item => item.chapter == chapter)
							const data = {
								content: this.contents[index],
								type: type
							}
							this.computedPage(data);
							this.preload(chapter)
						}
						if (type == 'next')
							this.pullupStatus = status;
						else
							this.pulldownStatus = status;
					})
				}
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
					}).catch(() => {
						resolve([])
					})
				})
			},
			computedPage(e) {
				this.computedChapter(e.content).then((pages) => {
					let pagesSync = e.type == 'prev' ? pages.concat(this.pages) : this.pages.concat(pages);
					let arr = [];
					pagesSync.forEach(item => {
						if (arr.indexOf(item.chapter) == -1) arr.push(item.chapter)
					})
					if (arr.length > 3) {
						let reChapter = e.type == 'prev' ? pagesSync[pagesSync.length - 1].chapter : pagesSync[0]
							.chapter;
						this.pages = pagesSync.filter(item => item.chapter != reChapter);
					} else {
						this.pages = pagesSync;
					}
				});
			},
			scrollEnd(e) {
				this.$emit('scrollEnd', e);
			},
			resetPulldownStatus() {
				this.pulldownStatus = 'none';
			},
			resetPullupStatus() {
				this.pullupStatus = 'none';
			}
		}
	}
</script>

<script lang="renderjs" type="module" module="scrollPage">
	import Vue from 'vue'
	import BScroll from '../../node_modules/@better-scroll/core'
	import PullDown from '../../node_modules/@better-scroll/pull-down'
	import PullUp from '../../node_modules/@better-scroll/pull-up'
	import InfinityScroll from '../../node_modules/@better-scroll/infinity'
	BScroll.use(PullDown)
	BScroll.use(PullUp)
	BScroll.use(InfinityScroll)
	const TIME_BOUNCE = 200;
	const TIME_WATING = 500;
	
	const NUM_AVATARS = 4
	const NUM_IMAGES = 77
	const INIT_TIME = new Date().getTime()
	
	let THRESHOLD_PULL;
	let STOP_PULL;
	let myScrollPageDom
	let bs;
	export default {
		data() {
			return {
				scrollInfo: {
					scrollTop: 0,
					scrollHeight: 0,
					offsetHeight: 0
				},
				oldFirstChild: '',
				pagesSync: []
			}
		},
		mounted() {
			this.initDom.bind(this);
			THRESHOLD_PULL = this.scrollPageProp.refreshHeight + this.scrollPageProp.topGap;
			STOP_PULL = THRESHOLD_PULL + 20;
			// new Vue({
			// 	el: '#scrollContent',
			// 	render: (h) => {
			// 		return h('div', {
			// 			attrs: {
			// 				id: 'scroll-content'
			// 			}
			// 		}, this.pagesSync.map(item => {
			// 			return h('div', {
			// 				class: 'scroll-item scroll-item_' + item.dataId,
			// 				attrs: {
			// 					chapter: item.chapter,
			// 					start: item.start,
			// 					end: item.end,
			// 					type: item.type,
			// 					'data-id': item.dataId
			// 				},
			// 				style: {
			// 					width: '100%',
			// 					'box-sizing': 'border-box',
			// 					padding: '1px ' + this.scrollPageProp.slide + 'px',

			// 				}
			// 			}, item.type == 'text' ? item.text.map((text, i) => {
			// 				return h('p', {
			// 					class: 'scroll-text',
			// 					style: {
			// 						'font-size': this.scrollPageProp.fontSize +
			// 							'px',
			// 						'margin-top': this.scrollPageProp
			// 							.lineHeight + 'px',
			// 						height: (this.scrollPageProp.fontSize +
			// 								4) +
			// 							'px',
			// 						'font-family': '"Microsoft YaHei", 微软雅黑',
			// 						'white-space': 'pre-wrap',
			// 					}
			// 				}, text)
			// 			}) : [h('p', {
			// 				class: 'scroll-text',
			// 				style: {
			// 					'text-align': 'center',
			// 					'font-size': '20px',
			// 					padding: '60px 0',
			// 					'font-family': '"Microsoft YaHei", 微软雅黑',
			// 					'font-weight': 'bold'
			// 				}
			// 			}, item.text)])
			// 		}))
			// 	}
			// })
			bs = new BScroll('.infinity-timeline', {
				scrollY: true,
				startY: 0,
				// bounce: {
				// 	top: true,
				// 	bottom: false,
				// 	left: false,
				// 	right: false
				// },
				// bounceTime: TIME_BOUNCE,
				pullDownRefresh: {
					threshold: THRESHOLD_PULL,
					stop: STOP_PULL
				},
				// pullUpLoad: {
				// 	threshold: 0
				// },
				infinity: {
				  createTombstone: () => {
					return this.$refs.tombstone.cloneNode(true)
				  },
				  render: (item, div) => {
				    div = div || this.$refs.list.cloneNode(true)
				  	div.innerHTML = item.title
				    return div
				  },
				  fetch: (count) => {
					count = Math.max(30, count)
				    // Fetch at least 30 or count more objects for display.
				    return new Promise((resolve, reject) => {
				      // Assume 50 ms per item.
				      setTimeout(() => {
						let items = []
						for (let i = 0; i < Math.abs(count); i++) {
						  items.push({
							  id: Math.random(),
							  title: i
						  })
						}
				        resolve(items)
				      }, 500)
				    })
				  }
				}
			})
			// bs.disable();
			// bs.on('scrollEnd', this.bindScrollEvent)
			// bs.on('pullingDown', () => {
			// 	//下拉刷新时重置上拉刷新状态
			// 	if (document.getElementsByClassName('pullup-loading')[0].style.display != 'flex') {
			// 		document.getElementsByClassName('pullup-loading')[0].style.display = 'flex';
			// 		document.getElementsByClassName('pullup-finish')[0].innerHTML = ''
			// 		document.getElementsByClassName('pullup-finish')[0].style.display = 'none'
			// 		bs.finishPullUp();
			// 	}
			// 	const nowChapter = parseInt(this.pagesSync[0].chapter);
			// 	const nowContentIndex = this.scrollPageProp.contents.findIndex(item => item.chapter == nowChapter);
			// 	if (!this.scrollPageProp.contents[nowContentIndex].isStart) {
			// 		bs.disable();
			// 		this.triggerLoadmore(nowChapter - 1, 'prev');
			// 	} else {
			// 		document.getElementsByClassName('pulldown-loading')[0].style.display = 'none';
			// 		document.getElementsByClassName('pulldown-finish')[0].innerHTML = '------已经到第一章了------'
			// 		document.getElementsByClassName('pulldown-finish')[0].style.display = 'block'
			// 		window.setTimeout(() => {
			// 			bs.finishPullDown();
			// 		}, TIME_WATING)
			// 	}
			// })
			// bs.on('pullingUp', () => {
			// 	//上拉刷新时重置下拉刷新状态
			// 	if (document.getElementsByClassName('pulldown-loading')[0].style.display != 'flex') {
			// 		document.getElementsByClassName('pulldown-loading')[0].style.display = 'flex';
			// 		document.getElementsByClassName('pulldown-finish')[0].innerHTML = ''
			// 		document.getElementsByClassName('pulldown-finish')[0].style.display = 'none'
			// 	}
			// 	const nowChapter = parseInt(this.pagesSync[this.pagesSync.length - 1].chapter);
			// 	const nowContentIndex = this.scrollPageProp.contents.findIndex(item => item.chapter == nowChapter);
			// 	if (!this.scrollPageProp.contents[nowContentIndex].isEnd) {
			// 		bs.disable();
			// 		this.triggerLoadmore(nowChapter + 1, 'next');
			// 	} else {
			// 		document.getElementsByClassName('pullup-loading')[0].style.display = 'none';
			// 		document.getElementsByClassName('pullup-finish')[0].innerHTML = '------已经到最后一章了------'
			// 		document.getElementsByClassName('pullup-finish')[0].style.display = 'block'
			// 	}
			// })
		},
		methods: {
			initDom() {
				myScrollPageDom = scrollPage.init(document.getElementById('scrollPage'));
				// 观测更新的数据在 view 层可以直接访问到
				myScrollPageDom.setOption(this.scrollPageProp);
			},
			//参数改变
			propChange(newValue, oldValue) {
				for (let i in newValue.pages) {
					if (!this.diff(newValue.pages[i], oldValue.pages.length > 0 ? oldValue.pages[i] : '')) {
						this.pagesChange(newValue.pages, oldValue.pages);
						break;
					}
				}
				if (newValue.pulldownStatus != oldValue.pulldownStatus) {
					this.pulldownStatusChange(newValue.pulldownStatus, oldValue.pulldownStatus);
				}
				if (newValue.pullupStatus != oldValue.pullupStatus) {
					this.pullupStatusChange(newValue.pullupStatus, oldValue.pullupStatus);
				}
				if (newValue.fontSize != oldValue.fontSize) {
					this.triggerResetPage();
				}
				if (newValue.lineHeight != oldValue.lineHeight) {
					this.triggerResetPage();
				}
			},
			//监听下拉加载状态变化
			pulldownStatusChange(newValue) {
				switch (newValue) {
					case 'success':
						bs.finishPullDown();
						break;
					case 'fail':
						document.getElementsByClassName('pulldown-loading')[0].style.display = 'none';
						document.getElementsByClassName('pulldown-finish')[0].innerHTML = '------请求内容失败------'
						document.getElementsByClassName('pulldown-finish')[0].style.display = 'block'
						window.setTimeout(() => {
							bs.finishPullDown();
							bs.enable();
							window.setTimeout(() => {
								document.getElementsByClassName('pulldown-loading')[0].style.display =
									'flex';
								document.getElementsByClassName('pulldown-finish')[0].innerHTML = ''
								document.getElementsByClassName('pulldown-finish')[0].style.display =
									'none'
							}, 50)
						}, TIME_WATING)
						break;
					case 'timeout':
						document.getElementsByClassName('pulldown-loading')[0].style.display = 'none';
						document.getElementsByClassName('pulldown-finish')[0].innerHTML = '------请求超时------'
						document.getElementsByClassName('pulldown-finish')[0].style.display = 'block'
						window.setTimeout(() => {
							bs.finishPullDown();
							bs.enable();
							window.setTimeout(() => {
								document.getElementsByClassName('pulldown-loading')[0].style.display =
									'flex';
								document.getElementsByClassName('pulldown-finish')[0].innerHTML = ''
								document.getElementsByClassName('pulldown-finish')[0].style.display =
									'none'
							}, 50)
						}, TIME_WATING)
						break;
					default:
						console.log('重置pulldown')
				}
				this.triggerResetPulldownStatus();
			},
			//监听上拉加载状态变化
			pullupStatusChange(newValue) {
				switch (newValue) {
					case 'success':
						bs.finishPullUp();
						break;
					case 'fail':
						document.getElementsByClassName('pullup-loading')[0].style.display = 'none';
						document.getElementsByClassName('pullup-finish')[0].innerHTML = '------请求失败,点击重试------'
						document.getElementsByClassName('pullup-finish')[0].style.display = 'block'
						document.getElementsByClassName('pullup-finish')[0].addEventListener('touchend', function() {
							bs.finishPullUp();
							document.getElementsByClassName('pullup-loading')[0].style.display = 'flex';
							document.getElementsByClassName('pullup-finish')[0].innerHTML = ''
							document.getElementsByClassName('pullup-finish')[0].style.display = 'none';
							bs.autoPullUpLoad();
							document.getElementsByClassName('pullup-finish')[0].removeEventListener('touchend',
								function() {}, false);
						}, false)
						bs.enable();
						break;
					case 'timeout':
						document.getElementsByClassName('pullup-loading')[0].style.display = 'none';
						document.getElementsByClassName('pullup-finish')[0].innerHTML = '------请求超时,点击重试------'
						document.getElementsByClassName('pullup-finish')[0].style.display = 'block'
						document.getElementsByClassName('pullup-finish')[0].addEventListener('touchend', function() {
							bs.finishPullUp();
							document.getElementsByClassName('pullup-loading')[0].style.display = 'flex';
							document.getElementsByClassName('pullup-finish')[0].innerHTML = ''
							document.getElementsByClassName('pullup-finish')[0].style.display = 'none';
							bs.autoPullUpLoad();
							document.getElementsByClassName('pullup-finish')[0].removeEventListener('touchend',
								function() {}, false);
						}, false)
						bs.enable();
						break;
					default:
						console.log('重置pullup')
				}
				this.triggerResetPullupStatus();
			},
			pagesChange(newValue, oldValue) {
				let adHeight = 0;
				let reHeight = 0;
				for (let i in oldValue) {
					let index = newValue.findIndex(item => item.dataId == oldValue[i].dataId);
					if (index == -1) {
						if (oldValue[i].dataId < (newValue.length > 0 ? newValue[0].dataId : -1)) {
							reHeight += document.getElementsByClassName('scroll-item_' + oldValue[i].dataId)[0]
								.offsetHeight;
						}
					}
				}
				this.pagesSync = JSON.parse(JSON.stringify(newValue));
				this.$nextTick(() => {
					window.setTimeout(() => {
						bs.refresh();
						for (let i in newValue) {
							let index = oldValue.findIndex(item => item.dataId == newValue[i].dataId);
							if (index == -1) {
								if (newValue[i].dataId < (oldValue.length > 0 ? oldValue[0].dataId : -1)) {
									adHeight += document.getElementsByClassName('scroll-item_' + newValue[
										i].dataId)[0].offsetHeight;
								}
							}
						}
						if (adHeight > 0) {
							const stop = this.scrollInfo.scrollTop > 0 ? STOP_PULL : 0
							bs.scrollTo(0, -(this.scrollInfo.scrollTop - stop + adHeight));
						}
						if (reHeight > 0) {
							bs.scrollTo(0, -(this.scrollInfo.scrollTop - reHeight));
						}
						if (oldValue.length == 0) {
							console.log('init')
							let initIndex = this.pagesSync.findIndex(item => item.init);
							if (initIndex > -1) {
								let scrollTop = document.getElementsByClassName('scroll-item_' + this
									.pagesSync[initIndex].dataId)[0].offsetTop;
								bs.scrollTo(0, -scrollTop);
							}
						}
						bs.enable();
					}, 50)
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
			//绑定滚动事件
			bindScrollEvent(e) {
				const scroll = document.getElementById('scrollPage')
				this.scrollInfo = {
					scrollTop: Math.abs(e.y),
					scrollHeight: scroll.scrollHeight,
					offsetHeight: scroll.offsetHeight
				}
				// if (Math.ceil(this.scrollInfo.scrollTop + this.scrollInfo.offsetHeight) >= this.scrollInfo
				// 	.scrollHeight) { //触底
				// 	console.log('触底')
				// }
				if (this.scrollInfo.scrollTop <= 0) { //触顶
					const nowChapter = parseInt(this.pagesSync[0].chapter)
					const nowContentIndex = this.scrollPageProp.contents.findIndex(item => item.chapter == nowChapter);
					if (!this.scrollPageProp.contents[nowContentIndex].isStart) {
						const prevContentIndex = this.scrollPageProp.contents.findIndex(item => item.chapter ==
							nowChapter - 1);
						if (prevContentIndex > -1) {
							bs.disable();
							if (document.getElementsByClassName('pullup-loading')[0].style.display != 'flex') {
								document.getElementsByClassName('pullup-loading')[0].style.display = 'flex';
								document.getElementsByClassName('pullup-finish')[0].innerHTML = ''
								document.getElementsByClassName('pullup-finish')[0].style.display = 'none'
								bs.finishPullUp();
							}
							this.triggerLoadmore(nowChapter - 1, 'prev');
						}
					}
				}
				this.triggerScrollEnd();
			},
			computedPageInfo() {
				const scroll = document.getElementById('scrollPage');
				const scrollItems = scroll.getElementsByClassName('scroll-item');
				const scrollTop = this.scrollInfo.scrollTop + this.scrollPageProp.topGap + this.scrollPageProp.bottomGap;
				let dataId = -1;
				for (let i = 0; i < scrollItems.length; i++) {
					let offsetTop = scrollItems[i].offsetTop;
					let offsetBottom = scrollItems[i].offsetTop + scrollItems[i].offsetHeight;
					if (scrollTop >= offsetTop && scrollTop < offsetBottom) {
						dataId = parseInt(scrollItems[i].getAttribute('data-id'))
					}
				}
				if (!dataId) {
					if (scrollTop < scrollItems[0].offsetTop) {
						dataId = parseInt(scrollItems[0].getAttribute('data-id'))
					}
					if (scrollTop > scrollItems[scrollItems.length - 1].offsetTop + scrollItems[scrollItems.length - 1]
						.offsetHeight) {
						dataId = parseInt(scrollItems[scrollItems.length - 1].getAttribute('data-id'))
					}
				}
				let index = this.pagesSync.findIndex(item => item.dataId == dataId);
				let pageInfo = this.pagesSync[index];
				const nowChapters = this.pagesSync.filter(item => item.chapter == pageInfo.chapter)
				const contentIndex = this.scrollPageProp.contents.findIndex(content => content.chapter == pageInfo.chapter)
				if (this.scrollPageProp.contents[contentIndex].title) pageInfo.title = this.scrollPageProp.contents[
					contentIndex].title;
				pageInfo.totalPage = nowChapters.length;
				pageInfo.currentPage = nowChapters.findIndex(item => item.dataId == pageInfo.dataId) + 1;
				return pageInfo
			},
			triggerResetPulldownStatus() {
				// #ifndef H5
				this.$ownerInstance.callMethod('resetPulldownStatus');
				// #endif
				// #ifdef H5
				this.resetPulldownStatus();
				// #endif
			},
			triggerResetPullupStatus() {
				// #ifndef H5
				this.$ownerInstance.callMethod('resetPullupStatus');
				// #endif
				// #ifdef H5
				this.resetPullupStatus();
				// #endif
			},
			triggerComputedPage(e) {
				// #ifndef H5
				this.$ownerInstance.callMethod('computedPage', e);
				// #endif
				// #ifdef H5
				this.computedPage(e);
				// #endif
			},
			triggerLoadmore(chapter, type) {
				const data = {
					chapter: chapter,
					type: type
				}
				// #ifndef H5
				this.$ownerInstance.callMethod('loadmore', data);
				// #endif
				// #ifdef H5
				this.loadmore(data);
				// #endif
			},
			triggerScrollEnd(e) {
				let pageInfo = this.computedPageInfo();
				// #ifndef H5
				this.$ownerInstance.callMethod('scrollEnd', pageInfo);
				// #endif
				// #ifdef H5
				this.scrollEnd(pageInfo);
				// #endif
			},
			triggerPreload(chapter) {
				// #ifndef H5
				this.$ownerInstance.callMethod('preload', chapter);
				// #endif
				// #ifdef H5
				this.preload(chapter);
				// #endif
			},
			triggerResetPage() {
				bs.disable();
				let pageInfo = this.computedPageInfo();
				this.pagesSync = [];
				const data = {
					start: pageInfo.start,
					currentChapter: pageInfo.chapter
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
	.scroll-page {
		width: 100%;
		height: 100%;
		position: absolute;
		left: 0;
		top: 0;
		box-sizing: border-box;
	}

	.pulldown-wrapper {
		position: absolute;
		width: 100%;
		padding: 20px;
		box-sizing: border-box;
		transform: translateY(-100%) translateZ(0);
		text-align: center;
		color: #999;
	}

	.pulldown-finish {
		display: none;
		height: 100rpx;
		line-height: 100rpx;
	}

	.pullup-tips {
		padding: 20px;
		text-align: center;
		color: #999;
	}
	.template {
		 display: none
	}
	.infinity-timeline {
		position: relative;
		overflow: hidden;
		will-change: transform;
		box-sizing: border-box;
		height: 100%;
	}
	.infinity-timeline > ul {
		position: relative;
		-webkit-backface-visibility: hidden;
		-webkit-transform-style: flat;
		margin: 0;
		padding: 0;
	}
	.infinity-state {
		display: none;
	}
	.infinity-invisible {
	  display: none;
	}
	.infinity-item {
		will-change: transform;
		contain: layout;
		list-style: none;
	}
	.infinity-list {
		width: 100%;
		height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.tombstone {
		width: 100%;
		box-sizing: border-box;
		height: 100px;
	}
</style>
