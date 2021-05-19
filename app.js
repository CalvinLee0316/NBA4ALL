//Require
let express = require("express");
let ejs = require("ejs");
let mongoose = require("mongoose");
let bodyParser = require("body-parser");
let fetch = require("node-fetch");
require('dotenv').config()
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')

var findOrCreate = require('mongoose-findorcreate')

//Routes
const indexRoute = require("./routes/index.js");
const sneaksRoute = require("./routes/sneaks.js");
const postsRoute = require("./routes/posts.js")
const { get } = require("./routes/index.js");

// App set up
const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

const dbUser = mongoose.createConnection(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

mongoose.set('useCreateIndex', true)

const userSchema = new mongoose.Schema({
  email: String,
  password: String
})

userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)

const User = dbUser.model('Users', userSchema)


passport.use(User.createStrategy())

passport.use(User.createStrategy())
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});


//login and register
app.get('/login', (req, res) => {
  if(req.isAuthenticated()){
    res.render('secret', {loggedin: true})
  }else{
    res.render('./login', {loggedin: false})
  }
})

app.get('/register', (req, res) => {
  if(req.isAuthenticated()){
    res.render('register', {loggedin: true})
  }else{
    res.render('./register', {loggedin: false})
  }
})

app.get('/secret', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('secret', {loggedin: true})
  } else {
    res.redirect('login')
  }
})

app.get('/fail', (req,res)=>{
  res.render('fail', {loggedin: req.isAuthenticated()})
})

app.post('/login',passport.authenticate('local', { failureRedirect: '/fail' }),
  function (req, res) {
    res.redirect('/secret');
  });

app.post('/register', (req, res) => {
  User.register({
    username: req.body.username
  }, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect('/register')
    } else {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/secret')
      })
    }
  })
})

app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})



//general
app.get("/", (req, res) => {
  res.render("home", {loggedin: req.isAuthenticated()})
})
app.get("/about", (req, res) => {
  res.render("about", {loggedin: req.isAuthenticated()})
})

app.get("/contact", (req, res) => {
  res.render("contact", {loggedin: req.isAuthenticated()})
})

app.get('/sneaks', (req, res) => {
  res.render("./shoes/shoeHome", {loggedin: req.isAuthenticated()})
})


//Routes
app.use('/index', indexRoute);
app.use('/sneaks', sneaksRoute)
app.use('/posts', postsRoute)
//Listen
let port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});