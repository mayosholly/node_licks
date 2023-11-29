const User = require('../models/authModel')
const OTP_Code = require('../models/resetPasswordModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const nodemailer = require('nodemailer')
const { body, validationResult } = require('express-validator');



const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: 'loanwise50@gmail.com',
        pass: 'rkhicdwjnlayqfkp',
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    }
    else {
        console.log('Ready for messages');
        console.log(success);
    }
});



const userSignup = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);      

      req.flash('error', errorMessages);
      req.flash('formData', req.body);
      res.redirect('/user/signup');
      return;
    }

    // res.send(req.body)
    const { firstName, lastName, username, email, password } = req.body;

    if (!firstName || !username || !email || !password) {
        // return res.status(200).json({ message: "All field are required!"})
         req.flash('error', "All Fields are required");
        res.redirect('/user/signup')
        return;
    }

    const user = await User.findOne({ email })
    if (user) {
        req.flash('error', "User Already Exist");
        res.redirect('/user/signup')
        return;
        // return res.status(404).json({ message: "User already exist, proceed to Login"})
    }

    // if (password !== confirmPassword) {
    //     return res.status(404).json({ message: 'Password and confirm Password do not match!'})
    // }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
    })

    try {
        await newUser.save()
        req.flash('success', "User Successfully Created");
        return res.redirect('/user/login')

    } catch (error) {
        console.log(error)
        req.flash('error', "Internal Server Error");
        // return res.status(500).json({message: "Internal Server Error"})
    }

    // return res.status(201).json({message: "User has successfully Signed up their account.", newUser})
    // return res.redirect('/user/login')
}


const userLogin = async (req, res) => {
    const { email, password } = req.body

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
      

      req.flash('error', errorMessages);
      res.redirect('/user/login');
      return;
    }

    if (!email || !password) {
        // return res.status(404).json({ message: "All fields are required!"})
         req.flash('error', "All Fields are required");
         res.redirect('/user/login');
    }


    try {
        const existingUser = await User.findOne({ email })

        req.session.user = existingUser;
        req.flash('success', "Login Successfull");
        return res.redirect('/user/home')
    } catch (error) {
        console.log(error)
    }
    
}


const forgetPassword = async (req, res) => {
    const { email } = req.body;

    const existingUser = await User.findOne({ email })
    if (!existingUser) {
        return res.status(404).json({ message: "User does not exist"})
    }

    const otpCode = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    const expirations = moment().add(1, 'hour').toDate();

    const userForgetPassword = new OTP_Code({
        email,
        otpCode,
        expiresAt: expirations,
    })

    try {
        await userForgetPassword.save()
    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"})
    }

    const mailOptions = {
        from: 'loanwise50@gmail.com',
        to: email,
        subject: "OTP Verification Code",
        html: `<p>Your password recovery code is: <b>${otpCode}</b>. Kindly note that this code is valid for <b>10 min</b>.</P>`
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
    });
      

    req.flash('formData', req.body);
    req.flash('success', "Otp Verification Code has been sent to your mail");

    return res.redirect('/user/verify-otp')
}


const otpVerify = async (req, res) => {
    const { otpCode, email } = req.body

    try {
        const recoveryCode = await OTP_Code.findOne({ email })

        if (!recoveryCode) {
            req.flash('error', "User not found!");
            req.flash('formData', req.body);
            return res.redirect('/user/verify-otp')

        }

        if (recoveryCode.otpCode != otpCode) {
            req.flash('error', "Invalid Otp Code");
            req.flash('formData', req.body);
            return res.redirect('/user/verify-otp')
        }

        const currentTime = moment();
        if (currentTime.isAfter(recoveryCode.expiresAt)) {
            req.flash('error', "Recovery code has expired");
            req.flash('formData', req.body);
            return res.redirect('/user/verify-otp')
        }
    
        
        recoveryCode.isVerified = true;
        
        try {
            await recoveryCode.save()
            req.flash('formData', req.body);
            req.flash('success', "Otp Verification successful");
            return res.redirect('/user/reset-password')
        } catch (error) {
            req.flash('error', "Internal Server Error");
            return res.redirect('/user/login')
        }
    
    } catch (error) {
        req.flash('error', "Internal Server Error");
        return res.redirect('/user/login')
    }
}


const passwordReset = async (req, res) => {
    const { otpCode, newPassword, confirmPassword } = req.body;
  
    const resetPassword = await OTP_Code.findOne({
        otpCode,
        expiresAt: { $gt: new Date() },
    });
  
    if (!resetPassword) {
        req.flash('formData', req.body);
        req.flash('error', "Invalid or expired recovery code");
        return res.redirect('/user/reset-password')
    }

    const existingUser = await User.findOne({ email: resetPassword.email });
  
    if (!existingUser) {
        req.flash('formData', req.body);
        req.flash('error', "User not found");
        return res.redirect('/user/reset-password')
    }

    if (newPassword === existingUser.password) {
        req.flash('formData', req.body);
        req.flash('error', "New password must be different from the old password");
        return res.redirect('/user/reset-password')
    }

    if (newPassword !== confirmPassword) {
        req.flash('formData', req.body);
        req.flash('error', "Password and confirm password do not match");
        return res.redirect('/user/reset-password')
    }
console.log(newPassword)
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    existingUser.password = hashedPassword;

    await existingUser.save();
  
    try {

        await OTP_Code.deleteOne({ _id: resetPassword._id });


        const isPasswordCorrect = bcrypt.compare(newPassword, existingUser.password);
        if (!isPasswordCorrect) {
            req.flash('formData', req.body);
            req.flash('error', "Invalid Email/Password");
            return res.redirect('/user/reset-password')    
        }

        // const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // console.log('Generated Token\n', token);

        // if (req.cookies[`${existingUser._id}`]) {
        //     req.cookies[`${existingUser._id}`] = '';
        // }

        // res.cookie(String(existingUser._id), token, {
        //     path: '/',
        //     expires: new Date(Date.now() + 1000 * 30),
        //     httpOnly: true,
        //     sameSite: 'lax',
        // });
      
        // return res.status(200).json({ message: 'Password reset successful and user can successfully log in', existingUser});
        return res.redirect('/user/login')

    } catch (error) {
      console.error('Error resetting password:', error);
      req.flash('error', "Failed to reset password");
      return res.redirect('/user/login')    
    }
}

// Logout
const userLogout = (req, res) => {
    req.session.destroy((err) => {
      if (err) console.error(err);
      res.redirect('/user/login');
    });
  };
  



exports.userSignup = userSignup;
exports.userLogin = userLogin;
exports.userLogout = userLogout;
exports.forgetPassword = forgetPassword;
exports.otpVerify = otpVerify;
exports.passwordReset = passwordReset;
