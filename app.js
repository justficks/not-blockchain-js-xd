const app = require('express')();
const http = require('http').Server(app);
const express = require('express');

const expressHandlebars = require('express-handlebars');
const path = require('path');

const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');

const flash = require('connect-flash');

require('./config/passport');

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', expressHandlebars({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');

// Middleweare
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    cookie: { maxAge: 60000 },
    secret: 'codeworkrsecret',
    saveUninitialized: false,
    resave: false
}));

app.use(express.static(path.join(__dirname, 'public')));


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

http.listen(5000, () => console.log('Server started listening on port 5000!'));