const {
  registerUser,
  loginUser,
  logoutUser,
  getMeUser,
} = require("../controllers/user.controller");

const express = require("express");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("logout", logoutUser);
router.get("/me", getMeUser);

module.exports = router;
