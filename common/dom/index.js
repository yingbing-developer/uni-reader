export default {
	//选择对话框
	actionSheet (list, current = -1) {
		return new Promise((resolve, reject) => {
			uni.navigateTo({
				url: `/modules/actionSheet?list=${encodeURIComponent(JSON.stringify(list))}&current=${current}`,
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
	//确认对话框
	confirm (title = '', message = '') {
		return new Promise((resolve, reject) => {
			uni.navigateTo({
				url: `/modules/confirm?title=${title}&message=${encodeURIComponent(message)}`,
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
	},
	xhr (type = 'GET', href, options) {
		return new Promise((resolve, reject) => {
			uni.navigateTo({
				url: `/modules/xhr?type=${type}&url=${encodeURIComponent(href)}&options=${options ? encodeURIComponent(JSON.stringify(options)) : ''}`,
				complete: (res) => {
					setTimeout(() => {
						uni.$on('xhr-btn', (data) => {
							resolve(data)
							getApp().globalData.$Router.back();
							uni.$off('xhr-btn');
						})
					}, 60)
				}
			});
		})
	}
}