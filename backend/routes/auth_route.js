require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const userModel = mongoose.model("userModel");

//for register page
router.post("/auth/register", (req, res) => {
  const { fullName, email, userName, password } = req.body;
  //console.log(req.body);
  if (!fullName || !email || !userName || !password) {
    return res.status(400).json({ error: "one or more mandatory fields are empty" });
  }
  userModel.findOne({ email: email }).then((userInDB) => {
    if (userInDB) {
      return res.status(500).json({ error: "User with this email already registered!" });
    }

    //encryption for password
      bcryptjs.hash(password, 16).then((hashedPassword) => {
      const user = new userModel({fullName, email, userName, password: hashedPassword});
      user.save()
        .then((newUser) => {
          res.status(201).json({ result: "User Registered Successfully!" });
        })
        .catch((err) => {
          console.log(err);
        });
    });
  });
});

//for login page
router.post("/auth/login", (req, res) => {
  const { userName, password } = req.body;
  if (!userName || !password) {
    return res.status(400).json({ error: "one or more mandatory fields are empty" });
  }
  userModel.findOne({ userName: userName })
    .then((userInDB) => {
      if (!userInDB) {
        return res.status(401).json({ error: "Invalid Credentials" });
      }
      bcryptjs.compare(password, userInDB.password)
        .then((didMatch) => {
          if (didMatch) {
            const jwtToken = jwt.sign({_id: userInDB._id},process.env.JWT_SECRET);
            const userInfo = {"id": userInDB._id , "email": userInDB.email , "fullName": userInDB.fullName , "userName": userInDB.userName};
            res.status(200).json({ result: {token: jwtToken , user: userInfo} });
          } else {
            return res.status(401).json({ error: "Invalid Credentials" });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
