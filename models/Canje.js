//jshint esversion:6

const mongoose = require("mongoose");

const canjesSchema = new mongoose.Schema({
  productoCanjeado: String,
  fechaCanje: String,
  fechaValidado: String,
  validado: Boolean,
  cliente: Number,
  codValidacion: String
});


canjesSchema.set("timestamps", true);


module.exports = mongoose.model("Canje", canjesSchema);
