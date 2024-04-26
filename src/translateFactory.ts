import YouDao from "./youdao";
import Caiyun from "./caiyun";

// 翻译类型
enum TranslateType{
    YouDao,
    CaiYun
}

// 工厂数据入参
interface ApiInfo{
    apiKey: string,
    apiSecret: string,
    translateLength: number,
    translateTxt:string,
    translateType:TranslateType
}

// 翻译工厂
async function translate(apiInfo:ApiInfo){

    switch(apiInfo.translateType){
        case TranslateType.YouDao:
            // 有道
            return new YouDao(apiInfo.apiKey,apiInfo.apiSecret,apiInfo.translateLength,apiInfo.translateTxt).translate();
        case TranslateType.CaiYun:
            // 彩云
            return new Caiyun(apiInfo.apiSecret,apiInfo.translateLength,apiInfo.translateTxt).translate();
    }
}


export { TranslateType,ApiInfo,translate }