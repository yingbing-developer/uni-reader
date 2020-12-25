<template>
	<view class="real-page-item-box">
		<view class="real-page-item" :style="{'background-color': boxColor}"><slot></slot></view>
		<view class="real-page-item-bg" :style="{'background-color': bgColor}"></view>
		<view class="real-page-item-shadow"></view>
	</view>
</template>

<script>
	export default {
		props: {
			boxColor: {
				type: String,
				default: '#BFAD8A'
			},
			bgColor: {
				type: String,
				default: '#BFAD8A'
			}
		}
	}
</script>

<style scoped>
	.real-page-item-box {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		overflow: hidden;
	}
	
	.real-page-item-bg {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		transform: translateX(100%);
	}
	.real-page-item {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}
	
	.real-page-item-shadow {
		position: absolute;
		top: 0;
		bottom: 0;
		right: 0;
		background: linear-gradient(to right, rgba(0,0,0,0.05) 10%, rgba(0,0,0,0.3) 100%, rgba(0,0,0,0.05) 10%);
		filter: blur(5px);
	}
</style>
