<template>
	<view class="real-page" id="real-touch" :prop="touchProp" :change:prop="touch.touchPropChange" @touchstart="touch.onTouchstart" @touchmove="touch.onTouchmove" @touchend="touch.onTouchend">
		<slot></slot>
	</view>
</template>

<script>
	export default {
		props: {
			current: {
				type: Number,
				default: 0
			},
			type: {
				type: String,
				default: 'real'
			}
		},
		data () {
			return {
				isRestart: false
			}
		},
		computed: {
			touchProp () {
				return {
					current: this.current,
					type: this.type,
					isRestart: this.isRestart
				};
			}
		},
		methods: {
			changeCurrent (e) {
				this.$emit('change', {current: e.current, value: e.value});
			},
			restart () {
				this.isRestart = true;
				setTimeout(() => {
					this.isRestart = false;
				}, 50)
			}
		}
	}
</script>

<script module="touch" lang="renderjs" type="module">
	const boxClass = 'real-page-item-box';
	let myTouch
	let box;
	let page;
	let bg;
	let shadow;
	export default {
		data () {
			return {
				windowWidth: 0,
				startX: 0,
				moveX: 0,
				oldMoveX: 0,
				currentSync: 0
			}
		},
		mounted () {
			this.initTouch.bind(this);
			this.windowWidth = document.body.offsetWidth;
			window.setTimeout(() => {
				this.currentSync = this.touchProp.current;
				this.setDomStyle();
			}, 200)
		},
		methods: {
			initTouch () {
				myTouch = touch.init(document.getElementById('real-touch'));
				// 观测更新的数据在 view 层可以直接访问到
				myTouch.setOption(this.touchProp);
			},
			onTouchstart(e, instance) {
				if ( e.touches.length > 1 ) {
					return;
				}
				let touch = e.touches[0];
				this.startX = touch.pageX;
				let length = document.getElementsByClassName(boxClass).length;
				if (  this.startX < this.windowWidth / 2) {
					if ( this.currentSync > 0 ) {
						this.setDom(this.currentSync - 1);
					} else {
						return
					}
				}
				if (  this.startX > this.windowWidth / 2) {
					if ( this.currentSync < length - 1 ) {
						this.setDom(this.currentSync);
					} else {
						return
					}
				}
				this.removeAnimationStyle();
				if ( length <= 0 ) {
					return;
				}
				this.moveX = 0;
				box.style.boxShadow = '5px 0 10px 2px rgba(0,0,0,0.1)';
				if ( this.touchProp.type == 'real' ) {
					bg.style.boxShadow = '-5px 0 10px rgba(0,0,0,0.1)';
				}
			},
			onTouchmove (e, instance) {
				let length = document.getElementsByClassName(boxClass).length;
				if ( length <= 0 ) {
					return;
				}
				let touch = e.touches[0];
				if (  this.startX < this.windowWidth / 2) {
					if ( this.currentSync > 0 ) {
						this.moveX = 100 - (((touch.pageX - this.startX) / this.windowWidth) * 100);
					} else {
						return
					}
				}
				if (  this.startX > this.windowWidth / 2) {
					if ( this.currentSync < length - 1 ) {
						this.moveX = -(((touch.pageX - this.startX) / this.windowWidth) * 100);
					} else {
						return
					}
				}
				if ( this.moveX > 100 ) {
					this.moveX = 100;
				}
				if ( this.moveX < 0 ) {
					this.moveX = 0;
				}
				this.setMoveStyle();
			},
			onTouchend (e, instance) {
				let length = document.getElementsByClassName(boxClass).length;
				if ( length <= 0 ) {
					return;
				}
				let value = 0;
				if (  this.startX < this.windowWidth / 2) {
					if ( this.currentSync > 0 ) {
						if ( this.moveX < 70 && this.moveX > 0 ) {
							this.moveX = 0;
							this.currentSync--;
							value = 1;
						} else {
							this.moveX = 100;
						}
					} else {
						return
					}
				}
				if (  this.startX > this.windowWidth / 2) {
					if ( this.currentSync < length - 1 ) {
						if ( this.moveX > 30 ) {
							this.moveX = 100;
							this.currentSync++;
							value = -1;
						} else {
							this.moveX = 0;
						}
					} else {
						return
					}
				}
				this.setAnimationStyle();
				this.setMoveStyle();
				window.setTimeout(() => {
					box.style.boxShadow = '';
					bg.style.boxShadow = '';
					shadow.style.width = '0px';
					if ( value != 0 ) {
						this.changeCurrent(value);
					}
				}, 300)
			},
			touchPropChange (newVal, oldVal) {
				if ( newVal.current != oldVal.current ) {
					this.currentChange(newVal.current);
				}
				if ( newVal.type != oldVal.type ) {
					this.typeChange(newVal.type);
				}
				if ( newVal.isRestart != oldVal.isRestart ) {
					this.restart(newVal.isRestart);
				}
			},
			currentChange (newVal) {
				this.currentSync = newVal;
				this.setDomStyle();
			},
			typeChange (newVal) {
				this.setDomStyle();
			},
			restart (newVal) {
				if ( newVal ) {
					this.setDomStyle();
					this.setDom(this.currentSync);
				}
			},
			setDom (value) {
				let boxs = document.getElementsByClassName(boxClass);
				if ( boxs.length <= 0 ) {
					return;
				}
				box = boxs[value];
				page = box.firstChild;
				bg = box.childNodes[1];
				shadow = box.lastChild;
			},
			setDomStyle () {
				let boxs = document.getElementsByClassName(boxClass);
				for ( let i = 0; i < boxs.length; i++ ) {
					if ( i < this.currentSync ) {
						boxs[i].style.transform = 'translate(-100%)';
						if ( this.touchProp.type == 'real' ) {
							boxs[i].firstChild.style.transform = 'translate(100%)';
							boxs[i].childNodes[1].style.transform = 'translate(0)';
							boxs[i].lastChild.style.width = '0px';
						}
						if ( this.touchProp.type == 'cover' ) {
							boxs[i].firstChild.style.transform = 'translate(0)';
							boxs[i].childNodes[1].style.transform = 'translate(100%)';
							boxs[i].lastChild.style.width = '0px';
						}
					}
				}
			},
			setMoveStyle () {
				box.style.transform = `translate(-${this.moveX}%)`;
				if ( this.touchProp.type == 'real' ) {
					page.style.transform = `translate(${this.moveX}%)`;
					bg.style.transform = `translate(${100 - this.moveX}%)`;
					shadow.style.width = this.moveX > 30 ? '30px' : this.moveX + 'px';
				}
			},
			//设置动画时间
			setAnimationStyle () {
				box.style.transition = 'transform 0.3s';
				page.style.transition = 'transform 0.3s';
				bg.style.transition = 'transform 0.3s';
			},
			//移除动画时间
			removeAnimationStyle () {
				box.style.transition = '';
				page.style.transition = '';
				bg.style.transition = '';
			},
			//current改变触发事件
			changeCurrent (value) {
				UniViewJSBridge.publishHandler('onWxsInvokeCallMethod', {
					cid: this._$id,
					method: 'changeCurrent',
					args: {'current': this.currentSync, 'value': value}
				})
			}
		}
	}
</script>

<style scoped>
	.real-page {
		height: 300px;
		position: relative;
	}
</style>
