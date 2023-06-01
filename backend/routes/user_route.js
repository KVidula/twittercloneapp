const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const userModel = mongoose.model('userModel');
const tweetModel = mongoose.model('tweetModel');
const protectedRoute = require('../middleware/protectedResource');

//get single user details ***************
router.get("/user/:id",(req,res)=>{
    userModel.findOne({_id:req.params.id})
    .populate("followers", "_id")
    .populate("following", "_id")
    .then((userinfo) => {
        res.status(200).json({user:userinfo});
    })
    .catch((error) => {
        console.log(error);
    })
});


//find following ***************
router.get("/findfollowing/:id", (req,res)=>{
    userModel.find({_id:req.params.id},{following:1,_id:0})
    .then((followinginfo)=>{
       res.status(200).json({following:followinginfo});
    })
    .catch((error)=>{
       console.log(error);
    })
 });

//follow user *****************
router.put("/user/:id/follow", protectedRoute, (req,res)=>{
    //add following
    userModel.findByIdAndUpdate(req.user._id, {
        $push: { following: req.params.id }
    },{
        new: true
    },(error,result)=>{
     if(error){
        return res.status(400).json({error:error});
     }
    })
    //add follower
    userModel.findByIdAndUpdate(req.params.id, {
       $push: { followers: req.user._id }
    },{
        new: true
    }).then(result => res.json(result))
    .catch(error => {return res.status(400).json({error:error})})
});



//unfollow user *************************
router.put("/user/:id/unfollow", protectedRoute, (req,res)=>{
    //remove following
    userModel.findByIdAndUpdate(req.user._id, {
        $pull: { following: req.params.id }
    },{
        new: true
    },(error,result)=>{
     if(error){
        return res.status(400).json({error:error});
     }
    })
    //remove follower
    userModel.findByIdAndUpdate(req.params.id, {
       $pull: { followers: req.user._id }
    },{
        new: true
    }).then(result => res.json(result))
    .catch(error => {return res.status(400).json({error:error})})

});


//edit user *******************
router.put("/edituser/:id", (req,res)=>{
    const { fullName, dateofBirth, location } = req.body;
    if (!fullName || !dateofBirth || !location) {
        return res.status(400).json({ error: "one or more mandatory fields are empty" });
    }
    userModel.updateOne({_id: req.params.id},{$set:{fullName:fullName,dateofBirth:dateofBirth,location:location}})
    .then((data)=>{
        res.status(200).json({result: data});
    })
    .catch((error)=>{
        console.log(error);
    })
});


//get user tweets in profile page*************
router.get("/user/:id/tweets",(req,res)=>{
    tweetModel.find({tweetedBy:req.params.id})
    .populate('tweetedBy','fullName userName')
    .populate("retweetBy","_id fullName userName")
    .then((tweetinfo) => {
        res.status(200).json({tweets:tweetinfo});
    })
    .catch((error) => {
        console.log(error);
    })
});


//Upload user profile picture *******************
router.put("/user/:id/uploadProfilePic", (req,res)=>{
    const { image } = req.body;
    if (!image) {
        return res.status(400).json({ error: "image required here!" });
    }
    userModel.updateOne({_id: req.params.id},{$set:{profilePic:image}})
    .then((data)=>{
        res.status(200).json({result: data});
    })
    .catch((error)=>{
        console.log(error);
    })
});

module.exports = router;
