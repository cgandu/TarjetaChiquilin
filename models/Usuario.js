//jshint esversion:6

const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

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

const usuariosSchema = new mongoose.Schema({
  username: String,
  password: String,
  nombreCliente: {
    type: String,
    uppercase: true,
    trim: true
  },
  numeroCliente: {
    type: Number,
    min: 500000,
    max: 599999
  },
  puntosCliente: {
    type: Number,
    min: 0,
    max: 30000
  },
  dniCliente: {
    type: Number,
    min: 4000000,
    max: 99999999
  },
  accionesCliente: [movimientosSchema],
  email: {
    type: String,
    uppercase: true,
    trim: true,
    required: true
  },
  esAdmin: Boolean,
  activado: Boolean,
  activadoHash: String,
  asignado: Boolean,
  fechaCreado: String,
  googleId: String
});



usuariosSchema.set("timestamps", true);

usuariosSchema.plugin(passportLocalMongoose);
usuariosSchema.plugin(findOrCreate);



module.exports = mongoose.model("Usuario", usuariosSchema);
