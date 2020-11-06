<template>
	<view class="page" :id="'dom' + dataId" :prop="domProp" :change:prop="dom.domPropChange" :style="{color: color, 'font-size': this.fontSize + 'px', 'line-height': lineHeight + 'px'}">
		<view :id="'content' + dataId" class="content" ref="content"></view>
	</view>
</template>

<script>
	export default {
		props: {
			//传入唯一标识动态命名ID用于获取dom对象
			dataId: {
				type: String,
				default () {
					let mydate = new Date();
					return 'cms' + mydate.getMinutes() + mydate.getSeconds() + mydate.getMilliseconds() + Math.round(Math.random() * 10000);
				}
			},
			//传入文本
			content: {
				type: String,
				default: ''
			},
			//传入候补文本，用于字体变小时的补充文本
			supContent: {
				type: String,
				default: ''
			},
			//传入分页类型（是上一页: prev 还是下一页: next）
			type: {
				type: String,
				default: 'next'
			},
			//传入字体大小
			fontSize: {
				type: Number,
				default: 20
			},
			//传入字体颜色
			color: {
				type: String,
				default: ''
			},
			//传入阅读位置（如果type为next则是起始阅读位置, 如果type为prev则是结束阅读位置）
			record: {
				type: Number,
				default: 0
			},
			//文本总长度
			length: {
				type: Number,
				default: 0
			},
			//是否是当前页面
			isPageNow: {
				type: Boolean,
				default: false
			}
		},
		data () {
			return {
				//保存当前页起始位置
				start: 0,
				//保存当前页结束位置
				end: 0,
				//是否重置内容
				restartValue: 0
			}
		},
		created () {
			//如果当前阅读位置为文本最后位置，需要手动触发ready事件
			if ( this.record == this.length ) {
				this.$emit('ready', {start: this.record, end: this.record, updatePrev: false});
			}
		},
		computed: {
			lineHeight () {
				return this.fontSize + 10;
			},
			domProp () {
				return {
					fontSize: this.fontSize,
					lineHeight: this.lineHeight,
					bookContent: this.content,
					supContent: this.supContent,
					isPageNow: this.isPageNow,
					dataId: this.dataId,
					record: this.record,
					type: this.type,
					isLast: this.end >= this.length,
					restart: this.restartValue
				};
			}
		},
		methods: {
			ready (e) {
				if ( e.type == 'init' ) {
					//计算开始和结束位置
					if ( this.type == 'next' ) {
						this.start = this.record;
						this.end = this.record + e.length;
					}
					if ( this.type == 'prev' ) {
						this.end = this.record + e.deValue;
						this.start = this.end - e.length > 0 ? this.end - e.length : 0;
					}
				}
				if ( e.type == 'update' ) {
					//计算结束位置
					this.end = this.start + e.length;
				}
				//判断是否是首屏加载的初始页面
				if ( this.isPageNow ) {
					//抛出初始页面ready事件(开始位置,结束位置)
					this.$emit('ready', {start: this.start, end: this.end, updatePrev: e.updatePrev});
					setTimeout(() => {
						//修改restart值，为下次重置作准备
						this.restartValue = 0;
					}, 100)
				}
			},
			restart () {
				this.restartValue += 1;
			}
		},
		watch: {
			record (newVal) {
				//如果当前阅读位置为文本最后位置，需要手动触发ready事件
				if ( newVal == this.length ) {
					this.$emit('ready', {start: newVal, end: newVal, updatePrev: false});
				}
			},
			isPageNow (newVal) {
				if ( newVal ) {
					this.$emit('ready', {start: this.start, end: this.end, updatePrev: false});
				}
			}
		}
	}
</script>

<script lang="renderjs" module="dom" type="module">
	let myDom
	export default {
		data () {
			return {
				//根据容器高度，行高计算出的最大高度
				viewHeight: 0
			}
		},
		mounted () {
			this.initDom.bind(this);
			setTimeout(() => {
				if ( this.domProp.bookContent ) {
					this.initView();
					this.start()
				}
			}, 30)
		},
		methods: {
			//设置下一页内容
			setNowPage () {
				let text = this.domProp.bookContent;
				const content = document.getElementById('content' + this.domProp.dataId);
				content.textContent = '';
				this.addText(content, text).then((length) => {
					this.ready('init', length);
				});
			},
			//添加文字
			addText (content, text) {
				return new Promise((resolve, reject) => {
					const addNum = 50;
					let len = Math.ceil(text.length / addNum);
					//每次添加addNum个字符
					for ( let i = 0; i < len; i++ ) {
						content.textContent += text.substring(i * addNum, (i + 1) * addNum);
						//文本高度超过规定高度
						if ( content.offsetHeight > this.viewHeight ) {
							len = content.textContent.length;
							//文本每次减去最后一个字符
							for ( let j = 0; j < len; j++ ) {
								content.textContent = content.textContent.substr(0, content.textContent.length-1);
								//文本高度等于规定高度，结束循环
								if ( content.offsetHeight == this.viewHeight ) {
									resolve(content.textContent.length);
									return;
								}
							}
						} else {
							if ( i == len - 1 ) {
								resolve(content.textContent.length);
								return;
							}
						}
					}
				})
			},
			//设置上一页内容
			setPrevPage () {
				let text = this.domProp.bookContent;
				const content = document.getElementById('content' + this.domProp.dataId);
				content.textContent = '';
				const addNum = 50;
				let len = Math.ceil(text.length / addNum);
				let end = addNum;
				//遍历截取的文本内容，从文本的末尾开始循环放入新建的文本容器
				for ( let i = 0; i < len; i++) {
					//每次从最后面添加addNum个字符
					if ( i == len - 1 ) {
						end = text.length - (i * addNum);
					}
					content.textContent = text.substr(-(i + 1) * addNum, end) + content.textContent;
					if ( content.offsetHeight > this.viewHeight ) {
						len = content.textContent.length;
						//文本每次减去最前面的一个字符
						for ( let j = 0; j < len; j++ ) {
							content.textContent = content.textContent.substr(1);
							//文本高度等于规定高度，结束循环
							if ( content.offsetHeight == this.viewHeight ) {
								this.ready('init', content.textContent.length);
								return;
							}
						}
					} else {
						//如果文本遍历完后文本高度还是小于等于规定的高度, 这是第一页, 则请求新的文本补全整个页面
						if ( i == len - 1 ) {
							text = this.domProp.supContent;
							//排版上一页内容时，如果上一页是第一页的话可能会出现内容不够排满整个页面的情况，这时候需要请求后面的内容补全整个页面，先将现在已排版的内容长度记录下来，用于计算结束位置
							let oldLength = content.textContent.length;
							this.addText(content, text).then((length) => {
								this.ready('init', length, length - oldLength);
							});
						}
					}
				}
			},
			initDom () {
				myDom = dom.init(document.getElementById('dom' + this.domProp.dataId));
				// 观测更新的数据在 view 层可以直接访问到
				myDom.setOption(this.domProp);
			},
			initView () {
				let windowHeight = document.getElementById('dom' + this.domProp.dataId).offsetHeight;
				this.viewHeight = Math.floor(windowHeight / this.domProp.lineHeight) * this.domProp.lineHeight;
			},
			start () {
				if ( this.domProp.type == 'next' ) {
					this.setNowPage();
				}
				if ( this.domProp.type == 'prev' ) {
					this.setPrevPage();
				}
			},
			domPropChange (newVal, oldVal) {
				//字体改变
				if ( newVal.fontSize != oldVal.fontSize ) {
					this.fontChange(newVal.fontSize, oldVal.fontSize);
				}
				//内容改变
				if ( newVal.bookContent != oldVal.bookContent ) {
					this.contentChange(newVal.bookContent)
				}
				//重排版
				if ( newVal.restart != oldVal.restart ) {
					this.restartChange(newVal.restart)
				}
			},
			fontChange (newVal, oldVal) {
				//不是当前页面不操作
				if ( !this.domProp.isPageNow ) {
					return;
				}
				this.initView();
				const content = document.getElementById('content' + this.domProp.dataId);
				clearTimeout(this.timer);
				this.timer = setTimeout(() => {
					//字体变大
					if ( oldVal < newVal ) {
						//如果文本高度没有超过规定高度则不操作
						if ( content.offsetHeight <= this.viewHeight ) {
							return;
						}
						let len = content.textContent.length;
						for ( let i = 0; i < len; i++ ) {
							content.textContent = content.textContent.substr(0, content.textContent.length - 1);
							if ( content.offsetHeight == this.viewHeight ) {
								break;
							}
						}
						this.ready('update', content.textContent.length, 0, true);
					} 
					if ( oldVal > newVal ) {
						//字体变小
						//如果是最后一页则不操作
						if ( !this.domProp.isLast ) {
							//从页面显示的文本后面截取全部剩余的文本，添加补充页面
							let text = this.domProp.bookContent.substr(content.textContent.length) + this.domProp.supContent;
							this.addText(content, text).then((length) => {
								this.ready('update', length, 0, true);
							});
						}
					}
					//更新上下页内容
				}, 150)
			},
			//排版页面内容
			contentChange(newVal) {
				if ( newVal ) {
					this.initView();
					this.start()
				}
			},
			//监听restart变化，重置页面内容
			restartChange (newVal) {
				if ( newVal > 0 ) {
					clearTimeout(this.timer);
					this.timer = setTimeout(() => {
						this.initView();
						this.start()
					}, 100)
				}
			},
			//通知父组件文本加载完成
			ready (type, length, deValue = 0, updatePrev = false) {
				UniViewJSBridge.publishHandler('onWxsInvokeCallMethod', {
					cid: this._$id,
					method: 'ready',
					args: {'type': type, 'length': length, 'deValue': deValue, 'updatePrev': updatePrev}
				})
			}
		}
	}
</script>

<style scoped>
	.page {
		padding: 0 20rpx;
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		max-height: 100%;
		overflow: hidden;
	}
	.content {
		white-space: pre-wrap;
		word-break: break-all;
		word-wrap: break-word;
	}
</style>
