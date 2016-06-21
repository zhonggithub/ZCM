/**
 * Copyright(C),
 * FileName:  ZDBProxy.js
 * Author: Zz
 * Version: 1.0.0
 * Date: 2016/6/19  20:54
 * Description:
 */
'use strict';

var knex = require('knex');
var mongoose = require('mongoose');
var redis = require('redis');
var util = require('./utils');

class ZDBConfig{
    constructor(client, connection, pool){
        this.client = client;
        this.connection = connection;
        this.pool = pool;
    }
}
exports.ZDBConfig = ZDBConfig;

exports.dbProxy = function(dbConfig){
    switch(dbConfig.client){
        case "mongodb":
            mongoose.connect('mongodb://localhost/my_database');
            return mongoose;
            break;
        case "redis":
            break;
        default:
            return require('knex')(dbConfig);
            break;
    }
};

class ZDBProxy{
    constructor(dbConfig){
        this.dbConfig = dbConfig;
        this.db = null;
        this.dbSchema = null; //数据库为mongodb时才有效
        switch(dbConfig.client){
            case "mongodb":
                let host = dbConfig.connection.host + ':' + dbConfig.port + '/' + dbConfig.database;
                this.db = mongoose.connect('mongodb://' + host);

                break;
            case "redis":
                break;
            default:
                this.db = knex(dbConfig);
                break;
        }
    }

    setSchema(dbSchema) {
        this.dbSchema = dbSchema ? dbSchema : null;
    }

    insert(table, data, callback){
        switch(this.dbConfig.client){
            case "mongodb":
                let MyModel = this.dbSchema ? mongoose.model(table, this.dbSchema) : mongoose.model(table);
                let instance = new MyModel(data);
                instance.save(function(error){
                    callback(error, 1);
                });
                break;
            case "redis":
                break;
            default:
                this.db(table).insert(data).asCallback(function(err, result){
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

    list(table, queryCondition, orderBy, offset, limit, callback){
        switch(this.dbConfig.client){
            case "mongodb":
                let MyModel = this.dbSchema ? mongoose.model(table, this.dbSchema) : mongoose.model(table);
                let query = MyModel.find(queryCondition);
                query.skip(offset);
                query.limit(limit);
                query.sort(orderBy);
                query.exec(function (err, docs) {
                    callback(err, docs);
                });
                break;
            case "redis":
                break;
            default:
                let queryStr = this.generateQueryStr(queryCondition);
                if(orderBy){
                    this.db(table).select().whereRaw(queryStr).offset(offset).limit(limit).orderBy(orderBy).asCallback(function(err, result){
                        callback(err, result);
                    });
                }else{
                    this.db(table).select().whereRaw(queryStr).offset(offset).limit(limit).asCallback(function(err, result){
                        callback(err, result);
                    });
                }
                break;
        }
    }

    retrieve(table, whereKey, whereValue, callback){
        switch(this.dbConfig.client){
            case "mongodb":
                let MyModel = this.dbSchema ? mongoose.model(table, this.dbSchema) : mongoose.model(table);
                MyModel.find({whereKey: whereValue}, callback);
                break;
            case "redis":
                break;
            default:
                this.db(table).select().where(whereKey, whereValue).asCallback(function (err, result) {
                    callback(err, result);
                });
                break;
        }
    }

    delete(table, whereKey, whereValue, callback){
        switch(this.dbConfig.client){
            case "mongodb":
                let MyModel = this.dbSchema ? mongoose.model(table, this.dbSchema) : mongoose.model(table);
                MyModel.remove({whereKey: whereValue}, callback);
                break;
            case "redis":
                break;
            default:
                this.db(table).delete().where(whereKey, whereValue).asCallback(function (err, result) {
                    callback(err, result);
                });
                break;
        }
    }

    update(table, whereKey, whereValue, data, callback){
        switch(this.dbConfig.client){
            case "mongodb":
                let MyModel = this.dbSchema ? mongoose.model(table, this.dbSchema) : mongoose.model(table);
                MyModel.update({whereKey: whereValue},{$set: data}, function(err){
                    callback(err);
                });
                break;
            case "redis":
                break;
            default:
                this.db(table).update(data).where(whereKey, whereValue).asCallback(function(error, result){
                    callback(error, result);
                });
                break;
        }
    }

    count(table, queryCondition, callback){
        switch(this.dbConfig.client){
            case "mongodb":
                let MyModel = this.dbSchema ? mongoose.model(table, this.dbSchema) : mongoose.model(table);
                let query = MyModel.find(queryCondition);
                query.skip(offset);
                query.limit(limit);
                query.sort(orderBy);
                query.exec(function (err, docs) {
                    callback(err, docs);
                });
                break;
            case "redis":
                break;
            default:
                let queryStr = this.generateQueryStr(queryCondition);
                this.db(table).count().whereRaw(queryStr).asCallback(function (err, result) {
                    callback(err, result[0]['count(*)']);
                });
                break;
        }
    }
}
exports.ZDBProxy = ZDBProxy;