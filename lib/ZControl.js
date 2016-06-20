/**
 * Copyright(C),
 * FileName:  ZControl.js
 * Author: Zz
 * Version: 1.0.0
 * Date: 2016/6/19  14:26
 * Description:
 */

'use strict';
var util = require('./utils');
var dbProxy = require('./ZDBProxy').dbProxy;
var ZDBError = require('./ZDBError').ZDBError;
var log = require('./log').getLogger();

class ZControl{
    constructor(element, dbConfig){
        this.dbConfig = dbConfig;
        this.dbProxy = dbProxy(this.dbConfig);
        this.element = element;
        var tmpThis = this;
        this.elementProxy = new Proxy(element, {
            get: function(target, property) {
                if (property in target) {
                    if(!target[property] && target[property] === 'table'){
                        throw new ReferenceError("table \"" + property + "\" is empty.");
                    }

                    if(!target[property]){
                        return tmpThis.packageFun;
                    }
                    return target[property];
                } else {
                    throw new ReferenceError("Property \"" + property + "\" does not exist.");
                }
            }
        });
    }

    packageFun(){
        return {'is': true, 'error': '', 'flag':0, 'isExpand': false};//{is:true, error:null};
    }

    checkKey(whereKey) {
        if (!whereKey) {
            var error = new Error();
            error.name = 'Error';
            error.status = 400;
            error.code = 9999;
            error.message = "miss param of whereKey!";
            error.description = 'the param of whereKey is need!';
            return error;
        }
        return null;
    }

    create(body, callback){
        try{
            // 参数判断
            //log.info(this.elementProxy.isValidParams);
            let judge = this.elementProxy.isValidParams(body);
            if(!judge.is){
                callback(judge.error);
                return;
            }
            var tmpThis = this;
            // 转换为DB层数据
            var dbInfo = this.element.dbClass ? new this.element.dbClass(body) : body;
            this.dbProxy(this.elementProxy.table).insert(dbInfo).asCallback(function(error, result){
                if(error){
                    log.error(error);
                    var err = new ZDBError(error);
                    callback(err);
                    return;
                }
                // 转换为逻辑层数据
                callback(null, tmpThis.element.logicClass ? new tmpThis.element.logicClass(dbInfo) : dbInfo);
            });
        }catch(error){
            log.error(error);
            var err = error;
            err.status = 500;
            callback(error);
        }
    }

    update(whereKey, whereValue, body, callback){
        try{
            var err = this.checkKey(whereKey);
            if(err){
                callback(err);
                return;
            }
            // 参数判断
            let judge = this.elementProxy.isValidParams(body);
            if(!judge.is){
                callback(judge.error);
                return;
            }
            var tmpThis = this;
            // 转换为DB层数据
            var dbInfo = this.element.dbClass ? new this.element.dbClass(body) : body;
            this.dbProxy(this.elementProxy.table).update(dbInfo).where(whereKey, whereValue).asCallback(function(error, result){
                if(error){
                    log.error(error);
                    var err = new ZDBError(error);
                    callback(err);
                    return;
                }
                // 转换为逻辑层数据
                callback(null, tmpThis.element.logicClass ? new tmpThis.element.logicClass(dbInfo) : dbInfo);
            });
        }catch(error){
            log.error(error);
            var err = error;
            err.status = 500;
            callback(error);
        }
    }

    delete(whereKey, whereValue, callback){
        try{
            var err = this.checkKey(whereKey);
            if(err){
                callback(err);
                return;
            }
            this.dbProxy(this.elementProxy.table).delete().where(whereKey, whereValue).asCallback(function(error, result){
                if(error){
                    log.error(error);
                    var err = new ZDBError(error);
                    callback(err);
                    return;
                }
                // 转换为逻辑层数据
                callback(null, result);
            });
        }catch(error){
            log.error(error);
            var err = error;
            err.status = 500;
            callback(error);
        }
    }

    retrieve(whereKey, whereValue, callback){
        try{
            var err = this.checkKey(whereKey);
            if(err){
                callback(err);
                return;
            }
            var tmpThis = this;
            this.dbProxy(this.elementProxy.table).select().where(whereKey, whereValue).asCallback(function(error, result){
                if(error){
                    log.error(error);
                    var err = new ZDBError(error);
                    callback(err);
                    return;
                }
                // 转换为逻辑层数据
                if(tmpThis.element.logicClass){
                    let retInfo = [];
                    for(let i = 0; i < result.length; ++i){
                        retInfo.push(new tmpThis.element.logicClass(result[i]));
                    }
                    callback(null, retInfo);
                }else{
                    callback(null, result);
                }
            });
        }catch(error){
            log.error(error);
            var err = error;
            err.status = 500;
            callback(error);
        }
    }

    generateQueryStr(queryCondition){
        if(!util.isJson(queryCondition))
            return "";
        let queryStr = "";
        var size = 0;
        for (var conditionItem in queryCondition)
        {
            if(conditionItem == 'offset' || conditionItem == 'limit' || conditionItem == 'expand'|| conditionItem == 'orderBy')
                continue;
            ++size;
        }

        let i = 0;
        for (let condition in queryCondition)
        {
            var isContinue = false;
            switch(condition)
            {
                case 'uuid' :case 'mobile':case 'email':case 'status':case 'directoryUUID':
                    queryStr += condition + '=' + '\'' + queryCondition[condition] + '\'';
                break;
                case 'directoryArray': case 'numberArray':case 'usernameArray':
                var arrayStr = queryCondition[condition];
                arrayStr = arrayStr.replace(/(\[)|(\])|(\")/g, "");
                var queryArray = arrayStr.split(',');

                var tmpStr = '';
                if(queryArray.length>0){
                    for (var j = 0; j < queryArray.length; ++j) {
                        tmpStr += '\'' + queryArray[j] + '\'';
                        if (j < queryArray.length - 1) {
                            tmpStr += ',';
                        }
                    }
                }else{
                    tmpStr = '\'\''
                }
                if(condition == 'directoryArray')
                    queryStr += 'directoryUUID' + ' in (' + tmpStr + ')';
                else if(condition == 'numberArray')
                    queryStr += 'number' + ' in (' + tmpStr + ')';
                else if(condition == 'usernameArray')
                    queryStr += 'username' + ' in (' + tmpStr + ')';
                break;
                case 'directoryUUIDArray':
                    var queryArray = queryCondition[condition];
                    var tmpStr = '';
                    if(queryArray.length>0){
                        for (var j = 0; j < queryArray.length; ++j) {
                            tmpStr += '\'' + queryArray[j] + '\'';
                            if (j < queryArray.length - 1) {
                                tmpStr += ',';
                            }
                        }
                    }else{
                        tmpStr = '\'\''
                    }

                    queryStr += 'directoryUUID' + ' in (' + tmpStr + ')';
                    break;
                case 'createAt':case 'modifiedAt':
                var createAt = queryCondition[condition];
                createAt = createAt.replace(/(\[)|(\])|(\")/g,"");
                createAt = createAt.split(',');
                if (createAt[0]!=' ' && createAt[0]!='') { queryStr += condition + '>=' + '\'' + createAt[0] + '\''; }
                if (createAt[0]!=' ' && createAt[0]!='' && createAt[1]!=' ' && createAt[1]!='') { queryStr += ' and '; }
                if (createAt[1]!=' ' && createAt[1]!='') { queryStr += condition + '<=' + '\'' + createAt[1] + '\''; }
                break;
                case 'username' : case 'number':case 'realName':case 'description':
                if(queryCondition[condition].indexOf('*') == -1)
                    queryStr += condition + '=' + '\'' + queryCondition[condition] + '\'';
                else
                {
                    var reg = /\*/g;
                    var str = queryCondition[condition].replace(reg, '%');
                    queryStr += condition + ' like ' + '\'' + str + '\'';
                }
                break;
                case 'expand':case 'offset': case'limit':case'orderBy':
                isContinue = true;
                break;
            }
            if(isContinue)
                continue;
            ++i;
            if(i < size)
            {
                queryStr += ' and ';
            }
        }
        ////避免已经逻辑删除的数据被检索
        //if(i != 0)
        //    queryStr += 'and status != \'' + m_logicDeleteFlag + '\'';
        //else
        //    queryStr += 'status != \'' + m_logicDeleteFlag + '\'';
        return queryStr;
    }
    list(queryContains, callback) {
        try {
            var judgeParams = util.isValidQueryParams(queryContains, this.element.isValidQueryCondition, this.element.isExpandStrValid);
            if (judgeParams.is == false) {
                callback(judgeParams.error);
                return;
            }
            var tmpThis = this;
            var queryStr = this.generateQueryStr(queryContains);
            this.dbProxy(this.elementProxy.table).select().whereRaw(queryStr).asCallback(function(error, result){
                if(error){
                    log.error(error);
                    var err = new ZDBError(error);
                    callback(err);
                    return;
                }
                // 转换为逻辑层数据
                if(tmpThis.element.logicClass){
                    let retInfo = [];
                    for(let i = 0; i < result.length; ++i){
                        retInfo.push(new tmpThis.element.logicClass(result[i]));
                    }
                    callback(null, retInfo);
                }else{
                    callback(null, result);
                }
            });
        } catch (error) {
            log.error(error);
            var err = error;
            err.status = 500;
            callback(error);
        }
    }
}
module.exports = ZControl;