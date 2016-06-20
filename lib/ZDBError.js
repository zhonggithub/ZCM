/**
 * Copyright(C),2010-2011,
 * FileName:  DBError.js
 * Author: zhaozhi
 * Version: 1.0.0
 * Date: 2015/5/20  11:51
 * Description:
 */
'use strict';
var util = require('util');
var assert= require('assert');

var errorCodeTable = require('./errorCodeTable');
exports.ZDBError = function(error)
{
    if( !error ){
        var describe = arguments[1] ? arguments[1] : 'server instruction execution fail.';
        var status = arguments[0] ? arguments[0] : 507;
        var error = new Error(describe);
        error.status = status;
        return error;
    }

    assert(util.isError(error));
    if(error.code && error.errno){
        var err = new Error();
        err.name = 'DBError';
        err.status = 500;
        err.code = 5100;
        err.message = errorCodeTable.errorCode2Text( err.code);
        err.description = error.code + '( ' + error.errno + ' ): ' + error.message;
        return err;
    }
    else{
        error.name = 'DBError';
        error.description = '';
        error.status = 500;
        error.code = 5100;
        error.message = errorCodeTable.errorCode2Text(error.code);
        return error;
    }
};

