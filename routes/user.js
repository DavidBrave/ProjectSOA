const express = require("express")
const router = express.Router()
const mysql = require("mysql")
const morgan = require("morgan")
const fs = require("fs")

// const pool = mysql.createPool({
//     host : "localhost",
//     database : "proyek_soa",
//     user : "root",
//     password : "",
// })

const pool = mysql.createPool({
    host : "185.232.14.1",
    database : "u855625606_ProjectSOA",
    user : "u855625606_ProjectSOA",
    password : "ProjectSOA2021",
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


function generateApiKey() {
    const charList = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ0123456789";
    let apikey = "";
    for(let i = 0; i < 15; i++) {
        let rand = Math.floor(Math.random() * charList.length);
        apikey = apikey + charList.charAt(rand);
    }
    return apikey;
}

router.post('/register',uploads.single('gambar_profile'), async(req,res)=>{
    try {
        let email = req.body.email
        let pass = req.body.password
        let nama = req.body.nama_user
        let jenis = req.body.jenis_user
        let directory = "./uploads/" + req.file.filename
        let apikey = generateApiKey();

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
            msg = "email user harus @ dan .com"
            return res.status(400).send({"msg" : msg})
        }
        query = `insert into user values('${apikey}','${email}','${pass}','${nama}','${jenis}','${directory}',0,50)`
        await executeQuery(conn,query)

        conn.release()
        return res.status(201).send({
            "nama" : nama,
            "email" : email,
            "api key" : apikey,
            "api hit" : 50,
            "saldo" : 0
        })
    } catch (error) {
        return res.status(400).send(error)
    }
})

// user ambil apikey
router.post('/login', async(req,res)=>{
    try {
        let email = req.body.email
        let pass = req.body.password
        const conn = await getconn()
        query = `select * from user where email='${email}'`
        const user = await executeQuery(conn,query)

        if ( user.length==0 ){
            msg = "email tidak ditemukan"
            return res.status(404).send({"msg" : msg})
        }
        if ( user[0].password != pass ){
            msg = "password salah"
            return res.status(400).send({"msg" : msg})
        }
        conn.release()
        return res.status(201).send({
            "nama" : user[0].nama_user,
            "key" : user[0].api_key,
        })

    } catch (error) {
        return res.status(400).send(error)
    }
})

router.get('/history',async(req,res)=>{
    try {
        const conn = await getconn()
        if ( !req.headers["key"] ){
            msg = "unauthorized"
            return res.status(401).send({"msg" : msg})
        }
        let token = req.headers["key"]
        query = `select * from user where api_key='${token}'`
        let userdata = await executeQuery(conn,query)

        if ( userdata.length==0 ){
            msg = "data tidak ditemukan"
            return res.status(404).send({"msg" : msg})
        }
        
        query = `select * from history where api_key='${token}'`
        let result = await executeQuery(conn,query)
        
        listHistory = []

        for (let i = 0; i < result.length; i++) {
            let history = result[i]
            query = `https://api.rawg.io/api/games/${history.id_game}?key=${apikey}`
            let game = await axios.get(query)
            let genre = "";
            for (let i = 0; i < game.data.genres.length; i++) {
                if ( i < game.data.genres.length-1 )genre = genre + ", " + game.data.genres[i].name
                else genre = genre + game.data.genres[i].name
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
            "nama_user" : userdata[0].nama_user,
            "List History" : listHistory 
        })
    } catch (error) {
        return res.status(400).send(error)
    }
})

router.delete('/history',async(req,res)=>{
    try {
        const conn = await getconn()
        if ( !req.headers["key"] ){
            msg = "unauthorized"
            return res.status(401).send({"msg" : msg})
        }
        let token = req.headers["key"]
        query = `select * from user where api_key='${token}'`
        let userdata = await executeQuery(conn,query)

        if ( userdata.length==0 ){
            msg = "data tidak ditemukan"
            return res.status(404).send({"msg" : msg})
        }
        
        query = `Delete from history where api_key='${token}'`
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
function inrange(inputtxt)
{
    var matches2 = "[-+]?([1-5]*.[1-5]{1}$)";
    if( inputtxt.match(matches2) !=null) 
    {
       return true;
    }
    else
    { 
        return false; 
    }
}
router.post('/topUpAPIhit',async(req,res)=>{
    try {
        const conn = await getconn()
        if ( !req.headers["key"] ){
            msg = "unauthorized"
            return res.status(401).send({"msg" : msg})
        }
        let token = req.headers["key"]
        query = `select * from user where api_key='${token}'`
        let userdata = await executeQuery(conn,query)

        if ( userdata.length==0 ){
            msg = "data tidak ditemukan"
            return res.status(404).send({"msg" : msg})
        }
        
        let user = userdata;

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

            await executeQuery(conn,`update user set api_hit = ${new_api_hit} where email = '${user[0].email}'`);
            await executeQuery(conn,`update user set saldo_user = ${new_saldo} where email = '${user[0].email}'`);

            conn.release()
            msg = "berhasil top up api hit sebanyak " + total_api_hit + "api hit, dengan biaya " + biaya + " dan sisa saldo " + new_saldo;
            return res.status(200).send({"msg" : msg});
        }
    } 
    catch (error) {
        return res.status(400).send(error)
    }
})

router.post('/topUpSaldo',async(req,res)=>{
    try {
        const conn = await getconn()
        if ( !req.headers["key"] ){
            msg = "unauthorized"
            return res.status(401).send({"msg" : msg})
        }
        let token = req.headers["key"]
        query = `select * from user where api_key='${token}'`
        let userdata = await executeQuery(conn,query)

        if ( userdata.length==0 ){
            msg = "data tidak ditemukan"
            return res.status(404).send({"msg" : msg})
        }
        
        let user = userdata;

        let total_saldo = req.body.total_saldo;
        
        if(!numeric(total_saldo)){
            msg = "total saldo harus angka!";
            return res.status(400).send("total saldo harus angka!");
        }

        let old_saldo = user[0].saldo_user;
        let new_saldo = old_saldo+(parseInt(total_saldo));

        await executeQuery(conn,`update user set saldo_user = ${new_saldo} where email = '${user[0].email}'`);
        conn.release()
        msg = "berhasil top up saldo sebanyak " + new_saldo;
        return res.status(200).send({"msg" : msg});
    } 
    catch (error) {
        return res.status(400).send(error)
    }
})

router.post('/favorite',async(req,res)=>{
    try {
        const conn = await getconn()
        if ( !req.headers["key"] ){
            msg = "unauthorized"
            return res.status(401).send({"msg" : msg})
        }
        let token = req.headers["key"]
        query = `select * from user where api_key='${token}'`
        let userdata = await executeQuery(conn,query)

        if ( userdata.length==0 ){
            msg = "data tidak ditemukan"
            return res.status(404).send({"msg" : msg})
        }
        
        let user = userdata;

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
            query = `insert into history values(null, '${token}', ${id_game}, null, 'Add Favourite Game')`

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

router.get('/favorite',async(req,res)=>{
    try {
        const conn = await getconn()
        if ( !req.headers["key"] ){
            msg = "unauthorized"
            return res.status(401).send({"msg" : msg})
        }
        let token = req.headers["key"]
        query = `select * from user where api_key='${token}'`
        let userdata = await executeQuery(conn,query)

        if ( userdata.length==0 ){
            msg = "data tidak ditemukan"
            return res.status(404).send({"msg" : msg})
        }
        
        let user = userdata;

        let old_api_hit = user[0].api_hit;
        let new_api_hit = old_api_hit-5;

        //cek api hit cukup/tidak
        if(new_api_hit < 0){
            msg = "api hit tidak mencukupi, silahkan top up terlebih dahulu";
            return res.status(400).send({"msg" : msg});
        }
        else{
            await executeQuery(conn,`update user set api_hit = ${new_api_hit} where email = '${userdata.email}'`);

            let list_fav=[];
            query = `select * from favorite where email = '${userdata.email}'`;
            let fav = await executeQuery(conn,query);
            for (let i = 0; i < fav.length; i++) {
                query = `https://api.rawg.io/api/games/${fav[0].id_game}?key=${apikey}`;
                let game = await axios.get(query);
                list_fav.push({
                    "Game" : game["data"]["name"],
                    "Adding Date" : fav[0].tgl_favorite
                });
            }

            msg = "Favorite berhasil didapatkan";
            conn.release();
            return res.status(200).send({
                "Nama_user" : userdata.nama,
                "List Favorite" : list_fav 
            })
        }
    } 
    catch (error) {
        return res.status(400).send(error)
    }
})

router.post('/review',async(req,res)=>{
    try {
        const conn = await getconn()
        if ( !req.headers["key"] ){
            msg = "unauthorized"
            return res.status(401).send({"msg" : msg})
        }
        let token = req.headers["key"]
        query = `select * from user where api_key='${token}'`
        let userdata = await executeQuery(conn,query)

        if ( userdata.length==0 ){
            msg = "data tidak ditemukan"
            return res.status(404).send({"msg" : msg})
        }
        
        let user = userdata;

        let id_game = req.body.id_game;
        let rating = req.body.rating;
        let review = req.body.review;

        //cek rating
        if(10 >= parseInt(rating) || parseInt(rating) >= 100){
            msg = "rating harus 10 sampai 100";
            return res.status(400).send("rating harus 10 sampai 100");
        }
        if (!numeric(rating)) {
            msg = "rating harus angka!";
            return res.status(400).send("rating harus angka!");
        }

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
            query = `insert into history values(null, '${token}', ${id_game}, null, 'Add Review/Rating Game')`

            await executeQuery(conn,`insert into review values(NULL,'${userdata.email}','${parseInt(id_game)}', '${parseInt(rating)}', '${review}')`);
            conn.release()
            msg = "berhasil menambahkan review";
            return res.status(400).send({"msg" : msg});
        }
    } 
    catch (error) {
        return res.status(400).send(error)
    }
})



//Brave


//Cleanup Code
router.put('/profile', uploads.single('gambar_profile'), async(req,res)=>{

    let pass = req.body.password;
    let nama = req.body.nama_user;
    let jenis = req.body.jenis_user;
    let directory = "./uploads/" + req.file.filename;



    let token = null;
    try {
        if ( !req.headers["key"] ){
            msg = "Unauthorized";
            return res.status(401).send({"msg" : msg});
        }

        token = req.headers["key"];

    } catch (error) {
        msg = "Unauthorized";
        return res.status(401).send({"msg" : msg});
    }



    let conn = null;
    let list_user = null;
    let user_now = null;
    try {

        conn = await getconn();
        query = `select * from user where api_key = '${token}'`;
        list_user = await executeQuery(conn,query);

        if (list_user.length < 1) {
            msg = "User Tidak Ditemukan";
            return res.status(404).send({"msg" : msg});
        }

        user_now = list_user[0];

    } catch (error) {
        msg = "Gagal Menyambung Ke Database";
        return res.status(400).send({"msg" : msg});
    }

    if ( jenis != "N" && jenis != "P" ){
        msg = "Jenis User Harus N Atau P";
        return res.status(400).send({"msg" : msg});
    }



    try {
        
        query = 
        `UPDATE user
        SET password = '${pass}', nama_user = '${nama}', 
        jenis_user = '${jenis}', gambar_profile = '${directory}' 
        WHERE email = '${user_now["email"]}';`;
        const update_user = await executeQuery(conn, query);
        try {
            conn.release();
        } catch (error) {
            
        }

        let response = {
            "status" : "Success",
            "message" : "Berhasil Mengubah User",
            "email" : user_now.email,
            "nama_user" : nama,
            "jenis_user" : jenis,
            "gambar_profile" : directory
        }

        return res.status(200).send(response);

    } catch (error) {
        console.log(error);
        msg = "Gagal Mengubah Data User";
        return res.status(400).send({"msg" : msg});
    }

    
    
    msg = "Gagal Menghubungi Server";
    return res.status(500).send({"msg" : msg});

});



router.put('/review', async(req,res)=>{

    let id_game = req.body.id_game;
    let rating = req.body.rating;
    let review = req.body.review;




    let token = null;
    try {
        if ( !req.headers["key"] ){
            msg = "Unauthorized";
            return res.status(401).send({"msg" : msg});
        }

        token = req.headers["key"];

    } catch (error) {
        console.log(error);
        msg = "Unauthorized";
        return res.status(401).send({"msg" : msg});
    }



    let conn = null;
    let list_user = null;
    let user_now = null;
    try {

        conn = await getconn();
        query = `select * from user where api_key = '${token}'`;
        list_user = await executeQuery(conn,query);
        try {
            conn.release();
        } catch (error) {
            
        }

        if (list_user.length < 1) {
            msg = "User Tidak Ditemukan";
            return res.status(404).send({"msg" : msg});
        }

        user_now = list_user[0];

    } catch (error) {
        console.log(error);
        msg = "Gagal Menyambung Ke Database";
        return res.status(400).send({"msg" : msg});
    }


    let list_review = null;
    try {
        
        conn = await getconn();
        query = `select * from review where api_key = '${token}' AND id_game = '${id_game}'`;
        list_review = await executeQuery(conn, query);
        try {
            conn.release();
        } catch (error) {
            
        }

        if (list_review.length < 1) {
            msg = "Review Tidak Ditemukan";
            return res.status(404).send({"msg" : msg});
        }


    } catch (error) {
        console.log(error);
        msg = "Gagal Menyambung Ke Database";
        return res.status(400).send({"msg" : msg});
    }


    //cek rating
    if(parseInt(rating) < 1 || parseInt(rating) >= 100){
        msg = "Rating Harus Bernilai 1 Sampai Dengan 100";
        return res.status(400).send({"msg" : msg});
    }
    if (!numeric(rating)) {
        msg = "Rating Harus Berupa Angka!";
        return res.status(400).send({"msg" : msg});
    }



    try {

        query = 
        `insert into history 
        values(null, '${token}', ${id_game}, null, 'Update Review/Rating Game')`

        const add_history = await executeQuery(conn, query);
        try {
            conn.release();
        } catch (error) {
            
        }

    } catch (error) {
        console.log(error);
        msg = "Gagal Menambah History";
        return res.status(400).send({"msg" : msg});
    }



    let old_api_hit = user_now.api_hit;
    let new_api_hit = old_api_hit - 10;

    //cek api hit cukup/tidak
    if(new_api_hit < 0){
        msg = "Api Hit Tidak Mencukupi, Silahkan Top Up Terlebih Dahulu";
        return res.status(400).send({"msg" : msg});
    }

    try {

        query = 
        `UPDATE user 
        SET api_hit = ${new_api_hit}
        WHERE api_key = '${token}';`;

        const update_user = await executeQuery(conn, query);
        try {
            conn.release();
        } catch (error) {
            
        }

    } catch (error) {
        console.log(error);
        msg = "Gagal Merubah API User";
        return res.status(400).send({"msg" : msg});
    }

    

    try {
        
        query = 
        `UPDATE review 
        SET rating = ${rating}, review = '${review}' 
        WHERE api_key = '${token}' AND id_game = '${id_game}';`;

        const update_review = await executeQuery(conn, query);
        try {
            conn.release();
        } catch (error) {
            
        }

        let response = {
            "status" : "Success",
            "message" : "Berhasil Mengubah Review",
            "rating" : rating,
            "review" : review,
            "id_game" : id_game,
            "old_api_hit" : old_api_hit,
            "new_api_hit" :new_api_hit
        }

        return res.status(200).send(response);


    } catch (error) {
        console.log(error);
        msg = "Gagal Merubah Review";
        return res.status(400).send({"msg" : msg});
    }


    msg = "Gagal Merubah Review";
    return res.status(500).send({"msg" : msg});


});






router.delete('/review',async(req,res)=>{


    let id_game = req.body.id_game;



    let token = null;
    try {
        if ( !req.headers["key"] ){
            msg = "Unauthorized";
            return res.status(401).send({"msg" : msg});
        }

        token = req.headers["key"];

    } catch (error) {
        console.log(error);
        msg = "Unauthorized";
        return res.status(401).send({"msg" : msg});
    }



    let conn = null;
    let list_user = null;
    let user_now = null;
    try {

        conn = await getconn();
        query = `select * from user where api_key = '${token}'`;
        list_user = await executeQuery(conn,query);
        try {
            conn.release();
        } catch (error) {
            
        }

        if (list_user.length < 1) {
            msg = "User Tidak Ditemukan";
            return res.status(404).send({"msg" : msg});
        }

        user_now = list_user[0];

    } catch (error) {
        console.log(error);
        msg = "Gagal Menyambung Ke Database";
        return res.status(400).send({"msg" : msg});
    }


    let list_review = null;
    let review_now = null;
    try {
        
        conn = await getconn();
        query = `select * from review where api_key = '${token}' AND id_game = '${id_game}'`;
        list_review = await executeQuery(conn, query);
        try {
            conn.release();
        } catch (error) {
            
        }

        if (list_review.length < 1) {
            msg = "Review Tidak Ditemukan";
            return res.status(404).send({"msg" : msg});
        }

        review_now = list_review[0];

    } catch (error) {
        console.log(error);
        msg = "Gagal Menyambung Ke Database";
        return res.status(400).send({"msg" : msg});
    }



    try {

        query = 
        `insert into history 
        values(null, '${token}', ${id_game}, null, 'Delete Review/Rating Game')`

        const add_history = await executeQuery(conn, query);
        try {
            conn.release();
        } catch (error) {
            
        }

    } catch (error) {
        console.log(error);
        msg = "Gagal Menambah History";
        return res.status(400).send({"msg" : msg});
    }



    let old_api_hit = user_now.api_hit;
    let new_api_hit = old_api_hit - 10;

    //cek api hit cukup/tidak
    if(new_api_hit < 0){
        msg = "Api Hit Tidak Mencukupi, Silahkan Top Up Terlebih Dahulu";
        return res.status(400).send({"msg" : msg});
    }

    try {

        query = 
        `UPDATE user 
        SET api_hit = ${new_api_hit}
        WHERE api_key = '${token}';`;

        const update_user = await executeQuery(conn, query);
        try {
            conn.release();
        } catch (error) {
            
        }

    } catch (error) {
        console.log(error);
        msg = "Gagal Merubah API User";
        return res.status(400).send({"msg" : msg});
    }



    try {
        
        query = 
        `DELETE FROM review 
        WHERE api_key = '${token}' AND id_game = '${id_game}';`;

        const update_review = await executeQuery(conn, query);
        try {
            conn.release();
        } catch (error) {
            
        }

        let response = {
            "status" : "Success",
            "message" : "Berhasil Menghapus Review",
            "id_review" : review_now.id_review,
            "id_game" : id_game,
            "old_api_hit" : old_api_hit,
            "new_api_hit" :new_api_hit
        }

        return res.status(200).send(response);


    } catch (error) {
        console.log(error);
        msg = "Gagal Menghapus Review";
        return res.status(400).send({"msg" : msg});
    }


    msg = "Gagal Menghapus Review";
    return res.status(500).send({"msg" : msg});



});




router.delete('/favorite',async(req,res)=>{

    let id_game = req.body.id_game;



    let token = null;
    try {
        if ( !req.headers["key"] ){
            msg = "Unauthorized";
            return res.status(401).send({"msg" : msg});
        }

        token = req.headers["key"];

    } catch (error) {
        console.log(error);
        msg = "Unauthorized";
        return res.status(401).send({"msg" : msg});
    }



    let conn = null;
    let list_user = null;
    let user_now = null;
    try {

        conn = await getconn();
        query = `select * from user where api_key = '${token}'`;
        list_user = await executeQuery(conn,query);
        try {
            conn.release();
        } catch (error) {
            
        }

        if (list_user.length < 1) {
            msg = "User Tidak Ditemukan";
            return res.status(404).send({"msg" : msg});
        }

        user_now = list_user[0];

    } catch (error) {
        console.log(error);
        msg = "Gagal Menyambung Ke Database";
        return res.status(400).send({"msg" : msg});
    }


    let list_favorite = null;
    let favorite_now = null;
    try {
        
        conn = await getconn();
        query = `select * from favorite where api_key = '${token}' AND id_game = '${id_game}'`;
        list_favorite = await executeQuery(conn, query);
        try {
            conn.release();
        } catch (error) {
            
        }

        if (list_favorite.length < 1) {
            msg = "Favorite Tidak Ditemukan";
            return res.status(404).send({"msg" : msg});
        }

        favorite_now = list_favorite[0];

    } catch (error) {
        console.log(error);
        msg = "Gagal Menyambung Ke Database";
        return res.status(400).send({"msg" : msg});
    }



    try {

        query = 
        `insert into history 
        values(null, '${token}', ${id_game}, null, 'Delete Favorite Game')`

        const add_history = await executeQuery(conn, query);
        try {
            conn.release();
        } catch (error) {
            
        }

    } catch (error) {
        console.log(error);
        msg = "Gagal Menambah History";
        return res.status(400).send({"msg" : msg});
    }



    let old_api_hit = user_now.api_hit;
    let new_api_hit = old_api_hit - 10;

    //cek api hit cukup/tidak
    if(new_api_hit < 0){
        msg = "Api Hit Tidak Mencukupi, Silahkan Top Up Terlebih Dahulu";
        return res.status(400).send({"msg" : msg});
    }

    try {

        query = 
        `UPDATE user 
        SET api_hit = ${new_api_hit}
        WHERE api_key = '${token}';`;

        const update_user = await executeQuery(conn, query);
        try {
            conn.release();
        } catch (error) {
            
        }

    } catch (error) {
        console.log(error);
        msg = "Gagal Merubah API User";
        return res.status(400).send({"msg" : msg});
    }


    try {
        
        query = 
        `DELETE FROM favorite 
        WHERE api_key = '${token}' AND id_game = '${id_game}';`;

        const delete_favorite = await executeQuery(conn, query);
        try {
            conn.release();
        } catch (error) {
            
        }

        let response = {
            "status" : "Success",
            "message" : "Berhasil Menghapus Favorite",
            "id_favorite" : favorite_now.id_favorite,
            "id_game" : id_game,
            "old_api_hit" : old_api_hit,
            "new_api_hit" :new_api_hit
        }

        return res.status(200).send(response);


    } catch (error) {
        console.log(error);
        msg = "Gagal Menghapus Favorite";
        return res.status(400).send({"msg" : msg});
    }


    msg = "Gagal Menghapus Favorite";
    return res.status(500).send({"msg" : msg});


});







module.exports = router