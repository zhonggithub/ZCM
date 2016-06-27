/**
 * Copyright(C),
 * FileName:  mongodbOperator_test.js
 * Author: Zz
 * Version: 1.0.0
 * Date: 2016/6/27  23:21
 * Description:
 */
'use strict';
var ZMongodbOperator = require('./../lib/ZMongodbOperator');

let operator = new ZMongodbOperator({
    "client" : "mongodb",
    "connection" : {
        "host" : "localhost",
        "user" : "root",
        "password" : "123456",
        "database" : "AccountsComponentTestDB",
        "port" : 27017
    },
    "pool" : {
        "min" : 0,
        "max" : 7
    }
});
operator.setSchema({name:String}, 'test');
operator.count({}, function(error, result){
    console.log("============= count ================");
    if (error) {
        console.log(error);
    } else {
        console.log(result);
    }
});

operator.create({name: "Zz : " + Date.now()}, function(error, result){
    console.log("============= create ================");
    if(error){
        console.log(error);
    } else {
        console.log(result);
    }
});

operator.find(function(error, result){
    console.log("============= find ================");
    if(error){
        console.log(error);
    }else{
        console.log(result);
    }
});

operator.update({_id: '577138bd29ce5b6c0cd04129'}, {name: "Zz update hello world"}, function(error, result){
    console.log("============= update ================");
    if(error){
        console.log(error);
    }else{
        console.log(result);
    }
});

operator.delete(function(error, result){
    console.log("============= delete ================");
    if(error){
        console.log(error);
    }else{
        console.log(result.result);
    }
});