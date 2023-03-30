import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import errorController from './controllers/error.js';
import session from 'express-session';
import { default as connectMongoDBSession} from 'connect-mongodb-session';
import csrf from 'csurf';
import flash from 'connect-flash';
import dotenv from 'dotenv'

import adminRoutes from './routes/admin.js';
import shopRoutes from './routes/shop.js';
import authRouter from './routes/auth.js';
import User from './models/user.js';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const csrfProtection = csrf();
const MongoDBStore = connectMongoDBSession(session);
const store = new MongoDBStore({
    uri : process.env.MONGODB_URI,
    collection : 'sessions',
});

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(path.dirname(process.cwd()),'express-mongodb','public')));
app.use(session({
    secret:'my secret',
    resave : false, 
    saveUninitialized : false,
    store :store
}));

app.use(csrfProtection);
app.use(flash());

app.use((req,res,next)=>{
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id)
        .then(user=>{
            req.user = user;
            next();
    })
})
app.use((req,res,next)=>{
    res.locals.isLoggedIn = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})


app.use('/admin', adminRoutes.router);
app.use(shopRoutes.router);
app.use(authRouter.router);
app.use(errorController.get404);

mongoose.connect(process.env.MONGODB_URI)
    .then(() =>{
        app.listen(2000, ()=>{
            console.log("Server Started....");
    })
});

