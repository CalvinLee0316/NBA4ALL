let express = require("express");
const router = express.Router();
let ejs = require("ejs");
let nodeFetch = require("node-fetch");


router.get("/:id", (req,res)=>{
    nodeFetch(`http://data.nba.net/data/10s/prod/v1/2020/players/${req.params.id}_profile.json`).then(res=>res.json()).then(data=>{
        console.log(data.league.standard.stats)
        res.render("profile", {stats: data.league.standard.stats, loggedin: req.isAuthenticated()});
    })
})




module.exports = router;