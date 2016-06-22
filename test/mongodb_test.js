/**
 * Copyright(C),
 * FileName:  mongodb_test.js
 * Author: Zz
 * Version: 1.0.0
 * Date: 2016/6/22  15:30
 * Description:
 */
'use strict'
var util = require('./../lib/utils');
var ZControl = require('./../lib/ZControl1');
var ZElement = require('../index').ZElement;

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

var control2 = new ZControl(element, {
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
var uuid = Date.now().toString();
control2.create({customData: "control 2 create"}, function(error, result){
    console.log("=========== control 2 create ===============");
    if(error)
        console.log(error);
    else
        console.log(result);
});