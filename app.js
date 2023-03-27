import path from 'path';
import express from 'express';
import bodyParser from 'body-parser'
import errorController from './controllers/error.js'

import adminRoutes from './routes/admin.js';
import shopRoutes from './routes/shop.js';
import mongoConnect from './util/database.js';
import User from './models/user.js';

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(path.dirname(process.cwd()),'Express-js','public')));

app.use((req,res,next)=>{
    User.findById('64212db73be0fc18588aa6e5')
        .then(user=>{
            req.user = new User(user.name,user.email,user.cart,user._id);
            next();
        })
})

app.use('/admin', adminRoutes.router);
app.use(shopRoutes.router);

app.use(errorController.get404);

 mongoConnect.mongoConnect(() =>{
    app.listen(2000, ()=>{
        console.log("Server Started....");
    })
});
