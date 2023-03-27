import path from 'path';
import express from 'express';
import bodyParser from 'body-parser'
import errorController from './controllers/error.js'

import adminRoutes from './routes/admin.js';
import shopRoutes from './routes/shop.js';
//import mongoConnect from './util/database.js';
import User from './models/user.js';
import mongoose from 'mongoose';


const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(path.dirname(process.cwd()),'express-mongodb','public')));

app.use((req,res,next)=>{
    User.findById('6421d1691ac994ba3e2c7e41')
        .then(user=>{
            req.user = user;
            next();
        })
})

app.use('/admin', adminRoutes.router);
app.use(shopRoutes.router);

app.use(errorController.get404);

mongoose.connect('mongodb+srv://dhruvbabariya912001:1Qgtr12DHk0qWzqr@firstcluster.hexiesz.mongodb.net/shop?retryWrites=true&w=majority')
    .then(() =>{
        User.findOne()
        .then(user =>{
            if(!user){
                const user = new User();
                user.name = "Dhruv";
                user.email = "dhruv123@gmail.com";
                user.cart = {
                    items : []
                };
                user.save().then(()=>{
                    console.log("UserCreated");
                })
            }
        })
        app.listen(2000, ()=>{
            console.log("Server Started....");
    })
});

