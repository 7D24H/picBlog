var crypto = require('crypto');
var User = require('../models/user.js');
var Tag = require('../models/tag.js');
// var fs = require('fs');
// var bodyParser=require('body-parser');


var multer  = require('multer');
// //引入Multiparty解析表单
// var multiparty = require('multiparty');
var fs = require('fs');

var storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, '/uploads')
    },
    filename: function (req, file, cb){
        cb(null, file.originalname)
    }
});
var upload = multer({
    storage: storage
});


module.exports = function(app) {


    app.all('*',function(req,res,next){
        var origin=req.headers.origin;
        res.setHeader('Access-Control-Allow-Origin',"*");
        res.setHeader('Access-Control-Allow-Headers','Content-Type');
        next();
    })

    app.get('/', function (req, res) {
        if (req.cookies.user !== null) {
            req.user = req.cookies.user;
        }
        console.log("req.cookies==", req.cookies.user);
        res.render('home');
    });

    app.get('/register', checkNotLogin);
    app.get('/register', function (req, res) {
        res.render('register', {
            title: '用戶註冊',
        });
    });

    app.post('/register', checkNotLogin);
    app.post('/register', function (req, res) {
        //檢驗用戶兩次輸入的口令是否一致
        if (req.body['password-repeat'] != req.body['password']) {
            req.flash('error', '兩次輸入的口令不一致');
            return res.redirect('/register');
        }

        //生成口令的散列值
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');

        var newUser = new User({
            name: req.body.username,
            password: password,
        });

        //檢查用戶名是否已經存在
        User.get(newUser.name, function (err, user) {
            if (user)
                err = 'Username already exists.';
            if (err) {
                req.flash('error', err);
                return res.redirect('/register');
            }
            //如果不存在則新增用戶
            newUser.save(function (err) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/register');
                }
                req.session.user = newUser;
                req.flash('success', '註冊成功');
                res.redirect('/login');
            });
        });
    });

    app.get('/login', checkNotLogin);
    app.get('/login', function (req, res) {
        res.render('login', {
            title: '用戶登入',
        });
    });

    app.post('/login', checkNotLogin);
    app.post('/login', function (req, res) {
        //生成口令的散列值
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');
        var username = req.body.username;


        console.log("!! login req.body:",req.body);

        User.get(username, function (err, user) {
            if (!user) {
                req.flash('error', '用戶不存在');
                return res.redirect('/login');
            }
            if (user.password != password) {
                req.flash('error', '用戶口令錯誤');
                return res.redirect('/login');
            }
            req.session.user = user;
            req.flash('success', '登入成功');
            res.cookie("user", username, {maxAge: 6000000, httpOnly: false});
            res.redirect('showBoard');
        });
    });

    app.get('/logout', checkLogin);
    app.get('/logout', function (req, res) {
        req.session.user = null;
        req.flash('success', '登出成功');
        res.clearCookie('username');
        res.redirect('/');
    });


    app.get('/showBoard', checkLogin);
    app.get('/showBoard', function (req, res) {
        console.log("username is :", req.session.user.name);
        res.render('showBoard', {username: req.session.user.name});
    });

    app.get('/test', function (req, res) {
        res.render('singlePic');
    });

    app.post('/test',function (req, res) {
        //这个成功有base64
        var imgData = req.body.imgData;
        //过滤data:URL
        var base64Data0 = imgData.replace(/^data:image\/\w+;base64,/, "");
        //空格要替换成加号！！！！！
        var base64Data = base64Data0.replace(/\s/g,"+");

        var dataBuffer = new Buffer(base64Data, 'base64');
        var timestamp = Date.parse(new Date()).toString().substr(0,10);
        fs.writeFile("./public/uploads/"+timestamp+".png", dataBuffer, function(err) {
            if(err){
                res.send(err);
            }else{
                // windows.location('/writeForm');
                // return res.send("保存成功！");
                res.cookie("pictureName", timestamp, {maxAge: 6000000, httpOnly: false});
                res.send('/writeForm');  //传回给了ajax前端浏览器
            }
        });
        // req.flash('success', '保存成功');

        // return res.redirect('/writeForm');
    });

    app.get('/writeForm',checkLogin);
    app.get('/writeForm',function(req,res){
        Tag.get("",function(err,tags){
            if(err){
                req.flash('error',err);
            }
            res.render('info-form',{tags:tags}); //从数据库中读出所有类型，生成勾选键在信息填写表
        })
    })

    app.post('/writeForm',function(req,res){
        var diyTag=req.body.diyTag;
        var tagArr=diyTag.trim().split(/\s+/);//用正则表达式才能把多的空格也弄掉

        console.log("TAGARR "+tagArr);

        for(tag in tagArr){
            var newTag = new Tag({
                name: tagArr[tag]
            });

            newTag.save(function(err) { //如果没有重复的是ok的 以下5行
                if (err) {
                    console.log("SAVE ERROR"+err);
                    req.flash('error', err);
                }
            });


            // console.log("EACH TAG:"+tagArr[tag]);
            // //如果不存在則新增tag
            // newTag.save(function (err) {
            //     if (err) {
            //         // req.flash('error', "save error"+err);
            //         console.log("SAVE ERROR DB? "+error);
            //         return res.redirect('/writeForm');
            //     }
            //     res.redirect('/showBoard');
            // });


            //如果不存在則新增用戶
            // newUser.save(function (err) {
            //     if (err) {
            //         req.flash('error', err);
            //         return res.redirect('/register');
            //     }
            //     req.session.user = newUser;
            //     req.flash('success', '註冊成功');
            //     res.redirect('/login');
            // });

            //檢查tag是否已經存在
            // Tag.get(newTag.name, function (err, tag) {
            //
            //     console.log("START CHECK TAG "+newTag.name);
            //
            //     if (!tag){
            //         // err = newTag.name + ' already exists.';
            //         console.log("DONT exist "+newTag.name);
            //
            //         //如果不存在則新增tag
            //         newTag.save(function (err) {
            //             if (err) {
            //                 req.flash('error', "save error"+err);
            //                 console.log("SAVE ERROR DB? "+error);
            //                 // res.redirect('/writeForm');
            //             }
            //
            //         });
            //     }
            //
            //     if (err) {
            //         req.flash('error', err);
            //         // res.redirect('/writeForm');
            //         console.log("ERROR DB? "+error);
            //
            //     }
            //
            // });
        }

        req.flash('success', 'New tags save successfully');
        res.redirect('/showBoard');

        // next();
    });

};

function checkLogin(req, res, next) {
    if (!req.session.user) {
        req.flash('error', 'Please login first');
        return res.redirect('/login');
    }
    next();
}

function checkNotLogin(req, res, next) {
    if (req.session.user) {
        req.flash('error', 'Have logged in');
        return res.redirect('/');
    }
    next();
}
