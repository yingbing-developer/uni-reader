
/* *
 * 时间格式化
 * @param {String} time 时间戳or时间
 * */
export function dateFormat (time) {
	const d = new Date(time);
	return d.getFullYear() + '-' + zeroize(d.getMonth() + 1) + '-' + zeroize(d.getDate()) + ' ' + zeroize(d.getHours()) + ':' + zeroize(d.getMinutes())
}

/* *
 * 补零
 * @param {Number} val 数字
 * */
function zeroize (val) {
	return val >= 10 ? val : '0' + val;
}

/* *
 * 获取文件后缀
 * @param {String} name 带后缀的文件名称
 * */
export function suffix (name) {
  	//获取图片后缀
  	let fileName = name.lastIndexOf(".");
  	let fileNameLength = name.length;
  	let fileFormat = name.substring(fileName + 1, fileNameLength);
  	return fileFormat;
}

/* *
 * 清除文件后缀
 * @param {String} name 带后缀的文件名称
 * */
export function removeSuffix (name) {
  	//获取图片后缀
  	let fileName = name.lastIndexOf(".");
  	let fileNameFormat = name.substring(0, fileName);
  	return fileNameFormat;
}

/**
 * 数组查找符合条件元素并返回下标
 * @param {Array} arr 传入数组
 * @param {String} value 条件元素
 * @param {String} query 对比key值
*/
export const indexOf = function (arr, value, query) {
	for ( let i in arr ) {
		if ( arr[i][query] == value ) {
			return parseInt(i);
		}
	}
	return -1;
}

/**
 * 生成随机字符串
 * @param {Number} len 长度
*/
export function randomString(len) {
	len = len || 32;
	var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
	var maxPos = $chars.length;
	var pwd = '';
	for (let i = 0; i < len; i++) {
	　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
	}
	return pwd;
}

// 深度克隆
export function deepClone (obj) {  
    if(typeof obj !== "object" && typeof obj !== 'function') {
		//原始类型直接返回
        return obj;
    }
    var o = isArray(obj) ? [] : {}; 
    for(let i in obj) {  
        if(obj.hasOwnProperty(i)){ 
            o[i] = typeof obj[i] === "object" ? deepClone(obj[i]) : obj[i]; 
        } 
    } 
    return o;
}

// 判断arr是否为一个数组，返回一个bool值
function isArray (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]';  
}