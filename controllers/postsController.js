const { createPostSchema } = require('../middlewares/validator');
const Post = require('../models/postsModel')

exports.getPosts = async (req , res) =>{
    const {page} = req.query;
    const postsPerPage = 10;

    try{
      let pageNum = 0;

      if(page <= 1){
        pageNum = 0
      }
      else{
        pageNum = page - 1;
      }

      const result = await Post.find().sort({createdAt:-1}).skip(pageNum * postsPerPage).limit(postsPerPage).populate({
        path: 'userId',
        select: 'email'
      })

      return res.status(200).json({success:true , message: "Posts retrieved successfully" , data: result})

    }

    catch(error){
        console.log(error)
    }
    
}

exports.getPost = async (req , res) =>{
    const {_id} = req.query;

    try{
        const result = await Post.findOne({_id}).populate({
            path: 'userId',
            select: 'email'
        })

        if(!result){
            return res.status(404).json({success: false, message: "Post not found"})
        }

        return res.status(200).json({success: true , message: "Post rtrieved successfully" , data : result})

    }

    catch(error){
        console.log(error)
    }
}

exports.createPost = async (req , res) =>{
   const {title , description} = req.body;
   const {userId} = req.user;
   try{
       const {error , value} = createPostSchema.validate({title , description , userId});
      
        if(error){
              return res.status(400).json({success : false , message : error.details[0].message});
             } 

        const result = await Post.create({
            title,
            description,
            userId
        })
        return res.status(201).json({success: true , message: "Post created successfully" , data: result})     
   } 

   catch(error){
    console.log(error)
   }
}

exports.updatePost = async (req , res) =>{
   const {_id} = req.query;
   const {title , description} = req.body;
   const {userId} = req.user
   
   try{
      const {error , value} = createPostSchema.validate({title , description , userId});
      
        if(error){
              return res.status(400).json({success : false , message : error.details[0].message});
             }
             
       const existingPost = await Post.findOne({_id});
       if(!existingPost){
        return res.status(404).json({success: false , message: "Post not found"})
       }  
       
       if(existingPost.userId.toString() !== userId){
        return res.status(403).json({success: false , message: "Unauthorized"})
       }

    existingPost.title = title;
    existingPost.description = description;
    const result = await existingPost.save();
    return res.status(200).json({success:true , message: "Updated" , data: result})
   }

   catch(error){
    console.log(error)
   }
}

exports.deletePost = async (req , res) =>{
    const {_id} = req.query;
  
   const {userId} = req.user

   try{
      
    const existingPost = await Post.findOne({_id});
      
    if(!existingPost){
        return res.status(404).json({success:false , message: "Post not found"})
      }
    
    if(existingPost.userId.toString() !== userId){
        return res.status(403).json({success: false , message: "Unauthorized"})
       }

    await Post.deleteOne({_id});
    
    return res.status(200).json({success: true , message: "Post deleted"})

   }

   catch(error){
    console.log(error);
   }
}