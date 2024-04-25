import https from 'https';
import { formatText, throttle, isChinese } from './util';

class Caiyun {

    public translate: (...args: any[]) => void;

    constructor(public apiSecret: string, public translateLength: number, public translateTxt: string) {
        this.apiSecret = apiSecret;
        this.translateLength = translateLength;
        this.translateTxt = translateTxt;
        // 防抖请求
        this.translate = throttle(this._translate, 1000);
    }

    private async _translate(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.apiSecret) {
                reject('caiyunApiSecret不能为空...');
            }
            if (!this.translateLength) {
                reject('最大待翻译文本长度不能为空...');
            }
            this.translateTxt = formatText(this.translateTxt);
            let len = this.translateTxt.replaceAll(' ', '').length;
            if (len > this.translateLength) {
                reject('翻译内容超出限制...');
            }
            this._req().then((res) => {
                console.log(res);
                resolve(res);
            }).catch((err) => {
                reject(err);
            })
        })
    }

    private async _req(): Promise<any> {
        const transType = isChinese(this.translateTxt) ? 'zh2en' : 'en2zh';
        const body = {
            "source": [this.translateTxt],
            "trans_type": transType,
            "detect": false
        }

        return new Promise((resolve, reject) => {
            const req = https.request("https://interpreter.cyapi.cn/v1/translator", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-authorization': 'token '+this.apiSecret
                },
            }, res => {
                if (res.statusCode !== 200) {
                    reject('网络错误...');
                    return;
                }
                res.on('data', data => {
                    let result = JSON.parse(data);
                    resolve(result);
                })
                res.on('end', () => { })
            });
            req.write(JSON.stringify(body));
            req.end();
        })

    }

}