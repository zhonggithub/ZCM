/**
 * Copyright(C),
 * FileName:  ZMongodbOperator.js
 * Author: Zz
 * Version: 1.0.0
 * Date: 2016/6/26  21:40
 * Description:
 */
'use strict';

var mongoose = request('mongoose');

class ZMongodbOperator{
    constructor(dbConfig){
        this.dbConfig = dbConfig;
        let host = dbConfig.connection.host + ':' + dbConfig.port + '/' + dbConfig.database;
        this.db = mongoose.connect('mongodb://' + host);
        this.dbSchema = null;
        this.validFlag = {is: false, error: null};

        this.db.on('error', function(error){
            this.validFlag.is = false;
            this.validFlag.error = error;
        })

        this.db.once('open', function(){
            this.validFlag.is = true;
            this.validFlag.error = null;
        })
    }

    setSchema(schema){
        this.dbSchema = mongoose.Schema(schema);
        return this;
    }

    create(table, data, callback){
        let MyModel = this.dbSchema ? mongoose.model(table, this.dbSchema) : mongoose.model(table);
        let instance = new MyModel(data);
        instance.save(function(error){
            callback(error, 1);
        });
    }
}

let operator = new ZMongodbOperator()