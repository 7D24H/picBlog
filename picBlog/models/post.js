var mongodb = require('./db');

function Post(username, pictureName, song, singer ,description, tagArr) {
    this.username=username;
    this.pictureName=pictureName;
    this.song=song;
    this.singer=singer;
    this.description=description;
    this.tagArr=tagArr;
};
module.exports = Post;

Post.prototype.save = function save(callback) {
    // 存入 Mongodb 的文檔
    var post = {
        username: this.username,
        pictureName: this.pictureName,
        song: this.song,
        singer:this.singer,
        description:this.description,
        tagArr:this.tagArr
    };

    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        // 讀取 posts 集合
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            // 爲 user 屬性添加索引
            collection.ensureIndex('pictureName');
            // 寫入 post 文檔
            collection.insert(post, {safe: true}, function(err, post) {
                mongodb.close();
                callback(err, post);
            });
        });
    });
};

Post.getAll = function getAll(callback) {
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        // 讀取 posts 集合
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            // 查找 user 屬性爲 username 的文檔，如果 username 是 null 則匹配全部
            // var query = {};
            // if (username) {
            //     query.user = username;
            // }
            collection.find().toArray(function(err, docs) {
                mongodb.close();
                if (err) {
                    callback(err, null);
                }
                // 封裝 posts 爲 Post 對象
                var posts = [];
                docs.forEach(function(doc, index) {
                    var post = new Post(doc.username,
                                        doc.pictureName,
                                        doc.song,
                                        doc.singer,
                                        doc.description,
                                        doc.tagArr);

                    posts.push(post);
                });
                callback(null, posts);
            });
        });
    });
};
