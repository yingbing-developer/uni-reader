<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			plus.screen.lockOrientation('portrait-primary');
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	.actived:active {
		background-color: #EEEEEE;
	}
</style>
