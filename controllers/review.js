// all callback of review routes

const Listing = require("../models/listing");
const Review = require("../models/review");

// review's create route callback
module.exports.createReview = async(req,res,next)=>{
    try{
        let listing =  await Listing.findById(req.params.id);

        let newReview = new Review(req.body.review);
        newReview.author = req.user._id;
        newReview.listing = listing._id;
      

        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();

        req.flash("success", "New review is created");
        res.redirect(`/listings/${listing._id}`);
    }catch(err){
        next(err);
    };


};

// review's delete route callback
module.exports.destroyReview = async(req,res)=>{
    let {id , reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull : {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Delted the review");
    res.redirect(`/listings/${id}`);
};