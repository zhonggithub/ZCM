/**
 * Copyright(C),
 * FileName:  log.js
 * Author: sxt
 * Version: 1.0.0
 * Date: 2015/10/13  15:30
 * Description:
 */

var log4js = require('log4js');
var fs = require("fs");
var path = require("path");
var logConfig = require('../config/log4js');

// 加载配置文件
var objConfig = {
    "appenders": [
        {"type": "console", "category": "console"},
        {"type": "file", "filename": path.join(path.dirname(__dirname), logConfig.name), "category": logConfig.name}
    ],
    "replaceConsole": true,
    "levels": logConfig.levels
};

// 检查配置文件所需的目录是否存在，不存在时创建
checkAndCreateDir(path.dirname(__dirname));

// 目录创建完毕，才加载配置，不然会出异常
log4js.configure(objConfig);

exports.getLogger = function getLogger() {
    var log = log4js.getLogger(logConfig.name);
    return log;
};

// 判断日志目录是否存在，不存在时创建日志目录
function checkAndCreateDir(dir){
    if(fs.existsSync(dir)){
        return true;
    }else{
        if(checkAndCreateDir(path.dirname(dir))){
            fs.mkdirSync(dir);
            return true;
        }
    }
}