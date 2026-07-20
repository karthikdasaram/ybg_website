const mongoose = require("mongoose");
require("dotenv").config();

console.log("MONGO_URI =", process.env.MONGO_URI);

const uri = process.env.MONGO_URI;

mongoose
    .connect(uri)
    .then(() => {
        console.log("MongoDB Connected Successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Connection Failed:");
        console.error(error.message);
        process.exit(1);
    });