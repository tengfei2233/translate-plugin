import * as vscode from 'vscode';
import { translate, TranslateType } from './translateFactory';
// 翻译最大长度
let translateLength = "";
// 有道配置信息
let youdaoApiKey = "";
let youdaoApiSecret = "";
// 彩云配置信息
let caiyunApiSecret = "";
// 翻译类型
let translateType = "有道云翻译";

// 事件入口
export function activate(context: vscode.ExtensionContext) {
	// 获取配置信息
	const config = vscode.workspace.getConfiguration('translate-plugin');
	translateLength = config.get('translateLength') as string;
	youdaoApiKey = config.get('youdaoApiKey') as string;
	youdaoApiSecret = config.get('youdaoApiSecret') as string;
	caiyunApiSecret = config.get('caiYunApiSecret') as string;
	translateType = config.get('translateType') as string;
	// 节流调用
	let disposable = vscode.commands.registerCommand('extension.translate', async () => {
		// 获取选中的文本
		const editor = vscode.window.activeTextEditor;
		const selection = editor?.selection;
		if (!editor || !selection) {
			return;
		}
		const text = editor.document.getText(selection);
		// 节流操作
		const apiInfo = {
			apiKey: youdaoApiKey,
			apiSecret: youdaoApiSecret,
			translateLength: Number.parseInt(translateLength),
			translateTxt: text,
			translateType: translateType == "有道云翻译" ? TranslateType.YouDao : TranslateType.CaiYun
		}
		translate(apiInfo).then(res=>{
			vscode.window.showInformationMessage("翻译结果：" + res)
		}).catch((err)=>{
			vscode.window.showErrorMessage(err);
		})
	});
	// 设置更改，触发事件
	let settingChangeListener = vscode.workspace.onDidChangeConfiguration(event => {
		// 检查特定配置是否被修改
		if (event.affectsConfiguration('translate-plugin.youdaoApiKey')) {
			youdaoApiKey = vscode.workspace.getConfiguration('translate-plugin').get('youdaoApiKey') as string;
		}
		if (event.affectsConfiguration('translate-plugin.youdaoApiSecret')) {
			youdaoApiSecret = vscode.workspace.getConfiguration('translate-plugin').get('youdaoApiSecret') as string;
		}
		if (event.affectsConfiguration('translate-plugin.translateLength')) {
			translateLength = vscode.workspace.getConfiguration('translate-plugin').get('translateLength') as string;
		}
		if (event.affectsConfiguration('translate-plugin.caiyunApiSecret')) {
			caiyunApiSecret = vscode.workspace.getConfiguration('translate-plugin').get('caiyunApiSecret') as string;
		}
		if (event.affectsConfiguration('translate-plugin.translateType')) {
			translateType = vscode.workspace.getConfiguration('translate-plugin').get('translateType') as string;
		}
	});
	context.subscriptions.push(disposable, settingChangeListener);
}


export function deactivate() { }