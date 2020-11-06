#使用须知

* 1、请直接下载本项目导入hbuilderX运行，我用的是2.8.8版本
* 2、这个项目只支持android app端,因为没有会IOS的同事，且没有苹果手机
* 3、请注意压缩包中有个android文件夹，里面放的是原生插件，分别是读取txt文件内容和读取文件列表的插件
* 4、请注意压缩包中的原生插件，只是普通的java文件，不是打包好的插件，只能用离线打包的方式使用，需要下载官方的离线SDK包，使用方法见这个帖子:[uniapp直接调用安卓自定义方法](https://ask.dcloud.net.cn/article/36065)
* 5、如果只是想体验下的朋友，可以直接运行使用，项目中有为了调试而写的方法，只是性能不如原生插件，只能调试用，直接去/pages/read/index.vue和/pages/search/index.nvue文件下修改方法就行，都是注释好了的
* 6、翻页方式包括（左右滑动，上下滑动，点击翻页）
* 7、以nvue的list组件为基础写了个列表滚动组件，做了虚拟列表优化，不过效果不是很好
* 8、首页的拖曳菜单，效果不是很好，有些bug，小弟能力有限，只能写成这样，期望有大佬能告知更好的实现方法
* 9、除了阅读页是vue外，其余页面都是nvue
* 10、如果想要使用原生方法调试也可以本地制作自定义基座，以自定义基座的方式来运行，本地制作自定义基座的方法与本地打包的方法类似，具体见这里：[uni本地打包android自定义基座](https://www.cnblogs.com/fdxjava/articles/13354591.html)


* 需要修改的2个方法
```javascript
	getFileSystem (ff) {
		let fd = ff && ff != null && plus.android.invoke(ff, 'exists') ? ff : environment.getExternalStorageDirectory();
		this.updatePath(plus.android.invoke(fd, 'getPath'));
		
		//获取文件列表 正式用
		let GetFileList = plus.android.importClass('com.itstudy.io.GetFileList');
		let getFile = new GetFileList();
		let str = getFile.getFiles(plus.android.invoke(fd, 'getPath'));
		let list = str.split('::');
		let folder = JSON.parse(JSON.parse(JSON.stringify(list[0])));
		let file = JSON.parse(JSON.parse(JSON.stringify(list[1])));
		
		
		//获取文件列表 调试用
		// let list = plus.android.invoke(fd, "listFiles");
		// let len = list ? list.length : 0;
		// let file = [];
		// let folder = [];
		// for(let i=0; i<len; i++){
		//     // 过滤隐藏文件  
		//     if ( !plus.android.invoke(list[i],"isHidden") ){
		// 		let name = plus.android.invoke(list[i], 'getName');
		// 		if ( plus.android.invoke(list[i],"isDirectory") ){
		// 			folder.push({
		// 				name: name,
		// 				type: 'folder',
		// 				size: '0B',
		// 				time: dateFormat(plus.android.invoke(list[i],"lastModified")),
		// 				createTime: plus.android.invoke(list[i],"lastModified"),
		// 				path: plus.android.invoke(list[i],"getPath")
		// 			})
		// 		    // 文件夹
		// 		} else{
		// 			//是否是txt文件
		// 		    if ( plus.android.invoke(name, "endsWith", '.txt') ) {
		// 		    	file.push({
		// 					name: name,
		// 					type: suffix(name),
		// 					size: this.readFileSize(list[i]),
		// 					time: dateFormat(plus.android.invoke(list[i],"lastModified")),
		// 					createTime: plus.android.invoke(list[i],"lastModified"),
		// 					path: plus.android.invoke(list[i],"getPath")
		// 				})
		// 		    }
		// 		}  
		//     }
		// }
		
		file.sort((a, b) => {
			return b.createTime - a.createTime;
		})
		this.fileLength = file.length;
		this.list = folder.concat(file);
		this.checkes = [];
	}
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