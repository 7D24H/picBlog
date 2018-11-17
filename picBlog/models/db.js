var settings = require('../settings'),
    Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;

module.exports = new Db(settings.db, new Server(settings.host, settings.port), {safe: true});


// var mongoose = require('mongoose');
// DB_URL = 'mongodb://localhost:27017/picBlog';//数据库地址
// mongoose.connect(DB_URL);
// console.log('Connect success！');
// mongoose.connection.on('disconnected',function(){
//     console.log('Connect wrong...');
// })
//
// module.exports = mongoose;

