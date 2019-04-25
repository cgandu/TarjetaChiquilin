//jshint esversion:6

const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");


const adminsSchema = new mongoose.Schema({
  username: String,
  password: String
});

adminsSchema.plugin(passportLocalMongoose);



module.exports = mongoose.model("Admin", adminsSchema);
