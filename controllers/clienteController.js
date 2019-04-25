//jshint esversion:6

const _ = require("lodash");
const Usuario = require(__dirname + "/../models/Usuario");
const Movimiento = require(__dirname+"/../models/Movimiento");
const funciones = require(__dirname+"/funciones");
const fechaAString = funciones.fechaAString;
const horaAString = funciones.horaAString;
const notificacionPuntos = funciones.notificacionPuntos;


exports.cliente_controller_post = function(req, res) {


  const puntosAgregados = Math.round(0.291667*Number(req.body.ptsAAgregar));
  // const puntosConfirmados = req.body.confirmaPuntos;
  const nuevaDate = new Date();
  const fechaAccion = fechaAString(nuevaDate);
  const horaAccion = horaAString(nuevaDate);
  const turno = _.toUpper(req.user.username);
  const comprobanteAccion = _.toUpper(req.body.tipoComprobante + " // " + req.body.comprobanteAccion);
  const accionCliente = {
    accion: "+ " + puntosAgregados + " puntos",
    fecha: fechaAccion,
    hora: horaAccion,
    comprobante: comprobanteAccion
  };
  if (req.body.ptsAAgregar !== req.body.confirmaPuntos) {
    res.render("error", {accionRegistro: "Error al ingresar importe", accionConfirmada: "Asegurese de que coincidan los campos 'Importe' y 'Confirma importe' "});
  } else {
    Usuario.findOne({numeroCliente: req.params.clienteAddress, dniCliente: req.body.dniCliente}, function(err, doc) {
        if (err) {
        console.log(err);
        res.send(err);
      } else if (doc) {
        Usuario.updateOne({numeroCliente: doc.numeroCliente}, {$inc: {puntosCliente: puntosAgregados}, $push: {accionesCliente: accionCliente}}, function(err) {
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            const accionAAgregar = new Movimiento({
              accion: "+ " + puntosAgregados + " puntos",
              fecha: fechaAccion,
              hora: horaAccion,
              numeroCliente: doc.numeroCliente,
              nombreCliente: doc.nombreCliente,
              comprobante: comprobanteAccion,
              sesion: turno
            });
            const recipient = doc.email;

            accionAAgregar.save(function(err) {
              if (!err) {
                notificacionPuntos(accionAAgregar, recipient);
                res.render("confirma", {accionConfirmada: accionAAgregar.accion + " a " + accionAAgregar.nombreCliente, horaConfirmada: accionAAgregar.hora});
              } else {
                console.log(err);
                res.send(err);
              }
            });

          }
        });

      } else {
        res.render("error", {accionRegistro: "DNI no coincide con registro de numero de Cliente", accionConfirmada: ""});
      }
    });
  }


};
