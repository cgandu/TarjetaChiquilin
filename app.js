//jshint esversion:6
require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const $ = require("jquery");
const session = require("express-session");
const passport = require("passport");
const findOrCreate = require("mongoose-findorcreate");
const loginController = require(__dirname + "/controllers/loginController");
const adminController = require(__dirname + "/controllers/adminController");
const clienteController = require(__dirname + "/controllers/clienteController");
const registroController = require(__dirname + "/controllers/registroController");
const descargasController = require(__dirname + "/controllers/descargasController");
const activaController = require(__dirname + "/controllers/activaController");
const asignarController = require(__dirname + "/controllers/asignarController");
const asignartarjetaController = require(__dirname + "/controllers/asignartarjetaController");
const usrhomeController = require(__dirname + "/controllers/usrhomeController");
const googleController = require(__dirname + "/controllers/googleController");
const _ = require("lodash");
const funciones = require(__dirname+"/controllers/funciones");
const fechaAString = funciones.fechaAString;
const horaAString = funciones.horaAString;
const crypto = require("crypto");






const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: "Es solo para mantener sesion abierta.",
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect(process.env.MONGO_ATLAS_SRV, {useNewUrlParser: true});

const Admin = require(__dirname+"/models/Admin");
const Movimiento = require(__dirname+"/models/Movimiento");
const Usuario = require(__dirname+"/models/Usuario");

passport.use(Usuario.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  Usuario.findById(id, function(err, user) {
    done(err, user);
  });
});






function checkLogueado(req, res, next) {
  if (req.isAuthenticated()) { return next(null); }
  res.redirect("/login");
}

function checkAdmin(req, res, next) {
  if (req.user.esAdmin) { return next(null);}
  res.redirect("/usrhome");
}

app.get("/", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("home", {logmethod: "Log Out"});
  } else {
    res.render("home", {logmethod: "Log In"});
  }

});


app.get("/registro", registroController.registro_controller_get);
app.post("/registro", registroController.registro_controller_post);
app.get("/login", loginController.login_controller_get);
app.post("/login", loginController.login_controller_post);
app.get("/active/:linkHash", activaController.activa_controller_get);
app.get("/auth/google", googleController.google_controller_verificar);
app.get("/auth/google/usrhome", googleController.google_controller_verificado);

app.get("/comofunciona", function(req, res) {
  if (req.isAuthenticated()) {
    return res.render("comofunciona", {logmethod: "Log Out"});
  } else {
    return res.render("comofunciona", {logmethod: "Log In"});
  }
});

app.get("/canjea", function(req, res) {
  if (req.isAuthenticated()) {
    return res.render("canjea", {logmethod: "Log Out"});
  } else {
    return res.render("canjea", {logmethod: "Log In"});
  }
});

app.get("/beneficios", function(req, res) {
  if (req.isAuthenticated()) {
    return res.render("beneficios", {logmethod: "Log Out"});
  } else {
    return res.render("beneficios", {logmethod: "Log In"});
  }
});

//middleware para redirigir si no esta isAuthenticated
app.all("*", checkLogueado);

app.get("/vinos", function(req, res){
  Usuario.findOne({_id: req.user._id}, function(err, doc){
    if (doc) {
      res.render("vinos", {
        movs: doc.accionesCliente,
        titulo: "Mi Cuenta",
        nombreCliente: "Cliente: " + doc.nombreCliente,
        numeroCliente: "Numero: " + doc.numeroCliente,
        puntosCliente: "Puntos: " + doc.puntosCliente,
        logmethod: "LogOut"
      });
    }
  });


});


app.get("/usrhome", usrhomeController.usrhome_controller_get);

app.get("/logout", loginController.logout_controller_get);

//middleware para redirigir si esAdmin = false

app.all("*", checkAdmin);

app.get("/admin", adminController.admin_controller_get);
app.post("/admin", adminController.admin_controller_post);
app.post("/admin/clientes/:clienteAddress", clienteController.cliente_controller_post);
app.get("/descargas", descargasController.descargas_controller_get);
app.get("/asignar", asignarController.asignar_controller_get);
app.post("/asignar", asignarController.asignar_controller_post);
app.post("/asignartarjeta", asignartarjetaController.asignartarjeta_controller_post);

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(req, res) {
  console.log("Servidor iniciado");
});
