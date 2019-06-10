//jshint esversion:6

const crypto = require("crypto");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const Usuario = require(__dirname+"/../models/Usuario");
const Movimiento = require(__dirname+"/../models/Movimiento");
const funciones = require(__dirname+"/funciones");
const fechaAString = funciones.fechaAString;
const horaAString = funciones.horaAString;
const notificacionReset = funciones.notificacionReset;


exports.olvido_get = function(req, res){
  res.render("olvido");
};

exports.olvido_post = function(req, res){
  var envioToken = new Promise(function(resolve, reject){
    Usuario.findOne({email: req.body.emailcliente, googleId: {$exists: false}}, function(err, doc){
      if (err) {
        return reject("Error al ingresar email: " + err);
      } else if (!doc) {
        return reject("Direccion de email invalida o inexistente");
      } else {
        resolve(doc);
      }
    });
  }).then(function(usuario) {
      return new Promise(function(resolve, reject){
        const token = crypto.randomBytes(20).toString('hex');
        const expira = Date.now() + 3600000;
        Usuario.findOneAndUpdate({_id: usuario._id}, {resetPasswordToken: token, resetPasswordExpira: expira}, {new: true}, function(err, user){
          // options de mongoose: new:true devuelve doc actualizado en lugar del viejo
          if (err) {
            return reject("Error al registrar Token: " + err);
          } else {
            console.log("token generado");
            resolve(user);
          }
        });

      });
  }).then(function(u) {
    notificacionReset(u);
  }).then(function(){
    res.render("confirma", {horaConfirmada: "Solicitud procesada correctamente"});
  }).catch(function(err){
    console.log(err);
    return res.send("Error de solicitud: " + err);
  });
};

exports.reset_token_get = function(req, res) {
  Usuario.findOne({resetPasswordToken: req.params.token, resetPasswordExpira: {$gt: Date.now()}}, function(err, doc){
    if (err) {
      console.log(err);
      return res.send(err);
    } else if(!doc) {
      console.log("Su solicitud expiró o es inválida. Por favor, solicítela nuevamente.");
      return res.send("Su solicitud expiró o es inválida. Por favor, solicítela nuevamente.");
    } else {
      res.render("reset", {token: req.params.token});
    }
  });
};

exports.reset_token_post = function(req, res) {

//Mejor usar Promise All: mas prolijo y exige que se cumplan todas las promesas

  const nuevopass = req.body.np1;
  var reseteoPass = new Promise (function(resolve, reject) {
    Usuario.findOne({resetPasswordToken: req.params.token, resetPasswordExpira: {$gt: Date.now()}}, function(err, usuario){
      if (err) {
        return reject("Solicitud expiró o es inválida: " + err);
      } else if (!usuario) {
        return reject("Solicitud expiró o es inválida: " + err);
      } else {
        console.log("usuario con token encontrado");
        return resolve(usuario);
      }
    });
  }).then(function(usuario) {
    return new Promise(function(resolve, reject){
      usuario.setPassword(nuevopass, function(err, u){
        if (err) {
          console.log("error al setpassword");
          return reject("Error al registrar nueva contraseña: " + err);
        } else {
          u.save(function(err){
            if (err) {
              console.log(err);
              return reject(err);
            } else {
              console.log("Password cambiado correctamente");
              return resolve(u);
            }
          });
        }
      });
    });
  }).then(function(u){
      return new Promise(function(resolve, reject){
      Usuario.findOneAndUpdate({_id: u._id}, {$unset: {resetPasswordToken: "", resetPasswordExpira: ""}}, function(err, usuario){
        if (err){
          console.log("Error al borrar reset token y expiracion: " + err);
          return reject(err);
        } else if (!usuario) {
          console.log("usuario no encontrado al borrar reset token y expira");
          return reject("Usuario no encontrado");
        } else {
          return resolve(u);
        }
      });
    });
  }).then(function(u){
      const nuevaDate = new Date();
      const fechaAccion = fechaAString(nuevaDate);
      const horaAccion = horaAString(nuevaDate);
      const nuevoMovimiento = new Movimiento({
        accion: "CAMBIO PASS",
        fecha: fechaAccion,
        hora: horaAccion,
        numeroCliente: u.numeroCliente,
        nombreCliente: u.nombreCliente,
        comprobante: "USR"
      });
      nuevoMovimiento.save(function(err){
        if (err) {
          return err;
        }
      });

  }).then(function(){
    res.render("confirma", {horaConfirmada: "Contraseña cambiada exitosamente"});
  }).catch(function(err){
    console.log(err);
    return res.send(err);
  });
};
