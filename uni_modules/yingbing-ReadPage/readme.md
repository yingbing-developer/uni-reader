#使用须知

* 1、这是一个小说分页插件，包含翻页功能，但不包含设置窗口
* 2、这个插件只支持app-vue和h5手机端, ios端没做测试,希望有条件的朋友能帮我测试下
* 3、小说分页有2种模式，章节模式和整书模式，章节模式就是需要分章节加载的小说，整书模式就是不分章节直接传入整本小说的模式
* 4、小说内容只支持纯文本格式 ，例如（内容内容内容内容内容/r/n内容内容内容内容内容）

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

#event事件
| 事件名 | 返回值 | 说明 |
| :----- | :----: | :---- |
| loadmore | chapter,next,error | 加载章节内容（chapter为需要加载的章节序号，next为加载成功回调，error为加载失败回调 noChapter为false有效）|
| preload | chapters,next,error | 预加载章节内容（chapters为需要预加载的章节序号集合，next为加载成功回调，error为加载失败回调 noChapter为false有效）|
| currentChange | currentInfo | 阅读页面改变触发事件（返回当前阅读页面信息）|
| setCatalog | catalog | 获取章节目录事件（noChapter为true时有效）|

#章节模式 内置方法
| 方法名 | 参数 | 说明 |
| :----- | :---- | :---- |
| init | { contents: '小说内容集合', current: '小说定位章节序号' } | 初始化小说内容 |
| change | { contents: '小说内容集合', current: '小说定位章节序号' } | 跳转小说位置 |

#章节模式 contents对象介绍
| 键名 | 类型 | 说明 |
| :----- | :----: | :---- |
| chapter | Number | 章节序号 |
| start | Number | 章节定位的位置（current为当前章节时有效） |
| content | String | 章节内容 |
| isEnd | Boolean | 是否是最后一个章节 |

#整书模式 内置方法
| 方法名 | 参数 | 说明 |
| :----- | :---- | :---- |
| init | { contents: '小说内容集合' } | 初始化小说内容 |
| change | { start: '小说定位阅读位置' } | 跳转小说阅读位置（start表示小说第几个字） |

#整书模式 contents对象介绍
| 键名 | 类型 | 说明 |
| :----- | :----: | :---- |
| start | Number | 小说定位的位置 |
| content | String | 小说全部内容 |


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
	no-chapter
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
					fontsize: 15,
					lineHeight: 15,
					color: '#333',
					slide: 40,
					bgColor: '#fcd281'
				}
			},
			onReady() {
				let contents = [{
					chapter: 1,
					start: 50,
					content: this.getContent(1) + this.getContent(2) + this.getContent(3),
					isEnd: false
				},{
					chapter: 2,
					start: 0,
					content: this.getContent(2),
					isEnd: false
				},{
					chapter: 3,
					start: 100,
					content: this.getContent(3),
					isEnd: false
				}]
				const { page } = this.$refs;
				page.init({
					contents: contents,
					current: 1
				})
			},
			methods: {
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
					let contents = [{
						chapter: 3,
						start: 0,
						content: this.getContent(3),
						isEnd: false
					},{
						chapter: 4,
						start: 0,
						content: this.getContent(4),
						isEnd: false
					},{
						chapter: 5,
						start: 0,
						content: this.getContent(5),
						isEnd: false
					}]
					const { page } = this.$refs;
					page.change({
						contents: contents,
						start: 100,
						current: 5
					})
				},
				loadmoreContent (chapter, next, error) {
					console.log(chapter);
					next({
						chapter: chapter,
						start: 0,
						content: this.getContent(chapter),
						isEnd: chapter == 7
					});
				},
				preloadContent (chapters, next, error) {
					let contents = []
					for ( let i in chapters ) {
						contents.push({
							chapter: chapters[i],
							start: 0,
							content: this.getContent(chapters[i]),
							isEnd: chapters[i] == 7
						})
					}
					setTimeout(() => {
						next(contents);
					}, 500)
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
	`
				}
			}
		}
```