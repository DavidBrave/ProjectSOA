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
///////////////////////////        LEO       //////////////////////////////
///////////////////////////////////////////////////////////////////////////


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

        query = `insert into user values('${email}','${pass}','${nama}','${jenis}','${directory}',0,50)`
        await executeQuery(conn,query)

        conn.release()
        return res.status(201).send({
            "nama" : nama,
            "email" : email,
            "api hit" : 50,
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


///////////////////////////////////////////////////////////////////////////
///////////////////////////       DICKY      //////////////////////////////
///////////////////////////////////////////////////////////////////////////

function numeric(inputtxt)
{
    var matches2 = "[-+]?([0-9]*.[0-9]{1,2}$)";
    if( inputtxt.match(matches2) !=null) 
    {
       return true;
    }
    else
    { 
        return false; 
    }
}
router.post('/user/topUp',async(req,res)=>{
    try {
        if ( !req.headers["x-auth-token"] ){
            msg = "unauthorized";
            return res.status(401).send({"msg" : msg});
        }
        let token = req.headers["x-auth-token"];
        let userdata = jwt.verify(token,key);
        
        const conn = await getconn();
        query = `select * from user where email='${userdata.email}'`;
        let user = await executeQuery(conn,query);

        let total_api_hit = req.body.total_api_hit;
        
        if(!numeric(total_api_hit)){
            msg = "total api hit harus angka!";
            return res.status(400).send("total api hit harus angka!");
        }

        let old_saldo = user[0].saldo_user;
        let new_saldo = old_saldo-(10*parseInt(total_api_hit));

        //cek api hit cukup/tidak
        if(new_saldo < 0){
            msg = "saldo tidak mencukupi";
            return res.status(400).send({"msg" : msg});
        }
        else{
            let old_api_hit = user[0].api_hit;
            let new_api_hit = old_api_hit+parseInt(total_api_hit);
            let biaya = 10*parseInt(total_api_hit);

            await executeQuery(conn,`update user set api_hit = ${new_api_hit} where email = '${userdata.email}'`);
            await executeQuery(conn,`update user set saldo_user = ${new_saldo} where email = '${userdata.email}'`);

            conn.release()
            msg = "berhasil top up api hit sebanyak " + total_api_hit + "api hit, dengan biaya " + biaya + " dan sisa saldo " + new_saldo;
            return res.status(400).send({"msg" : msg});
        }
    } 
    catch (error) {
        return res.status(400).send(error)
    }
})

router.post('/user/favorite',async(req,res)=>{
    try {
        if ( !req.headers["x-auth-token"] ){
            msg = "unauthorized";
            return res.status(401).send({"msg" : msg});
        }
        let token = req.headers["x-auth-token"];
        let userdata = jwt.verify(token,key);
        
        const conn = await getconn();
        query = `select * from user where email='${userdata.email}'`;
        let user = await executeQuery(conn,query);

        let old_api_hit = user[0].api_hit;
        let new_api_hit = old_api_hit-10;

        //cek api hit cukup/tidak
        if(new_api_hit < 0){
            msg = "api hit tidak mencukupi, silahkan top up terlebih dahulu";
            return res.status(400).send({"msg" : msg});
        }
        else{
            await executeQuery(conn,`update user set api_hit = ${new_api_hit} where email = '${userdata.email}'`);

            let id_game = req.body.id_game;
            //INSERT INTO `favorite` (`id_favorite`, `email`, `id_game`, `tgl_favorite`) VALUES (NULL, 'gg', '44', current_timestamp());
            await executeQuery(conn,`insert into favorite values(NULL,'${userdata.email}','${parseInt(id_game)}', current_timestamp())`);
            conn.release()
            msg = "berhasil menambahkan favorite";
            return res.status(400).send({"msg" : msg});
        }
    } 
    catch (error) {
        return res.status(400).send(error)
    }
})

// AMBIL NAMA GAME GAGAL TRUS
// router.get('/user/favorite',async(req,res)=>{
//     try {
//         if ( !req.headers["x-auth-token"] ){
//             msg = "unauthorized";
//             return res.status(401).send({"msg" : msg});
//         }
//         let token = req.headers["x-auth-token"];
//         let userdata = jwt.verify(token,key);
        
//         const conn = await getconn();
//         query = `select * from user where email='${userdata.email}'`;
//         let user = await executeQuery(conn,query);

//         let old_api_hit = user[0].api_hit;
//         let new_api_hit = old_api_hit-5;

//         //cek api hit cukup/tidak
//         if(new_api_hit < 0){
//             msg = "api hit tidak mencukupi, silahkan top up terlebih dahulu";
//             return res.status(400).send({"msg" : msg});
//         }
//         else{
//             await executeQuery(conn,`update user set api_hit = ${new_api_hit} where email = '${userdata.email}'`);

//             let list_fav=[];
//             query = `select * from favorite where email='${userdata.email}'`;
//             let fav = await executeQuery(conn,query);

//             for (let i = 0; i < fav.length; i++) {
//                 query = `https://api.rawg.io/api/games/${fav.id_game}?key=${apikey}`;
//                 let game = await axios.get(query);
//                 //hasil.data.data[0].common_name
//                 list_fav.push({
//                     "Game" : game.data.data[0].name,
//                     "Adding Date" : fav.tgl_favorite
//                 });
//             }

//             msg = "Favorite berhasil didapatkan";
//             conn.release();
//             return res.status(200).send({
//                 "Nama_user" : userdata.nama,
//                 "List Favorite" : list_fav 
//             })
//         }
//     } 
//     catch (error) {
//         return res.status(400).send(error)
//     }
// })

module.exports = router