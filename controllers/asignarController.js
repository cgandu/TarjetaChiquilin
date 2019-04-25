//jshint esversion:6

const Usuario = require(__dirname + "/../models/Usuario");


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
