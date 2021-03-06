let express = require("express");
let router = express.Router();
let nodeFetch = require("node-fetch");
let moment = require('moment-timezone')

const logos = new Map([
  ["ATL", "/logos/ATL.png"],
  ["BOS", "/logos/BOS.png"],
  ["BKN", "logos/BKN.png"],
  ["CHA", "/logos/CHA.png"],
  ["CHI", "/logos/CHI.png"],
  ["CLE", "/logos/CLE.png"],
  ["DAL", "/logos/DAL.png"],
  ["DEN", "/logos/DEN.png"],
  ["DET", "/logos/DET.png"],
  ["GSW", "/logos/GSW.png"],
  ["IND", "/logos/IND.png"],
  ["HOU", "/logos/HOU.png"],
  ["LAC", "/logos/LAC.png"],
  ["LAL", "/logos/LAL.png"],
  ["MEM", "/logos/MEM.png"],
  ["MIA", "/logos/MIA.png"],
  ["MIL", "/logos/MIL.png"],
  ["MIN", "/logos/MIN.png"],
  ["NOP", "/logos/NOP.png"],
  ["NYK", "/logos/NYK.png"],
  ["OKC", "/logos/OKC.png"],
  ["ORL", "/logos/ORL.png"],
  ["PHI", "/logos/PHI.png"],
  ["PHX", "/logos/PHX.png"],
  ["POR", "/logos/POR.png"],
  ["SAS", "/logos/SAS.png"],
  ["TOR", "/logos/TOR.png"],
  ["UTA", "/logos/UTA.png"],
  ["WAS", "/logos/WAS.png"],
  ["SAC", "/logos/SAC.png"]
])

router.get("/", (req, res) => {
  res.redirect("/index/scores")
});



//live scores, scores for today
router.get("/scores", (req, res) => {
  //add live games
  var today = moment().tz('America/Los_Angeles');
  today = today.format("YYYYMMDD")
  res.redirect(`/index/calendar/${today}`)
});

//for calendar feature, past games
router.get("/calendar/:date", (req, res) => {
  var date = moment(req.params.date);
  games = []
  const yesterday = date.subtract(1, 'days').format("YYYYMMDD")
  const tomorrow = date.add(2, 'days').format("YYYYMMDD")
  date = req.params.date
  nodeFetch(`http://data.nba.net/10s/prod/v1/${date}/scoreboard.json`).then(res => res.json())
    .then(data => {
      data.games.forEach(game => {
        let status = ""
        let period = ""
        let clock = ""
        if (game.statusNum == 3) {
          period = "Final"
        } else if (game.statusNum == 1) {
          status = "Scheduled"
          period = game.startTimeEastern
        } else if (game.statusNum == 2) {
          status = "Live"
          period = game.period.current + "Q"
          clock = game.clock
        }
        games.push({
          dateGameId: '/index/'+date + '/' + game.gameId,
          Home: game.hTeam.triCode,
          HomeLogo: logos.get(game.hTeam.triCode),
          Away: game.vTeam.triCode,
          AwayLogo: logos.get(game.vTeam.triCode),
          HomeScore: game.hTeam.score,
          AwayScore: game.vTeam.score,
          status: status,
          arena: game.arena.city + ", " + game.arena.name,
          clock: clock,
          period: period
        })
      })
      res.render("index", {
        games: games,
        today: date,
        yday: "/index/calendar/"+yesterday,
        tomo: "/index/calendar/"+tomorrow,
        loggedin: req.isAuthenticated()
      })
    });
});


//box score for games on certain date and id
router.get("/:date/:id", (req, res) => {
  const date = req.params.date
  const gameId = req.params.id
  home = []
  away = []
  nodeFetch(`http://data.nba.net/json/cms/noseason/game/${date}/${gameId}/boxscore.json`).then(res => res.json())
    .then(data => {
      if(data.sports_content.game.period_time.period_value == ""){
        res.render("invalid", {loggedin: req.isAuthenticated()})
      }
      else{

        let hFirst = ""
        let hSecond = ""
        let hThird = ""
        let hFourth = ""
        let vFirst = ""
        let vSecond = ""
        let vThird = ""
        let vFourth = ""
        switch(data.sports_content.game.period_time.period_value){
          case "1":
            hFirst = data.sports_content.game.home.linescores.period.score
            vFirst = data.sports_content.game.visitor.linescores.period.score
            break;
          case "2":
            hFirst = data.sports_content.game.home.linescores.period[0].score
            vFirst = data.sports_content.game.visitor.linescores.period[0].score
            hSecond = data.sports_content.game.home.linescores.period[1].score
            vSecond = data.sports_content.game.visitor.linescores.period[1].score
            break;
          case "3":
            hFirst = data.sports_content.game.home.linescores.period[0].score
            vFirst = data.sports_content.game.visitor.linescores.period[0].score
            hSecond = data.sports_content.game.home.linescores.period[1].score
            vSecond = data.sports_content.game.visitor.linescores.period[1].score
            hThird = data.sports_content.game.home.linescores.period[2].score
            vThird = data.sports_content.game.visitor.linescores.period[2].score
            break;
          default:
            hFirst = data.sports_content.game.home.linescores.period[0].score
            hSecond = data.sports_content.game.home.linescores.period[1].score
            hThird = data.sports_content.game.home.linescores.period[2].score
            hFourth = data.sports_content.game.home.linescores.period[3].score
            vFirst = data.sports_content.game.visitor.linescores.period[0].score
            vSecond = data.sports_content.game.visitor.linescores.period[1].score
            vThird = data.sports_content.game.visitor.linescores.period[2].score
            vFourth = data.sports_content.game.visitor.linescores.period[3].score
            break;
        }
        gameInfo = {
          quarter: "Quarter " + data.sports_content.game.period_time.period_value,
          qStatus: data.sports_content.game.period_time.period_status,
          date: date,
          gameId: gameId,
          home:{
            name: data.sports_content.game.home.abbreviation,
            score: data.sports_content.game.home.score,
            first: hFirst,
            second: hSecond,
            third: hThird,
            fourth: hFourth,
            Dreb:data.sports_content.game.home.stats.rebounds_defensive,
            Oreb: data.sports_content.game.home.stats.rebounds_offensive,
            stls: data.sports_content.game.home.stats.steals,
            blks:data.sports_content.game.home.stats.blocks,
            TOs:data.sports_content.game.home.stats.turnovers,
            ast:data.sports_content.game.home.stats.assists,
            fgp: data.sports_content.game.home.stats.field_goals_percentage+'%',
            three: data.sports_content.game.home.stats.three_pointers_percentage+'%'
          },
          away :{
            name: data.sports_content.game.visitor.abbreviation,
            score: data.sports_content.game.visitor.score,
            first: vFirst,
            second: vSecond,
            third: vThird,
            fourth: vFourth,
            Dreb:data.sports_content.game.visitor.stats.rebounds_defensive,
            Oreb: data.sports_content.game.visitor.stats.rebounds_offensive,
            stls: data.sports_content.game.visitor.stats.steals,
            blks:data.sports_content.game.visitor.stats.blocks,
            TOs:data.sports_content.game.visitor.stats.turnovers,
            ast:data.sports_content.game.visitor.stats.assists,
            fgp: data.sports_content.game.visitor.stats.field_goals_percentage+'%',
            three: data.sports_content.game.visitor.stats.three_pointers_percentage+'%'
          }
        }
        data.sports_content.game.home.players.player.forEach(player => {
          home.push({
            first_name: player.first_name,
            last_name: player.last_name,
            name: player.first_name + ' ' + player.last_name,
            jersey_number: player.jersey_number,
            position: player.position_short,
            minutes: player.minutes,
            seconds: player.seconds,
            points: player.points,
            assists: player.assists,
            Oreb: player.rebounds_offensive,
            Dreb: player.rebounds_defensive,
            reb: parseInt(player.rebounds_offensive) + parseInt(player.rebounds_defensive),
            assists: player.assists,
            fouls: player.fouls,
            steals: player.steals,
            turnovers: player.turnovers,
            blocks: player.blocks,
            fg: player.field_goals_made,
            fga: player.field_goals_attempted,
            ft: player.free_throws_made,
            fta: player.free_throws_attempted,
            three: player.three_pointers_made,
            athree: player.three_pointers_attempted,
            plusminus: player.plus_minus
          })
        })
        data.sports_content.game.visitor.players.player.forEach(player => {
          away.push({
            first_name: player.first_name,
            last_name: player.last_name,
            name: player.first_name + ' ' + player.last_name,
            jersey_number: player.jersey_number,
            position: player.position_short,
            minutes: player.minutes,
            seconds: player.seconds,
            points: player.points,
            assists: player.assists,
            Oreb: player.rebounds_offensive,
            Dreb: player.rebounds_defensive,
            reb: parseInt(player.rebounds_offensive) + parseInt(player.rebounds_defensive),
            assists: player.assists,
            fouls: player.fouls,
            steals: player.steals,
            turnovers: player.turnovers,
            blocks: player.blocks,
            fg: player.field_goals_made,
            fga: player.field_goals_attempted,
            ft: player.free_throws_made,
            fta: player.free_throws_attempted,
            three: player.three_pointers_made,
            athree: player.three_pointers_attempted,
            plusminus: player.plus_minus
          })
        })
        res.render("boxscore", {
          away: away,
          home: home,
          gameInfo: gameInfo,
          loggedin: req.isAuthenticated()
        })
      }
    });

})

router.get("*", (req, res) => {
  res.send("Error");
});

module.exports = router;
