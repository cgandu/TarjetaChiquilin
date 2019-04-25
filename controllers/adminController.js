//jshint esversion:6

const _ = require("lodash");
const Usuario = require(__dirname+"/../models/Usuario");
const funciones = require(__dirname+"/funciones");
const fechaAString = funciones.fechaAString;
const horaAString = funciones.horaAString;


exports.admin_controller_get = function(req, res) {
    res.render("admin");

};

exports.admin_controller_post = function(req, res) {

  const partialUserString1 = _.replace(req.body.numTarjeta, "[", "");
  const partialUserString2 = _.replace(partialUserString1, "%", "");
  const finalUserString = _.replace(partialUserString2, "_", "");

  if (_.startsWith(req.body.numTarjeta, "%") && _.endsWith(req.body.numTarjeta, "_")) {
    Usuario.findOne({numeroCliente: finalUserString}, function(err, doc) {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        if (doc) {
          // tomo 3 ultimos elementos de array de accionesCliente
          //--- Estan ordenados por orden en el Array de docs o por el query find
          //--- Mas abajo otra opcion: query find en base Movmientos timestamps y no tengo duda sobre orden ---
          //---Pero serian un querys distinto adicional....paja
          var fechaTresMovimientos = [];
          var horaTresMovimientos = [];
          var accionTresMovimientos = [];
          const lengthAcciones = doc.accionesCliente.length;

          for (var i = 1; i < lengthAcciones + 1; i++) {
            var mov = doc.accionesCliente[lengthAcciones - i].accion;
            fechaTresMovimientos.push(fechaAString(doc.accionesCliente[lengthAcciones - i].createdAt));
            horaTresMovimientos.push(horaAString(doc.accionesCliente[lengthAcciones - i].createdAt));
            accionTresMovimientos.push(mov);
          }
          res.render("cargas", {
            nombreCliente: doc.nombreCliente,
            numeroCliente: doc.numeroCliente,
            puntosCliente: doc.puntosCliente,
            ultimaAccion: accionTresMovimientos[0],
            penUltimaAccion: accionTresMovimientos[1],
            antePenUltimaAccion: accionTresMovimientos[2],
            ultimaHora: horaTresMovimientos[0],
            penUltimaHora: horaTresMovimientos[1],
            antePenUltimaHora: horaTresMovimientos[2],
            ultimaFecha: fechaTresMovimientos[0],
            penUltimaFecha: fechaTresMovimientos[1],
            antePenUltimaFecha: fechaTresMovimientos[2]
          });
        } else {
          res.render("error", {accionRegistro: "Usuario no existe en registro", accionConfirmada: ""});
        }
      }
    });
  } else {
    res.render("error", {accionRegistro: "Error al deslizar Tarjeta", accionConfirmada: ""});
  }

};
