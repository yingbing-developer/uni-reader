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
							uni.navigateBack({delta: 1})
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
							uni.navigateBack({delta: 1})
							uni.$off('message-btn');
						})
					}, 60)
				}
			});
		})
	},
	catalog (type) {
		return new Promise((resolve, reject) => {
			uni.navigateTo({
				url: `/modules/catalog?type=${type}`,
				complete: (res) => {
					uni.$on('catalog-btn', (data) => {
						resolve(data)
						uni.navigateBack({delta: 1});
						uni.$off('catalog-btn');
					})
				}
			});
		})
	},
	security (data = {}) {
		const type = data.type || 'input'
		const title = data.title || '请输入安全密码'
		return new Promise((resolve, reject) => {
			uni.navigateTo({
				url: `/modules/security?type=${type}&title=${title}`,
				complete: (res) => {
					uni.$on('security-btn', (data) => {
						resolve(data)
						uni.navigateBack({delta: 1});
						uni.$off('security-btn');
					})
				}
			});
		})
	}
}