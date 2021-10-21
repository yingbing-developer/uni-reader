import Store from '@/store'

const { getters } = Store
export default {
	setSkinColor () {
		const skinColor = getters['app/skinColor']
		const skinMode = getters['app/skinMode']
		const tabbars = ['book', 'comic', 'music', 'user']
		tabbars.forEach((item , key) => {
			uni.setTabBarItem({
				index: key,
				iconPath: 'static/tabbar/' + item + '_' + skinMode + '.png',
				selectedIconPath: 'static/tabbar/' + item + '_' + skinMode + '-actived.png',
				success: () => {},
				fail: (err) => {
					console.log(err);
				}
			})
		})
		uni.setTabBarStyle({
			color: skinColor.color_1,
			selectedColor: skinColor.color_actived_1,
			backgroundColor: skinColor.color_bg_1,
			success: () => {},
			fail: (err) => {
				console.log(err);
			}
		})
	}
}