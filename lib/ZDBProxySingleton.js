/**
 * Copyright(C),
 * FileName:  ZSingleton.js
 * Author: Zz
 * Version: 1.0.0
 * Date: 2016/7/7  9:49
 * Description:
 */
'use strict';

var knex = require('knex');
var mongoose = require('mongoose');
var redis = require('redis');
var util = require('./utils');
var ZMongodbOperator = require('./ZMongodbOperator');

module.exports = (function () {
    class ZDBProxyImp{
        constructor(){
            this.dbConfig = null;
            this.db = null;
            this.table = null;
        }

        setSchema(table, dbSchema) {
            this.table = table;
            if(!dbSchema)
                return this;
            this.db.setSchema(dbSchema, table);
            return this;
        }

        insert(data, callback){
            switch(this.dbConfig.client){
                case "mongodb":
                    this.db.create(data, callback);
                    break;
                case "redis":
                    break;
                default:
                    this.db(this.table).insert(data).asCallback(function(err, result){
                        callback(err, result);
                    });
                    break;
            }
        }

        generateQueryStr(queryCondition){
            if(!util.isJson(queryCondition))
                return "";
            let queryStr = "";
            let size = 0;
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
                    case 'expand':case 'offset': case'limit':case'orderBy':
                    isContinue = true;
                    break;
                    default:{
                        var beginStr = queryCondition[condition][0];
                        var endStr = queryCondition[condition][queryCondition[condition].length - 1];
                        if(beginStr === "[" || beginStr === "(" || beginStr === "{"){
                            var array = queryCondition[condition];
                            array = array.replace(/(\[)|(\])|(\()|(\))|(\{)|(\})|(\")/g,"");
                            array = array.split(',');
                            if(beginStr === '[' && endStr === ']'){ //数组字符串
                                if (array[0]!=' ' && array[0]!='') { queryStr += condition + '>=' + '\'' + array[0] + '\''; }
                                if (array[0]!=' ' && array[0]!='' && array[1]!=' ' && array[1]!='') { queryStr += ' and '; }
                                if (array[1]!=' ' && array[1]!='') { queryStr += condition + '<=' + '\'' + array[1] + '\''; }
                            }else if(beginStr === '(' && endStr === ']'){
                                if (array[0]!=' ' && array[0]!='') { queryStr += condition + '>' + '\'' + array[0] + '\''; }
                                if (array[0]!=' ' && array[0]!='' && array[1]!=' ' && array[1]!='') { queryStr += ' and '; }
                                if (array[1]!=' ' && array[1]!='') { queryStr += condition + '<=' + '\'' + array[1] + '\''; }
                            }else if(beginStr === '[' && endStr === ')'){
                                if (array[0]!=' ' && array[0]!='') { queryStr += condition + '>=' + '\'' + array[0] + '\''; }
                                if (array[0]!=' ' && array[0]!='' && array[1]!=' ' && array[1]!='') { queryStr += ' and '; }
                                if (array[1]!=' ' && array[1]!='') { queryStr += condition + '<' + '\'' + array[1] + '\''; }
                            }else if(beginStr === '(' && endStr === ')'){
                                if (array[0]!=' ' && array[0]!='') { queryStr += condition + '>' + '\'' + array[0] + '\''; }
                                if (array[0]!=' ' && array[0]!='' && array[1]!=' ' && array[1]!='') { queryStr += ' and '; }
                                if (array[1]!=' ' && array[1]!='') { queryStr += condition + '<' + '\'' + array[1] + '\''; }
                            }else if(beginStr === '{' && endStr === '}'){
                                var tmpStr = '';
                                if(array.length > 0){
                                    for (var j = 0; j < array.length; ++j) {
                                        tmpStr += '\'' + array[j] + '\'';
                                        if (j < array.length - 1) {
                                            tmpStr += ',';
                                        }
                                    }
                                }else{
                                    tmpStr = '\'\''
                                }
                                queryStr += condition + ' in (' + tmpStr + ')';
                            }
                        }else{
                            queryStr += condition + ' = \'' + tmpStr + '\'';
                        }
                    }break;
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

        list(queryCondition, orderBy, offset, limit, callback){
            switch(this.dbConfig.client){
                case "mongodb":
                    this.db.find(queryCondition, callback);
                    break;
                case "redis":
                    break;
                default:
                    let queryStr = this.generateQueryStr(queryCondition);
                    if(orderBy){
                        this.db(this.table).select().whereRaw(queryStr).offset(offset).limit(limit).orderBy(orderBy).asCallback(function(err, result){
                            callback(err, result);
                        });
                    }else{
                        this.db(this.table).select().whereRaw(queryStr).offset(offset).limit(limit).asCallback(function(err, result){
                            callback(err, result);
                        });
                    }
                    break;
            }
        }

        retrieve(whereKey, whereValue, callback){
            switch(this.dbConfig.client){
                case "mongodb":
                    this.db.find({whereKey: whereValue}, callback);
                    break;
                case "redis":
                    break;
                default:
                    this.db(this.table).select().where(whereKey, whereValue).asCallback(function (err, result) {
                        callback(err, result);
                    });
                    break;
            }
        }

        delete(whereKey, whereValue, callback){
            switch(this.dbConfig.client){
                case "mongodb":
                    this.db.delete({whereKey: whereValue}, callback);
                    break;
                case "redis":
                    break;
                default:
                    this.db(this.table).delete().where(whereKey, whereValue).asCallback(function (err, result) {
                        callback(err, result);
                    });
                    break;
            }
        }

        update(whereKey, whereValue, data, callback){
            switch(this.dbConfig.client){
                case "mongodb":
                    this.db.update({whereKey : whereValue}, data, callback);
                    break;
                case "redis":
                    break;
                default:
                    this.db(this.table).update(data).where(whereKey, whereValue).asCallback(function(error, result){
                        callback(error, result);
                    });
                    break;
            }
        }

        count(queryCondition, callback){
            switch(this.dbConfig.client){
                case "mongodb":
                    this.db.count(queryCondition, callback);
                    break;
                case "redis":
                    break;
                default:
                    let queryStr = this.generateQueryStr(queryCondition);
                    this.db(this.table).count().whereRaw(queryStr).asCallback(function (err, result) {
                        callback(err, result[0]['count(*)']);
                    });
                    break;
            }
        }

        setDBConfig(dbConfig){
            this.dbConfig = dbConfig;
            switch(dbConfig.client){
                case "mongodb":
                    this.db = new ZMongodbOperator(dbConfig);
                    break;
                case "redis":
                    break;
                default:
                    this.db = knex(dbConfig);
                    break;
            }
        }
    }

    var instantiated;
    function init() {
        return new ZDBProxyImp();
    }

    return {
        getInstance: function () {
            if (!instantiated) {
                instantiated = init();
            }
            return instantiated;
        }
    };
})();
