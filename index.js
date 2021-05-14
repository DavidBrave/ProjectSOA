const express = require("express")
const app = express()

app.use(express.urlencoded({extended : true}))

const user = require("./routes/user")

app.use("/api",user)

app.listen(3000)
console.log("listening port : 3000")