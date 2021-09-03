<template>
	<view class="read" :style="{filter: 'brightness(' + light + '%)'}">
		<yingbing-ReadPage
		ref="page"
		:page-type="pageType"
		:font-size="fontSize"
		:line-height="lineHeight"
		:color="skinColor.readTextColor"
		:bg-color="skinColor.readBackColor"
		:slide="40"
		:top-gap="barHeight"
		:bottom-gap="barHeight"
		:no-chapter="bookInfo.source == 'local'"
		@currentChange="savePageRecord"
		@setCatalog="setCatalog"
		@preload="preloadContent"
		@loadmore="loadmoreContent">
		</yingbing-ReadPage>
		
		<!-- 触摸区域 -->
		<view class="touch-box touch-menu" @tap="openSettingNvue" @longpress="openEditNvue">
			菜单
		</view>
		
		<get-content ref="getContent"></get-content>
	</view>
</template>

<script>
	import { skinMixin } from '@/common/mixin/index.js'
	import bookMixin from '@/common/mixin/book.js';
	import { getBookContent } from '@/common/online/getBook.js';
	import GetContent from './geContent/index.vue'
	export default {
		mixins: [skinMixin, bookMixin],
		data () {
			return {
				//文本内容
				bookContent: '',
				//所有在线小说章节内容
				contents: [],
				//目录
				catalog: [],
				currentPage: '',
				barHeight: 0,
				xhrs: []
			}
		},
		computed: {
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
				return this.bookReadMode.fontSize;
			},
			pageType () {
				return this.bookReadMode.pageType;
			},
			lineHeight () {
				return this.bookReadMode.lineHeight;
			},
			progress () {
				if ( this.record == 0 ) {
					return 0
				} else {
					return parseFloat(((this.record / this.bookInfo.length) * 100).toFixed(2))
				}
			},
			light () {
				return (100 - ((1 - this.bookReadMode.light) * 50)).toFixed(2);
			}
		},
		created () {
			uni.$emit('musicBtn-hide');
			//监听原生子窗体显示
			uni.$on('setting-isShow', (data) => {
				this.settingShow = data.show;
				if ( this.settingShow ) {
					uni.$emit('musicBtn-show');
				} else {
					uni.$emit('musicBtn-hide');
				}
			})
			//监听编辑窗体修改
			uni.$on('setting-menu', (data) => {
				if ( data.flag == 'edit' ) {
					this.openEditNvue();
				}
			})
			//监听页面跳转
			uni.$on('change-page', (data) => {
				this.changePage(data);
			})
			uni.showLoading({
				title: '读取文本中..'
			})
		},
		onReady () {
			//更新阅读时间
			this.updateBookInfo({
				path: this.path,
				lastReadTime: new Date().getTime()
			});
			uni.getSystemInfo({
				success: (res) => {//根据状态栏高度, 进行导航栏顶部适配
					this.barHeight = res.statusBarHeight + 4;
					if ( this.bookInfo.source == 'local' ) {
						this.getLocalContent();
					} else {
						this.catalog = JSON.parse(decodeURIComponent(this.$Route.query.nums));
						this.initContent(this.record.chapter).then((res) => {
							uni.hideLoading();
							this.initPage(res, this.record.chapter);
						}).catch(() => {
							console.log('加载失败');
						})
					}
				}
			})
		},
		methods: {
			//获取本地小说内容
			getLocalContent () {
				//获取内容 正式用
				let ReadTxt = plus.android.importClass('com.itstudy.io.GetText');
				let readTxt = new ReadTxt();
				this.bookContent = readTxt.getTextFromText(plus.io.convertLocalFileSystemURL(this.path));
				uni.hideLoading();
				//更新文本总长度
				this.updateBookInfo({
					path: this.path,
					length: this.bookContent.length
				})
				//初始化页面
				this.initPage();
				readTxt = '';
				
				// 获取内容 调试用
				// let file = plus.android.newObject("java.io.File", this.path);
				// let stream = plus.android.newObject("java.io.FileInputStream", file);
				// let reader = plus.android.newObject("java.io.InputStreamReader", stream, 'GBK');
				// let bufferedReader = plus.android.newObject("java.io.bufferedReader", reader);
				// let lineTxt = plus.android.invoke(bufferedReader, 'readLine');
				// plus.android.invoke(reader, 'close');
				// uni.hideLoading();
				// if ( lineTxt ) {
				// 	plus.io.resolveLocalFileSystemURL('file://' + this.path, ( entry ) => {
				// 		entry.file( ( file ) => {
				// 			let reader = new plus.io.FileReader();
				// 			reader.onloadend = ( e ) => {
				// 				uni.hideLoading();
				// 				plus.android.invoke(bufferedReader, 'close');
				// 				plus.android.invoke(reader, 'close');
				// 				this.bookContent = e.target.result;
				// 				//更新文本总长度
				// 				this.updateBookInfo({
				// 					path: this.path,
				// 					length: this.bookContent.length
				// 				})
				// 				//初始化页面
				// 				this.initPage();
				// 			};
				// 			reader.readAsText( file, 'gb2312' );
				// 		}, ( fail ) => {
				// 			console.log("Request file system failed: " + fail.message);
				// 		});
				// 	}, ( fail ) => {
				// 		console.log( "Request file system failed: " + fail.message );
				// 	});
				// }
			},
			//获取在线小说内容
			getOnlineContent (data) {
				let xhrs = [];
				for ( let i = 0; i < data.length; i++ ) {
					xhrs.push({
						type: 'GET',
						url: data[i].path,
						chapter: data[i].chapter,
						isEnd: data[i].isEnd,
						source: this.bookInfo.source
					})
				}
				return new Promise((resolve, reject) => {
					uni.$on('book-content-btn', res => {
						resolve(res);
						uni.$off('book-content-btn');
					})
					this.$refs.getContent.get(xhrs)
				})
			},
			//获取章节目录
			setCatalog (e) {
				this.catalog = e;
			},
			preloadContent (chapters, next, error) {
				let arr = [];
				for ( let i in chapters ) {
					let index = this.$utils.indexOf(this.catalog, 'chapter', chapters[i]);
					if ( index > -1 ) {
						arr.push(this.catalog[index]);
					}
				}
				this.getOnlineContent(arr).then((res) => {
					if ( res.length > 0 ) {
						this.contents = this.contents.concat(res);
						next(res)
					} else {
						error();
					}
				}).catch(() => {
					error();
				})
			},
			loadmoreContent (chapter, next, error) {
				uni.showLoading({
					title: '加载内容中',
					mask: true
				})
				let index = this.$utils.indexOf(this.catalog, 'chapter', chapter);
				let arr = [this.catalog[index]]
				this.getOnlineContent(arr).then((res) => {
					uni.hideLoading();
					if ( res.length > 0 ) {
						this.contents = this.contents.concat(res);
						next(res[0])
					} else {
						error();
					}
				}).catch(() => {
					uni.hideLoading();
					error();
				})
			},
			//初始化页面
			initPage (contents, current) {
				const { page } = this.$refs;
				if ( this.bookInfo.source == 'local' ) {
					contents = [{
						start: this.record,
						content: this.bookContent
					}]
					page.init({
						contents: contents
					})
				} else {
					let index = this.$utils.indexOf(contents, 'chapter', current);
					for ( let i in contents ) {
						contents[i].start = i == index ? this.record.position : 0
					}
					page.init({
						contents: contents,
						current: current
					})
				}
			},
			changePage (data) {
				const { page } = this.$refs;
				if ( this.bookInfo.source == 'local' ) {
					page.change({
						start: data.position
					})
				} else {
					uni.showLoading({
						title: '加载内容中',
						mask: true
					})
					this.initContent(data.chapter).then((res) => {
						uni.hideLoading();
						page.change({
							contents: res,
							current: data.chapter
						})
					})
				}
			},
			initContent (chapter) {
				return new Promise((resolve, reject) => {
					let arr = [];
					for ( let i in this.catalog ) {
						if ( this.catalog[i].chapter == chapter || this.catalog[i].chapter == chapter - 1 || this.catalog[i].chapter == chapter + 1 ) {
							arr.push(this.catalog[i])
						}
					}
					this.getOnlineContent(arr).then((res) => {
						resolve(res);
					}).catch(() => {
						reject([]);
						console.log('加载失败');
					});
				})
			},
			//更新阅读记录
			savePageRecord (e) {
				this.currentPage = e;
				let record = {};
				let isReaded = false;
				if ( this.bookInfo.source == 'local' ) {
					record = {
						chapter: 0,
						position: e.start,
						title: ''
					}
					isReaded =  e.end >= this.bookContent.length;
				} else {
					let index = this.$utils.indexOf(this.catalog, 'chapter', e.chapter);
					record = {
						chapter: e.chapter,
						position: e.start,
						title: this.catalog[index].title
					}
					isReaded = this.catalog[index].isEnd && e.isChapterEnd;
				}
				//更新阅读位置
				this.updateBookInfo({
					path: this.path,
					record: record,
					isReaded: isReaded
				});
				if ( this.bookInfo.source == 'local' ) {
					//设置当前页面的标签,用于添加标签
					this.setMarkTitle();
				}
			},
			//设置当前页面书签的前50个字
			setMarkTitle () {
				uni.$emit('setting-mark', {
					markTitle: this.currentPage.text
				})
			},
			//打开设置子窗体
			openSettingNvue () {
				const subNvue = uni.getSubNVueById('setting');
				//向子窗体传值
				uni.$emit('setting-popup', {  
					path: this.path,
					catalog: this.catalog,
				    markTitle: this.currentPage.text,
				    start: this.catalog
				});
				
				// 打开 nvue 子窗体 
				subNvue.show();
			},
			//打开编辑子窗体
			openEditNvue () {
				if ( this.bookInfo.source != 'local' ) {
					return;
				}
				let content = this.bookContent.substr(this.currentPage.start, this.currentPage.end);
				uni.navigateTo({
					url: `/modules/edit?content=${encodeURIComponent(content)}&start=${this.currentPage.start}&end=${this.currentPage.end}`,
					complete: (res) => {
						setTimeout(() => {
							uni.$on('edit-btn', (data) => {
								if ( data.flag == 'confirm' ) {
									this.saveContent(data);
								}
								getApp().globalData.$Router.back();
								uni.$off('edit-btn');
							})
						}, 60)
					}
				});
			},
			//保存文本
			saveContent (data) {
				let content = this.bookContent.substr(0, data.start) + data.content + this.bookContent.substr(parseInt(data.end));
				this.bookContent = content;
				this.initPage();
				this.saveTxt();
			},
			//保存文件
			saveTxt () {
				uni.showLoading({
					title: '保存内容中',
					mask: true
				})
				let file = plus.android.newObject("java.io.File", this.path);
				if ( file != null && plus.android.invoke(file, 'exists') ) {
					plus.android.invoke(file, 'createNewFile');
					let fileOutputStream = plus.android.newObject("java.io.FileOutputStream", file);
					let outputStreamWriter = plus.android.newObject("java.io.OutputStreamWriter", fileOutputStream, "gb2312");
					let bufferedWriter = plus.android.newObject("java.io.BufferedWriter", outputStreamWriter);
					plus.android.invoke(bufferedWriter, 'write', this.bookContent);
					plus.android.invoke(bufferedWriter, 'close');
				} else {
					uni.showToast({
						title: '文件不存在或者不能被操作',
						icon: 'none'
					})
				}
				uni.hideLoading();
			}
		},
		components: {
			GetContent
		},
		beforeDestroy () {
			//注销监听页面监听
			uni.$off('setting-isShow');
			uni.$off('setting-menu')
			uni.$off('change-page');
			uni.$emit('musicBtn-show');
		},
		onBackPress (event) {
			if ( event.from == 'backbutton' ) {
				if ( this.settingShow ) {
					uni.$emit('setting-hide');
					return true;
				}
			}
			return false;
		}
	}
</script>

<style scoped>
	.read {
		min-height: 100vh;
		font-family: '微软雅黑';
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
	.touch-menu {
		left: 50%;
		transform: translate(-50%, -50%);
		border-radius: 20rpx;
	}
</style>
