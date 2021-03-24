import { mapGetters, mapMutations } from 'vuex'
export const skinMixin = {
	computed: {
		...mapGetters(['skinMode', 'skinColor'])
	},
	methods: {
		...mapMutations(['changeSkin'])
	}
}

//菜单拖曳显示
export const menuTouchMixin = {
	data () {
		return {
			pointX: 0,
			touchTime: 0,
			menuLate: 0,
			menuOpac: 0,
			//控制列表是否滚动
			scrollable: true
		}
	},
	methods: {
		touchstart (e) {
			if ( e.touches.length > 1 ) {
				return;
			}
			const touch = e.touches[0];
			this.pointX = touch.pageX;
			this.scrollable = false;
			this.$refs.leftMenu.open();
			this.timer = setInterval(() => {
				this.touchTime += 0.1;
			}, 100)
		},
		touchmove (e) {
			if ( this.touchTime < 0.3 ) {
				return;
			}
			const touch = e.touches[0];
			this.menuLate = this.$refs.leftMenu.mulriple * (touch.pageX - this.pointX);
			this.menuOpac = this.menuLate / Math.abs(this.$refs.leftMenu.anima.late) * this.$refs.leftMenu.anima.opac;
		},
		touchend (e) {
			if ( this.timer ) {
				clearInterval(this.timer);
			}
			if ( this.$refs.leftMenu.popuplate >= -240 || (this.touchTime <= 0.3 && this.$refs.leftMenu.popuplate > -540) ) {
				this.$refs.leftMenu.show();
			} else {
				this.$refs.leftMenu.hide();
				setTimeout(() => {
					this.menuLate = -30;
				}, this.$refs.leftMenu.anima.duration)
			}
			this.$nextTick(() => {
				this.pointX = 0;
				this.touchTime = 0;
				this.scrollable = true;
			})
		}
	}
}

const dom = weex.requireModule('dom');
//本地搜索
export const localSearchMixin = {
	data () {
		return {
			checkes: [],
			nowPath: '',
			list: [],
			//名称过滤
			nameFilter: '',
			//滚动距离
			oldOffsetY: 0,
			//扩展存储卡路径
			SDpaths: []
		}
	},
	computed: {
		listSync () {
			let arr = this.list.filter((item) => {
				if ( item.name.indexOf(this.nameFilter) > -1 ) {
					return item;
				}
			})
			return arr;
		}
	},
	methods: {
		//获取sd卡路径
		getSDPath () {
			//获取扩展存储卡
			let GetSDPath = plus.android.importClass('com.itstudy.io.GetExtSDCardPathList');
			let getSDPath = new GetSDPath();
			let pathStr = getSDPath.getSDPath();
			this.SDpaths = JSON.parse(JSON.parse(JSON.stringify(pathStr))) || [];
		},
		//全选文件
		selectAll () {
			this.checkes = [];
			let len = this.listSync.length;
			for ( let i = 0; i < len; i++ ) {
				this.checkes.push(this.listSync[i].path)
			}	
			this.$refs.bubble.hide();
		},
		//取消全选
		cancelAll () {
			this.checkes = [];
			this.$refs.bubble.hide();
		},
		//删除操作
		deleteAction () {
			if ( this.checkes.length <= 0 ) {
				return;
			}
			getApp().globalData.message('操作提示', '确认删除选择的文件吗？').then((res) => {
				if ( res == 'confirm' ) {
					this.deleteFiles(this.checkes);
				}
			});
			this.$refs.bubble.hide();
		},
		//选择文件
		check (path) {
			let index = this.checkes.indexOf(path);
			if ( index > -1 ) {
				this.checkes.splice(index, 1);
			} else {
				this.checkes.push(path);
			}
		},
		//过滤名称
		setNameFilter (val) {
			this.nameFilter = val;
		},
		//前往内部存储根目录
		goInternalRoot () {
			this.clearComicPath();
			this.getFileSystem();
			this.$refs.bubble.hide();
		},
		//前往扩展卡根目录
		goExtenalRoot (path) {
			this.clearComicPath();
			this.getFileSystem(plus.android.newObject("java.io.File", path));
			this.$refs.bubble.hide();
		},
		//返回上级目录
		backParent (path) {
			let fd = plus.android.newObject("java.io.File", path);
			if ( fd != null && plus.android.invoke(fd, 'exists') ) {
				let parent = plus.android.invoke(fd, 'getParent');
				if ( parent ) {
					this.getFileSystem(plus.android.newObject("java.io.File", parent));
				} else {
					uni.showToast({
						icon: 'none',
						title: '没有上级文件夹了'
					})
				}
			} else {
				this.getFileSystem();
			}
		},
		scroll (e) {
			this.oldOffsetY = e.contentOffset.y;
		},
		//返回顶部
		scrollTop () {
			dom.scrollToElement(this.$refs.listTop, {animated: false});
			this.oldOffsetY = 0;
		}
	}
}