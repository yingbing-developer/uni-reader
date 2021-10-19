<template>
	<view class="page" @touchstart="touchstart" @touchmove="touchmove" @touchend="touchend">
		<template v-if="!noChapter">
			<!-- 翻页模式 -->
			<flip-page
			v-if="pageType != 'scroll'"
			ref="filpPage"
			:page-type="pageType"
			:font-size="prop.fontSize"
			:line-height="prop.lineHeight"
			:color="color"
			:bg-color="bgColor"
			:slide="prop.slide"
			:topGap="prop.topGap"
			:bottomGap="prop.bottomGap"
			:enablePreload="enablePreload"
			@loadmore="loadmore"
			@preload="preload"
			@currentChange="currentChange">
			</flip-page>
			<!-- 翻页模式 -->
			
			<!-- 滚动模式 -->
			<scroll-page
			v-if="pageType == 'scroll'"
			ref="scrollPage"
			:page-type="pageType"
			:font-size="prop.fontSize"
			:line-height="prop.lineHeight"
			:color="color"
			:bg-color="bgColor"
			:slide="prop.slide"
			:topGap="prop.topGap"
			:bottomGap="prop.bottomGap"
			:enablePreload="enablePreload"
			@loadmore="loadmore"
			@preload="preload"
			@scrollEnd="currentChange">
			</scroll-page>
			<!-- 滚动模式 -->
		</template>
		
		<template v-else>
			<page-no-chapter
			ref="pageNoChapter"
			:page-type="pageType"
			:font-size="prop.fontSize"
			:line-height="prop.lineHeight"
			:color="color"
			:bg-color="bgColor"
			:slide="prop.slide"
			:topGap="prop.topGap"
			:bottomGap="prop.bottomGap"
			@currentChange="currentChangeNoChater"
			@setCatalog="setCatalog"></page-no-chapter>
		</template>
	</view>
</template>

<script>
	const pageTypes = ['cover', 'real', 'none'];
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
			},
			//是否开启整书模式
			noChapter: {
				type: Boolean,
				default: false
			},
			//开启点击事件
			enableClick: {
				type: Boolean,
				default: false
			},
			//点击事件位置设置
			clickOption: {
				type: Object,
				default () {
					return {
						width: uni.upx2px(200),
						height: uni.upx2px(200),
						left: 'auto',
						top: 'auto'
					}
				}
			}
		},
		data () {
			return {
				pageInfo: {
					dataId: -1
				},
				contents: [],
				touchstartX: 0,
				touchstartY: 0,
				touchmoveX: 0,
				touchmoveY: 0,
				touchTime: 0,
				windowWidth: 0,
				windowHeight: 0
			}
		},
		computed: {
			prop () {
				return {
					slide: this.slide > 0 ? parseInt(this.slide) : 0,
					topGap: this.topGap > 0 ? parseInt(this.topGap) : 0,
					bottomGap: this.bottomGap > 0 ? parseInt(this.bottomGap) : 0,
					fontSize: this.fontSize >= 12 ? parseInt(this.fontSize) : 12,//字体大小最小只能到12px，因为谷歌浏览器最小只支持12px
					lineHeight: this.lineHeight >= 5 ? parseInt(this.lineHeight) : 5
				}
			}
		},
		mounted () {
			setTimeout(() => {
				const query = uni.createSelectorQuery().in(this);
				query.select('.page').boundingClientRect(data => {
					this.windowWidth = data.width
					this.windowHeight = data.height
				}).exec();
			}, 20)
		},
		methods: {
			touchstart (e) {
				if ( !this.enableClick ) {
					return
				}
				if ( e.touches.length == 1 ) {
					this.resetTouch();
					this.touchInter = setInterval(() => {
						this.touchTime += 50
					}, 50)
					const touch = e.touches[0]
					this.touchstartX = touch.pageX;
					this.touchstartY = touch.pageY;
				}
			},
			touchmove (e) {
				if ( !this.enableClick ) {
					return
				}
				if ( e.touches.length == 1 ) {
					const touch = e.touches[0]
					this.touchmoveX = touch.pageX;
					this.touchmoveY = touch.pageY;
				}
			},
			touchend (e) {
				if ( !this.enableClick ) {
					return
				}
				clearInterval(this.touchInter);
				if ( this.touchTime > 200 ) {
					return
				}
				if ( Math.abs(this.touchmoveX - this.touchmoveX) > 50 || Math.abs(this.touchmoveY - this.touchmoveY) > 50 ) {
					return
				}
				let left = 0
				let top = 0
				if ( this.clickOption.left == 'auto' ) {
					left = (this.windowWidth / 2) - (this.clickOption.width / 2)
				} else if ( typeof this.clickOption.left == 'number' ) {
					left = this.clickOption.left
				} else {
					return
				}
				if ( this.clickOption.top == 'auto' ) {
					top =  (this.windowHeight / 2) - (this.clickOption.height / 2)
				} else if ( typeof this.clickOption.top == 'number' ) {
					top = this.clickOption.top
				} else {
					return
				}
				let right = left + this.clickOption.width
				let bottom = top + this.clickOption.height
				if ( this.touchstartX >= left && this.touchstartX <= right && this.touchstartY >= top && this.touchstartY <= bottom ) {
					this.$emit('clickTo')
				}
			},
			resetTouch () {
				this.touchstartX = 0
				this.touchstartY = 0
				this.touchmoveX = 0
				this.touchmoveY = 0
				this.touchTime = 0
			},
			loadmore (chapter, callback) {
				this.$emit('loadmore', chapter, (status, content) => {
					if (status == 'success') {
						const index = this.contents.findIndex(item => item.chapter == content.chapter)
						if (index > -1) {
							this.contents[index] = content;
						} else {
							this.contents.push(content);
						}
					}
					callback(status, this.contents);
				});
			},
			preload (chapters, callback) {
				this.$emit('preload', chapters, (status, contents) => {
					if (status == 'success') {
						contents.forEach(item => {
							const index = this.contents.findIndex(content => content.chapter == item
								.chapter)
							if (index > -1) {
								this.contents[index] = item;
							} else {
								this.contents.push(item);
							}
						})
					}
					callback(status, this.contents);
				});
			},
			currentChange (e) {
				if ( e.dataId != this.pageInfo.dataId ) {
					this.$emit('currentChange', e)
				}//抛出阅读页面改变事件
				this.pageInfo = e;
			},
			currentChangeNoChater (e) {
				this.$emit('currentChange', e)
			},
			setCatalog (e) {
				this.$emit('setCatalog', e);
			},
			//初始化
			init (data) {
				if ( !this.noChapter ) {
					this.contents = data.contents;
					const dataSync = {
						contents: this.contents,
						start: parseInt(data.start),
						currentChapter: parseInt(data.currentChapter),
						title: data.title || null
					}
					if ( this.pageType == 'scroll' ) {
						this.$refs.scrollPage.init(dataSync)
					} else {
						this.$refs.filpPage.init(dataSync)
					}
				} else {
					this.$refs.pageNoChapter.init(data);
				}
			},
			//重计算
			refresh () {
				if ( !this.noChapter ) {
					if ( pageTypes.indexOf(this.pageType) > -1 ) {
						this.$refs.filpPage.resetPage({
							start: this.pageInfo.start,
							chapter: this.pageInfo.chapter
						})
					} else {
						this.$refs.scrollPage.resetPage({
							start: this.pageInfo.start,
							chapter: this.pageInfo.chapter
						})
					}
				}
			},
			//跳转
			change (data) {
				if ( !this.noChapter ) {
					data.contents.forEach(item => {
						const index = this.contents.findIndex(content => content.chapter == item.chapter)
						if (index > -1) {
							this.contents[index] = item;
						} else {
							this.contents.push(item);
						}
						this.init({
							contents: this.contents,
							start: data.start,
							currentChapter: data.currentChapter
						});
					})
				} else {
					this.$refs.pageNoChapter.change(data);
				}
			}
		},
		watch: {
			pageType (newVal, oldVal) {
				if ( !this.noChapter ) {
					setTimeout(() => {
						if ( pageTypes.indexOf(newVal) > -1 && oldVal == 'scroll' ) {
							this.init({
								contents: this.contents,
								start: this.pageInfo.start,
								currentChapter: this.pageInfo.chapter
							});
						}
						if ( pageTypes.indexOf(oldVal) > -1 && newVal == 'scroll' ) {
							this.init({
								contents: this.contents,
								start: this.pageInfo.start,
								currentChapter: this.pageInfo.chapter
							});
						}
					}, 50)
				}
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
</style>