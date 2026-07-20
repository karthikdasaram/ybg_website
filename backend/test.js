const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const uri =
    "mongodb+srv://chb0250_db_user:lFxQCCE3Rp0oRM78@cluster0.uod42fr.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

mongoose
    .connect(uri)
    .then(() => {
        console.log("Connected!");
        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });