/**
 * Copyright(C),
 * FileName:  test.js
 * Author: Zz
 * Version: 1.0.0
 * Date: 2016/6/28  9:42
 * Description:
 */

    'use strict';
class Person{
    constructor(name){
        this.name = name;
    }
}

function fun(name){
    name = name;
}


var name = 'Zz';
var p = new Person(name);
fun(name);
name = 'hello world';
console.log(p.name);

