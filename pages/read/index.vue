<template>
	<view class="read" :style="{'background-color': skinColor.readBackColor, filter: 'brightness(' + light + '%)'}">
		<view id="readTop" class="read-top" :style="{color: skinColor.readTextColor, 'background-color': skinColor.readBackColor}">
			<gap-bar></gap-bar>
			<view class="read-top-line">
				<text class="read-top-text" style="width: 80%;">{{bookInfo.name}}</text>
				<text class="read-top-text">{{progress}}%</text>
			</view>
		</view>
		
		<!-- 文本内容区域 -->
		<view class="pageBox">
			<swiper :disable-touch="readMode.pageMode == 'click'" :vertical="readMode.pageMode == 'U2DTrans'" :style="{'height': swiperHeight + 'px'}" :current="page" :duration="duration" @change="changePage">
				<swiper-item class="pageItem" v-for="(item, index) in pages" :key="index">
					<page
					ref="page"
					class="pageContent"
					:color="skinColor.readTextColor"
					:content="item.content"
					:supContent="item.supContent"
					:fontSize="fontSize"
					:type="item.type"
					:record="item.record"
					:length="bookContent.length"
					:isPageNow="item.isPageNow"
					@ready="ready"></page>
				</swiper-item>
			</swiper>
		</view>
		
		<!-- 触摸区域 -->
		<view class="touch-box touch-prev" @tap="pageClick(0)" v-if="readMode.pageMode == 'click'">
			上一页
		</view>
		<view class="touch-box touch-menu" @tap="openSettingNvue">
			菜单
		</view>
		<view class="touch-box touch-next" @tap="pageClick(pages.length - 1)" v-if="readMode.pageMode == 'click'">
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
	import Page from '@/components/page/page.vue'
	//文本截取长度
	const sliceLen = 1500;
	export default {
		mixins: [skinMixin],
		data () {
			return {
				//文本内容
				bookContent: '',
				//页面列表
				pages: [],
				//当前页
				page: 0,
				//是否是触摸翻页
				touchChange: false,
				//滑动动画时间
				duration: 300,
				//文本高度
				swiperHeight: 0,
				//设置窗口是否打开
				settingShow: false,
				//目录
				catalog: [],
				//当前页书签文本
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
			//阅读位置
			record () {
				return this.bookInfo.record;
			},
			//文件路径
			path () {
				return this.bookInfo.path;
			},
			fontSize () {
				return this.readMode.fontSize;
			},
			readDuration () {
				return this.readMode.duration;
			},
			progress () {
				if ( this.bookInfo.record == 0 ) {
					return 0
				} else {
					return parseFloat(((this.record / this.bookInfo.length) * 100).toFixed(2))
				}
			},
			light () {
				return (100 - ((1 - this.readMode.light) * 50)).toFixed(2);
			}
		},
		created () {
			//监听原生子窗体显示
			uni.$on('setting-isShow', (data) => {
				this.settingShow = data.show;
			})
			plus.nativeUI.showWaiting("读取文本中..");
			this.duration = this.readDuration;
		},
		onReady () {
			//更新阅读时间
			this.updateBookReadTime(this.path);
			let view = uni.createSelectorQuery().in(this).select(".pageBox");
			view.boundingClientRect( data => {
				this.swiperHeight = data.height;
				this.getContent();
			}).exec();
		},
		methods: {
			...mapMutations(['updateBookReadStatus', 'updateBookLength', 'updateBookReadTime', 'updateBookRecord']),
			getContent () {
				
				//获取内容 正式用
				let ReadTxt = plus.android.importClass('com.itstudy.io.GetText');
				let readTxt = new ReadTxt();
				this.bookContent = readTxt.getTextFromText(plus.io.convertLocalFileSystemURL(this.path));
				plus.nativeUI.closeWaiting();
				//更新文本总长度
				this.updateBookLength({
					path: this.path,
					length: this.bookContent.length
				})
				//获取章节目录
				this.getCatalog();
				//初始化页面
				this.initPage();
				
				// 获取内容 调试用
				// plus.io.resolveLocalFileSystemURL('file://' + this.path, ( entry ) => {
				// 	entry.file( ( file ) => {
				// 		let reader = new plus.io.FileReader();
				// 		reader.onloadend = ( e ) => {
				// 			plus.nativeUI.closeWaiting();
				// 			this.bookContent = e.target.result;
				// 			//更新文本总长度
				// 			this.updateBookLength({
				// 				path: this.path,
				// 				length: this.bookContent.length
				// 			})
				// 			//获取章节目录
				// 			this.getCatalog();
				// 			//初始化页面
				// 			this.initPage();
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
				this.catalog = catalog;
			},
			//初始化页面
			initPage () {
				this.pages = [];
				setTimeout(() => {
					let len = this.record > 0 ? 3 : 2;
					for ( let i = 0; i < len; i++ ) {
						this.pages.push({
							content: '',
							supContent: '',
							record: 0,
							isPageNow: false,
							type: 'next'
						})
					}
					let nowIndex = this.record > 0 ? 1 : 0;
					this.pages[0].type = this.record > 0 ? 'prev' : 'next';
					this.pages[nowIndex].isPageNow = true;
					this.pages[nowIndex].record = this.record;
					this.pages[nowIndex].content = this.bookContent.substr(this.record, sliceLen);
					this.pages[nowIndex].supContent = this.bookContent.substr(this.record + sliceLen, 500);
					this.page = nowIndex;
				}, 30)
			},
			//当前页准备完成
			ready (e) {
				//设置阅读记录
				this.setPage(e);
				if ( this.pages[this.page - 1] ) {
					if ( this.pages[this.page - 1].content == '') {
						this.updatePrev(e)
					}
					if ( e.updatePrev ) {
						this.updatePrev(e);
						this.$refs.page[this.page - 1].restart();
					}
				}
				if ( this.pages[this.page + 1] ) {
					if ( this.pages[this.page + 1].content == '' || (e.end != this.$refs.page[this.page + 1].start) ) {
						this.updateNext(e)
					}
				}
			},
			//创建上一页内容
			createPrev (e) {
				let start = e.start - sliceLen > 0 ? e.start - sliceLen : 0;
				this.pages.unshift({
					content: this.bookContent.substring(start, e.start),
					supContent: this.bookContent.substr(e.start, 500),
					record: e.start,
					isPageNow: false,
					type: 'prev'
				})
				//有当前页的下下页内容，删除掉
				if ( this.pages[this.page + 2] ) {
					this.pages.pop();
				}
				//将page设置为正常的值
				this.recoverPage(e.start)
			},
			//创建下一页内容
			createNext (e) {
				this.pages.push({
					content: this.bookContent.substr(e.end, sliceLen),
					supContent: this.bookContent.substr(e.end + sliceLen, 500),
					record: e.end,
					isPageNow: false,
					type: 'next'
				})
				//有当前页的上上页内容，删除掉
				if ( this.pages[this.page - 2] ) {
					this.pages.shift();
				}
				//将page设置为正常的值
				this.recoverPage(e.start)
			},
			//更新上一页内容
			updatePrev (e) {
				let start = e.start - sliceLen > 0 ? e.start - sliceLen : 0;
				this.pages[this.page - 1].record = e.start;
				this.pages[this.page - 1].type = 'prev';
				this.pages[this.page - 1].supContent = this.bookContent.substr(e.start, 500);
				this.pages[this.page - 1].content = this.bookContent.substring(start, e.start);
			},
			//更新下一页内容
			updateNext (e) {
				this.pages[this.page + 1].record = e.end;
				this.pages[this.page + 1].type = 'next';
				this.pages[this.page + 1].supContent = this.bookContent.substr(e.end + sliceLen, 500);
				this.pages[this.page + 1].content = this.bookContent.substr(e.end, sliceLen);
			},
			//更新阅读记录
			setPage (e) {
				if ( this.touchChange = true ) {
					//更新阅读位置
					this.updateBookRecord({
						path: this.path,
						record: e.start
					});
				}
				//更新阅读状态(是否读完)
				this.updateBookReadStatus({
					path: this.path,
					isReaded: e.end >= this.bookContent.length
				})
				//设置当前页面的标签,用于添加标签
				this.setMarkTitle(e.start);
				//是最后一页
				if ( e.end >= this.bookContent.length ) {
					//如果还有下一页内容，删除掉
					if ( this.pages[this.page + 1] ) {
						this.pages.pop();
					}
				//不是最后一页
				} else {
					//如果没有下一页内容，新增
					if ( !this.pages[this.page + 1] ) {
						this.createNext(e);
					}
				}
				setTimeout(() => {
					this.touchChange = false;
				}, 30)
			},
			//滑动触发事件
			changePage (e) {
				//判断是否是触摸触发的滑动
				if ( e.target.source == 'touch' ) {
					let go = this.page - e.target.current;
					this.page = e.target.current;
					//将原本的当前页面改为非当前页面
					let index = indexOf(this.pages, true, 'isPageNow');
					if ( index > -1 ) {
						this.$set(this.pages[index], 'isPageNow', false);
					}
					//翻页触发事件
					this.pageEvent(go);
				}
			},
			//点击翻页
			pageClick (current) {
				let go = this.page - current;
				if ( go == 0 ) {
					if ( this.record == 0 ) {
						uni.showToast({
							title: '已经是最前面了',
							icon: 'none'
						})
						return;
					}
					if ( this.bookInfo.isReaded ) {
						uni.showToast({
							title: '已经是后面了',
							icon: 'none'
						})
						return;
					}
				}
				this.page = current;
				//将原本的当前页面改为非当前页面
				let index = indexOf(this.pages, true, 'isPageNow');
				if ( index > -1 ) {
					this.$set(this.pages[index], 'isPageNow', false);
				}
				//翻页触发事件
				this.pageEvent(go);
			},
			//翻页事件
			pageEvent (go) {
				this.touchChange = true;
				let e = {start: this.$refs.page[this.page].start, end: this.$refs.page[this.page].end };
				setTimeout(() => {
					//向前翻页
					if ( go > 0 ) {
						//不是第一页 并且没有上一页 则创建上一页
						if ( e.start > 0 && !this.pages[this.page - 1] ) {
							this.createPrev(e);
						}
						//是第一页
						if ( e.start == 0 ) {
							//有当前页的下下页内容，删除掉
							if ( this.pages[this.page + 2] ) {
								this.pages.pop();
								this.recoverPage(e.start)
							}
						}
					}
					//向后翻页
					if ( go < 0 ) {
						//不是最后一页，并且没有下一页，则创建下一页
						if ( e.end < this.bookContent.length && !this.pages[this.page + 1] ) {
							this.createNext(e);
						}
						//是最后一页
						if ( e.end >= this.bookContent.length ) {
							//有当前页的上上页内容，删除掉
							if ( this.pages[this.page - 2] ) {
								this.pages.shift();
								this.recoverPage(e.start)
							}
						}
					}
					this.$nextTick(() => {
						this.$set(this.pages[this.page], 'isPageNow', true);
					})
				}, this.duration + 30)
			},
			//页面数量变化后，会造成显示页异常，设置可以正常显示的page值 
			recoverPage (start) {
				//先将滑动动画时间设为零 避免设置page时出现动画效果
				this.duration = 0;
				//根绝当前页的开始位置判断是否是第一页 第一页设置为0，其余都为1
				this.page = start > 0 ? 1 : 0;
				
				//如果出现滑动动画异常的情况，可能是这里出了问题，将延迟时间设长一点试试
				setTimeout(() => {
					//恢复滑动动画时间
					this.duration = this.readDuration;
				}, 50)
			},
			//设置当前页面书签的前50个字
			setMarkTitle (record) {
				this.markTitle = this.bookContent.substr(record, 50);
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
		watch: {
			record () {
				//判断是不是触摸翻页改变的阅读记录 如果是则不执行
				if ( !this.touchChange ) {
					this.initPage();
				}
			},
			readDuration (newVal) {
				this.duration = newVal;
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
			NavBar,
			Page
		}
	}
</script>

<style scoped>
	.read {
		min-height: 100vh;
		font-family: '微软雅黑';
		display: flex;
		flex-direction: column;
	}
	.read-top {
		font-size: 12rpx;
		padding: 0 20rpx;
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
	.pageBox {
		flex: 1;
	}
	.pageItem {
		width: 100%;
		height: 100%;
	}
	.pageContent {
		width: 100%;
		height: 100%;
	}
	.touch-box  {
		display: flex;
		align-items: center;
		justify-content: center;
		position: fixed;
		top: 50%;
		transform: translateY(-50%);
		width: 200rpx;
		height: 200rpx;
		border: 5rpx dashed #FFFFFF;
		color: #333;
		font-size: 30rpx;
		background-color: rgba(255,255,255,0.4);
		font-weight: bold;
		opacity: 0;
	}
	.touch-prev, .touch-next {
		height: 600rpx;
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
