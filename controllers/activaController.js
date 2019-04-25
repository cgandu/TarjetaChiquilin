//jshint esversion:6
const Usuario = require(__dirname + "/../models/Usuario");




exports.activa_controller_get = function(req, res){
  Usuario.findOne({activadoHash: req.params.linkHash}, function(err, doc){
    if (doc) {
      Usuario.updateOne({_id: doc._id}, {$set: {activado: true}, $unset: {activadoHash: 1}}, function(err){
        if (err) {
          console.log(err);
        } else {
          res.render("confirmaregistro", {accionRegistro: "Cuenta acitvada exitosamente"});
        }
      });
    }
    else if (err) {
      console.log(err);
    } else {
      res.send("Documento no existe en registro");
    }
  });
};
