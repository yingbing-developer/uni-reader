<template>
	<div class="computed-page" :prop="computedPageProp" :change:prop="computedPage.propChange" :id="'computedPage' + dataId"></div>
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
			//翻页方式
			pageType: {
				type: String,
				default: 'scroll'
			},
			//字体大小（单位px）
			fontSize: {
				type: String | Number,
				default: 15
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
				content: '',
				isStart: false,
				chapter: null,
				resolve: null
			}
		},
		computed: {
			computedPageProp () {
				return {
					dataId: this.dataId,
					isStart: this.isStart,
					slide: this.slide > 0 ? parseInt(this.slide) : 0,
					topGap: this.topGap > 0 ? parseInt(this.topGap) : 0,
					bottomGap: this.bottomGap > 0 ? parseInt(this.bottomGap) : 0,
					fontSize: this.fontSize >= 12 ? parseInt(this.fontSize) : 12,//字体大小最小只能到12px，因为谷歌浏览器最小只支持12px
					lineHeight: this.lineHeight >= 5 ? parseInt(this.lineHeight) : 5,
					pageType: this.pageType,
					content: this.content,
					chapter: this.chapter
				};
			}
		},
		methods: {
			computed ({content, chapter}) {
				return new Promise((resolve) => {
					this.content = content;
					this.chapter = chapter || null;
					this.isStart = true;
					this.resolve = resolve;
				})
			},
			reset (pages) {
				this.resolve(pages);
				this.resolve = null;
				this.isStart = false;
				this.content = '';
				this.chapter = null;
				this.start = null;
				this.end = null;
			}
		}
	}
</script>

<script lang="renderjs" type="module" module="computedPage">
	let myComputedPageDom;
	export default {
		data () {
			return {
				viewWidth: 0,
				viewHeight: 0
			}
		},
		mounted () {
			this.initDom.bind(this);
		},
		methods: {
			initDom () {
				myComputedPageDom = computedPage.init(document.getElementById('computedPage' + this.computedPageProp.dataId));
				// 观测更新的数据在 view 层可以直接访问到
				myComputedPageDom.setOption(this.computedPageProp);
			},
			//计算页面显示文字
			computedText (start) {
				let parent = document.getElementById('computedPage' + this.computedPageProp.dataId);
				this.viewWidth = parent.offsetWidth;
				this.viewHeight = parent.offsetHeight;
				let computedCanvas = this.createComputedCanvas(parent);
				let context = computedCanvas.getContext('2d');
				context.font = this.computedPageProp.fontSize + 'px 微软雅黑';
				context.lineWidth = 1;
				let pageHeight = this.computedPageProp.fontSize + this.computedPageProp.lineHeight;
				let strs = [];
				let page = {
					chapter: this.computedPageProp.chapter,
					type: 'text',
					dataId: this.computedPageProp.chapter * 100000 + start,
					start: start,
					end: 0,
					isLastPage: false,
					text: []
				}
				let length = 0;
				let contentSync = this.computedPageProp.content.substr(start);
				let lastIndex = 0;
				while ( pageHeight <= this.viewHeight - this.computedPageProp.topGap - this.computedPageProp.bottomGap ) {
					strs.push('');
					let lineWidth = 0;
					for ( let i = lastIndex; i < contentSync.length; i++ ) {
						if ( JSON.stringify(contentSync[i]) == JSON.stringify('\r') || JSON.stringify(contentSync[i]) == JSON.stringify('\n') ) {
							length += 1
							page.end = page.start + length;
							lastIndex = i + 1;
							break;
						}
						lineWidth += context.measureText(contentSync[i]).width;
						if ( lineWidth >= this.viewWidth - (2 * this.computedPageProp.slide) ) {
							lastIndex = i;
							break;
						} else {
							strs[strs.length - 1] += contentSync[i];
							length += 1;
							page.end = page.start + length;
						}
					}
					pageHeight += this.computedPageProp.fontSize + this.computedPageProp.lineHeight;
					if ( page.end >= this.computedPageProp.content.length - 1 ) {
						page.isLastPage = true;
						break;
					}
				}
				page.text = strs;
				return page;
			},
			//创建一个独立的canvas画板，用于计算文字布局
			createComputedCanvas (el) {
				if ( el.getElementsByClassName('computedCanvas')[0] ) return el.getElementsByClassName('computedCanvas')[0];
				let canvasDom = document.createElement('canvas');
				canvasDom.width = this.viewWidth;
				canvasDom.height = this.viewHeight;
				canvasDom.style.position = 'absolute';
				canvasDom.style.top = 0;
				canvasDom.style.left = 0;
				canvasDom.setAttribute('class', 'computedCanvas');
				el.appendChild(canvasDom);
				return el.getElementsByClassName('computedCanvas')[0];
			},
			//参数改变
			propChange (newValue, oldValue) {
				if ( newValue.isStart != oldValue.isStart ) {
					if ( newValue.isStart ) {
						this.getPages();
					}
				}
			},
			getPages () {
				let pages = [];
				const doWhile = (start = 0) => {
					let page = this.computedText(start);
					pages.push(page);
					if ( page.isLastPage ) {
						this.triggerReset(pages)
					} else {
						doWhile(page.end);
					}
				}
				doWhile();
			},
			triggerReset (pages) {
				// #ifndef H5
				this.$ownerInstance.callMethod('reset', pages);
				// #endif
				// #ifdef H5
				this.reset(pages);
				// #endif
			}
		}
	}
</script>

<style scoped>
	.computed-page {
		position: absolute;
		top: -100%;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: -1000000;
		opacity: 0;
	}
</style>
