<script>
	import { Route } from '@/plugins/router/router.js';
	import Router from '@/plugins/router';
	import Http from '@/plugins/request'
	import Xhr from '@/plugins/xhr'
	import Dom from '@/plugins/dom'
	import Utils from '@/assets/js/util.js'
	import Config from '@/assets/js/config.js'
	export default {
		globalData: {
			$Router: Router,
			$Route: new Route(),
			$http: Http,
			$xhr: Xhr,
			$dom: Dom,
			$utils: Utils,
			$config: Config
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
	.actived-dark:active {
		background-color: #3F3F3F;
	}
	/*每个页面公共css */
	.bgColor-theme {
		background-color: #007AFF;
	}
	.bgColor-grey {
		background-color: #F5F5F5;
	}
	.bgColor-white {
		background-color: #FFFFFF;
	}
	.color-theme {
		color: #027BFF;
	}
	.color-white {
		color: #FFFFFF;
	}
	.color-title {
		color: #333333;
	}
	.color-text {
		color: #999999;
	}
	.color-text2 {
		color: #666666;
	}
	.color-red {
		color: #FF3B30!important;
	}
	.padding-gap {
		padding-left: 30rpx;
		padding-right: 30rpx;
	}
	.margin-gap {
		margin-left: 30rpx;
		margin-right: 30rpx;
	}
	.actived:active {
		background-color: #EEEEEE;
	}
	.white-actived:active {
		background-color: rgba(255,255,255,0.3);
	}
	/* #ifdef APP-VUE */
	page {background: transparent;}
	/* #endif */
</style>
