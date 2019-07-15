const express = require('express')
const path = require('path');
const morgan = require('morgan')
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressHandlebars = require('express-handlebars');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const methodOverride = require('method-override');
var app = require('express')();
var http = require('http').Server(app);
const mongoose = require('mongoose');

require('./config/passport');

app.use(morgan('dev'));

mongoose.connect('mongodb://localhost/mongouploads', {useNewUrlParser:true});

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', expressHandlebars({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');
      
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(session({
  cookie: { maxAge: 60000 },
  secret: 'codeworkrsecret',
  saveUninitialized: false,
  resave: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success');
  res.locals.error_messages = req.flash('error');
  res.locals.isAuthenticated = req.user ? true : false;
  next();
});

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/files', require('./routes/files'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  res.render('notFound');
});

http.listen(5000, () => console.log('Server started listening on port 5000!'));