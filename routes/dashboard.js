const express = require("express");
const requireAuth = require("../middlewares/requireAuth");
const User = require("../models/user");
const router = express.Router();

router.get("/dashboard", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.render("dashboard", { user });
  } catch {
    console.error("Dashboard error:", err);
    res.redirect("/login");
  }
});

module.exports = router;
