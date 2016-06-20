/**
 * Copyright(C),
 * FileName:  ZElement.js
 * Author: Zz
 * Version: 1.0.0
 * Date: 2016/6/19  17:50
 * Description:
 */

'use strict';

class ZElement{
    constructor(table, isValidParams, isValidQueryCondition, isExpandStrValid, dbClass, logicClass){
        this.table = table;
        this.isValidQueryCondition = isValidQueryCondition;
        this.isExpandStrValid = isExpandStrValid;
        this.isValidParams = isValidParams;
        this.dbClass = dbClass;
        this.logicClass = logicClass;
    }
}
module.exports = ZElement;