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

class DBClass{
    constructor(logicDB){
        this.uuid = !logicDB.uuid ? Date.now().toString() : logicDB.uuid;
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
        "host" : "192.168.0.103",
        "user" : "root",
        "password" : "123456",
        "database" : "AccountsComponentTestDB",
        "port" : 3306
    },
    "pool" : {
        "min" : 0,
        "max" : 7
    }
});
control.create({customData: "test"}, function(error, result){
    if(error)
        console.log(error);
    else
        console.log(result);
});