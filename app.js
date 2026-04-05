if(process.env.NODE_ENV!= "production"){
    require('dotenv').config();
}


const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const path = require("path");
const methodOverride = require('method-override'); 
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const {listingSchema, reviewSchema} = require("./schema.js");
const { valid } = require('joi');
const Review = require('./models/review.js');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const {isLoggedIn} = require("./middleware.js");
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const MongoStore = require('connect-mongo').default;


// database connection link (non srv) (Cloud - atlas)
const dbUrl = process.env.ATLAS_DB_URL;

async function main() {
    try {
        await mongoose.connect(process.env.ATLAS_DB_URL);
        console.log("MongoDB connected");

        app.listen(3000, () => {
            console.log("app is listening");
        });

    } catch (err) {
        console.log("DB ERROR:", err);
    }
}

main();


const store =  MongoStore.create({
    mongoUrl : process.env.ATLAS_DB_URL,
    crypto : {
        secret : "mysecretcode",
    },
    touchAfter : 24 * 3600, // store session info (like cookie) in cloud database atlas for 24 hours , so even when refrest we are still logged in 
});
// we wil pass the session store in session Options and then session Options are passed in session middleware (app.use)
// To store the session info in database (cloud - atlas)

// Session

const sessionOptions = {
    store : store,
    secret : "mysecretcode",
    resave : false,
    saveUninitialized : true,
    cookie : {
        maxAge : 1000 * 60 * 60 * 24 * 3,
        expires : Date.now() + 1000 * 60 * 60 * 24 * 3,
        httpOnly : true,
    }, 
};

app.use(session(sessionOptions));

app.use(flash());
// pass-port

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});




app.engine('ejs', ejsMate);

app.set("views engine", "ejs");
app.set("views" , path.join(__dirname , "views"));

app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));




// ROUTES
// required all the /listing routes from the folder
const listings = require("./routes/listing.js");
const reviews = require("./routes/reviews.js");
const users = require("./routes/user.js");
const { register } = require('module');

// all listing routes required from routes > listing.js 
app.use("/", listings);

app.use("/", reviews);

app.use("/", users);



// ERROR

// when client enters wrong api route throw 404 "page not found " error
app.use((req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
});

// Error middleware
app.use((err,req,res,next)=>{
    let {statusCode = 500 , message = "something went wrong (message from error middleware)"} = err;
    res.status(statusCode).render("error.ejs", {err});
});


