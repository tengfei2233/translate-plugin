import * as vscode from 'vscode';
import https from 'https';
import crypto from 'crypto';
import FormData from 'form-data';

let translateLength = "";
let apiKey = ""
let apiSecret = ""

// 事件入口
export function activate(context: vscode.ExtensionContext) {
	// 获取非敏感配置信息
	const config = vscode.workspace.getConfiguration('translate-plugin');
	translateLength = config.get('translateLength') as string;
	apiKey = config.get('apiKey') as string;
	apiSecret = config.get('apiSecret') as string;
	// 节流调用
	const invokTranslate = throttle(throttleInvoke, 1000);
	let disposable = vscode.commands.registerCommand('extension.translate', async () => {
		// 节流操作

		// 判断apiKey是否为空
		if (apiKey == null || apiKey == "") {
			vscode.window.showErrorMessage("apiKey不能为空...|请输入apiKey...");
			return;
		}
		if (apiSecret == null || apiSecret == "") {
			vscode.window.showErrorMessage("apiSecret不能为空...|请输入apiSecret...");
			return;
		}
		// 获取选中的文本
		const editor = vscode.window.activeTextEditor;
		const selection = editor?.selection;
		if (!editor || !selection) {
			return;
		}
		const text = editor.document.getText(selection);
		// 输入文本处理
		let newText = text.replace(/[<>\/\\]/g, ' ');
		if (newText.split(" ").length > Number.parseInt(translateLength)) {
			vscode.window.showErrorMessage("翻译文本过长...");
			return;
		}
		invokTranslate(newText);
		// 调取翻译api进行翻译
		let translateRes = null;
		try {
			translateRes = await translate(newText, apiKey, apiSecret);
		} catch (err) {
			vscode.window.showErrorMessage("apiKey错误...|服务错误...");
		}
		showResult(translateRes);
	});
	// 设置更改，触发事件
	let settingChangeListener = vscode.workspace.onDidChangeConfiguration(event => {
		// 检查特定配置是否被修改
		if (event.affectsConfiguration('translate-plugin.apiKey')) {
			apiKey = vscode.workspace.getConfiguration('translate-plugin').get('apiKey') as string;
		}
		if (event.affectsConfiguration('translate-plugin.apiSecret')) {
			apiKey = vscode.workspace.getConfiguration('translate-plugin').get('apiSecret') as string;
		}
		if (event.affectsConfiguration('translate-plugin.translateLength')) {
			translateLength = vscode.workspace.getConfiguration('translate-plugin').get('translateLength') as string;
		}
	});
	context.subscriptions.push(disposable, settingChangeListener);
}

async function throttleInvoke(newText: string) {
	console.log("获得的text:", newText);
	// 调取翻译api进行翻译
	let translateRes = null;
	try {
		translateRes = await translate(newText, apiKey, apiSecret);
	} catch (err) {
		vscode.window.showErrorMessage("apiKey错误...|服务错误...");
	}
	showResult(translateRes);
}

// 封装成节流函数
function throttle(fn: Function, interval: number) {
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
// 调用有道api进行翻译
async function translate(text: string, apiKey: string, apiSecret: string) {
	// 获取appKey，appSecret等
	const salt = crypto.randomBytes(16).toString('hex');
	const curtime = Math.round(new Date().getTime() / 1000).toString();
	const sign = crypto.createHash('sha256').update(apiKey + truncate(text) + salt + curtime + apiSecret).digest('hex');
	const formData = new FormData();
	formData.append('q', text);
	formData.append('from', 'auto');
	formData.append('to', 'auto');
	formData.append('appKey', apiKey);
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

// 展示翻译结果
function showResult(res: any) {
	console.log("res:",res);
	if (res.errorCode != '0') {
		vscode.window.showErrorMessage("apiKey错误...|服务错误...");
		return;
	}
	vscode.window.showInformationMessage("翻译结果：" + res.translation[0])
}
// 待翻译文本截取
function truncate(q: any) {
	var len = q.length;
	if (len <= 20) return q;
	return q.substring(0, 10) + len + q.substring(len - 10, len);
}


export function deactivate() { }