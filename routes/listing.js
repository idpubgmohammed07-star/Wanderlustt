const express = require("express");
const router = express.Router();
const ExpressError = require('../utils/ExpressError.js');
const {listingSchema, reviewSchema} = require("../schema.js");
const Listing = require('../models/listing');
const { isLoggedIn , isOwner } = require("../middleware.js");

const listingController = require("../controllers/listing.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage}); // means multer parsed the file data and then will send it our cloudinary account's storage . we set our multer data storing to cloudinary' storage destination



// validation error func(middleware) that can be pass in any request

const validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);

    if(error){
        throw new ExpressError(400, error);
    }else{
        next();
    }
};


// WILL CHANGE ALL FROM app.get to router.get


// Index route
router.get("/listings" , listingController.index ); // imported the callback of index route from the controller folder cause we seprated it their 

// New route (form for add)
router.get("/listings/new" , isLoggedIn, listingController.newForm );

// Show route
router.get("/listings/:id" ,listingController.showListing );

// Create route (post / add) - {adding try and catch}
router.post("/listings",isLoggedIn, upload.single('listing[image]'),validateListing, listingController.createListing);
  

// Updation
// Edit Route (edit form)
router.get("/listings/:id/edit" , isLoggedIn, isOwner ,listingController.editForm );

// Update Route (put)
router.put("/listings/:id" ,isLoggedIn,isOwner,upload.single('listing[image]'), validateListing , listingController.updateListing);

// Delete Route
router.delete("/listings/:id"  ,isLoggedIn, isOwner, listingController.destroyListing);


module.exports = router;