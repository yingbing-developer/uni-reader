<template>
	<view class="read" :style="{filter: 'brightness(' + light + '%)', 'background-color': skinColor.readBackColor}">
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
		enablePreload
		enableClick
		@clickTo="openSettingNvue"
		@currentChange="savePageRecord"
		@setCatalog="setCatalog"
		@preload="preloadContent"
		@loadmore="loadmoreContent">
		</yingbing-ReadPage>
		
		<!-- 触摸区域 -->
		<!-- <view class="touch-box touch-menu" @tap="openSettingNvue" @longpress="openEditNvue">
			菜单
		</view> -->
	</view>
</template>

<script>
	import { skinMixin } from '@/common/mixin/index.js'
	import bookMixin from '@/common/mixin/book.js';
	import bookcertifyMixin from '@/common/mixin/bookcertify.js';
	import { getBookContent } from '@/common/online/getBook.js';
	export default {
		mixins: [skinMixin, bookMixin, bookcertifyMixin],
		data () {
			return {
				//文本内容
				bookContent: '',
				currentPage: '',
				barHeight: 0,
				xhrs: []
			}
		},
		computed: {
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
		},
		onShow () {
			uni.$emit('musicBtn-down');
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
						this.initContent(this.$Route.query.chapter).then((res) => {
							this.initPage(res, this.$Route.query.chapter);
						}).catch(() => {
							uni.showToast({
								title: '加载失败',
								icon: 'none'
							})
							console.log('加载失败');
						})
					}
				}
			})
		},
		methods: {
			//获取本地小说内容
			getLocalContent () {
				//获取内容 原生插件
				// let ReadTxt = plus.android.importClass('com.itstudy.io.GetText');
				// let readTxt = new ReadTxt();
				// this.bookContent = readTxt.getTextFromText(plus.io.convertLocalFileSystemURL(this.path));
				let Reader = uni.requireNativePlugin('YingBingNativePlugin-Reader');
				this.bookContent = Reader.readAllLines(this.path);
				//更新文本总长度
				this.updateBookInfo({
					path: this.path,
					length: this.bookContent.length
				})
				//初始化页面
				this.initPage();
				Reader = '';
				
				// 获取内容 还不能使用
				// let encoding = this.getFileCharset(this.path);
				// let file = plus.android.newObject("java.io.File", this.path, 'r');
				// let fs = plus.android.newObject("java.io.FileInputStream", this.path);
				// plus.android.invoke(fs, 'skip', 3);
				// let isr = plus.android.newObject("java.io.InputStreamReader", fs, encoding);
				// let br = plus.android.newObject("java.io.BufferedReader", isr);
				// let s = plus.android.invoke(br, 'readLine');
				// plus.android.invoke(br, 'close');
				// console.log(s);
				// let Charset = plus.android.importClass("java.nio.charset.Charset");
				// let ByteBuffer = plus.android.importClass("java.nio.ByteBuffer");
				// let FileChannel = plus.android.importClass("java.nio.channels.FileChannel");
				// let FileInputStream = plus.android.importClass("java.io.FileInputStream");
				// let String = plus.android.importClass("java.lang.String");
				// let bf = ByteBuffer.allocate(1024);
				// let bytes = bf.array();
				// try { 
				// 	let r = new RandomAccessFile(file);
				// 	let byteread = r.read(bytes);
				// 	// let charread = r.readchar();
				// 	// let intread = r.readint();
				// 	console.log(bytes, 0, byteread);
				// 	// console.log(bytes, 0, charread);
				// 	// console.log(bytes, 0, intread);
				// 	fs.close();
				// } catch (e){ 
				// 	console.log("File read error:"+e);
				// }
				// uni.hideLoading();
			},
			//判断txt文件编码格式
			getFileCharset (path) {
				let Charset = plus.android.importClass('java.nio.charset.Charset');
				let charset = Charset.defaultCharset().displayName();
				let charsets = ["UTF-8", "GBK", "US-ASCII", "GB2312", "BIG5", "GB18030", "UTF-16BE", "UTF-16LE", "UTF-16", "UNICODE"];
				for (let i = 0; i < charsets.length; i++) {
					let decoder = Charset.forName(charsets[i]).newDecoder();
					let fs = plus.android.newObject("java.io.FileInputStream", path);
					let isr = plus.android.newObject("java.io.InputStreamReader", fs, decoder);
					let br = plus.android.newObject("java.io.BufferedReader", isr);
					let line = 0;
					let s = null;
					while (line < 20){
						s = plus.android.invoke(br, 'readLine');
						if ( s ) break;
						line += 1;
					}
					if ( s ) {
						charset = charsets[i];
						console.log("getTextFileCharset: is " + charsets[i] + ",break");
						break;
					} else {
						console.log("getTextFileCharset: not " + charsets[i] + ",continue");
						continue;
					}
				}
				return charset;
			},
			//获取在线小说内容
			getOnlineContent (data) {
				let xhrs = [];
				for ( let i = 0; i < data.length; i++ ) {
					xhrs.push({
						url: data[i].path,
						chapter: data[i].chapter,
						title: data[i].title,
						isStart: data[i].isStart,
						isEnd: data[i].isEnd,
						source: this.bookInfo.source
					})
				}
				return new Promise((resolve, reject) => {
					getBookContent(xhrs).then((res) => {
						resolve(res);
					}).catch(() => {
						reject('')
					})
				})
			},
			//获取章节目录
			setCatalog (e) {
				this.setBookChapters(e);
			},
			preloadContent (chapters, callback) {
				const arr = this.bookChapters.filter(item => {
					return chapters.indexOf(item.chapter) > -1
				});
				this.getOnlineContent(arr).then((contents) => {
					if ( contents.length > 0 ) {
						callback('success', contents)
					} else {
						callback('fail');
					}
				}).catch(() => {
					callback('fail');
				})
			},
			loadmoreContent (chapter, callback) {
				const index = this.$utils.indexOf(this.bookChapters, 'chapter', chapter);
				const arr = [this.bookChapters[index]]
				this.getOnlineContent(arr).then((contents) => {
					if ( contents.length > 0 ) {
						callback('success', contents[0])
					} else {
						callback('fail');
					}
				}).catch(() => {
					callback('fail');
				})
			},
			//初始化页面
			initPage (contents, current) {
				const { page } = this.$refs;
				if ( this.bookInfo.source == 'local' ) {
					page.init({
						content: this.bookContent,
						start: this.record.position || 0
					})
				} else {
					page.init({
						contents: contents,
						currentChapter: current,
						start: current == this.record.chapter ? parseInt(this.record.position) : 0
					})
				}
			},
			changePage (data) {
				const { page } = this.$refs;
				if ( this.bookInfo.source == 'local' ) {
					page.change({
						start: data.start
					})
				} else {
					uni.showLoading({
						title: '加载内容中',
						mask: true
					})
					this.initContent(data.chapter).then((contents) => {
						uni.hideLoading();
						page.change({
							contents: contents,
							currentChapter: data.chapter,
							start: 0
						})
					}).catch(() => {
						uni.hideLoading();
						uni.showToast({
							title: '加载失败',
							icon: 'none'
						})
					})
				}
			},
			initContent (chapter) {
				chapter = parseInt(chapter);
				return new Promise((resolve, reject) => {
					const arr = this.bookChapters.filter(item => {
						return item.chapter == chapter || item.chapter == chapter - 1 || item.chapter == chapter + 1
					});
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
				let pageInfo = {};
				let record = {};
				let isReaded = false;
				if ( this.bookInfo.source == 'local' ) {
					record = {
						chapter: e.chapter,
						position: e.start,
						title: e.title
					}
					isReaded =  e.end >= this.bookContent.length - 1;
					pageInfo = {
						progress: parseFloat(((e.start / this.bookContent.length) * 100).toFixed(2)),
						title: this.bookInfo.name,
						chapter: e.chapter,
						text: e.text
					}
				} else {
					let index = this.$utils.indexOf(this.bookChapters, 'chapter', e.chapter);
					record = {
						chapter: e.chapter,
						position: e.start,
						title: this.bookChapters[index].title
					}
					isReaded = this.bookChapters[index].isEnd && e.isChapterEnd;
					pageInfo = {
						progress: parseFloat(((e.currentPage / e.totalPage) * 100).toFixed(2)),
						title: e.title,
						chapter: e.chapter,
						text: e.text,
						currentPage: e.currentPage,
						totalPage: e.totalPage
					}
				}
				this.setBookPageInfo(pageInfo);
				//更新阅读位置
				this.updateBookInfo({
					path: this.path,
					record: record,
					isReaded: isReaded
				});
			},
			//打开设置子窗体
			openSettingNvue () {
				this.$Router.push({
					path: '/pages/book/setting/index',
					animationType: 'fade-in'
				})
			},
			//打开编辑子窗体
			openEditNvue () {
				console.log('点击');
				if ( this.bookInfo.source != 'local' ) {
					return;
				}
				let content = this.bookContent.substr(this.bookPageInfo.start, this.bookPageInfo.end);
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
		beforeDestroy () {
			//注销监听页面监听
			uni.$off('setting-menu')
			uni.$off('change-page');
			uni.$emit('musicBtn-open');
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
		z-index: 10;
	}
	.touch-menu {
		left: 50%;
		transform: translate(-50%, -50%);
		border-radius: 20rpx;
	}
</style>
