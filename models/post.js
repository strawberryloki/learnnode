var mongodb = require('./db');

function Post(username, post, time) {
    this.user = username;
    this.post = post;
    if (time) {
        this.time = time;
    } else {
        this.time = new Date();
    }
};
module.exports = Post;
Post.prototype.save = function save(callback) {
    // 存入 Mongodb 的文档
    var post = {
        user: this.user,
        post: this.post,
        time: this.time,
    };
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        // 读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
            // 为 user 属性添加索引
            collection.ensureIndex({
                "user": 1
            }, {
                "unique": true
            }, function (err) {
                console.log('Error1:' + err);
            });
            // 写入 post 文档
            collection.insert(post, function (err, post) {

                callback(err, post);

                db.close(function (err, post) {
                    console.log('Error2:' + err);
                });
            });

        });
    });
};
Post.get = function get(username, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        // 读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
            // 查找 user 属性为 username 的文档，如果 username 是 null 则匹配全部
            var query = {};
            if (username) {
                query.user = username;
            }
            collection.find(query).sort({
                time: -1
            }).toArray(function (err, docs) {
                db.close();
                if (err) {
                    callback(err, null);
                }
                // 封装 posts 为 Post 对象
                var posts = [];
                docs.forEach(function (doc, index) {
                    var post = new Post(doc.user, doc.post, doc.time);
                    posts.push(post);
                });
                callback(null, posts);
            });
        });
    });
};