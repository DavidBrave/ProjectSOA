const express = require("express")
const app = express()
const axios = require("axios")
app.use(express.urlencoded({extended : true}))

const user = require("./routes/user")
const game = require("./routes/game")

app.use("/api",user)


///////////////////////////////////////////////////////////////////////////
///////////////////////////       jeffry      /////////////////////////////
///////////////////////////////////////////////////////////////////////////
app.use("/game",game)// <-yang ini biarkan di sini
let apikey="d8748587481847979b6f392bf46ccc62"

app.get('/api/games/:id', async function (req, res) {
    let idGame=req.params.id;
    if(isNaN(idGame)){
        return res.status(400).send("id game harus angka");
    }
    let query = `https://api.rawg.io/api/games/${idGame}?key=${apikey}`
    try {
        let game = await axios.get(query)
        let result=[];
        result.push({
            "title":game["data"]["name"],
            "description":game["data"]["description"],
            "release_date":game["data"]["released"],
            "rating":game["data"]["rating"]+"/"+game["data"]["rating_top"],
            "playtime":game["data"]["playtime"]+" hours",
            "background_image":game["data"]["background_image"],
            "esrb_rating":game["data"]["esrb_rating"],
            "website":game["data"]["website"],
            "metacritics_score":game["data"]["metacritic"],
            "metacritic_url":game["data"]["metacritic_url"],
            "reddit_name":game["data"]["reddit_name"],
            "reddit_url":game["data"]["reddit_url"],
        })
        return res.status(200).send(result);
    } catch (error) {
        return res.status(404).send('game not found');
    }
    
})



///////////////////////////////////////////////////////////////////////////
app.listen(3000)
console.log("listening port : 3000")