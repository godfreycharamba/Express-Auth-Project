const express = require('express');
const router = express.Router();
const { identifier } = require('../middlewares/identification');
const { createPost, getPosts, getPost, updatePost, deletePost } = require('../controllers/postsController');

router.post('/create-post' , identifier , createPost)
router.get('/all-posts', getPosts)
router.get('/single-post', getPost)
router.put('/update-post', identifier, updatePost)
router.delete('/delete-post',identifier, deletePost)


module.exports = router