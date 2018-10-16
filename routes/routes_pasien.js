var  express = require('express')
     router = express.Router()
     Pasien = require("../models/Pasien")
    
     router.get('/', (req,res)=>{ 
         Pasien.find({}, function(err, data_pasien){
            res.render('v_pasien/index', {data_pasien:data_pasien});
         });
    }); 

    router.get('/new', (req,res)=>{ 
        res.render('v_pasien/new'); 
    }); 

    router.post('/new', (req,res)=>{ 
        var nama_lengkap = req.body.nama_lengkap;
        var nomor_bpjs = req.body.nomor_bpjs;
        var tanggal_lahir = req.body.tanggal_lahir;
        var alamat = req.body.alamat;
        var nomor_hp = req.body.nomor_hp;
        var nama_ibu_kandung = req.body.nama_ibu_kandung;
        // res.json(nama_lengkap);
        var newPasien = {nama_lengkap: nama_lengkap, nomor_bpjs:nomor_bpjs, tanggal_lahir:tanggal_lahir, alamat:alamat, nomor_hp:nomor_hp, nama_ibu_kandung: nama_ibu_kandung};
        Pasien.create(newPasien, function(err, input_pasien_baru){
            if(err){//jika gagal balik ke form new
                console.log(err);
                res.render("v_pasien/new");
            } else {
                res.redirect("/");
            }
        });
        // res.send("terkirin");
    }); 

     module.exports = router;