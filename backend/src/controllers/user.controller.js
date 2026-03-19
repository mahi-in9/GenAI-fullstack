const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Users = require("../models/user");
const tokenBlacklist = require("../models/blacklist");

async function registerUser(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });

    const findUser = await Users.findOne({
      $or: [{ username }, { email }],
    });

    if (findUser)
      return res.status(400).json({
        success: false,
        message: "User already exist with this email or username",
      });

    const hashPassword = await bcrypt.hash(password, 10);

    const user = Users.create({
      username,
      email,
      password: hashPassword,
    });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("token", token);

    res.status(201).json({
      success: true,
      message: "user created successfully",
      user: {
        id: user._id,
        username: user.username,
        email: (await user).email,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "server error", error: error.message });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.cookie("token", token);
    res.status(200).json({
      success: true,
      message: "User loggedIn successfully.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "server error", error: error.message });
  }
}

async function logoutUser(req, res) {
  try {
    const token = req.cookies.token;

    if (token) {
      await tokenBlacklist.create({ token });
    }
    res.clearCookie("token");
    res
      .status(200)
      .json({ success: true, message: "user logged out successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "server error", error: error.message });
  }
}

async function getMeUser(req, res) {
  try {
    const user = await Users.findById(req.user.id);

    res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "server error", error: error.message });
  }
}

module.exports = { registerUser, loginUser, logoutUser, getMeUser };
