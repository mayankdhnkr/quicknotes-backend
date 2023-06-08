const mongoose = require('mongoose');
require("dotenv").config({ path: __dirname + "/.env" });
const mongoURI = process.env["MONGO_URI"];

const connectToMongo = async() => {
    try {
        mongoose.set('strictQuery', false)
        mongoose.connect(mongoURI) 
        console.log(mongoURI); 
        console.log('Mongo connected');
    }
    catch(error) {
        console.log(error)
        process.exit()
    }
}

module.exports = connectToMongo;