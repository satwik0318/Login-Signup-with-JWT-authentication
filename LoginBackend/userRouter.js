const express=require("express");
const { userAuth } = require("./Middleware/userAuth");
const getuserData = require("./userController");
const userRouter=express.Router();
userRouter.get("/data",userAuth,getuserData)
module.exports=userRouter
