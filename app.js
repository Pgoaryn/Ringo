var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var categoryRouter = require('./routes/category');  
var productRouter = require('./routes/product');    
var authRouter = require('./routes/auth');

var app = express();

//import "express-session" library
var session = require('express-session');
//set session timeout
app.use(session({
  secret: "ringo_new_town",  
  resave: false,                     
  saveUninitialized: true
}));

var mongoose = require('mongoose');

var database = "mongodb://localhost:27017/Ringo";

mongoose.connect(database)
  .then(() => console.log('connect to db succeed !'))
  .catch((err) => console.log('connect to db failed. Error: ' + err));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.username = req.session.username;
  next();
});


const { checkSingleSession } = require('./middlewares/auth');
app.use('/category', checkSingleSession);

app.use('/', indexRouter);
app.use('/category', categoryRouter);
app.use('/product', productRouter);
app.use('/auth', authRouter);

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

