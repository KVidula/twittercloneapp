const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types;

const tweetSchema = new mongoose.Schema({
    content : {
        type: String,
        required: true
    },
    tweetedBy : {
        type: ObjectId,
        ref: "userModel"
    },
    likes : [
        {
            type: ObjectId,
            ref: "userModel"
        }
    ],
    retweetBy : [
        {
            type: ObjectId,
            ref: "userModel"
        }
    ],
    replies : [
        {
            type: String
        }
    ],
    image : {
        type: String
    }
}, { timestamps: true }
);

mongoose.model("tweetModel",tweetSchema);