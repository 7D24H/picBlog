var crypto = require('crypto');
var User = require('../models/user.js');
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
        // var form = new multiparty.Form();
        // form.parse(req, function(err, fields, files){
            //将前台传来的base64数据去掉前缀
            // var imgData = fields.file[0].replace(/^data:image\/\w+;base64,/, '');
            //
            // var dataBuffer = new Buffer(imgData, 'base64');
            // //写入文件
            // fs.writeFile('image.png', dataBuffer, function(err){
            //     if(err){
            //         res.send(err);
            //     }else{
            //         res.send('保存成功');
            //     }
            // });

            // fs.mkdir('./newdir', function(err) {
            //     if (err) {
            //         throw err;
            //     }
            //     console.log('make dir success.');
            // });

        // });
        //
        // res.send('POST发送成功了');



        //这个成功有base64
        var imgData = req.body.imgData;
        //过滤data:URL
        var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
        var dataBuffer = new Buffer(base64Data, 'base64');
        fs.writeFile("image.png", dataBuffer, function(err) {
            if(err){
                res.send(err);
            }else{
                res.send("保存成功！");
            }
        });
        // console.log("databuffer",dataBuffer);

        // console.log("imgData",req.body.imgData);//这个会在控制台输出
        // res.json(req.body.imgData);//这个会发回给前端输出 xhr.response


        // var imgData = req.body.localImg;
        //
        // //过滤data:URL
        //
        // var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
        //
        // var dataBuffer = new Buffer(base64Data, 'base64');
        //
        // fs.writeFile("image.png", dataBuffer, function (err) {
        //     if (err) {
        //         res.send(err);
        //     } else {
        //         res.send("保存成功！");
        //     }
        // });
        //
        // fs.mkdir("./saveImg",function(err){
        //     if(err){
        //         throw err;
        //     }
        //     console.log("mkdir success");
        // });


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
