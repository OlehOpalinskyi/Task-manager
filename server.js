/**
 * Created by Oleh on 01.06.2017.
 */
var app = require('./app');
var express = require('express');
var http = require('http');

var server = http.createServer(app);
server.listen(8000,function () {
    console.log('start listening port 8000...');
});

