const asyncHandler = require("express-async-handler");
const { User, validateUpdateUser } = require("../models/User");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const {
     cloudinaryUploadImage, 
     cloudinaryRemoveImage,
     cloudinaryRemoveMultipleImage
  } = require("../utils/cloudinary");
const { Comment } = require("../models/Comment")
const { Post } = require("../models/Post")

/**--------------------------------------------------------------------------------
 * @desc    Get All Users Profile
 * @route   /api/users/profile
 * @method  Get
 * @access  private (only for admin)
 *---------------------------------------------------------------------------------*/

module.exports.getAllUsersCtrl = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password").populate("posts");
    res.status(200).json(users);
});


/**--------------------------------------------------------------------------------
 * @desc    Get Users Profile
 * @route   /api/users/profile/:id
 * @method  Get
 * @access  public
 *---------------------------------------------------------------------------------*/

module.exports.getUsersProfileCtrl = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password").populate("posts");
    if (!user) {
        return res.status(404).json({ message : "User not found"});
    }

    res.status(200).json(user);
});


/**--------------------------------------------------------------------------------
 * @desc    Update Users Profile
 * @route   /api/users/profile/:id
 * @method  Get
 * @access  private (only user himself)
 *---------------------------------------------------------------------------------*/

// Validation function for updating user profile
module.exports.updateUsersProfileCtrl = asyncHandler(async (req, res) => {
    const { error} = validateUpdateUser(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    //check-change-password
    if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    //update user for id
    const updatedUser = await User.findByIdAndUpdate(req.params.id,{
         $set: {
            username: req.body.username,
            password: req.body.password,
            bio: req.body.bio,
         }
    }, { new: true }).select("-password");

    res.status(200).json(updatedUser);
});


/**--------------------------------------------------------------------------------
 * @desc    Get Users Count
 * @route   /api/users/Count
 * @method  Get
 * @access  private (only for admin)
 *---------------------------------------------------------------------------------*/

module.exports.getUsersCountCtrl = asyncHandler(async (req, res) => {
    const count = await User.countDocuments();
    res.status(200).json(count);
});



/**--------------------------------------------------------------------------------
 * @desc    Profile Photo Upload
 * @route   /api/users/profile/profile-photo-upload
 * @method  Post
 * @access  private (only logged in user)
 *---------------------------------------------------------------------------------*/

module.exports.profilePhotoUploadCtrl = asyncHandler(async (req, res) => {
    // 1.Validation
    if (!req.file) {
        return res.status(400).json({ message: "no file provided" });
    }

    // 2. Get the path to the image
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
    // 3. Upload to cloudinary
    const result = await cloudinaryUploadImage(imagePath);
    console.log(result);

    // 4. Get the user id from DB
    const user = await User.findById(req.user.id);

    // 5. Delete the old profile photo if exists
    if (user.profilePhoto.publicId !== null) {
        await cloudinaryRemoveImage(user.profilePhoto.publicId); 
    }

    // 6. change the profilephoto field in the DB
user.profilePhoto = {
    url : result.secure_url,
    publicId : result.public_id
}
await user.save();

    // 7. Send the response
    res.status(200).json({ message: "your Profile photo uploaded successfully",
    profilePhoto: { url: result.secure_url , publicId: result.public_id }
     });

    // 8.Remove image from the server
    fs.unlinkSync(imagePath);
});


/**--------------------------------------------------------------------------------
 * @desc    Delete User Profile (Account)
 * @route   /api/users/profile/:id
 * @method  Delete
 * @access  private (only admin or user himself)
 *---------------------------------------------------------------------------------*/

module.exports.deleteUserProfileCtrl = asyncHandler(async (req, res) => {
    // 1. Get the user from DB
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    // 2. Get all posts from DB
    const posts = await Post.find({ user: user._id});

    // 3. Get the public ids from the posts
    const PublicIds = posts?.map((post) => post.image.publicId);

    // 4. Delete all posts image from cloudinary that belong to this user
    if(PublicIds?.length > 0) {
        await cloudinaryRemoveMultipleImage(PublicIds);
    }

    // 5. Delete the profile picture from cloudinary
    await cloudinaryRemoveImage(user.profilePhoto.publicId);

    //6. Delete user posts & comments
    await Post.deleteMany({ user: user._id});
    await Comment.deleteMany({ user: user._id});

    // 7. Delete the user himself
    await User.findByIdAndDelete(req.params.id);

    // 8. Send a response to the client
    res.status(200).json({ message: "your profile has been deleted" });
});