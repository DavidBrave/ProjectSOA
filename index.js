const express = require("express")
const app = express()
const axios = require("axios")
app.use(express.urlencoded({extended : true}))

const user = require("./routes/user")
const game = require("./routes/game")

app.use("/user",user)
app.use("/game",game)

app.listen(3000)
console.log("listening port : 3000")