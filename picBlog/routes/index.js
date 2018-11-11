var crypto = require('crypto');
var User = require('../models/user.js');

module.exports = function(app) {
    app.get('/', function(req, res) {
        res.render('index', {
            title: '首頁'
        });
    });

    app.get('/register', checkNotLogin);
    app.get('/register', function(req, res) {
        res.render('register', {
            title: '用戶註冊',
        });
    });

    app.post('/register', checkNotLogin);
    app.post('/register', function(req, res) {
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
        User.get(newUser.name, function(err, user) {
            if (user)
                err = 'Username already exists.';
            if (err) {
                req.flash('error', err);
                return res.redirect('/register');
            }
            //如果不存在則新增用戶
            newUser.save(function(err) {
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
    app.get('/login', function(req, res) {
        res.render('login', {
            title: '用戶登入',
        });
    });

    app.post('/login', checkNotLogin);
    app.post('/login', function(req, res) {
        //生成口令的散列值
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');

        User.get(req.body.username, function(err, user) {
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
            res.redirect('showBoard');
        });
    });

    app.get('/logout', checkLogin);
    app.get('/logout', function(req, res) {
        req.session.user = null;
        req.flash('success', '登出成功');
        res.redirect('/');
    });


    app.get('/showBoard',checkLogin);
    app.get('/showBoard',function(req,res){
        console.log("username is :",req.session.user.name);
        res.render('showBoard',{username:req.session.user.name});
    })


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
