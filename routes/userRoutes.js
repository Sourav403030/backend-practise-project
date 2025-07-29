const registerUser = require("../controllers/userController");
const router = require("express").Router();

router.route("/register").post(registerUser); // Route for user registration





module.exports = router; // Export the router for use in other files