// Controllers folder and file has all the callback of the routes stored in it (core backend code)

const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


// listing's Index route callback 
module.exports.index = async (req,res)=>{
    const  allList = await Listing.find({}); // got all data
    res.render("listings/index.ejs" , {allList});
};

// listing's new route callback
module.exports.newForm = (req,res) =>{
    res.render("listings/new.ejs");
};

// listing's show route callback
module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path : "reviews",
        populate : {
            path : "author"
        }, 

    })
    .populate("owner"); // particular data

    if(!listing){
        req.flash("error", "Listing doesn't exist (don't request on this one)");
        return res.redirect("/listings");
    };

    res.render("listings/show.ejs" , {listing , mapToken: process.env.MAP_TOKEN});
};
                                        
// listing's create route callback
module.exports.createListing = async (req,res,next)=>{
    try{
      let response = await  geocodingClient.forwardGeocode({
            query: req.body.listing.location,  // as per location entered in the form ,we get our converted co ordinates
            limit: 1,
        })
        .send()


    let {title,description,price,location,country} = req.body.listing;

    let url = req.file.path ; // Access from req.file with has cloudinary's uploaded image url path and that clouds path we are gonna add in the mongodb
    let filename = req.file.filename;

    // add query
    const newListing = new Listing({
        title : title,
        description : description,
        price : price,
        location : location,
        country : country,
    });

    newListing.owner = req.user._id;

    newListing.image = {url, filename}; // adding the url and filename in newly created listing before save

    newListing.geometry = response.body.features[0].geometry;

   let savedListing = await newListing.save();
   console.log(savedListing);

    req.flash("success", "New listing is created");
    res.redirect("/listings");
    } catch(err){
        next(err);
    }

};

// listing's edit route callback
module.exports.editForm = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id); // getting particular data

    res.render("listings/edit.ejs" , {listing});
};

// listing's update route callback
module.exports.updateListing = async (req,res)=>{
    let {id} = req.params;
    let {title,description,price,location,country} = req.body.listing; // data from the edit

    const updateListing = await Listing.findByIdAndUpdate(id, {
        title : title,
        description: description,
        price : price,
        location: location,
        country : country,
    },{ runValidators: true, new: true });

    // New Uploaded image saving in updation .
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;

        updateListing.image = {url,filename};
        await updateListing.save();
    }
    req.flash("success", "Updated the listing");
    res.redirect(`/listings`);
};

// listing's delete route callback
module.exports.destroyListing = async(req,res)=>{
    let {id} = req.params;

    const deletedlist = await Listing.findByIdAndDelete(id);
    console.log(deletedlist);

    req.flash("success", "Deleted the listing")
    res.redirect("/listings");

};