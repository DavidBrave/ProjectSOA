const express = require("express")
const router = express.Router()
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
let key = "projectSOA"
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

router.post('/register',uploads.single('gambar_profile'), async(req,res)=>{
    try {
        let email = req.body.email
        let pass = req.body.password
        let nama = req.body.nama_user
        let jenis = req.body.jenis_user
        let directory = "./uploads" + req.file.filename
        
        const conn = await getconn()
        query = `select * from user where email='${email}'`
        const user = await executeQuery(conn,query)
        if ( user.length>0){
            msg = "email sudah pernah didaftarkan"
            return res.status(400).send({"msg" : msg})
        }

        if ( jenis != "N" && jenis !="P" ){
            msg = "jenis user harus N atau P"
            return res.status(400).send({"msg" : msg})
        }

        if ( !email.includes("@") || !email.includes(".com") ){
            msg = "jenis user harus @ dan .com"
            return res.status(400).send({"msg" : msg})
        }

        query = `insert into user values('${email}','${pass}','${nama}','${jenis}','${directory}',0,20)`
        await executeQuery(conn,query)

        conn.release()
        return res.status(201).send({
            "nama" : nama,
            "email" : email,
            "api hit" : 20,
            "saldo" : 0
        })
    } catch (error) {
        return res.status(400).send(error)
    }
})

router.post('/login', async(req,res)=>{
    try {
        let email = req.body.email
        let pass = req.body.password
        
        const conn = await getconn()
        query = `select * from user where email='${email}'`
        const user = await executeQuery(conn,query)
        if ( user.length==0){
            msg = "user tidak ditemukan"
            return res.status(404).send({"msg" : msg})
        }

        if ( user[0].password != pass){
            msg = "password salah"
            return res.status(400).send({"msg" : msg})
        }
        
        let token = jwt.sign(
            {
                "email" : email,
                "nama" : user[0].nama_user,
                "jenis" : user[0].jenis_user
            },key,
            {expiresIn : "6h"}
        )

        conn.release()
        return res.status(201).send({
            "nama" : user[0].nama_user,
            "jwt_key" : token,
        })

    } catch (error) {
        return res.status(400).send(error)
    }
})

let apikey="d8748587481847979b6f392bf46ccc62"

router.get('/user/history',async(req,res)=>{
    try {

        if ( !req.headers["x-auth-token"] ){
            msg = "unauthorized"
            return res.status(401).send({"msg" : msg})
        }
        let token = req.headers["x-auth-token"]
        let userdata = jwt.verify(token,key)
        
        const conn = await getconn()
        query = `select * from history where id_user='${userdata.email}'`
        let result = await executeQuery(conn,query)
        
        listHistory = []

        for (let i = 0; i < result.length; i++) {
            let history = result[i]
            query = `https://api.rawg.io/api/games/${history.id_game}?key=${apikey}`
            let game = await axios.get(query)
            let genre = "";
            for (let i = 0; i < game.genres.length; i++) {
                if ( i < game.genres.length-1 )genre = genre + ", " + game.genres[i].name
                else genre = genre + game.genres[i].name
            }
            listHistory.push({
                "Game" : game.name,
                "Genre" : genre,
                "Search Date" : history.tgl_history,
                "History Description" : history.deskripsi_history
            })
        }

        msg = "history berhasil didapatkan"
        conn.release()
        return res.status(200).send({
            "nama_user" : userdata.nama,
            "List History" : listHistory 
        })
    } catch (error) {
        return res.status(400).send(error)
    }
})

router.delete('/user/history',async(req,res)=>{
    try {
        if ( !req.headers["x-auth-token"] ){
            msg = "unauthorized"
            return res.status(401).send({"msg" : msg})
        }
        let token = req.headers["x-auth-token"]
        let userdata = jwt.verify(token,key)
        
        const conn = await getconn()
        query = `Delete history where id_user='${userdata.email}'`
        await executeQuery(conn,query)
        
        msg = "history berhasil dibersihkan"
        conn.release()
        return res.status(200).send({
            "msg" : msg
        })
    } catch (error) {
        return res.status(400).send(error)
    }
})

module.exports = router