const express = require("express")
const app = express.Router()
const mysql = require("mysql")
const morgan = require("morgan")
const fs = require("fs")
const pool = mysql.createPool({
    host : "localhost",
    database : "proyek_soa",
    user : "root",
    password : "",
})
const axios = require("axios")
const multer = require("multer")

const jwt = require("jsonwebtoken")
const { name } = require("ejs")
let key = "projectSOA"
let apikey="d8748587481847979b6f392bf46ccc62"
let query,msg

const storage = multer.diskStorage(
    {
        destination:function (req,file,callback){
            callback(null,"./uploads");
        },
        filename:function(req,file,callback){
            let nama_user = req.body.nama_user
            const filename = file.originalname.split(".");
            const extension = filename[filename.length-1];
            callback(null,nama_user+"."+extension);
        }
    }
)

const uploads = multer({storage:storage});

function getconn() {
    return new Promise(function (resolve,reject) {
        pool.getConnection(function (err,connection) {
            if ( err){
                reject(err);
            }
            else{
                resolve(connection);
            }
        })
    })
}

function executeQuery(conn,q) {
    return new Promise(function (resolve,reject) {
        conn.query(q,function (err,connection) {
            if (err){
                reject(err);
            }
            else{
                resolve(connection);
            }
        })
    })
}

///////////////////////////////////////////////////////////////////////////
///////////////////////////       jeffry      /////////////////////////////
///////////////////////////////////////////////////////////////////////////


app.get('/games/id/:id', async function (req, res) {
    let idGame=req.params.id;
    if(isNaN(idGame)){
        return res.status(400).send("id game harus angka");
    }
    let query = `https://api.rawg.io/api/games/${idGame}?key=${apikey}`
    
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
    if(result.length>0){
        return res.status(200).send(result);
    }
    else{
        return res.status(404).send('game not found');
    }
    
})

app.get('/games/search/:keyword', async function (req, res) {
    let keyword=req.params.keyword;
    let query = `https://api.rawg.io/api/games?key=${apikey}&search=${keyword}`;

    let game = await axios.get(query)
    let result=[];
    for (let i = 0; i < game['data']['results'].length; i++) {
        result.push(
            {
                "id_game":game["data"]["results"][i]["id"],
                "title":game["data"]["results"][i]["name"],
                "release_date":game["data"]["results"][i]["released"],
                "rating":game["data"]["results"][i]["rating"]+"/"+game["data"]["results"][i]["rating_top"],
                "playtime":game["data"]["results"][i]["playtime"]+" hours",
                "background_image":game["data"]["results"][i]["background_image"],
                "esrb_rating":game["data"]["results"][i]["esrb_rating"],
                "metacritics_score":game["data"]["results"][i]["metacritic"],
            }
        )
    }
    if(result.length>0){
        return res.status(200).send(result);
    }
    else{
        return res.status(404).send('game not found');
    }

})

app.get('/games/listall', async function (req, res) {
    let page=req.query.page;
    let query = `https://api.rawg.io/api/games?key=${apikey}&page=${page}`;
    
    let game = await axios.get(query)
    let result=[];
    for (let i = 0; i < game['data']['results'].length; i++) {
        result.push(
            {
                "id_game":game["data"]["results"][i]["id"],
                "title":game["data"]["results"][i]["name"],
                "release_date":game["data"]["results"][i]["released"],
                "metacritics_score":game["data"]["results"][i]["metacritic"],
            }
        )
    }
    return res.status(200).send(result);

})

app.get('/games/filter', async function (req, res) {
    let genre=req.query.genre;
    let page=req.query.page;
    let startYear=req.query.start_year;
    let endYear=req.query.end_year;
    let ratingStart=req.query.rating_start;
    let ratingEnd=req.query.rating_end;
    let metaStart=req.query.metacritic_start;
    let metaEnd=req.query.metacritic_end;
    let playStart=req.query.playtime_start;
    let playEnd=req.query.playtime_end;

    let query = `https://api.rawg.io/api/games?key=${apikey}`;

    if(genre!=null){
        query+=`&genres=${genre}`
    }
    if(page!=null){
        query+=`&page=${page}`
    }

    let game = await axios.get(query)
    let result=[];
    for (let i = 0; i < game['data']['results'].length; i++) {
        result.push(
            {
                "id_game":game["data"]["results"][i]["id"],
                "title":game["data"]["results"][i]["name"],
                "release_date":game["data"]["results"][i]["released"],
                "rating":game["data"]["results"][i]["rating"]+"/"+game["data"]["results"][i]["rating_top"],
                "playtime":game["data"]["results"][i]["playtime"]+" hours",
                "background_image":game["data"]["results"][i]["background_image"],
                "esrb_rating":game["data"]["results"][i]["esrb_rating"],
                "metacritics_score":game["data"]["results"][i]["metacritic"],
            }
        )
    }
    let hasilAkhir=[];
    for (let i = 0; i < result.length; i++) {
        if(startYear!=null&&endYear!=null){
            if(parseInt(result[i]['release_date'].substring(0, 4))<parseInt(startYear)||
            parseInt(result[i]['release_date'].substring(0, 4))>parseInt(endYear)){                
                // console.log(result[i]);
                // result.splice(i, 1);
                result[i]=undefined;
            }
        }
        if(result[i]!=undefined){
            if(ratingStart!=null&&ratingEnd!=null){
                if(parseFloat(result[i]['rating'])<parseFloat(ratingStart)||
                parseFloat(result[i]['rating'])>parseFloat(ratingEnd)){
                    result[i]=undefined;
                }
            }
        }
        if(result[i]!=undefined){
            if(metaStart!=null&&metaEnd!=null){
                if(parseInt(result[i]['metacritics_score'])<parseInt(metaStart)||
                parseInt(result[i]['metacritics_score'])>parseInt(metaEnd)){
                    result[i]=undefined;
                }
            }
        }
        if(result[i]!=undefined){
            if(playStart!=null&&playEnd!=null){
                if(parseInt(result[i]['playtime'])<parseInt(playStart)||
                parseInt(result[i]['playtime'])>parseInt(playEnd)){
                    result[i]=undefined;
                }
            }
        }

    }
    for (let i = 0; i < result.length; i++) {
        if(result[i]!=undefined){
            hasilAkhir.push(result[i]);
        }        
    }
    if(startYear!=null&&endYear!=null){
        result=[];
        if(hasilAkhir.length>0){
            result=hasilAkhir;
        }
    }

    if(result.length>0){
        return res.status(200).send(result);
    }
    else{
        return res.status(404).send('game not found');
    }

})

///////////////////////////////////////////////////////////////////////////

module.exports = app