//jshint esversion:6


const crypto = require("crypto");
const Usuario = require(__dirname+"/../models/Usuario");
const Movimiento = require(__dirname+"/../models/Movimiento");
const Producto = require(__dirname+"/../models/Producto");
const Canje = require(__dirname+"/../models/Canje");
const funciones = require(__dirname+"/funciones");
const fechaAString = funciones.fechaAString;
const horaAString = funciones.horaAString;
const notificacionCanje = funciones.notificacionCanje;



exports.canje_confirma_get = function(req, res){

  Producto.findById(req.params.idObjeto, function(err, doc){
    if (err) {
      console.log(err);
      return err;
    } else if (!doc) {
      return "Doc was not found";
    } else {

        const puntosProducto = doc.puntosProducto;
        const puntosCliente = req.user.puntosCliente;

        return res.render("confirmacanje", {doc: doc, cliente: req.user, logmethod: "Logout"});
    }
  });
};


exports.canje_confirma_post = function(req, res){


  const substraction = req.body.puntosCliente - req.body.puntosProducto;
  const nuevaDate = new Date();
  const fechaCanje = fechaAString(nuevaDate);
  const horaCanje = horaAString(nuevaDate);
  const codValidacion = crypto.randomBytes(3).toString('hex');

  const nuevoCanje = new Canje ({
  idProductoCanjeado: req.body.idProducto,
  productoCanjeado: req.body.nombreProducto,
  puntosCanjeados: req.body.puntosProducto,
  fechaCanje: fechaCanje,
  horaCanje: horaCanje,
  validado: false,
  cliente: req.body.numeroCliente,
  codValidacion: codValidacion
  });

  const nuevoMovimiento = new Movimiento ({
    accion: "-" + req.body.puntosProducto + " // " + req.body.nombreProducto,
    fecha: fechaCanje,
    hora: horaCanje,
    numeroCliente: req.body.numeroCliente,
    nombreCliente: req.body.nombreCliente,
    comprobante: "GENERA CANJE",
    sesion: req.user.username
  });

  var realizaCanje = new Promise(function(resolve, reject){
    //chequeo que producto existe
      Producto.findById(req.params.idObjeto, function(err, producto){
        if (err) {
          return reject("Error al buscar producto: " + err);
        } else if (!producto) {
          return reject("Producto no existe");
        } else {
          return resolve(producto.puntosProducto);
        }
      });

    }).then(function(puntosProducto){
      //Chequeo que usuario existe y que tiene puntos suficientes
    return new Promise(function(resolve, reject){
      Usuario.findById(req.user._id, function(err, usuario){
        if (err) {
          return reject("Error al buscar Usuario: " + err);
        } else if (!usuario) {
          return reject("Usuario no existe");
        } else if (usuario.puntosCliente < puntosProducto) {
          return reject("Puntos insuficientes para solicitar canje");
        } else {
          return resolve(puntosProducto);
        }
      });
    });

  }).then(function(puntosProducto){
    //Realizo canje: descuento puntos, genero canje nuevo y guardo movimientos
    Usuario.updateOne({_id: req.user._id}, {$inc: {puntosCliente: -puntosProducto}, $push: {accionesCliente: nuevoMovimiento}}, function(err){
      if (err) {
        return "Update error: " + err;
      } else {
        nuevoMovimiento.save(function(err){
          if (err) {
            return "Error al guardar movimiento: " + err;
          }
        });

        nuevoCanje.save(function(err, canje){
          if (err) {
            return "Error al guardar nuevo canje: " + err;
          }
          notificacionCanje(canje, req.user);
          res.render("canjegenerado", {canje: canje, user: req.user, logmethod: "Logout"});

        });
      }
    });

  }).catch(function(err){
      console.log(err);
      return err;
  });


};
