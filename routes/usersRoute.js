const router = require('express').Router();
const { getAllUsersCtrl, 
        getUsersProfileCtrl, 
        updateUsersProfileCtrl,
        getUsersCountCtrl, 
        profilePhotoUploadCtrl, 
        deleteUserProfileCtrl,
      } = require('../controllers/usersController');
const { 
      verifyTokenAndAdmin ,
       verifyTokenAndOnlyUser ,
        verifyToken,
        verifyTokenAuthorization
      } = require('../middlewares/verifyToken');
const validateObjectId = require('../middlewares/validateObjectId');
const photoUpload = require('../middlewares/photoUpload');

// /api/users/profile
router.route("/profile").get( verifyTokenAndAdmin , getAllUsersCtrl);


// /api/users/profile/:id
router.route("/profile/:id")
      .get( validateObjectId , getUsersProfileCtrl)
      .put( validateObjectId , verifyTokenAndOnlyUser , updateUsersProfileCtrl)
      .delete(validateObjectId , verifyTokenAuthorization, deleteUserProfileCtrl);

// /api/users/profile/profile-photo-upload
router.route("/profile/profile-photo-upload")
      .post(verifyToken , photoUpload.single("image") , profilePhotoUploadCtrl);

// /api/users/count
router.route("/count").get( verifyTokenAndAdmin , getUsersCountCtrl);


module.exports = router;