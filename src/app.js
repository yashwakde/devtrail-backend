import express from 'express';
import  CookieParser from 'cookie-parser';
import morgan  from 'morgan';
import passport from 'passport';
import { Strategy as github2Strategy } from 'passport-github2';
import config from  "./config/config.js";
import authRoutes from './routes/auth.route.js';
const app = express();
app.use(express.json());
app.use(CookieParser());
app.use(morgan('dev'));


app.use(passport.initialize());
passport.use(new github2Strategy({
    clientID: config.GITHUB_CLIENT_ID,
    clientSecret: config.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/auth/github/callback"

},(accessToken, refreshToken, profile, done)=>{
return done(null,profile);
}));


app.use("/api/auth", authRoutes);
export default app;