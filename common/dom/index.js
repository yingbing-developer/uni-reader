export default {
	//选择对话框
	actionSheet (list, current = -1) {
		return new Promise((resolve, reject) => {
			uni.navigateTo({
				url: `/pages/base/actionSheet?list=${encodeURIComponent(JSON.stringify(list))}&current=${current}`,
				animationType: 'none',
				complete: (res) => {
					setTimeout(() => {
						uni.$on('actionSheet-btn', (data) => {
							resolve(data)
							getApp().globalData.$Router.back();
							uni.$off('actionSheet-btn');
						})
					}, 60)
				}
			});
		})
	},
	confirm (title = '', message = '') {
		return new Promise((resolve, reject) => {
			uni.navigateTo({
				url: `/pages/base/confirm?title=${title}&message=${encodeURIComponent(message)}`,
				animationType: 'none',
				complete: (res) => {
					setTimeout(() => {
						uni.$on('message-btn', (data) => {
							resolve(data.flag)
							getApp().globalData.$Router.back();
							uni.$off('message-btn');
						})
					}, 60)
				}
			});
		})
	}
}