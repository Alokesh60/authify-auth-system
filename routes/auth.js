const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const express = require("express");
const nodeMailer = require("nodemailer");
const router = express.Router();
const User = require("../models/user");

//sendOtp
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  //send email
  const transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `Authify <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      html: `<h3>Your OTP is: ${otp}</h3>It expires in 5 minutes.`,
    });

    //store otp in sessions
    req.session.otp = otp;
    req.session.email = email;
    req.session.otpExpires = Date.now() + 5 * 60 * 1000;
    req.session.otpsent = true;

    return res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.error("Failed to send OTP:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again.",
    });
  }
});

//signup handling using post
router.post("/signup", async (req, res) => {
  const { name, email, password, confirmPassword, otp } = req.body;

  // validation
  if (!name || !email || !password || !confirmPassword || !otp) {
    return res.render("signup", {
      error: "All fields are required including OTP",
    });
  }

  if (password !== confirmPassword) {
    return res.render("signup", {
      error: "Passwords do not match",
    });
  }

  //otp and email match verification
  if (
    !req.session.otp ||
    !req.session.email ||
    !req.session.otpExpires ||
    otp !== req.session.otp ||
    email !== req.session.email
  ) {
    return res.render("signup", {
      error: "Invalid or expired OTP",
    });
  }

  if (Date.now() > req.session.otpExpires) {
    return res.render("signup", {
      error: "OTP has expired. Please request a new one.",
    });
  }

  try {
    //check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("signup", {
        error: "User already exists.Try logging in.",
      });
    }

    //hashing password
    const hashedPassword = await bcrypt.hash(password, 10);

    //Saving the new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    req.session.otp = null;
    req.session.email = null;
    req.session.otpsent = false;
    req.session.otpExpires = null;

    return res.redirect("/login");
  } catch (err) {
    console.error("Signup error:", err);

    return res.render("signup", {
      error: "An error occured during signup. Please try again.",
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.render("login", {
        error: "User doesn't exist",
      });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.render("login", {
        error: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: existingUser._id,
        email: existingUser.email,
        name: existingUser.name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.cookie("jwt", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (err) {
    // console.log("Login failed: ", err);
    res.render("login", { error: "Login failed. Try again!" });
  }
});

//Logout Route
router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/login");
});

module.exports = router;
