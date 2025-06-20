# Authify – Authentication System with Email OTP Verification

A complete backend authentication system using Node.js, Express, MongoDB, and EJS, featuring secure user signup, login, email verification via OTP, and password reset.

This project is built primarily for backend development practice and demonstration. Frontend templates are rendered using EJS and styled with HTML5, CSS, Bootstrap, and JavaScript.

---

## Features

- User signup with email OTP verification
- Login with session and token (JWT) support
- Passwords securely hashed using bcrypt
- Protected routes with custom middleware
- Forgot password functionality with email reset link
- Logout and token/session invalidation
- Environment-based configuration using `.env`

---

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT (jsonwebtoken)
- bcrypt
- express-session
- cookie-parser
- dotenv
- Nodemailer
- ES6 features (async/await, modules, destructuring, etc.)

### Frontend (Basic)

- EJS templating
- HTML5
- CSS3
- Bootstrap 5
- JavaScript (vanilla)

---

## Project Structure

authify/
├── models/
├── routes/
│ ├── auth.js
│ ├── forgot.js
│ ├── reset.js
│ └── dashboard.js
├── middlewares/
│ └── requireAuth.js
├── views/
│ ├── login.ejs
│ ├── signup.ejs
│ ├── dashboard.ejs
│ ├── forgot.ejs
│ └── reset-password.ejs
├── public/
│ └── css/
│ └── style.css
├── server.js
└── .env (not committed)
