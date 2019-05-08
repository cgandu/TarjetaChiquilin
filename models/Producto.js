//jshint esversion:6


const mongoose = require("mongoose");



const productosSchema = new mongoose.Schema({
  nombreProducto: {
    type: String,
    uppercase: true,
    trim: true
  },
  puntosProducto: {
    type: Number,
    min: 1000,
    max: 999999
  },
  nombreImagen: String,
  nombreImagen2: String,
  activo: Boolean
});

productosSchema.set("timestamps", true);


module.exports = mongoose.model("Producto", productosSchema);
