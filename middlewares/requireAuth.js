const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const token = req.cookies.jwt;

  if (!token) {
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    console.log(req.user.email);

    next();
  } catch (err) {
    res.redirect("/login");
  }
}

module.exports = requireAuth;
