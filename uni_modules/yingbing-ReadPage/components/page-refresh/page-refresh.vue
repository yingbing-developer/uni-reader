<template>
	<div class="page-refresh" :style="{'color': color, padding: padding}">
		<div class="refresh-icon" :style="{
			'border-top': '5rpx solid' + color,
			'border-left': '5rpx solid' + color,
			'border-bottom': '5rpx solid' + color,
			'border-right': '5rpx solid transparent'
		}"></div>
		<slot>加载内容</slot>
	</div>
</template>

<script>
	export default {
		props: {
			color: {
				type: String,
				default: '#333'
			},
			padding: {
				type: String,
				default: '0 0 0 0'
			}
		}
	}
</script>

<style scoped>
	@keyframes animationRotate{
	    0% {
	      transform: rotateZ(0);
	    }
	    100% {
	      transform: rotateZ(360deg);
	    }
	}
	.page-refresh {
		width: 100%;
		height: 100rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.refresh-icon {
		width: 30rpx;
		height: 30rpx;
		border-radius: 30rpx;
		margin-right: 10rpx;
		animation: animationRotate 1s linear infinite;
	}
</style>
