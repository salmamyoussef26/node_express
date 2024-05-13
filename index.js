const express = require("express");
const mongoose = require("mongoose");
const {MONGO_IP, MONGO_USER, MONGO_PASS, MONGO_PORT} = require("./config/config.js");

const app = express()

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

// this function will try to connect with mongodb for 5 sec before starting the app.
const connectWithRetry = () =>{
    mongoose
    .connect(mongoURL)
    .then(() => console.log("successfully connected to db"))
    .catch((e) => {
        console.log(e)
        setTimeout(connectWithRetry, 5000)
    });

} 

connectWithRetry();

app.get("/", (req, res) => {
    res.send("<h2> Hi There!!!! </h2>");
})

const port = process.env.PORT || 3000;

app.listen(port, ()=> console.log('listening on port ${port'));