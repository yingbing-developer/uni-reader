<script>
	import { Route } from '@/plugins/router/router.js';
	import Router from '@/plugins/router';
	import Http from '@/plugins/request'
	import Xhr from '@/plugins/xhr'
	import Dom from '@/plugins/dom'
	import Utils from '@/assets/js/util.js'
	import Config from '@/assets/js/config.js'
	import Business from '@/assets/js/business.js'
	export default {
		globalData: {
			$Router: Router,
			$Route: new Route(),
			$http: Http,
			$xhr: Xhr,
			$dom: Dom,
			$utils: Utils,
			$config: Config,
			$business: Business,
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
	@import url("@/assets/skin/index.css");
	/*每个页面公共css */
	/* #ifdef APP-VUE */
	page {background: transparent;}
	/* #endif */
</style>
