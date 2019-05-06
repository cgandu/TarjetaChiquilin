//jshint esversion:6

const _ = require("lodash");
const crypto = require("crypto");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const Usuario = require(__dirname+"/../models/Usuario");
const Movimiento = require(__dirname+"/../models/Movimiento");
const funciones = require(__dirname+"/funciones");
const fechaAString = funciones.fechaAString;
const horaAString = funciones.horaAString;
const activacionEmail = funciones.activacionEmail;


exports.registro_controller_get = function(req, res){
  if (req.isAuthenticated()) {
    return res.redirect("/usrhome");
  } else {
    return res.render("registro", {logmethod: "Log In"});
  }

};

exports.registro_controller_post = function(req, res){
  //
  // const partialUserString1 = _.replace(req.body.numCliente, "[", "");
  // const partialUserString2 = _.replace(partialUserString1, "%", "");
  // const finalUserString = _.replace(partialUserString2, "_", "");

// if (_.startsWith(req.body.numCliente, "%") && _.endsWith(req.body.numCliente, "_")) {
  const nuevaDate = new Date();
  const fechaRegistro = fechaAString(nuevaDate);
  const horaRegistro = horaAString(nuevaDate);
  const linkhash = crypto.randomBytes(20).toString('hex');

  const nuevoMovimiento = new Movimiento({
    accion: "Usuario registrado",
    fecha: fechaRegistro,
    hora: horaRegistro,
    email: req.body.mailCliente,
    username: req.body.username,
    nombreCliente: req.body.nomCliente,
  });


  // var promise3 = new Promise(function(resolve, reject){
  //
  //   Usuario.findOne({dniCliente: req.body.dniCliente}, function(err, doc){
  //     if (!err) {
  //       if (doc) {
  //         return reject("DNI Cliente ya existe //");
  //       } else {
  //         resolve("DNI OK");
  //       }
  //     } else {
  //       console.log(err);
  //       return res.send("Error con DNI ingresado");
  //
  //     }
  //   });
  // });

  var promise2 = new Promise(function(resolve, reject){

    Usuario.findOne({email: req.body.mailCliente}, function(err, doc){
      if (!err) {
        if (doc) {
          return reject("E-mail de cliente ya existe //");
        } else {
          resolve("Mail OK");
        }
      } else {
        console.log(err);
        return res.send("Error con email ingresado");

      }
    });
  });

  var promise1 = new Promise(function(resolve, reject){

    Usuario.findOne({username: req.body.username}, function(err, doc){
      if (!err) {
        if (doc) {
          return reject("Usuario ya existe //");
        } else {
          resolve("Usuario OK");
        }
      } else {
        console.log(err);
        return res.send("Error con Usuario ingresado");
      }
    });
  });

Promise.all([
  promise1,
  promise2,
  // promise3
]).then(function(resultado){
  console.log("Cumple condiciones");

  Usuario.register({
  username: req.body.username,
  email: req.body.mailCliente,
  accionesCliente: [{
    accion: "Usuario registrado",
    fecha: fechaRegistro,
    hora: horaRegistro
  }],
  esAdmin: false,
  activado: false,
  activadoHash: linkhash,
  asignado: false,
  fechaCreado: fechaRegistro}, req.body.password, function(err, user){
      if (err) {
        console.log(err);
        return res.redirect("/registro");
      } else {
        passport.authenticate("local")(req, res, function(){
          activacionEmail(linkhash, req.body.mailCliente);
          req.logout();
          res.render("activecuenta", {logmethod: "LogIn"});
          nuevoMovimiento.save(function(err) {
            if (err) {
              return console.log(err);
            }
          });
        });
      }
    });

})
.catch(function(errorArrojado){
    res.render("error", {accionRegistro: errorArrojado, accionConfirmada: ""});
});


};
