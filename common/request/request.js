//request封装
function request (type = 'GET', url, data, options = {header: {}}) {
	var params = data;
	url += (url.indexOf('?') < 0 ? '?' : '&') + param(params) || ''; // 请求路径
	return new Promise((resolve,reject) => {
		uni.request({
			url: url,
			data: data,
			method: type || 'GET',
			header: options.header,
			success: ((res) => {
				resolve(res)
			}),
			fail:((err)=>{
				uni.showToast({
					icon: 'none',
					title: '网络错误'
				})
				reject(err);
			})
		})
	})
}

export default class http {
	get(url, data, options) {
		return request('GET', url, data, options)
	}
	
	post(url, data, options) {
		return request('POST', url, data, options)
	}
}

function param(data) {
    let url = ''
    for (var k in data) {
        let value = data[k] !== undefined ? data[k] : ''
        url += `&${k}=${encodeURIComponent(value)}`
    }
    return url ? url.substring(1) : ''
}