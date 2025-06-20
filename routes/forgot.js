const express = require("express");
const jwt = require("jsonwebtoken");
const nodeMailer = require("nodemailer");
const User = require("../models/user");

const router = express.Router();

//forgot-password - /get
router.get("/forgot-password", (req, res) => {
  res.render("forgot");
});

//forgot-password - /post
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.render("forgot", { error: "User not found" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const resetLink = `${process.env.BASE_URL}/reset-password/${token}`;

  //setup email
  const transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Authify Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset Your Password",
      html: `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
    <h2 style="color: #444;">Hi ${user.name || "User"},</h2>
    <p>We have received a request to reset the password for your account.</p>
    
    <p>
      <a href="${resetLink}" 
         style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px;">
         Click here to reset your password
      </a>
    </p>

    <p>Or, copy and paste the following URL into your browser:</p>
    <p style="background: #f4f4f4; padding: 10px; border-radius: 5px;">
      <a href="${resetLink}" style="color: #0645AD;">${resetLink}</a>
    </p>

    <p style="color: #888; font-size: 14px;">If you didn’t request this, you can safely ignore this email.</p>
    <p style="color: #888; font-size: 14px;">This password reset link is valid for 15 minutes.</p>

    <p style="margin-top: 30px;">Regards,<br><strong>Team Authify</strong><br><p><strong>Alakesh Boro</strong><br><strong>NIT SILCHAR</strong></p></p>
  </div>
`,
    });

    res.render("forgot", { success: "Password reset link sent to your email" });
  } catch (err) {
    console.error("Failed to send email:", err);
    res.render("forgot", {
      error: "Failed to send reset link. Please try again later.",
    });
  }
});

module.exports = router;
