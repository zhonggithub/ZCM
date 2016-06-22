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
var ZControl = require('../index').ZControl;
var ZElement = require('../index').ZElement;

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
        this.createAt = dbInfo.createAt;
        this.modifiedAt = dbInfo.modifiedAt;
    }
}

function isValidParams(info){
    var ret = {is:true, error:''};
    ret.error = util.mandatoryParams(info, [ 'customData']);
    if(ret.error)
    {
        ret.is = false;
        return ret;
    }
    return ret;
}
function isExpandStrValid(expandStr)
{
    var expandArray = expandStr.split(',');
    for(var i = 0; i < expandArray.length; ++i) {
        switch (expandArray[i]) {
            case 'tenant':case 'directory':
            break;
            default:
                return false;
        }
    }
    return true;
}

function isValidQueryCondition(queryCondition) {
    for(var item in queryCondition)
    {
        switch(item)
        {
            case 'createAt' : case 'modifiedAt' :case 'expand': case 'uuid':
            case 'offset': case 'limit':case 'status':case 'orderBy':
            break;
            default:
                return false;
        }
    }
    return true;
}

var element = new ZElement('CustomData', isValidParams, isValidQueryCondition, isExpandStrValid, DBClass, LogicClass);
var control = new ZControl(element, {
    "client" : "mysql",
    "connection" : {
        "host" : "192.168.0.103", //"192.168.6.17",//
        "user" : "root",
        "password" : "123456", //"123123",//
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

control.list({modifiedAt:'(2016-01-14 14:07:02,]', uuid:'{1111frHDRscoqkZbtXP37Q,1466472079424}'}, function(error, result){
    console.log("=========== list ===============");
    if(error)
        console.log(error);
    else{
        console.log(result.items.length);
        console.log(result);
    }
});

uuid = Date.now().toString();
var fun = control.createNext({customData: "create next test 251842"}, function(error, result){
    console.log("=========== create next ===============");
    if(error)
        console.log(error);
    else
        console.log(result);
});
fun.next();
fun.next();

var updateFun = control.updateNext('uuid', uuid, {customData: 'update next hello 0000 world'}, function(error, result){
    console.log("=========== update next ===============");
    if(error)
        console.log(error);
    else
        console.log(result);
});
updateFun.next();
updateFun.next();

var deleteFun = control.deleteNext('uuid', uuid, function(error, result){
    console.log("=========== delete next ===============");
    if(error)
        console.log(error);
    else
        console.log(result);
});
deleteFun.next();
deleteFun.next();

var ZControl1 = require('./../lib/ZControl1');
var control1 = new ZControl1(element, {
    "client" : "mysql",
    "connection" : {
        "host" : "192.168.0.103", //"192.168.6.17",//
        "user" : "root",
        "password" : "123456", //"123123",//
        "database" : "AccountsComponentTestDB",
        "port" : 3306
    },
    "pool" : {
        "min" : 0,
        "max" : 7
    }
});

uuid = Date.now().toString();
control1.create({customData: "control1 create"}, function(error, result){
    console.log("=========== control1 create ===============");
    if(error)
        console.log(error);
    else
        console.log(result);
});

control1.update('uuid', uuid, {customData: 'control1 update'}, function(error, result){
    console.log("=========== control1 update ===============");
    if(error)
        console.log(error);
    else
        console.log(result);
});

control1.list({modifiedAt:'(2016-01-14 14:07:02,]', uuid:'{1111frHDRscoqkZbtXP37Q,1466472079424}'}, function(error, result){
    console.log("=========== control1 list ===============");
    if(error)
        console.log(error);
    else
        console.log(result);
});

control1.retrieve('uuid', uuid, function(error, result){
    console.log("=========== control1 retrieve ===============");
    if(error)
        console.log(error);
    else
        console.log(result);
});

control1.delete('uuid', uuid, function(error, result){
    console.log("=========== control1 delete ===============");
    if(error)
        console.log(error);
    else
        console.log(result);
});