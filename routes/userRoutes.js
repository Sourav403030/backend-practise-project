const User = require("../controllers/userController");
const verifyJWT = require("../middlewares/authMiddleware");
const router = require("express").Router();
const upload = require("../middlewares/multer");


router.route("/register").post(
    upload.fields([
        {name: "avatar", maxCount: 1},
        {name: "coverImage", maxCount: 1}
    ]),
    User.registerUser); // Route for user registration

router.route("/login").post(User.loginUser); // Route for user login

//secured routes

router.route("/logout").post(verifyJWT, User.logoutUser); // Route for user logout
router.route("/refresh-token").post(User.refreshAccessToken); // Route for refreshing access token



module.exports = router; // Export the router for use in other files