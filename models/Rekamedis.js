var mongoose = require('mongoose');
var rekamedisSchema = new mongoose.Schema({
    nama_penyakit : {
            type: String,
            unique: true,
    },
    riwayat_penyakit : {
            type: String,
            unique: true,
    },
    identitas_pasien : {
        id : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pasien'
        },
        nama_lengkap: String
    },
    
});


module.exports = mongoose.model("Rekamedis", rekamedisSchema);