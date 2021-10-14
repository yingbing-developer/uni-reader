import Config from '@/assets/js/config.js'
const { TIMEOUT } = Config

//xhr封装
function xhrRequest (type = 'GET', url, options) {
	let xhrHttp = new plus.net.XMLHttpRequest();
	return new Promise((resolve,reject) => {
		xhrHttp.onreadystatechange = function () {
			console.log(xhrHttp.readyState);
			if ( xhrHttp.readyState == 4 ) {
				if ( xhrHttp.status == 200 ) {
					resolve({code: xhrHttp.status, data: xhrHttp.responseText})
				} else {
					plus.nativeUI.toast("网络错误！", {verticalAlign: 'bottom'});
					reject({code: xhrHttp.status, data: ''});
				}
			}
		}
		xhrHttp.open(type, url);
		if ( options.mimeType ) {
			xhrHttp.overrideMimeType(options.mimeType);
		}
		xhrHttp.responseType = options.responseType || 'json';
		for ( let i in options.headers || {} ) {
			xhrHttp.setRequestHeader(i, options.headers[i]);
		}
		xhrHttp.timeout = TIMEOUT;
		xhrHttp.send(options.params || {});
	})
}

export default class Xhr {
	get(url, options = {}) {
		url += (url.indexOf('?') < 0 ? '?' : '&') + param(options.params || {}, options.headers?.Charset || 'utf-8') || ''; // 请求路径
		return xhrRequest('GET', url, options)
	}
	postget(url, options = {}) {
		url += (url.indexOf('?') < 0 ? '?' : '&') + param(options.params || {}, options.headers?.Charset || 'utf-8') || ''; // 请求路径
		return xhrRequest('POST', url, options)
	}
	post(url, options = {}) {
		return xhrRequest('POST', url, options)
	}
}

function param(data, charset) {
    let url = ''
    for (var k in data) {
        let value = data[k] !== undefined ? data[k] : ''
        url += charset == 'utf-8' ? `&${k}=${encodeURIComponent(value)}` : `&${k}=${value}`
    }
    return url ? url.substring(1) : ''
}