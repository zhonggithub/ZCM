/**
 * Copyright(C),
 * FileName:  test.js
 * Author: Zz
 * Version: 1.0.0
 * Date: 2016/6/19  10:15
 * Description:
 */
'use strict'


var util = require('./../lib/utils');
var dbProxy = require('./../lib/ZDBProxy');

// console.log(util.ifReturnNum(10, 5));
// console.log(util.ifReturnNum('11', 5));
// console.log(util.ifReturnStr(10));
//
//
// var db = dbProxy.dbProxy({
//     "client" : "mysql",
//     "connection" : {
//         "host" : "192.168.0.103",
//         "user" : "root",
//         "password" : "123456",
//         "database" : "AccountsComponentTestDB",
//         "port" : 3306
//     },
//     "pool" : {
//         "min" : 0,
//         "max" : 7
//     }
// });
// db('CustomData').insert({uuid: '025642', customData:'bbb'})
//     .then(function(rows){
//         console.log("success");
//     })
//     .catch(function(error){
//         console.log(error);
//     });

var ZControl = require('./../lib/ZControl');
var ZElement = require('./../lib/ZElement');

var uuid = Date.now().toString();
class DBClass{
    constructor(logicDB){
        this.uuid = !logicDB.uuid ? uuid : logicDB.uuid;
        this.customData = logicDB.customData;
    }
}
class LogicClass{
    constructor(dbInfo){
        this.uuid = dbInfo.uuid;
        this.customData = dbInfo.customData;
    }
}

var element = new ZElement('CustomData', null, null, null, DBClass, LogicClass);
var control = new ZControl(element, {
    "client" : "mysql",
    "connection" : {
        "host" : "192.168.6.17",//"192.168.0.103",
        "user" : "root",
        "password" : "123123",//"123456",
        "database" : "AccountsComponentTestDB",
        "port" : 3306
    },
    "pool" : {
        "min" : 0,
        "max" : 7
    }
});
control.create({customData: "test"}, function(error, result){
    console.log("=========== create ===============");
    if(error)
        console.log(error);
    else
        console.log(result);
});

control.update('uuid', uuid, {customData: 'hello world'}, function(error, result){
    console.log("=========== update ===============");
    if(error)
        console.log(error);
    else
        console.log(result);
});

control.retrieve('uuid', uuid, function(error, result){
    console.log("=========== retrieve ===============");
    if(error)
        console.log(error);
    else
        console.log(result);
});

control.delete('uuid', uuid, function(error, result){
    console.log("=========== delete ===============");
    if(error)
        console.log(error);
    else
        console.log(result);
});