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
					this.menuLate = 0;
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