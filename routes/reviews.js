const express = require("express");
const router = express.Router();
const ExpressError = require('../utils/ExpressError.js');
const {listingSchema, reviewSchema} = require("../schema.js");
const Review = require('../models/review.js');
const Listing = require('../models/listing');
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");

const reviewController = require("../controllers/review.js");

// another func of validation for review model 
const validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);

    if(error){
        throw new ExpressError(400, error);
    }else{
        next();
    }
};





// Review
// Post route

router.post("/listings/:id/reviews" , isLoggedIn ,validateReview, reviewController.createReview ); // Same as we done in all listing routes here too , we imported the callback of post(create) route from the controller folder cause we seprated it their 


// Review delete route

router.delete("/listings/:id/reviews/:reviewId", isLoggedIn ,isReviewAuthor, reviewController.destroyReview );


module.exports = router;