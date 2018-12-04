var mongodb = require('./db');

function Tag(tag) {
    this.name = tag.name;
};

module.exports = Tag;

Tag.prototype.save = function save(callback) {
    // 存入 Mongodb 的文檔
    var tag = {
        name: this.name,
    };

    // var mongodb = require('./db');
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        // 讀取 tags 集合
        db.collection('tags', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            // 爲 name 屬性添加索引
            collection.ensureIndex('name', {unique: true});
            // 寫入 tag 文檔
            collection.insert(tag, {safe: true}, function(err, tag) {
                mongodb.close();
                console.log("INSERT OK");
                callback(err, tag);
            });
        });
    });
};

Tag.get = function get(name, callback) {
    // var mongodb = require('./db');

    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        // 讀取 tags 集合
        db.collection('tags', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            var query={};
            if(name!==""){
                query.name=name; // 构造一个{"name":"台湾”}的对象
                console.log("NOT NULL QUERY "+query.toArray());
            }

            // 查找全部tag
            collection.find(query).toArray(function(err,docs){
                mongodb.close();
                if(err){
                    console.log("DATABASE ERROR");
                    callback(err,null);
                }

                //封装tags对象为Tag对象
                var tags=[];
                docs.forEach(function(doc,index){
                    var tag=new Tag(doc);//doc就是一个对象！！直接封装！！！
                    tags.push(tag);
                });

                console.log("DATABASE TAG,TAGS[] "+tags);

                callback(null,tags);

            });

        });
    });
};


// var mongoose = require('./db'),
//     Schema = mongoose.Schema;
//
// var UserSchema = new Schema({
//     username : String,
//     password : String
// })
//
// module.exports = mongoose.model('User',UserSchema);