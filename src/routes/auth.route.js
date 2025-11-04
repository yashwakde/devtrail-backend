import express from 'express';
import * as authController from '../controller/auth.controller.js';
import* as validationMiddleware from "../middleware/Validation.middleware.js"
import passport from 'passport';
const router = express.Router();

router.post("/register",validationMiddleware.registerValidationRules,authController.registerUser);
// GitHub OAuth start
router.get('/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }));

// GitHub OAuth callback
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
   authController.githubAuthCallback
 );


 router.post("/login",authController.loginUser);
 router.get("/logout",authController.logoutUser);
 export default router;
