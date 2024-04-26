
/**
 * 获取输入文字是否为中文
 * @param input
 */
function isChinese(input: string): boolean {
    const regex = /^[\u4e00-\u9fa5]+$/;
    return regex.test(input);
}



/**
 * 简易节流函数，带返回值
 * @param fn 待节流的函数
 * @param interval 节流间隔
 * @returns 
 */
function throttle(fn: Function, interval: number): (...args: any[]) => Promise<any> {
    // 1.记录上一次的开始时间
    let lastTime = 0
    // 2.事件触发时, 真正执行的函数
    const _throttle = function (this: any, ...args: any[]) {
        return new Promise((resolve, reject) => {
            // 2.1.获取当前事件触发时的时间
            const nowTime = new Date().getTime()
            // 2.2.使用当前触发的时间和之前的时间间隔以及上一次开始的时间, 计算出还剩余多长事件需要去触发函数
            const remainTime = interval - (nowTime - lastTime)
            if (remainTime <= 0) {
                // 2.3.真正触发函数
                fn.apply(this, args)
                    .then((res: any) => {
                        resolve(res);
                    }).catch((err: any) => {
                        reject(err);
                    }).finally(() => {
                        // 2.4.保留上次触发的时间
                        lastTime = nowTime
                    })
            }
        })
    }
    return _throttle
}


/**
 * 待翻译文本格式化
 * @param text 
 * @returns 
 */
function formatText(text: string): string {
    // 去除特殊字符，去除首尾空格，转为小写，去除驼峰，转空格
    return text
        .replaceAll(/[<>{}()_$\#@%]/g, ' ')
        .replaceAll(/([A-Z])/g, ' \$1')
        .toLowerCase()
        // 去除首尾空格
        .trim();
}

function isEmpty(text: string): boolean {
    return text == null || text == undefined || text.length == 0
}


export { isChinese, throttle, formatText, isEmpty }