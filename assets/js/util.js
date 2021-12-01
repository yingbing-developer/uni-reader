
export default {
	/* *
	 * 补零
	 * @param {Number} val 数字
	 * */
	zeroize (val) {
		return zeroize(val);
	},
	/* *
	 * 时间格式化
	 * @param {String} time 时间戳or时间
	 * */
	dateFormat (time) {
		const d = new Date(time);
		return d.getFullYear() + '-' + zeroize(d.getMonth() + 1) + '-' + zeroize(d.getDate()) + ' ' + zeroize(d.getHours()) + ':' + zeroize(d.getMinutes())
	},
	/* *
	 * 秒数转化为分秒
	 * @param {String} value 秒数
	 * */
	minutesFormat (value) {
		let minutes = Math.floor(value / 60 % 60) >= 10 ? Math.floor(value / 60 % 60) : '0' + Math.floor(value / 60 % 60);
		let seconds = Math.floor(value % 60) >= 10 ? Math.floor(value % 60) : '0' + Math.floor(value % 60);
		return minutes + ':' + seconds;
	},
	/* *
	 * 移除url地址域名
	 * @param {String} str http地址
	 * */
	removeUrl (url) {
	  	let str = url.replace(/^http:\/\/[^/]+/, '');
		return str.substr(1);
	},
	/* *
	 * 获取文件后缀
	 * @param {String} name 带后缀的文件名称
	 * */
	suffix (name) {
	  	//获取图片后缀
	  	let fileName = name.lastIndexOf(".");
	  	let fileNameLength = name.length;
	  	let fileFormat = name.substring(fileName + 1, fileNameLength);
	  	return fileFormat;
	},
	
	/* *
	 * 清除文件后缀
	 * @param {String} name 带后缀的文件名称
	 * */
	removeSuffix (name) {
	  	//获取图片后缀
	  	let fileName = name.lastIndexOf(".");
		if ( fileName > -1 ) {
			let fileNameFormat = name.substring(0, fileName);
			return fileNameFormat;
		} else {
			return name
		}
	},
	
	/**
	 * 数组查找符合条件元素并返回下标
	 * @param {Array} arr 传入数组
	 * @param {String} value 条件元素
	 * @param {String} query 对比key值
	*/
	indexOf (arr, query, value) {
		let len = arr.length;
		for ( let i = 0; i < len; i++ ) {
			if ( arr[i][query] == value ) {
				return parseInt(i);
			}
		}
		return -1;
	},
	
	/**
	 * 正则匹配
	 * @param {String} type 匹配类型
	 * @param {String} value 匹配值
	*/
	reg (type, value) {
		const regs = {
			//身份证证则
			idCard: new RegExp(/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/),
			//手机正则
			mobile: new RegExp(/^1[3456789]\d{9}$/),
			//固定电话正则
			phone: new RegExp(/^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/),
			//金额验证
			price: new RegExp(/^[1-9]\d*(,\d{3})*(\.\d{1,2})?$|^0.\d{1,2}$/),
			//邮箱验证
			email: new RegExp(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/),
			//银行卡
			bank: new RegExp(/^([1-9]{1})(\d{15}|\d{18})$/)
		}
		return regs[type].test(value);
	},
	/**
	 * 计算2个时间差的分钟数或者秒钟数
	 * @param {datetime} time1 开始时间
	 * @param {datetime} time2 结束时间
	*/
	timeMinuse (time1, time2, type = 'minutes') {
		//判断开始时间是否大于结束日期
		let date1 = new Date(time1);
		let date2 = new Date(time2);
		if	( date1 > date2 ) {
		  console.log("开始时间不能大于结束时间！");
		  return false;
		}
		let seconds = date2.getTime() / 1000 - date1.getTime() / 1000;
		return type == 'minutes' ? (seconds / 60) : seconds;
	},
	
	/**
	 * 生成随机字符串
	 * @param {Number} len 长度
	*/
	randomString (len) {
		len = len || 32;
		var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
		var maxPos = $chars.length;
		var pwd = '';
		for (let i = 0; i < len; i++) {
		　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
		}
		return pwd;
	},
	
	/**
	 * 生成随机ID
	*/
	randomID() {
		let mydate = new Date();
		return mydate.getMinutes() + mydate.getSeconds() + mydate.getMilliseconds() + Math.round(Math.random() * 10000);
	},
	
	/**
	 * 生成随机不重复整数
	 * @param {Number} len 长度
	*/
	randomSoleNumber(len) {
		let min = 0;
		let max = len - 1;
		let arr = [];
		while ( arr.length < len ) {
			let value = Math.floor(Math.random() * (max - min + 1)) + min;
			if ( arr.indexOf(value) == -1 ) {
				arr.push( value )
			}
		}
		return arr;
	},
	/**
	 * 去除html字符串的无关内容
	 * @param {Number} html html字符串
	*/
	replaceStr (html) {
		let str = JSON.stringify(html);//将html转化为字符
		str = str.replace(/\\n/g,'');//去除\n
		str = str.replace(/\\r/g,'');//去除\r
		str = str.replace(/\\t/g,'');//去除\t
		str = str.replace(/&nbsp;/g,'');//去除&nbsp;
		str = str.replace(/\\/g,'');//去除掉无关的斜杠
		return str;
	},
	
	
	// 深度克隆
	deepClone (obj) {  
	    if(typeof obj !== "object" && typeof obj !== 'function') {
			//原始类型直接返回
	        return obj;
	    }
	    var o = isArray(obj) ? [] : {}; 
	    for(let i in obj) {  
	        if(obj.hasOwnProperty(i)){ 
	            o[i] = typeof obj[i] === "object" ? this.deepClone(obj[i]) : obj[i]; 
	        } 
	    } 
	    return o;
	}
}

// 判断arr是否为一个数组，返回一个bool值
function isArray (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]';  
}

function zeroize (val) {
	return val >= 10 ? val : '0' + val;
}
