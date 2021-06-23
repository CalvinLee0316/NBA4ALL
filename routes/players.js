let express = require("express");
const router = express.Router();
let ejs = require("ejs");
let nodeFetch = require("node-fetch");
var bodyParser = require('body-parser');
let playerIDs = new Map();
let playerNames = new Map();

'use strict';

const fs = require('fs');

let rawdata = fs.readFileSync('players.json');
let profiles = JSON.parse(rawdata);

nodeFetch("http://data.nba.net/data/10s/prod/v1/2020/players.json").then(res=>res.json()).then(data=>{
    data.league.standard.forEach(player=>{
        playerIDs.set(player.firstName + " " + player.lastName, player.personId);
        playerNames.set(player.personId, player.firstName + " " + player.lastName);
    })
})

// let players = {}
// nodeFetch("http://data.nba.net/data/10s/prod/v1/2020/players.json").then(res=>res.json()).then(data=>{
//     data.league.standard.forEach(player=>{
//         let name = player.firstName + " " + player.lastName;
//         players[name] = {
//             firstName: player.firstName,
//             lastName: player.lastName,
//             personId: player.personId,
//             teamId: player.teamId,
//             jersey: player.jersey,
//             isActive: player.isActive,
//             pos: player.pos,
//             heightFeet: player.heightFeet,
//             heightInches: player.heightInches,
//             heightMeters: player.heightMeters,
//             weightPounds: player.weightPounds,
//             weightKilograms: player.weightKilograms,
//             dateOfBirthUTC: player.dateOfBirthUTC,
//             teamSitesOnly: player.teamSitesOnly,
//             teams: player.teams,
//             draft: player.draft,
//             nbaDebutYear: player.nbaDebutYear,
//             yearsPro: player.yearsPro,
//             collegeName: player.collegeName,
//             lastAffiliation: player.lastAffiliation,
//             country: player.country
//         }
//     })
//     const play = JSON.stringify(players);
//     fs.writeFile('players.json', play, (err) => {
//         if (err) {
//             throw err;
//         }
//         console.log("JSON data is saved.");
//     });
// })

router.get("/", (req, res)=>{
    res.render("players", {loggedin: req.isAuthenticated()});
})

router.get("/:id", (req,res)=>{
    nodeFetch(`http://data.nba.net/data/10s/prod/v1/2020/players/${req.params.id}_profile.json`).then(res=>res.json()).then(data=>{
        res.render("profile", {stats: data.league.standard.stats, loggedin: req.isAuthenticated(), profile: profiles[playerNames.get(req.params.id)]});
    })
})

router.post("/", (req, res)=>{
    let playerId = playerIDs.get(req.body.search);
    if(playerId){
        res.redirect("/players/"+playerId);
    }else{
        res.render("invalidProfile", {loggedin: req.isAuthenticated()})
    }
})



module.exports = router;