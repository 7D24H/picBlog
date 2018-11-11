
var express = require('express');
var routes = require('./routes');
var path = require('path');
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var bodyParser=require('body-parser');
var logger = require('morgan');
var ejs = require('ejs');
var expressLayouts = require('express-ejs-layouts');
var session    = require('express-session');
var MongoStore = require('connect-mongo')(session);
var settings = require('./settings');
var flash = require('connect-flash');
var app = express();


//使用的仍是ejs模板引擎，但是后缀名改为html更顺眼一些，创建文件时也更方便
app.engine('html',ejs.__express);
app.set('view engine','html');

// 模板引擎的模板位置
app.set('views', path.join(__dirname, 'views'));

//使用ejs布局.layout.html为默认布局文件
app.use(expressLayouts);

//端口设置
app.set('port',process.env.PORT||3000);

//bodyparse设置
app.use(bodyParser.urlencoded({extended:true}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());//cookie解析的中间件

//flash在routes前面
app.use(flash());

//会话支持,session在flash前面
app.use(session({
    secret:settings.cookieSecret,
    store:new MongoStore({  //MongoStore实例
        db:settings.db,
        url:'mongodb://localhost:27017/picBlog'
    })

}));

//设置flash,flash在routes前面
app.use(function(req, res, next){
    console.log("app.usr local");
    res.locals.user = req.session.user;
    res.locals.post = req.session.post;
    var error = req.flash('error');
    res.locals.error = error.length ? error : null;

    var success = req.flash('success');
    res.locals.success = success.length ? success : null;
    next();
});

//路由配置全在routes里，不放在app.js里，太累赘
routes(app);//要放在static前面，不然它会直接根据get后面的信息去public里找有没有符合的静态文件，就不管路由方法里是什么了

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
     res.locals.message = err.message;
     res.locals.error = req.app.get('env') === 'development' ? err : {};

     // render the error page
     res.status(err.status || 500);
     res.render('error');
});

module.exports = app;

app.listen(app.get('port'),function(){
     console.log('成功启动！Express started on http://localhost:'+app.get('port')+';press Ctrl-C to terminate.');
});