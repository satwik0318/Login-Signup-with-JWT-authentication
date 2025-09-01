const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('./userModel');
const transporter = require('./nodemailer');
const Cloudinary=require('./Middleware/ImageKit.js')
// Register
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: 'Missing details' });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Welcome to our anime site!',
      text: `Your account has been created with ID: ${email}`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: 'Email and password are required' });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'Invalid email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    return res.json({ success: true, message: 'Logged out' });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Send OTP
const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.userId; 
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    if (user.isAccountVerified) {
      return res.json({ success: false, message: 'Account already verified' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'OTP Verification',
      text: `Your OTP for account verification is ${otp}`,
    });

    return res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


// Verify Email with OTP
const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    // const token =req.cookies.token;
    // const decoded=jwt.verify(token,process.env.JWT_SECRET);
    const user = await userModel.findById(req.userId);

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    if (user.verifyOtp !== otp) {
      return res.json({ success: false, message: 'Invalid OTP' });
    }

    if (Date.now() > user.verifyOtpExpireAt) {
      return res.json({ success: false, message: 'OTP expired' });
    }

    user.isAccountVerified = true;
    user.verifyOtp = '';
    user.verifyOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: 'Account verified successfully' });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
//check if user is authenticated
const isAuthenticated=async(req,res)=>{
try{
return res.json({success:true})
}
catch(error){
  return res.json({success:false,message:error.message})
}
}
const sendResetOtp=async(req,res)=>{
  const {email}=req.body;
  if(!email){
    return res.json({success:false,message:'email is required'})
  }
  try {
    const user=await userModel.findOne({email})
    if(!user){
      return res.json({success:false,message:'user not found'})}
      const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'OTP Verification',
      text: `Your OTP for reseting  is ${otp}`,
    });
    return res.json({success:true,message:'otp sent to your email'})
  } catch (error) {
        return res.json({success:false,message:error.message})
  }
}
const resetPassword=async(req,res)=>{
  const {email,otp,newPassword}=req.body;
  if(!email || !otp || !newPassword){
    return res.json({sucess:false,message:'email,otp,and password required'})
  }
  try {
    const user=await userModel.findOne({email})
    if(!user){
      return res.json({success:false,message:'user not found'})
    }
    if(user.resetOtp===""||user.resetOtp!==otp){
      return res.json({success:false,message:"invalid otp"})
    }
    if(user.resetOtpExpireAt<Date.now()){
      return res.json({success:false,message:'otp expired'})
    }
    const hashedPassword=await bcrypt.hash(newPassword,10);
    user.password=hashedPassword;
    user.resetOtp="";
    user.resetOtpExpireAt=0;
    await user.save();
    return res.json({success:true,message:'password has been reset successfuflly'})
  } catch (error) {
    res.json({success:false,message:error.message})
  }
}
const getAllUsers=async(req,res)=>{
    try {
      const users=await userModel.find({},'name');
      res.status(200).json({success:true,users})
    } catch (error) {
      res.status(500).json({success:false,message:error.message})
    }
  }
  const updateProfile=async(req,res)=>{
    try {
      const {profilePic,bio,name}=req.body
      const userId=req.userId
      let updatedUser;
      if(!profilePic)
      {
     updatedUser = await userModel.findByIdAndUpdate(userId,{bio,name},{new:true})
      }
      else{
        const upload=await Cloudinary.uploader.upload(profilePic)
        updatedUser=await userModel.findByIdAndUpdate(userId,{profilePic:upload.secure_url,bio,name},{new:true})
      }
      res.json({success:true,user:updatedUser})
    } catch (error) {
      res.json({success:false,message:error.message})
    }
  }
module.exports = {
  register,
  login,
  logout,
  sendVerifyOtp,
  verifyEmail,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
  getAllUsers,
 updateProfile
};
