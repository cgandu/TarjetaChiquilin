//jshint esversion:6

var createsend = require("createsend-node");


exports.fechaAString = function fechaAString(date) {

  var dd = date.getDate();
  var mm = date.getMonth() + 1;
  var yyyy = date.getFullYear();
  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  return "  " + dd + "/" + mm + "/" + yyyy + " ";};

exports.horaAString = function horaAString(date) {
  var hor = date.getHours();
  var min = date.getMinutes();
  var seg = date.getSeconds();
  if (hor < 10) {
    hor = "0" + hor;
  }
  if (min < 10) {
    min = "0" + min;
  }
  if (seg < 10) {
    seg = "0" + seg;
  }
  return " " + hor + ":" + min + ":" + seg + " ";};

  exports.notificacionPuntos = function notificacionPuntos(infoMov, recipient){

    // con npm install createsend-node

    // API Key de authentication de campaign monitor
    var auth = { apiKey: process.env.CAMPAIGN_MONITOR_APIKEY };
    var api = new createsend(auth);

    // Crea objeto details para pasar variables a API y correo
    var details = {};

    details.smartEmailID = "0ed553e0-a089-4f2d-a6e2-fb4e4db58103";
    details.to = recipient;
    details.data = {
      "nombreCliente": infoMov.nombreCliente,
    	"puntosSumados": infoMov.accion,
    	"x-apple-data-detectors": "x-apple-data-detectorsTestValue",

    };
    // como esta en camapaign monitor:
    // Envia email y tira cb con err o respuesta
    api.transactional.sendSmartEmail(details, function (err, res) {
        if (err) {
          console.log(err);
        } else {
          console.log("Notificacion enviada exitosamente");
        }
    });
  };


exports.activacionEmail = function activacionEmail (linkhash, recipient) {


  // npm install createsend-node

// Authenticate with API Key
var createsend = require('createsend-node');
var auth = { apiKey: process.env.CAMPAIGN_MONITOR_APIKEY };
var api = new createsend(auth);

// Create a details object
var details = {};

// Add the unique identifier for the smart email
details.smartEmailID = 'cedbd3c4-d88b-4658-a7b7-93d3f7256bcb';

// Add the 'To' email address
details.to = recipient;

// Add mail merge variables
details.data = {
    "x-apple-data-detectors": "x-apple-data-detectorsTestValue",
	  "linkActivacion": "www.tarjetachiquilin.com/active/"+linkhash
};

// Send the smart email(and provide a callback function that takes an error and a response parameter)
api.transactional.sendSmartEmail(details, function (err, res) {
    if (err) {
        console.log(err);
    } else {
        console.log("Mail de activacion enviado exitosamente");
    }
});




};


exports.notificacionCanje = function notificacionCanje(infoCanje, usuario){


// npm install createsend-node

// Authenticate with API Key
var createsend = require('createsend-node');
var auth = { apiKey: process.env.CAMPAIGN_MONITOR_APIKEY };
var api = new createsend(auth);

// Create a details object
var details = {};

// Add the unique identifier for the smart email
details.smartEmailID = 'a0dfbc40-f282-4bae-978f-10af023f6cbe';

// Add the 'To' email address
details.to = usuario.email;

// Add mail merge variables
details.data = {
  "nombreCliente": usuario.nombreCliente,
	"x-apple-data-detectors": "x-apple-data-detectorsTestValue",
	"nombreProducto": infoCanje.productoCanjeado,
	"canjeID": infoCanje._id,
	"codValidacion": infoCanje.codValidacion
};

// Send the smart email(and provide a callback function that takes an error and a response parameter)
api.transactional.sendSmartEmail(details, function (err, res) {
  if (err) {
    console.log(err);
  } else {
    console.log("Notificacion enviada exitosamente");
  }
});
};
exports.notificacionReset = function notificacionReset(usuario){
// npm install createsend-node

// Authenticate with API Key
var createsend = require('createsend-node');
var auth = { apiKey: process.env.CAMPAIGN_MONITOR_APIKEY };
var api = new createsend(auth);

// Create a details object
var details = {};

// Add the unique identifier for the smart email
details.smartEmailID = '30a14079-de53-4b3a-b5e1-75b06940bdb0';

// Add the 'To' email address
details.to = usuario.email;

// Add mail merge variables
details.data = {
  "x-apple-data-detectors": "x-apple-data-detectorsTestValue",
	"linkReset": "www.tarjetachiquilin.com/reset/"+ usuario.resetPasswordToken,
	"nombreCliente": usuario.username
};

// Send the smart email(and provide a callback function that takes an error and a response parameter)
api.transactional.sendSmartEmail(details, function (err, res) {
    if (err) {
        console.log(err);
    } else {
        console.log("Notificacion Reset enviada exitosamente");
    }
});

};
