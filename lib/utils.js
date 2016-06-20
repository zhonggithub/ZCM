/**
 * Copyright(C),
 * FileName:  utils.js
 * Author: sxt
 * Version: 1.0.0
 * Date: 2015/10/22  16:26
 * Description:
 */

'use strict'

var crypto = require('crypto');
var uuid = require('node-uuid');
var errorCodeTable = require('./errorCodeTable');
var mobileReg = new RegExp('^[1][2-8][0-9]{9}$');// "/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/"
var dateTimeReg = new RegExp('^\\d{1,4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01]\\s{1,2}([01]\\d|2[0-3]):([0-5]\\d|60):([0-5]\\d|60))');
var numb = new RegExp("^-?\\d+$");
var floatNum = "^(-?\\d+)(\\.\\d+)?$";//浮点数

exports.getUUIDInHref = function(href, reg, lastReg) {
    var serviceReg = new RegExp(reg);
    var serviceResult = serviceReg.exec(href);
    var subStr = href.substr(serviceResult['index'] + serviceResult[0].length);
    if(!lastReg)
        return subStr;
    serviceReg = new RegExp(lastReg);
    serviceResult = serviceReg.exec(subStr);
    return subStr.substr(0, serviceResult['index']);
};
exports.parseUrlParam=function(href){
    var query,data = {};
    href=href.split('?');
    if(href.length>1){
        query=href[1];
        if (!query) return false;
        query = query.split('&');
        query.forEach(function (ele) {
            var tmp = ele.split('=');
            data[ decodeURIComponent( tmp[0] ) ] = decodeURIComponent( tmp[1] === undefined ? '' : tmp[1] );
        });
    }
    return data;
};

exports.createUUID = function(){
    var p;
    do{
        var md5 = crypto.createHash('md5');
        p = md5.update(uuid.v1()).digest('base64');
    }while( p.indexOf('/') != -1 || p.indexOf('+') != -1);
    return p.substr(0,p.length-2);
};

var UUIDReg = new RegExp('[a-z0-9A-Z]{22}');
exports.checkUUID = function(UUID){
    if(UUIDReg.test(UUID)){
        return true;
    }
    return false;
};
//验证手机号
exports.checkMobile = function(mobile){
    if(mobileReg.test(mobile)){
        return true;
    }
    return false;
};
//验证日期时间
exports.checkDateTime = function(dateTime){
    if(dateTimeReg.test(dateTime)){
        return true;
    }
    return false;
}
exports.checkNoNullString = function(str){
    return ( str != null)&&(str != '');
};
//验证数字
exports.checkNum = function(num){
    if(numb.test(num)){
        return true;
    }
    return false;
};

exports.ifReturnTrue = function (value) {
    return value ? true : false;
};

exports.ifReturnStr = function (value, str) {
    return value ? value : (str ? str : '');
};

exports.ifReturnNum = function (value, num) {
    return value ? Number(value) : (num ? num : 0);
};
exports.ifReturnJson = function(value, json) {
    return value ? JSON.stringify(value) : (json ? json : "{}");
}


exports.isJson  = function(obj){
    var isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
    return isjson;
};

exports.isUrlHasExpand = function(queryConditions) {
    if(!queryConditions)
        return false;
    for(var item in queryConditions)
    {
        if(item ==  'expand')
            return true;
    }
    return false;
};

exports.errorReturn = function(res, status, error){
    res.writeHead(status, {'Content-Type': this.retContentType});
    var body = {
        'name' : ((error && error.name) ? error.name:'Error'),
        'code' : ((error && error.code) ? error.code:9999),
        'message' : ((error &&error.message) ? error.message : 'Unknown Error'),
        'description' : ((error &&error.description) ? error.description : ''),
        'stack' : ((error&&error.stack) ? error.stack : 'no stack')
    };
    res.write(JSON.stringify(body));
    res.end();
    var logString = 'status: '+ status +' name: '+body.name+' code: '
        +body.code+' message: '+body.message+' description: '+body.description;
    console.log(logString);
    logger.error(error?error:body);
}

exports.convert2ReturnData = function (retDataInfo, dataInfo, excludeAttribute) {
    for (var item in dataInfo) {
        var isContinue = false;
        for (var i = 0; i < excludeAttribute.length; ++i) {
            if (item == excludeAttribute[i]) {
                isContinue = true;
                break;
            }
        }
        if (isContinue)
            continue;

        retDataInfo[item] = dataInfo[item];
    }
};

/**
 *  检查必选参数
 * @param verificationInfo [JSON] 参数集
 * @param mandParams [Array] 必选参数
 * @returns error Error错误对象
 */
exports.mandatoryParams = function( verificationInfo, mandParams ){
    var error = null;
    mandParams.some( function(item){
        if( ! verificationInfo.hasOwnProperty(item)){
            error = new Error();
            error.name = 'Error';
            error.status = 400;
            error.code = errorCodeTable.missingParam2Code( item );
            error.message = errorCodeTable.errorCode2Text( error.code );
            error.description = '';
            return true;
        }
    });
    return error;
};

/**
 *  参数有效性判断
 * @param verificationInfo [JSON] 参数集
 * @param valParamsJudgeFunction [JSON] 参数有效性判断函数集，JOSN的key值对应verificationInfo里面的key值，value值为有效性判断函数
 * @returns error Error错误对象
 */
exports.validateParams = function( verificationCodesInfo, valParamsJudgeFunction ) {
    var error = null;
    for(var item in valParamsJudgeFunction){
        if( verificationCodesInfo.hasOwnProperty(item)){
            if( ! valParamsJudgeFunction[item](verificationCodesInfo[item])){
                error = new Error();
                error.name = 'SyntaxError';
                error.status = 400;
                error.code = errorCodeTable.formatParam2Code( item );
                error.message = errorCodeTable.errorCode2Text( error.code );
                error.description = 'Request '+ item +' field.';
                return error;
            }
        }
    }
    return error;
};

exports.isValidQueryParams = function(queryConditions, isValidQueryCondition, isExpandStrValid) {
    var retData = {'is': true, 'error': '', 'flag':0, 'isExpand': false};

    var error = new Error();
    error.name = 'SyntaxError';
    error.status = 400;
    error.code = 3999;
    error.message = errorCodeTable.errorCode2Text( error.code );
    if(isValidQueryCondition && !isValidQueryCondition(queryConditions))
    {
        error.description = 'query params error! the query string is : ' + querystring.stringify(queryConditions);
        retData.is = false;
        retData.error = error;
        return retData;
    }

    if(!isExpandStrValid)
        return retData;

    var isExpand = this.isUrlHasExpand(queryConditions);
    retData.isExpand = isExpand;
    if( isExpand && isExpandStrValid(queryConditions.expand) == false)
    {
        error.description = 'query params of expand is error! expand string is: ' + queryConditions.expand;
        retData.is = false;
        retData.error = error;
        return retData;
    }
    return retData;
};

exports.getExpand = function(expandStr){
    var reg = /[(:,)]/;
    var strArray = expandStr.split(reg);
    var offset, limit, key;
    key=strArray[0];
    if (strArray.length > 5 && strArray[1] === 'offset' && strArray[3] === 'limit') {
        offset = Number(strArray[2]);
        limit = Number(strArray[4]);
    }else if(strArray.length > 5 && strArray[3] === 'offset' && strArray[1] === 'limit') {
        offset = Number(strArray[4]);
        limit = Number(strArray[2]);

    }else {
        key= expandStr;
    }
    return [key, offset, limit];
}