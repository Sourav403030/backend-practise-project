const registerUser = require("../controllers/userController");
const router = require("express").Router();
const upload = require("../middlewares/multer");

router.route("/register").post(
    upload.fields([
        {name: "avatar", maxCount: 1},
        {name: "coverImage", maxCount: 1}
    ]),
    registerUser); // Route for user registration





module.exports = router; // Export the router for use in other files