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
	xhr (xhrs) {
		return new Promise((resolve, reject) => {
			// xhrs = xhrs ? xhrs.options?.Charset == 'gb2312' ? JSON.stringify(xhrs)
			uni.navigateTo({
				url: `/modules/xhr?xhrs=${xhrs ? encodeURIComponent(JSON.stringify(xhrs)) : ''}`,
				complete: (res) => {
					uni.$on('xhr-btn', (data) => {
						resolve(data)
						uni.navigateBack({delta: data.delta || 1});
						uni.$off('xhr-btn');
					})
				}
			});
		})
	}
}