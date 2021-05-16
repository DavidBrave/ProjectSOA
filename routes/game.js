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



module.exports = router