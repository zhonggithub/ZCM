/**
 * Copyright(C),
 * FileName:  ZMongodbOperator.js
 * Author: Zz
 * Version: 1.0.0
 * Date: 2016/6/26  21:40
 * Description:
 */
'use strict';

var mongoose = require('mongoose');

class ZMongodbOperator{
    constructor(dbConfig){
        this.dbConfig = dbConfig;
        let host = dbConfig.connection.host + ':' + dbConfig.connection.port + '/' + dbConfig.connection.database;
        mongoose.connect('mongodb://' + host);

        this.dbSchema = null;
        this.validFlag = {is: false, error: null};

        this.model = null;

        let tmpThis = this;
        this.db = mongoose.connection;
        this.db.on('error', function(error){
            tmpThis.validFlag.is = false;
            tmpThis.validFlag.error = error;
        });

        this.db.once('open', function(){
            tmpThis.validFlag.is = true;
            tmpThis.validFlag.error = null;
        });
    }

    setSchema(schema, table){
        this.dbSchema = mongoose.Schema(schema, { collection: table });
        this.model = this.dbSchema ? mongoose.model(table, this.dbSchema) : mongoose.model(table, {});
        return this;
    }

    create(data, callback){
        let instance = new this.model(data);
        instance.save(function(error){
            callback(error, 1);
        });
    }

    find(conditions, callback){
        this.model.find(conditions, function(err, result){
            if (err) return console.error(err);
            console.log(result);
        });
    }

    delete(conditions, callback){
        this.model.remove(conditions, callback);
    }

    update(conditions, data, callback){
        this.model.update(conditions, data, callback);
    }

    count(conditions, callback){
        this.model.count(conditions, callback);
    }
}

module.exports = ZMongodbOperator;