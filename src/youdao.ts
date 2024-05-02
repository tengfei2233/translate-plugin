import https from 'https';
import crypto from 'crypto';
import FormData from 'form-data';
import { formatText, throttle } from './util';

class YouDao {

    public translate: (...args: any[]) => Promise<any>;

    constructor(public apiKey: string, public apiSecret: string, public translateLength: number, public translateTxt: string) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.translateLength = translateLength;
        this.translateTxt = translateTxt;
        // 防抖请求
        this.translate = throttle(this._translate, 1000);
    }

    private async _translate(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.apiKey) {
                reject('youdaoApiKey不能为空...');
            }
            if (!this.apiSecret) {
                reject('youdaoApiSecret不能为空...');
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
                if (res.errorCode != '0') {
                    reject(res.errorMsg);
                    return;
                }
                resolve(res.translation[0]);
            }).catch((err) => {
                reject("服务错误...");
            })
        })
    }

    private async _req(): Promise<any> {
        const salt = crypto.randomBytes(16).toString('hex');
        const curtime = Math.round(new Date().getTime() / 1000).toString();
        const sign = crypto.createHash('sha256').update(this.apiKey + this._truncate(this.translateTxt) + salt + curtime + this.apiSecret).digest('hex');
        const formData = new FormData();
        formData.append('q', this.translateTxt);
        formData.append('from', 'auto');
        formData.append('to', 'auto');
        formData.append('appKey', this.apiKey);
        formData.append('salt', salt);
        formData.append('sign', sign);
        formData.append('signType', 'v3');
        formData.append('curtime', curtime);
        formData.append('domain', 'computers');
        const options = {
            hostname: 'openapi.youdao.com',
            path: '/api',
            method: 'POST',
            port: '443',
            headers: formData.getHeaders()
        };
        return await new Promise((resolve, reject) => {
            function callback(resp: any) {
                resp.setEncoding("utf-8");
                // 不断更新数据
                resp.on("data", function (data: any) {
                    let result = JSON.parse(data);
                    resolve(result);
                });
                resp.on("end", function () { });
            }
            let req = https.request(options, callback);
            formData.pipe(req)
            req.on('error', (e) => {
                reject(e);
            });
            req.end();
        });
    }


    // 文本截取
    private _truncate(q: string): string {
        var len = q.length;
        if (len <= 20) return q;
        return q.substring(0, 10) + len + q.substring(len - 10, len);
    }
}

export default YouDao;