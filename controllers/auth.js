import bcrypt from 'bcryptjs';
import User from "../models/user.js";
import dotenv  from 'dotenv';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { validationResult } from 'express-validator';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: process.env.MAIL_ID, 
        pass: process.env.MAIL_PASS
    },
  });


const getLoginPage = (req,res,next)=>{
    let message = req.flash('error');
    if(message.length >0){
        message = message[0];
    }else{
        message = null;
    }
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage : message,
        oldInput : {
            email : '',
            password : ''
        },
        validationErrors:[]
      });
}

const postLogin = (req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    console.log(errors);
    if(!errors.isEmpty()){
        return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            errorMessage : errors.array()[0].msg,
            oldInput : {
                email : email,
                password : password
            },
            validationErrors: errors.array()
        });
    }
    User.findOne({email : email})
        .then(user=>{
            if(!user){
                return res.status(422).render('auth/login', {
                    pageTitle: 'Login',
                    path: '/login',
                    errorMessage : "Invalid email or password",
                    oldInput : {
                        email : email,
                        password : password
                    },
                    validationErrors: errors.array()
                });
            }
            bcrypt.compare(password,user.password)
            .then(doMatch =>{
                if(doMatch){
                    req.session.user = user;
                    req.session.isLoggedIn = true;
                    return req.session.save(err =>{
                        console.log(err);
                        res.redirect('/');
                    });
                }
                return res.status(422).render('auth/login', {
                    pageTitle: 'Login',
                    path: '/login',
                    errorMessage : "Invalid email or password",
                    oldInput : {
                        email : email,
                        password : password
                    },
                    validationErrors: errors.array()
                });
            })
    })
    .catch(err=>{
        const error = new Error(err);
        error.httpStatusCode(500);
        return next(error);
      })
    
}

const postLogout = (req,res,next)=>{
    req.session.destroy(err =>{
        console.log(err);
        res.redirect('/');
    })
}

const getSignup =(req,res,next)=>{
    let message = req.flash('error');
    if(message.length >0){
        message = message[0];
    }else{
        message = null;
    }
    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        errorMessage : message,
        oldInput : {
            email : '',
            password :'',
            confirmPassword :''
        },
        validationErrors:[]
    });
}

const postSignup = (req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render('auth/signup', {
            pageTitle: 'Signup',
            path: '/signup',
            errorMessage : errors.array()[0].msg,
            oldInput : {
                email : email,
                password :password,
                confirmPassword :confirmPassword
            },
            validationErrors : errors.array()
        });
    }
        bcrypt.hash(password,12)
        .then(encrptPassword =>{
            const user = new User({
                email : email,
                password : encrptPassword,
                cart : {
                    items : []
                }
            })
            return user.save();
        })
        .then(result =>{
            res.redirect('/login');
            transporter.sendMail({
                from: 'infothenursery01@gmail.com',
                to: email,
                subject: 'welcome to shop',
                html: 'Successful signup'}, err =>{
                console.log(err);
            })  
        })
        .catch(err=>{
            const error = new Error(err);
            error.httpStatusCode(500);
            return next(error);
          })
}

const getReset = (req,res,next)=>{
    let message = req.flash('error');
    if(message.length >0){
        message = message[0];
    }else{
        message = null;
    }
    res.render('auth/reset', {
        pageTitle: 'ResetPassword',
        path: '/reset',
        errorMessage : message
      });
}

const postReset = (req,res,next)=>{
    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            req.flash('error','Token is not generate please try again');
            console.log(err);
            return res.redirect('/rest');
        }
        const token = buffer.toString('hex');
        User.findOne({email:req.body.email})
        .then(user =>{
            if(!user){
                req.flash('error','This Email id it Not Registered');
                return res.redirect('/reset');
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;

            return user.save();
        })
        .then(result =>{
            
            transporter.sendMail({
                from: 'infothenursery01@gmail.com',
                to: req.body.email,
                subject: 'Reset Your Password',
                html: `
                <p> You requested a password reset</p>
                <p> Click this <a href="http://localhost:2000/reset/${token}">link</a> to set a New Password</p>
                `}, err =>{
                console.log(err);
            })
            res.redirect('/');  
        })
        .catch(err=>{
            const error = new Error(err);
            error.httpStatusCode(500);
            return next(error);
          })
    })
}

const getpasswordform = (req,res,next) =>{
    const token = req.params.token;
    console.log(token);
    User.findOne({resetToken : token, resetTokenExpiration : {$gt : Date.now()}})
    .then(user =>{
        let message = req.flash('error');
        if(message.length >0){
            message = message[0];
        }else{
            message = null;
        }
        res.render('auth/new-password', {
            pageTitle: 'UpdatePassword',
            path: '/new-password',
            errorMessage : message,
            userId : user._id.toString(),
            token : token
        });
    })
    
}

const postNewPassword = (req,res,next) =>{
    const userId = req.body.userId;
    const token = req.body.token;
    const newPassword = req.body.password;
    let resetUser;
    User.findOne({
        resetToken : token,
        resetTokenExpiration : {$gt : Date.now()},
        _id : userId
    }).then(user =>{
        resetUser = user;
        return bcrypt.hash(newPassword,12);
    })
    .then(hashedPassword =>{
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
    })
    .then(result =>{
        res.redirect('/login');
    })
    .catch(err=>{
        const error = new Error(err);
        error.httpStatusCode(500);
        return next(error);
      })
}
export default {getLoginPage,postLogin,postLogout,getSignup,
    postSignup,getReset,postReset,getpasswordform,postNewPassword};