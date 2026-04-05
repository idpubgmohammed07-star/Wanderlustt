require('dotenv').config({ path: '../.env' });

const mongoose = require('mongoose');
const Listing = require('../models/listing.js');
const initData = require('./data.js');

async function main() {
    try {
        await mongoose.connect(process.env.ATLAS_DB_URL);
        console.log("MongoDB connected");

        await initDB();   // ✅ AFTER connection

        mongoose.connection.close();
    } catch (err) {
        console.log("DB ERROR:", err);
    }
}

main();

// Insert data 

const initDB = async () => {
    await Listing.deleteMany({});

    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: "69c28ea15e6c3b88e7a4e319",
        geometry: {
            type: "Point",
            coordinates: [77.2090, 28.6139]
        }
    }));

    await Listing.insertMany(initData.data);
    console.log("Data initialized");
};

// Data inserted , seperately from the server 