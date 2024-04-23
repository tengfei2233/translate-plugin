
/**
 * 获取输入文字是否为中文
 * @param input
 */
function isChinese(input: string): boolean {
    const regex = /^[\u4e00-\u9fa5]+$/;
    return regex.test(input);
}



/**
 * 简易节流函数
 * @param fn 待节流的函数
 * @param interval 节流间隔
 * @returns 
 */
function throttle(fn: Function, interval: number): (...args: any[]) => void {
    // 1.记录上一次的开始时间
    let lastTime = 0

    // 2.事件触发时, 真正执行的函数
    const _throttle = function (...args: any[]) {
        // let args = arguments;
        // 2.1.获取当前事件触发时的时间
        const nowTime = new Date().getTime()

        // 2.2.使用当前触发的时间和之前的时间间隔以及上一次开始的时间, 计算出还剩余多长事件需要去触发函数
        const remainTime = interval - (nowTime - lastTime)
        if (remainTime <= 0) {
            // 2.3.真正触发函数
            fn.apply(null, args);
            // 2.4.保留上次触发的时间
            lastTime = nowTime
        }
    }
    return _throttle
}


/**
 * 待翻译文本格式化
 * @param text 
 * @returns 
 */
function formatText(text: string): string {
    return text
        .replaceAll(/[<>\/\\]/g, ' ')
        .replaceAll(/([A-Z])/g, ' $1')
        .replaceAll(/[_\-.]+/g, ' ')
        .toLowerCase()
        // 去除首尾空格
        .trim();
}



export { isChinese, throttle, formatText }