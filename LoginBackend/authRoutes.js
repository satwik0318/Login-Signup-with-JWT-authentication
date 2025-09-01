const{register,login,logout,sendVerifyOtp,
    verifyEmail,isAuthenticated,resetPassword,sendResetOtp,getAllUsers,
updateProfile
}=require('./authController')
const express=require('express');
const { userAuth } = require('./Middleware/userAuth');
const authRouter=express.Router();
authRouter.post("/register",register)
authRouter.post("/login",login)
authRouter.post("/logout",logout)
authRouter.post("/send-Verify-Otp",userAuth,sendVerifyOtp)
authRouter.post("/verify-account",userAuth,verifyEmail)
authRouter.get("/is-auth",userAuth,isAuthenticated)
authRouter.post("/send-reset-otp",sendResetOtp)
authRouter.post("/reset-password",resetPassword)
authRouter.get('/all-users',userAuth,getAllUsers)
authRouter.put('/updated-profile',userAuth,updateProfile)
module.exports=authRouter