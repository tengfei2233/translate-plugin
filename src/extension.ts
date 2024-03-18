import * as vscode from 'vscode';
import https from 'https';
import crypto from 'crypto'
import FormData from 'form-data';

// 事件入口
export function activate(context: vscode.ExtensionContext) {

	console.log('translate-plugin 插件已激活!');
	let disposable = vscode.commands.registerCommand('extension.translate', async () => {
		// 获取选中的文本
		const editor = vscode.window.activeTextEditor;
		const selection = editor?.selection;
		if (!editor || !selection) {
			return;
		}
		const text = editor.document.getText(selection);
		// 调取翻译api进行翻译
		const translateRes = await translate(text);
		console.log("结果：", translateRes);
		vscode.window.showInformationMessage(JSON.stringify(translateRes));
	});
	context.subscriptions.push(disposable);
}
// 调用有道api进行翻译
async function translate(text: string) {
	const salt = crypto.randomBytes(16).toString('hex');
	const curtime = Math.round(new Date().getTime() / 1000).toString();
	const appKey = "3480eb02684a27da";
	const appSecret = "rjQpZlpBTXu0tyAl0jQT6elnKlZToMvb";
	const sign = crypto.createHash('sha256').update(appKey + truncate(text) + salt + curtime + appSecret).digest('hex');
	const formData = new FormData();
	formData.append('q', text);
	formData.append('from', 'auto');
	formData.append('to', 'auto');
	formData.append('appKey', appKey);
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

// 待翻译文本截取
function truncate(q: string) {
	var len = q.length;
	if (len <= 20) return q;
	return q.substring(0, 10) + len + q.substring(len - 10, len);
}

export function deactivate() { }