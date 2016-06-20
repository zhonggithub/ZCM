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
        return {is:true, error:null};
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
            var dbInfo = new this.element.dbClass(body);
            dbProxy(this.dbConfig)(this.elementProxy.table).insert(dbInfo).asCallback(function(error, result){
                if(error){
                    log.error(error);
                    var err = new ZDBError(error);
                    callback(err);
                    return;
                }
                // 转换为逻辑层数据
                callback(null, new tmpThis.element.logicClass(dbInfo));
            });
        }catch(error){
            log.error(error);
            var err = error;
            err.status = 500;
            callback(error);
        }
    }
}
module.exports = ZControl;