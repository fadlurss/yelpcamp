require('dotenv').config();
const express = require('express'),
    helmet = require('helmet'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    flash = require('connect-flash'),
    morgan = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    configDB = require('./config/database.js'),
    session = require('express-session'),
    Categories = require('./models/categories'),
    methodOverride = require('method-override'),
    cors = require('cors'),
    validator = require('express-validator'),
    MongoStore = require('connect-mongo')(session),
    commentRoutes = require("./routes/routes_comment"),
    campgroundRoutes = require("./routes/routes_campground"),
    indexRoutes = require("./routes/routes_user"),
    bookingRoutes = require("./routes/routes_booking"),
    adminRoutes = require("./routes/routes_admin"),
    categoriesRoutes = require("./routes/routes_categories");

app = express();
mongoose.connect(configDB.url, {
    useNewUrlParser: true
}); // connect to our database
require('./config/passport')(passport); // pass passport for configuration
app.set('view engine', 'ejs'); // set up ejs for templating
app.enable("trust proxy");
app.use(helmet());
app.use(validator());
// app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({
    extended: false
})); // ini harus true, nanti tidak bisa diedit
app.use(methodOverride("_method"));
app.locals.moment = require('moment');
app.use(flash());
app.use(cors());
app.use(require('express-session')({
    secret: '#%^bnBHEGVB454Nfc2@', // session secret
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    }),
    cookie: {
        maxAge: 180 * 60 * 1000
    }
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(express.static(__dirname + "/public")); // jangan pakai koma seperti config
app.use(express.static(__dirname, +"/config"));

app.use(async function (req, res, next) { //buat melihat siapa yang login, ada di header welcome back!! semacam session bisa mengeluarkan email 
    res.locals.currentUser = req.user;
    res.locals.session = req.session;
    res.locals.error = req.flash("error"); //utk mengirim pesan ke semua router
    res.locals.success = req.flash("success");
    res.locals.pesan_cari = req.flash("pesan_cari");
    const data_cat = await Categories.find({});
    res.locals.cate = data_cat;
    // res.setHeader("Content-Type", "application/json");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use("/", indexRoutes); //ini harus dibawah app.use(function(req,res,next))
app.use("/campground", campgroundRoutes);
app.use("/admin", adminRoutes);
app.use("/campground/:id/comment", commentRoutes);
app.use("/categories", categoriesRoutes);
app.use("/booking", bookingRoutes);


app.get("*", function (req, res) {
    res.send("404");
});

const host = '0.0.0.0';
const port = process.env.PORT || 4000;
app.listen(port, host, function (req, res) {
    console.log("Server yelpcamp telah dimulai");
});