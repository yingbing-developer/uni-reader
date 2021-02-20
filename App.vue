<script>
	export default {
		globalData: {
			//路由防抖
			routeDisabled: false,
			//跳转路由
			routePush: function (url, animationType = 'zoom-fade-out') {
				return new Promise((resolve, reject) => {
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
							resolve('complete')
						}
					})
				})
			},
			//路由返回
			routeBack: function (delta = 1) {
				return new Promise((resolve, reject) => {
					//路由防抖
					if ( getApp().globalData.routeDisabled ) {
						return;
					}
					getApp().globalData.routeDisabled = true;
					uni.navigateBack({
						delta: delta,
						complete: (res) => {
							getApp().globalData.routeDisabled = false;
							resolve('complete')
						}
					})
				})
			},
			//确认对话框
			message: function (title = '提示', message = '提示信息') {
				return new Promise((resolve, reject) => {
					getApp().globalData.routePush('/pages/base/confirm/index', 'none').then((res) => {
						if ( res == 'complete' ) {
							setTimeout(() => {
								uni.$emit('message-info', {
									title: title,
									message: message
								});
								uni.$on('message-btn', (data) => {
									resolve(data.flag)
									getApp().globalData.routeBack();
									uni.$off('message-btn');
								})
							}, 60)
						}
					});
				})
			},
			//选择对话框
			actionSheet: function (list) {
				return new Promise((resolve, reject) => {
					getApp().globalData.routePush('/pages/base/actionSheet/index', 'none').then((res) => {
						if ( res == 'complete' ) {
							setTimeout(() => {
								uni.$emit('actionSheet-info', {
									list: list
								});
								uni.$on('actionSheet-btn', (data) => {
									resolve(data.flag)
									getApp().globalData.routeBack();
									uni.$off('actionSheet-btn');
								})
							}, 60)
						}
					});
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
