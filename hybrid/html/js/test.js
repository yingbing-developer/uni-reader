alert('人民万岁万万岁');
var scrs = document.getElementsByTagName('script');
var last = scrs[scrs.length - 1];
var scr = document.createElement('script');
scr.src = 'https://js.cdn.aliyun.dcloud.net.cn/dev/uni-app/uni.webview.0.1.52.js';
scr.async = false;
last.parentNode.insertBefore(scr, last);
// document.addEventListener('UniAppJSBridgeReady', function() {
	alert('测试')
    uni.postMessage({  
        data: '123' 
    });  
// });
