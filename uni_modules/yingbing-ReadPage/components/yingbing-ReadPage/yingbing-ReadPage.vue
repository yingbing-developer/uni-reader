<template>
	<view class="page">
		<page-chapter
		v-if="!noChapter"
		ref="pageChapter"
		:page-type="pageType"
		:font-size="fontSize"
		:line-height="lineHeight"
		:color="color"
		:bg-color="bgColor"
		:slide="slide"
		:topGap="topGap"
		:bottomGap="bottomGap"
		@loadmore="loadmore"
		@preload="preload"
		@currentChange="currentChange"></page-chapter>
		
		<page-no-chapter
		v-else
		ref="pageNoChapter"
		:page-type="pageType"
		:font-size="fontSize"
		:line-height="lineHeight"
		:color="color"
		:bg-color="bgColor"
		:slide="slide"
		:topGap="topGap"
		:bottomGap="bottomGap"
		@loadmore="loadmore"
		@preload="preload"
		@currentChange="currentChange"
		@setCatalog="setCatalog"></page-no-chapter>
	</view>
</template>

<script>
	import PageChapter from '../page-chapter/page-chapter.vue'
	import PageNoChapter from '../page-no-chapter/page-no-chapter.vue'
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
				default: 'real'
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
			//不分章节
			noChapter: {
				type: Boolean,
				default: false
			}
		},
		methods: {
			init (data) {
				if ( !this.noChapter ) {
					const { pageChapter } = this.$refs;
					pageChapter.init(data)
				} else {
					const { pageNoChapter } = this.$refs;
					pageNoChapter.init(data)
				}
			},
			change (data) {
				if ( !this.noChapter ) {
					const { pageChapter } = this.$refs;
					pageChapter.change(data)
				} else {
					const { pageNoChapter } = this.$refs;
					pageNoChapter.change(data)
				}
			},
			currentChange (e) {
				this.$emit('currentChange', e);
			},
			setCatalog (e) {
				this.$emit('setCatalog', e);
			},
			loadmore (chapter, next, error) {
				this.$emit('loadmore', chapter, next, error);
			},
			preload (chapters, next, error) {
				this.$emit('preload', chapters, next, error);
			}
		},
		components: {
			PageChapter,
			PageNoChapter
		}
	}
</script>

<style>
</style>
