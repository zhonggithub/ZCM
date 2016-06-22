/**
 * Copyright(C),
 * FileName:  ZControl1.js
 * Author: Zz
 * Version: 1.0.0
 * Date: 2016/6/21  21:05
 * Description:
 */
'use strict';
var util = require('./utils');
//var dbProxy = require('./ZDBProxy').dbProxy;
var ZDBProxy = require('./ZDBProxy').ZDBProxy;
var ZDBError = require('./ZDBError').ZDBError;
var log = require('./log').getLogger();

class ZControl1{
    constructor(element, dbConfig){
        this.dbConfig = dbConfig;
        this.dbProxy = new ZDBProxy(this.dbConfig);
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
            this.dbProxy.insert(this.elementProxy.table, dbInfo, function(error, result){
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
            this.dbProxy.update(this.elementProxy.table, whereKey, whereValue, dbInfo, function(error, result){
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
            this.dbProxy.delete(this.elementProxy.table, whereKey, whereValue, function(error, result){
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
            this.dbProxy.retrieve(this.elementProxy.table, whereKey, whereValue, function(error, result){
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

    //@ queryCondition 里面的属性字段必须是对应数据库表的字段
    list(queryContains, callback) {
        try {
            var judgeParams = util.isValidQueryParams(queryContains, this.element.isValidQueryCondition, this.element.isExpandStrValid);
            if (judgeParams.is == false) {
                callback(judgeParams.error);
                return;
            }
            let tmpThis = this;
            var offset = util.ifReturnNum(queryContains.offset, 0);
            var limit = util.ifReturnNum(queryContains.limit, 25);

            var promise = new Promise(function (resolve, reject) {
                tmpThis.dbProxy.list(tmpThis.elementProxy.table, queryContains, queryContains.orderBy, offset, limit, function (error, result) {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                });
            });
            var retInfo = {items: [], size: 0};
            promise.then(function(value){
                // 转换为逻辑层数据
                if(tmpThis.element.logicClass){
                    for(let i = 0; i < value.length; ++i){
                        retInfo.items.push(new tmpThis.element.logicClass(value[i]));
                    }
                }else{
                    retInfo.items = value;
                }
                return new Promise(function(resolve, reject){
                    tmpThis.dbProxy.count(tmpThis.elementProxy.table, queryContains, function(error, result){
                        if (error)
                            reject(error);
                        else
                            resolve(result);
                    });
                });
            }).then(function(value){
                retInfo.size = value;
                callback(null, retInfo);
            }).catch(function(error){
                if(error){
                    log.error(error);
                    var err = new ZDBError(error);
                    callback(err);
                }
            });
        } catch (error) {
            log.error(error);
            var err = error;
            err.status = 500;
            callback(error);
        }
    }

    *createNext(body, callback){
        try{
            // 参数判断
            //log.info(this.elementProxy.isValidParams);
            let judge = this.elementProxy.isValidParams(body);
            if(!judge.is){
                callback(judge.error);
                return;
            }
            yield;
            var tmpThis = this;
            // 转换为DB层数据
            var dbInfo = this.element.dbClass ? new this.element.dbClass(body) : body;
            this.dbProxy.insert(this.elementProxy.table, dbInfo, function(error, result){
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

    *updateNext(whereKey, whereValue, body, callback){
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
            yield;
            var tmpThis = this;
            // 转换为DB层数据
            var dbInfo = this.element.dbClass ? new this.element.dbClass(body) : body;
            this.dbProxy.update(this.elementProxy.table, whereKey, whereValue, dbInfo, function(error, result){
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

    *deleteNext(whereKey, whereValue, callback){
        try{
            var err = this.checkKey(whereKey);
            if(err){
                callback(err);
                return;
            }
            yield;
            this.dbProxy.delete(this.elementProxy.table, whereKey, whereValue, function(error, result){
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
}
module.exports = ZControl1;