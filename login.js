const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 8000;

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const app = express();

const db = require("./models");
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN,
    credentials: true
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const isAuthenticated = (req, res, next) => {
  const token = req.cookies.Authorization.replace(/^Bearer /, "");
  console.log(token);
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ success: false, message: "Expired Token" });
      } else {
        const { userName, email } = decoded;
        return res.status(200).json({ success: true, userName, email });
      }
    });
  }
};

app.post("/auth", async (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    try {
      const user = await db.User.findOne({ where: { userName: username } });
      const validPassword = await user.validPassword(password);
      if (validPassword) {
        const { userName, email } = user;
        const token = jwt.sign({ userName, email }, process.env.JWT_SECRET, {
          expiresIn: "1h"
        });

        res
          .cookie("Authorization", `Bearer ${token}`, {
            httpOnly: true
          })
          .json({ success: true, userName, email });
      }
    } catch (err) {
      res
        .status(401)
        .json({ success: false, message: "Invalid username and/or password." });
    }
  } else {
    res
      .status(401)
      .json({ success: false, message: "Missing username or password." });
  }
});

app.get("/validate", isAuthenticated);

app.get("/logout", (req, res) => {
  req.session.destroy(function() {
    res.redirect("/");
  });
});

app.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});
