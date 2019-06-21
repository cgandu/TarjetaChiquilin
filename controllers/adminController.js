//jshint esversion:6

const _ = require("lodash");
const Usuario = require(__dirname+"/../models/Usuario");
const Movimiento = require(__dirname+"/../models/Movimiento");
const Producto = require(__dirname+"/../models/Producto");
const Canje = require(__dirname+"/../models/Canje");
const funciones = require(__dirname+"/funciones");
const fechaAString = funciones.fechaAString;
const horaAString = funciones.horaAString;
const notificacionPuntos = funciones.notificacionPuntos;
const fs = require("fs");
const json2csv = require("json2csv").parse;
const path = require("path");
const fields = ["numeroCliente", "nombreCliente", "fecha", "hora", "accion", "comprobante", "_id"];


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




exports.descargas_controller_get = function(req, res) {
  Movimiento.find({}, function (err, movimientos) {
    if (err) {
      return res.status(500).json({ err });
    }
    else {
      let csv;
      try {
        csv = json2csv(movimientos, { fields });
      } catch (err) {
        return res.status(500).json({ err });
      }
      const filePath = __dirname + "/../public/exports/movimientos.csv";
      fs.writeFile(filePath, csv, function (err) {
        if (err) {
          return res.json(err).status(500);
        }
        else {
          setTimeout(function () {
            fs.unlinkSync(filePath); // delete this file after 30 seconds
          }, 30000);
          //res.json("/exports/csv-TODOS.csv");
          return res.render("descargas", {linkdescarga: "/exports/movimientos.csv"});

        }
      });

    }
  });
};





exports.asignar_controller_get = function(req, res) {
  Usuario.find({asignado: false, activado: true}, {}, {sort: { "createdAt" : -1 }}, function(err, docs) {
    if (err) {
      console.log(err);
    } else {
      res.render("asignar", {docs: docs});

      }
    }
);
};


exports.asignar_controller_post = function(req, res) {

  const id = req.body.idCliente;
  const nombreCliente = req.body.nomCliente;
  const dniCliente = req.body.dniCliente;

  Usuario.findOne({dniCliente: dniCliente}, function(err, doc){
    if (!err) {
      if (doc) {
        res.send("Revise el numero de documento. DNI ingresado ya existe en la base de datos");
      } else {
        Usuario.findById(id, function(err, doc){
          if (!err) {
            res.render("asignartarjeta", {email: doc.email, username: doc.username, dniCliente: dniCliente, nombreCliente: nombreCliente, fechaCreado: doc.fechaCreado, id: id});

          } else {
            console.log(err);
          }
        });
      }
    } else {
      console.log(err);
      res.send("Error con Usuario ingresado");
    }
  });


};

exports.asignartarjeta_controller_post = function(req, res) {

  const id = req.body.idCliente;
  const partialUserString1 = _.replace(req.body.numTarjeta, "[", "");
  const partialUserString2 = _.replace(partialUserString1, "%", "");
  const finalUserString = _.replace(partialUserString2, "_", "");

  if (_.startsWith(req.body.numTarjeta, "%") && _.endsWith(req.body.numTarjeta, "_")){
    Usuario.findOne({numeroCliente: finalUserString}, function(err, doc){
      if (err) {
        console.log(err);
      } else if (doc) {
        console.log("Error: Numero de tarjeta ya existe");
        res.render("error");
      } else {
            Usuario.findOneAndUpdate({_id: id}, {numeroCliente: finalUserString, asignado: true, dniCliente: req.body.dniCliente, nombreCliente: req.body.nomCliente, }, function(err, doc){
              if (err) {
                console.log(err);
              } else {
                res.render("confirma");
              }
            });
      }
    });
  }
};

exports.canjes_habilitados_post = function(req, res){
  const nombreCliente = req.body.nombreCliente;
  const numeroCliente = req.body.numeroCliente;
  Canje.find({cliente: numeroCliente, validado: false}, function(err, docs){
    if (err) {
      return err;
    } else {
      res.render("canjeshabilitados", {nombreCliente: nombreCliente, docs: docs});
    }
  });
};

exports.validar_canjes_post = function(req, res){
  const codValidacion = req.body.codValidacion;
  const idCanje = req.body.idCanje;

  var validacionCanje = new Promise(function(resolve, reject){
    Canje.findOne({_id: idCanje}, function(err, doc){
      if (err) {
        return reject(err);
      } else if (!doc) {
        return reject("No se encontro numero de canje");
      } else if (codValidacion !== doc.codValidacion) {
        return reject("Codigo de validacion no es valido");
      } else if (codValidacion === doc.codValidacion) {
        return resolve(doc._id);
      }
    });
  }).then(function(id){
    return new Promise(function(resolve, reject){
    Canje.findOneAndUpdate({_id: id}, {$set: {validado: true}}, function(err, doc){
      if (err) {
        return reject(err);
      } else if (!doc) {
        return reject("No se encontro numero de canje");
      } else {
        return resolve(codValidacion);
      }
    });
    });
  }).then(function(codValidacion){
    res.render("confirma", {horaConfirmada: "Canje validado exitosamente", accionConfirmada: codValidacion});
  }).catch(function(err){
    console.log(err);
    res.render("error", {accionConfirmada: err});
  });

};
