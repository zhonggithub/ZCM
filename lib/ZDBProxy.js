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
}
exports.ZDBProxy = ZDBProxy;