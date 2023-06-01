require("dotenv").config();
const express = require('express');
const app = express();
const PORT = 4000;
const cors = require('cors');
const mongoose = require('mongoose');

global.__basedir = __dirname; //basedir is a global variable,it holds the path of this folder

mongoose.connect(process.env.MONGODB_URL);

mongoose.connection.on('connected',() =>{
    console.log("DB Connected!");
})

mongoose.connection.on('error',(error)=>{
    console.log("Some error while connecting to DB!");
})

app.use(cors());
app.use(express.json());


require('./models/user_model');
require('./models/tweet_model');

const authRouter = require('./routes/auth_route');
app.use('/api', authRouter);

const tweetRouter = require('./routes/tweet_route');
app.use('/api', tweetRouter);

const userRouter = require('./routes/user_route');
app.use('/api', userRouter);

const fileRouter = require('./routes/file_route');
app.use('/api', fileRouter);


//require('./routes/user_route');
//require('./routes/tweet_route');
//require('./routes/file_route');

///////////////////for showing images
////app.use("/files",express.static('files'));
// app.use(cors({
//     origin: 'http://localhost:3000'
// }));

// const path="http://localhost:4000";
// app.use('/static', express.static(path.join(__dirname, 'public')));




// app.get('/welcome',(req,res)=>{
//     res.status(200).json({'msg':'Hello World!'});
// });

app.listen(PORT,()=>{
    console.log('Server Started!');
});
