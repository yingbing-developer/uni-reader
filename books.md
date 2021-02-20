#使用须知

* 1、请直接下载本项目导入hbuilderX运行，我用的是2.8.8版本
* 2、这个项目只支持android app端,因为没有会IOS的同事，且没有苹果手机
* 3、请注意压缩包中有个android文件夹，里面放的是原生插件,具体是做什么用的，方法里面已经写好了
* 4、请注意压缩包中的原生插件，只是普通的java文件，不是打包好的插件，只能用离线打包的方式使用，需要下载官方的离线SDK包，使用方法见这个帖子:[uniapp直接调用安卓自定义方法](https://ask.dcloud.net.cn/article/36065)
* 5、如果只是想体验下的朋友，可以直接运行使用，项目中有为了调试而写的方法，只是性能不如原生插件，只能调试用，根据情况选择就行，方法都是注释好了的
* 6、小说翻页方式包括（左右滑动，上下滑动，点击翻页, 伪·仿真翻页，覆盖翻页）；漫画翻页方式只有上下滚动
* 7、以nvue的list组件为基础写了个列表滚动组件，做了虚拟列表优化，不过效果不是很好， 白屏时间较长
* 8、首页的拖曳菜单，效果不是很好，有些bug，小弟能力有限，只能写成这样，期望有大佬能告知更好的实现方法
* 9、除了阅读页是vue外，其余页面都是nvue
* 10、如果想要使用原生方法调试也可以本地制作自定义基座，以自定义基座的方式来运行，本地制作自定义基座的方法与本地打包的方法类似，具体见这里：[uni本地打包android自定义基座](https://www.cnblogs.com/fdxjava/articles/13354591.html)
* 11、获取扩展TF卡路径的方法只有原生,如果不需要可以删掉
* 12、音乐播放只支持应用内播放，不支持后台播放
* 13、在线漫画的接口仅供学习使用，请不要拿来做商业活动，也请不要随意攻击别人的网站，因此而造成的后果，请自己承担
* 14、如果有什么问题都可以说


* 需要修改调试用方法和正式用的方法包括：
	* /pages/book/search.nvue    getFileSystem()
	* /pages/book/read.vue       getContent()
	* /pages/comic/search.nvue   getFileSystem()、getComicList()
	* /pages/comic/read.nvue     getComicSync()
	* /pages/music/search.nvue   getFileSystem()
	* 修改方式如下
```javascript
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
		
		//获取内容 调试用
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
	// }
```