import Config from '@/assets/js/config.js'
const { TIMEOUT } = Config


//request封装
function request (type = 'GET', url, options) {
	return new Promise((resolve,reject) => {
		uni.request({
			url: url,
			data: options.params || {},
			method: type || 'GET',
			header: options.headers || {},
			responseType: options.responseType || 'text',
			timeout: TIMEOUT,
			sslVerify: false,
			success: ((res) => {
				resolve(res)
			}),
			fail:((err)=>{
				plus.nativeUI.toast("网络错误！", {verticalAlign: 'bottom'});
				reject(err);
			})
		})
	})
}

export default class http {
	get(url, options = {}) {
		url += (url.indexOf('?') < 0 ? '?' : '&') + param(options.params || {}, options.headers?.Charset || 'utf-8') || ''; // 请求路径
		return request('GET', url, options)
	}
	postget(url, options = {}) {
		url += (url.indexOf('?') < 0 ? '?' : '&') + param(options.params || {}, options.headers?.Charset || 'utf-8') || ''; // 请求路径
		return request('POST', url, options)
	}
	post(url, options = {}) {
		return request('POST', url, options)
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