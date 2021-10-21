/**
 * @fileOverview
 * 高斯模糊
 * @author iNahoo
 * @since 2017/5/8.
 */
"use strict";

const gaussBlur = function (imgData, radius) {

    radius *= 3;    //不知为什么,我的模糊半径是 css中 filter:bulr 值的三倍时效果才一致。

    //Copy图片内容
    let pixes = new Uint8ClampedArray(imgData.data);
    const width = imgData.width;
    const height = imgData.height;
    let gaussMatrix = [],
        gaussSum,
        x, y,
        r, g, b, a,
        i, j, k,
        w;

    radius = Math.floor(radius);
    const sigma = radius / 3;

    a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
    b = -1 / (2 * sigma * sigma);

    //生成高斯矩阵
    for (i = -radius; i <= radius; i++) {
        gaussMatrix.push(a * Math.exp(b * i * i));
    }

    //x 方向一维高斯运算
    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
            r = g = b = a = gaussSum = 0;
            for (j = -radius; j <= radius; j++) {
                k = x + j;
                if (k >= 0 && k < width) {
                    i = (y * width + k) * 4;
                    w = gaussMatrix[j + radius];

                    r += pixes[i] * w;
                    g += pixes[i + 1] * w;
                    b += pixes[i + 2] * w;
                    a += pixes[i + 3] * w;

                    gaussSum += w;
                }
            }

            i = (y * width + x) * 4;
            //计算加权均值
            imgData.data.set([r, g, b, a].map(v=>v / gaussSum), i);
        }
    }

    pixes.set(imgData.data);

    //y 方向一维高斯运算
    for (x = 0; x < width; x++) {
        for (y = 0; y < height; y++) {
            r = g = b = a = gaussSum = 0;
            for (j = -radius; j <= radius; j++) {
                k = y + j;

                if (k >= 0 && k < height) {
                    i = (k * width + x) * 4;
                    w = gaussMatrix[j + radius];

                    r += pixes[i] * w;
                    g += pixes[i + 1] * w;
                    b += pixes[i + 2] * w;
                    a += pixes[i + 3] * w;

                    gaussSum += w;
                }
            }
            i = (y * width + x) * 4;
            imgData.data.set([r, g, b, a].map(v=>v / gaussSum), i);
        }
    }

    return imgData;
};

/**
 * @public
 * 暴露的异步模糊方法
 * ---------------------
 * @param URL       图片地址,需要跨域支持
 * @param r         模糊半径 {Int}
 * @param shrink    缩小比率 {Number}
 * @return {Promise}
 */
export const blur = (URL, r, shrink = 1)=> {
    return new Promise((resolve, reject)=> {

        const IMG = new Image();
        IMG.crossOrigin = '*'; //需要图片跨域支持

        IMG.onload = function () {
            const Canvas = document.createElement('CANVAS'); //大量使用可考虑只创建一次

            let w = IMG.width, h = IMG.height;

            //缩小比例不为1时 , 重新计算宽高比
            if (shrink !== 1) {
                w = Math.ceil(w / shrink);
                h = Math.ceil(h / shrink);
                r = Math.ceil(r / shrink);
            }

            //因为懒, 就全Try了, 实际上只 Try跨域错误 即可
            try {
                //设置Canvas宽高,获取上下文
                Canvas.width = w;
                Canvas.height = h;
                let ctx = Canvas.getContext('2d');

                ctx.drawImage(IMG, 0, 0, w, h);

                //提取图片信息
                let d = ctx.getImageData(0, 0, w, h);

                //进行高斯模糊
                let gd = gaussBlur(d, r, 0);

                //绘制模糊图像
                ctx.putImageData(gd, 0, 0);

                resolve(Canvas.toDataURL());
            } catch (e) {
                reject(e);
            }
        };
        IMG.src = URL;
    })
};

/**
 * @public
 * 暴露的异步模糊方法
 * ---------------------
 * @param URL       图片地址,需要跨域支持
 * @param r         模糊半径 {Int}
 * @param w         输出宽度 {Number}
 * @param h         输出高度 {Number}
 * @return {Promise}
 */
export const blurWH = (URL, r, w, h)=> {
    return new Promise((resolve, reject)=> {

        const IMG = new Image();
        IMG.crossOrigin = '*'; //需要图片跨域支持

        IMG.onload = function () {
            const Canvas = document.createElement('CANVAS'); //大量使用可考虑只创建一次

            //锁定输出宽高之后, 就不需要Care 原图有多宽多高了
            //let w = IMG.width, h = IMG.height;

            //因为懒, 就全Try了, 实际上只 Try跨域错误 即可
            try {
                //设置Canvas宽高,获取上下文
                Canvas.width = w;
                Canvas.height = h;
                let ctx = Canvas.getContext('2d');

                ctx.drawImage(IMG, 0, 0, w, h);

                //提取图片信息
                let d = ctx.getImageData(0, 0, w, h);

                //进行高斯模糊
                let gd = gaussBlur(d, r, 0);

                //绘制模糊图像
                ctx.putImageData(gd, 0, 0);

                resolve(Canvas.toDataURL());
            } catch (e) {
                reject(e);
            }
        };
        IMG.src = URL;
    })
};