import SkinDefault from "./default/skin.js"
import SkinNight from "./night/skin.js"

//常用颜色
const colors = {
	color_green: '#21C088',
	color_red: '#FF3B30',
	color_blue: '#2ca2f9'
}

Object.keys(colors).forEach(key => {
	SkinDefault[key] = colors[key],
	SkinNight[key] = colors[key]
})

export default {
	'default': SkinDefault,
	'night': SkinNight
}