<script>
	export default {
		globalData: {
			routeDisabled: false,
			routePush: function (url, animationType = 'slide-in-right') {
				//路由防抖
				if ( getApp().globalData.routeDisabled ) {
					return;
				}
				getApp().globalData.routeDisabled = true;
				uni.navigateTo({
					url: url,
					animationType: animationType,
					complete: (res) => {
						getApp().globalData.routeDisabled = false;
					}
				})
			}  
		},  
		onLaunch: function() {
			console.log('App Launch')
			plus.screen.lockOrientation('portrait-primary');
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
			uni.$emit('app-hide');
		}
	}
</script>

<style>
	/*每个页面公共css */
	.actived:active {
		background-color: #EEEEEE;
	}
</style>
