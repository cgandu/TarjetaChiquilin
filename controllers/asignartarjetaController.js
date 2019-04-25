//jshint esversion:6

const _ = require("lodash");
const Usuario = require(__dirname+"/../models/Usuario");




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
