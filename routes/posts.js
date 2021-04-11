let express = require("express");
const router = express.Router();
let ejs = require("ejs");
let mongoose = require("mongoose");
let bodyParser = require("body-parser");


let dbPost = mongoose.createConnection(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const postSchema = new mongoose.Schema({
    author: String,
    title: String,
    body: String,
    comments: [{ type: String }],
    date: Date
})


const Post = dbPost.model('Posts', postSchema)

router.get('/new', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('newPost')
    } else {
        res.redirect('/login');
    }
})

router.post('/new', (req, res) => {
    // create post on database
    if(req.isAuthenticated){
        const post = new Post({
            author: req.user.username,
            title: req.body.title,
            body: req.body.body,
            date: Date.now(),
            comments: []
        })
        post.save();
        res.redirect("/posts/1");
    }else{
        res.redirect('/login');
    }
    
})

router.get('/:page', (req, res) => {
    const page = req.params.page
    const skip = (page - 1) * 10
    const next = parseInt(page) + 1
    Post.find({}).skip(skip).limit(10).then((posts) => {
        if (posts.length == 0) {
            res.render('noPosts');
        } else {
            res.render('postHome',
                {
                    posts: posts,
                    next: next
                })
        }
    })
})

router.get('/post/:id', (req, res) => {
    Post.findById(req.params.id).then((post) => {
        res.render('post', { post })
    })
})




module.exports = router;