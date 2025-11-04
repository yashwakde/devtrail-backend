import express from 'express';
import  CookieParser from 'cookie-parser';
import morgan  from 'morgan';
import passport from 'passport';
import session from 'express-session';
import { Strategy as github2Strategy } from 'passport-github2';
import config from  "./config/config.js";
import authRoutes from './routes/auth.route.js';
const app = express();
app.use(express.json());
app.use(CookieParser());
app.use(morgan('dev'));

app.use(session({
  secret: config.JWT_SECRET || 'supersecretkey', // koi secret likh do
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new github2Strategy({
    clientID: config.GITHUB_CLIENT_ID,
    clientSecret: config.GITHUB_CLIENT_SECRET,
    callbackURL: config.GITHUB_CALLBACK_URL,
    scope: [ 'user:email' ]
},(accessToken, refreshToken, profile, done)=>{
return done(null,profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});
console.log("GitHub Callback URL in use:", config.GITHUB_CALLBACK_URL);


app.use("/api/auth", authRoutes);
export default app;