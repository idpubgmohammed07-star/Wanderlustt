const Listing = require("./models/listing");
const Review = require("./models/review");

// must login before creating/edit/delete the listing

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash("error","You must login first");
        return res.redirect("/login");
    };
    next();
};


module.exports.isOwner = async (req,res,next)=> {
    let {id} = req.params ;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the owner (required permission)");
        return res.redirect(`/listings/${id}`);
    }
    next();
};
module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;

    let review = await Review.findById(reviewId);

    if (!review) {
        req.flash("error", "Review not found");
        return res.redirect(`/listings/${id}`);
    }

    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "Not the author of this review");
        return res.redirect(`/listings/${id}`);
    }

    next();
};