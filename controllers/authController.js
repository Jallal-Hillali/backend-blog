const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { User, validateRegisterUser ,validateLoginUser} = require("../models/User");

/**--------------------------------------------------------------------------------
 * @desc    Register New User
 * @route   /api/auth/register
 * @method  POST
 * @access  public
 *---------------------------------------------------------------------------------*/

//validation
 module.exports.registerUserCtrl = asyncHandler(async (req, res) => {
    const { error } = validateRegisterUser(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }    

    //is user already exists
    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.status(400).json({ message: "User already exists" });
    }

     //hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //new user and save it to Db

    user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
    });
    await user.save();


    
    //@todo -sending email (verify account)


    //send a response to client
    res.status(201).json({ message: "You registered successfully, please login" })

 });


 /**--------------------------------------------------------------------------------
 * @desc    Login User
 * @route   /api/auth/register
 * @method  POST
 * @access  public
 *---------------------------------------------------------------------------------*/ 


//1 .validation
module.exports.loginUserCtrl = asyncHandler(async (req, res) => {
    const { error } = validateLoginUser(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }    


//2 .is user exists
const user = await User.findOne({ email: req.body.email });
if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
}

//3 .check the password
const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
if (!isPasswordMatch) {
    return res.status(400).json({ message: "Invalid email or password" });
}


    //@todo -sending email (verify account if not verified)


//4 .generate token(jwt)
const token= user.generateAuthToken();

res.status(200).json({
    _id: user._id,
    isAdmin: user.isAdmin,
    profilePhoto: user.profilePhoto,
    token,
}); 

//5 .response to client

});