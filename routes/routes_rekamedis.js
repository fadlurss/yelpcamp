var  express = require('express')
     router = express.Router()
     Pasien = require("../models/pasien")
     Rekamedis = require("../models/rekamedis")

     router.get('/', (req,res)=>{ 
         Pasien.find({}, function(err, data_rekamedis){
            res.render('v_rekamedis/index', {data_rekamedis:data_rekamedis});
         });
    }); 

    router.get('/new', (req,res)=>{ 
        res.render('v_rekamedis/new'); 
    }); 
    router.get('/contoh',(req,res)=>{
        Pasien.find({}, function(err, re){
            d = [];
            for (let ix = 0; ix < re.length; ix++) {
                d[ix] = re[ix].nama_lengkap;
            }
            res.json(d);
        });
        
    });
   router.post('/cariibu',(req,res)=>{
    //    console.log(req.body.np);
        Pasien.find({'nama_lengkap':req.body.np},(e,r)=>{
            console.log(r);
            res.json(r);
        });
   });
    

     module.exports = router;