const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
    fullName : {
      type: String,
      required: true
    },
    userName : {
      type: String,
      required: true
    },
    email : {
        type: String,
        required: true
    },
    password : {
        type: String,
        required: true
    },
    profilePic : {
        type: String
    },
    location : {
        type: String
    },
    dateofBirth : {
        type: Date
    },
    followers : [
        {
            type: ObjectId,
            ref: "userModel"
        }
    ],
    following : [
        {
            type: ObjectId,
            ref: "userModel"
        }
    ]
}, { timestamps: true }
);

mongoose.model("userModel", userSchema);