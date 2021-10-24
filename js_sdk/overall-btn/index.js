let touchtime = 0
let touchtimer = null

const windowWidth = uni.getSystemInfoSync().screenWidth
const windowHeight = uni.getSystemInfoSync().screenHeight

function create ({ size, left, top, opacity, text, border, touch, func }) {
	const btn = new plus.nativeObj.View('overall-btn', {
		width: size + 'px',
		height: size + 'px',
		top: top + 'px',
		left: left + 'px'
	});
	let draws = [{
		tag:'rect',
		id:'bg',
		rectStyles: {
			color: `rgba(0,0,0,${opacity})`,
			radius: size + 'px',
			borderColor: `rgba(255,255,255,${opacity + 0.2})`,
			borderWidth: border + 'px',
		},
		position: {
			top: (border / 2) + 'px',
			left: (border / 2) + 'px',
			width: (size - border) + 'px',
			height: (size - border) + 'px',
		}
	}]
	if ( text ) {
		draws.push({
			tag:'font', id:'text', text: text,
			textStyles: {
				size: (size / 2) + 'px',
				color: 'rgba(255,255,255,0.7)',
				verticalAlign: 'middle',
				weight: 'bold',
				align: 'center'
			}
		})
	}
	if ( touch ) {
		btn.addEventListener("touchstart", (e) => {
			touchtimer = setInterval(() => {
				touchtime += 50
			}, 50)
		});
		btn.addEventListener("touchmove", (e) => {
			let top = e.pageY - (size / 2)
				left = e.pageX - (size / 2)
			if ( top < 0 ) top = 0
			if ( top > windowHeight - size ) top = windowHeight - size
			if ( left < 0 ) left = 0
			if ( left > windowWidth - size ) left = windowWidth - size
			btn.setStyle({top: top + 'px', left: left + 'px'})
		});
		btn.addEventListener("touchend", (e) => {
			clearInterval(touchtimer)
			if ( touchtime < 200 && func ) {
				func(e)
			}
			touchtime = 0
		});
	} else {
		if ( func ) {
			btn.addEventListener("click", (e) => {
				func(e)
			});
		}
	}
	btn.draw(draws)
	return {
		show: () => {
			return btn.show()
		},
		draw: (text) => {
			btn.draw([{
				tag:'font', id:'text', text: text,
				textStyles: {
					size: (size / 2) + 'px',
					color: 'rgba(255,255,255,0.7)',
					verticalAlign: 'middle',
					weight: 'bold',
					align: 'center'
				}
			}])
		}
	}
}

export default create