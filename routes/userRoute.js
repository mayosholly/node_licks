const express = require('express');
const { userSignup, userLogin, forgetPassword, otpVerify, passwordReset, userLogout } = require('../controllers/authController')
const { protect } = require('../middlewares/authMiddleware')
const { body, validationResult } = require('express-validator');
const { validateSignup, validateLogin } = require('./validations');

const router = express.Router()


router.get('/signup', (req, res) => {
    res.render('signup')
});

router.get('/login', (req, res) => {
    res.render('login')
});

router.get('/forget-password', (req, res) => {
    res.render('forgetPassword')
});

router.get('/verify-otp', (req, res) => {
    res.render('otp')
});

router.get('/reset-password', (req, res) => {
    res.render('resetPassword')
});

router.get('/verified', (req, res) => {
    res.render('verified')
});

router.get('/error', (req, res) => {
    res.render('error')
});

router.get('/home', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/user/login');
  }

  // Access user information from the session
  const user = req.session.user;

    res.render('home', { user })
});




router.post('/signup', validateSignup , userSignup)
router.post('/login',validateLogin, userLogin)
router.post('/forget-password', forgetPassword)
router.post('/verify-otp', otpVerify)
router.post('/reset-password', passwordReset)
router.post('/logout', userLogout)


module.exports = router