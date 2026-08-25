const transport = require('../middlewares/sendMail');
const { signinAndsignupSchema, acceptCodeSchema, changePasswordSchema, acceptFPCodeSchema } = require('../middlewares/validator');
const User = require('../models/usersModel');
const { doHash, doHashValidation, hmacProcess } = require("../utils/hashing");
const jwt = require('jsonwebtoken');

exports.signup = async (req , res) =>{
    const {email,password} = req.body;
    try
    {
    
     const {error , value} = signinAndsignupSchema.validate({email , password})
    
    if(error){
        return res.status(400).json({success : false , message : error.details[0].message})
    }

    const existingUser = await User.findOne({email});

    if(existingUser){
        return res.status(400).json({success : false , message : "User already exists"})
    }

    const hashedPassword = await doHash(password , 12);

    const newUser = new User({
        email,
        password : hashedPassword,
    })

    const result = await newUser.save()
    result.password = undefined

    return res.status(201).json({success : true , message : "Your account has been created successfully" , data : result})

    }
    catch(error){
        console.log(error)
    }
}

exports.signin = async (req , res) => {
    const {email , password} = req.body;

    try{
       const {error , value} = signinAndsignupSchema.validate({email , password});

       if(error){
        return res.satus(400).json({success : false , message : error.details[0].message});
       }

       const existingUser = await User.findOne({email}).select('+password')

       if(!existingUser){
        return res.status(404).json({success : false , message : "User does not exist"})
       }

       const result = await doHashValidation(password , existingUser.password)

       if(!result){
        return res.status(401).json({success:false , message : "Invalid email or password"})
       }

       const token = jwt.sign({
          userId: existingUser._id,
          email: existingUser.email , 
          verified: existingUser.verified
       } , process.env.TOKEN_SECRET , {expiresIn : '8h'})

       res.cookie('Authorization', 'Bearer ' + token , {expires : new Date(Date.now() + 8 * 3600000) , 
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production'
    
    }).json({
        success: true ,
        message : "Logged in successfully" , 
        token
       
    })
    }

    catch(error){
        console.log(error);
    }
}

exports.signout = async (req , res) =>{
    res.clearCookie('Authorization').status(200).json({success: true , message: "Logged out successfully"})
}

exports.sendVerificationCode = async(req , res) => {
    const {email} = req.body;
    try{
        const existingUser = await User.findOne({email})

        if(!existingUser){
            return res.status(404).json({success:false , message: "User not found"})
        }

        if(existingUser.verified){
            return res.status(400).json({success: false , message: "You are already verified"})
        }

        const codeValue = Math.floor(Math.random() * 1000000).toString();
        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject:"Verication Code",
            html: '<h1>' + codeValue + '</h1>'
        })

        if(info.accepted[0]=== existingUser.email ){
            const hashedCodeValue = hmacProcess(codeValue , process.env.HMAC_VERIFICATION_CODE_SECRET)
            existingUser.verificationCode = hashedCodeValue;
            existingUser.verificationCodeValidation = Date.now();
            await existingUser.save()
            return res.status(200).json({success:true , message: "Code Sent"})
        }
       return res.status(400).json({success:false , message: "Code sending failed"})
    }
    catch(error){
        console.log(error)
    }
}

exports.verifyVerificationCode = async (req , res) => {
    const {email , providedCode} = req.body;
    try{
       const {error , value} = acceptCodeSchema.validate({email , providedCode});

       if(error){
        return res.satus(400).json({success : false , message : error.details[0].message});
       } 
       
       const codeValue = providedCode.toString()
       const existingUser = await User.findOne({email}).select("+verificationCode +verificationCodeValidation")

       if(!existingUser){
        return res.status(400).json({success:false , message: "User does not exist"})
       }

       if(existingUser.verified){
        return res.status(400).json({success:false, message: "You are already verified"})
       }

       if(!existingUser.verificationCode || !existingUser.verificationCodeValidation){
        return res.status(400).json({success:false , message: "You did not request a verication code"})
       }

       if(Date.now() - existingUser.verificationCodeValidation > 5 * 50 * 1000){
        return res.status(400).json({success: false , message: "The code has been expired"})
       }

       const hashedCodeValue = hmacProcess(codeValue , process.env.HMAC_VERIFICATION_CODE_SECRET);

       if(hashedCodeValue === existingUser.verificationCode){
         existingUser.verified = true;
         existingUser.verificationCode = undefined;
         existingUser.verificationCodeValidation = undefined;
         await existingUser.save()
         return res.status(200).json({success:true , message: "Your account has been verified"})
       }

       return res.status(400).json({success: true , message: "An unexpected error occured"})

    }
    catch(error){
        console.log(error)
    }
}

exports.changePassword = async (req , res) => {
    const {userId , verified} = req.user;
    const {oldPassword , newPassword} =  req.body;
    try{
       const {error , value} = changePasswordSchema.validate({oldPassword , newPassword})

       if(error){
        return res.satus(400).json({success : false , message : error.details[0].message});
       }

       if(!verified){
        return res.satus(401).json({success : false , message : "You are not verified"});
       }

       const existingUser = await User.findOne({_id: userId}).select('+password');

       if(!existingUser){
        return res.satus(404).json({success : false , message : "User does not exist"});
       }

       const result = await doHashValidation(oldPassword , existingUser.password);
       if(!result){
          return res.satus(400).json({success : false , message : "Invalid credentials"});
       }

       const hashedPassword = await doHash(newPassword , 12);

       existingUser.password = hashedPassword ;
       await existingUser.save();

       return res.status(200).json({success: true , message : "Password changed successfully"})
    }

    catch(error){

        console.log(error)
    }
}

exports.sendForgotPasswordCode = async(req , res) => {
    const {email} = req.body;
    try{
        const existingUser = await User.findOne({email})

        if(!existingUser){
            return res.status(404).json({success:false , message: "User not found"})
        }

       
        const codeValue = Math.floor(Math.random() * 1000000).toString();
        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject:"Forgot Password Code",
            html: '<h1>' + codeValue + '</h1>'
        })

        if(info.accepted[0]=== existingUser.email ){
            const hashedCodeValue = hmacProcess(codeValue , process.env.HMAC_VERIFICATION_CODE_SECRET)
            existingUser.forgotPasswordCode = hashedCodeValue;
            existingUser.forgotPasswordCodeValidation = Date.now();
            await existingUser.save()
            return res.status(200).json({success:true , message: "Code Sent"})
        }
       return res.status(400).json({success:false , message: "Code sending failed"})
    }
    catch(error){
        console.log(error)
    }
}

exports.verifyForgotPasswordCode = async (req , res) => {
    const {email , providedCode , newPassword} = req.body;
    try{
       const {error , value} = acceptFPCodeSchema.validate({email , providedCode , newPassword});

       if(error){
        return res.satus(400).json({success : false , message : error.details[0].message});
       } 
       
       const codeValue = providedCode.toString()
       const existingUser = await User.findOne({email}).select("+forgotPasswordCode +forgotPasswordCodeValidation")

       if(!existingUser){
        return res.status(400).json({success:false , message: "User does not exist"})
       }

       if(!existingUser.forgotPasswordCode || !existingUser.forgotPasswordCodeValidation){
        return res.status(400).json({success:false , message: "You did not request a forgot password code"})
       }

       if(Date.now() - existingUser.forgotPasswordCodeValidation > 5 * 50 * 1000){
        return res.status(400).json({success: false , message: "The code has been expired"})
       }

       const hashedCodeValue = hmacProcess(codeValue , process.env.HMAC_VERIFICATION_CODE_SECRET);

       if(hashedCodeValue === existingUser.forgotPasswordCode){
        const hashedPassword = await doHash(newPassword , 12);
        existingUser.password = hashedPassword;
         existingUser.forgotPasswordCode = undefined;
         existingUser.forgotPasswordCodeValidation = undefined;
         await existingUser.save()
         return res.status(200).json({success:true , message: "Your password has been changed successfully"})
       }

       return res.status(400).json({success: true , message: "An unexpected error occured"})

    }
    catch(error){
        console.log(error)
    }
}