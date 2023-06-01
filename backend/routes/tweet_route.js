const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const tweetModel = mongoose.model('tweetModel');
const protectedRoute = require('../middleware/protectedResource');

//create a tweet ******************
router.post('/tweet', protectedRoute, (req,res)=>{
     const { content, image } = req.body;
     req.user.password = undefined;
     const posttweet = new tweetModel({content: content, image: image, tweetedBy: req.user._id});
     posttweet.save()
     .then((newTweet)=>{
        res.status(201).json({post: newTweet});
     })
     .catch((error)=>{
         console.log(error);
     })   
});


//find likes ***************
router.get("/findlikes/:id", (req,res)=>{
   tweetModel.find({_id:req.params.id},{likes:1,_id:0})
   .then((likesinfo)=>{
      res.status(200).json({likes:likesinfo});
   })
   .catch((error)=>{
      console.log(error);
   })
});

//like a tweet ****************
router.put("/tweet/:id/like", protectedRoute, (req,res)=>{
      tweetModel.findByIdAndUpdate(req.params.id, {
           $push: { likes: req.user._id }
         },{
         new: true  //returns updated record
         }).populate('tweetedBy','_id fullName')
           .exec((error,result)=>{
            if(error){
                return res.status(400).json({error:error});
            }else{
              res.json(result);
            }
      })   
 });


//dislike a tweet **********************
 router.put("/tweet/:id/dislike", protectedRoute, (req,res)=>{
      tweetModel.findByIdAndUpdate(req.params.id, {
        $pull: {likes : req.user._id}
      },{
        new: true
      }).populate('tweetedBy','_id fullName')
      .exec((error,result)=>{
        if(error){
            return res.status(400).json({error:error});
        }else{
            res.json(result);
        }
      })
});


//reply on a tweet ***********************
router.post('/tweet/:id/reply', protectedRoute, (req,res)=>{
    //add reply as a new tweet
    const { content } = req.body;
    req.user.password = undefined;
    const posttweet = new tweetModel({content: content, tweetedBy: req.user._id});
    posttweet.save()
    .then((newTweet)=>{
      res.status(201).json({post: newTweet});
    })
    .catch((error)=>{
        console.log(error);
    })   
  });
    //find and save new reply tweet id in parent tweet's reply array 
 router.put('/addreplyid',(req,res)=>{
    const { replyid, parentTweetid } = req.body;
    tweetModel.findByIdAndUpdate(parentTweetid, {
      $push: {replies : replyid}
    },{
      new: true
    }).populate('tweetedBy','_id fullName')
    .exec((error,result)=>{
       if(error){
          return res.status(400).json({error:error});
       }else{
          res.json(result);
       }
    }) 
 });     



//Get a single tweet detail******************
router.get("/getsingletweet/:tweetId", (req,res)=>{
    tweetModel.find({_id:req.params.tweetId})
    .populate("tweetedBy", "_id fullName userName email profilePic location dateofBirth")
    .populate("retweetBy","_id fullName userName")
    .then((tweetinfo) => {
        res.status(200).json({tweet:tweetinfo});
    })
    .catch((error) => {
        console.log(error);
    })
      
});
    


//Get all replies of tweet ***********
router.get("/getreplies/:id",(req,res)=>{
    tweetModel.find({_id:req.params.id},{replies:1,_id:0})
   .then((replyinfo) => {
      res.status(200).json({replies:replyinfo});
    })
    .catch((error) => {
        console.log(error);
    })
});


//Get all reply tweets
router.get("/getreplytweets",(req,res)=>{
  const { ids } = req.body;
  tweetModel.find({_id:ids})
 .then((replytweetinfo) => {
  res.status(200).json({replytweets:replytweetinfo});
  })
  .catch((error) => {
      console.log(error);
  })
});



//Get all tweet details **********************
router.get("/tweets",(req,res)=>{
    tweetModel.find().sort({createdAt : -1})   //descending order
    .populate("tweetedBy", "_id fullName userName email profilePic location dateofBirth")
    .populate("retweetBy","_id fullName userName")
    .then((tweetinfo) => {
        res.status(200).json({tweets:tweetinfo});
    })
    .catch((error) => {
        console.log(error);
    })
});

//delete a tweet **********************
router.delete("/tweet/:tweetId", protectedRoute ,(req,res) => {
    tweetModel.findOne({_id: req.params.tweetId})
    .populate("tweetedBy", "_id")
    .exec((error,tweetFound)=>{
      if(error || !tweetFound){
         return res.status(400).json({error : "Tweet does not exist"});
      }
      //check if the tweetedBy user is same as loggedin user only then allow deletion
      if(tweetFound.tweetedBy._id.toString() === req.user._id.toString()){
        tweetFound.remove()
         .then((data)=>{
             res.status(200).json({result : data});
         }) 
         .catch((error)=>{
             console.log(error);
         })
      }
    }) 
 });   


 // retweet
router.put("/tweet/:id/retweet", protectedRoute, (req,res)=>{
  tweetModel.updateOne({_id:req.params.id}, {$push: { retweetBy: req.user._id }})
  .then((data)=>{
    res.status(200).json({result: data});
  })
  .catch((error)=>{
      console.log(error);
  })
});



module.exports = router;
