import path from 'path';
import fs from 'fs';
import express from 'express';
import bodyParser from 'body-parser';
import errorController from './controllers/error.js';
import session from 'express-session';
import { default as connectMongoDBSession} from 'connect-mongodb-session';
import csrf from 'csurf';
import flash from 'connect-flash';
import dotenv from 'dotenv'
import multer from 'multer';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import https from 'https';
import adminRoutes from './routes/admin.js';
import shopRoutes from './routes/shop.js';
import authRouter from './routes/auth.js';
import User from './models/user.js';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const csrfProtection = csrf();

// const privateKey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert');


const MongoDBStore = connectMongoDBSession(session);
const store = new MongoDBStore({
    uri : process.env.MONGODB_URI,
    collection : 'sessions',
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const fileStorage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'images');
    },
    filename : (req,file,cb)=>{
        const currentDate = new Date().toISOString().slice(0,10);
        cb(null, currentDate +'-'+file.originalname);
    }

})

const fileFilter = (req,file,cb)=>{
    if(file.mimetype === 'image/png' ||
       file.mimetype === 'image/jpg' ||
       file.mimetype === 'image/jpeg'
    ) {
        cb(null,true);
      }else{
        cb(null,false);
      }
}

// const accessLogStream = fs.createWriteStream(path.join(path.dirname(process.cwd()),
//                             'express-mongodb','access.log'),{flags : 'a'});


//app.use(helmet());
app.use(compression());
// app.use(morgan('combined',{stream: accessLogStream}));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage, fileFilter : fileFilter}).single('image'));
app.use(express.static(path.join(path.dirname(process.cwd()),'public')));
app.use('/images',express.static(path.join(path.dirname(process.cwd()),'images')));
app.use(session({
    secret:'my secret',
    resave : false, 
    saveUninitialized : false,
    store :store
}));

app.use(csrfProtection);
app.use(flash());

app.use((req,res,next)=>{
    res.locals.isLoggedIn = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})


app.use((req,res,next)=>{
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id)
        .then(user=>{
            req.user = user;
            next();
    })
    .catch(err => {
        const error = new Error(err);
      error.httpStatusCode(500);
      return next(error);
    });
})

app.use('/admin', adminRoutes.router);
app.use(shopRoutes.router);
app.use(authRouter.router);

app.get('/500',errorController.get500);
app.use(errorController.get404);

app.use((error,req,res,next)=>{
    console.log('error'+req.session.isLoggedIn);
    res.render('500', 
    {
        pageTitle: 'Server Error', 
        path: '/500',
        isLoggedIn : req.session.isLoggedIn
    });
});

mongoose.connect(process.env.MONGODB_URI)
    .then(() =>{
    //    https.createServer({key : privateKey,cert: certificate},app)
       app.listen(2000, ()=>{
            console.log("Server Started....");
    })
});

