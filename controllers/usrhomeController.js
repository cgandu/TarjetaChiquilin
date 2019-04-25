//jshint esversion:6

const Usuario = require(__dirname+"/../models/Usuario");
const funciones = require(__dirname+"/funciones");
const fechaAString = funciones.fechaAString;
const horaAString = funciones.horaAString;

exports.usrhome_controller_get = function(req, res) {

  if (!req.user.esAdmin) {


    Usuario.findOne({_id: req.user._id}, function(err, doc) {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        if (doc) {
          if (doc.asignado === true) {
            res.render("usrhome", {
              movs: doc.accionesCliente,
              titulo: "Mi Cuenta",
              nombreCliente: "Cliente: " + doc.nombreCliente,
              numeroCliente: "Numero: " + doc.numeroCliente,
              puntosCliente: "Puntos: " + doc.puntosCliente,
              logmethod: "LogOut"
            });
          } else {
            if (doc.activado === true) {
              res.render("usrhome", {
                movs: doc.accionesCliente,
                titulo: "Tu credencial te espera en Chiquilín",
                nombreCliente: "Buscá tu Tarjeta Chiquilín en tu próxima visita y empezá a sumar puntos",
                mensaje1: "\n",
                mensaje2: "\n",
                mensaje3: "Desde esta pantalla vas a poder revisar tus consumos, tus puntos acumulados, realizar canjes y más",
                logmethod: "LogOut"
              });
            } else {
              res.render("usrhome", {
                movs: doc.accionesCliente,
                titulo: "Completá el proceso de inscripción",
                nombreCliente: "Un mensaje fue enviado a tu casilla de correo electrónico. Segui las instrucciones del mensaje y activá tu cuenta",
                mensaje1: "Una vez activada podrás pedir tu credencial de Tarjeta Chiquilín en nuestro local",
                mensaje2: "\n \n",
                mensaje3: "Con tu credencial vas a poder revisar tus consumos, tus puntos acumulados, realizar canjes y más",
                logmethod: "LogOut"
              });
            }
          }

        } else {
          res.render("error", {accionRegistro: "Usuario no existe en registro", accionConfirmada: ""});
        }
      }
    });
  } else {
    res.redirect("/");
  }




};
