
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
	if ( fileName > -1 ) {
		let fileNameFormat = name.substring(0, fileName);
		return fileNameFormat;
	} else {
		return name
	}
}

/**
 * 数组查找符合条件元素并返回下标
 * @param {Array} arr 传入数组
 * @param {String} value 条件元素
 * @param {String} query 对比key值
*/
export const indexOf = function (arr, value, query) {
	let len = arr.length;
	for ( let i = 0; i < len; i++ ) {
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

/**
 * 汉字数字转阿拉伯数字
 * @param {String} strs 字符串
*/
export function cnnumtonum(strs){
	const reg = new RegExp(/[一二两三四五六七八九十零百千万亿]/g);
	const numReg = new RegExp(/[0-9]/g);
	let arr = strs.match(reg);
	if ( !arr ) {
		let num = '';
		let nums = strs.match(numReg);
		//传入的是数字
		if ( nums.length > 0 ) {
			for ( let i in nums ) {
				num += nums[i].toString();
			}
		}
		return parseFloat(num);
	}
	let chnStr = '';
	for ( let i in arr ) {
		chnStr += arr[i];
	}
	var chnNumChar = {
		零:0,一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9
	};
	var chnNameValue = {
		十:{value:10, secUnit:false},
		百:{value:100, secUnit:false},
		千:{value:1000, secUnit:false},
		万:{value:10000, secUnit:true},
		亿:{value:100000000, secUnit:true}
	};
	var rtn = 0;
	var section = 0;
	var number = 0;
	var secUnit = false;
	var str = chnStr.split('');
	for(var i = 0; i < str.length; i++){
		var num = chnNumChar[str[i]];
		if(typeof num !== 'undefined'){
			number = num;
			if(i === str.length - 1){
				section += number;
			}
		}else{
			var unit = chnNameValue[str[i]].value;
			secUnit = chnNameValue[str[i]].secUnit;
			if(secUnit){
				section = (section + number) * unit;
				rtn += section;
				section = 0;
			}else{
				section += (number * unit);
			}
			number = 0;
		}
	}
	return rtn + section;
}