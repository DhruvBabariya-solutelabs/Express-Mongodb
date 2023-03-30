import bcrypt from 'bcryptjs';
import User from "../models/user.js";
import dotenv  from 'dotenv';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

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
        errorMessage : message
      });
}

const postLogin = (req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email : email})
        .then(user=>{
            if(!user){
                req.flash('error','Invalid email or password');
                return res.redirect('/login');
            }
            bcrypt.compare(password,user.password)
            .then(doMatch =>{
                if(doMatch){
                    req.session.user = user;
                    req.session.isLoggedIn =true;
                    return req.session.save(err =>{
                        console.log(err);
                        res.redirect('/');
                    });
                }
                req.flash('error','Invalid email or password');
                res.redirect('/login');
            })
    })
    .catch(err =>{
        console.log(err);
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
        errorMessage : message
    });
}

const postSignup = (req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    User.findOne({email : email})
    .then(userDocs => {
        if(userDocs){
            req.flash('error','Email is already exists..');
            return res.redirect('/signup');
        }
        return bcrypt.hash(password,12)
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
    })
    .catch(err => console.log(err));
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
        .catch(err => console.log(err));
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
    .catch(err => console.log(err));
}
export default {getLoginPage,postLogin,postLogout,getSignup,
    postSignup,getReset,postReset,getpasswordform,postNewPassword};