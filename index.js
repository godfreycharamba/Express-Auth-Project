const express = require('express');
const helmet = require('helmet');

const cors = require('cors');
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose');

const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "1.1.1.1"
]);


const app = express();

app.use(express.json())
app.use(cors())
app.use(helmet())
app.use(cookieParser())
app.use(express.urlencoded({extended:true}))
const authRouter = require('./routers/authRouter')
const postRouter = require('./routers/postRouter')

mongoose.connect(process.env.MONGODB_URI).then(()=>{
    console.log("Connected the database")
}).catch((err) =>{
    console.log(err)
})

app.use('/api/auth' , authRouter)
app.use('/api/posts' , postRouter)

app.get('/', (req, res) => {
    res.status(200).json({message : "Hello from the server"})
})

app.listen(process.env.PORT , ()=>{
    console.log("listening")
})
