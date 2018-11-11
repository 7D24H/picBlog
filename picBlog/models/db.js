// var settings = require('../settings');
// var mongodb = require('mongodb');
// var server = new mongodb.Server('localhost',27017,{auto_reconnect:true});
// module.exports = new mongodb.Db(settings.db,server,{safe:true});
// var settings = require('../settings'),
//
//     Db = require('mongodb').Db,
//
//     Connection = require('mongodb').Connection,
//
//     Server = require('mongodb').Server;
//
//
//
// module.exports = new Db(settings.db, new Server(settings.host, 27017, {}), {safe: true});

var settings = require('../settings'),
    Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;
module.exports = new Db(settings.db, new Server(settings.host, settings.port),
    {safe: true});
