const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const User = require("../models/user");

const router = express.Router();

//reset-password get
router.get("/reset-password/:token", (req, res) => {
  const token = req.params.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.render("reset-password", { token });
  } catch (err) {
    console.error("Token error:", err.message);
    res.render("reset-password", {
      token: null,
      error: "Link expired or invalid",
    });
  }
});

//reset-password post
router.post("/reset-password/:token", async (req, res) => {
  const { password, confirmPassword } = req.body;
  const token = req.params.token;

  if (password !== confirmPassword) {
    return res.render("reset-password", {
      token,
      error: "Passwords do not match",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    const user = await User.findById(decoded.id);

    // Send confirmation email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Authify Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your Password Has Been Changed",
      html: `
      <div style="font-family: Arial; color: #333; padding: 20px;">
        <h2>Password Changed Successfully</h2>
        <p>Hi <strong>${user.name || "User"}</strong>,</p>
        <p>This is to inform you that your password was successfully updated.</p>
        <p>If you didn’t do this, please reset your password again immediately or contact support.</p>
        <p style="color: #888; font-size: 14px;">— Team Authify</p>
      </div>
    `,
    });
    res.redirect("/login?success=1");
  } catch (err) {
    console.error("Reset password error:", err);
    res.render("reset-password", {
      token: null,
      error: "Link expired or invalid",
    });
  }
});

module.exports = router;
