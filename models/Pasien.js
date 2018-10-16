var mongoose = require('mongoose');
var pasienSchema = new mongoose.Schema({
    nama_lengkap : {
            type: String
    },
    nomor_bpjs : {
            type: String,
            unique: true
    },
    tanggal_lahir : {
        type: Date
    },
    alamat : {
        type: String,
    },
    nomor_hp : {
        type: String
    },
    nama_ibu_kandung: {
        type: String
    }


});


module.exports = mongoose.model("Pasien", pasienSchema);