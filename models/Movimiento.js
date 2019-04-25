//jshint esversion:6

const mongoose = require("mongoose");



const movimientosSchema = new mongoose.Schema({
  accion: {
    type: String,
    uppercase: true,
    trim: true
  },
  fecha: String,
  hora: String,
  numeroCliente: {
    type: Number,
    min: 500000,
    max: 500999
  },
  nombreCliente: {
    type: String,
    uppercase: true,
    trim: true
  },
  comprobante: String,
  sesion: String
});

movimientosSchema.set("timestamps", true);


module.exports = mongoose.model("Movimiento", movimientosSchema);
