//jshint esversion:6
require('dotenv').config();
const throng = require("throng");
const WORKERS = process.env.WEB_CONCURRENCY || 1; // para escalabilidad de procesos


throng({
  workers: WORKERS,
  lifetime: Infinity
}, start);

function start () {
  // console.log(process.memoryUsage().rss / 1024 / 1024 + " MB"); // Resident Set Size
  //
  // console.log(process.memoryUsage().heapTotal / 1024 / 1024 + " MB"); // Heap Total
  //
  // console.log(process.memoryUsage().heapUsed / 1024 / 1024 + " MB"); // Heap Used


  const express = require("express");
  const bodyParser = require("body-parser");
  const ejs = require("ejs");
  const mongoose = require("mongoose");
  const $ = require("jquery");
  const session = require("express-session");
  const MongoStore = require('connect-mongo')(session);
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
  const usrController = require(__dirname + "/controllers/usrController");
  const googleController = require(__dirname + "/controllers/googleController");
  const canjeaController = require(__dirname + "/controllers/canjeaController");
  const resetpassController = require(__dirname + "/controllers/resetpassController");
  const varios = require(__dirname + "/controllers/varios");
  const _ = require("lodash");
  const funciones = require(__dirname+"/controllers/funciones");
  const fechaAString = funciones.fechaAString;
  const horaAString = funciones.horaAString;
  const notificacionCanje = funciones.notificacionCanje;
  const notificacionReset = funciones.notificacionReset;
  const crypto = require("crypto");



  const app = express();
  app.set("view engine", "ejs");

  app.use(bodyParser.urlencoded({extended: true}));
  app.use(express.static("public"));

  app.use(session({
    secret: "Es solo para mantener sesion abierta.",
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  }));

  app.use(passport.initialize());
  app.use(passport.session());

//mongodb://localhost:27017/chiquilinDB
  mongoose.connect(process.env.MONGO_ATLAS_SRV, {useNewUrlParser: true});

  const Admin = require(__dirname+"/models/Admin");
  const Movimiento = require(__dirname+"/models/Movimiento");
  const Usuario = require(__dirname+"/models/Usuario");
  const Producto = require(__dirname+"/models/Producto");
  const Canje = require(__dirname+"/models/Canje");

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
      res.redirect("/usrhome");
    } else {
      res.render("home", {logmethod: "Login"});
    }
  });


  app.get("/olvido", resetpassController.olvido_get);
  app.post("/olvido", resetpassController.olvido_post );
  app.get("/reset/:token", resetpassController.reset_token_get);
  app.post("/reset/:token", resetpassController.reset_token_post);
  app.get("/registro", registroController.registro_controller_get);
  app.post("/registro", registroController.registro_controller_post);
  app.get("/login", loginController.login_controller_get);
  app.post("/login", loginController.login_controller_post);
  app.get("/active/:linkHash", activaController.activa_controller_get);
  app.get("/auth/google", googleController.google_controller_verificar);
  app.get("/auth/google/usrhome", googleController.google_controller_verificado);
  app.get("/comofunciona", varios.comofunciona_controller_get);
  app.get("/canjea", varios.canjea_controller_get);
  app.get("/canjea/:idObjeto", varios.canjeaesp_controller_get);
  app.get("/beneficios", varios.beneficios_controller_get);

  //middleware para redirigir si no esta isAuthenticated
  app.all("*", checkLogueado);

  app.get("/canjea/confirma/:idObjeto", usrController.canje_confirma_get);
  app.post("/canjea/confirma/:idObjeto", usrController.canje_confirma_post);
  app.get("/usrhome", usrController.usrhome_controller_get);

  app.get("/logout", loginController.logout_controller_get);

  //middleware para redirigir si esAdmin = false
  app.all("*", checkAdmin);

  app.get("/admin", adminController.admin_controller_get);
  app.post("/admin", adminController.admin_controller_post);
  app.post("/admin/clientes/:clienteAddress", adminController.cliente_controller_post);
  app.get("/descargas", adminController.descargas_controller_get);
  app.get("/asignar", adminController.asignar_controller_get);
  app.post("/asignar", adminController.asignar_controller_post);
  app.post("/asignartarjeta", adminController.asignartarjeta_controller_post);
  app.post("/canjes", adminController.canjes_habilitados_post);
  app.post("/validar", adminController.validar_canjes_post);

  // app.post("/canjes", function(req, res){
  //   const nombreCliente = req.body.nombreCliente;
  //   const numeroCliente = req.body.numeroCliente;
  //   Canje.find({cliente: numeroCliente, validado: false}, function(err, docs){
  //     if (err) {
  //       return err;
  //     } else {
  //       res.render("canjeshabilitados", {nombreCliente: nombreCliente, docs: docs});
  //     }
  //   });
  // });

  // app.post("/validar", function(req, res){
  //   const codValidacion = req.body.codValidacion;
  //   const idCanje = req.body.idCanje;
  //
  //   var validacionCanje = new Promise(function(resolve, reject){
  //     Canje.findOne({_id: idCanje}, function(err, doc){
  //       if (err) {
  //         return reject(err);
  //       } else if (!doc) {
  //         return reject("No se encontro numero de canje");
  //       } else if (codValidacion !== doc.codValidacion) {
  //         return reject("Codigo de validacion no es valido");
  //       } else if (codValidacion === doc.codValidacion) {
  //         return resolve(doc._id);
  //       }
  //     });
  //   }).then(function(id){
  //     return new Promise(function(resolve, reject){
  //     Canje.findOneAndUpdate({_id: id}, {$set: {validado: true}}, function(err, doc){
  //       if (err) {
  //         return reject(err);
  //       } else if (!doc) {
  //         return reject("No se encontro numero de canje");
  //       } else {
  //         return resolve(codValidacion);
  //       }
  //     });
  //     });
  //   }).then(function(codValidacion){
  //     res.render("confirma", {horaConfirmada: "Canje validado exitosamente", accionConfirmada: codValidacion});
  //   }).catch(function(err){
  //     console.log(err);
  //     res.render("error", {accionConfirmada: err});
  //   });
  //
  // });

  let port = process.env.PORT;
  if (port == null || port == "") {
    port = 3000;
  }

  app.listen(port, function(req, res) {
    console.log("Servidor iniciado");
  });

  //
  // app.get("/actualizoproductos", function(req, res){
  //
  //   Producto.find({}, function(err, docs){
  //
  //     if (err) {
  //       return "Error al buscar productos: " + err;
  //     } else if(!docs) {
  //       return "No se encontraron productos";
  //     } else {
  //       res.render("actualizacionproductos", {docs: docs});
  //     }
  //
  //   });
  //
  // });


////////////////// ACTUALIZA DESCRIPCIÓN PRODUCTOS /////////////////////
// app.post("/actualizoproductos", function(req, res){
//
//
//   const _id = req.body._idProducto;
//   const nombre = req.body.nombreProducto;
//   const desc = req.body.descripcionProducto;
//
//
//
//   for (var i = 0; i<18 ; i++){
//     Producto.findOneAndUpdate({_id: _id[i]}, {$set: {descripcionProducto: desc[i]}}, function(err, doc){
//       if (err) {
//         return err;
//       } else if (!doc) {
//         return "Documento no encontrado";
//       }
//     });
//
//     // console.log(_id[i]);
//     // console.log(nombre[i]);
//     // console.log(desc[i]);
//   }
//
// });

  ///////////////////// CARGA PRODUCTOS /////////////////

  // app.get("/cargaproductos", function(req, res) {
  // res.render("cargaproductos");
  //
  //
  // });
  //
  // app.post("/cargaproductos", function(req, res) {
  //   const nombreProducto = req.body.nombreProducto;
  //   const puntosProducto = req.body.puntosProducto;
  //   const nombreImagen = req.body.nombreImagen;
  //   const nombreImagen2 = req.body.nombreImagen2;
  //   const descripcionProducto = req.body.descripcionProducto;
  //
  //
  //   const nuevoProducto = new Producto ({
  //     nombreProducto: nombreProducto,
  //     puntosProducto: puntosProducto,
  //     nombreImagen: nombreImagen,
  //     nombreImagen2: nombreImagen2,
  //     activo: true,
  //     descripcionProducto: descripcionProducto
  //   });
  //
  //   nuevoProducto.save(function(err){
  //     if (err) {
  //       return err;
  //     } else {
  //       res.redirect("/cargaproductos");
  //     }
  //   });
  // });
}
