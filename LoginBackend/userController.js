const userModel = require("./userModel");

const getuserData = async(req, res) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId).select('-password');  
        if(!user){
            return res.json({success: false, message: 'User not found'})
        }
         const userData = {
            _id: user._id, 
            name: user.name,
            email: user.email,
            isAccountVerified: user.isAccountVerified,
            profilePic: user.profilePic || "",
            bio: user.bio || ""
        };
        res.json({
            success: true,
            userData: userData
        })
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

module.exports = getuserData;