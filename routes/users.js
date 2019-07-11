const express = require('express');
const router = express.Router();
const Joi = require('joi');
const passport = require('passport');

const User = require('../models/user');

const userSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  username: Joi.string().required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
  confirmationPassword: Joi.any().valid(Joi.ref('password')).required()
});

const isAuthenticated = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  } else {
    req.flash('error', 'ХАхахаах, хитро...Но не выёдет)');
    res.redirect('/');
  }
}

const isNotAuthenticated = (req, res, next) => {
  if(req.isAuthenticated()) {
    req.flash('error', 'Хахаха, хватит, прекрати');
    res.redirect('/');
  } else {
    return next();
  }
}

router.route('/register')
  .get(isNotAuthenticated, (req, res) => {
    res.render('register');
  })
  .post(async (req, res, next) => {
    try {
      const result = Joi.validate(req.body, userSchema);
    
      if(result.error) {
        req.flash('error', 'Что-то не правильно ввели, пробуй ещё');
        res.redirect('/users/register');
        return;
      }
  
      const user = await User.findOne({ 'email' : result.value.email })
      if(user){
        req.flash('error', 'Email уже используется');
        res.redirect('/users/register');
        return;
      }

      const hash = await User.hashPassword(result.value.password);
      console.log('hash', hash);

      delete result.value.confirmationPassword;
      result.value.password = hash;

      const newUser = await new User(result.value);
      await newUser.save();

      req.flash('success', 'Вы зарегестрированы, теперь авторизуйтесь');
      res.redirect('/users/login'); 
    } catch(error) {
      next(error);
    }
  })

router.route('/login')
  .get(isNotAuthenticated, (req, res) => {
    res.render('login');
  })
  .post(passport.authenticate('local', {
    successRedirect: '/users/dashboard',
    failureRedirect: '/isers/login',
    failureFlash: true
  }))

router.route('/dashboard')
  .get(isAuthenticated, (req,res) => {
    res.render('dashboard', {
      username: req.user.username
      //Вот здесь мы передаём данные
    });
  });

router.route('/getFiles')
  .get(isAuthenticated, (req,res) => {
    res.render('files', {
      username: req.user.username
      //Вот здесь мы передаём данные
    });
  });

router.route('/getMyFiles')
  .get(isAuthenticated, (req,res) => {
    res.render('myfiles', {
      username: req.user.username
      //Вот здесь мы передаём данные
    });
  });

router.route('/logout')
  .get(isAuthenticated, (req, res) => {
    req.logout();
    req.flash('success', 'Спасибо что навестил браток, скоро увидимся');
    res.redirect('/');
  })
module.exports = router;