//jshint esversion:6

const mongoose = require("mongoose");

const canjesSchema = new mongoose.Schema({
  idProductoCanjeado: String,
  productoCanjeado: String,
  puntosCanjeados: Number,
  fechaCanje: String,
  horaCanje: String,
  fechaValidado: String,
  horaValidado: String,
  validado: Boolean,
  cliente: Number,
  codValidacion: String
});


canjesSchema.set("timestamps", true);


module.exports = mongoose.model("Canje", canjesSchema);
