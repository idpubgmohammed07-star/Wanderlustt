const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");

const userController = require("../controllers/user.js");

// User - Sign up routes
router.get("/signup", userController.signupForm);

router.post("/signup", userController.signupcb );

// User - Login routes
router.get("/login", userController.loginForm);

router.post("/login", passport.authenticate(
    'local',
    {failureRedirect : '/login' , failureFlash : true}),
    userController.logincb
    );

//Logout route
router.get("/logout", userController.logout);


module.exports = router;