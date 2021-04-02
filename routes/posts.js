let express = require("express");
const router = express.Router();
let ejs = require("ejs");
let mongoose = require("mongoose");
let bodyParser = require("body-parser");


let dbPost = mongoose.createConnection('mongodb://localhost:27017/hoopPost', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const postSchema = new mongoose.Schema({
    author: String,
    title: String,
    body: String,
    comments: [{type:String}],
    date: Date
  })

const Post = dbPost.model('Posts', postSchema)

router.get('/', (req,res)=>{
    Post.find({}).then((posts)=>{
        res.render('postHome', { posts: posts})
    })
})

router.get('/:id', (req,res)=>{
    Post.findById(req.params.id).then((post)=>{
        console.log(post)
        res.render('post', {post})
    })
})

router.get('/new', (req,res)=>{
    res.render('newPost')
})

router.post('/new', (req,res)=>{
    // create post on database
})


module.exports = router;