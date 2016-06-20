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