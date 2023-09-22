const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const users = require("../controllers/users");
const helpers = require("../utils/helpers");

router
  .route("/register")
  .get(users.renderRegister)
  .post(catchAsync(users.register));

// verify route
router.get("/verify/token", catchAsync(users.verifyFromEmail));

// resend token route
router.post("/resend-token", catchAsync(users.newVerificationToken));

router
  .route("/login")
  .get(users.renderLogin)
  .post(
    catchAsync(helpers.checkIfNotVerified),
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login
  );

router.get("/logout", users.logout);

module.exports = router;
