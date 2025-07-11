const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const User = require("./models/user");
const requireAuth = require("./middlewares/requireAuth");
const authRoutes = require("./routes/auth");
const dashboard = require("./routes/dashboard");
const resetRoutes = require("./routes/reset");
const forgotRoutes = require("./routes/forgot");
const MongoStore = require("connect-mongo");

dotenv.config();
const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
    }),
    cookie: { maxAge: 600000 },
  })
);

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

//connect to mongodb
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

//routes
app.use(authRoutes);
app.use("/", dashboard);
app.use("/", resetRoutes);
app.use("/", forgotRoutes);

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});
app.get("/", (req, res) => res.redirect("/signup"));
app.get("/signup", (req, res) => res.render("signup"));
app.get("/login", (req, res) => {
  const successMessage = req.query.success
    ? "Your password has been changed successfully. Please log in."
    : null;
  res.render("login", { error: null, success: successMessage });
});

//Server
app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
