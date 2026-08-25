const Joi = require('joi');

exports.signinAndsignupSchema = Joi.object({
    email : Joi.string().min(6).max(60).required().email({
        tlds : {allow : ['com' , 'net']},
    }),
    password : Joi.string().required().min(8)
})

exports.acceptCodeSchema = Joi.object({
     email : Joi.string().min(6).max(60).required().email({
        tlds : {allow : ['com' , 'net']},
    }),

    providedCode : Joi.number(),
})

exports.changePasswordSchema = Joi.object({
    newPassword : Joi.string().required(),
    oldPassword : Joi.string().required()
})

exports.acceptFPCodeSchema = Joi.object({
     email : Joi.string().min(6).max(60).required().email({
        tlds : {allow : ['com' , 'net']},
    }),

    providedCode : Joi.number(),
     newPassword : Joi.string().required()


})

exports.createPostSchema = Joi.object({
     title : Joi.string().min(6).max(60).required(),

    description : Joi.string().min(6).max(500),
    userId : Joi.string().required()


})