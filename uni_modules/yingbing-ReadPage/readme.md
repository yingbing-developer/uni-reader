#使用须知

* 1、这是一个小说分页插件，包含翻页功能，但不包含设置窗口
* 2、这个插件只支持app-vue和h5手机端, ios端没做测试,希望有条件的朋友能帮我测试下
* 3、小说分页有2种模式，章节模式和整书模式，章节模式就是需要分章节加载的小说，整书模式就是不分章节直接传入整本小说的模式
* 4、小说内容只支持纯文本格式 ，例如（内容内容内容内容内容/r/n内容内容内容内容内容）
* 5、章节模式建议初始化内容和跳转章节时一次传3个章节的内容
* 6、请注意需要下载安装better-scroll插件，这个是vue的插件，进入这个插件的根目录下使用npm install即可

#props属性
| 属性名 | 类型 | 默认值 | 可选值 | 说明 |
| :----- | :----: | :----: | :----: | :---- |
| pageType | String | real | real/cover/scroll/none | 翻页模式 |
| color | String | #333333 | 自定义 | 字体颜色 |
| fontSize | String/Number | 15 | 自定义 | 字体大小 |
| bgColor | String | #fcd281 | 自定义 | 背景颜色（支持css渐变） |
| lineHeight | String/Number | 15 | 自定义 | 行间距（行与行之间的间距） |
| slide | String/Number | 40 | 自定义 | 页面左右边距 |
| topGap | String/Number | 10 | 自定义 | 页面上边距 |
| bottomGap | String/Number | 10 | 自定义 | 页面下边距 |
| noChapter | Boolean | false | true/false | 是否开启整书模式（无章节模式） |
| enablePreload | Boolean | false | true/false | 是否开启预加载章节功能（noChapter为false时有效） |
| enableClick | Boolean | false | true/false | 是否开启点击区域（用于唤出设置窗口之类） |
| clickOption | Object | { width: uni.upx2px(200),height: uni.upx2px(200),left:'auto',top:'auto'} | 自定义 | 点击区域配置（点击哪个区域有效 enableClick为true时有效） |

#clickOption介绍
| 键名 | 类型 | 说明 |
| :----- | :----: | :---- |
| width | Number | 点击区域宽度 |
| height | Number | 点击区域高度 |
| left | String/Number | 左右定位（默认auto为居中，可传入数字） |
| top | String/Number | 上下定位（默认auto为居中，可传入数字） |

#event事件
| 事件名 | 参数 | 说明 |
| :----- | :----: | :---- |
| loadmore | chapter,callback | 加载章节内容（chapter为需要加载的章节序号，callback为加载回调 此方法在noChapter为false有效）|
| preload | chapters,callback | 预加载章节内容（chapters为需要预加载的章节序号集合，callback为加载回调 此方法在noChapter为false有效）|
| currentChange | currentInfo | 阅读页面改变触发事件（返回当前阅读页面信息）|
| setCatalog | catalog | 获取章节目录事件（此事件在noChapter为true时有效）|
| clickTo | 无 | 点击事件（此事件在enableClick为true时有效）|

#章节模式 内置方法
| 方法名 | 参数 | 说明 |
| :----- | :---- | :---- |
| init | { contents: '小说内容集合', currentChapter: '小说定位章节序号', start: '定位章节的开始阅读开始位置' } | 初始化小说内容 |
| change | { contents: '小说内容集合', currentChapter: '小说定位章节序号', start: '定位章节的开始阅读开始位置' } | 跳转小说位置 |

#章节模式 content对象介绍
| 键名 | 类型 | 说明 |
| :----- | :----: | :---- |
| chapter | Number | 章节序号 |
| content | String | 章节内容 |
| isEnd | Boolean | 是否是最后一个章节 |
| isStart | Boolean | 是否是第一章节 |
| title | String | 章节名称（非必传）如果传了得话，会在currentChange中返回 |

#章节模式 loadmore和preload事件回调callback介绍
| 参数 | 类型 | 是否必传 | 可选值 | 说明 |
| :----- | :----: | :---- |
| status | String | 是 | success/fail/timeout | 请求回调状态 |
| content/contents | Object | 是 | loadmore方法需要传入content对象, preload方法需要传入content对象集合contents | 请求回调内容 |

#章节模式 currentChange事件参数currentInfo介绍
| 键名 | 类型  | 说明 |
| :----- | :----: | :---- |
| chapter | String | 当前页面所在章节 |
| start | Number | 当前页面所在章节的阅读开始位置 |
| end | Number | 当前页面所在章节的阅读结束位置 |
| dataId | Number | 插件内部使用参数不用处理 |
| type | String | 插件内部使用参数不用处理 |
| text | Array | 当前页面文字集合 |
| totalPage | Number | 当前章节的全部分页数量 |
| currentPage | Number | 当前章节第几页 |
| title | String | 章节名称（如果content对象中带有title才会返回这个参数） |

#整书模式 内置方法
| 方法名 | 参数 | 说明 |
| :----- | :---- | :---- |
| init | { content: '小说内容（这里的content只需要小说文本内容）', start: '小说阅读位置', title: '小说名称（非必传，用于在读取不出章节时得默认单个章节名称）' } | 初始化小说内容 |
| change | { start: '小说定位阅读位置' } | 跳转小说阅读位置 |


#使用方法

```html
	<yingbing-ReadPage
	ref="page"
	:page-type="pageType"
	:font-size="fontsize"
	:line-height="lineHeight"
	:color="color"
	:bg-color="bgColor"
	:slide="slide"
	:enablePreload="enablePreload"
	:noChapter="noChapter"
	enableClick
	@clickTo="clickTo"
	@loadmore="loadmoreContent"
	@preload="preloadContent"
	@currentChange="currentChange"
	@setCatalog="setCatalog"></yingbing-ReadPage>
```

```javascript
	export default {
		data() {			
			return {
				pages: [],
				pageType: 'real',
				scrollTop: 400,
				fontsize: 20,
				lineHeight: 15,
				color: '#333',
				slide: 40,
				bgColor: '#fcd281',
				enablePreload: true,
				noChapter: false
			}
		},
		onReady() {
			let contents = [{
				chapter: 3,
				content: this.getContent(3),
				title: '第三章',
				isStart: false,
				isEnd: false
			}]
			const { page } = this.$refs;
			if ( this.noChapter ) {
				page.init({
					content: this.getContent(2),
					start: 0
				})
			} else {
				page.init({
					contents: contents,
					start: 0,
					currentChapter: 3
				})
			}
		},
		methods: {
			clickTo () {
				console.log('点击')
			},
			currentChange (e) {
				console.log(e);
			},
			setCatalog (e) {
				console.log(e);
			},
			addFontsize () {
				this.fontsize += 4;
			},
			changePageType () {
				this.pageType = this.pageType == 'real' ? 'scroll' : 'real';
			},
			reduceFontSize () {
				this.fontsize -= 4;
			},
			changeLineHeight () {
				this.lineHeight += 4;
			},
			changeSkin () {
				this.color = '#f5f5f5';
				this.bgColor = '#999';
			},
			changeChapter () {
				if ( this.noChapter ) {
					page.change({
						start: 100
					})
				} else {
					setTimeout(() => {
						let contents = [{
							chapter: 3,
							content: this.getContent(3),
							title: '第三章',
							isStart: false,
							isEnd: false
						},{
							chapter: 4,
							content: this.getContent(4),
							title: '第四章',
							isStart: false,
							isEnd: false
						},{
							chapter: 5,
							content: this.getContent(5),
							title: '第五章',
							isStart: false,
							isEnd: false
						}]
						const { page } = this.$refs;
						page.change({
							contents: contents,
							start: 0,
							currentChapter: 5
						})
					}, 2000)
				}
			},
			loadmoreContent (chapter, callback) {
				setTimeout(() => {
					callback('success', {
						chapter: chapter,
						content: this.getContent(chapter),
						title: '第' + chapter + '章',
						isStart: chapter == 1,
						isEnd: chapter == 7
					});
					// callback('fail');
					// callback('timeout');
				}, 2000)
			},
			preloadContent (chapters, callback) {
				setTimeout(() => {
					let contents = []
					for ( let i in chapters ) {
						contents.push({
							chapter: chapters[i],
							start: 0,
							content: this.getContent(chapters[i]),
							title: '第' + chapters[i] + '章',
							isStart: chapters[i] == 1,
							isEnd: chapters[i] == 7
						})
					}
					callback('success', contents);
					// callback('fail');
					// callback('timeout');
				}, 2000)
			},
			getContent (chapter = 1) {
return `第${chapter}章
                你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊
你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊
你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊
你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊
你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊
你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊
你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊
你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊
你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊
你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊
你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊
你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊
你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊
你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊
你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊你们好啊

神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊
神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊
神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊
神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊
神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊
神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊
神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊
神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊
神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊
神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊
神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊

疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊

傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊

神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊
神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊
神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊
神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊
神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊
神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊
神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊
神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊
神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊
神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊
神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊神经病啊

疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊
疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊疯子啊啊

傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊傻子啊啊
`
			}
		}
	}
```