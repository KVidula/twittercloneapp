require("dotenv").config();
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
const userModel = mongoose.model('userModel');

module.exports = (req, res, next) => {
    const {authorization} = req.headers;
    
    if(!authorization){
        return res.status(401).json({error: "User not logged in"});
    }
    const token = authorization.replace("Bearer ", "");
    jwt.verify(token, process.env.JWT_SECRET, (error,payload)=>{
        if(error){
            return res.status(401).json({error: "User not logged in!"});
        }
        const {_id} = payload;
        userModel.findById(_id)
        .then((dbUser)=>{
            req.user = dbUser;
            next(); //goes to the next middleware or goes to the REST API
        })
    });
}